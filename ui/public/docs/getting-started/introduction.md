# Introduction to Construct

Construct is the beautiful facade for the Base Go framework. While Base provides the powerful backend foundation with modules, authentication, and APIs, Construct adds the modern Vue interface with beautiful components and exceptional developer experience.

## What is Construct?

Construct is a Vue 3 + Vite framework that:

- **Wraps Base APIs** with type-safe TypeScript interfaces
- **Provides modern UI** with Nuxt UI 4 components and Tailwind CSS 4
- **Enables fast development** with auto-routing, hot reload, and auto-imports
- **Maintains consistency** through convention-over-configuration approach

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Construct     │    │      Base       │
│   (Vue UI)      │◄──►│   (Go API)      │
│   Port 3100     │    │   Port 8001     │
└─────────────────┘    └─────────────────┘
```

- **Base**: Handles authentication, database, business logic, and API endpoints
- **Construct**: Provides the user interface, routing, and frontend state management

## Key Features

### 🚀 Fast Development
- File-based auto-routing with vite-plugin-pages
- Hot module replacement for instant updates
- Auto-import for composables, components, and types

### 🎨 Modern UI
- Nuxt UI 4 components with Tailwind CSS 4
- Built-in dark/light mode support
- Responsive design patterns

### 🔒 Type Safety
- TypeScript types automatically generated from Go models
- End-to-end type safety from backend to frontend
- Auto-completion for API responses

### ⚡ Performance
- Vite for lightning-fast builds
- Client-side rendering (Go handles server-side logic)
- Optimized bundle splitting

## Quick Start

```bash
# Install dependencies
bun install

# Start development servers
./run.sh

# API: http://localhost:8001
# UI: http://localhost:3100
```

## Project Structure

```
ui/
├── app/                 # Application code
│   ├── pages/          # Route pages
│   ├── layouts/        # Layout components
│   └── components/     # App-specific components
├── core/               # Framework code
│   ├── components/     # Core components
│   ├── composables/    # Reusable logic
│   ├── middleware/     # Route middleware
│   ├── stores/         # Pinia stores
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── docs/               # Documentation
└── .construct/         # Generated files (like .nuxt)
```