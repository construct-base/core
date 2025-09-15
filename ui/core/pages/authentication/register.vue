<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Join Construct today
        </p>
      </div>

      <UCard class="mt-8">
        <UForm :state="form" :schema="schema" @submit="handleRegister">
          <div class="space-y-4">
            <UFormGroup label="First Name" name="first_name" required>
              <UInput
                v-model="form.first_name"
                placeholder="Enter your first name"
                icon="i-heroicons-user"
              />
            </UFormGroup>

            <UFormGroup label="Last Name" name="last_name" required>
              <UInput
                v-model="form.last_name"
                placeholder="Enter your last name"
                icon="i-heroicons-user"
              />
            </UFormGroup>

            <UFormGroup label="Username" name="username" required>
              <UInput
                v-model="form.username"
                placeholder="Choose a username"
                icon="i-heroicons-at-symbol"
              />
            </UFormGroup>

            <UFormGroup label="Email" name="email" required>
              <UInput
                v-model="form.email"
                type="email"
                placeholder="Enter your email"
                icon="i-heroicons-envelope"
              />
            </UFormGroup>

            <UFormGroup label="Phone" name="phone">
              <UInput
                v-model="form.phone"
                placeholder="Enter your phone number"
                icon="i-heroicons-phone"
              />
            </UFormGroup>

            <UFormGroup label="Password" name="password" required>
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Create a password"
                icon="i-heroicons-lock-closed"
              />
            </UFormGroup>

            <UAlert
              v-if="authStore.error"
              color="red"
              variant="soft"
              :description="authStore.error"
              :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
              @close="authStore.clearError"
            />

            <UButton
              type="submit"
              block
              size="lg"
              :loading="authStore.loading"
              :disabled="!isFormValid"
            >
              Create Account
            </UButton>
          </div>
        </UForm>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <UButton variant="link" to="/core/authentication/login" class="p-0">
              Sign in
            </UButton>
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useAuthStore } from '@core/stores/auth'

// Page metadata
layout({ use: 'auth', middleware: ['guest'] })

const authStore = useAuthStore()
const router = useRouter()

// Form state
const form = reactive({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  phone: '',
  password: ''
})

// Validation schema
const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Form validation
const isFormValid = computed(() => {
  return form.first_name && form.last_name && form.username && form.email && form.password
})

// Handle registration
const handleRegister = async () => {
  const success = await authStore.register({
    first_name: form.first_name,
    last_name: form.last_name,
    username: form.username,
    email: form.email,
    phone: form.phone,
    password: form.password
  })

  if (success) {
    // Redirect to dashboard
    await router.push('/dashboard')
  }
}

// Clear any existing errors when component mounts
onMounted(() => {
  authStore.clearError()
})
</script>