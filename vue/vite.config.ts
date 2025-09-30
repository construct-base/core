import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ui({
      ui: {
        colors: {
          primary: 'indigo',
          neutral: 'slate'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'view'),
      '@core': resolve(__dirname, 'core'),
    }
  },
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  },
  server: {
    port: 3100,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        secure: false
      },
      '/storage': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        secure: false
      },
      '/health': {
        target: 'http://localhost:8100',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    // In production, API is served from same origin (Go serves both)
    // In dev, proxy to Go backend
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? '' // Same origin (Go serves everything)
        : 'http://localhost:8100' // Dev mode: proxy
    )
  }
})
