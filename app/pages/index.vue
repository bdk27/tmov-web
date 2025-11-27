<script setup lang="ts">
import { storeToRefs } from "pinia";

const router = useRouter();
const tmdbStore = useTmdbStore();
const { handleSearch } = useSearch();

const {
  backdropDesktopUrl,
  backdropMobileUrl,
  nowPlaying,
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
  tmdbStore.getNowPlaying();
  tmdbStore.getTrendingToday();
  tmdbStore.getTrendingWeek();
  tmdbStore.getPopularMovies();
  tmdbStore.getPopularTv();
  tmdbStore.getPopularAnime();
  tmdbStore.getPopularVariety();
});

// loading 狀態
const isNowPlayingLoading = computed(() => nowPlaying.value.length === 0);
// const isUpcomingLoading = computed(() => upcoming.value.length === 0);
const isMovieLoading = computed(() => popularMovies.value.length === 0);
const isTvLoading = computed(() => popularTv.value.length === 0);
const isAnimeLoading = computed(() => popularAnime.value.length === 0);
const isVarietyLoading = computed(() => popularVariety.value.length === 0);

// 搜尋
const query = ref("");
const type = ref<TmdbSearchOptions["type"]>("multi");
const year = ref<number | null>(null);

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
  <div>
    <div class="relative overflow-hidden">
      <!-- 背景圖片 -->
      <picture v-if="backdropMobileUrl" class="absolute inset-0 -z-20 bg-white">
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
      <div
        class="absolute inset-0 -z-10 transition-all duration-1000"
        :style="{ backgroundImage: 'var(--hero-gradient)' }"
      ></div>
      <!-- 標題 + 表單 -->
      <UPageHero
        headline=""
        orientation="horizontal"
        :reverse="true"
        class="container mx-auto"
      >
        <template #title>
          <h1
            class="text-white text-5xl sm:text-6xl font-extrabold mb-4 leading-tight"
          >
            <span class="text-primary">下一部必看</span>
            <br />
            <span class="text-t-card-heading"> 從 TMOV. 開始 </span>
          </h1>
          <h3 class="text-xl sm:text-2xl font-light mb-14 text-white">
            上百萬部電影、電視節目和演員資料等你來探索
          </h3>

          <SearchForm
            :query="query"
            :type="type"
            :year="year"
            @submit-search="handleSearch"
          />
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
              class="absolute inset-0 w-full h-full rounded-lg"
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
      :items="nowPlaying"
      :loading="isNowPlayingLoading"
    />

    <!-- 熱門電影 -->
    <CategoryCarouselSection
      title="熱門電影"
      :items="popularMovies"
      :loading="isMovieLoading"
    />

    <!-- 熱門電視劇 -->
    <CategoryCarouselSection
      title="熱門電視劇"
      :items="popularTv"
      :loading="isTvLoading"
    />

    <!-- 熱門動畫 -->
    <CategoryCarouselSection
      title="熱門動畫"
      :items="popularAnime"
      :loading="isAnimeLoading"
    />

    <!-- 熱門綜藝 -->
    <CategoryCarouselSection
      title="熱門綜藝"
      :items="popularVariety"
      :loading="isVarietyLoading"
    />
  </div>
</template>
