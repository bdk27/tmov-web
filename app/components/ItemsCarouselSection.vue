<script setup lang="ts">
const tmdbStore = useTmdbStore();

const { trendingToday, popularMovies, popularTv, trendingWeek } =
  storeToRefs(tmdbStore);

onMounted(() => {
  tmdbStore.getTrendingToday().catch((err) => {
    console.error(err);
  });
  tmdbStore.getPopularMovies().catch((err) => {
    console.error(err);
  });
});

const popularTab = ref(0); // 0: 電影, 1: 影集
const trendingTab = ref(0); // 0: 本日, 1: 本週
const popularTabItems = [{ label: "電影" }, { label: "電視影集" }];
const trendingTabItems = [{ label: "本日趨勢" }, { label: "本週趨勢" }];

watch(popularTab, (newValue) => {
  if (newValue === 1 && popularTv.value.length === 0) {
    tmdbStore.getPopularTv();
  }
});
watch(trendingTab, (newValue) => {
  if (newValue === 1 && trendingWeek.value.length === 0) {
    tmdbStore.getTrendingWeek();
  }
});
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-16 sm:py-24">
    <!-- 熱門 -->
    <div>
      <UTabs
        :items="popularTabItems"
        v-model="popularTab"
        class="mb-12"
        variant="link"
      />

      <!-- 電影分頁 -->
      <div v-if="popularTab === 0">
        <div v-if="popularMovies.length > 0">
          <Carousel :items="popularMovies" />
        </div>
        <div
          v-else
          class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          <div
            v-for="i in 6"
            :key="`sk-movie-${i}`"
            class="flex flex-col gap-2"
          >
            <USkeleton class="w-full aspect-2/3" />
            <USkeleton class="h-5 w-3/4" />
          </div>
        </div>
      </div>
      <!-- 影集分頁 -->
      <div v-else-if="popularTab === 1">
        <div v-if="popularTv.length > 0">
          <Carousel :items="popularTv" />
        </div>
        <div
          v-else
          class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          <div v-for="i in 6" :key="`sk-tv-${i}`" class="flex flex-col gap-2">
            <USkeleton class="w-full aspect-2/3" />
            <USkeleton class="h-5 w-3/4" />
          </div>
        </div>
      </div>
    </div>
    <!-- 趨勢 -->
    <div>
      <UTabs :items="trendingTabItems" v-model="trendingTab" class="mb-12" />

      <!-- 每日趨勢 -->
      <div v-if="trendingTab === 0">
        <div v-if="trendingToday.length > 0">
          <Carousel :items="trendingToday" />
        </div>
        <div
          v-else
          class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          <div
            v-for="i in 6"
            :key="`sk-trend-day-${i}`"
            class="flex flex-col gap-2"
          >
            <USkeleton class="w-full aspect-2/3" />
            <USkeleton class="h-5 w-3/4" />
          </div>
        </div>
      </div>
      <!-- 每週趨勢 -->
      <div v-else-if="trendingTab === 1">
        <div v-if="trendingWeek.length > 0">
          <Carousel :items="trendingWeek" />
        </div>
        <div
          v-else
          class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          <div
            v-for="i in 6"
            :key="`sk-trend-week-${i}`"
            class="flex flex-col gap-2"
          >
            <USkeleton class="w-full aspect-2/3" />
            <USkeleton class="h-5 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
