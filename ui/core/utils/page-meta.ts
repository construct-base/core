export interface LayoutConfig {
  use: string
  middleware?: string | string[]
  title?: string
  description?: string
  [key: string]: any
}

/**
 * Define page layout and middleware (Construct framework utility)
 *
 * Usage: layout({"use": "default", "middleware": ["auth"]})
 */
export function layout(config: LayoutConfig): void {
  // This function is a no-op at runtime
  // The actual work is done by vite-plugin-pages at build time
  // It extracts the config and adds it to the route definition
}