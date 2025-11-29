<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();
const { handleSearch } = useSearch();

const { results, totalPages, totalResults, loading } = storeToRefs(tmdbStore);

const currentPage = computed({
  get: () => parseInt(route.query.page as string) || 1,

  set: (val) => {
    router.push({ query: { ...route.query, page: val } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
});

// 篩選條件
const currentQuery = ref("");
const typeFilter = ref<TmdbSearchOptions["type"]>("multi");
const yearFilter = ref<number | null>(null);
const apiError = ref<string | null>(null);
async function fetchData() {
  if (!currentQuery.value.trim()) return;

  apiError.value = null;

  try {
    const options: TmdbSearchOptions = {
      page: currentPage.value,
      type: typeFilter.value,
    };
    if (yearFilter.value) {
      options.year = yearFilter.value;
    }

    await tmdbStore.doSearch(currentQuery.value, options);
  } catch (error: any) {
    apiError.value = "搜尋發生錯誤";
  }
}

// 排序
const sortBy = ref("relevance"); // 預設：關聯性
const sortOptions = [
  { label: "關聯性", value: "relevance" },
  { label: "日期 : 新 → 舊", value: "date-desc" },
  { label: "日期 : 舊 → 新", value: "date-asc" },
  { label: "人氣 : 高 → 低", value: "popularity-desc" },
  { label: "人氣 : 低 → 高", value: "popularity-asc" },
  { label: "評分 : 高 → 低", value: "rating-desc" },
  { label: "評分 : 低 → 高", value: "rating-asc" },
];
const sortedResults = computed(() => {
  const items = [...results.value];

  const getDate = (item: TmdbItem) => {
    const dateStr = item.release_date || item.first_air_date;
    return dateStr ? new Date(dateStr).getTime() : 0;
  };

  switch (sortBy.value) {
    case "date-desc":
      return items.sort((a, b) => getDate(b) - getDate(a));
    case "date-asc":
      return items.sort((a, b) => getDate(a) - getDate(b));
    case "popularity-desc":
      return items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    case "popularity-asc":
      return items.sort((a, b) => (a.popularity || 0) - (b.popularity || 0));
    case "rating-desc":
      return items.sort(
        (a, b) => (b.vote_average || 0) - (a.vote_average || 0)
      );
    case "rating-asc":
      return items.sort(
        (a, b) => (a.vote_average || 0) - (b.vote_average || 0)
      );
    case "relevance":
    default:
      return items;
  }
});

watch(
  () => route.query,
  (newQuery) => {
    currentQuery.value = (newQuery.q as string) || "";
    currentPage.value = parseInt(newQuery.page as string) || 1;
    typeFilter.value = (newQuery.type as TmdbSearchOptions["type"]) || "multi";
    yearFilter.value = newQuery.year ? parseInt(newQuery.year as string) : null;

    if (currentQuery.value.trim()) {
      fetchData();
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <!-- 搜尋 -->
    <SearchForm
      :query="currentQuery"
      :type="typeFilter"
      :year="yearFilter"
      :variant="'row'"
      @submit-search="handleSearch"
      class="mb-8"
    />

    <PagedMediaGrid
      title="搜尋結果"
      :items="results"
      :loading="loading"
      :error="apiError"
      :total-results="totalResults"
      v-model:current-page="currentPage"
      @retry="fetchData"
    >
      <template #title>
        搜尋「<span class="text-primary">{{ currentQuery }}</span
        >」的結果
      </template>
    </PagedMediaGrid>
  </div>
</template>
