#!/bin/bash

# Cleanup script for preparing core as template
# Removes example structures and prepares for clean generator usage
# Usage: ./cleanup.sh

set -e

echo "🧹 Cleaning Construct Core Template"
echo ""

# Remove development artifacts
echo "📦 Removing development artifacts..."
find . -name "*.db" -type f -delete 2>/dev/null || true
find . -name "*.db-shm" -type f -delete 2>/dev/null || true
find . -name "*.db-wal" -type f -delete 2>/dev/null || true
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
rm -f construct-cli construct
rm -rf dist/* vue/dist vue/node_modules
if [ -d "logs" ]; then
    find logs -type f ! -name ".gitkeep" -delete 2>/dev/null || true
fi
if [ -d "storage" ]; then
    find storage -type f ! -name ".gitkeep" -delete 2>/dev/null || true
fi

# Remove example structures
echo "🗑️  Removing example structures..."
rm -rf api/posts api/articles api/categories api/models
rm -rf vue/structures

# Create empty structures directory
mkdir -p vue/structures

# Clean up api/init.go
echo "📝 Cleaning api/init.go..."
cat > api/init.go << 'EOF'
package api

import (
	"base/core/module"
)

// AppModules implements module.AppModuleProvider interface
type AppModules struct{}

// GetAppModules returns the list of app modules to initialize
// Add your generated modules here
func (am *AppModules) GetAppModules(deps module.Dependencies) map[string]module.Module {
	modules := make(map[string]module.Module)

	// Example: modules["posts"] = posts.Init(deps)

	return modules
}

// NewAppModules creates a new AppModules provider
func NewAppModules() *AppModules {
	return &AppModules{}
}
EOF

# Clean up vue/core/main.ts - remove example routes
echo "📝 Cleaning vue/core/main.ts..."
cat > vue/core/main.ts << 'EOF'
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
        // Generated structure routes will be added here by the CLI
      ]
    }
  ],
  history: createWebHistory()
}))

app.use(pinia)
app.use(ui)

app.mount('#app')
EOF

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Template is now ready:"
echo "   • No example structures"
echo "   • Clean api/init.go"
echo "   • Clean route configuration"
echo "   • Ready for generator"
echo ""
