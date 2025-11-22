<script setup lang="ts">
const tmdbStore = useTmdbStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();

const { results, totalPages, totalResults, loading } = storeToRefs(tmdbStore);

const typeOptions = [
  { label: "綜合", value: "multi" },
  { label: "電影", value: "movie" },
  { label: "電視節目", value: "tv" },
  { label: "人物", value: "person" },
];

// 篩選條件
const currentQuery = ref("");
const typeFilter = ref<TmdbSearchOptions["type"]>("multi");
const yearFilter = ref<number | null>(null);
const apiError = ref<string | null>(null);
const currentPage = ref(1);
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
    toast.add({
      title: "搜尋失敗",
      description: apiError.value,
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
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
      return items; // 保持 API 原本的順序
  }
});

function triggerSearch(resetFilters = false) {
  if (resetFilters) {
    typeFilter.value = "multi";
    yearFilter.value = null;
  }

  const query: Record<string, any> = {
    q: currentQuery.value,
    page: 1,
    type: typeFilter.value,
  };

  if (yearFilter.value) {
    query.year = yearFilter.value;
  }

  router.push({ query });
}

function handlePageChange(page: number) {
  const newQuery = { ...route.query, page: page };
  router.push({ query: newQuery });
  window.scrollTo(0, 0);
}

watch(
  () => route.query,
  (newQuery) => {
    currentQuery.value = (newQuery.q as string) || "";
    currentPage.value = parseInt(newQuery.page as string) || 1;
    typeFilter.value = (newQuery.type as TmdbSearchOptions["type"]) || "multi";
    yearFilter.value = newQuery.year ? parseInt(newQuery.year as string) : null;

    // (可選) 從 URL 讀取排序
    // sortBy.value = (newQuery.sort as string) || 'relevance';

    if (currentQuery.value.trim()) {
      fetchData();
    } else {
      // store 的重置邏輯可能需要補上，這裡先手動清空 store 比較麻煩，
      // 通常 store 會有一個 clearResults action，如果沒有就算了
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <!-- 標題列 + 排序選單-->
    <div
      v-if="!loading && !apiError"
      class="w-full mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4"
    >
      <!-- 搜尋結果資訊 -->
      <div class="text-neutral-400 text-sm">
        <div class="text-xl font-bold text-neutral-900 dark:text-white mb-1">
          搜尋「<span class="text-primary">{{ currentQuery }}</span
          >」的結果
        </div>
        <div v-if="totalResults > 0">共找到 {{ totalResults }} 筆資料</div>
      </div>

      <!-- 排序選單 -->
      <div class="">
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
    <div v-if="loading" class="text-center py-20">
      <UIcon
        name="i-heroicons-arrow-path-20-solid"
        class="animate-spin text-4xl text-primary"
      />
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
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
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

    <!-- UPagination -->
    <div
      v-if="totalResults > 20 && !loading && !apiError"
      class="flex justify-center mt-12"
    >
      <UPagination
        :model-value="currentPage"
        :page-count="20"
        :total="totalResults"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>
