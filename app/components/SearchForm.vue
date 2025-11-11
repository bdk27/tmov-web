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
    deep: true,
  }
);

function handleSubmit(reset = false) {
  if (reset) {
    localQuery.value = "";
    localType.value = "multi";
    localYear.value = null;
  }

  emit("submitSearch", {
    query: localQuery.value,
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
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 類型篩選 -->
      <USelect
        v-model="localType"
        :items="typeOptions"
        size="xl"
        class="w-full"
      />
      <!-- 年份篩選 -->
      <UInput
        v-model.number="localYear"
        type="number"
        placeholder="年份"
        :min="1800"
        :max="new Date().getFullYear() + 1"
        size="xl"
        class="w-full"
      />
    </div>
    <div class="flex flex-col md:flex-row gap-3">
      <!-- 關鍵字輸入 -->
      <UInput
        v-model="localQuery"
        class="w-full md:flex-1"
        placeholder="搜尋電影、電視、演員..."
        size="xl"
        icon="i-lucide-search"
        clearable
        @keyup.enter="handleSubmit(false)"
      />
      <!-- 按鈕區域 (UButton) -->
      <div class="flex justify-end gap-2 mt-3 md:mt-0">
        <UButton size="lg" variant="ghost" @click="handleSubmit(true)">
          清空
        </UButton>
        <UButton size="lg" @click="handleSubmit(false)">搜尋</UButton>
      </div>
    </div>
  </div>
</template>
