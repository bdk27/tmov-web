<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const statusCode = computed(() => props.error.statusCode || 500);
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
</script>

<template>
  <NConfigProvider
    theme-name="dark"
    class="h-screen"
    :theme-overrides="{
      common: { bodyColor: '#18181b', textColorBase: '#fff' },
    }"
  >
    <div class="flex items-center justify-center min-h-full p-4">
      <n-result
        :status="statusType"
        :title="String(statusCode)"
        :description="friendlyMessage"
      >
        <template #footer>
          <n-button type="primary" @click="handleClearError">
            返回首頁
          </n-button>
        </template>
      </n-result>
    </div>
  </NConfigProvider>
</template>
