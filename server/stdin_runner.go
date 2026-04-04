package server

import (
	"encoding/json"
	"io"
	"os"
	"time"
)

// RunFromStdin reads all Monkey source code from stdin, evaluates it, and writes
// a single JSON object to stdout:
//
//	{"output": "...", "error": "..."}
//
// It always returns normally (exit code 0); failures are reported in JSON.
func RunFromStdin() {
	srcBytes, err := io.ReadAll(os.Stdin)
	if err != nil {
		errMsg := "failed to read stdin: " + err.Error()
		_ = json.NewEncoder(os.Stdout).Encode(runResponse{Output: nil, Error: &errMsg})
		return
	}

	output, errStr := runCodeWithTimeout(string(srcBytes), 10*time.Second)
	_ = json.NewEncoder(os.Stdout).Encode(runResponse{Output: output, Error: errStr})
}
