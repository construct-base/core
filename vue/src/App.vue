<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStorage } from '@vueuse/core'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useAuth } from '@/composables/useAuth'

const toast = useToast()
const route = useRoute()
const { initAuth } = useAuth()

const open = ref(false)

const links = [[{
  label: 'Dashboard',
  icon: 'i-lucide-house',
  to: '/',
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
  }, {
    label: 'Permissions',
    to: '/permissions',
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
    label: 'Members',
    to: '/settings/members',
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
}], [{
  label: 'Analytics',
  icon: 'i-lucide-bar-chart',
  to: '/analytics',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Logs',
  icon: 'i-lucide-file-text',
  to: '/logs',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Help & Support',
  icon: 'i-lucide-help-circle',
  to: 'https://github.com/base-go/base',
  target: '_blank'
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

const cookie = useStorage('cookie-consent', 'pending')
// Initialize authentication on app start
onMounted(async () => {
  try {
    await initAuth()
    console.log('🚀 Construct Vue Dashboard Ready!')

    if (cookie.value !== 'accepted') {
      toast.add({
        title: 'We use first-party cookies to enhance your experience on our website.',
        duration: 0,
        close: false,
        actions: [{
          label: 'Accept',
          color: 'neutral',
          variant: 'outline',
          onClick: () => {
            cookie.value = 'accepted'
          }
        }, {
          label: 'Opt out',
          color: 'neutral',
          variant: 'ghost'
        }]
      })
    }
  } catch (error) {
    console.warn('Auth initialization failed:', error)
  }
})
</script>

<template>
  <Suspense>
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

        <RouterView />

        <NotificationsSlideover />
      </UDashboardGroup>
    </UApp>
  </Suspense>
</template>
