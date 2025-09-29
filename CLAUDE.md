# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Construct" - a full-stack web framework combining:
- **Go Backend**: Base framework with modular HMVC architecture
- **Vue 3 Frontend**: Custom UI framework with Nuxt-like features
- **Development Tools**: Scripts for rapid development and module generation

## Development Commands

### Starting the Application
```bash
# Start both Go API (port 8100) and Vue UI (port 3100)
./run.sh

# Start Go API only
go run main.go

# Start Vue UI only (from ui/ directory)
cd ui && npm run dev
```

### Building & Testing
```bash
# Build Go application
go build -o construct main.go

# Build UI (from ui/ directory)
cd ui && npm run build

# Type checking UI
cd ui && npm run typecheck
```

## Architecture Overview

### Backend (Go)
- **Modular HMVC**: Each module in `api/` contains controller, service, module registration
- **Core Framework**: Located in `core/` with infrastructure components:
  - `core/database/` - GORM database integration
  - `core/router/` - HTTP routing and middleware
  - `core/storage/` - File storage with active storage pattern
  - `core/email/` - Multi-provider email support
  - `core/logger/` - Structured logging with Zap
  - `core/emitter/` - Event system for module communication
  - `core/websocket/` - WebSocket hub for real-time features
- **Models**: Centralized in `app/models/` to prevent circular dependencies
- **Auto-Discovery**: Modules automatically registered via `api/init.go`

### Frontend (Vue 3)
- **Dual Structure**: `app/` for project code, `core/` for reusable framework
- **File-Based Routing**: Pages auto-routed from `app/pages/` and `core/pages/`
- **Auto-Imports**: Components and composables automatically imported
- **Middleware System**: Convention-based via layout functions
- **TypeScript**: Strict typing with Go model mirroring

### Key Integration Points
- **JWT Authentication**: Extended via `Extend()` function in `api/init.go`
- **Role-Based Access**: User roles embedded in JWT tokens
- **File Storage**: API serves files from `/storage` endpoint
- **WebSocket**: Real-time communication at `/api/ws`

## Module Generation

The Base framework includes powerful code generation (referenced in `generate.sh`):

```bash
# Generate a complete CRUD module
base g post title:string content:text published:bool

# Generate with relationships and file attachments
base g post \
  title:string \
  content:text \
  featured_image:image \
  author:belongsTo:User \
  comments:hasMany:Comment

# Automatic relationship detection
base g article \
  title:string \
  category_id:uint  # Auto-creates Category relationship
  author_id:uint    # Auto-creates Author relationship
```

Generated modules include:
- Model in `app/models/`
- Controller, Service, Module registration in `app/{module}/`
- Auto-registration in module system
- RESTful API endpoints
- File upload handling for attachments

## Key Files & Patterns

### Backend Entry Point
- `main.go:77-88` - Application initialization chain using method chaining pattern
- `main.go:250-282` - Module auto-discovery and registration
- `api/init.go` - App module provider and JWT extension point

### Frontend Entry Point
- `ui/core/main.ts` - Vue application bootstrap
- `ui/config.ts` - Framework configuration
- `ui/core/api/client.ts` - API client with authentication

### Database & Models
- Models use `types.Model` base struct with soft deletes
- GORM with auto-migration
- Relationship detection for `*_id` fields
- Event emission on CRUD operations

### Authentication Flow
1. Login/register via profile module
2. JWT token includes user context from `Extend()` function
3. Frontend stores token and user data
4. Middleware validates tokens on protected routes

## Development Workflow

1. **Module Development**: Use code generation for CRUD modules
2. **API Testing**: Server runs on `:8100` with Swagger docs at `/docs`
3. **UI Development**: Vite dev server on `:3100` with hot reload
4. **Full Stack**: Use `./run.sh` to run both servers simultaneously

## Configuration

- **Backend**: Environment variables via `.env` file
- **Frontend**: Vite environment variables (`VITE_*`)
- **Database**: SQLite by default, configurable for PostgreSQL/MySQL
- **Storage**: Local filesystem, extensible to S3/R2

## Testing & Quality

- UI includes TypeScript strict mode
- No specific test framework configured yet
- Structured logging throughout backend
- Error handling with typed responses
- dont mess with servers, I manage them, just ask
- always use bun not npm