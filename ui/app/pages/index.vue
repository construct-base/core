<template>
  <div class="max-w-6xl mx-auto px-4 py-16">
    <!-- Hero Section -->
    <div class="text-center mb-24">
      <h1 class="text-6xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">
        <span class="text-blue-600">Construct</span>
      </h1>

      <p class="text-2xl font-medium text-slate-600 dark:text-slate-300 mb-4">
        The Beautiful Facade for Base
      </p>

      <p class="text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
        Base provides the robust Go backend foundation with modules, authentication, and APIs.
        Construct adds the beautiful Vue interface with modern components and developer experience.
      </p>

      <!-- Installation -->
      <div class="mb-12">
        <UCodeBlock
          :code="installCode"
          language="bash"
          :header="false"
          class="max-w-lg mx-auto"
        />
      </div>

      <div class="flex justify-center gap-4">
        <UButton
          to="/about"
          size="lg"
          color="primary"
          variant="solid"
        >
          Get Started
        </UButton>

        <UButton
          to="http://localhost:8001/docs"
          external
          size="lg"
          variant="outline"
          color="gray"
        >
          Documentation
        </UButton>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
      <div class="text-center">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-bolt" class="text-xl text-blue-600 dark:text-blue-400" />
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Fast Development</h3>
        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Hot reload, auto-routing, and unified configuration for rapid development cycles.
        </p>
      </div>

      <div class="text-center">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-shield-check" class="text-xl text-green-600 dark:text-green-400" />
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Type Safe</h3>
        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Automatic TypeScript types generated from your Go models for seamless integration.
        </p>
      </div>

      <div class="text-center">
        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-squares-2x2" class="text-xl text-purple-600 dark:text-purple-400" />
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Modern UI</h3>
        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Beautiful components with Nuxt UI and Tailwind CSS out of the box.
        </p>
      </div>
    </div>

    <!-- Quick Start Section -->
    <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-8 mb-24">
      <h2 class="text-2xl font-semibold text-slate-900 dark:text-white mb-6 text-center">Quick Start</h2>

      <div class="max-w-2xl mx-auto">
        <pre>
          <code>{{ quickStartCode }}</code>
        </pre>

        <p class="text-sm text-slate-500 dark:text-slate-400 text-center">
          API runs on port 8001, UI on port 3100
        </p>
      </div>
    </div>

    <!-- Simple Feature List -->
    <div class="max-w-4xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
        <div>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-4">Framework Features</h3>
          <ul class="space-y-2 text-slate-600 dark:text-slate-400">
            <li>• Auto-routing with file-based system</li>
            <li>• TypeScript types from Go models</li>
            <li>• Nuxt UI components</li>
            <li>• Hot module replacement</li>
            <li>• Auto-import composables</li>
          </ul>
        </div>

        <div>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-4">Technology Stack</h3>
          <ul class="space-y-2 text-slate-600 dark:text-slate-400">
            <li>• Vue 3 Composition API</li>
            <li>• Vite build system</li>
            <li>• Go backend (Base framework)</li>
            <li>• Tailwind CSS</li>
            <li>• Pinia state management</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { layout } from '@/core/utils/page-meta';

// Landing page - no authentication required, use guest layout
layout({"use": "default", "middleware": ["public"]})

const installCode = `construct new project-name`

const quickStartCode = `
# Start both Go API and Vue UI
construct dev

# API: http://localhost:8001
# UI: http://localhost:3100`

// This page demonstrates the basic structure of a Construct page
console.log('Landing page loaded')
</script>