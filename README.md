# Construct Framework

> A modern full-stack framework combining **Vue 3** (frontend) + **Base Go** (backend) as one cohesive system.

## Quick Start

```bash
# Install CLI globally
make install

# Development (starts both Go + Vue)
construct dev

# Production build
construct build

# Run production server
construct start
```

## What is Construct?

Construct unifies two powerful technologies:
- **Vue 3** - Reactive UI, components, modern developer experience
- **Base Go** - Fast API, type-safe, concurrent backend

**One framework. One binary. One command.**

## CLI Commands

```bash
construct dev      # Start development servers (Go:8100 + Vue:3100)
construct build    # Build production (Vue + Go → dist/)
construct start    # Run production server from dist/
construct --help   # Show help
construct --version # Show version
```

## Architecture

### Request Flow
```
Browser → Go Server (:8100)
          ├─ /api/*     → API endpoints (Go modules)
          ├─ /storage/* → File storage (Go handler)
          └─ /*         → Vue SPA (dist/public/)
                         └─ Falls back to index.html (SPA routing)
```

### Directory Structure
```
construct/
├── cmd/construct/      # CLI tool (Cobra-based)
│   ├── main.go        # Root command
│   ├── dev.go         # construct dev
│   ├── build.go       # construct build
│   ├── start.go       # construct start
│   └── utils.go       # Helpers
├── api/               # Go API modules (HMVC)
├── core/              # Go framework core
├── app/models/        # Go models
├── dist/              # Production build output (Git ignored)
│   ├── construct      # Compiled Go binary
│   ├── public/        # Built Vue SPA
│   ├── storage/       # Runtime storage
│   └── logs/          # Runtime logs
├── vue/               # Vue source code
│   ├── src/
│   │   ├── pages/     # Auto-routed pages
│   │   ├── layouts/   # Layout + middleware
│   │   ├── components/
│   │   ├── stores/    # Pinia
│   │   └── api/       # API client
│   └── construct.config.ts
├── Makefile           # Build shortcuts
└── main.go            # Go entry point
```

## Features

### ✅ CLI with Cobra
- Professional CLI framework
- Extensible subcommands
- Auto-detection of package managers (bun/pnpm/yarn/npm)
- Colored output with prefixes

### ✅ Development Experience
- One command starts both servers
- Hot reload for Go and Vue
- Graceful shutdown (Ctrl+C)
- Auto-proxy from Vue to Go API

### ✅ Production Ready
- Single binary deployment
- Vue SPA served by Go
- Code splitting and optimization
- Gzip-friendly output

### ✅ Framework Features
- Layout-based middleware (auth)
- File-based routing
- Type-safe API client
- Persistent authentication
- WebSocket support

## Development Workflow

### Starting Development
```bash
construct dev

# Output:
# 🔷 [Go]   Server starting on :8100
# 🟢 [Vue]  Dev server running on :3100
```

### Building for Production
```bash
construct build

# Steps:
# 1. Create dist/ directory structure
# 2. Build Vue SPA → dist/public/
# 3. Compile Go binary → dist/construct
# 4. Copy runtime files (.env.example, create storage/logs dirs)

# Output: dist/ directory ready for deployment
```

### Running Production
```bash
# Option 1: Using CLI (recommended)
construct start

# Option 2: Direct execution
cd dist && ./construct

# Option 3: With environment variables
cd dist && SERVER_PORT=:8080 ./construct
```

## Installation

### Install CLI Globally
```bash
make install
# Installs to /usr/local/bin/construct
```

### Manual Build
```bash
go build -o construct-cli ./cmd/construct/
sudo mv construct-cli /usr/local/bin/construct
```

### Docker
```bash
# Build image (multi-stage build with dist/)
docker build -t construct:latest .

# Run container
docker run -p 8100:8100 \
  -v $(pwd)/.env:/app/.env \
  -e JWT_SECRET=secret \
  construct:latest

# The Docker image:
# - Builds Vue to dist/public/
# - Compiles Go to dist/construct
# - Creates minimal runtime image (~50MB)
```

### CapRover (One-Click Deploy)
```bash
caprover deploy
# Automatic deployment with captain-definition
# See DOCKER.md for full guide
```

## Environment Variables

```bash
# .env file
PORT=8100
DB_DRIVER=sqlite
DB_NAME=construct.db
JWT_SECRET=your-secret-key

# CORS (dev only)
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=http://localhost:3100
```

## Documentation

📚 **Start Here:**
- [🚀 Quick Start](QUICKSTART.md) - Get started in 5 minutes
- [📋 Summary](SUMMARY.md) - Complete framework overview

🛠 **Development:**
- [💻 CLI Documentation](CLI.md) - Complete command reference
- [🏗 Framework Architecture](vue/FRAMEWORK.md) - Deep dive
- [⚙️ Complete Setup](vue/COMPLETE.md) - Detailed guide
- [🎨 Vue README](vue/README.md) - Frontend docs

🚀 **Deployment:**
- [🐳 Docker Guide](DOCKER.md) - Docker & CapRover
- [📦 Deployment Options](DEPLOYMENT.md) - All deployment methods

## Future Commands

The CLI is extensible with Cobra:

```go
// Coming soon:
construct generate user      # Generate CRUD module
construct migrate            # Run migrations
construct db:seed            # Seed database
```

## Examples

| Request | Handler | Result |
|---------|---------|--------|
| `GET /` | SPA | Vue Dashboard |
| `GET /users` | SPA | Vue Users page (client routing) |
| `GET /assets/index.js` | Static | JavaScript file |
| `GET /api/users` | API | JSON from Go |
| `GET /storage/avatar.jpg` | Storage | File from Go |

## Contributing

Contributions welcome! This is a framework for building full-stack applications.

## License

MIT

---

**Built with ❤️ using Vue 3 + Base Go**
## Structures - Full-Stack HMVC

Construct uses **Structures** - complete feature modules that span both backend and frontend.

A Structure includes:
- **Backend**: Model, Service, Controller, Validator
- **Frontend**: Types, Composable, Components, Page

Generate a complete structure:
```bash
construct g Post title:string content:text published:bool
```

This creates:
- `api/posts/` - Complete Go HMVC module
- `vue/structures/posts/` - Complete Vue HMVC module
- Automatic type synchronization
- Ready-to-use CRUD operations

See [STRUCTURE.md](STRUCTURE.md) for complete architecture details.
