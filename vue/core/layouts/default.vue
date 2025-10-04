<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useAuth } from '~/core/composables/useAuth'
import TeamsMenu from '~/core/components/TeamsMenu.vue'
import UserMenu from '~/core/components/UserMenu.vue'
import NotificationsSlideover from '~/core/components/NotificationsSlideover.vue'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const { isAuthenticated, initAuth } = useAuth()

const open = ref(false)

const links = [[{
  label: 'Dashboard',
  icon: 'i-lucide-house',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Posts',
  icon: 'i-lucide-newspaper',
  to: '/posts',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Users',
  to: '/users',
  icon: 'i-lucide-users',
  defaultOpen: false,
  type: 'trigger',
  children: [{
    label: 'Users',
    to: '/users',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Roles',
    to: '/roles',
    onSelect: () => {
      open.value = false
    }
  }]
}, {
  label: 'Media',
  icon: 'i-lucide-image',
  to: '/media',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Settings',
  to: '/settings',
  icon: 'i-lucide-settings',
  defaultOpen: false,
  type: 'trigger',
  children: [{
    label: 'General',
    to: '/settings',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Profile',
    to: '/settings/profile',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Notifications',
    to: '/settings/notifications',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Security',
    to: '/settings/security',
    onSelect: () => {
      open.value = false
    }
  }]
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'simple-icons:github',
    to: `https://github.com/nuxt-ui-templates/dashboard-vue/blob/main/src/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])

// Auth middleware - protect authenticated routes
onMounted(async () => {
  await initAuth()

  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    router.push('/login')
  }
})
</script>

<template>
  <UApp>
    <UDashboardGroup unit="rem" storage="local">
      <UDashboardSidebar
        id="default"
        v-model:open="open"
        collapsible
        resizable
        class="bg-elevated/25"
        :ui="{ footer: 'lg:border-t lg:border-default' }"
      >
        <template #header="{ collapsed }">
          <TeamsMenu :collapsed="collapsed" />
        </template>

        <template #default="{ collapsed }">
          <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[0]"
            orientation="vertical"
            tooltip
            popover
          />

          <UNavigationMenu
            :collapsed="collapsed"
            :items="links[1]"
            orientation="vertical"
            tooltip
            class="mt-auto"
          />
        </template>

        <template #footer="{ collapsed }">
          <UserMenu :collapsed="collapsed" />
        </template>
      </UDashboardSidebar>

      <UDashboardSearch :groups="groups" />

      <slot />

      <NotificationsSlideover />
    </UDashboardGroup>
  </UApp>
</template>