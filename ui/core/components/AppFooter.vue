<template>
  <footer :class="footerClasses">
    <AppContainer :size="containerSize">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <slot name="left">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ copyright }}
            </p>
          </slot>
        </div>

        <div class="flex items-center space-x-4">
          <slot name="right" />
        </div>
      </div>
    </AppContainer>
  </footer>
</template>

<script setup lang="ts">
interface Props {
  copyright?: string
  border?: boolean
  background?: boolean
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  sticky?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  copyright: 'Built with Construct Framework',
  border: true,
  background: true,
  containerSize: '7xl',
  sticky: false
})

const footerClasses = computed(() => {
  const classes = []

  if (props.sticky) {
    classes.push('sticky bottom-0')
  }

  if (props.background) {
    classes.push('bg-white dark:bg-slate-900')
  }

  if (props.border) {
    classes.push('border-t border-slate-300 dark:border-slate-600')
  }

  classes.push('mt-auto')

  return classes.join(' ')
})
</script>