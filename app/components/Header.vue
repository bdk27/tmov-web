<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const authStore = useAuthStore();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "首頁",
    to: "/",
  },
  {
    label: "電影",
    children: [
      {
        label: "熱門",
        to: "/movie",
      },
      {
        label: "現正熱映",
        to: "/movie/now-playing",
      },
      {
        label: "即將上映",
        to: "/movie/upcoming",
      },
      {
        label: "好評推薦",
        to: "/movie/top-rated",
      },
    ],
  },
  {
    label: "電視節目",
    children: [
      {
        label: "電視劇",
        to: "/tv/drama",
      },
      {
        label: "動畫",
        to: "/tv/anime",
      },
      {
        label: "綜藝",
        to: "/tv/variety",
      },
      {
        label: "紀錄片",
        to: "/tv/documentary",
      },
      {
        label: "兒童",
        to: "/tv/children",
      },
      {
        label: "脫口秀",
        to: "/tv/talk-show",
      },
    ],
  },
  {
    label: "人物",
    to: "/person",
  },
  {
    label: "戲院",
    // icon: "i-lucide-ticket",
    // to: "/theaters",
  },
  // {
  //   label: "消息",
  //   // icon: "i-lucide-newspaper",
  //   to: "https://github.com/nuxt/ui/releases",
  //   target: "_blank",
  // },
]);

// 搜尋
const isSearchOpen = ref(false);
</script>

<template>
  <UHeader mode="slideover" toggleSide="left" :blur="true">
    <template #title>
      <Logo />
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UButton
        icon="i-heroicons-magnifying-glass"
        variant="ghost"
        color="neutral"
        aria-label="搜尋"
        @click="isSearchOpen = true"
      />

      <UColorModeButton />

      <UTooltip text="會員登入" v-if="!authStore.isAuthenticated">
        <UButton
          icon="i-heroicons-user-circle"
          to="/login"
          variant="ghost"
          color="neutral"
          aria-label="會員登入"
        />
      </UTooltip>

      <UTooltip text="會員專區" v-else>
        <UButton
          :avatar="{
            src: authStore.user?.pictureUrl,
          }"
          to="/user"
          variant="ghost"
          color="info"
          aria-label="會員專區"
        />
      </UTooltip>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>

  <SearchForm v-model:isSearchOpen="isSearchOpen" />
</template>
