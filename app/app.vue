<script setup lang="ts">
const nuxtApp = useNuxtApp();
const isLoading = ref(false);

nuxtApp.hook("page:start", () => {
  isLoading.value = true;
});
nuxtApp.hook("page:finish", () => {
  setTimeout(() => {
    isLoading.value = false;
  }, 300);
});
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="rgb(var(--color-primary-500))" />
    <div
      v-if="isLoading"
      class="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm transition-all duration-300"
    >
      <div class="flex flex-col items-center gap-4">
        <!-- 旋轉圖示 -->
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-12 h-12 text-primary-500 animate-spin"
        />

        <!-- 文字提示 (可選) -->
        <p
          class="text-gray-500 dark:text-gray-400 font-medium animate-pulse tracking-widest"
        >
          載入中...
        </p>
      </div>
    </div>

    <!-- 頁面主要內容 -->
    <UApp>
      <UMain>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UMain>
    </UApp>
  </div>
</template>
