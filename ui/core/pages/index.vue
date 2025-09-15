<template>
  <div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Core Framework Features</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Configuration -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Unified Configuration
        </h2>
        <p class="text-gray-600 mb-4">
          The heart of Construct is the unified configuration system that drives both frontend and backend.
        </p>
        <div class="bg-gray-50 p-4 rounded text-sm">
          <code>construct.config.ts</code> defines everything from server ports to database connections.
        </div>
      </div>

      <!-- API Client -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          API Client
        </h2>
        <p class="text-gray-600 mb-4">
          Fully typed API client that automatically connects to your Go backend with authentication support.
        </p>
        <div class="bg-gray-50 p-4 rounded text-sm">
          Auto-configured with JWT tokens, error handling, and request interceptors.
        </div>
      </div>

      <!-- Type System -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          TypeScript Types
        </h2>
        <p class="text-gray-600 mb-4">
          TypeScript interfaces that mirror your Go models, ensuring type safety across the stack.
        </p>
        <div class="bg-gray-50 p-4 rounded text-sm">
          <code>User</code>, <code>ApiResponse</code>, <code>AuthConfig</code> - all automatically typed.
        </div>
      </div>

      <!-- Auto Routing -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          Auto-Routing
        </h2>
        <p class="text-gray-600 mb-4">
          File-based routing system that automatically generates routes from your page structure.
        </p>
        <div class="bg-gray-50 p-4 rounded text-sm">
          <code>app/pages/index.vue</code> → <code>/</code><br>
          <code>app/pages/about.vue</code> → <code>/about</code>
        </div>
      </div>
    </div>

    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-6">Core Modules</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="border border-gray-200 rounded p-4">
          <h3 class="font-medium text-blue-600">Authentication</h3>
          <p class="text-sm text-gray-600 mt-1">JWT-based auth with login/register endpoints</p>
        </div>
        <div class="border border-gray-200 rounded p-4">
          <h3 class="font-medium text-green-600">Authorization</h3>
          <p class="text-sm text-gray-600 mt-1">Role-based permissions and access control</p>
        </div>
        <div class="border border-gray-200 rounded p-4">
          <h3 class="font-medium text-purple-600">Users</h3>
          <p class="text-sm text-gray-600 mt-1">User management with profiles and avatars</p>
        </div>
        <div class="border border-gray-200 rounded p-4">
          <h3 class="font-medium text-orange-600">Media</h3>
          <p class="text-sm text-gray-600 mt-1">File upload and storage management</p>
        </div>
        <div class="border border-gray-200 rounded p-4">
          <h3 class="font-medium text-red-600">Translation</h3>
          <p class="text-sm text-gray-600 mt-1">Internationalization and localization</p>
        </div>
        <div class="border border-gray-200 rounded p-4">
          <h3 class="font-medium text-indigo-600">Scheduler</h3>
          <p class="text-sm text-gray-600 mt-1">Background job scheduling and execution</p>
        </div>
      </div>
    </div>

    <div class="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h2 class="text-xl font-semibold text-blue-900 mb-4">Getting Started</h2>
      <p class="text-blue-800 mb-4">
        All these features are configured and ready to use. Start building your application by:
      </p>
      <ol class="list-decimal list-inside space-y-2 text-blue-800">
        <li>Modifying <code class="bg-blue-100 px-2 py-1 rounded">construct.config.ts</code> for your needs</li>
        <li>Adding pages to <code class="bg-blue-100 px-2 py-1 rounded">app/pages/</code></li>
        <li>Creating components in <code class="bg-blue-100 px-2 py-1 rounded">app/components/</code></li>
        <li>Using the API client to connect to your Go backend</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
// Core framework documentation page
</script>