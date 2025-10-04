<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useRolesStore } from '@/stores/roles'
import type { Role } from '@/types'

const props = defineProps<{
  role?: Role | null
}>()

const emit = defineEmits<{
  success: []
}>()

const store = useRolesStore()
const toast = useToast()

const open = ref(false)
const isEditing = computed(() => !!props.role)

// Validation schema
const schema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: undefined,
  description: undefined
})

// Watch for prop changes to populate form when editing
watch(() => props.role, (role) => {
  if (role) {
    state.name = role.name
    state.description = role.description
    open.value = true
  }
}, { immediate: true })

// Watch open state to reset form when closed
watch(open, (isOpen) => {
  if (!isOpen && !props.role) {
    resetForm()
  }
})

function resetForm() {
  state.name = undefined
  state.description = undefined
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    if (isEditing.value && props.role) {
      // Update existing role
      await store.updateRole(props.role.id, {
        name: event.data.name!,
        description: event.data.description
      })

      toast.add({
        title: 'Success',
        description: `Role ${event.data.name} updated successfully`,
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    } else {
      // Create new role
      await store.createRole({
        name: event.data.name!,
        description: event.data.description
      })

      toast.add({
        title: 'Success',
        description: `New role ${event.data.name} created successfully`,
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    }

    open.value = false
    emit('success')
    resetForm()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to save role',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEditing ? 'Edit Role' : 'New Role'"
    :description="isEditing ? 'Update role information' : 'Add a new role to the system'"
  >
    <UButton
      v-if="!role"
      label="New role"
      icon="i-lucide-plus"
    />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Role Name" placeholder="Administrator" name="name" required>
          <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField label="Description" placeholder="Role description (optional)" name="description">
          <UTextarea v-model="state.description" class="w-full" :rows="3" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            :label="isEditing ? 'Update' : 'Create'"
            color="primary"
            variant="solid"
            type="submit"
            loading-auto
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>