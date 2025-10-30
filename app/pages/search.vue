<script setup lang="ts">
// 2. 取得 API 函數
const { search } = useTmdb();
// const loadingBar = useLoadingBar(); // 移除了 loadingBar

// 3. 取得當前路由
const route = useRoute();

// 4. 建立響應式狀態
const results = ref<TmdbItem[]>([]);
const isLoading = ref(false);
const currentQuery = ref("");

// 5. 關鍵：使用 watchEffect 監聽路由
// watchEffect 會在 'route.query.q' 變化時自動重新執行
watchEffect(async () => {
  // 從 URL 取得 'q' 參數 (例如 'marvel')
  const query = route.query.q;

  // 檢查 query 是否有效
  if (typeof query === "string" && query.trim()) {
    currentQuery.value = query; // 用於在頁面上顯示
    isLoading.value = true;
    // loadingBar?.start(); // 移除了 loadingBar

    try {
      // 6. 呼叫 API
      const response = await search(query, { type: "multi" });
      results.value = response.results;
      // loadingBar?.finish(); // 移除了 loadingBar
    } catch (error) {
      console.error("搜尋時發生錯誤:", error);
      // loadingBar?.error(); // 移除了 loadingBar
    } finally {
      isLoading.value = false;
    }
  } else {
    // 如果 URL 沒有 q 參數 (例如手動進入 /search)，就清空
    results.value = [];
    currentQuery.value = "";
  }
});
</script>

<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-bold mb-6">
      搜尋結果：<span class="text-primary">{{ currentQuery }}</span>
    </h1>

    <!-- 載入中狀態 -->
    <div v-if="isLoading" class="text-center py-10">
      <n-spin size="large" />
    </div>

    <!-- 搜尋結果 -->
    <div
      v-else-if="results.length > 0"
      class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <MovieCard v-for="item in results" :key="item.id" :item="item" />
    </div>

    <!-- 無結果 -->
    <div v-else class="text-center text-neutral-500 py-10">
      找不到符合 "{{ currentQuery }}" 的結果。
    </div>
  </div>
</template>
