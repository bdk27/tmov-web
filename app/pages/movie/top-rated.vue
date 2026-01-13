<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();

const {
  topRatedMovies,
  topRatedMoviesTotal,
  topRatedMoviesLoading,
  topRatedMoviesError,
} = storeToRefs(tmdbStore);

useHead({
  title: "好評推薦",
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
  await tmdbStore.getTopRatedMovies(currentPage.value);
}

// 監聽分頁變化
watch(currentPage, fetchData, { immediate: true });
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <PagedMediaGrid
      title="好評推薦"
      :items="topRatedMovies"
      :loading="topRatedMoviesLoading"
      :error="topRatedMoviesError"
      :total-results="topRatedMoviesTotal"
      v-model:current-page="currentPage"
      @retry="fetchData"
    />
  </div>
</template>
