<script setup lang="ts">
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

useHead({
  title: "觀看紀錄",
});

// 定義後端回傳的資料介面
interface HistoryItem {
  tmdbId?: number;
  id?: number;
  title?: string;
  name?: string;
  posterPath?: string;
  poster_path?: string;
  mediaType?: string;
  media_type?: string;
  voteAverage?: number;
  vote_average?: number;
  releaseDate?: string;
  release_date?: string;
  viewedAt?: string; // 觀看時間
}

const rawItems = ref<HistoryItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const currentPage = ref(1);

onMounted(() => {
  fetchHistory();
});

// 資料處理
const historyItems = computed<TmdbItem[]>(() => {
  return rawItems.value.map((item) => {
    const finalId = item.id || 0;
    const rawType = item.media_type || "movie";
    const type = rawType.toLowerCase();

    // 圖片
    let poster = item.posterPath || item.poster_path || null;
    if (poster && !poster.startsWith("/") && !poster.startsWith("http")) {
      poster = `/${poster}`;
    }

    // 標題與其他
    const finalTitle = item.title || item.name || "未命名";
    const finalVote = item.voteAverage ?? item.vote_average ?? 0;
    const finalDate = item.releaseDate || item.release_date || "";

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
});

// 取得觀看紀錄
async function fetchHistory() {
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const data = await $fetch<HistoryItem[]>("/api/history", {
      headers: getAuthHeaders(),
    });

    rawItems.value = data;
  } catch (err) {
    error.value = "連線發生錯誤";
  } finally {
    loading.value = false;
  }
}

// 刪除所有觀看紀錄
async function clearAllHistory() {
  if (!confirm("確定要清除所有觀看紀錄嗎？此動作無法復原。")) return;

  try {
    await $fetch("/api/history/all", {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    rawItems.value = [];
    toast.add({ title: "已清除觀看紀錄", color: "primary" });
  } catch (e) {
    toast.add({
      title: "清除失敗",
      description: "請稍後再試",
      color: "error",
    });
  }
}
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <div>
      <PagedMediaGrid
        title="觀看紀錄"
        :items="historyItems"
        :loading="loading"
        :error="error"
        :total-results="historyItems.length"
        v-model:current-page="currentPage"
        @retry="fetchHistory"
      />
    </div>

    <div class="flex justify-center mt-6" v-if="rawItems.length > 0">
      <div>
        <UButton
          icon="i-heroicons-trash"
          color="error"
          variant="soft"
          size="md"
          @click="clearAllHistory"
        >
          清除所有紀錄
        </UButton>
      </div>
    </div>
  </div>
</template>
