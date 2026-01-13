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

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - TMOV.` : "TMOV.";
  },
  title: "",
  meta: [
    {
      name: "description",
      content:
        "TMOV. - 您的下一部電影從這裡開始。提供最完整的電影、影集資訊與訂票服務。",
    },
    { property: "og:site_name", content: "TMOV." },
    { property: "og:type", content: "website" },
  ],
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.ico" }],
});
</script>

<template>
  <div>
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

        <!-- 文字提示 -->
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
