<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Reset your password</h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <UCard class="mt-8">
        <UForm :state="form" :schema="schema" @submit="handleForgotPassword">
          <div class="space-y-4">
            <UFormField label="Email" name="email" required>
              <UInput
                v-model="form.email"
                type="email"
                placeholder="Enter your email address"
                icon="i-heroicons-envelope"
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
              :disabled="!form.email"
            >
              Send Reset Link
            </UButton>
          </div>
        </UForm>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Remember your password?
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

const router = useRouter()

// Form state
const form = reactive({
  email: ''
})

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Validation schema
const schema = z.object({
  email: z.string().email('Valid email is required')
})

// Handle forgot password
const handleForgotPassword = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    // TODO: Implement forgot password API call
    // const response = await apiClient.forgotPassword({ email: form.email })

    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000))

    success.value = 'Password reset link has been sent to your email address'

    // Clear form
    form.email = ''

  } catch (err: any) {
    error.value = err.message || 'Failed to send reset link'
  } finally {
    loading.value = false
  }
}

// Clear messages when component mounts
onMounted(() => {
  error.value = null
  success.value = null
})
</script>