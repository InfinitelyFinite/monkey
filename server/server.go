package server

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"monkey/evaluator"
	"monkey/lexer"
	"monkey/object"
	"monkey/parser"
)

type runRequest struct {
	Code string `json:"code"`
}

type runResponse struct {
	Output *string `json:"output"`
	Error  *string `json:"error"`
}

// stdout is global process state, so evaluations must be serialized.
var stdoutMu sync.Mutex

func StartServer() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if _, err := strconv.Atoi(port); err != nil {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/run", runHandler)

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           withCORS(mux),
		ReadHeaderTimeout: 5 * time.Second,
	}

	_ = srv.ListenAndServe()
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		next.ServeHTTP(w, r)
	})
}

func runHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Always 200 OK for application-level errors.
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		errMsg := "method not allowed"
		_ = json.NewEncoder(w).Encode(runResponse{Output: nil, Error: &errMsg})
		return
	}

	var req runRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		errMsg := "invalid JSON: " + err.Error()
		_ = json.NewEncoder(w).Encode(runResponse{Output: nil, Error: &errMsg})
		return
	}

	output, errStr := runCodeWithTimeout(req.Code, 10*time.Second)
	_ = json.NewEncoder(w).Encode(runResponse{Output: output, Error: errStr})
}

func runCodeWithTimeout(code string, timeout time.Duration) (*string, *string) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// Parsing does not touch stdout; do it outside capture.
	l := lexer.New(code)
	p := parser.New(l)
	program := p.ParseProgram()
	if errs := p.Errors(); len(errs) > 0 {
		msg := strings.Join(errs, "\n")
		return nil, &msg
	}

	stdoutMu.Lock()

	origStdout := os.Stdout
	r, w, err := os.Pipe()
	if err != nil {
		stdoutMu.Unlock()
		msg := "stdout capture failed: " + err.Error()
		return nil, &msg
	}

	os.Stdout = w

	stdoutDone := make(chan string, 1)
	go func() {
		defer func() { _ = r.Close() }()
		b, _ := io.ReadAll(r)
		stdoutDone <- string(b)
	}()

	evalDone := make(chan struct {
		result object.Object
		err    *string
	}, 1)

	go func() {
		defer func() {
			if rec := recover(); rec != nil {
				msg := "panic: " + anyToString(rec)
				evalDone <- struct {
					result object.Object
					err    *string
				}{result: nil, err: &msg}
			}
		}()

		env := object.NewEnvironment()
		res := evaluator.Eval(program, env)
		if resErr, ok := res.(*object.Error); ok {
			msg := resErr.Message
			evalDone <- struct {
				result object.Object
				err    *string
			}{result: nil, err: &msg}
			return
		}

		evalDone <- struct {
			result object.Object
			err    *string
		}{result: res, err: nil}
	}()

	select {
	case ev := <-evalDone:
		_ = w.Close()
		os.Stdout = origStdout
		captured := <-stdoutDone
		stdoutMu.Unlock()

		if ev.err != nil {
			return nil, ev.err
		}
		return buildOutput(captured, ev.result), nil
	case <-ctx.Done():
		timeoutMsg := "execution timed out"

		// Stop capturing now; keep stdoutMu locked until evaluation ends.
		os.Stdout = origStdout
		_ = w.Close()
		_ = <-stdoutDone

		go func() {
			<-evalDone
			stdoutMu.Unlock()
		}()
		return nil, &timeoutMsg
	}
}

func buildOutput(captured string, final object.Object) *string {
	out := captured
	if final != nil {
		if _, isNull := final.(*object.Null); !isNull {
			inspected := final.Inspect()
			if out == "" {
				out = inspected
			} else if strings.HasSuffix(out, "\n") {
				out = out + inspected
			} else {
				out = out + "\n" + inspected
			}
		}
	}

	return &out
}

func anyToString(v any) string {
	switch t := v.(type) {
	case string:
		return t
	case error:
		return t.Error()
	default:
		return "unknown"
	}
}
