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
const ratingColorClass = computed(() => {
  const score = rating.value;
  if (score >= 70) {
    return "bg-primary";
  }
  if (score >= 40) {
    return "bg-warning";
  }
  return "bg-error";
});
</script>

<template>
  <NuxtLink to="" class="group block h-full">
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
          <!-- 圖片 -->
          <img
            :src="imgSrc"
            :alt="title"
            class="w-full aspect-2/3 object-cover"
          />
          <!-- 加入收藏 -->
          <div
            class="absolute top-0 left-0 p-1 cursor-pointer"
            @click.prevent.stop="() => console.log('加入收藏')"
            title="加入收藏"
          >
            <UIcon
              name="i-heroicons-plus-circle-20-solid"
              class="w-6 h-6 bg-white/50 hover:bg-white"
            />
          </div>
          <!-- 評分表 -->
          <div
            v-if="rating > 0"
            class="absolute bottom-0 right-0 text-neutral-800 p-1 w-10 h-10 flex items-center justify-center -mb-2 mr-1 rounded-full"
            :class="ratingColorClass"
          >
            <div
              class="w-9 h-9 border-2 border-white absolute rounded-full"
            ></div>
            <p>{{ rating }}</p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="pt-2">
          <!-- 標題 -->
          <h4 class="font-medium truncate">
            {{ title }}
          </h4>
          <!-- 日期 -->
          <div class="text-xs opacity-70">
            {{ date }}
          </div>
        </div>
      </template>
    </UCard>
  </NuxtLink>
</template>
