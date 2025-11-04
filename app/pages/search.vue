<script setup lang="ts">
const { search } = useTmdb();

// Naive UI 元件
const message = useMessage();

const route = useRoute();
const router = useRouter();

// 搜尋結果
const results = ref<TmdbItem[]>([]);
const isLoading = ref(false);
const apiError = ref<string | null>(null);

// 分頁狀態
const currentPage = ref(1);
const totalPages = ref(0);
const totalResults = ref(0);

// 篩選條件
const currentQuery = ref("");
const typeFilter = ref<TmdbSearchOptions["type"]>("multi");
const adultFilter = ref(false);
const yearFilter = ref<number | null>(null);

async function fetchData() {
  isLoading.value = true;
  apiError.value = null;

  try {
    const options: TmdbSearchOptions = {
      page: currentPage.value,
      type: typeFilter.value,
      includeAdult: adultFilter.value,
    };
    if (yearFilter.value) {
      options.year = yearFilter.value;
    }

    const res = await search(currentQuery.value, options);

    results.value = res.results;
    totalPages.value = res.total_pages;
    totalResults.value = res.total_results;
  } catch (error: any) {
    const friendlyMessage = getErrorMessage(error);
    apiError.value = friendlyMessage;
    message.error(friendlyMessage);

    results.value = [];
    totalPages.value = 0;
    totalResults.value = 0;
  } finally {
    isLoading.value = false;
  }
}

function triggerSearch(resetFilters = false) {
  if (resetFilters) {
    typeFilter.value = "multi";
    adultFilter.value = false;
    yearFilter.value = null;
  }

  // 建立新的 query 物件
  const query: Record<string, any> = {
    q: currentQuery.value,
    page: 1, // 任何「新搜尋」都重設回第 1 頁
    type: typeFilter.value,
  };

  if (adultFilter.value) {
    query.adult = "true";
  }
  if (yearFilter.value) {
    query.year = yearFilter.value;
  }

  // 透過 router.push() 更新 URL
  router.push({ query });
}

function handlePageChange(page: number) {
  // 建立一個包含所有目前篩選條件的新 query
  const newQuery = { ...route.query, page: page };
  router.push({ query: newQuery });
  window.scrollTo(0, 0);
}

watch(
  () => route.query,
  (newQuery) => {
    // 1. 從 URL 反向更新 ref
    currentQuery.value = (newQuery.q as string) || "";
    currentPage.value = parseInt(newQuery.page as string) || 1;
    typeFilter.value = (newQuery.type as TmdbSearchOptions["type"]) || "multi";
    adultFilter.value = newQuery.adult === "true";
    yearFilter.value = newQuery.year ? parseInt(newQuery.year as string) : null;

    // 2. 如果 query 存在，才抓取資料
    if (currentQuery.value.trim()) {
      fetchData();
    } else {
      // 如果 query 為空 (例如 /search)，則清空
      results.value = [];
      totalPages.value = 0;
      totalResults.value = 0;
      apiError.value = null;
    }
  },
  { immediate: true, deep: true }
);

// Naive UI 元件選項
const typeOptions = [
  { label: "綜合", value: "multi" },
  { label: "電影", value: "movie" },
  { label: "電視", value: "tv" },
  { label: "人物", value: "person" },
];
</script>

<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <!-- 標題和總結果 -->
    <div v-if="!isLoading && !apiError" class="mb-6 text-neutral-400 text-sm">
      <div class="text-xl font-bold text-white mb-2">
        搜尋「<span class="text-primary">{{ currentQuery }}</span
        >」的結果
      </div>
      <div>共找到 {{ totalResults }} 筆資料</div>
    </div>

    <!-- 進階篩選 -->
    <n-collapse class="mb-6">
      <n-collapse-item title="進階篩選" name="1">
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">類型</label>
              <n-select v-model:value="typeFilter" :options="typeOptions" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">年份</label>
              <n-input-number
                v-model:value="yearFilter"
                placeholder="例如：2023"
                :min="1800"
                :max="new Date().getFullYear() + 1"
                clearable
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">包含成人內容</label>
              <n-switch v-model:value="adultFilter" />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <n-button @click="triggerSearch(true)">重設</n-button>
            <n-button type="primary" @click="triggerSearch(false)"
              >套用篩選</n-button
            >
          </div>
        </div>
      </n-collapse-item>
    </n-collapse>

    <!-- 載入中 -->
    <div v-if="isLoading" class="text-center py-20">
      <n-spin size="large" />
    </div>

    <!-- 錯誤訊息 -->
    <div v-else-if="apiError" class="py-20">
      <n-result status="error" title="搜尋失敗" :description="apiError">
        <template #footer>
          <n-button @click="fetchData">重試</n-button>
        </template>
      </n-result>
    </div>

    <!-- 搜尋結果 -->
    <div
      v-else-if="results.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
    >
      <ItemCard v-for="item in results" :key="item.id" :item="item" />
    </div>

    <!-- 無結果 -->
    <div
      v-else-if="currentQuery && !isLoading"
      class="text-center text-neutral-500 py-20"
    >
      <n-result
        status="info"
        title="找不到結果"
        :description="`找不到符合「${currentQuery}」的項目。`"
      >
      </n-result>
    </div>

    <!-- 分頁 -->
    <div
      v-if="totalPages > 1 && !isLoading && !apiError"
      class="flex justify-center mt-12"
    >
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :on-update:page="handlePageChange"
      />
    </div>
  </div>
</template>
