<script setup lang="ts">
const props = defineProps<{
  query: string;
  type: TmdbSearchOptions["type"];
  year: number | null;
}>();

const emit = defineEmits<{
  (
    e: "submitSearch",
    filters: {
      query: string;
      type: TmdbSearchOptions["type"];
      year: number | null;
      reset: boolean;
    }
  ): void;
}>();

const localQuery = ref(props.query);
const localType = ref(props.type);
const localYear = ref(props.year);

watch(
  () => props,
  (newProps) => {
    localQuery.value = newProps.query;
    localType.value = newProps.type;
    localYear.value = newProps.year;
  },
  {
    immediate: true,
    deep: true, // 確保深度監聽
  }
);

function handleSubmit(reset = false) {
  if (reset) {
    // 如果是重設，先清空本地 ref
    localQuery.value = ""; // (重設時不清空關鍵字)
    localType.value = "multi";
    localYear.value = null;
  }

  // 將本地 ref 的值包裝起來，emit 給父組件
  emit("submitSearch", {
    query: localQuery.value, // 使用者在搜尋框輸入的值
    type: localType.value,
    year: localYear.value,
    reset: reset,
  });
}

const typeOptions = [
  { label: "全部", value: "multi" },
  { label: "電影", value: "movie" },
  { label: "電視", value: "tv" },
  { label: "人物", value: "person" },
];
</script>

<template>
  <div class="space-y-4">
    <!-- 輸入框格線區域 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 關鍵字輸入 (在桌面上佔 2 格) -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1 text-neutral-400"
          >關鍵字</label
        >
        <n-input
          v-model:value="localQuery"
          placeholder="搜尋電影、電視、演員..."
          size="large"
          clearable
          @keyup.enter="handleSubmit(false)"
        >
          <template #prepend>
            <n-icon name="search" />
          </template>
        </n-input>
      </div>

      <!-- 類型篩選 (在桌面上佔 1 格) -->
      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-400"
          >類型</label
        >
        <n-select
          v-model:value="localType"
          :options="typeOptions"
          size="large"
        />
      </div>

      <!-- 年份篩選 (在桌面上佔 1 格) -->
      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-400"
          >年份</label
        >
        <n-input-number
          v-model:value="localYear"
          placeholder="年份"
          :min="1800"
          :max="new Date().getFullYear() + 1"
          clearable
          size="large"
          class="w-full"
        />
      </div>
    </div>

    <!-- 按鈕區域 (靠右對齊) -->
    <div class="flex justify-end gap-2">
      <n-button size="large" @click="handleSubmit(true)"> 清空 </n-button>
      <n-button type="primary" size="large" @click="handleSubmit(false)">
        搜尋
      </n-button>
    </div>
  </div>
</template>
