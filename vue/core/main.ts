import '@core/assets/css/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'

import App from '@core/App.vue'
import DefaultLayout from '@core/layouts/default.vue'
import AuthLayout from '@core/layouts/auth.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(createRouter({
  routes: [
    // Auth routes (guest only)
    { path: '/login', component: AuthLayout, children: [{ path: '', component: () => import('@core/pages/login.vue') }] },
    { path: '/register', component: AuthLayout, children: [{ path: '', component: () => import('@core/pages/register.vue') }] },
    { path: '/forgot-password', component: AuthLayout, children: [{ path: '', component: () => import('@core/pages/forgot-password.vue') }] },
    { path: '/reset-password', component: AuthLayout, children: [{ path: '', component: () => import('@core/pages/reset-password.vue') }] },

    // Protected routes (authenticated only)
    {
      path: '/',
      component: DefaultLayout,
      children: [
        { path: '', component: () => import('@/pages/index.vue') },
        { path: 'posts', component: () => import('@/structures/posts/index.vue') },
        { path: 'users', component: () => import('@/pages/users.vue') },
        { path: 'roles', component: () => import('@/pages/roles.vue') },
        { path: 'roles/:id/permissions', component: () => import('@/pages/roles/[id]/permissions.vue') },
        { path: 'media', component: () => import('@/pages/media.vue') },
        { path: 'media/:id(\\d+)', component: () => import('@/pages/media.vue') },
        { path: 'media/:name', component: () => import('@/pages/media.vue') },
        { path: 'settings', component: () => import('@/pages/settings/index.vue') },
        { path: 'settings/profile', component: () => import('@/pages/settings/profile.vue') },
        { path: 'settings/notifications', component: () => import('@/pages/settings/notifications.vue') },
        { path: 'settings/security', component: () => import('@/pages/settings/security.vue') }
      ]
    }
  ],
  history: createWebHistory()
}))

app.use(pinia)
app.use(ui)

app.mount('#app')
