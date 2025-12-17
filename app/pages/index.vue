<script setup lang="ts">
import { storeToRefs } from "pinia";

const tmdbStore = useTmdbStore();

const {
  backdropDesktopUrl,
  backdropMobileUrl,
  nowPlayingMovies,
  trailerUrl,
  trendingToday,
  trendingWeek,
  popularMovies,
  popularTv,
  popularAnime,
  popularVariety,
} = storeToRefs(tmdbStore);

// 背景圖片
await useAsyncData("heroData", () => tmdbStore.getBackdrop());

onMounted(() => {
  tmdbStore.getTrendingToday();
  tmdbStore.getTrendingWeek();
  tmdbStore.getNowPlayingMovies();
  tmdbStore.getPopularMovies();
  tmdbStore.getPopularTv();
  tmdbStore.getPopularAnime();
  tmdbStore.getPopularVariety();
});

// 頁首連結
const links = ref([
  {
    label: "加入 TMOV",
    to: "/login",
    icon: "i-lucide-user-plus",
  },
  {
    label: "前往探索",
    to: "/movie",
    color: "neutral" as const,
    variant: "subtle" as const,
    trailingIcon: "i-lucide-arrow-right",
  },
]);

// loading 狀態
const isNowPlayingLoading = computed(() => nowPlayingMovies.value.length === 0);
const isMovieLoading = computed(() => popularMovies.value.length === 0);
const isTvLoading = computed(() => popularTv.value.length === 0);
const isAnimeLoading = computed(() => popularAnime.value.length === 0);
const isVarietyLoading = computed(() => popularVariety.value.length === 0);

const trendingTab = ref(0); // 0: 今日, 1: 本週;
const trendingTabItems = [
  { label: "今日趨勢", value: 0 },
  { label: "本週趨勢", value: 1 },
];
watch(trendingTab, (newValue) => {
  if (newValue === 1 && trendingWeek.value.length === 0) {
    tmdbStore.getTrendingWeek();
  }
});
const trendingItems = computed((): TmdbItem[] => {
  return trendingTab.value === 0 ? trendingToday.value : trendingWeek.value;
});
const isTrendingLoading = computed(() =>
  trendingTab.value === 0
    ? trendingToday.value.length === 0
    : trendingWeek.value.length === 0
);
</script>

<template>
  <div class="relative">
    <div class="absolute inset-0 w-full overflow-hidden z-0">
      <!-- 背景圖片層 -->
      <div class="absolute inset-0">
        <picture v-if="backdropMobileUrl">
          <source
            v-if="backdropDesktopUrl"
            :srcset="backdropDesktopUrl"
            media="(min-width: 768px)"
          />
          <img
            :src="backdropMobileUrl"
            alt="熱門電影背景"
            class="w-full h-full object-cover"
          />
        </picture>
        <!-- 人物或無圖時的備用背景 (深色漸層) -->
        <div
          class="w-full h-full bg-linear-to-b from-neutral-900 to-black"
        ></div>
      </div>

      <!-- 漸層遮罩 (讓底部完美融合到頁面背景) -->
      <div
        class="absolute inset-0 bg-linear-to-t from-white to-transparent dark:from-neutral-900 z-10"
      ></div>

      <!-- 頂部暗角 (讓文字更清楚) -->
      <div
        class="absolute inset-0 bg-linear-to-b from-black to-transparent z-10"
      ></div>
    </div>

    <!-- 標題 + 表單 -->
    <UPageHero
      headline="歡迎來到 TMOV !"
      orientation="horizontal"
      :links="links"
    >
      <template #title>
        <h1
          class="text-white text-5xl sm:text-6xl font-extrabold mb-4 leading-tight"
        >
          <span class="block">下一部必看</span>
          <span> 從 <span class="text-primary">TMOV.</span> 開始 </span>
        </h1>
        <h3 class="text-xl sm:text-2xl mb-14 text-neutral-200 font-light">
          上百萬部電影、電視節目和演員資料等你來探索
        </h3>
      </template>
      <template #default>
        <div
          class="w-full aspect-video rounded-lg shadow-2xl bg-t-card-bg relative hidden lg:block"
        >
          <iframe
            v-if="trailerUrl"
            :src="trailerUrl"
            title="Popular Movie Trailer"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            class="absolute inset-0 w-full h-full rounded-lg ring-2 ring-primary/50"
          ></iframe>
        </div>
      </template>
    </UPageHero>
  </div>

  <!-- 趨勢 -->
  <ItemsCarouselSection
    :tabs="trendingTabItems"
    v-model="trendingTab"
    :items="trendingItems"
    :loading="isTrendingLoading"
  />

  <!-- 現正熱映 -->
  <BentoGridSection
    title="現正熱映"
    :items="nowPlayingMovies"
    :loading="isNowPlayingLoading"
  />

  <!-- 熱門電影 -->
  <CategoryCarouselSection
    title="熱門電影"
    :items="popularMovies"
    :loading="isMovieLoading"
    :url="'/movie/'"
  />

  <!-- 熱門電視劇 -->
  <CategoryCarouselSection
    title="熱門電視劇"
    :items="popularTv"
    :loading="isTvLoading"
    :url="'/tv/drama'"
  />

  <!-- 熱門動畫 -->
  <CategoryCarouselSection
    title="熱門動畫"
    :items="popularAnime"
    :loading="isAnimeLoading"
    :url="'/tv/anime'"
  />

  <!-- 熱門綜藝 -->
  <CategoryCarouselSection
    title="熱門綜藝"
    :items="popularVariety"
    :loading="isVarietyLoading"
    :url="'/tv/variety'"
  />
</template>
