<script setup lang="ts">
const route = useRoute();
const tmdbStore = useTmdbStore();

const { addToHistory } = useHistory();
const { currentItemDetail, currentItemDetailLoading } = storeToRefs(tmdbStore);

const type = route.params.type as string;
const id = Number(route.params.id);

// SSR 預取資料
await useAsyncData(`${type}-${id}`, () => tmdbStore.getItemDetail(type, id));

// 設定 Head (SEO)
useHead({
  title: computed(() =>
    currentItemDetail.value
      ? `${currentItemDetail.value.title || currentItemDetail.value.name}`
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
