<script setup lang="ts">
// [移除] import { useMessage } from "naive-ui";
// [新增] 引入 Nuxt UI 的 useToast
import { useToast } from "#imports";

const { search } = useTmdb();

// [修改] Naive UI 元件 -> Nuxt UI 元S件
const toast = useToast();

const route = useRoute();
const router = useRouter();

// --- 狀態 ref (保持不變) ---
const results = ref<TmdbItem[]>([]);
const isLoading = ref(false);
const apiError = ref<string | null>(null);

const currentPage = ref(1);
const totalPages = ref(0); // 雖然 UPagination 不需要，但我們先保留
const totalResults = ref(0);

const currentQuery = ref("");
const typeFilter = ref<TmdbSearchOptions["type"]>("multi");
const adultFilter = ref(false);
const yearFilter = ref<number | null>(null);

async function fetchData() {
  isLoading.value = true;
  apiError.value = null;

  try {
    const options: TmdbSearchOptions = {
      page: currentPage.value,
      type: typeFilter.value,
      includeAdult: adultFilter.value,
    };
    if (yearFilter.value) {
      options.year = yearFilter.value;
    }

    const res = await search(currentQuery.value, options);

    results.value = res.results;
    totalPages.value = res.total_pages; // 保留
    totalResults.value = res.total_results;
  } catch (error: any) {
    const friendlyMessage = getErrorMessage(error);
    apiError.value = friendlyMessage;

    // [修改] message.error -> toast.add
    toast.add({
      title: "搜尋失敗",
      description: friendlyMessage,
      color: "warning",
      icon: "i-heroicons-exclamation-circle",
    });

    results.value = [];
    totalPages.value = 0;
    totalResults.value = 0;
  } finally {
    isLoading.value = false;
  }
}

// --- triggerSearch 邏輯 (保持不變) ---
function triggerSearch(resetFilters = false) {
  if (resetFilters) {
    typeFilter.value = "multi";
    adultFilter.value = false;
    yearFilter.value = null;
  }

  const query: Record<string, any> = {
    q: currentQuery.value,
    page: 1,
    type: typeFilter.value,
  };

  if (adultFilter.value) {
    query.adult = "true";
  }
  if (yearFilter.value) {
    query.year = yearFilter.value;
  }

  router.push({ query });
}

// --- handlePageChange 邏輯 (保持不變) ---
function handlePageChange(page: number) {
  const newQuery = { ...route.query, page: page };
  router.push({ query: newQuery });
  window.scrollTo(0, 0);
}

// --- watch 邏輯 (保持不變) ---
watch(
  () => route.query,
  (newQuery) => {
    currentQuery.value = (newQuery.q as string) || "";
    currentPage.value = parseInt(newQuery.page as string) || 1;
    typeFilter.value = (newQuery.type as TmdbSearchOptions["type"]) || "multi";
    adultFilter.value = newQuery.adult === "true";
    yearFilter.value = newQuery.year ? parseInt(newQuery.year as string) : null;

    if (currentQuery.value.trim()) {
      fetchData();
    } else {
      results.value = [];
      totalPages.value = 0;
      totalResults.value = 0;
      apiError.value = null;
    }
  },
  { immediate: true, deep: true }
);

const typeOptions = [
  { label: "綜合", value: "multi" },
  { label: "電影", value: "movie" },
  { label: "電視", value: "tv" },
  { label: "人物", value: "person" },
];

// [新增] 為了 Nuxt UI 的 <UAccordion>
const accordionItems = [
  {
    label: "進階篩選",
    slot: "advanced-filters",
    defaultOpen: false,
  },
];
</script>

<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <!-- 標題和總結果 (保持不變) -->
    <div v-if="!isLoading && !apiError" class="mb-6 text-neutral-400 text-sm">
      <div class="text-xl font-bold text-white mb-2">
        搜尋「<span class="text-primary">{{ currentQuery }}</span
        >」的結果
      </div>
      <div v-if="totalResults > 0">共找到 {{ totalResults }} 筆資料</div>
    </div>

    <!-- [修改] 進階篩選 n-collapse -> UAccordion -->
    <UAccordion :items="accordionItems" class="mb-6">
      <template #advanced-filters>
        <div class="space-y-4 pt-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">類型</label>
              <!-- [修改] n-select -> USelect -->
              <USelect
                v-model="typeFilter"
                :options="typeOptions"
                option-attribute="label"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">年份</label>
              <!-- [修改] n-input-number -> UInput type="number" -->
              <UInput
                v-model.number="yearFilter"
                type="number"
                placeholder="例如：2023"
                :min="1800"
                :max="new Date().getFullYear() + 1"
              />
            </div>
            <div class="pt-6">
              <!-- [修改] n-switch -> UToggle -->
              <UToggle v-model="adultFilter" />
              <label class="ml-2 text-sm font-medium">包含成人內容</label>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <!-- [修改] n-button -> UButton -->
            <UButton variant="outline" @click="triggerSearch(true)"
              >重設</UButton
            >
            <UButton @click="triggerSearch(false)">套用篩選</UButton>
          </div>
        </div>
      </template>
    </UAccordion>

    <!-- [修改] 載入中 n-spin -> UIcon -->
    <div v-if="isLoading" class="text-center py-20">
      <UIcon
        name="i-heroicons-arrow-path-20-solid"
        class="animate-spin text-4xl text-primary"
      />
    </div>

    <!-- [修改] 錯誤訊息 n-result -> 自訂區塊 -->
    <div
      v-else-if="apiError"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon
        name="i-heroicons-exclamation-circle"
        class="text-6xl text-red-500 mb-4"
      />
      <h2 class="text-2xl font-semibold mb-2">搜尋失敗</h2>
      <p class="text-neutral-400 mb-6">{{ apiError }}</p>
      <UButton @click="fetchData">重試</UButton>
    </div>

    <!-- 搜尋結果 (保持不變) -->
    <div
      v-else-if="results.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
    >
      <ItemCard v-for="item in results" :key="item.id" :item="item" />
    </div>

    <!-- [修改] 無結果 n-result -> 自訂區塊 -->
    <div
      v-else-if="currentQuery && !isLoading"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon
        name="i-heroicons-information-circle"
        class="text-6xl text-blue-500 mb-4"
      />
      <h2 class="text-2xl font-semibold mb-2">找不到結果</h2>
      <p class="text-neutral-400">找不到符合「{{ currentQuery }}」的項目。</p>
    </div>

    <!-- [修改] 分頁 n-pagination -> UPagination -->
    <div
      v-if="totalResults > 20 && !isLoading && !apiError"
      class="flex justify-center mt-12"
    >
      <UPagination
        :model-value="currentPage"
        :page-count="20"
        :total="totalResults"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>
