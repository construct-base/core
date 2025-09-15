# Auto-Imports System

Construct provides a centralized auto-imports system that eliminates the need to manually import commonly used functions, components, and types.

## How It Works

The auto-imports system is configured in `vite.config.ts` and uses centralized index files to avoid duplicate imports. This provides clean, organized imports with excellent TypeScript support.

### Centralized Import Sources

All core imports come from centralized index files:

```typescript
// From @core/types
User, LoginRequest, LoginResponse, ApiResponse, Role, Permission
isSuccessResponse, isErrorResponse, PaginatedResponse, Pagination

// From @core/stores
useAuthStore, useUsersStore

// From @core/composables
useAuth, useApi, useConstruct, useNotification, useForm, useDocs, useNavigation

// From @core/utils
layout, navigateTo, navigateReplace, navigateBack
```

## Available Auto-Imports

### Vue & Router
Automatically imported from Vue and Vue Router:

```typescript
// Vue Composition API
ref, reactive, computed, watch, onMounted, onUnmounted
// Vue Router
useRoute, useRouter
// Pinia
defineStore, storeToRefs
```

### Framework Types
Common types are auto-imported:

```typescript
// User and auth types
User, LoginRequest, LoginResponse, ApiResponse

// Data types
PaginatedResponse, Pagination, Role, Permission

// Type guards
isSuccessResponse, isErrorResponse
```

### Stores
All stores are available without imports:

```typescript
// In any component
const auth = useAuthStore()
const users = useUsersStore()
```

### Composables
Core composables are auto-imported:

```typescript
// Authentication
const { user, login, logout } = useAuth()

// API calls
const { get, post, put, delete: del } = useApi()

// Navigation
const { navigateTo, navigateReplace } = useNavigation()

// Notifications
const { showNotification } = useNotification()

// Forms
const { validate, errors } = useForm()

// Documentation
const { loadDoc, sections } = useDocs()
```

### Utilities
Common utilities are available:

```typescript
// Page configuration
layout({"use": "default", "middleware": ["auth"]})

// Navigation helpers
navigateTo('/dashboard')
navigateReplace('/login')
navigateBack()
```

## Configuration

The auto-imports are configured in `vite.config.ts`:

```typescript
ui({
  autoImport: {
    imports: [
      'vue',
      'vue-router',
      'pinia',
      {
        // Centralized imports to avoid duplicates
        '@core/utils/page-meta': ['layout'],
        '@core/utils/navigation': ['navigateTo', 'navigateReplace', 'navigateBack'],
        '@core/types': [
          'User', 'LoginRequest', 'LoginResponse', 'ApiResponse',
          'PaginatedResponse', 'Pagination', 'Role', 'Permission',
          'isSuccessResponse', 'isErrorResponse'
        ],
        '@core/stores': ['useAuthStore', 'useUsersStore'],
        '@core/composables': ['useAuth', 'useApi', 'useConstruct', 'useNotification', 'useForm', 'useDocs', 'useNavigation']
      }
    ],
    dirs: [
      // Only scan app directories for project-specific auto-imports
      'app/composables',
      'app/utils'
    ]
  }
})
```

## Benefits

### No Import Statements
Write components without manual imports:

```vue
<script setup lang="ts">
// No imports needed!
layout({"use": "default", "middleware": ["auth"]})

const auth = useAuthStore()
const { navigateTo } = useNavigation()
const users = ref<User[]>([])

const handleLogin = async (credentials: LoginRequest) => {
  const result = await auth.login(credentials)
  if (result) {
    navigateTo('/dashboard')
  }
}
</script>
```

### TypeScript Support
Full TypeScript completion and type checking:

- IntelliSense for all auto-imported functions
- Type checking for function parameters
- Automatic type definitions generation

### Centralized Management
- Single source of truth for imports
- No duplicate import warnings
- Easy to add new auto-imports
- Consistent across the entire project

## Adding New Auto-Imports

### For Core Features
Add to the centralized configuration in `vite.config.ts`:

```typescript
'@core/composables': [
  'useAuth', 'useApi', 'useConstruct',
  'useNotification', 'useForm', 'useDocs',
  'useNavigation', 'useNewFeature' // ← Add here
]
```

### For App-Specific Features
Create composables in `app/composables/` - they'll be auto-imported:

```typescript
// app/composables/useProducts.ts
export function useProducts() {
  // Implementation
}

// Auto-imported in any component
const { products, loadProducts } = useProducts()
```

## Type Definitions

Auto-import type definitions are generated in:
```
.construct/types/auto-imports.d.ts
.construct/types/components.d.ts
```

These files are automatically generated and should not be edited manually.

## Best Practices

### Do Auto-Import
- Core framework functions (`useAuth`, `useApi`)
- Common Vue functions (`ref`, `computed`, `watch`)
- Frequently used types (`User`, `ApiResponse`)
- Navigation utilities (`navigateTo`)

### Don't Auto-Import
- Third-party libraries (keep explicit imports)
- Rarely used functions
- App-specific business logic
- Large objects or classes

### Organizing Imports
- Keep core imports in centralized config
- Use `app/composables/` for project-specific auto-imports
- Group related imports together
- Document custom auto-imports

## Troubleshooting

### Duplicate Import Warnings
If you see duplicate import warnings:
1. Check if the import is defined in multiple places
2. Use centralized imports instead of scanning directories
3. Remove manual imports if auto-imported

### Type Not Found
If TypeScript can't find a type:
1. Check `.construct/types/auto-imports.d.ts`
2. Restart your TypeScript server
3. Verify the type is exported from the source module

### Import Not Working
If an auto-import isn't working:
1. Check the configuration in `vite.config.ts`
2. Verify the source file exports the function
3. Restart the development server