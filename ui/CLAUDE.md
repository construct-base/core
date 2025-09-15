# Construct UI Framework - AI Assistant Guide

## Overview
Construct is a custom Vite/Vue 3 UI framework designed to work with the Base Go framework. It provides Nuxt-like features with TypeScript types that mirror Go models.

## Project Structure
```
ui/
├── app/           # Application-specific code
├── core/          # Framework core (reusable)
├── assets/        # Static assets
├── .construct/    # Auto-generated files
└── docs/          # Documentation
```

## Key Technologies
- **Vue 3** with Composition API
- **Vite** for build tooling
- **TypeScript** with strict types matching Go models
- **Pinia** for state management
- **Nuxt UI 4** component library
- **Tailwind CSS 4** for styling
- **Vue Router** for routing

## Core Features

### 1. File-Based Routing
- Pages in `app/pages/` and `core/pages/` are auto-routed
- Dynamic routes: `[param].vue`
- Nested routes via directory structure
- Routes auto-generated in `.construct/pages.ts`

### 2. Auto-Imports
- Components from `app/components/` and `core/components/`
- Composables from `app/composables/` and `core/composables/`
- Vue, Vue Router, Pinia APIs
- TypeScript definitions auto-generated

### 3. Middleware System
- Convention-based via layouts:
  - `layout({ use: "auth" })` → `middleware: ["guest"]`
  - `layout({ use: "admin" })` → `middleware: ["auth", "admin"]`
- Middleware in `core/middleware/`
- Nuxt-style context with redirect, abort, navigate

### 4. Layout System
- Layouts in `app/layouts/`:
  - `default.vue` - Public pages
  - `auth.vue` - Authentication pages
  - `admin.vue` - Admin dashboard
- Dynamic layout loading based on page meta

### 5. API Integration
- API client in `core/api/client.ts`
- TypeScript types mirror Go models
- Automatic token management
- Error handling with typed responses

### 6. State Management
- Pinia stores in `app/stores/` and `core/stores/`
- Auth composable: `useAuth()` for authentication
- Global state persisted to localStorage

## Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev        # Runs on http://localhost:3100

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

## Important Files

### Configuration
- `config.ts` - Main framework configuration
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration

### Core Components
- `core/App.vue` - Root application component
- `core/main.ts` - Application entry point
- `core/api/client.ts` - API client implementation
- `core/middleware/index.ts` - Middleware runner

### Auto-Generated
- `.construct/pages.ts` - Generated routes
- `.construct/types/` - Generated TypeScript types

## Common Tasks

### Adding a New Page
1. Create `.vue` file in `app/pages/`
2. Add `layout()` function for middleware
3. Routes auto-generated on save

### Adding Middleware
1. Create middleware in `core/middleware/`
2. Export function with `MiddlewareContext` parameter
3. Use in pages via `layout()` convention

### Adding API Endpoint
1. Define types in `core/types/`
2. Add method to `core/api/client.ts`
3. Use via `apiClient` or create composable

### Creating Components
1. Add to `app/components/` or `core/components/`
2. Auto-imported, no registration needed
3. Use PascalCase naming

## Architecture Decisions

### Why Separate app/ and core/?
- `core/` - Framework code, reusable across projects
- `app/` - Project-specific implementation
- Allows framework updates without affecting app code

### Why Custom Router Plugin?
- Clean URLs without file system exposure
- Convention-based middleware assignment
- Better TypeScript integration
- Simpler than Nuxt's full system

### Why Pinia over Vuex?
- Better TypeScript support
- Simpler API
- Built for Composition API
- Official Vue recommendation

## Recent Changes & Issues

### Middleware System Refactoring (Current)
- Converting to Nuxt-style middleware context
- Adding global middleware support
- Implementing better error handling

### Known Issues
1. Duplicate imports warnings in console (cosmetic)
2. No SSR support (SPA-only)
3. No error boundary pages

### Fixed Issues
- ✅ Redirect loop in auth middleware
- ✅ Guest middleware redirecting to non-existent routes
- ✅ Public pages incorrectly requiring auth

## Best Practices

### Component Development
- Use `<script setup>` syntax
- Prefer composables over props drilling
- Use TypeScript for all components
- Follow Vue 3 composition API patterns

### State Management
- Use composables for feature state
- Pinia stores for global state
- Avoid mixing patterns (stores + composables)

### API Calls
- Always use TypeScript types
- Handle errors with try-catch
- Show loading states
- Use composables for complex flows

### Routing
- Use `layout()` for middleware assignment
- Keep pages flat when possible
- Use dynamic routes for parameters
- Lazy load heavy pages

## Testing
```bash
# Unit tests (when implemented)
npm run test

# E2E tests (when implemented)
npm run test:e2e
```

## Deployment
```bash
# Build for production
npm run build

# Files generated in dist/
# Serve with any static file server
```

## Environment Variables
```env
VITE_API_URL=http://localhost:8080
VITE_UI_PORT=3100
VITE_ENV=development
```

## Troubleshooting

### Port Already in Use
The dev server tries port 3100 first, then finds next available.

### API Connection Issues
1. Check API server is running
2. Verify VITE_API_URL in environment
3. Check CORS configuration

### Build Errors
1. Clear node_modules and reinstall
2. Check TypeScript errors: `npm run typecheck`
3. Clear `.construct/` directory

### Middleware Not Running
1. Check route has correct `layout()` call
2. Verify middleware name matches file
3. Check browser console for errors

## Future Improvements
- [ ] SSR support
- [ ] Error boundary pages
- [ ] Better HMR for layouts
- [ ] PWA support
- [ ] i18n integration
- [ ] Testing setup
- [ ] Storybook for components
- [ ] Performance monitoring

## Contact & Support
This is part of the Base/Construct framework ecosystem.
Designed to work seamlessly with Go backend using Base framework.