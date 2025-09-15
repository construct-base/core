<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-md w-full px-6">
      <div class="text-center">
        <!-- Error Icon -->
        <div class="mx-auto h-24 w-24 text-red-500 dark:text-red-400 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <!-- Error Code -->
        <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          {{ error?.statusCode || '500' }}
        </h1>

        <!-- Error Message -->
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          {{ error?.statusMessage || 'Something went wrong' }}
        </h2>

        <!-- Description -->
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          {{ errorDescription }}
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton
            @click="handleError"
            color="primary"
            size="lg"
            class="px-6"
          >
            Try Again
          </UButton>

          <UButton
            @click="goHome"
            variant="outline"
            size="lg"
            class="px-6"
          >
            Go Home
          </UButton>
        </div>

        <!-- Debug Info (Development Only) -->
        <div v-if="isDevelopment && error?.stack" class="mt-8 text-left">
          <details class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <summary class="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
              Debug Information
            </summary>
            <pre class="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto">{{ error.stack }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  error?: {
    statusCode?: number
    statusMessage?: string
    stack?: string
    url?: string
  }
}

const props = defineProps<Props>()
const router = useRouter()

const isDevelopment = import.meta.env.DEV

const errorDescription = computed(() => {
  const code = props.error?.statusCode

  switch (code) {
    case 404:
      return "The page you're looking for doesn't exist."
    case 403:
      return "You don't have permission to access this resource."
    case 401:
      return "Please log in to continue."
    case 500:
      return "An internal server error occurred. Please try again later."
    default:
      return "An unexpected error occurred. Please try again."
  }
})

const handleError = () => {
  // Clear error and reload
  window.location.reload()
}

const goHome = () => {
  router.push('/')
}
</script>