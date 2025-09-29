<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { UserUpdateRequest, UserUpdatePasswordRequest } from '@/types'
import { apiClient } from '@/api/client'
import { isSuccessResponse, isErrorResponse } from '@/types'

definePageMeta({
  title: 'Profile Settings'
})

const { user, isAuthenticated } = useAuth()
const toast = useToast()

// Form states
const profileForm = ref<UserUpdateRequest>({
  first_name: '',
  last_name: '',
  username: '',
  phone: '',
  email: ''
})

const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const profileLoading = ref(false)
const passwordLoading = ref(false)
const uploadingAvatar = ref(false)

// Validation states
const profileErrors = ref<Record<string, string>>({})
const passwordErrors = ref<Record<string, string>>({})

// Initialize form with user data
onMounted(() => {
  if (user.value) {
    profileForm.value = {
      first_name: user.value.first_name || '',
      last_name: user.value.last_name || '',
      username: user.value.username || '',
      phone: user.value.phone || '',
      email: user.value.email || ''
    }
  }
})

// Computed properties
const fullName = computed(() => {
  if (!user.value) return ''
  return `${user.value.first_name} ${user.value.last_name}`.trim()
})

const hasProfileChanges = computed(() => {
  if (!user.value) return false
  return (
    profileForm.value.first_name !== user.value.first_name ||
    profileForm.value.last_name !== user.value.last_name ||
    profileForm.value.username !== user.value.username ||
    profileForm.value.phone !== user.value.phone ||
    profileForm.value.email !== user.value.email
  )
})

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.current_password &&
    passwordForm.value.new_password &&
    passwordForm.value.confirm_password &&
    passwordForm.value.new_password === passwordForm.value.confirm_password &&
    passwordForm.value.new_password.length >= 8
  )
})

// Form validation
const validateProfileForm = () => {
  profileErrors.value = {}

  if (!profileForm.value.first_name?.trim()) {
    profileErrors.value.first_name = 'First name is required'
  }

  if (!profileForm.value.last_name?.trim()) {
    profileErrors.value.last_name = 'Last name is required'
  }

  if (!profileForm.value.username?.trim()) {
    profileErrors.value.username = 'Username is required'
  } else if (profileForm.value.username.length < 3) {
    profileErrors.value.username = 'Username must be at least 3 characters'
  }

  if (!profileForm.value.email?.trim()) {
    profileErrors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
    profileErrors.value.email = 'Please enter a valid email address'
  }

  return Object.keys(profileErrors.value).length === 0
}

const validatePasswordForm = () => {
  passwordErrors.value = {}

  if (!passwordForm.value.current_password) {
    passwordErrors.value.current_password = 'Current password is required'
  }

  if (!passwordForm.value.new_password) {
    passwordErrors.value.new_password = 'New password is required'
  } else if (passwordForm.value.new_password.length < 8) {
    passwordErrors.value.new_password = 'Password must be at least 8 characters'
  }

  if (!passwordForm.value.confirm_password) {
    passwordErrors.value.confirm_password = 'Please confirm your password'
  } else if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    passwordErrors.value.confirm_password = 'Passwords do not match'
  }

  return Object.keys(passwordErrors.value).length === 0
}

// Form handlers
const updateProfile = async () => {
  if (!validateProfileForm() || !user.value) return

  profileLoading.value = true

  try {
    const response = await apiClient.updateUser(user.value.id, profileForm.value)

    if (isSuccessResponse(response) && response.data) {
      // Update the user data in auth store
      Object.assign(user.value, response.data)

      toast.add({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        icon: 'i-lucide-check-circle',
        color: 'green'
      })
    } else {
      const errorMessage = isErrorResponse(response) ? response.error : 'Failed to update profile'
      toast.add({
        title: 'Update Failed',
        description: errorMessage,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
    }
  } catch (error) {
    console.error('Profile update error:', error)
    toast.add({
      title: 'Update Failed',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  } finally {
    profileLoading.value = false
  }
}

const updatePassword = async () => {
  if (!validatePasswordForm() || !user.value) return

  passwordLoading.value = true

  try {
    const response = await apiClient.updateUserPassword(user.value.id, {
      password: passwordForm.value.new_password
    })

    if (isSuccessResponse(response)) {
      // Clear form
      passwordForm.value = {
        current_password: '',
        new_password: '',
        confirm_password: ''
      }

      toast.add({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
        icon: 'i-lucide-check-circle',
        color: 'green'
      })
    } else {
      const errorMessage = isErrorResponse(response) ? response.error : 'Failed to update password'
      toast.add({
        title: 'Update Failed',
        description: errorMessage,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
    }
  } catch (error) {
    console.error('Password update error:', error)
    toast.add({
      title: 'Update Failed',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  } finally {
    passwordLoading.value = false
  }
}

const handleAvatarUpload = async (files: FileList | null) => {
  if (!files || files.length === 0 || !user.value) return

  const file = files[0]

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Invalid File',
      description: 'Please select an image file.',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      title: 'File Too Large',
      description: 'Please select an image smaller than 5MB.',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
    return
  }

  uploadingAvatar.value = true

  try {
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await apiClient.uploadUserAvatar(user.value.id, formData)

    if (isSuccessResponse(response) && response.data) {
      // Update user avatar
      if (user.value) {
        user.value.avatar = response.data.avatar
        user.value.avatar_url = response.data.avatar_url
      }

      toast.add({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated.',
        icon: 'i-lucide-check-circle',
        color: 'green'
      })
    } else {
      const errorMessage = isErrorResponse(response) ? response.error : 'Failed to upload avatar'
      toast.add({
        title: 'Upload Failed',
        description: errorMessage,
        icon: 'i-lucide-alert-circle',
        color: 'red'
      })
    }
  } catch (error) {
    console.error('Avatar upload error:', error)
    toast.add({
      title: 'Upload Failed',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  } finally {
    uploadingAvatar.value = false
  }
}

// File input ref
const avatarInput = ref<HTMLInputElement>()

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}
</script>

<template>
  <UDashboardPage>
    <template #header>
      <UDashboardToolbar>
        <template #left>
          <UBreadcrumb
            :links="[
              { label: 'Settings', to: '/settings' },
              { label: 'Profile', to: '/settings/profile' }
            ]"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <div v-if="!isAuthenticated" class="flex items-center justify-center h-64">
      <UCard>
        <div class="text-center">
          <UIcon name="i-lucide-user-x" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Not Authenticated</h3>
          <p class="text-gray-600 mb-4">Please log in to view your profile.</p>
          <UButton to="/login">Go to Login</UButton>
        </div>
      </UCard>
    </div>

    <div v-else class="space-y-6">
      <!-- Profile Information -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-4">
            <div class="relative">
              <UAvatar
                :src="user?.avatar_url"
                :alt="fullName"
                size="lg"
                :ui="{ background: 'bg-gray-100' }"
              >
                <template #fallback>
                  <UIcon name="i-lucide-user" class="w-8 h-8 text-gray-400" />
                </template>
              </UAvatar>
              <UButton
                icon="i-lucide-camera"
                size="xs"
                color="white"
                variant="solid"
                class="absolute -bottom-1 -right-1 rounded-full"
                :loading="uploadingAvatar"
                @click="triggerAvatarUpload"
              />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ fullName }}</h2>
              <p class="text-gray-600">{{ user?.email }}</p>
              <UBadge v-if="user?.role_name" color="blue" variant="soft" class="mt-1">
                {{ user.role_name }}
              </UBadge>
            </div>
          </div>
        </template>

        <UForm :state="profileForm" @submit="updateProfile" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormGroup label="First Name" name="first_name" :error="profileErrors.first_name">
              <UInput
                v-model="profileForm.first_name"
                placeholder="Enter your first name"
                :disabled="profileLoading"
              />
            </UFormGroup>

            <UFormGroup label="Last Name" name="last_name" :error="profileErrors.last_name">
              <UInput
                v-model="profileForm.last_name"
                placeholder="Enter your last name"
                :disabled="profileLoading"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="Username" name="username" :error="profileErrors.username">
            <UInput
              v-model="profileForm.username"
              placeholder="Enter your username"
              :disabled="profileLoading"
            />
          </UFormGroup>

          <UFormGroup label="Email" name="email" :error="profileErrors.email">
            <UInput
              v-model="profileForm.email"
              type="email"
              placeholder="Enter your email"
              :disabled="profileLoading"
            />
          </UFormGroup>

          <UFormGroup label="Phone" name="phone">
            <UInput
              v-model="profileForm.phone"
              placeholder="Enter your phone number"
              :disabled="profileLoading"
            />
          </UFormGroup>

          <div class="flex justify-end">
            <UButton
              type="submit"
              :loading="profileLoading"
              :disabled="!hasProfileChanges"
            >
              Update Profile
            </UButton>
          </div>
        </UForm>

        <!-- Hidden file input for avatar upload -->
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarUpload(($event.target as HTMLInputElement).files)"
        >
      </UCard>

      <!-- Change Password -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900">Change Password</h3>
        </template>

        <UForm :state="passwordForm" @submit="updatePassword" class="space-y-4">
          <UFormGroup label="Current Password" name="current_password" :error="passwordErrors.current_password">
            <UInput
              v-model="passwordForm.current_password"
              type="password"
              placeholder="Enter your current password"
              :disabled="passwordLoading"
            />
          </UFormGroup>

          <UFormGroup label="New Password" name="new_password" :error="passwordErrors.new_password">
            <UInput
              v-model="passwordForm.new_password"
              type="password"
              placeholder="Enter your new password"
              :disabled="passwordLoading"
            />
          </UFormGroup>

          <UFormGroup label="Confirm New Password" name="confirm_password" :error="passwordErrors.confirm_password">
            <UInput
              v-model="passwordForm.confirm_password"
              type="password"
              placeholder="Confirm your new password"
              :disabled="passwordLoading"
            />
          </UFormGroup>

          <div class="flex justify-end">
            <UButton
              type="submit"
              :loading="passwordLoading"
              :disabled="!isPasswordFormValid"
              color="red"
            >
              Update Password
            </UButton>
          </div>
        </UForm>
      </UCard>

      <!-- Account Information -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900">Account Information</h3>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ULabel>Account Created</ULabel>
              <p class="text-gray-600 mt-1">{{ new Date(user?.created_at || '').toLocaleDateString() }}</p>
            </div>
            <div>
              <ULabel>Last Updated</ULabel>
              <p class="text-gray-600 mt-1">{{ new Date(user?.updated_at || '').toLocaleDateString() }}</p>
            </div>
          </div>
          <div v-if="user?.last_login">
            <ULabel>Last Login</ULabel>
            <p class="text-gray-600 mt-1">{{ new Date(user.last_login).toLocaleString() }}</p>
          </div>
        </div>
      </UCard>
    </div>
  </UDashboardPage>
</template>