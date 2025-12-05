<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();

// 使用 Store 中對應的狀態
const {
  searchResults,
  searchTotalResults,
  searchLoading,
  searchError,
  searchPage,
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
  await tmdbStore.doSearch(route.query.q as string, {
    page: currentPage.value,
    type: (route.query.type as TmdbSearchOptions["type"]) || "multi",
  });
}

// 監聽分頁變化
watch(currentPage, fetchData, { immediate: true });
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <PagedMediaGrid
      title="搜尋結果"
      :items="searchResults"
      :loading="searchLoading"
      :error="searchError"
      :total-results="searchTotalResults"
      v-model:current-page="searchPage"
      @retry="fetchData"
    />
  </div>
</template>
