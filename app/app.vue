<script setup lang="ts">
const store = useTestStore();

await store.test();
</script>

<template>
  <h1 class="text-3xl font-bold underline">Hello world!</h1>
</template>
