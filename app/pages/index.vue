<script setup lang="ts">
const router = useRouter();

const query = ref("");
const type = ref<TmdbSearchOptions["type"]>("multi");
const year = ref<number | null>(null);

function handleSearch(filters: {
  query: string;
  type: TmdbSearchOptions["type"];
  year: number | null;
  reset: boolean;
}) {
  if (filters.reset) {
    // 如果是重設，我們只想更新首頁的 ref
    // (SearchForm 已經/將會 emit 它的預設值)
    // 並且我們 "不" 執行 router.push
    type.value = filters.type;
    year.value = filters.year;

    // 注意：我們不重設 query.value，允許使用者保留關鍵字

    return; // 關鍵：到此為止，不執行導航
  }
  // 建立要跳轉的 URL query
  const newQuery: Record<string, any> = {
    q: filters.query,
    page: 1, // 永遠從第 1 頁開始
    type: filters.type,
  };

  if (filters.year) {
    newQuery.year = filters.year;
  }

  // 3. 導航到 /search 頁面，並帶上所有篩選參數
  router.push({ path: "/search", query: newQuery });
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-xl">
    <h1 class="text-3xl font-bold text-center mb-6">TMDB 搜尋</h1>
    <!-- 搜尋欄 -->
    <SearchForm
      :query="query"
      :type="type"
      :year="year"
      @submit-search="handleSearch"
    />
  </div>
</template>
