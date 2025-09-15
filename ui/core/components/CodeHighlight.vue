<template>
  <div class="code-highlight-wrapper">
    <div v-if="language || title" class="code-header">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span v-if="language" class="language-badge">{{ language }}</span>
          <span v-if="title" class="code-title">{{ title }}</span>
        </div>
        <UButton
          v-if="copyable"
          @click="copyCode"
          variant="ghost"
          size="sm"
          :icon="copied ? 'i-heroicons-check' : 'i-heroicons-clipboard'"
          :color="copied ? 'green' : 'gray'"
        />
      </div>
    </div>

    <div class="code-container" :class="{ 'rounded-t-none': language || title }">
      <CodeHighlightComponent
        :code="code"
        :language="language || 'text'"
        :theme="theme"
        :line-numbers="lineNumbers"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CodeHighlightComponent from 'vue-code-highlight/src/CodeHighlight.vue'
import 'vue-code-highlight/themes/prism-okaidia.css'
import 'vue-code-highlight/themes/prism-line-numbers.css'

interface Props {
  code: string
  language?: string
  title?: string
  theme?: string
  lineNumbers?: boolean
  copyable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'text',
  theme: 'okaidia',
  lineNumbers: true,
  copyable: true
})

const copied = ref(false)

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy code:', error)
  }
}
</script>

<style scoped>
.code-highlight-wrapper {
  @apply my-4 overflow-hidden;
}

.code-header {
  @apply bg-gray-800 dark:bg-gray-900 px-4 py-2 border-b border-gray-700 rounded-t-lg;
}

.language-badge {
  @apply inline-flex items-center px-2 py-1 text-xs font-medium text-blue-100 bg-blue-600 rounded;
}

.code-title {
  @apply text-sm font-medium text-gray-300;
}

.code-container {
  @apply rounded-lg overflow-x-auto;
}

.code-container :deep(pre) {
  @apply !my-0 !rounded-none;
}

.code-container :deep(code) {
  @apply text-sm;
}

/* Override prism theme for better integration */
.code-container :deep(.token.comment),
.code-container :deep(.token.prolog),
.code-container :deep(.token.doctype),
.code-container :deep(.token.cdata) {
  @apply text-gray-400;
}

.code-container :deep(.token.punctuation) {
  @apply text-gray-300;
}

.code-container :deep(.token.property),
.code-container :deep(.token.tag),
.code-container :deep(.token.boolean),
.code-container :deep(.token.number),
.code-container :deep(.token.constant),
.code-container :deep(.token.symbol),
.code-container :deep(.token.deleted) {
  @apply text-red-400;
}

.code-container :deep(.token.selector),
.code-container :deep(.token.attr-name),
.code-container :deep(.token.string),
.code-container :deep(.token.char),
.code-container :deep(.token.builtin),
.code-container :deep(.token.inserted) {
  @apply text-green-400;
}

.code-container :deep(.token.operator),
.code-container :deep(.token.entity),
.code-container :deep(.token.url),
.code-container :deep(.language-css .token.string),
.code-container :deep(.style .token.string) {
  @apply text-yellow-400;
}

.code-container :deep(.token.atrule),
.code-container :deep(.token.attr-value),
.code-container :deep(.token.keyword) {
  @apply text-blue-400;
}

.code-container :deep(.token.function),
.code-container :deep(.token.class-name) {
  @apply text-purple-400;
}
</style>