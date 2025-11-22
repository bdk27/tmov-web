<script setup lang="ts"></script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header></Header>

    <main class="flex-1">
      <slot></slot>
    </main>

    <Footer></Footer>
  </div>
</template>
