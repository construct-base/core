<template>
  <router-link
    v-if="isInternal"
    :to="to"
    :class="linkClasses"
    :target="target"
    :rel="rel"
    v-bind="$attrs"
  >
    <slot />
  </router-link>
  <a
    v-else
    :href="to"
    :class="linkClasses"
    :target="target"
    :rel="rel"
    v-bind="$attrs"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
interface Props {
  to: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
  external?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  target: '_self',
  external: false
})

const isInternal = computed(() => {
  if (props.external) return false

  // Check if it's an external URL
  if (props.to.startsWith('http://') || props.to.startsWith('https://')) {
    return false
  }

  // Check if it's a protocol URL (mailto:, tel:, etc.)
  if (props.to.includes(':')) {
    return false
  }

  return true
})

const linkClasses = computed(() => {
  return props.class || ''
})

// Automatically set rel for external links
const rel = computed(() => {
  if (props.rel) return props.rel

  if (!isInternal.value && props.target === '_blank') {
    return 'noopener noreferrer'
  }

  return undefined
})
</script>