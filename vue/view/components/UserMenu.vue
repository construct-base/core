<template>
  <UDropdownMenu
    :items="items"
    :popper="{ placement: collapsed ? 'right-start' : 'top-start' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      class="w-full"
      :class="[collapsed ? 'justify-center' : 'justify-start']"
    >
      <UAvatar
        :src="user?.avatar_url"
        :alt="userDisplayName"
        size="sm"
      />

      <div v-if="!collapsed" class="flex flex-col items-start min-w-0 flex-1 ms-3">
        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
          {{ userDisplayName }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
          {{ user?.email }}
        </p>
      </div>

      <UIcon
        v-if="!collapsed"
        name="i-lucide-chevron-up"
        class="h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
      />
    </UButton>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

interface Props {
  collapsed?: boolean
}

withDefaults(defineProps<Props>(), {
  collapsed: false
})

const { user, logout } = useAuth()
const router = useRouter()
const toast = useToast()

const userDisplayName = computed(() => {
  if (!user.value) return 'Guest'
  return `${user.value.first_name} ${user.value.last_name}`.trim() || user.value.username
})

const handleLogout = async () => {
  try {
    await logout()
    toast.add({
      title: 'Logged out',
      description: 'You have been successfully logged out',
      color: 'success'
    })
    router.push('/login')
  } catch {
    toast.add({
      title: 'Error',
      description: 'Failed to logout',
      color: 'error'
    })
  }
}

const items = computed(() => [
  [{
    label: 'Profile',
    icon: 'i-lucide-user',
    click: () => {
      // Navigate to profile page
      router.push('/profile')
    }
  }, {
    label: 'Settings',
    icon: 'i-lucide-settings',
    click: () => {
      router.push('/settings')
    }
  }], [{
    label: 'Sign out',
    icon: 'i-lucide-log-out',
    click: handleLogout
  }]
])
</script>