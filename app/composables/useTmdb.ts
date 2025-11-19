export type TmdbSearchType = "multi" | "movie" | "tv" | "person";
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
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
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
  const fetchBackdrop = async (): Promise<{
    backdropDesktopUrl: string;
    backdropMobileUrl: string;
    trailerUrl: string;
  }> => {
    const apiUrl = `${api}/api/tmdb/popular-backdrop`;

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

  // 熱門(電影、影集、人物)
  const fetchPopularMovies = async (): Promise<
    TmdbPaginatedResponse<TmdbItem>
  > => {
    const apiUrl = `${api}/api/tmdb/popular-movies`;
    try {
      const response = await $fetch<TmdbPaginatedResponse<TmdbItem>>(apiUrl);
      if (response.results) {
        response.results = response.results.map((item) => ({
          ...item,
          media_type: "movie",
        }));
      }
      return response;
    } catch (error) {
      console.error(`取得熱門電影失敗`, error);
      throw error;
    }
  };
  const fetchPopularTv = async (): Promise<TmdbPaginatedResponse<TmdbItem>> => {
    const apiUrl = `${api}/api/tmdb/popular-tv`;
    try {
      const response = await $fetch<TmdbPaginatedResponse<TmdbItem>>(apiUrl);
      if (response.results) {
        response.results = response.results.map((item) => ({
          ...item,
          media_type: "tv",
        }));
      }
      return response;
    } catch (error) {
      console.error(`取得熱門影集失敗`, error);
      throw error;
    }
  };
  const fetchPopularPerson = async (): Promise<
    TmdbPaginatedResponse<TmdbItem>
  > => {
    const apiUrl = `${api}/api/tmdb/popular-person`;
    try {
      const response = await $fetch<TmdbPaginatedResponse<TmdbItem>>(apiUrl);
      if (response.results) {
        response.results = response.results.map((item) => ({
          ...item,
          media_type: "person",
        }));
      }
      return response;
    } catch (error) {
      console.error(`取得熱門人物失敗`, error);
      throw error;
    }
  };

  // 輔助函式(海報網址、標題、日期)
  const posterUrl = (path: string | null, size = config.tmdbPosterSize) => {
    return path
      ? `${config.tmdbImageBase}/${size}${path}`
      : "/placeholder-poster.png";
  };
  const titleOf = (item: TmdbItem) => {
    return item.title || item.name || "Untitled";
  };
  const dateOf = (item: TmdbItem) => {
    return item.release_date || item.first_air_date || "Unknown";
  };

  return {
    search,
    fetchBackdrop,
    fetchTrending,
    fetchPopularMovies,
    fetchPopularTv,
    fetchPopularPerson,
    posterUrl,
    titleOf,
    dateOf,
  };
}
