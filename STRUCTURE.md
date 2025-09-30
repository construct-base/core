# Construct Structure Definition

## Philosophy

Construct is a **Full-Stack HMVC Framework** where Go (backend) and Vue (frontend) act as **one unified system**.

A **Structure** in Construct represents a complete, self-contained feature module that spans both backend and frontend.

---

## Structure Definition

A **Structure** is a complete CRUD feature that includes:

### Backend (Go) - HMVC Module
Located in: `api/{resource}/`

```
api/posts/
├── model.go        # Data model (GORM)
├── service.go      # Business logic
├── controller.go   # HTTP handlers
├── validator.go    # Input validation
├── module.go       # Module registration
└── repository.go   # Database operations (optional)
```

**Responsibilities:**
- **Model**: Database schema, relationships, GORM hooks
- **Service**: Business logic, validation, data transformation
- **Controller**: HTTP request/response handling, routing
- **Validator**: Input validation rules
- **Module**: Registration with main app, dependency injection

### Frontend (Vue) - HMVC Module
Located in: `vue/structures/{resource}/`

```
vue/structures/posts/
├── index.vue       # Main page with table/list
├── types.ts        # TypeScript interfaces (matches Go model)
├── composable.ts   # API calls, state management
├── components/     # Feature-specific components (optional)
│   ├── PostForm.vue
│   ├── PostCard.vue
│   └── PostFilters.vue
└── store.ts        # Pinia store (optional, for complex state)
```

**Responsibilities:**
- **index.vue**: UI layout, table, modals, user interactions
- **types.ts**: TypeScript types matching Go models
- **composable.ts**: API integration, CRUD operations, local state
- **components/**: Reusable UI components for this feature
- **store.ts**: Global state if needed (cross-component state)

---

## HMVC Principles Applied

### Hierarchical
```
Framework Level:
├── core/           (Go framework code)
├── core/           (Vue framework code)

Module Level:
├── api/{resource}          (Go module)
└── structures/{resource}   (Vue module)

Feature Level:
└── Each structure is self-contained
```

### Modular
- Each structure is **independent** and **reusable**
- Can be enabled/disabled without affecting others
- Clear boundaries between features

### View-Controller
- **Go Controller**: Handles HTTP, delegates to Service
- **Vue Composable**: Acts as "controller" for UI state
- **Vue Components**: Pure presentation views

---

## Structure Communication

```
User Interaction
    ↓
Vue Component (index.vue)
    ↓
Composable (composable.ts)
    ↓ HTTP
API Endpoint
    ↓
Go Controller (controller.go)
    ↓
Service (service.go)
    ↓
Model/Repository (model.go)
    ↓
Database
```

---

## Generator Command

```bash
construct g Post title:string content:text published:bool
```

Creates a complete structure:

### Backend Output
```
✅ api/posts/model.go
✅ api/posts/service.go
✅ api/posts/controller.go
✅ api/posts/validator.go
✅ api/posts/module.go
✅ app/models/post.go (shared model)
```

### Frontend Output
```
✅ vue/structures/posts/index.vue
✅ vue/structures/posts/types.ts
✅ vue/structures/posts/composable.ts
✅ vue/view/types/post.ts (global types)
```

---

## File Responsibilities

### Backend

**model.go**
```go
// Database model, GORM tags, relationships
type Post struct {
    ID        uint
    Title     string
    Content   string
    Published bool
}
```

**service.go**
```go
// Business logic
func (s *Service) CreatePost(data PostCreate) (*Post, error)
func (s *Service) GetPosts(filters) ([]Post, error)
func (s *Service) UpdatePost(id, data) (*Post, error)
func (s *Service) DeletePost(id) error
```

**controller.go**
```go
// HTTP handlers
func (c *Controller) Create(ctx *router.Context) error
func (c *Controller) List(ctx *router.Context) error
func (c *Controller) Get(ctx *router.Context) error
func (c *Controller) Update(ctx *router.Context) error
func (c *Controller) Delete(ctx *router.Context) error
```

**validator.go**
```go
// Input validation
type PostCreateRequest struct {
    Title   string `validate:"required"`
    Content string `validate:"required"`
}
```

---

### Frontend

**index.vue**
```vue
<template>
  <!-- Table with CRUD operations -->
  <UTable :rows="posts" />
  <PostForm v-model="showForm" />
</template>

<script setup>
import { usePosts } from './composable'
const { posts, loading, create, update, delete } = usePosts()
</script>
```

**types.ts**
```typescript
// Matches Go model exactly
export interface Post {
  id: number
  title: string
  content: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface PostCreateRequest {
  title: string
  content: string
  published: boolean
}
```

**composable.ts**
```typescript
// API integration
export function usePosts() {
  const posts = ref<Post[]>([])
  const loading = ref(false)

  const fetchPosts = async () => {
    const response = await apiClient.get('/posts')
    posts.value = response.data
  }

  const createPost = async (data: PostCreateRequest) => {
    await apiClient.post('/posts', data)
    await fetchPosts()
  }

  return { posts, loading, fetchPosts, createPost }
}
```

---

## Directory Structure

```
construct/
├── api/                    # Backend modules
│   ├── posts/             # Post structure (Go)
│   ├── comments/          # Comment structure (Go)
│   └── users/             # User structure (Go)
│
├── app/                    # Shared backend code
│   ├── models/            # Shared models
│   └── init.go            # Module registration
│
├── core/                   # Go framework core
│   ├── router/
│   ├── database/
│   └── ...
│
└── vue/
    ├── core/              # Vue framework core
    │   ├── layouts/
    │   ├── pages/         # Auth pages
    │   └── api/           # API client
    │
    ├── view/              # Project views
    │   ├── components/    # Shared components
    │   ├── composables/   # Shared composables
    │   ├── pages/         # Custom pages
    │   └── types/         # Global types
    │
    └── structures/        # Generated CRUD modules
        ├── posts/         # Post structure (Vue)
        ├── comments/      # Comment structure (Vue)
        └── users/         # User structure (Vue)
```

---

## Benefits

### 1. Unified Development Experience
- One command generates both sides
- Types automatically match
- API routes automatically aligned

### 2. True HMVC
- Each structure is self-contained
- Clear separation of concerns
- Easy to understand and maintain

### 3. Framework Consistency
- Backend HMVC: Model → Service → Controller
- Frontend HMVC: Types → Composable → View
- Same mental model, different languages

### 4. Modularity
- Enable/disable features easily
- Reuse structures across projects
- Share structures as packages

### 5. Type Safety
- Go types → TypeScript types automatically
- No manual synchronization needed
- Compile-time error detection

---

## Advanced Structure Example

### Complex Structure with Relationships

```bash
construct g Article \
  title:string \
  content:text \
  category_id:uint \
  author_id:uint \
  tags:manyToMany:Tag
```

Creates:
```
api/articles/
├── model.go          # With relationships
├── service.go        # With eager loading
├── controller.go     # With filtering
└── ...

vue/structures/articles/
├── index.vue         # With filters
├── types.ts          # With nested types
├── composable.ts     # With relationship queries
└── components/
    ├── ArticleForm.vue
    └── CategorySelect.vue
```

---

## Structure vs Module

**Module** (Traditional):
- Backend OR Frontend
- Separate concerns
- Manual synchronization

**Structure** (Construct):
- Backend AND Frontend together
- Unified feature
- Automatic synchronization
- One command, full stack

---

## Naming Convention

- **Singular for Model**: `Post`, `User`, `Article`
- **Plural for Module**: `posts/`, `users/`, `articles/`
- **CamelCase in Go**: `PostService`, `CreatePost`
- **camelCase in TS**: `usePost`, `createPost`
- **kebab-case for URLs**: `/api/posts`, `/articles`

---

## Summary

A **Structure** in Construct is a complete, self-contained feature module that includes:

✅ Backend HMVC (Model, Service, Controller)
✅ Frontend HMVC (Types, Composable, View)
✅ Automatic synchronization
✅ Type safety across stack
✅ One command generation

Two frameworks, one system. 🚀