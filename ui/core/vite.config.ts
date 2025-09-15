import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import ui from '@nuxt/ui/vite'
import { constructPages } from './plugins/construct-pages'

export default defineConfig({
  root: resolve(__dirname, '..'),
    plugins: [
      vue(),

      // Nuxt UI with auto-import configuration (includes Tailwind CSS 4)
      ui({
        autoImport: {
          imports: [
            'vue',
            'vue-router',
            'pinia',
            {
              // Centralized imports from index files to avoid duplicates
              '@core/utils/page-meta': ['layout'],
              '@core/utils/navigation': ['navigateTo', 'navigateReplace', 'navigateBack'],
              '@core/types': [
                // Common types that are frequently used
                'User',
                'LoginRequest',
                'LoginResponse',
                'RegisterRequest',
                'ApiResponse',
                'PaginatedResponse',
                'Pagination',
                'Role',
                'Permission',
                // Type guards
                'isSuccessResponse',
                'isErrorResponse'
              ],
              '@core/stores': ['useAuthStore', 'useUsersStore'],
              '@core/composables': ['useAuth', 'useApi', 'useConstruct', 'useNotification', 'useForm', 'useDocs', 'useNavigation']
            }
          ],
          dirs: [
            // Only scan app directories for auto-imports
            resolve(__dirname, '..', 'app/composables'),
            resolve(__dirname, '..', 'app/utils')
          ],
          vueTemplate: true,
          dts: resolve(__dirname, '..', '.construct/types/auto-imports.d.ts'),
          eslintrc: {
            enabled: true,
            filepath: resolve(__dirname, '..', '.construct/.eslintrc-auto-import.json')
          }
        },
        components: {
          dirs: [
            resolve(__dirname, 'components'),
            resolve(__dirname, '..', 'app/components')
          ],
          extensions: ['vue'],
          deep: true,
          dts: resolve(__dirname, '..', '.construct/types/components.d.ts')
        }
      }),

      // Unified routing and middleware plugin
      constructPages({
        dirs: [
          { dir: 'app/pages', baseRoute: '' },
          { dir: 'core/pages', baseRoute: '' }
        ],
        extensions: ['.vue'],
        exclude: ['**/components/**'],
        outputFile: '.construct/pages.ts'
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, '..'),
        '@app': resolve(__dirname, '..', 'app'),
        '@core': resolve(__dirname),
        '@components': resolve(__dirname, 'components'),
        '@utils': resolve(__dirname, 'utils'),
        '~': resolve(__dirname, '..')
      }
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
      'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:8100')
    },
    build: {
      outDir: '../.construct/dist',
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'main.ts'),
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            ui: ['@headlessui/vue', '@heroicons/vue']
          }
        }
      }
    }
})