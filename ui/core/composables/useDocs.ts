import { marked } from 'marked'

export interface DocPage {
  path: string
  title: string
  content: string
  lastModified?: Date
}

export interface DocSection {
  name: string
  pages: DocPage[]
}

/**
 * Composable for handling documentation
 */
export function useDocs() {
  const currentDoc = ref<DocPage | null>(null)
  const sections = ref<DocSection[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Configure marked for better rendering
  marked.setOptions({
    highlight: function(code, lang) {
      // Basic syntax highlighting could be added here
      return code
    },
    gfm: true,
    breaks: true
  })

  /**
   * Load documentation structure
   */
  async function loadDocsStructure() {
    try {
      loading.value = true
      error.value = null

      // This would ideally come from an API or build-time generation
      // For now, we'll define the structure manually
      sections.value = [
        {
          name: 'Getting Started',
          pages: [
            { path: 'getting-started/introduction', title: 'Introduction', content: '' },
            { path: 'getting-started/installation', title: 'Installation', content: '' },
            { path: 'getting-started/quick-start', title: 'Quick Start', content: '' }
          ]
        },
        {
          name: 'Configuration',
          pages: [
            { path: 'configuration/overview', title: 'Overview', content: '' },
            { path: 'configuration/environment', title: 'Environment', content: '' },
            { path: 'configuration/build', title: 'Build Options', content: '' }
          ]
        },
        {
          name: 'Middleware',
          pages: [
            { path: 'middleware/overview', title: 'Overview', content: '' },
            { path: 'middleware/auth', title: 'Authentication', content: '' },
            { path: 'middleware/authorization', title: 'Authorization', content: '' }
          ]
        },
        {
          name: 'Components',
          pages: [
            { path: 'components/core', title: 'Core Components', content: '' },
            { path: 'components/app', title: 'App Components', content: '' },
            { path: 'components/creating', title: 'Creating Components', content: '' }
          ]
        },
        {
          name: 'Examples',
          pages: [
            { path: 'examples/authentication', title: 'Authentication Flow', content: '' },
            { path: 'examples/crud', title: 'CRUD Operations', content: '' },
            { path: 'examples/file-upload', title: 'File Upload', content: '' },
            { path: 'examples/websocket', title: 'Real-time Features', content: '' }
          ]
        }
      ]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load docs structure'
    } finally {
      loading.value = false
    }
  }

  /**
   * Load a specific documentation page
   */
  async function loadDoc(path: string) {
    try {
      loading.value = true
      error.value = null

      // In a real implementation, this would fetch from an API or import the markdown file
      // For now, we'll simulate loading the content
      const response = await fetch(`/docs/${path}.md`)

      if (!response.ok) {
        throw new Error(`Documentation not found: ${path}`)
      }

      const markdownContent = await response.text()
      const htmlContent = marked(markdownContent)

      // Extract title from the first h1 tag or use the path
      const titleMatch = markdownContent.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : path.split('/').pop() || 'Documentation'

      currentDoc.value = {
        path,
        title,
        content: htmlContent,
        lastModified: new Date()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load documentation'
      currentDoc.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get all pages flattened for search
   */
  const allPages = computed(() => {
    return sections.value.flatMap(section => section.pages)
  })

  /**
   * Search documentation
   */
  function searchDocs(query: string) {
    if (!query.trim()) return []

    const searchTerm = query.toLowerCase()
    return allPages.value.filter(page =>
      page.title.toLowerCase().includes(searchTerm) ||
      page.content.toLowerCase().includes(searchTerm)
    )
  }

  return {
    currentDoc: readonly(currentDoc),
    sections: readonly(sections),
    loading: readonly(loading),
    error: readonly(error),
    allPages,
    loadDocsStructure,
    loadDoc,
    searchDocs
  }
}