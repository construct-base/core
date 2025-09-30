<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useUsersStore } from '@/stores/users'
import { useRolesStore } from '@/stores/roles'
import type { User } from '@/types'

const props = defineProps<{
  user?: User | null
}>()

const emit = defineEmits<{
  success: []
}>()

const store = useUsersStore()
const rolesStore = useRolesStore()
const toast = useToast()

const open = ref(false)
const isEditing = computed(() => !!props.user)

// Validation schema
const schema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  confirm_password: z.string().optional().or(z.literal('')),
  role_id: z.number().optional()
}).refine((data) => {
  // Only validate password confirmation when creating new user (password is provided)
  if (data.password && data.password.length > 0) {
    return data.password === data.confirm_password
  }
  return true
}, {
  message: "Passwords don't match",
  path: ["confirm_password"]
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  first_name: undefined,
  last_name: undefined,
  username: undefined,
  email: undefined,
  phone: undefined,
  password: undefined,
  confirm_password: undefined,
  role_id: undefined
})

// Watch for prop changes to populate form when editing
watch(() => props.user, (user) => {
  if (user) {
    state.first_name = user.first_name
    state.last_name = user.last_name
    state.username = user.username
    state.email = user.email
    state.phone = user.phone
    state.password = ''
    state.role_id = user.role_id
    open.value = true
  }
}, { immediate: true })

// Watch open state to reset form when closed
watch(open, (isOpen) => {
  if (!isOpen && !props.user) {
    resetForm()
  }
})

function resetForm() {
  state.first_name = undefined
  state.last_name = undefined
  state.username = undefined
  state.email = undefined
  state.phone = undefined
  state.password = undefined
  state.confirm_password = undefined
  state.role_id = undefined
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    if (isEditing.value && props.user) {
      // Update existing user
      await store.updateUser(props.user.id, {
        first_name: event.data.first_name,
        last_name: event.data.last_name,
        username: event.data.username,
        email: event.data.email,
        phone: event.data.phone,
        role_id: event.data.role_id
      })

      toast.add({
        title: 'Success',
        description: `User ${event.data.first_name} ${event.data.last_name} updated successfully`,
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    } else {
      // Create new user
      await store.createUser({
        first_name: event.data.first_name!,
        last_name: event.data.last_name!,
        username: event.data.username!,
        email: event.data.email!,
        phone: event.data.phone || '',
        password: event.data.password || '',
        role_id: event.data.role_id
      })

      toast.add({
        title: 'Success',
        description: `New user ${event.data.first_name} ${event.data.last_name} added successfully`,
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
      description: error instanceof Error ? error.message : 'Failed to save user',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEditing ? 'Edit User' : 'New User'"
    :description="isEditing ? 'Update user information' : 'Add a new user to the system'"
  >
    <UButton
      v-if="!user"
      label="New user"
      icon="i-lucide-plus"
    />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="First Name" placeholder="John" name="first_name" required>
            <UInput v-model="state.first_name" class="w-full" />
          </UFormField>

          <UFormField label="Last Name" placeholder="Doe" name="last_name" required>
            <UInput v-model="state.last_name" class="w-full" />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Username" placeholder="johndoe" name="username" required>
            <UInput v-model="state.username" class="w-full" />
          </UFormField>
          <UFormField label="Email" placeholder="john.doe@example.com" name="email" required>
            <UInput v-model="state.email" type="email" class="w-full" />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-4">

        <UFormField label="Phone" placeholder="+1 (555) 123-4567" name="phone">
          <UInput v-model="state.phone" class="w-full" />
        </UFormField>

        <UFormField label="Role" name="role_id">
          <USelect
            v-model="state.role_id"
            :items="rolesStore.roleOptions"
            placeholder="Select role"
            class="w-full"
          />
        </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-4"> 
        <UFormField
          v-if="!isEditing"
          label="Password"
          placeholder="Enter password"
          name="password"
          required
          
        >
          <UInput v-model="state.password" type="password" class="w-full"/>
        </UFormField>
        <UFormField
          v-if="!isEditing"
          label="Confirm Password"
          placeholder="Confirm password"
          name="confirm_password"
          required
          
        >
          <UInput v-model="state.confirm_password" type="password" class="w-full"/>
        </UFormField> 
      </div>

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