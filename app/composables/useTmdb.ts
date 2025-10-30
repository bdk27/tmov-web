export type TmdbSearchType = "multi" | "movie" | "tv" | "person";

export interface TmdbSearchOptions {
  type?: TmdbSearchType;
  page?: number;
  language?: string;
  region?: string;
  includeAdult?: boolean;
  year?: number; // movie
  firstAirDateYear?: number; // tv
}

export interface TmdbItem {
  id: number;
  media_type?: "movie" | "tv" | "person";
  poster_path?: string | null;
  profile_path?: string | null;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
}

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

  return { search, posterUrl, titleOf, dateOf };
}
