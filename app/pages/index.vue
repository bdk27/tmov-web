<script setup lang="ts">
import { storeToRefs } from "pinia";

const router = useRouter();
const tmdbStore = useTmdbStore();

// 背景圖片
const { backdropDesktopUrl, backdropMobileUrl } = storeToRefs(tmdbStore);
onMounted(async () => {
  await tmdbStore.getBackdrop();
});

const query = ref("");
const type = ref<TmdbSearchOptions["type"]>("multi");
const year = ref<number | null>(null);
// 搜尋
function handleSearch(filters: {
  query: string;
  type: TmdbSearchOptions["type"];
  year: number | null;
  reset: boolean;
}) {
  if (filters.reset) {
    type.value = filters.type;
    year.value = filters.year;

    return;
  }

  const newQuery: Record<string, any> = {
    q: filters.query,
    page: 1, // 永遠從第 1 頁開始
    type: filters.type,
  };

  if (filters.year) {
    newQuery.year = filters.year;
  }

  router.push({ path: "/search", query: newQuery });
}
</script>

<template>
  <div class="flex flex-1 items-start relative overflow-hidden">
    <!-- 背景圖片 -->
    <picture v-if="backdropMobileUrl" class="absolute inset-0 -z-20 bg-white">
      <source
        v-if="backdropDesktopUrl"
        :srcset="backdropDesktopUrl"
        media="(min-width: 768px)"
      />
      <img
        :src="backdropMobileUrl"
        alt="熱門電影背景"
        class="w-full h-full object-cover"
      />
    </picture>
    <div
      class="absolute inset-0 -z-10 transition-all duration-1000"
      :style="{ backgroundImage: 'var(--hero-gradient)' }"
    ></div>
    <!-- 標題 + 表單 -->
    <div
      class="container mx-auto px-4 max-w-xl relative z-10 pt-16 sm:pt-24 lg:pt-32 pb-16"
    >
      <div>
        <h1
          class="text-white text-5xl sm:text-6xl font-extrabold mb-4 leading-tight"
        >
          <span class="text-primary">下一部必看</span>
          <br />
          從 TMOV. 開始
        </h1>
        <h3 class="text-xl sm:text-2xl font-light mb-12 text-white">
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
