<script setup lang="ts">
const props = defineProps<{ item: TmdbItem }>();
const { posterUrl, titleOf, dateOf, getRating, getRatingColor } = useTmdb();

const itemPath = computed(() => {
  if (props.item.media_type === "person") return `/person/${props.item.id}`;
  if (props.item.media_type === "tv") return `/tv/${props.item.id}`;
  return `/movie/${props.item.id}`;
});

// 圖片
const imgSrc = computed(() =>
  posterUrl(props.item?.poster_path ?? props.item?.profile_path ?? null)
);

// 標題
const title = computed(() => titleOf(props.item));

// 日期
const date = computed(() => dateOf(props.item));
</script>

<template>
  <NuxtLink :to="itemPath" class="group block h-full">
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
            class="w-full aspect-2/3 object-cover hover:scale-[1.05] transition-transform duration-300"
          />
          <!-- 加入收藏 -->
          <div
            class="absolute top-0 left-0 p-1 cursor-pointer"
            @click.prevent.stop="() => console.log('加入收藏')"
            title="加入收藏"
          >
            <UIcon
              name="i-heroicons-plus-circle-20-solid"
              class="w-6 h-6 bg-white/50 hover:bg-primary"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="pt-2">
          <!-- 標題 -->
          <h4 class="font-medium truncate">
            {{ title }}
          </h4>
          <div class="flex items-center">
            <!-- 日期 -->
            <div v-if="date !== 'Unknown'" class="text-xs opacity-70 mr-3">
              {{ date }}
            </div>
            <!-- 評分表 -->
            <div
              v-if="item.vote_average"
              class="flex items-center font-bold text-sm"
              :class="getRatingColor(getRating(item))"
            >
              <UIcon name="i-heroicons-star-20-solid" class="w-3 h-3 mr-0.5" />
              {{ item.vote_average.toFixed(1) }}
            </div>
          </div>
        </div>
      </template>
    </UCard>
  </NuxtLink>
</template>
