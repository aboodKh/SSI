<script setup lang="ts">
const date = new Date().getFullYear()
const appConfig = useAppConfig()
</script>

<template>
  <div class="h-12 grid">
    <UContainer class="grid items-center">
      <span class="p-1 text-xs text-gray-400">Copyright © {{ date }} UvA-MNS research group</span>
    </UContainer>
  </div>
</template>
