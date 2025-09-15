<template>
  <div class="max-w-5xl mx-auto">
    <UPageHeader
      title="Construct: The Beautiful Facade for Base"
      description="Base gives you the powerful Go backend structure with modules, authentication, and APIs. Construct makes it beautiful with modern Vue UI, seamless TypeScript integration, and developer-friendly tools."
    />

    <div class="space-y-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-logos-go" class="text-2xl" />
              <h2 class="text-xl font-semibold">Base Framework (Go)</h2>
            </div>
          </template>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-rocket-launch" class="text-primary" />
              <span>High-performance API server</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-shield-check" class="text-primary" />
              <span>Built-in authentication & authorization</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-cog-6-tooth" class="text-primary" />
              <span>Auto-generated CRUD endpoints</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-circle-stack" class="text-primary" />
              <span>Database migrations & models</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-cloud-arrow-up" class="text-primary" />
              <span>File storage & media handling</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-signal" class="text-primary" />
              <span>WebSocket support</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-document-text" class="text-primary" />
              <span>API documentation (Swagger)</span>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-logos-vue" class="text-2xl" />
              <h2 class="text-xl font-semibold">Construct UI (Vue)</h2>
            </div>
          </template>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-cube" class="text-green-500" />
              <span>Vue 3 with Composition API</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-map" class="text-green-500" />
              <span>Auto-routing with file-based pages</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-logos-typescript-icon" class="text-green-500" />
              <span>TypeScript with native Go types</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-squares-2x2" class="text-green-500" />
              <span>Nuxt UI 4 components</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-logos-tailwindcss-icon" class="text-green-500" />
              <span>Tailwind CSS 4 styling</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-bolt" class="text-green-500" />
              <span>Hot module replacement</span>
            </div>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-wrench-screwdriver" class="text-green-500" />
              <span>Optimized build process</span>
            </div>
          </div>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-building-library" class="text-2xl text-primary" />
            <h2 class="text-xl font-semibold">Architecture</h2>
          </div>
        </template>

        <div class="space-y-6">
          <UAlert
            icon="i-heroicons-information-circle"
            color="primary"
            variant="soft"
            title="Convention over Configuration"
            description="The framework follows a convention-over-configuration approach, where a single construct.config.ts file defines the entire application structure."
          />

          <p class="text-slate-600 dark:text-slate-300">
            The Go backend serves as an API server while the Vue frontend acts as a modern SPA.
            Both components read from the same configuration, ensuring consistency across your stack.
          </p>

          <UCodeBlock
            :code="configExample"
            language="typescript"
            :header="false"
          />
        </div>
      </UCard>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UCard class="hover:shadow-lg transition-shadow">
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-wrench-screwdriver" class="text-2xl text-primary" />
              <h3 class="font-semibold">Convention over Configuration</h3>
            </div>
          </template>

          <p class="text-slate-600 dark:text-slate-300">
            Minimal setup with intelligent defaults that can be customized as needed.
          </p>
        </UCard>

        <UCard class="hover:shadow-lg transition-shadow">
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-shield-check" class="text-2xl text-green-500" />
              <h3 class="font-semibold">Type Safety</h3>
            </div>
          </template>

          <p class="text-slate-600 dark:text-slate-300">
            Full TypeScript support with types that automatically match your Go models.
          </p>
        </UCard>

        <UCard class="hover:shadow-lg transition-shadow">
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-heart" class="text-2xl text-purple-500" />
              <h3 class="font-semibold">Developer Experience</h3>
            </div>
          </template>

          <p class="text-slate-600 dark:text-slate-300">
            Hot reload, auto-routing, and integrated tooling for fast development cycles.
          </p>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-star" class="text-2xl text-yellow-500" />
            <h2 class="text-xl font-semibold">Why Choose Construct?</h2>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <UBadge color="primary" variant="soft" size="lg">Performance</UBadge>
            <p class="text-slate-600 dark:text-slate-300">
              Go's exceptional performance combined with Vue's reactive system creates lightning-fast applications.
            </p>
          </div>

          <div class="space-y-4">
            <UBadge color="green" variant="soft" size="lg">Productivity</UBadge>
            <p class="text-slate-600 dark:text-slate-300">
              Auto-generated types, routes, and components mean less boilerplate and more feature development.
            </p>
          </div>

          <div class="space-y-4">
            <UBadge color="purple" variant="soft" size="lg">Scalability</UBadge>
            <p class="text-slate-600 dark:text-slate-300">
              Built-in patterns for authentication, authorization, and data management scale with your application.
            </p>
          </div>

          <div class="space-y-4">
            <UBadge color="orange" variant="soft" size="lg">Maintainability</UBadge>
            <p class="text-slate-600 dark:text-slate-300">
              TypeScript end-to-end ensures your frontend and backend stay in sync as your application evolves.
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// About page showcasing framework features - should be publicly accessible
// Using default layout - automatically applies ['public'] middleware via convention
layout({"use": "default"})

const configExample = `// construct.config.ts
export default defineConstructConfig({
  server: {
    api: { port: 8001 },
    ui: { port: 3100 }
  },
  modules: {
    core: ['authentication', 'users', 'authorization']
  },
  pages: {
    dir: 'app/pages',
    auto: true
  },
  ui: {
    library: 'nuxt-ui',
    theme: 'auto'
  }
})`
</script>