<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/core/composables/useAuth'

const router = useRouter()
const { isAuthenticated, initAuth } = useAuth()

// Guest middleware - redirect to dashboard if already authenticated
onMounted(async () => {
  await initAuth()

  if (isAuthenticated.value) {
    router.push('/')
  }
})
</script>

<template>
  <UApp>
    <slot />
  </UApp>
</template>