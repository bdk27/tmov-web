import { useTmdb, type TmdbSearchOptions } from "~/composables/useTmdb";

export const useTmdbStore = defineStore("tmdb", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const results = ref<any[]>([]);
  const totalResults = ref(0);
  const page = ref(1);
  const totalPages = ref(1);
  const lastQuery = ref("");
  const lastType = ref<"multi" | "movie" | "tv" | "person">("multi");

  const { search } = useTmdb();

  const doSearch = async (q: string, opts: TmdbSearchOptions = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const res: any = await search(q, opts);
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
    doSearch,
  };
});
