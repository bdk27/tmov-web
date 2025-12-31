<script setup lang="ts">
import type { TmdbItem } from "~/composables/useTmdb";

const props = defineProps<{
  title?: string; // 標題
  items: TmdbItem[]; // API 回傳的原始資料
  loading: boolean; // 是否載入中
  error: string | null; // 錯誤訊息
  totalResults: number; // 總筆數
  currentPage: number; // 目前頁碼
}>();

const currentPage = defineModel<number>("currentPage", { required: true });

// 排序邏輯
const sortBy = ref("relevance");
const sortOptions = [
  { label: "關聯性", value: "relevance" },
  { label: "日期 : 新 → 舊", value: "date-desc" },
  { label: "日期 : 舊 → 新", value: "date-asc" },
  { label: "人氣 : 高 → 低", value: "popularity-desc" },
  { label: "人氣 : 低 → 高", value: "popularity-asc" },
  { label: "評分 : 高 → 低", value: "rating-desc" },
  { label: "評分 : 低 → 高", value: "rating-asc" },
];
const sortedItems = computed(() => {
  const list = [...props.items];

  const getDate = (item: TmdbItem) => {
    const dateStr = item.release_date || item.first_air_date;
    return dateStr ? new Date(dateStr).getTime() : 0;
  };

  switch (sortBy.value) {
    case "date-desc":
      return list.sort((a, b) => getDate(b) - getDate(a));
    case "date-asc":
      return list.sort((a, b) => getDate(a) - getDate(b));
    case "popularity-desc":
      return list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    case "popularity-asc":
      return list.sort((a, b) => (a.popularity || 0) - (b.popularity || 0));
    case "rating-desc":
      return list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    case "rating-asc":
      return list.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
    case "relevance":
    default:
      return list;
  }
});

const emit = defineEmits<{
  (e: "retry"): void;
}>();
</script>

<template>
  <div class="w-full">
    <!-- 標題列 + 排序 -->
    <div
      v-if="!loading && !error"
      class="w-full mb-6 flex items-end justify-between gap-4"
    >
      <!-- 標題 / 資訊 -->
      <div class="text-neutral-400">
        <div
          v-if="title"
          class="text-xl font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-2"
        >
          <span class="w-1.5 h-6 bg-primary rounded-full block"></span>
          <slot name="title">
            {{ title }}
          </slot>
        </div>
        <div v-if="totalResults > 0">共找到 {{ totalResults }} 筆資料</div>
      </div>

      <!-- 右側：排序 -->
      <div>
        <USelect
          v-model="sortBy"
          :items="sortOptions"
          option-attribute="label"
          icon="i-heroicons-arrows-up-down"
          placeholder="排序方式"
        />
      </div>
    </div>

    <!-- 載入中 -->
    <div
      v-if="loading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <div v-for="i in 20" :key="`sk-${i}`" class="flex flex-col gap-2">
        <USkeleton class="w-full aspect-2/3 rounded-lg" />
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-3 w-1/2" />
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon
        name="i-heroicons-exclamation-circle"
        class="text-6xl text-red-500 mb-4"
      />
      <h2 class="text-2xl font-semibold mb-2">發生錯誤</h2>
      <p class="text-neutral-400 mb-6">{{ error }}</p>
      <UButton @click="emit('retry')">重試</UButton>
    </div>

    <!-- 資料列表 -->
    <div
      v-else-if="sortedItems.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <ItemCard v-for="item in sortedItems" :key="item.id" :item="item" />
    </div>

    <!-- 無結果 -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon
        name="i-heroicons-information-circle"
        class="text-6xl text-blue-500 mb-4"
      />
      <h2 class="text-2xl font-semibold mb-2">找不到結果</h2>
      <p class="text-neutral-400">沒有找到相關資料</p>
    </div>

    <!-- 分頁 -->
    <div v-if="totalResults > 20 && !error" class="flex justify-center mt-12">
      <UPagination
        v-model:page="currentPage"
        :itemsPerPage="20"
        :total="totalResults"
      />
    </div>
  </div>
</template>
