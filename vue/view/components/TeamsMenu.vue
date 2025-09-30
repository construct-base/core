<template>
  <UButton
    color="neutral"
    variant="ghost"
    class="w-full"
    :class="[collapsed ? 'justify-center' : 'justify-start']"
    to="/"
  >
    <UIcon
      name="i-lucide-layers"
      class="h-5 w-5 text-primary-500"
    />

    <div v-if="!collapsed" class="flex flex-col items-start min-w-0 flex-1 ms-3">
      <p class="text-sm font-medium text-gray-900 dark:text-white">
        Construct
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        Admin Dashboard
      </p>
    </div>
  </UButton>
</template>

<script setup lang="ts">
interface Props {
  collapsed?: boolean
}

withDefaults(defineProps<Props>(), {
  collapsed: false
})
</script>