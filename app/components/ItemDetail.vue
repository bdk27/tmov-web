<script setup lang="ts">
const props = defineProps<{
  item: TmdbDetail;
  loading: boolean;
}>();

const {
  posterUrl,
  backdropUrl,
  getRating,
  getRatingColor,
  formatRuntime,
  getDetailTitle,
  getDetailImage,
  titleOf,
  formatCurrency,
  getDirectors,
  getWriters,
  getYoutubeThumb,
} = useTmdb();

// 判斷類型
const isPerson = computed(() => props.item.media_type === "person");
const isTv = computed(() => props.item.media_type === "tv");

// 標題
const title = computed(() => getDetailTitle(props.item));

// 日期 (生日 或 上映日)
const dateLabel = computed(() => {
  if (isPerson.value)
    return props.item.birthday ? `出生於 ${props.item.birthday}` : "";
  return props.item.release_date || props.item.first_air_date || "";
});

// 副標題 (出生地 或 標語)
const subtitle = computed(() => {
  if (isPerson.value) return props.item.place_of_birth || "";
  return props.item.tagline || "";
});

// 規格資訊 (片長/季數)
const specs = computed(() => {
  if (isPerson.value) return null;
  if (isTv.value)
    return `${props.item.number_of_seasons} 季 · ${props.item.number_of_episodes} 集`;
  return formatRuntime(props.item.runtime);
});

// 列表標題 (演員表 或 演出作品)
const listTitle = computed(() => (isPerson.value ? "演出作品" : "主要演員"));

// 列表資料 (Cast 或 Combined Credits)
const listItems = computed(() => {
  if (isPerson.value) {
    // 人物：顯示他演過的作品 (取前 15 部)
    return props.item.combined_credits?.cast?.slice(0, 15) || [];
  } else {
    // 影視：顯示演員 (取前 15 位)
    return props.item.credits?.cast?.slice(0, 15) || [];
  }
});

// 收藏狀態
const isFavorited = ref(false);

// 切換收藏
const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value;
};
</script>

<template>
  <div
    v-if="item"
    class="relative min-h-screen pb-20 bg-white dark:bg-gray-950 dark:text-white"
  >
    <!-- 1. 沉浸式背景區 -->
    <div class="absolute inset-0 h-[55vh] lg:h-[65vh] w-full overflow-hidden">
      <!-- 背景圖片層 -->
      <div class="absolute inset-0">
        <img
          v-if="!isPerson && item.backdrop_path"
          :src="backdropUrl(item.backdrop_path, 'original')"
          class="w-full h-full object-cover object-top animate-fade-in"
          alt="Backdrop"
        />
        <!-- 人物或無圖時的備用背景 (深色漸層) -->
        <div
          v-else
          class="w-full h-full bg-linear-to-br from-gray-800 via-gray-900 to-black"
        ></div>
      </div>

      <!-- 漸層遮罩 (讓底部完美融合到頁面背景) -->
      <div
        class="absolute inset-0 bg-linear-to-t from-white via-white/60 to-gray/60 dark:from-gray-950 dark:via-gray-950/60 dark:to-gray-950/0 z-10"
      ></div>
      <!-- 頂部暗角 (讓文字更清楚) -->
      <div
        class="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-transparent z-10"
      ></div>
    </div>

    <!-- 2. 主要內容區 -->
    <div class="container mx-auto px-4 relative z-20 pt-[15vh]">
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">
        <!-- 左側：海報與操作 -->
        <div
          class="w-full max-w-50 mx-auto lg:mx-0 lg:w-70 shrink-0 animate-slide-up"
        >
          <!-- 海報 -->
          <div
            class="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10 bg-gray-200 dark:bg-gray-800 aspect-2/3 relative group"
          >
            <img
              :src="posterUrl(getDetailImage(item))"
              :alt="title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <!-- 播放按鈕 (僅影視) -->
          <div v-if="!isPerson" class="mt-6">
            <UButton
              block
              size="xl"
              color="primary"
              variant="solid"
              class="font-bold shadow-lg shadow-primary-500/30"
              icon="i-heroicons-play-circle"
            >
              播放預告片
            </UButton>
          </div>
        </div>

        <!-- 右側：詳細資訊 -->
        <div
          class="md:flex-1 text-center lg:text-left animate-slide-up animation-delay-200"
        >
          <!-- 標題 -->
          <h1
            class="text-2xl md:text-5xl lg:text-4xl font-bold mb-2 tracking-wide text-white"
          >
            {{ title }}
          </h1>

          <!-- 副標題 / 標語 -->
          <p
            v-if="subtitle"
            class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 italic font-serif opacity-90"
          >
            {{ subtitle }}
          </p>

          <!-- 資訊列 -->
          <div
            class="flex items-center justify-center lg:justify-start gap-4 mb-8 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <!-- 評分徽章 -->
            <div
              v-if="!isPerson && item.vote_average"
              class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/50 backdrop-blur rounded-full border border-gray-200 dark:border-gray-700/50"
            >
              <UIcon
                name="i-heroicons-star-solid"
                class="w-5 h-5 text-yellow-400"
              />
              <span class="text-lg" :class="getRatingColor(getRating(item))">{{
                item.vote_average.toFixed(1)
              }}</span>
            </div>

            <!-- 日期 -->
            <div v-if="dateLabel">
              <p>
                {{ dateLabel }}
              </p>
            </div>

            <!-- 時間 -->
            <div v-if="specs">
              <p>{{ specs }}</p>
            </div>

            <!-- 加入收藏 -->
            <div class="hidden md:block">
              <UButton
                size="sm"
                variant="outline"
                color="primary"
                class="px-3 py-1.5 rounded-full transition-colors group"
                @click="toggleFavorite"
              >
                <UIcon
                  v-if="!isFavorited"
                  size="15"
                  name="i-heroicons-heart-solid"
                  class="group-hover:bg-red-500 group-active:bg-red-500"
                />
                <span>{{ isFavorited ? "已收藏" : "加入收藏" }}</span>
              </UButton>
            </div>
            <div class="block md:hidden">
              <UIcon
                size="20"
                name="i-heroicons-heart-solid"
                class="hover:bg-red-500 active:bg-red-500"
                :class="isFavorited ? 'bg-red-500' : ''"
                @click="toggleFavorite"
              />
            </div>
          </div>

          <!-- 類型標籤 (Pills 風格) -->
          <div
            v-if="item.genres && item.genres.length"
            class="flex flex-wrap justify-center lg:justify-start gap-2 mb-10"
          >
            <span
              v-for="genre in item.genres"
              :key="genre.id"
              class="px-3 py-1 text-sm font-semibold rounded-full border border-gray-300 dark:border-gray-700 hover:border-primary-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-default"
            >
              {{ genre.name }}
            </span>
          </div>

          <div
            v-if="!isPerson"
            class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8"
          >
            <!-- 導演 -->
            <div>
              <p class="text-xs">導演</p>
              <div v-for="director in getDirectors(item)" :key="director.id">
                <p>
                  {{ director.name }}
                </p>
              </div>
            </div>
            <!-- 作者 -->
            <div>
              <p class="text-xs">作者</p>
              <div v-for="writer in getWriters(item)" :key="writer.id">
                <p>
                  {{ writer.name }}
                </p>
              </div>
            </div>
            <!-- 製作公司 -->
            <div v-if="item.production_companies?.length">
              <p class="text-xs">製作公司</p>
              <div
                v-for="comp in item.production_companies.slice(0, 1)"
                :key="comp.id"
              >
                <p>
                  {{ comp.name }}
                </p>
              </div>
            </div>
            <!-- 預算 -->
            <div class="flex flex-col">
              <p class="text-xs">預算</p>
              <p>{{ formatCurrency(item.budget) }}</p>
            </div>
            <!-- 票房 -->
            <div class="flex flex-col">
              <p class="text-xs">票房</p>
              <p>{{ formatCurrency(item.revenue) }}</p>
            </div>
          </div>

          <!-- 概要 -->
          <div class="mb-10">
            <div class="flex items-center gap-2 mb-4">
              <span class="w-1.5 h-6 bg-primary rounded-full block"></span>
              <h3 class="text-xl font-bold">概要</h3>
            </div>
            <p>{{ item.overview || item.biography }}</p>
          </div>

          <!-- 演員表 -->
          <div class="overflow-hidden">
            <div class="flex items-center gap-2 mb-4">
              <span class="w-1.5 h-6 bg-primary rounded-full block"></span>
              <h3 class="text-xl font-bold">主要演員</h3>
            </div>

            <Carousel :items="listItems" class="w-full lg:max-w-200" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}
.animate-slide-up {
  animation: slideUp 0.8s ease-out forwards;
  opacity: 0;
}
.animation-delay-200 {
  animation-delay: 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
