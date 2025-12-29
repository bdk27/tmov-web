<script setup lang="ts">
const authStore = useAuthStore();
const router = useRouter();
const config = useRuntimeConfig().public;
const api = config.apiBase;

// 定義資料介面
interface FavoriteItem {
  // ID
  id?: number;
  tmdb_id?: number;

  // 標題
  title?: string;
  name?: string;

  // 圖片
  poster_path?: string;
  profile_path?: string;

  // 類型
  media_type?: string;

  // 其他
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

// 定義分類標籤
const tabs = [
  { label: "全部", key: "all" },
  { label: "電影", key: "movie" },
  { label: "影集", key: "tv" },
  { label: "人物", key: "person" },
];

const rawItems = ref<FavoriteItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(() => {
  fetchFavorites();
});

// 抓取資料
async function fetchFavorites() {
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${api}/api/favorites`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (response.ok) {
      rawItems.value = await response.json();
    } else {
      error.value = "無法取得收藏資料";
    }
  } catch (err) {
    error.value = "連線發生錯誤";
  } finally {
    loading.value = false;
  }
}

const currentTab = ref("all");
const currentPage = ref(1);
watch(currentTab, () => {
  currentPage.value = 1;
});

// 資料處理核心：篩選 Tab + 格式轉換 (Mapping)
const filteredItems = computed<TmdbItem[]>(() => {
  const normalized = rawItems.value.map((item) => {
    const finalId = item.id || item.tmdb_id || 0;

    const rawType = item.media_type || "movie";
    const type = rawType.toLowerCase();

    let poster = item.poster_path || item.profile_path || null;
    if (poster && !poster.startsWith("/") && !poster.startsWith("http")) {
      poster = `/${poster}`;
    }

    const finalTitle = item.title || item.name || "未命名";
    const finalVote = item.vote_average ?? 0;
    const finalDate = item.release_date || item.first_air_date;

    return {
      id: finalId,
      title: finalTitle,
      name: finalTitle, // TV 用
      poster_path: poster,
      profile_path: poster, // Person 用
      media_type: type as any,
      vote_average: finalVote,
      release_date: finalDate,
      first_air_date: finalDate,
      popularity: 0,
      overview: "",
      backdrop_path: null,
    };
  });

  // 根據 Tab 進行篩選
  if (currentTab.value !== "all") {
    return normalized.filter((item) => item.media_type === currentTab.value);
  }

  return normalized;
});

// 客戶端分頁邏輯
const paginatedItems = computed(() => {
  const itemsPerPage = 20;
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredItems.value.slice(start, end);
});
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <div
      class="flex flex-col md:flex-row md:items-center justify-center mb-10 gap-4"
    >
      <!-- 分類切換 Tab -->
      <div
        class="flex p-1 space-x-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="currentTab = tab.key"
          class="px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all duration-200"
          :class="[
            currentTab === tab.key
              ? 'bg-primary text-neutral-900 shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div>
      <PagedMediaGrid
        title="我的收藏"
        :items="paginatedItems"
        :loading="loading"
        :error="error"
        :total-results="filteredItems.length"
        v-model:current-page="currentPage"
        @retry="fetchFavorites"
      />
    </div>
  </div>
</template>
