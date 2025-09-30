<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { initAuth } = useAuth()

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
  <Suspense>
    <RouterView />
  </Suspense>
</template>
