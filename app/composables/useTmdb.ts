export type TmdbSearchType = "multi" | "movie" | "tv" | "person";
export type TmdbPopularCategory =
  | "movie"
  | "tv"
  | "anime"
  | "drama"
  | "variety"
  | "documentary"
  | "children"
  | "talkShow"
  | "person";

// 搜尋選項
export interface TmdbSearchOptions {
  type?: TmdbSearchType;
  page?: number;
  language?: string;
  region?: string;
  includeAdult?: boolean;
  year?: number;
  firstAirDateYear?: number;
}
// 電影項目
export interface TmdbItem {
  id: number;
  media_type?: "movie" | "tv" | "person";
  poster_path?: string | null;
  profile_path?: string | null;
  backdrop_path?: string | null;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
  popularity?: number;
}
// 分頁
export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export function useTmdb() {
  const config = useRuntimeConfig().public;
  const api = config.apiBase;

  const search = async (q: string, opts: TmdbSearchOptions = {}) => {
    const params = new URLSearchParams({
      q,
      type: String(opts.type ?? "multi"),
      page: String(opts.page ?? 1),
    });

    if (opts.language) params.set("language", opts.language);
    if (opts.region) params.set("region", opts.region);
    if (typeof opts.includeAdult === "boolean")
      params.set("include_adult", String(opts.includeAdult));
    if (opts.year) params.set("year", String(opts.year));
    if (opts.firstAirDateYear)
      params.set("first_air_date_year", String(opts.firstAirDateYear));

    return $fetch<TmdbPaginatedResponse<TmdbItem>>(
      `${api}/api/tmdb/search?${params.toString()}`,
      {
        credentials: "include",
      }
    );
  };

  // 背景圖 + 預告片
  const fetchBackdrop = async (
    category: TmdbPopularCategory = "movie"
  ): Promise<{
    backdropDesktopUrl: string;
    backdropMobileUrl: string;
    trailerUrl: string;
  }> => {
    const apiUrl = `${api}/api/tmdb/popular-backdrop?category=${category}`;

    try {
      const res = await $fetch<{
        backdropDesktopUrl: string;
        backdropMobileUrl: string;
        trailerUrl: string;
      }>(apiUrl);
      return res;
    } catch (error) {
      console.error(`取得背景圖片、預告片失敗`, error);
      throw error;
    }
  };

  // 趨勢(今日、本週)
  const fetchTrending = async (
    timeWindow: "day" | "week"
  ): Promise<TmdbPaginatedResponse<TmdbItem>> => {
    const apiUrl = `${api}/api/tmdb/trending?time_window=${timeWindow}`;

    try {
      const response = await $fetch<TmdbPaginatedResponse<TmdbItem>>(apiUrl);
      return response;
    } catch (error) {
      console.error(`取得熱門趨勢失敗`, error);
      throw error;
    }
  };

  // 熱門列表(電影、電視劇、動畫、綜藝、人物)
  const fetchPopular = async (
    category: TmdbPopularCategory,
    page: number = 1
  ): Promise<TmdbPaginatedResponse<TmdbItem>> => {
    let endpoint = "";
    let mediaType: "movie" | "tv" | "person" = "movie";

    switch (category) {
      case "movie":
        endpoint = "/api/tmdb/popular-movies";
        mediaType = "movie";
        break;
      case "tv":
        endpoint = "/api/tmdb/popular-tv";
        mediaType = "tv";
        break;
      case "anime":
        endpoint = "/api/tmdb/popular-anime";
        mediaType = "tv";
        break;
      case "drama":
        endpoint = "/api/tmdb/popular-drama";
        mediaType = "tv";
        break;
      case "variety":
        endpoint = "/api/tmdb/popular-variety";
        mediaType = "tv";
        break;
      case "documentary":
        endpoint = "/api/tmdb/popular-documentary";
        mediaType = "tv";
        break;
      case "children":
        endpoint = "/api/tmdb/popular-children";
        mediaType = "tv";
        break;
      case "talkShow":
        endpoint = "/api/tmdb/popular-talkShow";
        mediaType = "tv";
        break;
      case "person":
        endpoint = "/api/tmdb/popular-person";
        mediaType = "person";
        break;
    }

    const apiUrl = `${api}${endpoint}`;

    try {
      const response = await $fetch<TmdbPaginatedResponse<TmdbItem>>(apiUrl, {
        params: { page },
      });

      if (response.results) {
        response.results = response.results.map((item) => ({
          ...item,
          media_type: item.media_type || mediaType,
        }));
      }
      return response;
    } catch (error) {
      console.error(`取得熱門列表失敗 (${category})`, error);
      throw error;
    }
  };

  // 現正熱映
  const fetchNowPlaying = async (
    page = 1
  ): Promise<TmdbPaginatedResponse<TmdbItem>> => {
    const apiUrl = `${api}/api/tmdb/now-playing`;
    const response = await $fetch<TmdbPaginatedResponse<TmdbItem>>(apiUrl, {
      params: { page },
    });
    if (response.results) {
      response.results = response.results.map((item) => ({
        ...item,
        media_type: "movie",
      }));
    }
    return response;
  };

  // 即將上映
  const fetchUpcoming = async (
    page: number = 1
  ): Promise<TmdbPaginatedResponse<TmdbItem>> => {
    const apiUrl = `${api}/api/tmdb/upcoming`;
    const response = await $fetch<TmdbPaginatedResponse<TmdbItem>>(apiUrl, {
      params: { page },
    });
    if (response.results) {
      response.results = response.results.map((item) => ({
        ...item,
        media_type: "movie",
      }));
    }
    return response;
  };

  // 好評推薦
  const fetchTopRated = async (
    page: number = 1
  ): Promise<TmdbPaginatedResponse<TmdbItem>> => {
    const apiUrl = `${api}/api/tmdb/top-rated`;
    const response = await $fetch<TmdbPaginatedResponse<TmdbItem>>(apiUrl, {
      params: { page },
    });
    if (response.results) {
      response.results = response.results.map((item) => ({
        ...item,
        media_type: "movie",
      }));
    }
    return response;
  };

  // 獲取電影預告片
  const fetchMovieTrailer = async (
    movieId: number
  ): Promise<{ trailerUrl: string }> => {
    const apiUrl = `${api}/api/tmdb/movie/${movieId}/trailer`;
    try {
      const response = await $fetch<{ trailerUrl: string }>(apiUrl);
      console.log("response", response);

      return response;
    } catch (error) {
      console.error(`取得電影預告片失敗 ID:${movieId}`, error);
      return { trailerUrl: "" };
    }
  };

  // 輔助函式(海報網址、標題、日期、評分)
  const posterUrl = (path: string | null, size = config.tmdbPosterSize) => {
    return path
      ? `${config.tmdbImageBase}/${size}${path}`
      : "/placeholder-poster.png";
  };
  const backdropUrl = (path: string | null | undefined, size = "w1280") => {
    return path
      ? `${config.tmdbImageBase}/${size}${path}`
      : "/placeholder-backdrop.png";
  };
  const titleOf = (item: TmdbItem) => {
    return item.title || item.name || "查無標題";
  };
  const dateOf = (item: TmdbItem) => {
    return item.release_date || item.first_air_date || "未知日期";
  };
  const getRating = (item: TmdbItem) => {
    if (!item.vote_average) return 0;
    return Math.round(item.vote_average * 10);
  };
  const getRatingColor = (rating: number) => {
    if (rating >= 70) return "text-primary";
    if (rating >= 40) return "text-warning";
    return "text-error";
  };

  return {
    search,
    fetchBackdrop,
    fetchTrending,
    fetchPopular,
    fetchNowPlaying,
    fetchUpcoming,
    posterUrl,
    backdropUrl,
    titleOf,
    dateOf,
    getRating,
    getRatingColor,
    fetchMovieTrailer,
    fetchTopRated,
  };
}
