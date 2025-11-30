<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();

// 使用 Store 中對應的狀態
const {
  popularMovies,
  popularMoviesTotal,
  popularMoviesLoading,
  popularMoviesError,
} = storeToRefs(tmdbStore);

// 分頁邏輯
const currentPage = computed({
  get: () => parseInt(route.query.page as string) || 1,
  set: (val) => {
    router.push({ query: { ...route.query, page: val } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
});

// 獲取資料
async function fetchData() {
  await tmdbStore.getPopularMovies(currentPage.value);
}

// 監聽分頁變化
watch(currentPage, fetchData, { immediate: true });
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <PagedMediaGrid
      title="熱門電影"
      :items="popularMovies"
      :loading="popularMoviesLoading"
      :error="popularMoviesError"
      :total-results="popularMoviesTotal"
      v-model:current-page="currentPage"
      @retry="fetchData"
    />
  </div>
</template>
