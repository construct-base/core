<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <UIcon name="i-heroicons-lock-closed" class="text-6xl text-primary" />
        </div>
        <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign in to your Construct account
        </p>
      </div>

      <UCard class="shadow-xl">
        <template #header>
          <div class="text-center">
            <h3 class="text-lg font-semibold">Sign In</h3>
          </div>
        </template>

        <UForm :state="form" :schema="schema" @submit="handleLogin" class="space-y-6">
          <UFormGroup label="Username" name="username" required>
            <UInput
              v-model="form.username"
              placeholder="Enter your username"
              icon="i-heroicons-user"
              size="lg"
              color="primary"
              variant="outline"
            />
          </UFormGroup>

          <UFormGroup label="Password" name="password" required>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
              icon="i-heroicons-lock-closed"
              size="lg"
              color="primary"
              variant="outline"
            />
          </UFormGroup>

          <div class="flex items-center justify-between">
            <UCheckbox
              v-model="rememberMe"
              label="Remember me"
              color="primary"
            />
            <UButton
              variant="link"
              to="/authentication/forgot-password"
              class="text-sm"
              :padded="false"
            >
              Forgot password?
            </UButton>
          </div>

          <UAlert
            v-if="authStore.error"
            color="red"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            :description="authStore.error"
            :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
            @close="authStore.clearError"
          />

          <UButton
            type="submit"
            block
            size="lg"
            color="primary"
            :loading="authStore.loading"
            :disabled="!form.username || !form.password"
            icon="i-heroicons-arrow-right"
            trailing
          >
            <span v-if="!authStore.loading">Sign in</span>
            <span v-else>Signing in...</span>
          </UButton>
        </UForm>

        <template #footer>
          <div class="text-center">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?
              <UButton variant="link" to="/authentication/register" :padded="false" class="font-semibold">
                Create one now
              </UButton>
            </p>
          </div>
        </template>
      </UCard>

      <div class="text-center">
        <UAlert
          color="primary"
          variant="soft"
          icon="i-heroicons-information-circle"
          title="Demo Credentials"
          description="Use any username/password combination to test the authentication flow"
        />
      </div>
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
  username: '',
  password: ''
})

const rememberMe = ref(false)

// Validation schema
const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

// Handle login
const handleLogin = async () => {
  const success = await authStore.login({
    username: form.username,
    password: form.password
  })

  if (success) {
    // Redirect to dashboard or intended page
    const redirect = router.currentRoute.value.query.redirect as string
    await router.push(redirect || '/dashboard')
  }
}

// Clear any existing errors when component mounts
onMounted(() => {
  authStore.clearError()
})
</script>