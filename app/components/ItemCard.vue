<script setup lang="ts">
const props = defineProps<{ item: TmdbItem }>();
const { posterUrl, titleOf, dateOf, getRating } = useTmdb();
const { isFavorite, isLoading, handleFavorite } = useFavorite(props.item);

const itemPath = computed(() => {
  const item = props.item as any;

  if (item.media_type === "person") return `/person/${item.id}`;
  if (item.media_type === "tv") return `/tv/${item.id}`;
  if (item.media_type === "movie") return `/movie/${item.id}`;

  if (item.known_for_department || item.gender !== undefined)
    return `/person/${item.id}`;

  if (item.first_air_date) return `/tv/${item.id}`;

  return `/movie/${item.id}`;
});

// 圖片
const imgSrc = computed(() =>
  posterUrl(props.item?.poster_path ?? props.item?.profile_path ?? null)
);

// 標題
const title = computed(() => titleOf(props.item));

// 日期
const date = computed(() => dateOf(props.item));
</script>

<template>
  <NuxtLink :to="itemPath" class="group block h-full">
    <UCard
      class="h-full bg-transparent"
      :ui="{
        root: 'divide-y-0 ring-0 rounded-t-xl',
        header: 'p-0 sm:p-0',
        footer: 'p-0 sm:p-0',
      }"
    >
      <template #header>
        <div class="relative overflow-hidden aspect-2/3">
          <!-- 圖片 -->
          <img
            :src="imgSrc"
            :alt="title"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <!-- 加入收藏 -->
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
      </template>

      <template #footer>
        <div class="pt-2">
          <!-- 標題 -->
          <h4 class="font-medium truncate">
            {{ title }}
          </h4>
          <div class="flex items-center">
            <!-- 日期 -->
            <div v-if="date !== 'Unknown'" class="text-xs opacity-70 mr-3">
              {{ date }}
            </div>
            <!-- 評分表 -->
            <div
              v-if="item.vote_average"
              class="flex items-center font-bold text-sm"
              :class="getRatingColor(getRating(item))"
            >
              <UIcon name="i-heroicons-star-20-solid" class="w-3 h-3 mr-0.5" />
              {{ item.vote_average.toFixed(1) }}
            </div>
          </div>
        </div>
      </template>
    </UCard>
  </NuxtLink>
</template>
