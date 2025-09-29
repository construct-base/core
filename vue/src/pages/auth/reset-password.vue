<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Set new password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Create a strong password for your account
        </p>
      </div>

      <UCard v-if="!resetComplete">
        <form class="space-y-6" @submit.prevent="handleResetPassword">
          <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div class="flex">
              <UIcon name="i-lucide-alert-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-400">
                  Reset Error
                </h3>
                <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <UFormGroup label="New Password" required>
            <UInput
              v-model="password"
              type="password"
              placeholder="Create a strong password"
              autocomplete="new-password"
              required
              :disabled="loading"
              autofocus
            />
            <template #help>
              <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Password should be at least 8 characters long
              </div>
            </template>
          </UFormGroup>

          <UFormGroup label="Confirm Password" required>
            <UInput
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              autocomplete="new-password"
              required
              :disabled="loading"
            />
          </UFormGroup>

          <!-- Password strength indicator -->
          <div v-if="password" class="space-y-2">
            <div class="text-xs font-medium text-gray-700 dark:text-gray-300">
              Password strength:
            </div>
            <div class="flex space-x-1">
              <div
                v-for="i in 4"
                :key="i"
                class="h-2 flex-1 rounded"
                :class="[
                  i <= passwordStrength.score
                    ? passwordStrength.color
                    : 'bg-gray-200 dark:bg-gray-700'
                ]"
              />
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ passwordStrength.text }}
            </div>
          </div>

          <UButton
            type="submit"
            block
            :loading="loading"
            :disabled="!isFormValid"
          >
            Reset Password
          </UButton>
        </form>
      </UCard>

      <!-- Success state -->
      <UCard v-else class="text-center">
        <div class="space-y-4">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50">
            <UIcon name="i-lucide-check" class="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Password reset successful
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
          </div>

          <UButton
            block
            to="/login"
          >
            Continue to Sign In
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '../../composables/useApi'

const route = useRoute()
const router = useRouter()
const api = useApi()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const resetComplete = ref(false)
const token = ref('')

// Simple toast implementation
const toast = {
  add: (options: { title: string; description: string; color: string }) => {
    console.log(`${options.color.toUpperCase()}: ${options.title} - ${options.description}`)
  }
}

// Get token from URL query parameters
onMounted(() => {
  const urlToken = route.query.token as string
  if (!urlToken) {
    error.value = 'Invalid or missing reset token'
    toast.add({
      title: 'Invalid Link',
      description: 'This password reset link is invalid or has expired',
      color: 'error'
    })
    // Redirect to forgot password page after a delay
    setTimeout(() => {
      router.push('/forgot-password')
    }, 3000)
    return
  }
  token.value = urlToken
})

const isFormValid = computed(() => {
  return (
    password.value.trim().length >= 8 &&
    confirmPassword.value.trim() &&
    password.value === confirmPassword.value
  )
})

const passwordStrength = computed(() => {
  const pwd = password.value
  let score = 0
  let text = 'Very weak'
  let color = 'bg-red-500'

  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  switch (score) {
    case 0:
    case 1:
      text = 'Very weak'
      color = 'bg-red-500'
      break
    case 2:
      text = 'Weak'
      color = 'bg-orange-500'
      break
    case 3:
      text = 'Fair'
      color = 'bg-yellow-500'
      break
    case 4:
      text = 'Strong'
      color = 'bg-green-500'
      break
    case 5:
      text = 'Very strong'
      color = 'bg-green-600'
      break
  }

  return { score: Math.min(score, 4), text, color }
})

const handleResetPassword = async () => {
  if (!isFormValid.value) {
    toast.add({
      title: 'Validation Error',
      description: 'Please ensure passwords match and meet requirements',
      color: 'error'
    })
    return
  }

  if (!token.value) {
    error.value = 'Invalid reset token'
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await api.post('/api/auth/reset-password', {
      token: token.value,
      password: password.value,
      password_confirmation: confirmPassword.value
    })

    if (response.success) {
      resetComplete.value = true
      toast.add({
        title: 'Success',
        description: 'Password has been reset successfully',
        color: 'success'
      })
    } else {
      error.value = 'error' in response ? response.error : 'Failed to reset password'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to reset password'
  } finally {
    loading.value = false
  }
}
</script>