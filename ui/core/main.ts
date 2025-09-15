import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import routes from '~/.construct/pages'
import App from './App.vue'
import { installUILibrary } from './plugins/ui-library'
import { getConfig } from './config'

// Import Tailwind CSS
import '../assets/css/style.css'

async function bootstrap() {
  // Create the Vue app
  const app = createApp(App)

  // Create router
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  // Create Pinia store
  const pinia = createPinia()

  // Install core plugins
  app.use(router)
  app.use(pinia)

  try {
    // Load config and install UI library
    const config = await getConfig()
    await installUILibrary(app, config)

    // Register middleware
    const { registerMiddleware } = await import('./middleware')
    registerMiddleware(router, config.middleware)
  } catch (error) {
    console.error('Failed to initialize framework:', error)
  }

  // Mount the app
  app.mount('#app')
}

// Bootstrap the application
bootstrap()