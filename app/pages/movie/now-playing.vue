<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();

const {
  nowPlayingMovies,
  nowPlayingMoviesTotal,
  nowPlayingMoviesLoading,
  nowPlayingMoviesError,
} = storeToRefs(tmdbStore);

useHead({
  title: "現正熱映",
});

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
  await tmdbStore.getNowPlayingMovies(currentPage.value);
}

// 監聽分頁變化
watch(currentPage, fetchData, { immediate: true });
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <PagedMediaGrid
      title="現正熱映"
      :items="nowPlayingMovies"
      :loading="nowPlayingMoviesLoading"
      :error="nowPlayingMoviesError"
      :total-results="nowPlayingMoviesTotal"
      v-model:current-page="currentPage"
      @retry="fetchData"
    />
  </div>
</template>
