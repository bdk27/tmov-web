<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();

// 使用 Store 中對應的狀態
const {
  upcomingMovies,
  upcomingMoviesTotal,
  upcomingMoviesLoading,
  upcomingMoviesError,
} = storeToRefs(tmdbStore);

// 分頁邏輯 (一樣同步 URL)
const currentPage = computed({
  get: () => parseInt(route.query.page as string) || 1,
  set: (val) => {
    router.push({ query: { ...route.query, page: val } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
});

// 獲取資料
async function fetchData() {
  await tmdbStore.getUpcomingMovies(currentPage.value);
}

// 監聽分頁變化
watch(currentPage, fetchData, { immediate: true });
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <PagedMediaGrid
      title="即將上映"
      :items="upcomingMovies"
      :loading="upcomingMoviesLoading"
      :error="upcomingMoviesError"
      :total-results="upcomingMoviesTotal"
      v-model:current-page="currentPage"
      @retry="fetchData"
    />
  </div>
</template>
