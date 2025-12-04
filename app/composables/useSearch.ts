export const useSearch = () => {
  const router = useRouter();

  const handleSearch = (filters: {
    query: string;
    type: TmdbSearchOptions["type"];
    year: number | null;
  }) => {
    if (!filters.query.trim()) return;

    const newQuery: Record<string, any> = {
      q: filters.query,
      page: 1, // 每次新搜尋都重置回第 1 頁
      type: filters.type,
    };

    if (filters.year) {
      newQuery.year = filters.year;
    }

    router.push({ path: "/search", query: newQuery });
  };

  return {
    handleSearch,
  };
};
