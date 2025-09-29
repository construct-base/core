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
    { path: '/analytics', component: () => import('./pages/analytics.vue') },
    { path: '/logs', component: () => import('./pages/logs.vue') },
    { path: '/notifications', component: () => import('./pages/notifications.vue') },
    {
      path: '/settings',
      component: () => import('./pages/settings.vue'),
      children: [
        { path: '', component: () => import('./pages/settings/index.vue') },
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
