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
// const paginationTotal = computed(() => {
//   const MAX_PAGES = 500;
//   const pages = totalPages.value > MAX_PAGES ? MAX_PAGES : totalPages.value;
//   return pages * 20;
// });

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

    <!-- 標題列 + 排序選單-->
    <div
      v-if="!loading && !apiError"
      class="w-full mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4"
    >
      <!-- 搜尋結果資訊 -->
      <div class="text-neutral-400 text-sm">
        <div class="text-xl font-bold text-neutral-900 dark:text-white mb-1">
          搜尋「 <span class="text-primary">{{ currentQuery }}</span> 」的結果
        </div>
        <div v-if="totalResults > 0">共找到 {{ totalResults }} 筆資料</div>
      </div>

      <!-- 排序選單 -->
      <div>
        <USelect
          v-model="sortBy"
          :items="sortOptions"
          option-attribute="label"
          icon="i-heroicons-arrows-up-down"
          placeholder="排序方式"
        />
      </div>
    </div>

    <!-- 載入中 -->
    <div
      v-if="loading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <div
        v-for="i in 12"
        :key="`sk-${i}`"
        class="flex flex-col h-full rounded-lg overflow-hidden"
      >
        <USkeleton class="w-full aspect-2/3" />
        <div class="p-3 space-y-2">
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="h-3 w-1/2" />
        </div>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div
      v-else-if="apiError"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon
        name="i-heroicons-exclamation-circle"
        class="text-6xl text-red-500 mb-4"
      />
      <h2 class="text-2xl font-semibold mb-2">搜尋失敗</h2>
      <p class="text-neutral-400 mb-6">{{ apiError }}</p>
      <UButton @click="fetchData">重試</UButton>
    </div>

    <!-- 搜尋結果 -->
    <div
      v-else-if="sortedResults.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <ItemCard v-for="item in sortedResults" :key="item.id" :item="item" />
    </div>

    <!-- 無結果 -->
    <div
      v-else-if="currentQuery && !loading"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon
        name="i-heroicons-information-circle"
        class="text-6xl text-blue-500 mb-4"
      />
      <h2 class="text-2xl font-semibold mb-2">找不到結果</h2>
      <p class="text-neutral-400">找不到符合「{{ currentQuery }}」的項目。</p>
    </div>

    <!-- 分頁 -->
    <div
      v-if="totalResults > 20 && !apiError"
      class="flex justify-center mt-12"
    >
      <UPagination
        v-model:page="currentPage"
        :itemsPerPage="20"
        :total="totalResults"
      />
    </div>
  </div>
</template>
