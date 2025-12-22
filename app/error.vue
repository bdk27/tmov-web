<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const statusCode = computed(() => props.error?.statusCode ?? 500);
// errorUtils
const friendlyMessage = computed(() => getErrorMessage(props.error));

const statusType = computed(() => {
  const code = statusCode.value;
  if (code === 404) return "404";
  if (code === 403) return "403";
  if (code >= 500) return "500";
  if (code === 418) return "418";

  return "error";
});

const handleClearError = () => {
  clearError({ redirect: "/" });
};

const iconName = computed(() => {
  switch (statusType.value) {
    case "404":
      return "i-heroicons-magnifying-glass-circle"; // 找不到
    case "403":
      return "i-heroicons-no-symbol"; // 禁止
    case "418":
      return "i-heroicons-beaker"; // Teapot
    case "500":
    case "error":
    default:
      return "i-heroicons-exclamation-triangle"; // 警告/錯誤
  }
});
</script>

<template>
  <div
    class="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-4"
  >
    <div class="text-center">
      <!-- 1. 圖示 -->
      <UIcon
        :name="iconName"
        class="text-8xl text-primary-500 dark:text-primary-400"
      />

      <!-- 2. 狀態碼 (標題) -->
      <h1 class="mt-4 text-5xl font-bold text-gray-900 dark:text-white">
        {{ statusCode }}
      </h1>

      <!-- 3. 錯誤訊息 (描述) -->
      <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
        {{ friendlyMessage }}
      </p>

      <!-- 4. 按鈕 (Footer) -->
      <UButton @click="handleClearError" size="lg" class="mt-8">
        返回首頁
      </UButton>
    </div>
  </div>
</template>
