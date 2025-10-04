<template>
  <USlideover v-if="isOpen" v-model="isOpen">
    <UCard class="flex flex-col flex-1">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Notifications
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            class="-my-1"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="flex-1 space-y-4">
        <!-- Empty state -->
        <div v-if="notifications.length === 0" class="text-center py-8">
          <UIcon name="i-lucide-bell" class="h-8 w-8 mx-auto text-gray-400 mb-4" />
          <p class="text-gray-500">
            No notifications yet
          </p>
        </div>

        <!-- Notifications list -->
        <div v-else class="space-y-3">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
            :class="{
              'bg-blue-50 dark:bg-blue-900/20': !notification.read,
              'bg-gray-50 dark:bg-gray-800': notification.read
            }"
          >
            <div class="flex items-start gap-3">
              <UIcon
                :name="getNotificationIcon(notification.type)"
                :class="getNotificationColor(notification.type)"
                class="h-5 w-5 mt-0.5"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ notification.title }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {{ formatTime(notification.created_at) }}
                </p>
              </div>
              <UButton
                v-if="!notification.read"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="markAsRead(notification.id)"
              >
                Mark read
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <UButton
            v-if="notifications.some(n => !n.read)"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="markAllAsRead"
          >
            Mark all as read
          </UButton>
          <UButton
            color="primary"
            variant="ghost"
            size="sm"
            to="/notifications"
            @click="isOpen = false"
          >
            View all
          </UButton>
        </div>
      </template>
    </UCard>
  </USlideover>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  created_at: string
}

const isOpen = ref(false)
const notifications = ref<Notification[]>([
  {
    id: '1',
    type: 'info',
    title: 'Welcome to Construct',
    message: 'Your dashboard is ready to use',
    read: false,
    created_at: new Date().toISOString()
  }
])

const getNotificationIcon = (type: string) => {
  const icons = {
    info: 'i-lucide-info',
    success: 'i-lucide-check-circle',
    warning: 'i-lucide-alert-triangle',
    error: 'i-lucide-alert-circle'
  }
  return icons[type as keyof typeof icons] || 'i-lucide-bell'
}

const getNotificationColor = (type: string) => {
  const colors = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  }
  return colors[type as keyof typeof colors] || 'text-gray-500'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const markAsRead = (id: string) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

// Expose methods to parent components
defineExpose({
  open: () => { isOpen.value = true },
  close: () => { isOpen.value = false }
})
</script>