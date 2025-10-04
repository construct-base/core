/**
 * Auto-discover routes from app modules
 * Scans app/{module}/pages/*.vue and generates routes
 */

const modules = import.meta.glob('~/app/*/pages/*.vue')

export function discoverModuleRoutes() {
  const routes: any[] = []

  for (const path in modules) {
    // Extract module name and page name
    // Format: ~/app/{module}/pages/{page}.vue
    const match = path.match(/~\/app\/([^/]+)\/pages\/(.+)\.vue$/)

    if (match) {
      const [, moduleName, pageName] = match

      // Generate route path
      // index.vue -> /{module}
      // [id].vue -> /{module}/:id
      let routePath = `/${moduleName}`

      if (pageName !== 'index') {
        // Handle dynamic routes [id]
        const dynamicPath = pageName.replace(/\[(\w+)\]/g, ':$1')
        routePath += `/${dynamicPath}`
      }

      routes.push({
        path: routePath,
        component: modules[path]
      })
    }
  }

  return routes
}
