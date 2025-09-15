# Dynamic Routes

Construct supports dynamic routes using Vue Router's parameter syntax. File names with brackets are automatically converted to dynamic route parameters.

## Basic Dynamic Routes

### User Profile Page
Create `app/pages/users/[id].vue`:

```vue
<template>
  <div>
    <UPageHeader
      :title="`User Profile: ${user?.name || userId}`"
      description="View and edit user information"
    />

    <UCard v-if="user">
      <UserCard :user="user" />
    </UCard>

    <UCard v-else-if="loading">
      <div class="flex items-center justify-center p-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
        <span class="ml-2">Loading user...</span>
      </div>
    </UCard>

    <UAlert
      v-else
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="User Not Found"
      :description="`No user found with ID: ${userId}`"
    />
  </div>
</template>

<script setup lang="ts">
// Use default layout with authentication
layout({"use": "default"})

const route = useRoute()
const userId = computed(() => route.params.id as string)

// Load user data
const { data: user, pending: loading } = await useAsyncData(
  `user-${userId.value}`,
  () => $api(`/users/${userId.value}`)
)
</script>
```

**Generated route**: `/users/:id`
**Example URLs**: `/users/123`, `/users/john-doe`

### Product with Edit Page
Create `app/pages/products/[id]/edit.vue`:

```vue
<template>
  <div>
    <UPageHeader
      :title="`Edit Product: ${product?.name || productId}`"
      description="Update product information"
    />

    <UForm
      v-if="product"
      :state="form"
      @submit="handleSubmit"
    >
      <UFormField label="Product Name" name="name">
        <UInput v-model="form.name" />
      </UFormField>

      <UFormField label="Description" name="description">
        <UTextarea v-model="form.description" />
      </UFormField>

      <div class="flex gap-3">
        <UButton type="submit" :loading="saving">
          Save Changes
        </UButton>
        <UButton
          variant="outline"
          @click="$router.push(`/products/${productId}`)"
        >
          Cancel
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
// Admin layout for product management
layout({"use": "admin"})

const route = useRoute()
const productId = computed(() => route.params.id as string)

// Load product data
const { data: product } = await useAsyncData(
  `product-${productId.value}`,
  () => $api(`/products/${productId.value}`)
)

// Form state
const form = reactive({
  name: product.value?.name || '',
  description: product.value?.description || ''
})

const saving = ref(false)

async function handleSubmit() {
  saving.value = true
  try {
    await $api(`/products/${productId.value}`, {
      method: 'PUT',
      body: form
    })

    await navigateTo(`/products/${productId.value}`)
  } finally {
    saving.value = false
  }
}
</script>
```

**Generated route**: `/products/:id/edit`
**Example URLs**: `/products/123/edit`, `/products/laptop-pro/edit`

## Multiple Parameters

### Blog Post with Category
Create `app/pages/blog/[category]/[slug].vue`:

```vue
<template>
  <div>
    <UPageHeader
      :title="post?.title"
      :description="post?.excerpt"
    />

    <div class="flex items-center gap-2 mb-6">
      <UBadge :label="category" />
      <span class="text-slate-400">•</span>
      <time class="text-sm text-slate-600">
        {{ formatDate(post?.published_at) }}
      </time>
    </div>

    <div class="prose prose-slate dark:prose-invert max-w-none">
      <div v-html="post?.content" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Public blog post
layout({"use": "default"})

const route = useRoute()
const category = computed(() => route.params.category as string)
const slug = computed(() => route.params.slug as string)

// Load blog post
const { data: post } = await useAsyncData(
  `post-${category.value}-${slug.value}`,
  () => $api(`/blog/${category.value}/${slug.value}`)
)

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}
</script>
```

**Generated route**: `/blog/:category/:slug`
**Example URLs**: `/blog/tech/vue-3-tips`, `/blog/news/framework-update`

## Route Patterns

| File Pattern | Generated Route | Example URLs |
|--------------|----------------|--------------|
| `[id].vue` | `/:id` | `/123`, `/abc` |
| `[slug]/edit.vue` | `/:slug/edit` | `/my-post/edit` |
| `users/[id].vue` | `/users/:id` | `/users/123` |
| `[category]/[slug].vue` | `/:category/:slug` | `/tech/vue-tips` |
| `api/[...path].vue` | `/api/:path(.*)` | `/api/users/123/posts` |

## Accessing Route Parameters

```vue
<script setup lang="ts">
const route = useRoute()

// Single parameter
const id = computed(() => route.params.id as string)

// Multiple parameters
const { category, slug } = route.params

// Reactive parameter watching
watch(() => route.params.id, (newId) => {
  // Reload data when ID changes
  loadUserData(newId)
})
</script>
```

## Layout Conventions with Dynamic Routes

Dynamic routes follow the same layout conventions:

```vue
<script setup lang="ts">
// Admin-only product editing
layout({"use": "admin"}) // Automatically gets ['auth', 'admin'] middleware

// Public user profiles
layout({"use": "default"}) // Automatically gets ['public'] middleware

// User dashboard pages
layout({"use": "dashboard"}) // Automatically gets ['auth'] middleware
</script>
```

## Best Practices

1. **Validate Parameters**: Always validate route parameters before using them
2. **Handle Missing Data**: Show appropriate loading and error states
3. **SEO-Friendly URLs**: Use meaningful slugs instead of just IDs when possible
4. **Type Safety**: Type your route parameters for better development experience

```vue
<script setup lang="ts">
// Type the expected parameters
interface RouteParams {
  id: string
}

const route = useRoute()
const { id } = route.params as RouteParams

// Validate the parameter
if (!id || typeof id !== 'string') {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid user ID'
  })
}
</script>
```