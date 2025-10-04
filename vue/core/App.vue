<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '~/core/composables/useAuth'
import DefaultLayout from '~/core/layouts/default.vue'
import AuthLayout from '~/core/layouts/auth.vue'

const route = useRoute()
const { initAuth } = useAuth()

// Determine which layout to use based on route meta
const layout = computed(() => {
  const layoutName = route.meta.layout || 'default'
  return layoutName === 'auth' ? AuthLayout : DefaultLayout
})

// Initialize authentication on app start
onMounted(async () => {
  try {
    await initAuth()
    console.log('🚀 Construct Vue Dashboard Ready!')
  } catch (error) {
    console.warn('Auth initialization failed:', error)
  }
})
</script>

<template>
  <component :is="layout">
    <Suspense>
      <RouterView />
    </Suspense>
  </component>
</template>
