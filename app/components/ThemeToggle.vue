<script setup lang="ts">
// 1. 導入 Nuxt UI 內建的 Composable
const colorMode = useColorMode();

// 2. 建立一個 computed 來判斷是否為 'dark'
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set(value: boolean) {
    // 3. 'preference' 會自動儲存到 cookie 並更新 <html> class
    colorMode.preference = value ? "dark" : "light";
  },
});
</script>

<template>
  <UButton
    :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
    variant="ghost"
    color="neutral"
    aria-label="Theme"
    @click="isDark = !isDark"
  />
</template>
