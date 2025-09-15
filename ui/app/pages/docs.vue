<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar Navigation -->
      <div class="lg:col-span-1">
        <div class="sticky top-8">
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Documentation
            </h2>

            <!-- Search -->
            <UInput
              v-model="searchQuery"
              placeholder="Search docs..."
              icon="i-heroicons-magnifying-glass"
              class="mb-4"
            />
          </div>

          <!-- Navigation Sections -->
          <nav class="space-y-6">
            <div v-for="section in sections" :key="section.name">
              <h3 class="text-sm font-medium text-slate-900 dark:text-white mb-2">
                {{ section.name }}
              </h3>
              <ul class="space-y-1">
                <li v-for="page in section.pages" :key="page.path">
                  <button
                    @click="loadDoc(page.path)"
                    :class="[
                      'block w-full text-left text-sm px-3 py-2 rounded-md transition-colors',
                      currentDoc?.path === page.path
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    ]"
                  >
                    {{ page.title }}
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-3">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl text-primary-500" />
          <span class="ml-2 text-slate-600 dark:text-slate-400">Loading documentation...</span>
        </div>

        <!-- Error State -->
        <UAlert
          v-else-if="error"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="soft"
          :title="error"
          :description="`Try selecting a different page or check if the documentation exists.`"
          class="mb-6"
        />

        <!-- Welcome State -->
        <div v-else-if="!currentDoc" class="text-center py-12">
          <UIcon name="i-heroicons-document-text" class="text-6xl text-slate-300 dark:text-slate-600 mb-4" />
          <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Welcome to Construct Documentation
          </h3>
          <p class="text-slate-600 dark:text-slate-400 mb-6">
            Select a topic from the sidebar to get started, or use the search to find specific information.
          </p>
          <UButton
            @click="loadDoc('getting-started/introduction')"
            color="primary"
            variant="solid"
          >
            Get Started
          </UButton>
        </div>

        <!-- Documentation Content -->
        <article v-else class="prose prose-slate dark:prose-invert max-w-none">
          <!-- Page Header -->
          <div class="border-b border-slate-200 dark:border-slate-700 pb-6 mb-8">
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {{ currentDoc.title }}
            </h1>
            <div class="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <UIcon name="i-heroicons-document" class="mr-1" />
              <span>{{ currentDoc.path }}</span>
              <span v-if="currentDoc.lastModified" class="ml-4">
                Last updated: {{ formatDate(currentDoc.lastModified) }}
              </span>
            </div>
          </div>

          <!-- Rendered Markdown Content -->
          <div
            v-html="currentDoc.content"
            class="prose-headings:scroll-mt-8 prose-code:text-primary-600 dark:prose-code:text-primary-400"
          />

          <!-- Page Navigation -->
          <div class="flex justify-between items-center pt-8 border-t border-slate-200 dark:border-slate-700 mt-12">
            <UButton
              v-if="previousPage"
              @click="loadDoc(previousPage.path)"
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-left"
            >
              {{ previousPage.title }}
            </UButton>
            <div v-else />

            <UButton
              v-if="nextPage"
              @click="loadDoc(nextPage.path)"
              variant="ghost"
              color="gray"
              trailing-icon="i-heroicons-arrow-right"
            >
              {{ nextPage.title }}
            </UButton>
            <div v-else />
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDocs } from '@core/composables/useDocs'

layout({"use": "default", "middleware": ["public"]})

const { currentDoc, sections, loading, error, allPages, loadDocsStructure, loadDoc, searchDocs } = useDocs()

const searchQuery = ref('')

// Load documentation structure on mount
onMounted(() => {
  loadDocsStructure()
})

// Watch for route changes to load specific docs
const route = useRoute()
watch(() => route.query.page, (page) => {
  if (page && typeof page === 'string') {
    loadDoc(page)
  }
}, { immediate: true })

// Handle search
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  return searchDocs(searchQuery.value)
})

// Navigation helpers
const currentPageIndex = computed(() => {
  if (!currentDoc.value) return -1
  return allPages.value.findIndex(page => page.path === currentDoc.value?.path)
})

const previousPage = computed(() => {
  const index = currentPageIndex.value
  return index > 0 ? allPages.value[index - 1] : null
})

const nextPage = computed(() => {
  const index = currentPageIndex.value
  return index >= 0 && index < allPages.value.length - 1 ? allPages.value[index + 1] : null
})

// Utility functions
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Update URL when doc changes
watch(currentDoc, (doc) => {
  if (doc && route.query.page !== doc.path) {
    navigateTo({ query: { ...route.query, page: doc.path } })
  }
})
</script>

<style scoped>
/* Custom styles for documentation */
.prose :deep(pre) {
  @apply bg-slate-900 dark:bg-slate-800;
}

.prose :deep(code) {
  @apply text-sm;
}

.prose :deep(h2) {
  @apply border-b border-slate-200 dark:border-slate-700 pb-2;
}

.prose :deep(blockquote) {
  @apply border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20;
}
</style>