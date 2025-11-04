<script setup lang="ts"></script>

<template>
  <div>
    <!-- 導覽列/頁首 -->
    <header class="bg-white dark:bg-black top-0 z-10 backdrop-blur-sm">
      <div class="container mx-auto flex justify-between items-center p-2">
        <!-- Logo 或首頁連結 -->
        <NuxtLink to="/" class="flex items-center space-x-1">
          <img src="/logo-black.png" alt="TMDB Logo" class="w-10" />
          <!-- <span class="text-black text-2xl font-bold">TMDB</span> -->
        </NuxtLink>

        <!-- (您可以把 SearchForm 放在這裡) -->

        <!-- 1. 在這裡放置我們的 "主題切換按鈕" -->
        <ThemeToggle />
      </div>
    </header>

    <!-- 頁面內容將會被渲染在這裡 -->
    <main>
      <slot></slot>
    </main>
  </div>
</template>
