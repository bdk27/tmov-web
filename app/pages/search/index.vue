<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();

// 使用 Store 中對應的狀態
const { searchResults, searchTotalResults, searchLoading, searchError } =
  storeToRefs(tmdbStore);

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
  const queryStr = route.query.q as string;
  if (!queryStr) return;

  const options: any = {
    page: currentPage.value,
    type: (route.query.type as TmdbSearchOptions["type"]) || "multi",
  };

  if (route.query.year) {
    options.year = Number(route.query.year);
  }

  await tmdbStore.doSearch(queryStr, options);
}

watch(
  () => route.query,
  () => {
    fetchData();
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <PagedMediaGrid
      title="搜尋結果"
      :items="searchResults"
      :loading="searchLoading"
      :error="searchError"
      :total-results="searchTotalResults"
      v-model:current-page="currentPage"
      @retry="fetchData"
    />
  </div>
</template>
