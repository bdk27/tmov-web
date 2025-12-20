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
  formatCurrency,
  getDirectors,
  getWriters,
  getYoutubeThumb,
  getWatchProviders,
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

// 列表資料
const castListItems = computed(() => {
  let list = [];
  if (isPerson.value) {
    list = props.item.combined_credits?.cast || [];
  } else {
    list = props.item.credits?.cast || [];
  }

  return getUniqueItems(list).slice(0, 30);
});

// 劇組列表資料
const crewListItems = computed(() => {
  if (isPerson.value) return [];

  const list = props.item.credits?.crew || [];
  return getUniqueItems(list).slice(0, 20);
});
// 移除重複項目
function getUniqueItems(list: any[]) {
  const seen = new Set();
  return list.filter((item) => {
    const duplicate = seen.has(item.id);
    seen.add(item.id);
    return !duplicate;
  });
}

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
  "Returning Series": "連載中",
  Ended: "已完結",
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

// 翻譯原始語言代碼
const languageNames = new Intl.DisplayNames(["zh-TW"], { type: "language" });
const getLangName = (code: string) => {
  if (!code) return "未知";
  try {
    return languageNames.of(code);
  } catch (e) {
    return code.toUpperCase();
  }
};

// 額外資訊列表
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
      value: getLangName(raw.original_language),
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
  ].filter((i) => i.value);
});

// 移除結尾的 "系列" 或 " Collection"
const cleanCollectionName = computed(() => {
  const name = props.item.belongs_to_collection?.name;
  if (!name) return "";

  return name
    .replace(/[\(\（][^)\）]*[\)\）]/g, "")
    .replace(/\bCollection\b/gi, "")
    .replace(/系列$/g, "")
    .trim();
});

// 切換收藏
const isFavorited = ref(false);
const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value;
};

const externalIds = computed(() => props.item.external_ids || {});
const imdbLink = computed(() =>
  externalIds.value.imdb_id
    ? `https://www.imdb.com/title/${externalIds.value.imdb_id}`
    : null
);
const instagramLink = computed(() =>
  externalIds.value.instagram_id
    ? `https://instagram.com/${externalIds.value.instagram_id}`
    : null
);
const facebookLink = computed(() =>
  externalIds.value.facebook_id
    ? `https://facebook.com/${externalIds.value.facebook_id}`
    : null
);
const twitterLink = computed(() =>
  externalIds.value.twitter_id
    ? `https://twitter.com/${externalIds.value.twitter_id}`
    : null
);

// 觀看平台
const providers = computed(() => getWatchProviders(props.item));
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

      <!-- 漸層遮罩 -->
      <div
        class="absolute inset-0 bg-linear-to-t from-white to-white/50 dark:from-gray-950 dark:to-gray-950/50 z-10"
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
            class="text-2xl md:text-5xl lg:text-4xl font-bold mb-2 tracking-wide"
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
          <div
            class="flex items-center justify-center lg:justify-start mb-6 gap-4"
          >
            <p
              v-if="item.custom_rating && !isPerson"
              class="border border-gray-500 text-gray-500 text-sm p-1 rounded-sm"
            >
              {{ item.custom_rating }}
            </p>
            <p
              v-if="subtitle"
              class="text-lg md:text-xl text-gray-600 dark:text-gray-300 italic font-serif opacity-90"
            >
              {{ subtitle }}
            </p>
          </div>

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
              <!-- <span v-if="item.vote_count" class="text-xs">
                ({{ item.vote_count }} 人評分)</span
              > -->
            </div>
            <div v-if="isPerson">
              <p class="text-lg">
                {{ item.gender === "1" ? "女" : "男" }}
              </p>
            </div>
            <!-- 日期 -->
            <div v-if="dateLabel">
              <span>
                {{ dateLabel }}
              </span>
              <span v-if="isPerson && item.deathday">
                <span class="text-gray-500"> ~ </span>
                <span>{{ item.deathday }}</span>
              </span>
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
                <SubTitle
                  :title="isPerson ? '出演作品' : '主要演員'"
                  size="xl"
                  class="mb-6"
                />

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
              <div v-if="crewListItems.length">
                <SubTitle
                  :title="isPerson ? '相關製作' : '劇組團隊'"
                  size="xl"
                  class="mb-6"
                />

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

              <!-- 預告片/劇照 -->
              <div v-if="videos.length || backdrops.length" class="text-left">
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

              <!-- 相關系列 -->
              <div
                v-if="item.belongs_to_collection"
                class="text-left relative rounded-xl overflow-hidden shadow-2xl group cursor-pointer border border-gray-200 dark:border-gray-800"
              >
                <!-- 背景圖 -->
                <div class="absolute inset-0">
                  <img
                    :src="
                      backdropUrl(
                        item.belongs_to_collection.backdrop_path,
                        'original'
                      )
                    "
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    class="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent"
                  ></div>
                </div>

                <!-- 內容 -->
                <div
                  class="relative z-10 p-8 md:p-12 flex flex-col items-start justify-center h-full min-h-[250px]"
                >
                  <span
                    class="text-primary-400 font-bold tracking-widest text-sm mb-2 uppercase"
                    >相關系列</span
                  >
                  <h3
                    class="text-3xl md:text-4xl font-bold text-white tracking-wide mb-4"
                  >
                    {{ item.belongs_to_collection.name }}
                  </h3>
                  <UButton
                    :to="`/search?q=${cleanCollectionName}`"
                    size="lg"
                    color="neutral"
                    variant="solid"
                    label="查看系列作品"
                    icon="i-heroicons-arrow-right"
                  />
                </div>
              </div>

              <!-- 你可能也喜歡 -->
              <div v-if="recommendations.length">
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
              <!-- 連結 -->
              <div>
                <ul
                  class="flex items-center justify-center md:justify-start gap-4"
                >
                  <li v-if="facebookLink">
                    <UTooltip text="Facebook">
                      <a
                        :href="facebookLink"
                        target="_blank"
                        class="block transition-colors duration-300 text-gray-500 hover:text-[#1877F2] dark:text-gray-400 dark:hover:text-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          class="w-6 h-6 fill-current cursor-pointer"
                        >
                          <path
                            d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5l0-170.3-52.8 0 0-78.2 52.8 0 0-33.7c0-87.1 39.4-127.5 125-127.5 16.2 0 44.2 3.2 55.7 6.4l0 70.8c-6-.6-16.5-1-29.6-1-42 0-58.2 15.9-58.2 57.2l0 27.8 83.6 0-14.4 78.2-69.3 0 0 175.9C413.8 494.8 512 386.9 512 256z"
                          />
                        </svg>
                      </a>
                    </UTooltip>
                  </li>

                  <li v-if="instagramLink">
                    <UTooltip text="Instagram">
                      <a
                        :href="instagramLink"
                        target="_blank"
                        class="block transition-colors duration-300 text-gray-500 hover:text-[#E4405F] dark:text-gray-400 dark:hover:text-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                          class="w-6 h-6 fill-current cursor-pointer"
                        >
                          <path
                            d="M224.3 141a115 115 0 1 0 -.6 230 115 115 0 1 0 .6-230zm-.6 40.4a74.6 74.6 0 1 1 .6 149.2 74.6 74.6 0 1 1 -.6-149.2zm93.4-45.1a26.8 26.8 0 1 1 53.6 0 26.8 26.8 0 1 1 -53.6 0zm129.7 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM399 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                          />
                        </svg>
                      </a>
                    </UTooltip>
                  </li>

                  <li v-if="twitterLink">
                    <UTooltip text="X (前身為 Twitter)">
                      <a
                        :href="twitterLink"
                        target="_blank"
                        class="block transition-colors duration-300 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                          class="w-6 h-6 fill-current cursor-pointer"
                        >
                          <path
                            d="M357.2 48L427.8 48 273.6 224.2 455 464 313 464 201.7 318.6 74.5 464 3.8 464 168.7 275.5-5.2 48 140.4 48 240.9 180.9 357.2 48zM332.4 421.8l39.1 0-252.4-333.8-42 0 255.3 333.8z"
                          />
                        </svg>
                      </a>
                    </UTooltip>
                  </li>

                  <li v-if="imdbLink">
                    <UTooltip text="相關網站">
                      <a
                        :href="imdbLink"
                        target="_blank"
                        class="block transition-colors duration-300 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 576 512"
                          class="w-6 h-6 fill-current cursor-pointer"
                        >
                          <path
                            d="M419.5 96c-16.6 0-32.7 4.5-46.8 12.7-15.8-16-34.2-29.4-54.5-39.5 28.2-24 64.1-37.2 101.3-37.2 86.4 0 156.5 70 156.5 156.5 0 41.5-16.5 81.3-45.8 110.6l-71.1 71.1c-29.3 29.3-69.1 45.8-110.6 45.8-86.4 0-156.5-70-156.5-156.5 0-1.5 0-3 .1-4.5 .5-17.7 15.2-31.6 32.9-31.1s31.6 15.2 31.1 32.9c0 .9 0 1.8 0 2.6 0 51.1 41.4 92.5 92.5 92.5 24.5 0 48-9.7 65.4-27.1l71.1-71.1c17.3-17.3 27.1-40.9 27.1-65.4 0-51.1-41.4-92.5-92.5-92.5zM275.2 173.3c-1.9-.8-3.8-1.9-5.5-3.1-12.6-6.5-27-10.2-42.1-10.2-24.5 0-48 9.7-65.4 27.1L91.1 258.2c-17.3 17.3-27.1 40.9-27.1 65.4 0 51.1 41.4 92.5 92.5 92.5 16.5 0 32.6-4.4 46.7-12.6 15.8 16 34.2 29.4 54.6 39.5-28.2 23.9-64 37.2-101.3 37.2-86.4 0-156.5-70-156.5-156.5 0-41.5 16.5-81.3 45.8-110.6l71.1-71.1c29.3-29.3 69.1-45.8 110.6-45.8 86.6 0 156.5 70.6 156.5 156.9 0 1.3 0 2.6 0 3.9-.4 17.7-15.1 31.6-32.8 31.2s-31.6-15.1-31.2-32.8c0-.8 0-1.5 0-2.3 0-33.7-18-63.3-44.8-79.6z"
                          />
                        </svg>
                      </a>
                    </UTooltip>
                  </li>
                </ul>
              </div>

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
                    {{ info.value }}
                  </p>
                </div>
              </div>

              <!-- 觀看平台 -->
              <nav v-if="providers.length" class="mt-4">
                <p
                  class="text-sm text-gray-500 dark:text-gray-400 tracking-wider mb-3 block font-bold"
                >
                  現正串流
                </p>
                <ul>
                  <li
                    v-for="prov in providers"
                    :key="prov.provider_name"
                    :text="prov.provider_name"
                  >
                    <img
                      :src="posterUrl(prov.logo_path, 'w92')"
                      class="w-10 h-10 rounded-md"
                      :alt="prov.provider_name"
                    />
                  </li>
                </ul>
              </nav>

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
