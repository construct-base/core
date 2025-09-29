<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Reset your password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a reset link
        </p>
      </div>

      <UCard v-if="!emailSent">
        <form class="space-y-6" @submit.prevent="handleForgotPassword">
          <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div class="flex">
              <UIcon name="i-lucide-alert-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-400">
                  Error
                </h3>
                <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <UFormGroup label="Email address" required>
            <UInput
              v-model="email"
              type="email"
              placeholder="Enter your email"
              autocomplete="email"
              required
              :disabled="loading"
              autofocus
            />
          </UFormGroup>

          <UButton
            type="submit"
            block
            :loading="loading"
            :disabled="!email.trim()"
          >
            Send Reset Link
          </UButton>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Remember your password?
              </span>
            </div>
          </div>

          <div class="mt-6">
            <UButton
              variant="outline"
              block
              to="/login"
              :disabled="loading"
            >
              Back to Sign In
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Success state -->
      <UCard v-else class="text-center">
        <div class="space-y-4">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50">
            <UIcon name="i-lucide-mail" class="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Check your email
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We've sent a password reset link to
            </p>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ email }}
            </p>
          </div>

          <div class="space-y-3">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or try again.
            </p>

            <div class="flex space-x-3">
              <UButton
                variant="outline"
                size="sm"
                :disabled="resendCooldown > 0"
                @click="handleResend"
              >
                {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email' }}
              </UButton>

              <UButton
                variant="ghost"
                size="sm"
                to="/login"
              >
                Back to Sign In
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useApi } from '../../composables/useApi'

const api = useApi()

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const emailSent = ref(false)
const resendCooldown = ref(0)

// Simple toast implementation
const toast = {
  add: (options: { title: string; description: string; color: string }) => {
    console.log(`${options.color.toUpperCase()}: ${options.title} - ${options.description}`)
  }
}

let cooldownInterval: NodeJS.Timeout | null = null

const startCooldown = () => {
  resendCooldown.value = 60
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && cooldownInterval) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

const handleForgotPassword = async () => {
  if (!email.value.trim()) return

  loading.value = true
  error.value = null

  try {
    const response = await api.post('/api/auth/forgot-password', {
      email: email.value
    })

    if (response.success) {
      emailSent.value = true
      startCooldown()
      toast.add({
        title: 'Email sent',
        description: 'Password reset instructions have been sent to your email',
        color: 'success'
      })
    } else {
      error.value = 'error' in response ? response.error : 'Failed to send reset email'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  if (resendCooldown.value > 0) return
  await handleForgotPassword()
}

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})
</script>