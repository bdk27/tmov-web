<script setup lang="ts">
import { link } from "fs";

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

// 列表資料 (Cast 或 Combined Credits)
const castListItems = computed(() => {
  if (isPerson.value) {
    // 人物：顯示他演過的作品
    return props.item.combined_credits?.cast || [];
  } else {
    // 影視：顯示演員
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
    {
      label: "相關連結",
      value: isPerson.value
        ? null
        : raw.homepage
        ? "官方網站"
        : raw.imdb_id
        ? "IMDB 頁面"
        : null,
      link: isPerson.value
        ? null
        : raw.homepage ||
          (raw.imdb_id ? `https://www.imdb.com/title/${raw.imdb_id}` : null),
      colorClass: "underline text-info  cursor-pointer",
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
          class="md:flex-1 min-w-0 text-center lg:text-left animate-slide-up animation-delay-200"
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
            <SubTitle
              :title="isPerson ? '人物傳記' : '劇情簡介'"
              size="xl"
              class="mb-6"
            />

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
                <SubTitle title="主要演員" size="xl" class="mb-6" />

                <div class="min-w-0 overflow-x-auto custom-scrollbar">
                  <div class="flex gap-4 pb-6">
                    <div
                      v-for="cast in castListItems"
                      :key="cast.id"
                      class="w-28 shrink-0"
                    >
                      <ItemCard :item="cast" class="h-full" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 劇組表 (Carousel) -->
              <div v-if="!isPerson && crewListItems.length">
                <SubTitle title="劇組團隊" size="xl" class="mb-6" />

                <div class="min-w-0 overflow-x-auto custom-scrollbar">
                  <div class="flex gap-4 pb-6">
                    <div
                      v-for="crew in crewListItems"
                      :key="crew.id"
                      class="w-28 shrink-0"
                    >
                      <ItemCard :item="crew" class="h-full" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 媒體與推薦 -->
              <div
                v-if="videos.length || backdrops.length"
                class="mt-16 text-left"
              >
                <div class="min-w-0 overflow-hidden custom-scrollbar">
                  <UTabs
                    :items="[
                      { label: `預告片 (${videos.length})`, slot: 'videos' },
                      { label: `劇照 (${backdrops.length})`, slot: 'images' },
                    ]"
                    class="w-full"
                  >
                    <template #videos>
                      <div
                        class="flex w-full gap-5 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth"
                      >
                        <div
                          v-for="video in videos"
                          :key="video.id"
                          class="group relative shrink-0 snap-start w-72 md:w-80 flex-none cursor-pointer rounded-xl shadow-md transition-all"
                          @click="openVideo(video)"
                        >
                          <div
                            class="aspect-video w-full overflow-hidden rounded-t-xl relative"
                          >
                            <img
                              :src="getYoutubeThumb(video.key)"
                              class="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                              loading="lazy"
                            />
                            <div
                              class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors"
                            >
                              <UIcon
                                name="i-heroicons-play-circle-solid"
                                class="h-14 w-14 text-white/90 drop-shadow-xl transition-all group-hover:scale-110 group-hover:text-primary-400"
                              />
                            </div>
                          </div>

                          <div class="p-3">
                            <p class="truncate text-sm">
                              {{ video.name }}
                            </p>
                            <p class="text-xs text-gray-500 mt-1">YouTube</p>
                          </div>
                        </div>
                      </div>
                    </template>

                    <template #images>
                      <div
                        class="flex w-full gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth"
                      >
                        <div
                          v-for="img in backdrops"
                          :key="img.file_path"
                          class="group relative shrink-0 snap-start h-40 md:h-48 cursor-zoom-in overflow-hidden rounded-lg shadow-md ring-1 ring-white/10 transition-all hover:scale-105 hover:shadow-xl"
                        >
                          <img
                            :src="backdropUrl(img.file_path, 'w780')"
                            class="h-full w-auto object-cover rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </template>
                  </UTabs>
                </div>
              </div>

              <div v-if="recommendations.length" class="mt-16 text-left">
                <SubTitle title="您可能也喜歡" size="xl" class="mb-6" />

                <div class="min-w-0 overflow-x-auto custom-scrollbar">
                  <div class="flex gap-4 pb-6">
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
            </div>
            <!-- 右側 -->
            <div
              class="w-full lg:w-1/3 space-y-8 lg:border-l lg:border-gray-200 lg:dark:border-gray-800 lg:pl-12 min-w-0"
            >
              <!-- 詳細資訊 Grid -->
              <div class="flex flex-col gap-6">
                <div
                  v-for="(info, idx) in extraInfo"
                  :key="idx"
                  class="flex flex-col"
                >
                  <p
                    class="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 font-bold"
                  >
                    {{ info.label }}
                  </p>
                  <p :class="info.colorClass">
                    <a :href="info.link" target="_blank" v-if="info.link">{{
                      info.value
                    }}</a>
                    <span v-else>{{ info.value }}</span>
                  </p>
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
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 100, 100, 0.5) transparent;
}

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
