<script setup lang="ts">
import type { TmdbItem } from "~/composables/useTmdb";

defineProps<{
  title: string;
  items: TmdbItem[];
  loading: boolean;
}>();
</script>

<template>
  <div
    class="container mx-auto max-w-6xl px-4 py-12 sm:py-16 border-b border-gray-200 dark:border-gray-800 last:border-0"
  >
    <!-- 標題 -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center justify-center gap-2">
        <span class="w-1.5 h-6 bg-primary-500 rounded-full block"></span>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
      </div>

      <NuxtLink
        to=""
        class="flex items-center justify-center hover:text-primary"
      >
        <p>更多</p>
        <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
      </NuxtLink>
    </div>

    <!-- 輪播 -->
    <div v-if="!loading && items.length > 0">
      <Carousel :items="items" />
    </div>

    <!-- loading -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="i in 5" :key="`sk-cat-${i}`" class="flex flex-col gap-2">
        <USkeleton class="w-full aspect-2/3 rounded-lg" />
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-3 w-1/2" />
      </div>
    </div>
  </div>
</template>
