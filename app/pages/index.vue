<script setup lang="ts">
import { storeToRefs } from "pinia";

const router = useRouter();
const tmdbStore = useTmdbStore();
const { handleSearch } = useSearch();

const {
  backdropDesktopUrl,
  backdropMobileUrl,
  trailerUrl,
  trendingToday,
  popularMovies,
  popularTv,
  popularPerson,
  trendingWeek,
  nowPlaying,
  upcoming,
} = storeToRefs(tmdbStore);

// 背景圖片
await useAsyncData("heroData", () => tmdbStore.getBackdrop());

onMounted(() => {
  tmdbStore.getTrendingToday().catch((err) => {
    console.error(err);
  });
  tmdbStore.getPopularMovies().catch((err) => {
    console.error(err);
  });
  tmdbStore.getNowPlaying().catch((err) => console.error(err));
  tmdbStore.getUpcoming().catch((err) => console.error(err));
});

const popularTab = ref(0); // 0: 電影, 1: 電視節目, 2: 人物
const trendingTab = ref(0); // 0: 今日, 1: 本週
const popularTabItems = [
  { label: "熱門電影", value: 0 },
  { label: "熱門電視節目", value: 1 },
  { label: "熱門人物", value: 2 },
];
const trendingTabItems = [
  { label: "今日趨勢", value: 0 },
  { label: "本週趨勢", value: 1 },
];

watch(popularTab, (newValue) => {
  if (newValue === 1 && popularTv.value.length === 0) {
    tmdbStore.getPopularTv();
  } else if (newValue === 2 && popularPerson.value.length === 0) {
    tmdbStore.getPopularPerson();
  }
});
watch(trendingTab, (newValue) => {
  if (newValue === 1 && trendingWeek.value.length === 0) {
    tmdbStore.getTrendingWeek();
  }
});
const popularItems = computed((): TmdbItem[] => {
  if (popularTab.value === 0) return popularMovies?.value || [];
  if (popularTab.value === 1) return popularTv?.value || [];
  return popularPerson?.value || [];
});
const trendingItems = computed((): TmdbItem[] => {
  return trendingTab.value === 0 ? trendingToday.value : trendingWeek.value;
});
// 切換熱門電影、影集、人物 loading
const isPopularLoading = computed(() => {
  if (popularTab.value === 0) return popularMovies.value.length === 0;
  if (popularTab.value === 1) return popularTv.value.length === 0;
  if (popularTab.value === 2) return popularPerson.value.length === 0;
  return false;
});
// 切換趨勢今日、本週 loading
const isTrendingLoading = computed(() => {
  if (trendingTab.value === 0) return trendingToday.value.length === 0;
  if (trendingTab.value === 1) return trendingWeek.value.length === 0;
  return false;
});

const isNowPlayingLoading = computed(() => nowPlaying.value.length === 0);
const isUpcomingLoading = computed(() => upcoming.value.length === 0);

// 搜尋
const query = ref("");
const type = ref<TmdbSearchOptions["type"]>("multi");
const year = ref<number | null>(null);
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
    <!-- 現正熱映 -->
    <BentoGridSection
      title="現正熱映"
      :items="nowPlaying"
      :loading="isNowPlayingLoading"
    />

    <!-- 熱門 -->
    <ItemsCarouselSection
      :tabs="trendingTabItems"
      v-model="trendingTab"
      :items="trendingItems"
      :loading="isTrendingLoading"
    />

    <!-- 即將上映 -->
    <TrailerListSection
      title="最新預告片"
      :items="upcoming"
      :loading="isUpcomingLoading"
    />

    <!-- 趨勢 -->
    <ItemsCarouselSection
      :tabs="popularTabItems"
      v-model="popularTab"
      :items="popularItems"
      :loading="isPopularLoading"
    />
  </div>
</template>
