<script setup lang="ts">
const props = defineProps<{ item: any }>();
const { posterUrl, titleOf, dateOf } = useTmdb();

// 以 computed<string> 明確化型別，避免 Volar 推到 void
const imgSrc = computed<string>(() =>
  posterUrl(props.item?.poster_path ?? props.item?.profile_path ?? null)
);

const media = computed(() => props.item?.media_type || "movie");
const title = computed(() => titleOf(props.item));
const date = computed(() => dateOf(props.item));
</script>

<template>
  <div
    class="rounded-2xl overflow-hidden shadow border hover:shadow-lg transition bg-neutral-900/40 border-neutral-800"
  >
    <img :src="imgSrc" alt="" class="w-full aspect-2/3 object-cover" />
    <div class="p-3 space-y-1">
      <div class="text-xs uppercase opacity-60">{{ media }}</div>
      <div class="font-medium line-clamp-2">{{ title }}</div>
      <div class="text-xs opacity-70">{{ date }}</div>
    </div>
  </div>
</template>

<style scoped></style>
