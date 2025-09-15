<template>
  <header :class="headerClasses">
    <AppContainer :size="containerSize">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <slot name="logo">
            <router-link to="/" class="text-xl font-bold text-slate-900 dark:text-slate-100">
              {{ title }}
            </router-link>
          </slot>
        </div>

        <nav class="hidden md:flex items-center space-x-8">
          <slot name="nav" />
        </nav>

        <div class="flex items-center space-x-4">
          <slot name="actions">
            <UColorModeButton />
          </slot>
        </div>
      </div>
    </AppContainer>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  sticky?: boolean
  border?: boolean
  background?: boolean
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Construct Framework',
  sticky: false,
  border: true,
  background: true,
  containerSize: '7xl'
})

const headerClasses = computed(() => {
  const classes = []

  if (props.sticky) {
    classes.push('sticky top-0 z-50')
  }

  if (props.background) {
    classes.push('bg-white dark:bg-slate-900')
  }

  if (props.border) {
    classes.push('border-b border-slate-300 dark:border-slate-600')
  }

  return classes.join(' ')
})
</script>