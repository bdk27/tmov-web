<script setup lang="ts">
import type {
  NavigationMenuItem,
  CommandPaletteGroup,
  CommandPaletteItem,
} from "@nuxt/ui";

const router = useRouter();
const { search, posterUrl, titleOf, dateOf } = useTmdb();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "首頁",
    to: "/",
  },
  {
    label: "電影",
    to: "/movie",
    children: [
      {
        label: "熱門",
        to: "/movie",
      },
      {
        label: "現正熱映",
        to: "/movie/now-playing",
      },
      {
        label: "即將上映",
        to: "/movie/upcoming",
      },
      {
        label: "好評推薦",
        to: "/movie/top-rated",
      },
    ],
  },
  {
    label: "電視節目",
    to: "/tv/drama",
    children: [
      {
        label: "電視劇",
        to: "/tv/drama",
      },
      {
        label: "動畫",
        to: "/tv/anime",
      },
      {
        label: "綜藝",
        to: "/tv/variety",
      },
      {
        label: "紀錄片",
        to: "/tv/documentary",
      },
      {
        label: "兒童",
        to: "/tv/children",
      },
      {
        label: "脫口秀",
        to: "/tv/talk-show",
      },
    ],
  },
  {
    label: "人物",
    to: "/person",
  },
  {
    label: "戲院",
    // icon: "i-lucide-ticket",
    // to: "https://go.nuxt.com/figma-ui",
    target: "_blank",
  },
  {
    label: "消息",
    // icon: "i-lucide-newspaper",
    to: "https://github.com/nuxt/ui/releases",
    target: "_blank",
  },
]);

// 搜尋
const isSearchOpen = ref(false);
const searchTerm = ref("");
const isLoading = ref(false);
const suggestions = ref<TmdbItem[]>([]);
let searchTimer: NodeJS.Timeout | null = null;

watch(searchTerm, (newVal) => {
  console.log("newVal", newVal);

  if (!newVal || newVal.trim().length === 0) {
    suggestions.value = [];
    return;
  }

  // 清除舊的計時器
  if (searchTimer) clearTimeout(searchTimer);

  // 設定新的計時器 (300ms 後執行)
  isLoading.value = true;
  searchTimer = setTimeout(async () => {
    try {
      const res = await search(newVal, { page: 1, type: "multi" });
      suggestions.value = (res.results || []).slice(0, 10);
    } catch (e) {
      suggestions.value = [];
    } finally {
      isLoading.value = false;
    }
  }, 300);
});

const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => {
  const groupList = [];
  const mediaTypeLabel = (type?: string) =>
    type === "movie"
      ? "電影"
      : type === "tv"
      ? "電視劇"
      : type === "person"
      ? "人物"
      : "其他";

  if (suggestions.value.length > 0) {
    groupList.push({
      id: "results",
      label: "建議結果",
      items: suggestions.value.map((item) => ({
        id: item.id,
        // 標題
        label: titleOf(item),
        // 後綴 (顯示類型或年份)
        suffix: `${mediaTypeLabel(item.media_type)} / ${dateOf(item)}`,
        // 縮圖
        avatar: {
          src: posterUrl(item.poster_path || item.profile_path || null, "w92"),
          loading: "lazy",
          size: "2xs" as const,
        },
        click: () => navigateToItem(item),
      })),
    });
  }
  // 完整搜尋選項
  if (searchTerm.value) {
    groupList.push({
      id: "search",
      items: [
        {
          id: "search-action",
          label: `搜尋所有關於 "${searchTerm.value}" 的結果...`,
          click: () => handleFullSearch(),
        },
      ],
    });
  }

  return groupList;
});

function navigateToItem(item: TmdbItem) {
  isSearchOpen.value = false;

  let path = "";
  if (item.media_type === "person") path = `/search/person/${item.id}`;
  else if (item.media_type === "tv") path = `/search/tv/${item.id}`;
  else path = `/search/movie/${item.id}`;

  router.push(path);
}

// 跳轉到完整搜尋頁面
function handleFullSearch() {
  isSearchOpen.value = false;
  router.push({
    path: "/search",
    query: { q: searchTerm.value, type: "multi" },
  });
}
</script>

<template>
  <UHeader mode="slideover" toggleSide="left">
    <template #title>
      <Logo />
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UTooltip text="搜尋">
        <UModal title="">
          <UButton
            icon="i-heroicons-magnifying-glass"
            variant="ghost"
            color="neutral"
            aria-label="搜尋"
            @click="isSearchOpen = !isSearchOpen"
          />

          <template #content>
            <UCommandPalette
              v-model:searchTerm="searchTerm"
              :loading="isLoading"
              :groups="groups"
              placeholder="輸入電影、影集或演員名稱..."
              class="h-96"
            >
              <template #empty>
                <div
                  class="flex flex-col items-center justify-center py-6 gap-3"
                >
                  <UIcon
                    name="i-heroicons-magnifying-glass"
                    class="w-10 h-10 text-gray-400"
                  />
                  <p class="text-sm text-gray-500">
                    {{
                      searchTerm
                        ? `找不到關於 "${searchTerm}" 的結果`
                        : "請輸入關鍵字開始搜尋..."
                    }}
                  </p>
                </div>
              </template>
            </UCommandPalette>
          </template>
        </UModal>
      </UTooltip>

      <UColorModeButton />

      <UTooltip text="會員登入">
        <UButton
          icon="i-heroicons-user-circle"
          to="/login"
          variant="ghost"
          color="neutral"
          aria-label="會員登入"
        />
      </UTooltip>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
