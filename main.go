package main

import (
	"flag"
	"fmt"
	"monkey/repl"
	"monkey/server"
	"os"
	"os/user"
)

func main() {
	serverMode := flag.Bool("server", false, "start HTTP server mode")
	stdinMode := flag.Bool("stdin", false, "run one program from stdin and return JSON")
	flag.Parse()

	if *serverMode {
		server.StartServer()
		return
	}
	if *stdinMode {
		server.RunFromStdin()
		return
	}

	user, err := user.Current()
	if err != nil {
		panic(err)
	}

	fmt.Printf("Hello %s! This is the Monkey programming language!\n", user.Username)
	fmt.Printf("Feel free to type in commands\n")
	repl.Start(os.Stdin, os.Stdout)
}
