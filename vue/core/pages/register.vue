<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Join Construct and start managing your projects
        </p>
      </div>

      <UCard>
        <form class="space-y-6" @submit.prevent="handleRegister">
          <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div class="flex">
              <UIcon name="i-lucide-alert-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-400">
                  Registration Error
                </h3>
                <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="First Name" required>
              <UInput
                v-model="form.first_name"
                type="text"
                placeholder="First name"
                autocomplete="given-name"
                required
                :disabled="loading"
              />
            </UFormField>

            <UFormField label="Last Name" required>
              <UInput
                v-model="form.last_name"
                type="text"
                placeholder="Last name"
                autocomplete="family-name"
                required
                :disabled="loading"
              />
            </UFormField>
          </div>

          <UFormField label="Username" required>
            <UInput
              v-model="form.username"
              type="text"
              placeholder="Choose a username"
              autocomplete="username"
              required
              :disabled="loading"
            />
          </UFormField>

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

          <UFormField label="Phone number">
            <UInput
              v-model="form.phone"
              type="tel"
              placeholder="Enter your phone number"
              autocomplete="tel"
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Password" required>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Create a strong password"
              autocomplete="new-password"
              required
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Confirm Password" required>
            <UInput
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              autocomplete="new-password"
              required
              :disabled="loading"
            />
          </UFormField>

          <div class="flex items-center">
            <UCheckbox
              v-model="agreeToTerms"
              label="I agree to the terms and conditions"
              :disabled="loading"
              required
            />
          </div>

          <UButton
            type="submit"
            block
            :loading="loading"
            :disabled="!isFormValid"
          >
            Create Account
          </UButton>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Already have an account?
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
              Sign in instead
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuth } from '~/core/composables/useAuth'
import { useRouter } from 'vue-router'

const { register, error, loading, isAuthenticated } = useAuth()
const router = useRouter()

// Simple toast implementation (replace with your preferred toast library)
const toast = {
  add: (options: { title: string; description: string; color: string }) => {
    console.log(`${options.color.toUpperCase()}: ${options.title} - ${options.description}`)
    // You can replace this with a proper toast library like vue-toastification
  }
}

// Redirect if already authenticated
if (isAuthenticated.value) {
  router.push('/')
}

const form = reactive({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  phone: '',
  password: ''
})

const confirmPassword = ref('')
const agreeToTerms = ref(false)

const isFormValid = computed(() => {
  return (
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.username.trim() &&
    form.email.trim() &&
    form.password.trim() &&
    confirmPassword.value.trim() &&
    form.password === confirmPassword.value &&
    agreeToTerms.value
  )
})

const handleRegister = async () => {
  if (!isFormValid.value) {
    toast.add({
      title: 'Validation Error',
      description: 'Please fill in all required fields correctly',
      color: 'error'
    })
    return
  }

  if (form.password !== confirmPassword.value) {
    toast.add({
      title: 'Password Mismatch',
      description: 'Passwords do not match',
      color: 'error'
    })
    return
  }

  try {
    const success = await register(form)

    if (success) {
      toast.add({
        title: 'Welcome!',
        description: 'Account created successfully',
        color: 'success'
      })
      router.push('/')
    }
    // Error is handled by the auth composable and displayed in the form
  } catch {
    toast.add({
      title: 'Registration failed',
      description: 'An unexpected error occurred',
      color: 'error'
    })
  }
}
</script>