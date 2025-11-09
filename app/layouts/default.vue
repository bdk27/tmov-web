<script setup lang="ts"></script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header></Header>

    <!-- 頁面內容 -->
    <main class="flex flex-1">
      <slot></slot>
    </main>

    <Footer></Footer>
  </div>
</template>
