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
  <div>會員收藏頁面</div>
</template>
