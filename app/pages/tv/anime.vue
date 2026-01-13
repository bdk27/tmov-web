<script setup lang="ts">
const tmdbStore = useTmdbStore();
const route = useRoute();
const router = useRouter();

const {
  popularAnime,
  popularAnimeTotal,
  popularAnimeLoading,
  popularAnimeError,
} = storeToRefs(tmdbStore);

useHead({
  title: "熱門動畫",
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
  await tmdbStore.getPopularAnime(currentPage.value);
}

// 監聽分頁變化
watch(currentPage, fetchData, { immediate: true });
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <PagedMediaGrid
      title="熱門動畫"
      :items="popularAnime"
      :loading="popularAnimeLoading"
      :error="popularAnimeError"
      :total-results="popularAnimeTotal"
      v-model:current-page="currentPage"
      @retry="fetchData"
    />
  </div>
</template>
