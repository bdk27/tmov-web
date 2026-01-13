<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();

const {
  popularDrama,
  popularDramaTotal,
  popularDramaLoading,
  popularDramaError,
} = storeToRefs(tmdbStore);

useHead({
  title: "熱門電視劇",
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
  await tmdbStore.getPopularDrama(currentPage.value);
}

// 監聽分頁變化
watch(currentPage, fetchData, { immediate: true });
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <PagedMediaGrid
      title="熱門電視劇"
      :items="popularDrama"
      :loading="popularDramaLoading"
      :error="popularDramaError"
      :total-results="popularDramaTotal"
      v-model:current-page="currentPage"
      @retry="fetchData"
    />
  </div>
</template>
