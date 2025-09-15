<template>
  <component :is="layoutComponent" v-if="layoutComponent">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Dynamically load layout based on route meta
const layoutComponent = computed(() => {
  const layoutName = route.meta?.use || 'default'

  try {
    // Try to load from app layouts first
    return defineAsyncComponent(() =>
      import(`../app/layouts/${layoutName}.vue`)
        .catch(() => {
          // Fallback to a simple wrapper if layout not found
          console.warn(`Layout '${layoutName}' not found, using default`)
          return import('../app/layouts/default.vue')
        })
    )
  } catch (error) {
    console.error('Error loading layout:', error)
    // Return default layout as fallback
    return defineAsyncComponent(() => import('../app/layouts/default.vue'))
  }
})
</script>

<style>
/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>