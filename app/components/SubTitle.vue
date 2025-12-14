<script setup lang="ts">
const props = defineProps<{
  title: string;
  size: string;
}>();
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="w-1.5 h-6 bg-primary rounded-full block"></span>
    <h3 class="font-bold text-gray-900 dark:text-white" :class="`text-${size}`">
      {{ title }}
    </h3>
  </div>
</template>
