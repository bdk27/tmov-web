export const useTmdbStore = defineStore("tmdb", () => {
  const {
    search,
    fetchBackdrop,
    fetchTrending,
    fetchPopular,
    fetchNowPlaying,
    fetchUpcoming,
    fetchTopRated,
    fetchDetail,
  } = useTmdb();

  // 背景圖 + 預告片
  const backdropDesktopUrl = ref<string | null>(null);
  const backdropMobileUrl = ref<string | null>(null);
  const trailerUrl = ref<string | null>(null);
  const getBackdrop = async (category: TmdbPopularCategory = "movie") => {
    if (backdropDesktopUrl.value) {
      return true;
    }

    try {
      console.log("Pinia store (tmdb.ts): 正在獲取新的背景圖片...");
      const res = await fetchBackdrop(category);

      if (res) {
        backdropDesktopUrl.value = res.backdropDesktopUrl;
        backdropMobileUrl.value = res.backdropMobileUrl;
        trailerUrl.value = res.trailerUrl;

        return res;
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

  // 熱門動畫
  const popularAnime = ref<TmdbItem[]>([]);
  const popularAnimeTotal = ref(0);
  const popularAnimeLoading = ref(false);
  const popularAnimeError = ref<string | null>(null);
  const getPopularAnime = async (page = 1) => {
    popularAnimeLoading.value = true;
    popularAnimeError.value = null;
    try {
      const response = await fetchPopular("anime", page);
      if (response && response.results) {
        popularAnime.value = response.results;
        popularAnimeTotal.value = Math.min(response.total_results, 10000);
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      popularAnimeError.value = msg;
      console.error("Pinia store (tmdb.ts): 無法獲取熱門動畫:");
    } finally {
      popularAnimeLoading.value = false;
    }
  };

  // 熱門電視劇
  const popularDrama = ref<TmdbItem[]>([]);
  const popularDramaTotal = ref(0);
  const popularDramaLoading = ref(false);
  const popularDramaError = ref<string | null>(null);
  const getPopularDrama = async (page = 1) => {
    popularDramaLoading.value = true;
    popularDramaError.value = null;
    try {
      const response = await fetchPopular("tv", page);
      if (response && response.results) {
        popularDrama.value = response.results;
        popularDramaTotal.value = Math.min(response.total_results, 10000);
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      popularDramaError.value = msg;
      console.error("Pinia store (tmdb.ts): 無法獲取熱門電視劇:", error);
    } finally {
      popularDramaLoading.value = false;
    }
  };

  // 熱門綜藝
  const popularVariety = ref<TmdbItem[]>([]);
  const popularVarietyTotal = ref(0);
  const popularVarietyLoading = ref(false);
  const popularVarietyError = ref<string | null>(null);
  const getPopularVariety = async (page = 1) => {
    popularVarietyLoading.value = true;
    popularVarietyError.value = null;
    try {
      const response = await fetchPopular("variety", page);
      if (response && response.results) {
        popularVariety.value = response.results;
        popularVarietyTotal.value = Math.min(response.total_results, 10000);
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      popularVarietyError.value = msg;
      console.error("Pinia store (tmdb.ts): 無法獲取熱門綜藝:", error);
    } finally {
      popularVarietyLoading.value = false;
    }
  };

  // 熱門紀錄片
  const popularDocumentary = ref<TmdbItem[]>([]);
  const popularDocumentaryTotal = ref(0);
  const popularDocumentaryLoading = ref(false);
  const popularDocumentaryError = ref<string | null>(null);
  const getpopularDocumentary = async (page = 1) => {
    popularDocumentaryLoading.value = true;
    popularDocumentaryError.value = null;
    try {
      const response = await fetchPopular("documentary", page);
      if (response && response.results) {
        popularDocumentary.value = response.results;
        popularDocumentaryTotal.value = Math.min(response.total_results, 10000);
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      popularDocumentaryError.value = msg;
      console.error("Pinia store (tmdb.ts): 無法獲取熱門喜劇:", error);
    } finally {
      popularDocumentaryLoading.value = false;
    }
  };

  // 熱門兒童節目
  const popularChildren = ref<TmdbItem[]>([]);
  const popularChildrenTotal = ref(0);
  const popularChildrenLoading = ref(false);
  const popularChildrenError = ref<string | null>(null);
  const getPopularChildren = async (page = 1) => {
    popularChildrenLoading.value = true;
    popularChildrenError.value = null;
    try {
      const response = await fetchPopular("children", page);
      if (response && response.results) {
        popularChildren.value = response.results;
        popularChildrenTotal.value = Math.min(response.total_results, 10000);
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      popularChildrenError.value = msg;
      console.error("Pinia store (tmdb.ts): 無法獲取熱門兒童節目:", error);
    } finally {
      popularChildrenLoading.value = false;
    }
  };

  // 熱門脫口秀
  const popularTalkShow = ref<TmdbItem[]>([]);
  const popularTalkShowTotal = ref(0);
  const popularTalkShowLoading = ref(false);
  const popularTalkShowError = ref<string | null>(null);
  const getPopularTalkShow = async (page = 1) => {
    popularTalkShowLoading.value = true;
    popularTalkShowError.value = null;
    try {
      const response = await fetchPopular("talkShow", page);
      if (response && response.results) {
        popularTalkShow.value = response.results;
        popularTalkShowTotal.value = Math.min(response.total_results, 10000);
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      popularTalkShowError.value = msg;
      console.error("Pinia store (tmdb.ts): 無法獲取熱門脫口秀:", error);
    } finally {
      popularTalkShowLoading.value = false;
    }
  };

  // 熱門電影
  const popularMovies = ref<TmdbItem[]>([]);
  const popularMoviesTotal = ref(0);
  const popularMoviesLoading = ref(false);
  const popularMoviesError = ref<string | null>(null);
  const getPopularMovies = async (page = 1) => {
    popularMoviesLoading.value = true;
    popularMoviesError.value = null;
    try {
      const response = await fetchPopular("movie", page);
      if (response && response.results) {
        popularMovies.value = response.results;
        popularMoviesTotal.value = Math.min(response.total_results, 10000);
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      popularMoviesError.value = msg;
      console.error("Pinia store (tmdb.ts): 無法獲取熱門電影:", error);
    } finally {
      popularMoviesLoading.value = false;
    }
  };

  // 熱門電視劇
  const popularTv = ref<TmdbItem[]>([]);
  const popularTvTotal = ref(0);
  const popularTvLoading = ref(false);
  const popularTvError = ref<string | null>(null);
  const getPopularTv = async (page = 1) => {
    popularTvLoading.value = true;
    popularTvError.value = null;
    try {
      const response = await fetchPopular("tv", page);
      if (response && response.results) {
        popularTv.value = response.results;
        popularTvTotal.value = Math.min(response.total_results, 10000);
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      popularTvError.value = msg;
      console.error("Pinia store (tmdb.ts): 無法獲取熱門電視節目:", error);
    } finally {
      popularTvLoading.value = false;
    }
  };

  // 熱門人物
  const popularPerson = ref<TmdbItem[]>([]);
  const popularPersonTotal = ref(0);
  const popularPersonLoading = ref(false);
  const popularPersonError = ref<string | null>(null);
  const getPopularPerson = async (page = 1) => {
    popularPersonLoading.value = true;
    popularPersonError.value = null;
    try {
      const response = await fetchPopular("person", page);
      if (response && response.results) {
        console.log("response", response);
        popularPerson.value = response.results;
        popularPersonTotal.value = Math.min(response.total_results, 10000);
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      popularPersonError.value = msg;
      console.error("Pinia store (tmdb.ts): 無法獲取熱門人物:", error);
    } finally {
      popularPersonLoading.value = false;
    }
  };

  // 現正熱映
  const nowPlayingMovies = ref<TmdbItem[]>([]);
  const nowPlayingMoviesTotal = ref(0);
  const nowPlayingMoviesLoading = ref(false);
  const nowPlayingMoviesError = ref<string | null>(null);
  const getNowPlayingMovies = async (page = 1) => {
    nowPlayingMoviesLoading.value = true;
    nowPlayingMoviesError.value = null;
    try {
      const response = await fetchNowPlaying(page);
      if (response && response.results) {
        nowPlayingMovies.value = response.results;
        nowPlayingMoviesTotal.value = response.total_results;
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      nowPlayingMoviesError.value = msg;
      console.error("Pinia: 無法獲取現正熱映", msg);
    } finally {
      nowPlayingMoviesLoading.value = false;
    }
  };

  // 即將上映
  const upcomingMovies = ref<TmdbItem[]>([]);
  const upcomingMoviesTotal = ref(0);
  const upcomingMoviesLoading = ref(false);
  const upcomingMoviesError = ref<string | null>(null);
  const getUpcomingMovies = async (page = 1) => {
    upcomingMoviesLoading.value = true;
    upcomingMoviesError.value = null;
    try {
      const response = await fetchUpcoming(page);
      if (response && response.results) {
        upcomingMovies.value = response.results;
        upcomingMoviesTotal.value = response.total_results;
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      upcomingMoviesError.value = msg;
      console.error("Pinia: 無法獲取即將上映", msg);
    } finally {
      upcomingMoviesLoading.value = false;
    }
  };

  // 好評推薦
  const topRatedMovies = ref<TmdbItem[]>([]);
  const topRatedMoviesTotal = ref(0);
  const topRatedMoviesLoading = ref(false);
  const topRatedMoviesError = ref<string | null>(null);
  const getTopRatedMovies = async (page = 1) => {
    topRatedMoviesLoading.value = true;
    topRatedMoviesError.value = null;
    try {
      const response = await fetchTopRated(page);
      if (response && response.results) {
        topRatedMovies.value = response.results;
        topRatedMoviesTotal.value = Math.min(response.total_results, 10000);
      }
    } catch (error: any) {
      const msg = error?.message || "載入失敗";
      topRatedMoviesError.value = msg;
      console.error("Pinia: 無法獲取即將上映", msg);
    } finally {
      topRatedMoviesLoading.value = false;
    }
  };

  // 搜尋
  const searchLoading = ref(false);
  const searchError = ref<string | null>(null);
  const searchResults = ref<any[]>([]);
  const searchTotalResults = ref(0);
  const searchTotalPages = ref(1);
  const lastQuery = ref("");
  const lastType = ref<"multi" | "movie" | "tv" | "person">("multi");
  const doSearch = async (q: string, opts: TmdbSearchOptions = {}) => {
    searchLoading.value = true;
    searchError.value = null;
    try {
      const res: any = await search(q, opts); // 呼叫 composable
      searchResults.value = res?.results ?? [];
      searchTotalResults.value = res?.total_results ?? 0;
      searchTotalPages.value = res?.total_pages ?? 1;
      lastQuery.value = q;
      lastType.value = (opts.type ?? "multi") as any;
    } catch (e: any) {
      searchError.value = e?.data?.error || e?.message || "搜尋失敗";
    } finally {
      searchLoading.value = false;
    }
  };

  // 詳情
  const currentItemDetail = ref<TmdbDetail | null>(null);
  const currentItemDetailLoading = ref(false);
  const getItemDetail = async (type: string, id: number) => {
    currentItemDetailLoading.value = true;
    currentItemDetail.value = null; // 清空舊資料
    try {
      const response = await fetchDetail(type, id);
      if (response) {
        currentItemDetail.value = response;
      }
    } catch (error) {
      console.error(`Pinia: 無法獲取 ${type} 詳情`, error);
    } finally {
      currentItemDetailLoading.value = false;
    }
  };

  return {
    searchLoading,
    searchError,
    searchResults,
    searchTotalResults,
    searchTotalPages,
    lastQuery,
    lastType,
    backdropDesktopUrl,
    backdropMobileUrl,
    trendingToday,
    trendingWeek,
    popularMovies,
    popularMoviesTotal,
    popularMoviesLoading,
    popularMoviesError,
    popularTv,
    popularTvTotal,
    popularTvLoading,
    popularTvError,
    popularAnime,
    popularAnimeTotal,
    popularAnimeLoading,
    popularAnimeError,
    popularDrama,
    popularDramaTotal,
    popularDramaLoading,
    popularDramaError,
    popularVariety,
    popularVarietyTotal,
    popularVarietyLoading,
    popularVarietyError,
    popularDocumentary,
    popularDocumentaryTotal,
    popularDocumentaryLoading,
    popularDocumentaryError,
    popularChildren,
    popularChildrenTotal,
    popularChildrenLoading,
    popularChildrenError,
    popularTalkShow,
    popularTalkShowTotal,
    popularTalkShowLoading,
    popularTalkShowError,
    popularPerson,
    popularPersonTotal,
    popularPersonLoading,
    popularPersonError,
    nowPlayingMovies,
    nowPlayingMoviesTotal,
    nowPlayingMoviesLoading,
    nowPlayingMoviesError,
    upcomingMovies,
    upcomingMoviesTotal,
    upcomingMoviesLoading,
    upcomingMoviesError,
    topRatedMovies,
    topRatedMoviesTotal,
    topRatedMoviesLoading,
    topRatedMoviesError,
    trailerUrl,
    currentItemDetail,
    currentItemDetailLoading,
    doSearch,
    getBackdrop,
    getTrendingToday,
    getTrendingWeek,
    getPopularMovies,
    getPopularTv,
    getPopularPerson,
    getPopularAnime,
    getPopularDrama,
    getPopularVariety,
    getpopularDocumentary,
    getPopularChildren,
    getPopularTalkShow,
    getNowPlayingMovies,
    getUpcomingMovies,
    getTopRatedMovies,
    getItemDetail,
  };
});
