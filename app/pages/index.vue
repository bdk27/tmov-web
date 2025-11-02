<script setup lang="ts">
const searchQuery = ref("");
const router = useRouter();

function handleSearch() {
  if (!searchQuery.value.trim()) {
    return;
  }

  router.push({
    path: "/search",
    query: {
      q: searchQuery.value,
    },
  });
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-xl" style="margin-top: 20vh">
    <h1 class="text-3xl font-bold text-center mb-6">TMDB 搜尋</h1>
    <!-- 搜尋欄 -->
    <div class="flex gap-2 mb-8">
      <n-input
        v-model:value="searchQuery"
        placeholder="搜尋電影、電視、演員..."
        size="large"
        clearable
        @keyup.enter="handleSearch"
      />
      <n-button type="primary" size="large" @click="handleSearch">
        搜尋
      </n-button>
    </div>
  </div>
</template>
