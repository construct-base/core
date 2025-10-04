import '~/core/assets/css/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'

import App from '~/core/App.vue'
import DefaultLayout from '~/core/layouts/default.vue'
import AuthLayout from '~/core/layouts/auth.vue'
import { discoverModuleRoutes } from '~/core/utils/routes'

const app = createApp(App)
const pinia = createPinia()

// Auto-discover routes from app modules
const moduleRoutes = discoverModuleRoutes()

app.use(createRouter({
  routes: [
    // Auth routes (guest only)
    { path: '/login', component: () => import('~/core/pages/login.vue'), meta: { layout: 'auth' } },
    { path: '/register', component: () => import('~/core/pages/register.vue'), meta: { layout: 'auth' } },
    { path: '/forgot-password', component: () => import('~/core/pages/forgot-password.vue'), meta: { layout: 'auth' } },
    { path: '/reset-password', component: () => import('~/core/pages/reset-password.vue'), meta: { layout: 'auth' } },

    // Protected routes (authenticated only)
    { path: '/', component: () => import('@/pages/index.vue') },
    { path: '/users', component: () => import('@/pages/users.vue') },
    { path: '/roles', component: () => import('@/pages/roles.vue') },
    { path: '/roles/:id/permissions', component: () => import('@/pages/roles/[id]/permissions.vue') },
    { path: '/media', component: () => import('@/pages/media.vue') },
    { path: '/media/:id(\\d+)', component: () => import('@/pages/media.vue') },
    { path: '/media/:name', component: () => import('@/pages/media.vue') },
    { path: '/settings', component: () => import('@/pages/settings/index.vue') },
    { path: '/settings/profile', component: () => import('@/pages/settings/profile.vue') },
    { path: '/settings/notifications', component: () => import('@/pages/settings/notifications.vue') },
    { path: '/settings/security', component: () => import('@/pages/settings/security.vue') },

    // Auto-discovered app module routes
    ...moduleRoutes
  ],
  history: createWebHistory()
}))

app.use(pinia)
app.use(ui)

app.mount('#app')
