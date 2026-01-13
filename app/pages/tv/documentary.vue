<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();

const {
  popularDocumentary,
  popularDocumentaryTotal,
  popularDocumentaryLoading,
  popularDocumentaryError,
} = storeToRefs(tmdbStore);

useHead({
  title: "熱門紀錄片",
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
  await tmdbStore.getpopularDocumentary(currentPage.value);
}

// 監聽分頁變化
watch(currentPage, fetchData, { immediate: true });
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <PagedMediaGrid
      title="熱門紀錄片"
      :items="popularDocumentary"
      :loading="popularDocumentaryLoading"
      :error="popularDocumentaryError"
      :total-results="popularDocumentaryTotal"
      v-model:current-page="currentPage"
      @retry="fetchData"
    />
  </div>
</template>
