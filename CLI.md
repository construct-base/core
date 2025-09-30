# Construct CLI Documentation

## Overview

The Construct CLI is built with [Cobra](https://github.com/spf13/cobra) for a professional, extensible command-line interface.

## Installation

### Global Installation
```bash
make install
# Installs to /usr/local/bin/construct
```

### Manual Installation
```bash
go build -o construct-cli ./cmd/construct/
sudo mv construct-cli /usr/local/bin/construct
```

### Verify Installation
```bash
construct --version
# Output: construct version 1.0.0
```

## Commands

### `construct dev`

Start development servers with hot reload.

```bash
construct dev
```

**What it does:**
1. Starts Go API server on port 8100
2. Starts Vue dev server on port 3100
3. Proxies `/api` requests from Vue to Go
4. Watches for file changes (hot reload)
5. Gracefully shuts down both on Ctrl+C

**Output:**
```
   ____                _                   _
  / ___|___  _ __  ___| |_ _ __ _   _  ___| |_
 | |   / _ \| '_ \/ __| __| '__| | | |/ __| __|
 | |__| (_) | | | \__ \ |_| |  | |_| | (__| |_
  \____\___/|_| |_|___/\__|_|   \__,_|\___|\__|

  Full-stack Vue + Go Framework v1.0.0

🚀 Starting development servers...

✅ Go API starting on http://localhost:8100
✅ Vue dev server starting on http://localhost:3100

📝 Press Ctrl+C to stop both servers

🔷 [Go]   Server logs...
🟢 [Vue]  Dev server logs...
```

**Features:**
- Auto-detects package manager (bun/pnpm/yarn/npm)
- Color-coded output with prefixes
- Graceful shutdown on Ctrl+C

---

### `construct build`

Build production-ready application.

```bash
construct build
```

**What it does:**
1. Builds Vue SPA → `public/` directory
   - Optimized bundles
   - Code splitting
   - Minification
2. Compiles Go binary → `construct` (or `construct.exe` on Windows)

**Output:**
```
🔨 Building Construct for production...

📦 Building Vue SPA → public/
✓ 2701 modules transformed.
✓ built in 7.72s

✅ Vue SPA built successfully

🔷 Building Go binary → construct
✅ Go binary built successfully

🎉 Build complete!

To start production server:
  ./construct

Or use:
  construct start
```

**Result:**
- `public/` directory with optimized Vue app
- `construct` binary that serves everything
- Ready for deployment

---

### `construct start`

Start production server.

```bash
construct start
```

**What it does:**
1. Checks if `construct` binary exists
2. Runs the production server
3. Serves Vue SPA + API on port 8100

**Output:**
```
🚀 Starting production server...

Server starting on :8100
...
```

**Requirements:**
- Must run `construct build` first
- Binary must exist in project root

**Alternative:**
```bash
# You can also run the binary directly
./construct
```

---

### `construct --help`

Show help information.

```bash
construct --help
# OR
construct -h
```

**Output:**
```
Construct CLI - A modern full-stack framework combining Vue 3 and Base Go.

Build powerful web applications with the best of both worlds:
  • Vue 3 for reactive, component-based UI
  • Base Go for fast, type-safe backend

One framework. One command. One binary.

Usage:
  construct [command]

Available Commands:
  build       Build production app
  completion  Generate the autocompletion script for the specified shell
  dev         Start development servers
  help        Help about any command
  start       Start production server

Flags:
  -h, --help      help for construct
  -v, --version   version for construct

Use "construct [command] --help" for more information about a command.
```

---

### `construct --version`

Show version information.

```bash
construct --version
# OR
construct -v
```

**Output:**
```
construct version 1.0.0
```

---

## Architecture

### CLI Structure

```
cmd/construct/
├── main.go      # Root command, version, banner
├── dev.go       # Development command
├── build.go     # Build command
├── start.go     # Start command
└── utils.go     # Helper functions
```

### Key Components

**Root Command (`main.go`):**
- Initializes Cobra app
- Registers subcommands
- Handles version flag
- Displays banner

**Helper Functions (`utils.go`):**
- `findProjectRoot()` - Finds project root by looking for `main.go`
- `detectPackageManager()` - Auto-detects bun/pnpm/yarn/npm
- `PrefixWriter` - Adds colored prefixes to output

**Command Files:**
- Each command in separate file for maintainability
- Clear separation of concerns
- Easy to add new commands

---

## Extending the CLI

### Adding a New Command

1. Create new file: `cmd/construct/generate.go`

```go
package main

import (
	"fmt"
	"github.com/spf13/cobra"
)

var generateCmd = &cobra.Command{
	Use:   "generate [resource]",
	Short: "Generate CRUD module",
	Long:  "Generate a complete CRUD module with model, controller, and views",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		resource := args[0]
		fmt.Printf("Generating %s...\n", resource)
		// Implementation here
	},
}

func init() {
	generateCmd.Flags().StringP("fields", "f", "", "Fields for the model")
}
```

2. Register in `main.go`:

```go
func init() {
	rootCmd.AddCommand(devCmd)
	rootCmd.AddCommand(buildCmd)
	rootCmd.AddCommand(startCmd)
	rootCmd.AddCommand(generateCmd)  // Add this
}
```

3. Use it:

```bash
construct generate user --fields="name:string,email:string"
```

---

## Future Commands

The CLI is designed to be extensible. Planned commands:

```bash
# Code generation
construct generate model Post      # Generate model
construct generate crud User       # Generate full CRUD
construct generate api Comments    # Generate API only

# Database
construct migrate                  # Run migrations
construct migrate:rollback         # Rollback last migration
construct db:seed                  # Seed database

# Deployment
construct deploy                   # Deploy to production
construct deploy:docker            # Build Docker image

# Utilities
construct clean                    # Clean build artifacts
construct test                     # Run tests
construct lint                     # Run linters
```

---

## Tips & Tricks

### 1. Shell Completion

Cobra provides auto-completion:

```bash
# Generate completion script
construct completion bash > /etc/bash_completion.d/construct

# For zsh
construct completion zsh > "${fpath[1]}/_construct"

# For fish
construct completion fish > ~/.config/fish/completions/construct.fish
```

### 2. Aliases

Add to your shell rc file:

```bash
alias c='construct'
alias cdev='construct dev'
alias cbuild='construct build'
alias cstart='construct start'
```

### 3. Environment Variables

Set defaults in `.env`:

```bash
PORT=8100
VITE_PORT=3100
LOG_LEVEL=debug
```

### 4. Watch Mode

For more granular control:

```bash
# Watch Go only
air  # requires air package

# Watch Vue only
cd vue && bun run dev
```

---

## Troubleshooting

### CLI not found after install

```bash
# Check PATH
echo $PATH

# Manually add if needed
export PATH=$PATH:/usr/local/bin

# Or reinstall
make install
```

### Permission denied

```bash
# Make binary executable
chmod +x /usr/local/bin/construct

# Or use sudo for install
sudo make install
```

### Port already in use

```bash
# Kill process on port 8100
lsof -ti:8100 | xargs kill -9

# Or use different port
PORT=8200 construct dev
```

### Build fails

```bash
# Clean and rebuild
make clean
construct build

# Check Go modules
go mod tidy

# Check Vue dependencies
cd vue && bun install
```

---

## Summary

The Construct CLI provides a **unified interface** for all framework operations:

- ✅ **Simple** - Three main commands: `dev`, `build`, `start`
- ✅ **Powerful** - Built with Cobra for extensibility
- ✅ **Smart** - Auto-detects package managers
- ✅ **Beautiful** - Colored output with ASCII banner
- ✅ **Extensible** - Easy to add new commands

**One CLI. One framework. One command.**