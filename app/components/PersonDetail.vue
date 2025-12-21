<script setup lang="ts">
const props = defineProps<{
  item: TmdbDetail;
  loading: boolean;
}>();

const { posterUrl, getDetailTitle, getDetailImage } = useTmdb();

// 標題 (人名)
const title = computed(() => getDetailTitle(props.item));

// 性別判斷
const genderData = computed(() => {
  const g = props.item.gender;
  if (g === 1)
    return {
      label: "女性",
      type: "venus",
      colorClass: "text-pink-500 dark:text-pink-400",
    };
  if (g === 2)
    return {
      label: "男性",
      type: "mars",
      colorClass: "text-blue-500 dark:text-blue-400",
    };
  return null;
});

// 生日 / 卒日
const dateLabel = computed(() => props.item.birthday || "");
const deathLabel = computed(() => props.item.deathday || "");

// 出生地
const placeOfBirth = computed(() => props.item.place_of_birth || "");

// 參與作品
const castListItems = computed(() => {
  // 對於 Person，資料通常在 combined_credits.cast
  const list = props.item.combined_credits?.cast || [];
  // 依照熱門程度或時間排序，這裡使用簡單去重
  return getUniqueItems(list).slice(0, 30);
});

// 幕後製作
const crewListItems = computed(() => {
  const list = props.item.combined_credits?.crew || [];
  return getUniqueItems(list);
});

// 個人劇照
const profileImages = computed(() => props.item.images?.profiles || []);

// Modal
const activeImage = ref<any>(null);
const isImageModalOpen = ref(false);
function openImage(img: any) {
  activeImage.value = img;
  isImageModalOpen.value = true;
}

// 移除重複 Helper (可考慮提取到 utils)
function getUniqueItems(list: any[]) {
  const seen = new Set();
  return list.filter((item) => {
    const duplicate = seen.has(item.id);
    seen.add(item.id);
    return !duplicate;
  });
}

// 收藏功能 (若人物也需要收藏)
const isFavorited = ref(false);
const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value;
};

// 外部連結
const externalIds = computed(() => props.item.external_ids || {});
const imdbLink = computed(() =>
  props.item.imdb_id ? `https://www.imdb.com/name/${props.item.imdb_id}` : null
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
</script>

<template>
  <div
    class="relative min-h-screen pb-20 bg-white dark:bg-gray-950 dark:text-white"
  >
    <!-- 背景 -->
    <div class="absolute inset-0 h-[40vh] w-full overflow-hidden">
      <div
        class="w-full h-full bg-linear-to-br from-gray-700 via-gray-800 to-black"
      ></div>
      <div
        class="absolute inset-0 bg-linear-to-t from-white to-white/50 dark:from-gray-950 dark:to-gray-950/50 z-10"
      ></div>
    </div>

    <div class="container mx-auto px-4 relative z-20 pt-[10vh]">
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">
        <!-- 左側 -->
        <div
          class="w-full max-w-50 mx-auto lg:mx-0 lg:w-70 shrink-0 animate-slide-up"
        >
          <div
            class="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10 bg-gray-200 dark:bg-gray-800 aspect-2/3 relative group"
          >
            <img
              :src="posterUrl(getDetailImage(item))"
              :alt="title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>

        <!-- 右側 -->
        <div
          class="md:flex-1 min-w-0 text-center lg:text-left animate-slide-up animation-delay-200"
        >
          <div class="mb-4">
            <!-- 姓名 -->
            <h1 class="text-3xl md:text-4xl font-bold tracking-wide">
              {{ title }}
            </h1>

            <!-- 別名 -->
            <h3 class="text-gray-600 dark:text-gray-300 text-sm pt-2">
              {{ props.item.also_known_as?.[0] }}
            </h3>
          </div>

          <!-- 性別 -->
          <div
            class="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-6 text-gray-600 dark:text-gray-300"
          >
            <div
              v-if="genderData"
              class="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <!-- 男性 -->
              <svg
                v-if="genderData.type === 'mars'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                class="w-4 h-4 fill-current"
                :class="genderData.colorClass"
              >
                <path
                  d="M320 32c0-17.7 14.3-32 32-32L480 0c17.7 0 32 14.3 32 32l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-50.7-95 95c19.5 28.4 31 62.7 31 99.8 0 97.2-78.8 176-176 176S32 401.2 32 304 110.8 128 208 128c37 0 71.4 11.4 99.8 31l95-95-50.7 0c-17.7 0-32-14.3-32-32zM208 416a112 112 0 1 0 0-224 112 112 0 1 0 0 224z"
                />
              </svg>
              <!-- 女性 -->
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                class="w-4 h-4 fill-current"
                :class="genderData.colorClass"
              >
                <path
                  d="M80 176a112 112 0 1 1 224 0 112 112 0 1 1 -224 0zM223.9 349.1C305.9 334.1 368 262.3 368 176 368 78.8 289.2 0 192 0S16 78.8 16 176c0 86.3 62.1 158.1 144.1 173.1-.1 1-.1 1.9-.1 2.9l0 64-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-64c0-1 0-1.9-.1-2.9z"
                />
              </svg>
            </div>

            <!-- 出生/死亡日期 -->
            <div v-if="dateLabel">
              <span>{{ dateLabel }}</span>
              <span v-if="deathLabel"> ~ {{ deathLabel }}</span>
              <span v-else>
                ({{
                  dateLabel
                    ? new Date().getFullYear() -
                      parseInt(dateLabel?.split("-")[0] || "0")
                    : 0
                }}
                歲)</span
              >
            </div>

            <!-- 出生地 -->
            <div v-if="placeOfBirth" class="flex items-center gap-1">
              <UIcon name="i-heroicons-map-pin" />
              {{ placeOfBirth }}
            </div>
          </div>

          <!-- 連結 -->
          <ul
            class="flex items-center justify-center lg:justify-start gap-4 mb-8"
          >
            <li>
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
                {{ isFavorited ? "已關注" : "關注" }}
              </UButton>
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
            <li>
              <UButton
                v-if="instagramLink"
                :to="instagramLink"
                target="_blank"
                color="neutral"
                variant="ghost"
                icon="i-simple-icons-instagram"
              />
            </li>
            <li>
              <UButton
                v-if="facebookLink"
                :to="facebookLink"
                target="_blank"
                color="neutral"
                variant="ghost"
                icon="i-simple-icons-facebook"
              />
            </li>
            <li>
              <UButton
                v-if="twitterLink"
                :to="twitterLink"
                target="_blank"
                color="neutral"
                variant="ghost"
                icon="i-simple-icons-x"
              />
            </li>
          </ul>

          <!-- 人物傳記 -->
          <div class="mb-12 text-left">
            <SubTitle title="人物傳記" size="xl" class="mb-4" />
            <p
              class="leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300"
            >
              {{ item.biography || "暫無傳記資料。" }}
            </p>
          </div>

          <!-- 出演作品 -->
          <div v-if="castListItems.length" class="mb-12 text-left">
            <SubTitle title="出演作品" size="xl" class="mb-6 text-left" />
            <div class="min-w-0 overflow-x-auto custom-scrollbar">
              <div class="flex gap-4 pb-6">
                <div
                  v-for="work in castListItems"
                  :key="work.id"
                  class="w-32 md:w-40 shrink-0"
                >
                  <ItemCard :item="work" class="h-full" />
                </div>
              </div>
            </div>
          </div>

          <!-- 幕後製作 -->
          <div v-if="crewListItems.length" class="mb-12">
            <SubTitle title="幕後製作" size="xl" class="mb-6 text-left" />
            <div class="min-w-0 overflow-x-auto custom-scrollbar">
              <div class="flex gap-4 pb-6">
                <div
                  v-for="work in crewListItems"
                  :key="work.id"
                  class="w-32 md:w-40 shrink-0"
                >
                  <ItemCard :item="work" class="h-full" />
                </div>
              </div>
            </div>
          </div>

          <!-- 個人劇照 -->
          <div v-if="profileImages.length" class="mb-12 text-left">
            <SubTitle title="個人劇照" size="xl" class="mb-6" />
            <div class="min-w-0 overflow-x-auto custom-scrollbar">
              <div class="flex gap-4 pb-6 pl-1">
                <div
                  v-for="img in profileImages"
                  :key="img.file_path"
                  class="group relative shrink-0 w-32 md:w-40 cursor-zoom-in overflow-hidden rounded-xl shadow-md transition-all hover:scale-105 hover:shadow-xl"
                  @click="openImage(img)"
                >
                  <img
                    :src="posterUrl(img.file_path, 'w500')"
                    class="h-full w-auto object-cover rounded-xl"
                    loading="lazy"
                    :alt="title"
                  />
                  <div
                    class="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <MediaModals v-model:showImage="isImageModalOpen" :image="activeImage" />
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 100, 100, 0.5) transparent;
}
.animate-slide-up {
  animation: slideUp 0.8s ease-out forwards;
  opacity: 0;
}
.animation-delay-200 {
  animation-delay: 0.2s;
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
