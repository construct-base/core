<template>
  <main :class="mainClasses">
    <AppContainer v-if="container" :size="containerSize">
      <slot />
    </AppContainer>
    <slot v-else />
  </main>
</template>

<script setup lang="ts">
interface Props {
  container?: boolean
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  padding?: boolean
  paddingY?: string
  paddingX?: string
  minHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  container: true,
  containerSize: '7xl',
  padding: true,
  paddingY: 'py-6',
  paddingX: '',
  minHeight: true
})

const mainClasses = computed(() => {
  const classes = []

  if (props.minHeight) {
    classes.push('min-h-screen')
  }

  if (props.padding) {
    if (props.paddingY) {
      classes.push(props.paddingY)
    }
    if (props.paddingX) {
      classes.push(props.paddingX)
    }
    if (!props.paddingY && !props.paddingX) {
      classes.push('p-6')
    }
  }

  return classes.join(' ')
})
</script>