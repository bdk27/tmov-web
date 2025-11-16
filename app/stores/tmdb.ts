export const useTmdbStore = defineStore("tmdb", () => {
  const { search, fetchBackdrop, fetchTrending, fetchPopularMovies } =
    useTmdb();

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
  const trendingToday = ref<TmdbItem[]>([]);
  const popularMovies = ref<TmdbItem[]>([]);
  const trailerUrl = ref<string | null>(null);

  const doSearch = async (q: string, opts: TmdbSearchOptions = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const res: any = await search(q, opts); // 呼叫 composable
      results.value = res?.results ?? [];
      totalResults.value = res?.total_results ?? 0;
      page.value = res?.page ?? 1;
      totalPages.value = res?.total_pages ?? 1;
      lastQuery.value = q;
      lastType.value = (opts.type ?? "multi") as any;
    } catch (e: any) {
      error.value = e?.data?.error || e?.message || "搜尋失敗";
    } finally {
      loading.value = false;
    }
  };

  const getBackdrop = async () => {
    if (backdropDesktopUrl.value) {
      return;
    }

    try {
      console.log("Pinia store (tmdb.ts): 正在獲取新的背景圖片...");
      const res = await fetchBackdrop();
      console.log("fetchBackdrop ", res);

      if (res) {
        backdropDesktopUrl.value = res.backdropDesktopUrl;
        backdropMobileUrl.value = res.backdropMobileUrl;
        trailerUrl.value = res.trailerUrl;
      }
    } catch (error) {
      console.error("Pinia store (tmdb.ts): 無法獲取背景圖片:", error);
    }
    return null;
  };

  const getTrending = async () => {
    if (trendingToday.value.length > 0) {
      return;
    }

    try {
      const response = await fetchTrending();
      if (response && response.results) {
        trendingToday.value = response.results;
      }
    } catch (error) {
      console.error("Pinia store (tmdb.ts): 無法獲取熱門趨勢:", error);
    }
  };

  const getPopularMovies = async () => {
    if (popularMovies.value.length > 0) {
      return;
    }

    try {
      const response = await fetchPopularMovies();
      if (response && response.results) {
        popularMovies.value = response.results;
      }
    } catch (error) {
      console.error("Pinia store (tmdb.ts): 無法獲取熱門電影:", error);
    }
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
    trendingToday,
    popularMovies,
    trailerUrl,
    doSearch,
    getBackdrop,
    getTrending,
    getPopularMovies,
  };
});
