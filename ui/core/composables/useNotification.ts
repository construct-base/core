import { ref, reactive } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: Array<{
    label: string
    action: () => void
    style?: 'primary' | 'secondary'
  }>
}

// Global notifications state
const notifications = ref<Notification[]>([])
let notificationId = 0

export function useNotification() {
  const add = (notification: Omit<Notification, 'id'>): string => {
    const id = `notification-${++notificationId}`
    const newNotification: Notification = {
      id,
      duration: 5000, // 5 seconds default
      ...notification
    }

    notifications.value.push(newNotification)

    // Auto-remove after duration (unless persistent)
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        remove(id)
      }, newNotification.duration)
    }

    return id
  }

  const remove = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clear = (): void => {
    notifications.value = []
  }

  // Convenience methods
  const success = (title: string, message?: string, options?: Partial<Notification>): string => {
    return add({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const error = (title: string, message?: string, options?: Partial<Notification>): string => {
    return add({
      type: 'error',
      title,
      message,
      duration: 0, // Don't auto-hide errors by default
      ...options
    })
  }

  const warning = (title: string, message?: string, options?: Partial<Notification>): string => {
    return add({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const info = (title: string, message?: string, options?: Partial<Notification>): string => {
    return add({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  // API response helpers
  const handleApiSuccess = (response: any, defaultMessage = 'Operation completed successfully'): string => {
    return success(
      'Success',
      response?.message || defaultMessage
    )
  }

  const handleApiError = (error: any, defaultMessage = 'An error occurred'): string => {
    const message = error?.message || error?.details?.message || defaultMessage
    return error(
      'Error',
      message
    )
  }

  return {
    // State
    notifications: readonly(notifications),

    // Actions
    add,
    remove,
    clear,

    // Convenience methods
    success,
    error,
    warning,
    info,

    // API helpers
    handleApiSuccess,
    handleApiError
  }
}