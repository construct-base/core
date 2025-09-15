<template>
  <UApp>
    <div id="admin-app" class="min-h-screen bg-slate-50 dark:bg-slate-900">
      <!-- Admin Header -->
      <AppHeader
        :sticky="true"
        :border="true"
        class="bg-white dark:bg-slate-800 shadow-sm"
      >
        <template #logo>
          <router-link to="/admin" class="flex items-center space-x-2">
            <UIcon name="i-heroicons-cog-6-tooth" class="text-xl text-primary-600" />
            <span class="text-xl font-bold text-slate-900 dark:text-white">
              Admin Panel
            </span>
          </router-link>
        </template>

        <template #nav>
          <router-link
            to="/admin/dashboard"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            Dashboard
          </router-link>
          <router-link
            to="/admin/users"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            Users
          </router-link>
          <router-link
            to="/admin/settings"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            Settings
          </router-link>
          <router-link
            to="/"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
          >
            ← Back to Site
          </router-link>
        </template>

        <template #actions>
          <!-- User Menu -->
          <UDropdown
            :items="userMenuItems"
            :popper="{ placement: 'bottom-end' }"
          >
            <UButton
              variant="ghost"
              color="neutral"
              :ui="{ rounded: 'rounded-full' }"
              class="p-1"
            >
              <UAvatar
                :src="user?.avatar_url"
                :alt="user?.first_name"
                size="sm"
              />
            </UButton>
          </UDropdown>

          <UColorModeButton />
        </template>
      </AppHeader>

      <!-- Admin Sidebar -->
      <div class="flex">
        <aside class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-screen">
          <nav class="p-4 space-y-2">
            <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Administration
            </div>

            <router-link
              to="/admin/dashboard"
              class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <UIcon name="i-heroicons-chart-bar" />
              <span>Dashboard</span>
            </router-link>

            <router-link
              to="/admin/users"
              class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <UIcon name="i-heroicons-users" />
              <span>Users</span>
            </router-link>

            <router-link
              to="/admin/roles"
              class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <UIcon name="i-heroicons-shield-check" />
              <span>Roles & Permissions</span>
            </router-link>

            <router-link
              to="/admin/settings"
              class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <UIcon name="i-heroicons-cog-6-tooth" />
              <span>Settings</span>
            </router-link>

            <div class="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                System
              </div>

              <router-link
                to="/admin/logs"
                class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <UIcon name="i-heroicons-document-text" />
                <span>Logs</span>
              </router-link>

              <a
                href="http://localhost:8001/docs"
                target="_blank"
                class="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <UIcon name="i-heroicons-code-bracket" />
                <span>API Docs</span>
                <UIcon name="i-heroicons-arrow-top-right-on-square" class="text-xs ml-auto" />
              </a>
            </div>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-6">
          <slot />
        </main>
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@/core/composables';
const { user, logout } = useAuth()

// User menu items
const userMenuItems = [
  [{
    label: user.value?.email || 'Admin',
    slot: 'account',
    disabled: true
  }],
  [{
    label: 'Profile',
    icon: 'i-heroicons-user',
    to: '/profile'
  }, {
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/settings'
  }],
  [{
    label: 'Sign out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: logout
  }]
]

onMounted(() => {
  console.log('🛡️ Admin Panel Ready!')
})
</script>

 