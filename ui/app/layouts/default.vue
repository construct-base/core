<template>
  <UApp>
    <div id="app" class="min-h-screen bg-white dark:bg-slate-900">
      <AppHeader>
        <template #logo>
          <Link to="/" class="text-xl font-bold text-slate-900 dark:text-white">
            Construct
          </Link>
        </template>

        <template #nav>
          <Link
            to="/about"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            About
          </Link>
          <Link
            to="/docs"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            Docs
          </Link>
          <Link
            to="http://localhost:8001/docs"
            target="_blank"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            API
          </Link>
          <Link
            to="https://github.com/your-org/construct"
            target="_blank"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            GitHub
          </Link>
          <Link
            to="/auth/login"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            Login
          </Link>
          <Link
            to="/auth/register"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            Register
          </Link>
        </template>
      </AppHeader>

      <AppMain>
        <slot />
      </AppMain>

      <AppFooter />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('🚀 Construct Framework UI Ready!')
})
</script>