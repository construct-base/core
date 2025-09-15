<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Set new password</h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <UCard class="mt-8">
        <UForm :state="form" :schema="schema" @submit="handleResetPassword">
          <div class="space-y-4">
            <UFormField label="New Password" name="password" required>
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Enter your new password"
                icon="i-heroicons-lock-closed"
              />
            </UFormField>

            <UFormField label="Confirm Password" name="confirmPassword" required>
              <UInput
                v-model="form.confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                icon="i-heroicons-lock-closed"
              />
            </UFormField>

            <UAlert
              v-if="error"
              color="red"
              variant="soft"
              :description="error"
              :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
              @close="error = null"
            />

            <UAlert
              v-if="success"
              color="green"
              variant="soft"
              :description="success"
            />

            <UButton
              type="submit"
              block
              size="lg"
              :loading="loading"
              :disabled="!isFormValid"
            >
              Update Password
            </UButton>
          </div>
        </UForm>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            <UButton variant="link" to="/auth/login" class="p-0">
              Back to Sign in
            </UButton>
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

// Page metadata
layout({ use: 'auth', middleware: ['guest'] })

const route = useRoute()
const router = useRouter()

// Get token from query parameters
const token = route.query.token as string

// Form state
const form = reactive({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Validation schema
const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Form validation
const isFormValid = computed(() => {
  return form.password && form.confirmPassword && form.password === form.confirmPassword
})

// Handle reset password
const handleResetPassword = async () => {
  if (!token) {
    error.value = 'Invalid reset token'
    return
  }

  loading.value = true
  error.value = null
  success.value = null

  try {
    // TODO: Implement reset password API call
    // const response = await apiClient.resetPassword({
    //   token,
    //   password: form.password
    // })

    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000))

    success.value = 'Password has been updated successfully'

    // Redirect to login after success
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)

  } catch (err: any) {
    error.value = err.message || 'Failed to reset password'
  } finally {
    loading.value = false
  }
}

// Check for token on mount
onMounted(() => {
  if (!token) {
    error.value = 'Invalid or missing reset token'
  }
})
</script>