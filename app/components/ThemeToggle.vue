<script setup lang="ts">
const { theme, toggleTheme } = useTheme();
</script>

<template>
  <n-button @click="toggleTheme" quaternary>
    <template #icon>
      <n-icon v-if="theme === 'dark'"> ☀️ </n-icon>
      <n-icon v-else> 🌙 </n-icon>
    </template>
  </n-button>
</template>
