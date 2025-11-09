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
  <div class="flex flex-1 items-center justify-center">
    <div class="container mx-auto px-4 max-w-xl">
      <div>
        <h1 class="text-5xl sm:text-6xl font-extrabold mb-4 leading-tight">
          <span class="text-primary">下一部必看</span>
          <br class="sm:hidden dark:text-white" />
          從 TMOV. 開始
        </h1>
        <h3 class="text-xl sm:text-2xl dark:text-muted font-light mb-12">
          上百萬部電影、電視節目和演員資料等你來探索
        </h3>
        <!-- 搜尋欄 -->
        <SearchForm
          :query="query"
          :type="type"
          :year="year"
          @submit-search="handleSearch"
        />
      </div>
    </div>
  </div>
</template>
