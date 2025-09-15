<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div class="text-center">
      <!-- Loading Spinner -->
      <div class="relative">
        <div class="h-24 w-24 mx-auto">
          <div class="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div class="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
      </div>

      <!-- Loading Text -->
      <div class="mt-8 space-y-2">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ loadingMessage }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ loadingDescription }}
        </p>
      </div>

      <!-- Progress Bar (optional) -->
      <div v-if="showProgress" class="mt-6 w-64 mx-auto">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            class="bg-primary-500 h-full rounded-full transition-all duration-300 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ progress }}%
        </p>
      </div>

      <!-- Cancel Button (optional) -->
      <div v-if="showCancel" class="mt-8">
        <UButton
          @click="$emit('cancel')"
          variant="ghost"
          color="gray"
        >
          Cancel
        </UButton>
      </div>
    </div>

    <!-- Animated Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-primary-400 rounded-full opacity-10 animate-pulse"></div>
      <div class="absolute -bottom-10 -left-10 w-60 h-60 bg-primary-500 rounded-full opacity-10 animate-pulse animation-delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-300 rounded-full opacity-5 animate-pulse animation-delay-2000"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loadingMessage?: string
  loadingDescription?: string
  showProgress?: boolean
  progress?: number
  showCancel?: boolean
}

withDefaults(defineProps<Props>(), {
  loadingMessage: 'Loading...',
  loadingDescription: 'Please wait while we prepare everything for you.',
  showProgress: false,
  progress: 0,
  showCancel: false
})

defineEmits<{
  cancel: []
}>()
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>