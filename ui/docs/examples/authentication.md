# Authentication Flow

Complete guide to implementing authentication in Construct using the Base framework API.

## Overview

Construct provides a complete authentication system with:
- localStorage-based session persistence
- Automatic token management
- Middleware-based route protection
- Reactive auth state

## API Integration

### Login Response Format
The Base API returns user data directly (not wrapped in a response object):

```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "role_id": 1,
  "role_name": "Owner",
  "avatar_url": "",
  "last_login": "2025-09-15T06:01:44+02:00",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "exp": 1757995318,
  "extend": {
    "role": {
      "id": 1,
      "name": "Owner"
    },
    "user_id": 1
  }
}
```

### API Configuration
The API client is configured to work with the Base framework:

```typescript
// core/api/client.ts
const apiClient = new ApiClient()
// Base URL: http://localhost:8100
// API Key: 'api' (sent as X-Api-Key header)
```

## Authentication Store

The auth store handles all authentication logic:

```typescript
// Using the auth store
const auth = useAuthStore()

// State
auth.user          // Current user object
auth.token         // JWT token
auth.loading       // Loading state
auth.error         // Error message
auth.isAuthenticated // Computed: !!user && !!token
auth.userRole      // Computed: user role name

// Actions
await auth.login(credentials)
await auth.register(userData)
await auth.logout()
await auth.getCurrentUser()
await auth.initAuth() // Restore from localStorage
```

## Login Implementation

### Login Page
```vue
<template>
  <div class="auth-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h1>Login</h1>

      <UAlert
        v-if="auth.error"
        color="red"
        variant="soft"
        :title="auth.error"
        class="mb-4"
      />

      <UFormGroup label="Email" required>
        <UInput
          v-model="credentials.email"
          type="email"
          placeholder="Enter your email"
          :disabled="auth.loading"
        />
      </UFormGroup>

      <UFormGroup label="Password" required>
        <UInput
          v-model="credentials.password"
          type="password"
          placeholder="Enter your password"
          :disabled="auth.loading"
        />
      </UFormGroup>

      <UButton
        type="submit"
        :loading="auth.loading"
        block
        size="lg"
      >
        Sign In
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
// Guest middleware - redirects authenticated users
layout({ use: "auth", middleware: ["guest"] })

const auth = useAuthStore()
const { navigateTo } = useNavigation()

const credentials = ref<LoginRequest>({
  email: '',
  password: ''
})

const handleLogin = async () => {
  const success = await auth.login(credentials.value)

  if (success) {
    // Redirect to intended destination or dashboard
    const redirectTo = localStorage.getItem('redirectTo') || '/dashboard'
    localStorage.removeItem('redirectTo')
    navigateTo(redirectTo)
  }
}
</script>
```

### API Call Flow
1. User submits login form
2. `auth.login()` calls `apiClient.login()`
3. API client sends request with `X-Api-Key: api` header
4. Base API returns user data with `accessToken`
5. Store saves user and token to localStorage
6. User is redirected to dashboard

## Registration Implementation

### Register Page
```vue
<template>
  <div class="auth-container">
    <form @submit.prevent="handleRegister" class="register-form">
      <h1>Create Account</h1>

      <UAlert
        v-if="auth.error"
        color="red"
        variant="soft"
        :title="auth.error"
        class="mb-4"
      />

      <div class="grid grid-cols-2 gap-4">
        <UFormGroup label="First Name" required>
          <UInput
            v-model="userData.first_name"
            placeholder="John"
            :disabled="auth.loading"
          />
        </UFormGroup>

        <UFormGroup label="Last Name" required>
          <UInput
            v-model="userData.last_name"
            placeholder="Doe"
            :disabled="auth.loading"
          />
        </UFormGroup>
      </div>

      <UFormGroup label="Username" required>
        <UInput
          v-model="userData.username"
          placeholder="johndoe"
          :disabled="auth.loading"
        />
      </UFormGroup>

      <UFormGroup label="Email" required>
        <UInput
          v-model="userData.email"
          type="email"
          placeholder="john@example.com"
          :disabled="auth.loading"
        />
      </UFormGroup>

      <UFormGroup label="Password" required>
        <UInput
          v-model="userData.password"
          type="password"
          placeholder="Strong password"
          :disabled="auth.loading"
        />
      </UFormGroup>

      <UButton
        type="submit"
        :loading="auth.loading"
        block
        size="lg"
      >
        Create Account
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
layout({ use: "auth", middleware: ["guest"] })

const auth = useAuthStore()
const { navigateTo } = useNavigation()

const userData = ref({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: ''
})

const handleRegister = async () => {
  const success = await auth.register(userData.value)

  if (success) {
    navigateTo('/dashboard')
  }
}
</script>
```

## Protected Routes

### Dashboard (Auth Required)
```vue
<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Welcome, {{ auth.user?.first_name }}!</h1>
      <UButton
        @click="handleLogout"
        variant="ghost"
        color="red"
        icon="i-heroicons-arrow-right-on-rectangle"
      >
        Logout
      </UButton>
    </div>

    <div class="dashboard-content">
      <div class="user-info">
        <h2>User Information</h2>
        <p><strong>Email:</strong> {{ auth.user?.email }}</p>
        <p><strong>Role:</strong> {{ auth.user?.role?.name }}</p>
        <p><strong>Last Login:</strong> {{ formatDate(auth.user?.last_login) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth middleware - requires authentication
layout({ use: "default", middleware: ["auth"] })

const auth = useAuthStore()
const { navigateTo } = useNavigation()

const handleLogout = async () => {
  await auth.logout()
  navigateTo('/auth/login')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>
```

### Admin Route (Role-Based)
```vue
<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <p>Only users with admin/owner roles can access this page.</p>

    <div class="admin-actions">
      <UButton
        @click="loadUsers"
        icon="i-heroicons-users"
      >
        Manage Users
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
// Admin middleware - requires admin role
layout({ use: "admin", middleware: ["admin"] })

const users = useUsersStore()

const loadUsers = async () => {
  await users.fetchUsers()
}
</script>
```

## Session Management

### Auto-Restore on App Load
```typescript
// core/main.ts
const app = createApp(App)

// Initialize auth before mounting
const auth = useAuthStore()
await auth.initAuth()

app.mount('#app')
```

### Token Management
The system automatically:
- Saves tokens to localStorage on login
- Adds tokens to API requests as `Authorization: Bearer {token}`
- Clears tokens on logout
- Handles 401 responses by redirecting to login

### Session Persistence
```typescript
// What's stored in localStorage
localStorage.getItem('auth_token')  // JWT token
localStorage.getItem('auth_user')   // User object as JSON
localStorage.getItem('redirectTo')  // Intended destination after login
```

## Error Handling

### Login Errors
```typescript
const handleLogin = async () => {
  try {
    const success = await auth.login(credentials.value)
    if (success) {
      navigateTo('/dashboard')
    } else {
      // Error message is already in auth.error
      console.log('Login failed:', auth.error)
    }
  } catch (error) {
    // Handle unexpected errors
    console.error('Login error:', error)
  }
}
```

### Network Errors
The API client handles:
- Network timeouts
- Connection errors
- Invalid JSON responses
- HTTP error codes

### Token Expiration
```typescript
// API client automatically handles 401s
// Clears localStorage and redirects to login
if (response.status === 401) {
  this.clearToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login'
  }
}
```

## Security Best Practices

### Frontend Security
- Store sensitive data in localStorage (not sessionStorage)
- Clear all auth data on logout
- Validate user permissions on every route
- Use HTTPS in production

### API Security
- Always validate tokens on the backend
- Implement proper CORS policies
- Use secure headers (X-Api-Key)
- Validate user permissions server-side

### Production Considerations
- Set up token refresh logic
- Implement session timeout
- Use secure token storage
- Add rate limiting for auth endpoints

## Testing Authentication

### Manual Testing
1. **Login Flow**: Test with valid/invalid credentials
2. **Registration**: Create new account
3. **Protected Routes**: Access without login (should redirect)
4. **Logout**: Verify localStorage is cleared
5. **Session Restore**: Refresh page (should stay logged in)

### API Testing
```bash
# Test login endpoint
curl -X POST 'http://localhost:8100/api/auth/login' \
  -H 'X-Api-Key: api' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

This authentication system provides a secure, user-friendly experience while maintaining simplicity and following security best practices.