<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to Construct
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Access your admin dashboard
        </p>
      </div>

      <UCard>
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div class="flex">
              <UIcon name="i-lucide-alert-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-400">
                  Authentication Error
                </h3>
                <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <UFormField label="Email address" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              autocomplete="email"
              required
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Password" required>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
              :disabled="loading"
            />
          </UFormField>

          <div class="flex items-center justify-between">
            <UCheckbox
              v-model="rememberMe"
              label="Remember me"
              :disabled="loading"
            />

            <UButton
              variant="ghost"
              color="primary"
              size="sm"
              to="/forgot-password"
              :disabled="loading"
            >
              Forgot password?
            </UButton>
          </div>

          <UButton
            type="submit"
            block
            :loading="loading"
            :disabled="!form.email || !form.password"
          >
            Sign in
          </UButton>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">
                or
              </span>
            </div>
          </div>

          <div class="mt-6">
            <UButton
              variant="outline"
              block
              to="/register"
              :disabled="loading"
            >
              Create new account
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- API Status -->
      <div class="mt-4">
        <UCard class="bg-gray-50 dark:bg-gray-800">
          <div class="flex items-center space-x-2">
            <UIcon
              :name="apiStatus.connected ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
              :class="apiStatus.connected ? 'text-green-500' : 'text-red-500'"
              class="h-4 w-4"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">
              API: {{ apiStatus.message }}
            </span>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '~/core/composables/useAuth'
import { useRouter } from 'vue-router'

const { login, error, loading, isAuthenticated } = useAuth()
const router = useRouter()
const toast = useToast()

// Redirect if already authenticated
if (isAuthenticated.value) {
  router.push('/')
}

const form = reactive({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const apiStatus = ref({
  connected: false,
  message: 'Checking connection...'
})

const handleLogin = async () => {
  try {
    const success = await login(form)

    if (success) {
      toast.add({
        title: 'Welcome back!',
        description: 'Successfully signed in',
        color: 'success'
      })
      router.push('/')
    }
    // Error is handled by the auth composable and displayed in the form
  } catch {
    toast.add({
      title: 'Login failed',
      description: 'An unexpected error occurred',
      color: 'error'
    })
  }
}

// Test API connection on mount
const checkAPIConnection = async () => {
  try {
    const response = await fetch('/health')
    if (response.ok) {
      apiStatus.value = {
        connected: true,
        message: 'Connected to backend'
      }
    } else {
      apiStatus.value = {
        connected: false,
        message: `Backend error (${response.status})`
      }
    }
  } catch {
    apiStatus.value = {
      connected: false,
      message: 'Cannot connect to backend'
    }
  }
}

onMounted(() => {
  checkAPIConnection()
})
</script>