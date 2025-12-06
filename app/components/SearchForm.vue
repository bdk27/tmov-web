<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const { search, posterUrl, titleOf, dateOf } = useTmdb();

const isSearchOpen = defineModel<boolean>("isSearchOpen");

const query = ref("");
const type = ref<TmdbSearchOptions["type"]>("multi");
const year = ref<number | null>(null);
const isLoading = ref(false);
const suggestions = ref<TmdbItem[]>([]);
let searchTimer: NodeJS.Timeout | null = null;

const typeOptions = [
  { label: "全部", value: "multi" },
  { label: "電影", value: "movie" },
  { label: "電視", value: "tv" },
  { label: "人物", value: "person" },
];

onMounted(() => {
  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };
  window.addEventListener("keydown", handleEsc);

  // 清理
  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleEsc);
  });
});

// 關閉視窗
function closeModal() {
  isSearchOpen.value = false;
}

// 執行搜尋 (跳轉)
function handleSubmit(reset = false) {
  if (reset) {
    resetQuery();
  } else {
    if (!query.value.trim()) return;

    const newQuery: Record<string, any> = {
      q: query.value,
      page: 1,
      type: type.value,
    };

    if (year.value) {
      newQuery.year = year.value;
    }

    // 重置並跳轉
    resetQuery();
    router.push({ path: "/search", query: newQuery });
    closeModal();
  }
}

// 跳轉到單一項目
function navigateToItem(item: TmdbItem) {
  closeModal();

  let path = "";
  if (item.media_type === "person") path = `/person/${item.id}`;
  else if (item.media_type === "tv") path = `/tv/${item.id}`;
  else path = `/movie/${item.id}`;

  router.push(path);
}

function resetQuery() {
  query.value = "";
  type.value = "multi";
  year.value = null;
  suggestions.value = [];
}

// 取得類型標籤顏色
function getMediaTypeBadge(type?: string) {
  switch (type) {
    case "movie":
      return {
        label: "電影",
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
      };
    case "tv":
      return {
        label: "影集",
        color:
          "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
      };
    case "person":
      return {
        label: "人物",
        color:
          "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
      };
    default:
      return { label: "其他", color: "bg-gray-100 text-gray-700" };
  }
}

// 監聽輸入變化，自動搜尋建議
watch(query, (newVal) => {
  if (!newVal || newVal.trim().length === 0) {
    suggestions.value = [];
    return;
  }

  if (searchTimer) clearTimeout(searchTimer);

  isLoading.value = true;
  searchTimer = setTimeout(async () => {
    try {
      const res = await search(newVal, { page: 1, type: "multi" });
      suggestions.value = (res.results || []).slice(0, 6); // 取前 6 筆
    } catch (e) {
      suggestions.value = [];
    } finally {
      isLoading.value = false;
    }
  }, 300);
});
</script>

<template>
  <div
    v-if="isSearchOpen"
    class="fixed inset-0 z-999 flex items-start justify-center pt-[10vh] p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity"
    @click="closeModal"
  >
    <div
      class="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[80vh]"
      @click.stop
    >
      <div class="p-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/50">
        <div class="relative">
          <UInput
            v-model="query"
            class="w-full"
            placeholder="輸入電影、影集或演員名稱..."
            size="xl"
            :icon="
              isLoading
                ? 'i-heroicons-arrow-path'
                : 'i-heroicons-magnifying-glass'
            "
            :loading="isLoading"
            autofocus
            @keydown.enter="handleSubmit(false)"
            autocomplete="off"
          >
            <!-- Esc 提示或清除鈕 -->
            <template #trailing>
              <UButton
                v-if="query"
                color="neutral"
                variant="link"
                icon="i-heroicons-x-mark-20-solid"
                :padded="false"
                @click="query = ''"
              />
              <span v-else class="text-xs text-gray-400 mr-1">ESC 關閉</span>
            </template>
          </UInput>
        </div>

        <div class="flex gap-3">
          <USelect
            v-model="type"
            :items="typeOptions"
            option-attribute="label"
            size="sm"
            class="w-32"
          />
          <UInput
            v-model.number="year"
            type="number"
            placeholder="年份 (選填)"
            :min="1800"
            :max="new Date().getFullYear() + 1"
            size="sm"
            class="w-28"
          />
          <div class="flex-1 text-right">
            <UButton
              size="sm"
              variant="solid"
              color="primary"
              label="搜尋"
              @click="handleSubmit(false)"
            />
          </div>
        </div>
      </div>

      <div class="overflow-y-auto custom-scrollbar">
        <!-- 有結果時 -->
        <ul
          v-if="suggestions.length > 0"
          class="divide-y divide-gray-100 dark:divide-gray-800"
        >
          <li
            v-for="item in suggestions"
            :key="item.id"
            @click="navigateToItem(item)"
            class="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
          >
            <img
              :src="
                posterUrl(item.poster_path ?? item.profile_path ?? null, 'w92')
              "
              class="w-10 h-14 object-cover rounded bg-gray-200 dark:bg-gray-700 shadow-sm"
              alt="Poster"
            />

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4
                  class="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors"
                >
                  {{ titleOf(item) }}
                </h4>
                <!-- 類型標籤 -->
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  :class="getMediaTypeBadge(item.media_type).color"
                >
                  {{ getMediaTypeBadge(item.media_type).label }}
                </span>
              </div>
              <div
                class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2"
              >
                <span>{{ dateOf(item) }}</span>
                <span
                  v-if="item.vote_average"
                  class="text-yellow-500 flex items-center gap-0.5"
                >
                  <UIcon name="i-heroicons-star-20-solid" class="w-3 h-3" />
                  {{ item.vote_average.toFixed(1) }}
                </span>
              </div>
            </div>

            <UIcon
              name="i-heroicons-chevron-right"
              class="w-5 h-5 text-gray-300 group-hover:text-gray-500"
            />
          </li>
        </ul>

        <!-- 搜尋提示 (底部) -->
        <div
          v-if="query"
          class="p-3 text-center border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          @click="handleSubmit(false)"
        >
          <span
            class="text-sm text-primary-500 font-medium flex items-center justify-center gap-2"
          >
            <UIcon name="i-heroicons-magnifying-glass" />
            查看所有關於「{{ query }}」的結果
          </span>
        </div>

        <!-- 無結果狀態 -->
        <div
          v-if="query && !isLoading && suggestions.length === 0"
          class="p-8 text-center text-gray-500"
        >
          <UIcon
            name="i-heroicons-face-frown"
            class="text-4xl mb-2 opacity-50"
          />
          <p>找不到相關結果</p>
        </div>
      </div>
    </div>
  </div>
</template>
