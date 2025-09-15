<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">Construct Framework</h1>
        <p class="mt-2 text-sm text-gray-600">Authentication</p>
      </div>

      <div class="bg-white py-8 px-6 shadow rounded-lg">
        <slot />
      </div>

      <div class="text-center">
        <p class="text-xs text-gray-500">
          Built with Construct Framework
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth layout for login/register pages
</script>