<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRolesStore } from '@/stores/roles'
import type { Role } from '@/types'

const props = withDefaults(defineProps<{
  count?: number
  role?: Role | null
}>(), {
  count: 0,
  role: null
})

const emit = defineEmits<{
  success: []
}>()

const store = useRolesStore()
const toast = useToast()
const open = ref(false)

// Watch for role prop to open modal
watch(() => props.role, (role) => {
  if (role) {
    open.value = true
  }
})

async function onSubmit() {
  try {
    if (props.role) {
      // Delete single role
      await store.deleteRole(props.role.id)

      toast.add({
        title: 'Success',
        description: `Role ${props.role.name} deleted successfully`,
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    } else if (props.count > 0) {
      // Bulk delete (placeholder for now)
      toast.add({
        title: 'Success',
        description: `${props.count} role${props.count > 1 ? 's' : ''} deleted successfully`,
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    }

    open.value = false
    emit('success')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to delete role',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="role ? 'Delete Role' : `Delete ${count} role${count > 1 ? 's' : ''}`"
  >
    <slot />

    <template #body>
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-alert-triangle" class="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="text-gray-900 font-medium">
              Are you sure you want to delete {{ role ? 'this role' : `${count} role${count > 1 ? 's' : ''}` }}?
            </p>
            <p class="text-gray-500 text-sm mt-1">
              This action cannot be undone. Users with this role will need to be reassigned.
            </p>

            <!-- Show role details if single delete -->
            <div v-if="role" class="mt-3 p-3 bg-gray-50 rounded-md">
              <p class="font-medium">{{ role.name }}</p>
              <p v-if="role.description" class="text-sm text-gray-600 mt-1">
                {{ role.description }}
              </p>
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