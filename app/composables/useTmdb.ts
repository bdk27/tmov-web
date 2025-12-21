export type TmdbSearchType = "multi" | "movie" | "tv" | "person";
export type TmdbMediaType = "movie" | "tv" | "person";
// 熱門選項
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
  id?: number;
  media_type?: TmdbMediaType;
  popularity?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;

  "watch/providers"?: {
    results: {
      [countryCode: string]: TmdbWatchProviderResult;
    };
  };

  custom_watch_providers?: TmdbWatchProviderResult;
}
export interface TmdbWatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority?: number;
  full_logo_url?: string;
}

// 平台結果集合
export interface TmdbWatchProviderResult {
  link?: string;
  flatrate?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
}
// 分頁
export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
// 詳細資料
export interface TmdbDetail {
  id: number;
  media_type: TmdbMediaType;

  // 基本資訊
  title?: string;
  name?: string;
  gender?: number;
  original_title?: string;
  original_name?: string;
  overview: string;
  tagline?: string;
  status?: string;
  imdb_id?: string;
  also_known_as?: string[];

  // 圖片
  poster_path: string | null;
  backdrop_path: string | null;
  profile_path?: string | null;

  // 數據
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  popularity: number;

  // 電影專屬
  runtime?: number;
  release_date?: string;
  budget?: number;
  revenue?: number;

  // 電視專屬
  first_air_date?: string;
  last_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;

  // 人物專屬
  birthday?: string;
  deathday?: string | null;
  place_of_birth?: string;
  known_for_department?: string;
  biography?: string;

  // 關聯資料
  credits?: {
    cast: TmdbCast[];
    crew: TmdbCrew[];
  };
  combined_credits?: {
    cast: TmdbCast[];
    crew: TmdbCrew[];
  };

  // 媒體
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    };
  };
  images?: {
    backdrops: TmdbImage[];
    posters: TmdbImage[];
    logos: TmdbImage[];
    profiles?: TmdbImage[];
  };

  // 推薦
  recommendations?: {
    results: TmdbItem[];
  };

  seasons?: {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    vote_average: number;
  }[];

  // 製作資訊
  production_companies?: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];

  // 相關系列
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };

  // 觀看平台
  "watch/providers"?: {
    results: {
      [countryCode: string]: {
        link: string;
        flatrate?: TmdbWatchProvider[];
        buy?: TmdbWatchProvider[];
        rent?: TmdbWatchProvider[];
      };
    };
  };
  custom_watch_providers?: TmdbWatchProvider[];

  // 分級
  release_dates?: { results: any[] };
  custom_rating?: string;

  // 社群連結
  external_ids?: {
    imdb_id?: string;
    facebook_id?: string;
    instagram_id?: string;
    twitter_id?: string;
  };

  // 關鍵字
  keywords?: {
    keywords?: { id: number; name: string }[];
    results?: { id: number; name: string }[];
  };
}
export interface TmdbCast extends TmdbItem {
  character: string;
}
export interface TmdbCrew extends TmdbItem {
  job: string;
  department: string;
}

export interface TmdbImage {
  file_path: string;
  width: number;
  height: number;
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

  // 電影預告片
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

  // 獲取詳情
  const fetchDetail = async (type: string, id: number): Promise<TmdbDetail> => {
    const validTypes = ["movie", "tv", "person"];

    if (!validTypes.includes(type)) {
      throw new Error(`無效的類型: ${type}`);
    }
    const apiUrl = `${api}/api/tmdb/${type}/${id}`;

    try {
      const response = await $fetch<any>(apiUrl);
      return {
        ...response,
        media_type: response.media_type || type,
      };
    } catch (error) {
      console.error(`取得詳情失敗 [${type}/${id}]`, error);
      throw error;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
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
    return item.release_date || item.first_air_date || "";
  };
  const getRating = (item: { vote_average?: number }) => {
    if (!item.vote_average) return 0;
    return Math.round(item.vote_average * 10);
  };
  const getRatingColor = (rating: number) => {
    if (rating >= 70) return "text-primary";
    if (rating >= 40) return "text-warning";
    return "text-error";
  };
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const getDetailTitle = (item?: TmdbDetail) => item?.title || item?.name || "";
  const getDetailImage = (item?: TmdbDetail) =>
    item?.poster_path || item?.profile_path || null;

  // 取得導演/主創 (從 crew 篩選)
  const getDirectors = (item: TmdbDetail) => {
    const crew = item.credits?.crew || [];

    const directors = crew.filter((c) => c.job === "Director");
    if (directors.length > 0) return directors;

    return crew.filter((c) => c.job === "Executive Producer");
  };

  const getWriters = (item: TmdbDetail) => {
    const crew = item.credits?.crew || [];
    return crew.filter((c) => c.job === "Original Story" || c.job === "Writer");
  };

  // 取得觀看平台
  const getWatchProviders = (
    item: TmdbDetail | TmdbItem
  ): TmdbWatchProvider[] => {
    if (Array.isArray(item.custom_watch_providers)) {
      return item.custom_watch_providers;
    }

    let data: TmdbWatchProviderResult | undefined;

    // 優先使用 custom_watch_providers
    if (item.custom_watch_providers) {
      data = item.custom_watch_providers;
    }
    // 備用：讀取 watch/providers.results.TW
    else if (item["watch/providers"]?.results?.["TW"]) {
      data = item["watch/providers"].results["TW"];
    }

    if (!data) return [];

    // 合併所有管道
    const allProviders: TmdbWatchProvider[] = [];
    if (data.flatrate) allProviders.push(...data.flatrate);
    if (data.rent) allProviders.push(...data.rent);
    if (data.buy) allProviders.push(...data.buy);

    // 去重
    const unique = new Map<number, TmdbWatchProvider>();
    allProviders.forEach((p) => unique.set(p.provider_id, p));

    // 排序
    return Array.from(unique.values()).sort(
      (a, b) => (a.display_priority || 999) - (b.display_priority || 999)
    );
  };

  // 取得 YouTube 縮圖
  const getYoutubeThumb = (key: string) =>
    `https://img.youtube.com/vi/${key}/mqdefault.jpg`;

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
    fetchDetail,
    formatRuntime,
    getDetailTitle,
    getDetailImage,
    formatCurrency,
    getDirectors,
    getWriters,
    getWatchProviders,
    getYoutubeThumb,
  };
}
