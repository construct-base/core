# Core Components

Construct provides a set of core components that are essential for building applications. These components are located in `core/components/` and are automatically imported.

## Layout Components

### AppHeader
Main application header with navigation and branding.

```vue
<template>
  <AppHeader>
    <template #logo>
      <router-link to="/" class="text-xl font-bold">
        My App
      </router-link>
    </template>

    <template #nav>
      <router-link to="/about">About</router-link>
      <router-link to="/docs">Docs</router-link>
    </template>

    <template #actions>
      <UColorModeButton />
    </template>
  </AppHeader>
</template>
```

#### Props
- `title?: string` - Default title text
- `sticky?: boolean` - Make header sticky
- `border?: boolean` - Show bottom border
- `background?: boolean` - Show background
- `containerSize?: string` - Container max width

### AppContainer
Responsive container component for consistent layouts.

```vue
<template>
  <AppContainer size="lg">
    <p>Content with responsive padding and max-width</p>
  </AppContainer>
</template>
```

#### Props
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'`

### AppMain
Main content area with proper spacing and layout.

```vue
<template>
  <AppMain>
    <slot />
  </AppMain>
</template>
```

### AppFooter
Application footer component.

```vue
<template>
  <AppFooter />
</template>
```

## UI Components

### UserCard
Display user information with avatar and details.

```vue
<template>
  <UserCard
    :user="currentUser"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
const currentUser = ref<User>({
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  avatar_url: '/avatars/john.jpg',
  role: { name: 'Admin' }
})

function handleEdit(user: User) {
  // Handle user edit
}

function handleDelete(user: User) {
  // Handle user delete
}
</script>
```

#### Props
- `user: User` - User object to display

#### Events
- `@edit` - Emitted when edit button is clicked
- `@delete` - Emitted when delete button is clicked

## Usage Patterns

### Auto-Import
All core components are automatically imported and available globally:

```vue
<template>
  <!-- No import needed -->
  <AppHeader />
  <AppMain>
    <UserCard :user="user" />
  </AppMain>
  <AppFooter />
</template>
```

### Customization
Core components can be extended or overridden by creating components with the same name in `app/components/`.

### Styling
Components use Tailwind CSS classes and follow the design system color scheme (slate-based with primary accents).