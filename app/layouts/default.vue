<script setup lang="ts"></script>

<template>
  <div>
    <header
      class="border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 bg-white/75 dark:bg-gray-900/75 backdrop-blur-sm"
    >
      <div
        class="container mx-auto px-4 flex justify-between items-center max-w-6xl h-16"
      >
        <!-- Logo 或首頁連結 -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/logo-black.png" alt="TMDB Logo" class="h-8 w-auto" />
          <span class="text-xl font-bold text-primary-500">TMDB</span>
        </NuxtLink>

        <!-- 主題切換按鈕 -->
        <ThemeToggle />
      </div>
    </header>

    <!-- 頁面內容 -->
    <main class="container mx-auto px-4 max-w-6xl my-8">
      <slot />
    </main>
  </div>
</template>
