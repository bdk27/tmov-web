<script setup lang="ts">
const { search } = useTmdb();

// Naive UI 元件
const message = useMessage();

const route = useRoute();

const results = ref<TmdbItem[]>([]);
const isLoading = ref(false);
const apiError = ref<string | null>(null);

const currentQuery = ref("");
const currentPage = ref(1);
const totalPages = ref(0);
const totalResults = ref(0);

async function fetchData() {
  const query = currentQuery.value;
  if (!query.trim()) {
    results.value = [];
    return;
  }

  isLoading.value = true;
  apiError.value = null;

  try {
    const response = await search(query, {
      type: "multi",
      page: currentPage.value,
    });

    results.value = response.results;
    totalPages.value = response.total_pages;
    totalResults.value = response.total_results;
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

function handlePageChange(page: number) {
  currentPage.value = page;
  fetchData();
  window.scrollTo(0, 0);
}

watch(
  () => route.query.q,
  (newQuery) => {
    if (typeof newQuery === "string" && newQuery.trim()) {
      // 檢查是否為「新的」搜尋 (不是換頁)
      if (newQuery !== currentQuery.value) {
        currentQuery.value = newQuery;
        currentPage.value = 1; // 只有「新搜尋」才重設頁碼
      }
      // 呼叫 API
      fetchData();
    } else {
      // 如果 query 無效 (例如 /search 或 /search?q=)，則清空所有內容
      results.value = [];
      currentQuery.value = "";
      totalPages.value = 0;
      totalResults.value = 0;
      apiError.value = null;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <div v-if="!isLoading && !apiError" class="mb-6 text-neutral-400 text-sm">
      <div class="text-xl font-bold mb-2">
        搜尋「<span class="text-primary">{{ currentQuery }}</span
        >」的結果
      </div>
      <div>共找到 {{ totalResults }} 筆資料</div>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="isLoading" class="text-center py-10">
      <n-spin size="large" />
    </div>

    <!-- API 錯誤狀態 -->
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
