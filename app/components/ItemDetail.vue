<script setup lang="ts">
const props = defineProps<{
  item: TmdbDetail;
  loading: boolean;
}>();

const {
  posterUrl,
  backdropUrl,
  getRating,
  getRatingColor,
  formatRuntime,
  getDetailTitle,
  getDetailImage,
  titleOf,
  formatCurrency,
  getDirectors,
  getWriters,
  getYoutubeThumb,
} = useTmdb();

// 判斷類型
const isPerson = computed(() => props.item.media_type === "person");
const isTv = computed(() => props.item.media_type === "tv");

// 標題
const title = computed(() => getDetailTitle(props.item));

// 日期 (生日 或 上映日)
const dateLabel = computed(() => {
  if (isPerson.value) return props.item.birthday ? props.item.birthday : "";
  return props.item.release_date || props.item.first_air_date || "";
});

// 副標題 (出生地 或 標語)
const subtitle = computed(() => {
  if (isPerson.value) return props.item.place_of_birth || "";
  return props.item.tagline || "";
});

// 規格資訊 (片長/季數)
const specs = computed(() => {
  if (isPerson.value) return null;
  if (isTv.value)
    return `${props.item.number_of_seasons} 季 · ${props.item.number_of_episodes} 集`;
  return formatRuntime(props.item.runtime);
});

// 列表標題 (演員表 或 演出作品)
const listTitle = computed(() => (isPerson.value ? "演出作品" : "主要演員"));

// 列表資料 (Cast 或 Combined Credits)
const castListItems = computed(() => {
  if (isPerson.value) {
    // 人物：顯示他演過的作品 (取前 15 部)
    return props.item.combined_credits?.cast || [];
  } else {
    // 影視：顯示演員 (取前 15 位)
    return props.item.credits?.cast || [];
  }
});

// 劇組列表資料
const crewListItems = computed(() => {
  return props.item.credits?.crew || [];
});

const videos = computed(
  () => props.item.videos?.results.filter((v) => v.site === "YouTube") || []
);
const backdrops = computed(() => props.item.images?.backdrops || []);
const recommendations = computed(
  () => props.item.recommendations?.results || []
);

const activeVideo = ref(null);
const isVideoModalOpen = ref(false);
function openVideo(video: any) {
  activeVideo.value = video;
  isVideoModalOpen.value = true;
}

// 狀態翻譯對照表
const statusMap: Record<string, string> = {
  Rumored: "傳聞中",
  Planned: "規劃中",
  "In Production": "製作中",
  "Post Production": "後製中",
  Released: "已上映",
  Canceled: "已取消",
  "Returning Series": "連載中", // 影集續訂中
  Ended: "已完結", // 影集完結
  Pilot: "試播集",
};
// 狀態顯示文字
const statusLabel = computed(() => {
  const s = props.item.status;
  if (!s) return "未知";
  return statusMap[s] || s; // 如果找不到對應翻譯，就顯示原文
});
const statusColorClass = computed(() => {
  const s = props.item.status;
  switch (s) {
    case "Released":
    case "Returning Series":
    case "Ended":
      return "bg-primary"; // 綠色
    case "In Production":
    case "Post Production":
    case "Planned":
      return "bg-info"; // 藍色
    case "Canceled":
      return "bg-red-600 dark:bg-red-600"; // 紅色
    case "Rumored":
      return "bg-yellow-600 dark:bg-yellow-600"; // 黃色
    default:
      return "bg-gray-900 dark:bg-white";
  }
});

const extraInfo = computed(() => {
  const raw = props.item as any;
  return [
    {
      label: "原名",
      value: raw.original_title || raw.original_name,
      colorClass: "",
    },
    {
      label: "原始語言",
      value: raw.original_language?.toUpperCase(),
      colorClass: "",
    },
    {
      label: "導演",
      value: isPerson.value
        ? null
        : getDirectors(props.item)
            .map((d) => d.name)
            .join(", "),
      colorClass: "",
    },
    {
      label: "作者",
      value: isPerson.value
        ? null
        : getWriters(props.item)
            .map((w) => w.name)
            .join(", "),
      colorClass: "",
    },
    {
      label: "預算",
      value: isPerson.value ? null : formatCurrency(raw.budget),
      colorClass: "",
    },
    {
      label: "票房",
      value: isPerson.value ? null : formatCurrency(raw.revenue),
      colorClass: "",
    },
    ...(isTv.value
      ? [{ label: "類型", value: "電視影集", colorClass: "" }]
      : []),
    ...(isPerson.value
      ? [{ label: "部門", value: raw.known_for_department, colorClass: "" }]
      : []),
  ].filter((i) => i.value);
});

// 切換收藏
const isFavorited = ref(false);
const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value;
};
</script>

<template>
  <div
    v-if="item"
    class="relative min-h-screen pb-20 bg-white dark:bg-gray-950 dark:text-white"
  >
    <!-- 1. 沉浸式背景區 -->
    <div class="absolute inset-0 h-[55vh] lg:h-[65vh] w-full overflow-hidden">
      <!-- 背景圖片層 -->
      <div class="absolute inset-0">
        <img
          v-if="!isPerson && item.backdrop_path"
          :src="backdropUrl(item.backdrop_path, 'original')"
          class="w-full h-full object-cover object-top animate-fade-in"
          alt="Backdrop"
        />
        <!-- 人物或無圖時的備用背景 (深色漸層) -->
        <div
          v-else
          class="w-full h-full bg-linear-to-br from-gray-800 via-gray-900 to-black"
        ></div>
      </div>

      <!-- 漸層遮罩 (讓底部完美融合到頁面背景) -->
      <div
        class="absolute inset-0 bg-linear-to-t from-white via-white/60 to-gray/60 dark:from-gray-950 dark:via-gray-950/60 dark:to-gray-950/0 z-10"
      ></div>
      <!-- 頂部暗角 (讓文字更清楚) -->
      <div
        class="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-transparent z-10"
      ></div>
    </div>

    <!-- 2. 主要內容區 -->
    <div class="container mx-auto px-4 relative z-20 pt-[15vh]">
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">
        <!-- 左側：海報與操作 -->
        <div
          class="w-full max-w-50 mx-auto lg:mx-0 lg:w-70 shrink-0 animate-slide-up"
        >
          <!-- 海報 -->
          <div
            class="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10 bg-gray-200 dark:bg-gray-800 aspect-2/3 relative group"
          >
            <img
              :src="posterUrl(getDetailImage(item))"
              :alt="title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <!-- 播放按鈕 (僅影視) -->
          <div v-if="!isPerson" class="mt-6">
            <UButton
              block
              size="xl"
              color="primary"
              variant="solid"
              class="font-bold shadow-lg shadow-primary-500/30"
              icon="i-heroicons-play-circle"
            >
              播放預告片
            </UButton>
          </div>
        </div>

        <!-- 右側：詳細資訊 -->
        <div
          class="md:flex-1 text-center lg:text-left animate-slide-up animation-delay-200"
        >
          <!-- 標題 -->
          <h1
            class="text-2xl md:text-5xl lg:text-4xl font-bold mb-2 tracking-wide text-white"
          >
            {{ title }}
            <span
              v-if="!isPerson"
              class="p-1 mt-3 inline-block text-xs rounded text-neutral-900 relative overflow-hidden"
              :class="statusColorClass"
              style="transform: skewX(-20deg)"
            >
              {{ statusLabel }}
            </span>
          </h1>

          <!-- 副標題 / 標語 -->
          <p
            v-if="subtitle"
            class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 italic font-serif opacity-90"
          >
            {{ subtitle }}
          </p>

          <!-- 類型標籤 (Pills 風格) -->
          <div
            v-if="item.genres && item.genres.length"
            class="flex flex-wrap justify-center lg:justify-start gap-2 mb-6"
          >
            <span
              v-for="genre in item.genres"
              :key="genre.id"
              class="px-3 py-1 text-sm font-semibold rounded-full border bg-white border-gray-300 dark:bg-transparent dark:border-gray-700 hover:border-primary-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-default"
            >
              {{ genre.name }}
            </span>
          </div>

          <!-- 資訊列 -->
          <div
            class="w-fit mx-auto lg:mx-0 flex items-center justify-center lg:justify-start gap-4 mb-8 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800/50 backdrop-blur rounded-full border border-gray-200 dark:border-gray-700/50"
          >
            <!-- 評分徽章 -->
            <div
              v-if="!isPerson && item.vote_average"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-star-solid"
                class="w-5 h-5 text-yellow-400"
              />
              <span class="text-lg" :class="getRatingColor(getRating(item))">{{
                item.vote_average.toFixed(1)
              }}</span>
            </div>
            <!-- 日期 -->
            <div v-if="dateLabel">
              <p>
                {{ dateLabel }}
              </p>
            </div>
            <!-- 時間 -->
            <div v-if="specs">
              <p>{{ specs }}</p>
            </div>
            <!-- 加入收藏 -->
            <div>
              <div class="hidden md:block">
                <UButton
                  size="sm"
                  color="primary"
                  class="px-3 py-1.5 rounded-full transition-colors group"
                  @click="toggleFavorite"
                >
                  <UIcon
                    v-if="!isFavorited"
                    size="15"
                    name="i-heroicons-heart-solid"
                    class="group-hover:bg-red-500 group-active:bg-red-500"
                  />
                  <span>{{ isFavorited ? "已收藏" : "加入收藏" }}</span>
                </UButton>
              </div>
              <div class="block md:hidden">
                <UIcon
                  size="20"
                  name="i-heroicons-heart-solid"
                  class="hover:bg-red-500 active:bg-red-500"
                  :class="isFavorited ? 'bg-red-500' : ''"
                  @click="toggleFavorite"
                />
              </div>
            </div>
          </div>

          <!-- 概要 -->
          <div class="mb-10">
            <h3
              class="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"
            >
              <span class="w-1.5 h-6 bg-primary rounded-full block"></span>
              {{ isPerson ? "人物傳記" : "劇情簡介" }}
            </h3>
            <p class="leading-relaxed text-lg whitespace-pre-line">
              {{ item.overview || item.biography || "暫無簡介。" }}
            </p>
          </div>

          <div
            class="flex flex-col lg:flex-row gap-12 items-start justify-between min-w-0"
          >
            <!-- 左側 -->
            <div class="w-full lg:w-2/3 min-w-0 space-y-12">
              <!-- 演員表 (Carousel) -->
              <div v-if="castListItems.length">
                <div class="flex items-center gap-2 mb-6">
                  <span class="w-1.5 h-6 bg-primary rounded-full block"></span>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ isPerson ? "演出作品" : "主要演員" }}
                  </h3>
                </div>

                <div class="overflow-hidden">
                  <Carousel
                    :items="castListItems"
                    class="w-full lg:w-[600px]"
                  />
                </div>

                <!-- <div class="overflow-hidden">
                  <UCarousel
                    :items="castListItems"
                    loop
                    autoHeight
                    :ui="{ item: 'basis-auto', container: 'gap-4' }"
                    class="w-full lg:w-[600px] mx-auto"
                  >
                    <template #default="{ item: subItem }">
                      <NuxtLink
                        :to="
                          isPerson
                            ? subItem.media_type === 'tv'
                              ? `/tv/${subItem.id}`
                              : `/movie/${subItem.id}`
                            : `/person/${subItem.id}`
                        "
                        class="w-24 shrink-0 group/card block"
                      >
                        <div
                          class="overflow-hidden mb-2 shadow-sm bg-gray-200 dark:bg-gray-800 relative transition-all duration-200 group-hover/card:shadow-md group-hover/card:-translate-y-1 ring-1 ring-black/5 dark:ring-white/10"
                          :class="
                            isPerson
                              ? 'aspect-2/3 rounded-lg'
                              : 'w-24 h-24 rounded-full mx-auto'
                          "
                        >
                          <img
                            :src="
                              posterUrl(
                                isPerson
                                  ? subItem.poster_path || null
                                  : subItem.profile_path || null,
                                isPerson ? 'w342' : 'w185'
                              )
                            "
                            class="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <div class="text-center px-0.5">
                          <p
                            class="text-xs font-bold truncate text-gray-900 dark:text-white group-hover/card:text-primary-500 transition-colors"
                          >
                            {{ titleOf(subItem) }}
                          </p>
                          <p
                            class="text-[10px] text-gray-500 dark:text-gray-400 truncate"
                          >
                            {{
                              isPerson
                                ? subItem.character || "未知角色"
                                : subItem.character || subItem.name
                            }}
                          </p>
                        </div>
                      </NuxtLink>
                    </template>
                  </UCarousel>
                </div> -->
              </div>

              <!-- 劇組表 (Carousel) -->
              <div v-if="!isPerson && crewListItems.length">
                <div class="flex items-center gap-2 mb-6">
                  <span class="w-1.5 h-6 bg-primary rounded-full block"></span>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    製作團隊
                  </h3>
                </div>
                <div class="w-full overflow-hidden">
                  <UCarousel
                    :items="crewListItems"
                    arrows
                    loop
                    autoHeight
                    :ui="{ item: 'basis-auto', container: 'gap-4' }"
                    class="w-full max-w-xl"
                  >
                    <template #default="{ item: subItem }">
                      <NuxtLink
                        :to="
                          isPerson
                            ? subItem.media_type === 'tv'
                              ? `/tv/${subItem.id}`
                              : `/movie/${subItem.id}`
                            : `/person/${subItem.id}`
                        "
                        class="w-24 shrink-0 group/card block"
                      >
                        <div
                          class="overflow-hidden mb-2 shadow-sm bg-gray-200 dark:bg-gray-800 relative transition-all duration-200 group-hover/card:shadow-md group-hover/card:-translate-y-1 ring-1 ring-black/5 dark:ring-white/10"
                          :class="
                            isPerson
                              ? 'aspect-2/3 rounded-lg'
                              : 'w-24 h-24 rounded-full mx-auto'
                          "
                        >
                          <img
                            :src="
                              posterUrl(
                                isPerson
                                  ? subItem.poster_path || null
                                  : subItem.profile_path || null,
                                isPerson ? 'w342' : 'w185'
                              )
                            "
                            class="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <div class="text-center px-0.5">
                          <p
                            class="text-xs font-bold truncate text-gray-900 dark:text-white group-hover/card:text-primary-500 transition-colors"
                          >
                            {{ titleOf(subItem) }}
                          </p>
                          <p
                            class="text-[10px] text-gray-500 dark:text-gray-400 truncate"
                          >
                            {{
                              isPerson
                                ? subItem.character || "未知角色"
                                : subItem.character || subItem.name
                            }}
                          </p>
                        </div>
                      </NuxtLink>
                    </template>
                  </UCarousel>
                </div>
              </div>

              <!-- 媒體與推薦 (Full width) -->
              <div
                v-if="videos.length || backdrops.length"
                class="mt-16 text-left"
              >
                <UTabs
                  :items="[
                    { label: `預告片 (${videos.length})`, slot: 'videos' },
                    { label: `劇照 (${backdrops.length})`, slot: 'images' },
                  ]"
                  class="w-[500px]"
                >
                  <template #videos>
                    <div
                      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
                    >
                      <div
                        v-for="video in videos.slice(0, 6)"
                        :key="video.id"
                        class="aspect-video relative rounded-lg overflow-hidden group cursor-pointer bg-black"
                        @click="openVideo(video)"
                      >
                        <img
                          :src="getYoutubeThumb(video.key)"
                          class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div
                          class="absolute inset-0 flex items-center justify-center"
                        >
                          <UIcon
                            name="i-heroicons-play-circle-solid"
                            class="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div
                          class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent"
                        >
                          <p class="text-white text-xs font-bold truncate">
                            {{ video.name }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template #images>
                    <div class="flex gap-4 overflow-x-auto mt-4 pb-4">
                      <div
                        v-for="img in backdrops.slice(0, 10)"
                        :key="img.file_path"
                        class="h-40 shrink-0 rounded-lg overflow-hidden shadow-md"
                      >
                        <img
                          :src="backdropUrl(img.file_path, 'w780')"
                          class="h-full w-auto object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </template>
                </UTabs>
              </div>

              <div v-if="recommendations.length" class="mt-16 text-left">
                <h3 class="text-xl font-bold mb-6">您可能也喜歡</h3>
                <div
                  class="flex gap-4 overflow-x-auto pb-6 scrollbar-hide w-[500px]"
                >
                  <div
                    v-for="rec in recommendations"
                    :key="rec.id"
                    class="w-36 shrink-0"
                  >
                    <ItemCard :item="rec" class="h-full" />
                  </div>
                </div>
              </div>
            </div>
            <!-- 右側 -->
            <div
              class="w-full lg:w-1/3 space-y-8 lg:border-l lg:border-gray-200 lg:dark:border-gray-800 lg:pl-12"
            >
              <!-- 詳細資訊 Grid -->
              <div class="flex flex-col gap-6">
                <div
                  v-for="(info, idx) in extraInfo"
                  :key="idx"
                  class="flex flex-col"
                >
                  <span
                    class="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 font-bold"
                    >{{ info.label }}</span
                  >
                  <span class="" :class="info.colorClass">
                    {{ info.value }}
                  </span>
                </div>
              </div>

              <!-- 製作公司 -->
              <div v-if="item.production_companies?.length">
                <span
                  class="text-sm text-gray-500 dark:text-gray-400 tracking-wider mb-3 block font-bold"
                  >製作公司</span
                >
                <div class="flex flex-col gap-4">
                  <div
                    v-for="comp in item.production_companies"
                    :key="comp.id"
                    class="flex items-center justify-center lg:justify-start gap-3"
                  >
                    <div
                      class="h-8 w-auto bg-white/10 rounded p-1 flex items-center justify-center min-w-8"
                    >
                      <img
                        v-if="comp.logo_path"
                        :src="posterUrl(comp.logo_path, 'w92')"
                        class="max-h-full max-w-full object-contain filter dark:invert dark:brightness-200"
                      />
                      <p
                        v-else
                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        {{ comp.name }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}
.animate-slide-up {
  animation: slideUp 0.8s ease-out forwards;
  opacity: 0;
}
.animation-delay-200 {
  animation-delay: 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
