<script setup lang="ts">
const props = defineProps<{ item: TmdbItem }>();
const { posterUrl, titleOf, dateOf } = useTmdb();

console.log(props.item);

// 圖片
const imgSrc = computed(() =>
  posterUrl(props.item?.poster_path ?? props.item?.profile_path ?? null)
);
// 標題
const title = computed(() => titleOf(props.item));
// 日期
const date = computed(() => dateOf(props.item));
// 評分
const rating = computed(() => {
  if (!props.item.vote_average) return 0;
  return Math.round(props.item.vote_average * 10);
});
</script>

<template>
  <!-- <NuxtLink to="" class="group">
    <div class="rounded-t-2xl overflow-hidden transition">
      <img :src="imgSrc" :alt="title" class="w-full aspect-2/3 object-cover" />
      <div class="pt-3">
        <div class="font-medium truncate">{{ title }}</div>
        <div class="text-xs opacity-70">{{ date }}</div>
      </div>
    </div>
  </NuxtLink> -->
  <NuxtLink to="" class="group block h-full cursor-pointer">
    <UCard
      class="h-full"
      :ui="{
        root: 'divide-y-0 ring-0 rounded-t-xl',
        header: 'p-0 sm:p-0',
        footer: 'p-0 sm:p-0',
      }"
    >
      <template #header>
        <div class="relative">
          <img
            :src="imgSrc"
            :alt="title"
            class="w-full aspect-2/3 object-cover"
          />
          <div
            v-if="rating > 0"
            class="absolute bottom-0 right-0 w-full text-white bg-linear-to-r from-transparent to-primary flex items-center justify-end space-x-1 py-0.5 px-1"
          >
            <UIcon name="i-heroicons-star-20-solid" class="w-4 h-4" />
            <p>{{ rating }}%</p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="pt-2">
          <h4 class="font-medium truncate">
            {{ title }}
          </h4>
          <div class="text-xs opacity-70">
            {{ date }}
          </div>
        </div>
      </template>
    </UCard>
  </NuxtLink>
</template>
