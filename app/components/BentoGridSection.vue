<script setup lang="ts">
const props = defineProps<{
  title: string;
  items: TmdbItem[];
  loading: boolean;
}>();

const { posterUrl, titleOf, dateOf, getRating } = useTmdb();
const { isFavorite, isLoading, handleFavorite } = useFavorite(props.items);

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
            <div
              class="absolute top-2 left-2 p-1.5 cursor-pointer rounded-full transition-all duration-200 backdrop-blur-sm z-10 flex items-center justify-center"
              :class="[
                isFavorite
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-black/40 text-white hover:bg-black/60 hover:text-red-400',
              ]"
              @click.prevent.stop="handleFavorite"
              :title="isFavorite ? '取消收藏' : '加入收藏'"
            >
              <UIcon
                :name="
                  isFavorite ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'
                "
                class="w-6 h-6 transition-transform active:scale-90"
                :class="{ 'animate-pulse': isLoading }"
              />
            </div>
          </div>

          <!-- 詳細資訊 -->
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
