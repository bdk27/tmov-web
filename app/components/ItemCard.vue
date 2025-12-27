<script setup lang="ts">
const props = defineProps<{ item: TmdbItem }>();
const { posterUrl, titleOf, dateOf, getRating } = useTmdb();

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  checkFavoriteStatus();
});

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      checkFavoriteStatus();
    } else {
      isFavorite.value = false;
    }
  }
);

// 加入收藏
const isFavorite = ref(false);
const isLoading = ref(false);
const showLoginModal = ref(false);

function getAuthHeaders() {
  const token = authStore.token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// 檢查是否加入收藏
async function checkFavoriteStatus() {
  if (!authStore.user?.id) {
    isFavorite.value = false;
    return;
  }

  try {
    const params = new URLSearchParams([
      ["tmdbId", String(props.item.id)],
      ["mediaType", props.item.media_type || ""],
    ]);

    const response = await fetch(`/api/favorites/check?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      isFavorite.value = data.isFavorite;
    }
  } catch (error) {
    console.error("檢查收藏狀態失敗:", error);
  }
}

// 點擊收藏/取消收藏
async function handleFavorite() {
  if (!authStore.isAuthenticated || !authStore.user) {
    showLoginModal.value = true;
    return;
  }

  if (isLoading.value) return;

  console.log("點擊收藏/取消收藏", isFavorite.value);
  const previousState = isFavorite.value;
  const newState = !previousState;

  try {
    const requestBody = JSON.stringify({
      tmdbId: props.item.id,
      mediaType: props.item.media_type,
    });

    let response;

    if (newState) {
      response = await fetch(`/api/favorites`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: requestBody,
      });
    } else {
      response = await fetch(`/api/favorites`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: requestBody,
      });
    }

    isFavorite.value = newState;
  } catch (error) {
    isFavorite.value = previousState;
    // toast.add({ title: "操作失敗", color: "error" });
  } finally {
    isLoading.value = false;
  }
}

function goToLogin() {
  showLoginModal.value = false;
  router.push("/login");
}

const itemPath = computed(() => {
  const item = props.item as any;

  if (item.media_type === "person") return `/person/${item.id}`;
  if (item.media_type === "tv") return `/tv/${item.id}`;
  if (item.media_type === "movie") return `/movie/${item.id}`;

  if (item.known_for_department || item.gender !== undefined)
    return `/person/${item.id}`;

  if (item.first_air_date) return `/tv/${item.id}`;

  return `/movie/${item.id}`;
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
      class="h-full bg-transparent"
      :ui="{
        root: 'divide-y-0 ring-0 rounded-t-xl',
        header: 'p-0 sm:p-0',
        footer: 'p-0 sm:p-0',
      }"
    >
      <template #header>
        <div class="relative overflow-hidden aspect-2/3">
          <!-- 圖片 -->
          <img
            :src="imgSrc"
            :alt="title"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <!-- 加入收藏 -->
          <div
            class="absolute top-2 left-2 p-1.5 cursor-pointer rounded-full transition-all duration-200 backdrop-blur-sm z-10 flex items-center justify-center"
            :class="[
              isFavorite
                ? 'bg-red-500/10 text-red-500'
                : 'bg-black/40 text-white hover:bg-black/60 hover:text-red-400',
            ]"
            @click.prevent.stop="handleFavorite"
            :title="isFavorite ? '取消收藏' : '加入收藏'"
          >
            <UIcon
              :name="
                isFavorite ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'
              "
              class="w-6 h-6 transition-transform active:scale-90"
              :class="{ 'animate-pulse': isLoading }"
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

  <UModal v-model="showLoginModal" v-if="showLoginModal">
    <div class="p-6 text-center">
      <div
        class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-500 mx-auto flex items-center justify-center mb-4"
      >
        <UIcon name="i-heroicons-user-circle" class="w-8 h-8" />
      </div>

      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
        請先登入會員
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        登入後即可收藏「{{ title }}」，建立您的專屬片單！
      </p>

      <div class="flex gap-3 justify-center">
        <UButton
          color="neutral"
          variant="ghost"
          @click="showLoginModal = false"
        >
          稍後再說
        </UButton>
        <UButton color="primary" @click="goToLogin"> 前往登入 </UButton>
      </div>
    </div>
  </UModal>
</template>
