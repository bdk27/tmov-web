<script setup lang="ts">
const { search } = useTmdb();

// Naive UI 元件
const message = useMessage();
const loadingBar = useLoadingBar();

const route = useRoute();

const results = ref<TmdbItem[]>([]);
const isLoading = ref(false);
const currentQuery = ref("");
const apiError = ref<string | null>(null);

watchEffect(async () => {
  const query = route.query.q;

  if (typeof query === "string" && query.trim()) {
    currentQuery.value = query;
    isLoading.value = true;
    apiError.value = null;
    loadingBar?.start();

    try {
      const res = await search(query, { type: "multi" });
      results.value = res.results;
      loadingBar?.finish();
    } catch (error) {
      console.error("搜尋時發生錯誤:", error);
      loadingBar?.error();

      const friendlyError = getErrorMessage(error);
      apiError.value = friendlyError;
      message.error(friendlyError);
    } finally {
      isLoading.value = false;
    }
  } else {
    results.value = [];
    currentQuery.value = "";
    apiError.value = null;
  }
});
</script>

<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-bold mb-6" v-if="currentQuery && !apiError">
      搜尋結果：<span class="text-primary">{{ currentQuery }}</span>
    </h1>

    <!-- 載入中狀態 -->
    <div v-if="isLoading" class="text-center py-10">
      <n-spin size="large" />
    </div>

    <!-- API 錯誤狀態 -->
    <div v-else-if="apiError" class="text-center py-10">
      <n-result status="error" title="搜尋失敗" :description="apiError" />
    </div>

    <!-- 搜尋結果 -->
    <div
      v-else-if="results.length > 0"
      class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <ItemCard v-for="item in results" :key="item.id" :item="item" />
    </div>

    <!-- 無結果 -->
    <div v-else class="text-center text-neutral-500 py-10">
      找不到符合 "{{ currentQuery }}" 的結果。
    </div>
  </div>
</template>
