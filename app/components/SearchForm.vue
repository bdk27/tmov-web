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
      <!-- 關鍵字輸入 (UInput) -->
      <UFormGroup label="關鍵字" class="md:col-span-2">
        <UInput
          v-model="localQuery"
          class="w-full"
          placeholder="搜尋電影、電視、演員..."
          size="xl"
          icon="i-heroicons-magnifying-glass-20-solid"
          clearable
          @keyup.enter="handleSubmit(false)"
        />
      </UFormGroup>

      <!-- 類型篩選 (USelect) -->
      <UFormGroup label="類型">
        <USelect
          v-model="localType"
          :items="typeOptions"
          size="xl"
          class="w-full"
        />
      </UFormGroup>

      <!-- 年份篩選 (UInput type=number) -->
      <UFormGroup label="年份">
        <UInput
          v-model.number="localYear"
          type="number"
          placeholder="年份"
          :min="1800"
          :max="new Date().getFullYear() + 1"
          size="xl"
          class="w-full"
        />
      </UFormGroup>
    </div>

    <!-- 按鈕區域 (UButton) -->
    <div class="flex justify-end gap-2">
      <UButton size="lg" variant="ghost" @click="handleSubmit(true)">
        清空
      </UButton>
      <UButton size="lg" @click="handleSubmit(false)"> 搜尋 </UButton>
    </div>
  </div>
</template>
