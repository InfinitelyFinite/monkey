# Monkey Programming Language

A Go implementation of the Monkey programming language interpreter.

## Overview

Monkey is a simple, dynamically-typed programming language with C-like syntax. This project implements a lexer, parser, and REPL (Read-Eval-Print Loop) for the Monkey language.

## Features

### Current Implementation
- **Lexical Analysis**: Complete tokenization of Monkey source code
- **REPL**: Interactive command-line interface for testing
- **Token Support**: Comprehensive token recognition including:
    - Identifiers and literals
    - Arithmetic operators (`+`, `-`, `*`, `/`)
    - Comparison operators (`<`, `>`, `==`, `!=`)
    - Assignment operator (`=`)
    - Logical operators (`!`)
    - Delimiters (`,`, `;`, `(`, `)`, `{`, `}`)
    - Keywords (`let`, `fn`, `if`, `else`, `return`, `true`, `false`)

### Language Features (Planned/In Development)
- Variable bindings with `let` statements
- Functions with `fn` keyword
- Conditional expressions with `if/else`
- Integer and boolean data types
- Arithmetic and boolean expressions

## Project Structure

```
monkey/
├── ast/           # Abstract Syntax Tree definitions
├── lexer/         # Lexical analyzer implementation
├── parser/        # Parser implementation (in development)
├── repl/          # Read-Eval-Print Loop
├── token/         # Token definitions and utilities
└── main.go        # Entry point
```

## Getting Started

### Prerequisites
- Go 1.24.0 or later

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd monkey
```

2. Build the project:
```bash
go build
```

3. Run the REPL:
```bash
go run main.go
```

### Usage

Start the interactive REPL:
```bash
$ go run main.go
Hello <username>! This is the Monkey programming language!
Feel free to type in commands
>> 
```

Try entering some expressions:
```
>> let x = 5;
>> let y = 10;
>> fn(x, y) { x + y; }
>> if (5 < 10) { return true; } else { return false; }
```

The REPL will tokenize your input and display the generated tokens.

## Example Monkey Code

```javascript
// Variable bindings
let age = 1;
let name = "Monkey";
let result = 10 * (20 / 2);

// Functions
let add = fn(a, b) { return a + b; };
let subtract = fn(a, b) { return a - b; };

// Conditionals
let max = fn(a, b) {
    if (a > b) {
        return a;
    } else {
        return b;
    }
};

// Function calls
let result = add(5, 3);
let maximum = max(10, 15);
```

## Testing

Run the test suite:
```bash
go test ./...
```

Run tests for a specific package:
```bash
go test ./lexer
go test ./parser
```

## Development Status


### 🚧⏳Under Construction


## Token Types

The lexer recognizes the following token types:

| Category | Tokens |
|----------|---------|
| **Literals** | `IDENT`, `INT` |
| **Operators** | `+`, `-`, `*`, `/`, `=`, `!`, `<`, `>`, `==`, `!=` |
| **Delimiters** | `(`, `)`, `{`, `}`, `,`, `;` |
| **Keywords** | `let`, `fn`, `if`, `else`, `return`, `true`, `false` |
| **Special** | `EOF`, `ILLEGAL` |


**Note**: This is a learning project implementing an interpreter. The Monkey language is designed for educational purposes to understand interpreter design and implementation.