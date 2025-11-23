export const useSearch = () => {
  const router = useRouter();

  const handleSearch = (filters: {
    query: string;
    type: TmdbSearchOptions["type"];
    year: number | null;
  }) => {
    // 1. 檢查是否有輸入關鍵字 (選用，視需求而定)
    if (!filters.query.trim()) return;

    // 2. 建立 Query 參數物件
    const newQuery: Record<string, any> = {
      q: filters.query,
      page: 1, // 每次新搜尋都重置回第 1 頁
      type: filters.type,
    };

    // 3. 只有當年份有值時才加入參數
    if (filters.year) {
      newQuery.year = filters.year;
    }

    // 4. 執行路由跳轉
    router.push({ path: "/search", query: newQuery });
  };

  return {
    handleSearch,
  };
};
