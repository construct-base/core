import type { Plugin } from 'vite'
import { resolve, relative, join } from 'path'
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'fs'

export interface PageMeta {
  layout?: string
  middleware?: string | string[]
  title?: string
  description?: string
  [key: string]: any
}

export interface ConstructPage {
  path: string
  filePath: string
  component: string
  name: string
  meta: PageMeta
}

export interface ConstructPagesOptions {
  dirs: Array<{
    dir: string
    baseRoute?: string
  }>
  extensions?: string[]
  exclude?: string[]
  outputFile?: string
}

/**
 * Construct Pages Plugin
 * Unified plugin that handles both routing and middleware extraction
 */
export function constructPages(options: ConstructPagesOptions): Plugin {
  const {
    dirs,
    extensions = ['.vue'],
    exclude = ['**/components/**'],
    outputFile = '.construct/pages.ts'
  } = options

  let root: string
  let pages: ConstructPage[] = []

  // Helper functions
  function isPageFile(filename: string): boolean {
    if (!extensions.some(ext => filename.endsWith(ext))) {
      return false
    }

    for (const pattern of exclude) {
      if (matchesPattern(filename, pattern)) {
        return false
      }
    }

    return true
  }

  function matchesPattern(filename: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\//g, '\\/')

    return new RegExp(regexPattern).test(filename)
  }

  function extractPageMeta(content: string): PageMeta {
    const meta: PageMeta = {}

    // Look for layout() function calls
    const layoutRegex = /layout\s*\(\s*({[^}]*})\s*\)/g
    let match

    while ((match = layoutRegex.exec(content)) !== null) {
      try {
        const configStr = match[1]
        const config = parseLayoutConfig(configStr)
        Object.assign(meta, config)
      } catch (error) {
        console.warn('Failed to parse layout configuration:', error)
      }
    }

    // Apply convention-based middleware based on layout
    if (meta.layout || meta.use) {
      const layoutName = meta.layout || meta.use
      applyLayoutConventions(meta, layoutName)
    }

    return meta
  }

  function parseLayoutConfig(configStr: string): PageMeta {
    try {
      // Clean up the config string and make it valid JSON
      const cleanConfig = configStr
        .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
        .replace(/'/g, '"')

      return JSON.parse(cleanConfig)
    } catch (error) {
      console.warn('Failed to parse layout config:', configStr, error)
      return {}
    }
  }

  /**
   * Apply conventional middleware based on layout choice
   * Convention over configuration: layout choice implies middleware requirements
   */
  function applyLayoutConventions(meta: PageMeta, layoutName: string): void {
    // Don't override explicitly set middleware
    if (meta.middleware) {
      return
    }

    // Apply layout-based conventions
    switch (layoutName) {
      case 'admin':
        // Admin layout requires authentication + admin permissions
        meta.middleware = ['auth', 'admin']
        break

      case 'auth':
        // Auth layout is for login/register pages - redirect authenticated users
        meta.middleware = ['guest']
        break

      case 'default':
        // Default layout for general pages - accessible to everyone
        meta.middleware = ['public']
        break

      case 'dashboard':
      case 'user':
      case 'profile':
        // User-specific layouts require authentication
        meta.middleware = ['auth']
        break

      default:
        // For custom layouts, default to authentication requirement
        // This is a safe default that can be overridden if needed
        meta.middleware = ['auth']
        break
    }

    console.log(`📄 Layout convention applied: ${layoutName} → middleware: ${JSON.stringify(meta.middleware)}`)
  }

  function generateRoutePath(relativePath: string, baseRoute: string): string {
    let routePath = relativePath
      .replace(/\.[^.]+$/, '') // Remove file extension
      .replace(/\/index$/, '') // Remove /index from the end
      .replace(/\\/g, '/') // Normalize path separators

    // Handle dynamic routes: [id].vue becomes :id, [slug]/edit.vue becomes :slug/edit
    routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1')

    // Handle empty or index paths
    if (routePath === '' || routePath === 'index') {
      routePath = ''
    }

    // Build full path
    let fullPath = ''

    if (baseRoute && baseRoute !== '') {
      // If the route path already starts with the base route, don't duplicate it
      if (routePath.startsWith(baseRoute + '/') || routePath === baseRoute) {
        // Route path already includes base route, just add leading slash
        fullPath = '/' + routePath
      } else {
        // Add base route to the path
        const normalizedBase = baseRoute.startsWith('/') ? baseRoute : '/' + baseRoute
        fullPath = routePath ? normalizedBase + '/' + routePath : normalizedBase
      }
    } else {
      // No base route, just add leading slash to route path
      fullPath = routePath ? '/' + routePath : '/'
    }

    // Ensure path always starts with /
    if (!fullPath.startsWith('/')) {
      fullPath = '/' + fullPath
    }

    return fullPath
  }

  function generateRouteName(routePath: string): string {
    return routePath
      .replace(/^\//, '')
      .replace(/\//g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      || 'index'
  }

  function processPageFile(filePath: string, baseRoute: string, originalDir: string): ConstructPage | null {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const meta = extractPageMeta(content)

      const relativePath = relative(resolve(root, originalDir), filePath)
      const routePath = generateRoutePath(relativePath, baseRoute)
      const componentPath = relative(root, filePath)

      return {
        path: routePath,
        filePath,
        component: componentPath,
        name: generateRouteName(routePath),
        meta
      }
    } catch (error) {
      console.warn(`Failed to process page file ${filePath}:`, error)
      return null
    }
  }

  function scanDirectory(dirPath: string, baseRoute: string, originalDir: string): ConstructPage[] {
    const pages: ConstructPage[] = []

    try {
      const entries = readdirSync(dirPath)

      for (const entry of entries) {
        const fullPath = join(dirPath, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          const subRoute = join(baseRoute, entry)
          const subPages = scanDirectory(fullPath, subRoute, originalDir)
          pages.push(...subPages)
        } else if (stat.isFile() && isPageFile(entry)) {
          const page = processPageFile(fullPath, baseRoute, originalDir)
          if (page) {
            pages.push(page)
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${dirPath}:`, error)
    }

    return pages
  }

  function scanPages(): ConstructPage[] {
    const allPages: ConstructPage[] = []

    for (const { dir, baseRoute = '' } of dirs) {
      const dirPath = resolve(root, dir)

      try {
        const dirPages = scanDirectory(dirPath, baseRoute, dir)
        allPages.push(...dirPages)
      } catch (error) {
        console.warn(`Failed to scan directory ${dir}:`, error)
      }
    }

    return allPages
  }

  function generatePagesFile(): void {
    // Remove duplicate routes (app pages take precedence over core pages)
    const uniquePages = new Map<string, ConstructPage>()

    // Process in reverse order so app pages (processed first) take precedence
    for (const page of pages) {
      if (!uniquePages.has(page.path)) {
        uniquePages.set(page.path, page)
      } else {
        console.log(`⚠️  Route collision: ${page.path} - keeping first occurrence`)
      }
    }

    const finalPages = Array.from(uniquePages.values())

    const imports = finalPages.map((page, index) =>
      `const Page${index} = () => import('/${page.component}')`
    ).join('\n')

    const routes = finalPages.map((page, index) => `  {
    path: '${page.path}',
    name: '${page.name}',
    component: Page${index},
    meta: ${JSON.stringify(page.meta, null, 6).replace(/\n/g, '\n    ')}
  }`).join(',\n')

    const fileContent = `// Auto-generated by construct-pages plugin
// Do not edit this file manually

${imports}

export const routes = [
${routes}
]

export default routes
`

    // Ensure the output directory exists
    const outputPath = resolve(root, outputFile)
    const outputDir = resolve(outputPath, '..')

    try {
      mkdirSync(outputDir, { recursive: true })
      writeFileSync(outputPath, fileContent, 'utf-8')
      console.log(`✅ Generated ${finalPages.length} routes in ${outputFile} (${pages.length - finalPages.length} duplicates removed)`)
    } catch (error) {
      console.error('Failed to write pages file:', error)
    }
  }

  return {
    name: 'construct-pages',

    configResolved(config) {
      root = config.root
    },

    buildStart() {
      pages = scanPages()
      generatePagesFile()
    },

    handleHotUpdate({ file, server }) {
      const shouldReload = dirs.some(({ dir }) =>
        file.startsWith(resolve(root, dir))
      )

      if (shouldReload) {
        pages = scanPages()
        generatePagesFile()

        const module = server.moduleGraph.getModuleById(
          resolve(root, outputFile)
        )
        if (module) {
          server.reloadModule(module)
        }
      }
    }
  }
}