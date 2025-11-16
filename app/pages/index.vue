<script setup lang="ts">
import { storeToRefs } from "pinia";

const router = useRouter();
const tmdbStore = useTmdbStore();

// 背景圖片
const {
  backdropDesktopUrl,
  backdropMobileUrl,
  trailerUrl,
  trendingToday,
  popularMovies,
} = storeToRefs(tmdbStore);

await useAsyncData("hero-data", () => tmdbStore.getBackdrop());

onMounted(() => {
  tmdbStore.getTrending().catch((err) => {
    console.error(err);
  });
  tmdbStore.getPopularMovies().catch((err) => {
    console.error(err);
  });
});

// 搜尋
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
    type.value = filters.type;
    year.value = filters.year;

    return;
  }

  const newQuery: Record<string, any> = {
    q: filters.query,
    page: 1,
    type: filters.type,
  };

  if (filters.year) {
    newQuery.year = filters.year;
  }

  router.push({ path: "/search", query: newQuery });
}
</script>

<template>
  <div>
    <div class="relative overflow-hidden">
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
      <UPageHero
        headline=""
        orientation="horizontal"
        :reverse="true"
        class="container mx-auto"
      >
        <template #title>
          <h1
            class="text-white text-5xl sm:text-6xl font-extrabold mb-4 leading-tight"
          >
            <span class="text-primary">下一部必看</span>
            <br />
            <span class="text-t-card-heading"> 從 TMOV. 開始 </span>
          </h1>
          <h3 class="text-xl sm:text-2xl font-light mb-14 text-white">
            上百萬部電影、電視節目和演員資料等你來探索
          </h3>

          <SearchForm
            :query="query"
            :type="type"
            :year="year"
            @submit-search="handleSearch"
          />
        </template>
        <template #default>
          <div
            class="w-full aspect-video rounded-lg shadow-2xl bg-t-card-bg relative hidden lg:block"
          >
            <iframe
              v-if="trailerUrl"
              :src="trailerUrl"
              title="Popular Movie Trailer"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              class="absolute inset-0 w-full h-full rounded-lg"
            ></iframe>
          </div>
        </template>
      </UPageHero>
    </div>

    <div class="container mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div>
        <h2 class="text-3xl font-bold text-center mb-12 text-t-headline">
          時下熱門電影
        </h2>
        <div v-if="popularMovies.length > 0">
          <Carousel :items="popularMovies" />
        </div>
        <div
          v-else
          class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          <div
            v-for="i in 6"
            :key="`sk-movie-${i}`"
            class="flex flex-col gap-2"
          >
            <USkeleton class="w-full aspect-2/3" />
            <USkeleton class="h-5 w-3/4" />
          </div>
        </div>
      </div>

      <!-- <div>
        <div class="container mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <h2 class="text-3xl font-bold text-center mb-12 text-t-headline">
            本日熱門趨勢
          </h2>

          <div v-if="trendingToday.length > 0">
            <Carousel :items="trendingToday" />
          </div>

          <div v-else class="text-center text-t-subheadline">
            載入熱門趨勢中...
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>
