<script setup lang="ts">
const props = defineProps<{
  title: string;
  items: TmdbItem[];
  loading: boolean;
}>();

const { posterUrl, titleOf, dateOf, getRating, getRatingColor } = useTmdb();

// 1 ~ 3名
const topItems = computed(() => props.items.slice(0, 3));

// 4 ~ 10名
const bottomItems = computed(() => props.items.slice(3, 10));
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-16 sm:py-24">
    <!-- 大標題 -->
    <div class="flex items-center justify-center mb-12 gap-3">
      <span class="w-2 h-8 bg-primary rounded-full block"></span>
      <h2 class="text-3xl font-bold">
        {{ title }}
      </h2>
    </div>

    <div v-if="!loading && items.length > 0" class="flex flex-col gap-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="(item, index) in topItems"
          :key="item.id"
          :to="`/movie/${item.id}`"
          class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-row hover:scale-[1.05] transition-transform duration-300"
        >
          <!-- 海報圖片 -->
          <div class="w-1/2 relative aspect-2/3">
            <img
              :src="posterUrl(item.poster_path ?? null)"
              :alt="titleOf(item)"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <!-- 收藏按鈕 -->
            <div class="absolute top-0 left-0 p-1 z-10">
              <UIcon
                name="i-heroicons-plus-circle-20-solid"
                class="w-6 h-6 bg-white/50 hover:bg-white"
              />
            </div>
          </div>

          <!-- 3. 詳細資訊 -->
          <div class="w-1/2 p-4 flex flex-col justify-between relative">
            <div>
              <!-- 排名標籤 -->
              <div
                class="w-10 bg-primary text-neutral-800 text-sm px-2 py-1 rounded-br-lg shadow-md mb-3"
              >
                #{{ index + 1 }}
              </div>
              <!-- 電影標題 -->
              <h3
                class="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1"
              >
                {{ titleOf(item) }}
              </h3>
              <!-- 年份 / 評分 -->
              <div
                class="flex items-center flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3"
              >
                <span>{{ dateOf(item) }}</span>
                <span
                  v-if="item.vote_average"
                  class="flex items-center font-bold text-sm"
                  :class="getRatingColor(getRating(item))"
                >
                  <UIcon
                    name="i-heroicons-star-20-solid"
                    class="w-3 h-3 mr-0.5"
                  />
                  {{ item.vote_average.toFixed(1) }}
                </span>
              </div>
              <!-- 簡介 -->
              <p
                class="text-xs text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed"
              >
                {{ item.overview || "暫無簡介..." }}
              </p>
            </div>
          </div>
        </NuxtLink>
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
