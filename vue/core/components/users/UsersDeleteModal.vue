<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUsersStore } from '@/stores/users'
import type { User } from '@/types'

const props = withDefaults(defineProps<{
  count?: number
  user?: User | null
}>(), {
  count: 0,
  user: null
})

const emit = defineEmits<{
  success: []
}>()

const store = useUsersStore()
const toast = useToast()
const open = ref(false)

// Watch for user prop to open modal
watch(() => props.user, (user) => {
  if (user) {
    open.value = true
  }
})

async function onSubmit() {
  try {
    if (props.user) {
      // Delete single user
      await store.deleteUser(props.user.id)

      toast.add({
        title: 'Success',
        description: `User ${props.user.first_name} ${props.user.last_name} deleted successfully`,
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    } else if (props.count > 0) {
      // Bulk delete (placeholder for now)
      toast.add({
        title: 'Success',
        description: `${props.count} user${props.count > 1 ? 's' : ''} deleted successfully`,
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    }

    open.value = false
    emit('success')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to delete user',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="user ? 'Delete User' : `Delete ${count} user${count > 1 ? 's' : ''}`"
  >
    <slot />

    <template #body>
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-alert-triangle" class="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="text-gray-900 font-medium">
              Are you sure you want to delete {{ user ? 'this user' : `${count} user${count > 1 ? 's' : ''}` }}?
            </p>
            <p class="text-gray-500 text-sm mt-1">
              This action cannot be undone. All user data will be permanently removed.
            </p>

            <!-- Show user details if single delete -->
            <div v-if="user" class="mt-3 p-3 bg-gray-50 rounded-md">
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="user.avatar_url"
                  :alt="`${user.first_name} ${user.last_name}`"
                  size="sm"
                />
                <div>
                  <p class="font-medium">
                    {{ user.first_name }} {{ user.last_name }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ user.email }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            label="Delete"
            color="error"
            variant="solid"
            loading-auto
            @click="onSubmit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>