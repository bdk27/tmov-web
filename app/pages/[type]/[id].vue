<script setup lang="ts">
const route = useRoute();
const tmdbStore = useTmdbStore();
const { addToHistory } = useHistory();

// 從網址取得參數
const type = route.params.type as string; // 'movie', 'tv', 'person'
const id = Number(route.params.id);

// 驗證類型 (簡單防呆)
const validTypes = ["movie", "tv", "person"];
if (!validTypes.includes(type)) {
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
}

// 讀取 Store
const { currentItemDetail, currentItemDetailLoading } = storeToRefs(tmdbStore);

// SSR 預取資料
// 使用 key 確保切換頁面時會重新執行
await useAsyncData(`${type}-${id}`, () => tmdbStore.getItemDetail(type, id));

// 設定 Head (SEO)
useHead({
  title: computed(() =>
    currentItemDetail.value
      ? `${
          currentItemDetail.value.title || currentItemDetail.value.name
        } - TMOV`
      : "載入中..."
  ),
  meta: [
    {
      name: "description",
      content: computed(
        () =>
          currentItemDetail.value?.overview ||
          currentItemDetail.value?.biography ||
          ""
      ),
    },
  ],
});

watch(
  currentItemDetail,
  (newItem) => {
    if (newItem) {
      addToHistory(newItem);
    }
  },
  { immediate: true }
);
</script>

<template>
  <ItemDetail
    v-if="currentItemDetail"
    :item="currentItemDetail!"
    :loading="currentItemDetailLoading"
  />
</template>
