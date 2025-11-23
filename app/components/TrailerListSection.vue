<script setup lang="ts">
const props = defineProps<{
  title: string;
  items: TmdbItem[];
  loading: boolean;
}>();

const { backdropUrl, fetchMovieTrailer, titleOf, dateOf } = useTmdb();

// 當前選中的電影 (預設為第 1 部)
const activeItem = ref<TmdbItem | null>(null);
const activeTrailerKey = ref<string | null>(null);
const isTrailerLoading = ref(false);

watch(
  () => props.items,
  async (newItems) => {
    if (newItems.length > 0 && !activeItem.value) {
      await selectItem(newItems[0]!);
    }
  },
  { immediate: true }
);

async function selectItem(item: TmdbItem) {
  if (activeItem.value?.id === item.id) return;

  activeItem.value = item;
  activeTrailerKey.value = null;
  isTrailerLoading.value = true;

  try {
    const res = await fetchMovieTrailer(item.id);
    if (res && res.trailerUrl) {
      activeTrailerKey.value = res.trailerUrl;
    }
  } catch (e) {
    console.error(e);
  } finally {
    isTrailerLoading.value = false;
  }
}
</script>

<template>
  <div
    class="container mx-auto max-w-6xl bg-gray-100 dark:bg-neutral-900/50 px-4 py-16 rounded-3xl"
  >
    <!-- 大標題 -->
    <div class="flex items-center justify-center mb-12 gap-3">
      <span class="w-2 h-8 bg-primary rounded-full block"></span>
      <h2 class="text-3xl font-bold">
        {{ title }}
      </h2>
    </div>

    <!-- 內容 -->
    <div
      v-if="!loading && items.length > 0"
      class="flex flex-col lg:flex-row gap-6"
    >
      <div
        class="w-full lg:w-2/3 aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl"
      >
        <!-- 預告片 -->
        <iframe
          v-if="activeTrailerKey"
          :src="activeTrailerKey"
          title="Trailer"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="absolute inset-0 w-full h-full"
        ></iframe>

        <!-- 載入中 -->
        <div v-else class="absolute inset-0 flex items-center justify-center">
          <img
            v-if="activeItem"
            :src="backdropUrl(activeItem.backdrop_path)"
            class="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div class="z-10 text-center p-4">
            <UIcon
              v-if="isTrailerLoading"
              name="i-heroicons-arrow-path"
              class="text-4xl text-white animate-spin"
            />
            <span v-else class="text-white text-lg font-semibold"
              >無法播放預告片</span
            >
          </div>
        </div>
      </div>

      <div
        class="w-full lg:w-1/3 flex flex-col gap-3 h-[400px] lg:h-auto overflow-y-auto pr-2"
      >
        <div
          v-for="item in items.slice(0, 5)"
          :key="item.id"
          @click="selectItem(item)"
          class="flex gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group border border-transparent"
          :class="
            activeItem?.id === item.id
              ? 'bg-white dark:bg-gray-800 shadow-lg border-primary-500'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          "
        >
          <!-- 列表小圖 -->
          <div
            class="relative w-24 aspect-video rounded-lg overflow-hidden shrink-0"
          >
            <img
              :src="backdropUrl(item.backdrop_path, 'w300')"
              class="w-full h-full object-cover"
            />
            <!-- 播放圖示 -->
            <div
              class="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-transparent transition"
            >
              <UIcon
                name="i-heroicons-play-circle"
                class="text-white w-8 h-8"
              />
            </div>
          </div>

          <!-- 列表文字 -->
          <div class="flex flex-col justify-center min-w-0">
            <h4
              class="font-bold text-sm text-gray-900 dark:text-white truncate"
              :class="activeItem?.id === item.id ? 'text-primary-500' : ''"
            >
              {{ titleOf(item) }}
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ dateOf(item) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入中 -->
    <div v-else class="flex flex-col lg:flex-row gap-6">
      <USkeleton class="w-full lg:w-2/3 aspect-video rounded-xl" />
      <div class="w-full lg:w-1/3 flex flex-col gap-3">
        <USkeleton v-for="i in 5" :key="i" class="w-full h-20 rounded-xl" />
      </div>
    </div>
  </div>
</template>
