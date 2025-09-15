<template>
  <UApp>
    <div id="app" class="min-h-screen bg-white dark:bg-slate-900">
      <AppHeader>
        <template #logo>
          <router-link to="/" class="text-xl font-bold text-slate-900 dark:text-white">
            Construct
          </router-link>
        </template>

        <template #nav>
          <router-link
            to="/about"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            About
          </router-link>
          <router-link
            to="/docs"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            Docs
          </router-link>
          <a
            href="http://localhost:8001/docs"
            target="_blank"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            API
          </a>
          <a
            href="https://github.com/your-org/construct"
            target="_blank"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            GitHub
          </a>
          <router-link
            to="/core/authentication/login"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            Login
          </router-link>
          <router-link
            to="/core/authentication/register"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            Register
          </router-link>
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