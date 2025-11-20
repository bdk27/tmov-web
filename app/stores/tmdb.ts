export const useTmdbStore = defineStore("tmdb", () => {
  const {
    search,
    fetchBackdrop,
    fetchTrending,
    fetchPopularMovies,
    fetchPopularTv,
    fetchPopularPerson,
    fetchNowPlaying,
    fetchUpcoming,
  } = useTmdb();

  // 背景圖 + 預告片
  const backdropDesktopUrl = ref<string | null>(null);
  const backdropMobileUrl = ref<string | null>(null);
  const trailerUrl = ref<string | null>(null);
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

  // 趨勢(今日、本週)
  const trendingToday = ref<TmdbItem[]>([]);
  const trendingWeek = ref<TmdbItem[]>([]);
  const getTrendingToday = async () => {
    if (trendingToday.value.length > 0) return;
    try {
      const response = await fetchTrending("day");
      if (response && response.results) {
        trendingToday.value = response.results;
      }
    } catch (error) {
      console.error("Pinia store (tmdb.ts): 無法獲取今日趨勢:", error);
    }
  };
  const getTrendingWeek = async () => {
    if (trendingWeek.value.length > 0) return;
    try {
      const response = await fetchTrending("week");
      if (response && response.results) {
        trendingWeek.value = response.results;
      }
    } catch (error) {
      console.error("Pinia store (tmdb.ts): 無法獲取本週趨勢:", error);
    }
  };

  // 熱門(電影、影集、人物)
  const popularMovies = ref<TmdbItem[]>([]);
  const popularTv = ref<TmdbItem[]>([]);
  const popularPerson = ref<TmdbItem[]>([]);
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
  const getPopularTv = async () => {
    if (popularTv.value.length > 0) return;
    try {
      const response = await fetchPopularTv();
      if (response && response.results) {
        popularTv.value = response.results;
      }
    } catch (error) {
      console.error("Pinia store (tmdb.ts): 無法獲取熱門影集:", error);
    }
  };
  const getPopularPerson = async () => {
    if (popularPerson.value.length > 0) return;
    try {
      const response = await fetchPopularPerson();
      if (response && response.results) popularPerson.value = response.results;
    } catch (error) {
      console.error("Pinia: 無法獲取熱門人物", error);
    }
  };

  const nowPlaying = ref<TmdbItem[]>([]);
  const upcoming = ref<TmdbItem[]>([]);
  const getNowPlaying = async () => {
    if (nowPlaying.value.length > 0) return;
    try {
      const response = await fetchNowPlaying();
      if (response && response.results) nowPlaying.value = response.results;
    } catch (error) {
      console.error("Pinia: 無法獲取現正熱映", error);
    }
  };
  const getUpcoming = async () => {
    if (upcoming.value.length > 0) return;
    try {
      const response = await fetchUpcoming();
      if (response && response.results) upcoming.value = response.results;
    } catch (error) {
      console.error("Pinia: 無法獲取即將上映", error);
    }
  };

  // 搜尋
  const loading = ref(false);
  const error = ref<string | null>(null);
  const results = ref<any[]>([]);
  const totalResults = ref(0);
  const page = ref(1);
  const totalPages = ref(1);
  const lastQuery = ref("");
  const lastType = ref<"multi" | "movie" | "tv" | "person">("multi");
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
    trendingWeek,
    popularMovies,
    popularTv,
    popularPerson,
    nowPlaying,
    upcoming,
    trailerUrl,
    doSearch,
    getBackdrop,
    getTrendingToday,
    getTrendingWeek,
    getPopularMovies,
    getPopularTv,
    getPopularPerson,
    getNowPlaying,
    getUpcoming,
  };
});
