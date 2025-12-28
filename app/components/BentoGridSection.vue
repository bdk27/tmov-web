<script setup lang="ts">
const props = defineProps<{
  title: string;
  items: TmdbItem[];
  loading: boolean;
}>();

// 1 ~ 3名
const topItems = computed(() => props.items.slice(0, 3));

// 4 ~ 10名
const bottomItems = computed(() => props.items.slice(3, 10));
</script>

<template>
  <div
    class="container mx-auto max-w-6xl px-4 py-16 border-b border-gray-200 dark:border-gray-800 last:border-0"
  >
    <!-- 大標題 -->
    <div class="flex items-center justify-between mb-8">
      <SubTitle :title="title" size="2xl" />

      <NuxtLink
        to="/movie/now-playing"
        class="flex items-center justify-center hover:text-primary"
      >
        <p>更多</p>
        <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
      </NuxtLink>
    </div>

    <div v-if="!loading && items.length > 0" class="flex flex-col gap-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RankCard
          v-for="(item, index) in topItems"
          :key="item.id"
          :item="item"
          :index="index"
        />
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div v-for="item in bottomItems" :key="item.id">
          <ItemCard :item="item" />
        </div>
      </div>
    </div>

    <!-- 載入中 -->
    <div v-else class="flex flex-col gap-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <USkeleton v-for="i in 3" :key="i" class="h-48 rounded-xl" />
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <USkeleton v-for="i in 7" :key="i" class="aspect-2/3 rounded-lg" />
      </div>
    </div>
  </div>
</template>
