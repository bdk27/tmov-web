export const useTmdbStore = defineStore("tmdb", () => {
  const { fetchBackdrop } = useTmdb();

  const loading = ref(false);
  const error = ref<string | null>(null);
  const results = ref<any[]>([]);
  const totalResults = ref(0);
  const page = ref(1);
  const totalPages = ref(1);
  const lastQuery = ref("");
  const lastType = ref<"multi" | "movie" | "tv" | "person">("multi");
  const backdropDesktopUrl = ref<string | null>(null);
  const backdropMobileUrl = ref<string | null>(null);

  const getBackdrop = async () => {
    if (backdropDesktopUrl.value) {
      return;
    }

    try {
      console.log("Pinia store (tmdb.ts): 正在獲取新的背景圖片...");
      const response = await fetchBackdrop();
      if (response) {
        backdropDesktopUrl.value = response.backdropDesktopUrl;
        backdropMobileUrl.value = response.backdropMobileUrl;
      }
    } catch (error) {
      console.error("Pinia store (tmdb.ts): 無法獲取背景圖片:", error);
    }
    return null;
  };

  return {
    loading,
    error,
    results,
    totalResults,
    page,
    totalPages,
    lastQuery,
    lastType,
    backdropDesktopUrl,
    backdropMobileUrl,
    getBackdrop,
  };
});
