<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Notifications">
        <template #trailing>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-mark-all-as-read"
          >
            Mark All Read
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
        <UCard>
          <div class="p-8 text-center">
            <UIcon name="i-lucide-bell" class="h-12 w-12 mx-auto mb-4 text-primary-500" />
            <h3 class="text-lg font-medium mb-2">
              Notifications Center
            </h3>
            <p class="text-gray-500">
              All your notifications in one place.
            </p>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
// Notifications center page
</script>