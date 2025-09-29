import './assets/css/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(createRouter({
  routes: [
    { path: '/', component: () => import('./pages/index.vue') },
    { path: '/inbox', component: () => import('./pages/inbox.vue') },
    { path: '/customers', component: () => import('./pages/customers.vue') },
    { path: '/users', component: () => import('./pages/users.vue') },
    { path: '/roles', component: () => import('./pages/roles.vue') },
    { path: '/permissions', component: () => import('./pages/permissions.vue') },
    { path: '/media', component: () => import('./pages/media.vue') },
    { path: '/media/:id(\\d+)', component: () => import('./pages/media.vue') }, // Numeric IDs only
    { path: '/media/:name', component: () => import('./pages/media.vue') }, // Folder names
    { path: '/analytics', component: () => import('./pages/analytics.vue') },
    { path: '/logs', component: () => import('./pages/logs.vue') },
    { path: '/notifications', component: () => import('./pages/notifications.vue') },
    {
      path: '/auth',
      children: [
        { path: 'login', component: () => import('./pages/auth/login.vue') },
        { path: 'register', component: () => import('./pages/auth/register.vue') },
        { path: 'forgot-password', component: () => import('./pages/auth/forgot-password.vue') },
        { path: 'reset-password', component: () => import('./pages/auth/reset-password.vue') }
      ]
    },
    { path: '/login', component: () => import('./pages/auth/login.vue') },
    { path: '/register', component: () => import('./pages/auth/register.vue') },
    { path: '/forgot-password', component: () => import('./pages/auth/forgot-password.vue') },
    { path: '/reset-password', component: () => import('./pages/auth/reset-password.vue') },
    {
      path: '/settings',
      component: () => import('./pages/settings.vue'),
      children: [
        { path: '', component: () => import('./pages/settings/index.vue') },
        { path: 'profile', component: () => import('./pages/settings/profile.vue') },
        { path: 'members', component: () => import('./pages/settings/members.vue') },
        { path: 'notifications', component: () => import('./pages/settings/notifications.vue') },
        { path: 'security', component: () => import('./pages/settings/security.vue') },
      ]
    }
  ],
  history: createWebHistory()
}))

app.use(pinia)
app.use(ui)

app.mount('#app')
