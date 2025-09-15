<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <UAvatar
            :text="user?.first_name?.charAt(0) || 'U'"
            size="sm"
            color="primary"
          />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p class="text-gray-600">Hello {{ user?.first_name || 'User' }}</p>
          </div>
        </div>
      </template>

      <p class="text-gray-600">
        Welcome to your dashboard. This page requires authentication.
      </p>
    </UCard>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UAvatar
              icon="i-heroicons-users"
              size="sm"
              color="blue"
              variant="soft"
            />
            <h3 class="text-lg font-medium">Total Users</h3>
          </div>
        </template>

        <div class="text-3xl font-bold text-blue-600">1,234</div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UAvatar
              icon="i-heroicons-currency-dollar"
              size="sm"
              color="green"
              variant="soft"
            />
            <h3 class="text-lg font-medium">Revenue</h3>
          </div>
        </template>

        <div class="text-3xl font-bold text-green-600">$12,345</div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UAvatar
              icon="i-heroicons-shopping-bag"
              size="sm"
              color="purple"
              variant="soft"
            />
            <h3 class="text-lg font-medium">Orders</h3>
          </div>
        </template>

        <div class="text-3xl font-bold text-purple-600">567</div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/core/composables';
import { layout } from '@/core/utils/page-meta';

// Using admin layout - automatically applies ['auth', 'admin'] middleware via convention
layout({"use": "admin"})

// Auto-imported composables work here
const { user } = useAuth()

console.log('Dashboard loaded for user:', user.value?.first_name)
</script>