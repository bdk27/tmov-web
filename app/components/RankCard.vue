<script setup lang="ts">
const props = defineProps<{
  item: TmdbItem;
  index: number;
}>();

const { posterUrl, titleOf, dateOf, getRating } = useTmdb();
const { isFavorite, isLoading, handleFavorite } = useFavorite(props.item);

// 評分顏色輔助
const getRatingColor = (rating: number) => {
  if (rating >= 7) return "text-green-500";
  if (rating >= 5) return "text-yellow-500";
  return "text-red-500";
};
</script>

<template>
  <NuxtLink
    :to="`/movie/${item.id}`"
    class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-row hover:scale-[1.05] transition-transform duration-300"
  >
    <!-- 海報圖片 -->
    <div class="w-1/2 relative aspect-2/3">
      <img
        :src="posterUrl(item.poster_path ?? null)"
        :alt="titleOf(item)"
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
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
          :name="isFavorite ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
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
          class="w-10 bg-primary text-neutral-800 text-sm px-2 py-1 rounded-br-lg shadow-md mb-3 font-bold"
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
            <UIcon name="i-heroicons-star-20-solid" class="w-3 h-3 mr-0.5" />
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
</template>
