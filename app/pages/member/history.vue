<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        return navigateTo("/login");
      }
    },
  ],
});
</script>

<template>
  <div>會員觀看歷史頁面</div>
</template>
