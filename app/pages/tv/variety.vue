<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();

const {
  popularVariety,
  popularVarietyTotal,
  popularVarietyLoading,
  popularVarietyError,
} = storeToRefs(tmdbStore);

useHead({
  title: "熱門綜藝",
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
  await tmdbStore.getPopularVariety(currentPage.value);
}

// 監聽分頁變化
watch(currentPage, fetchData, { immediate: true });
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <PagedMediaGrid
      title="熱門綜藝"
      :items="popularVariety"
      :loading="popularVarietyLoading"
      :error="popularVarietyError"
      :total-results="popularVarietyTotal"
      v-model:current-page="currentPage"
      @retry="fetchData"
    />
  </div>
</template>
