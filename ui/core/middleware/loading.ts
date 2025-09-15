import type { MiddlewareContext } from './types'

/**
 * Loading middleware
 * Shows/hides global loading state during route transitions
 */
export default function loadingMiddleware({ to, from }: MiddlewareContext) {
  // TODO: Implement global loading state when needed
  // For now, just continue navigation
  console.log('Loading middleware:', { from: from.name, to: to.name })
}