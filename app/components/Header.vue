<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "首頁",
    to: "/",
  },
  {
    label: "電影",
    to: "/movie",
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
    to: "/tv/drama",
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
    // to: "https://go.nuxt.com/figma-ui",
    target: "_blank",
  },
  {
    label: "消息",
    // icon: "i-lucide-newspaper",
    to: "https://github.com/nuxt/ui/releases",
    target: "_blank",
  },
]);
</script>

<template>
  <UHeader mode="slideover" toggleSide="left">
    <template #title>
      <Logo />
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />
      <UTooltip text="歷史紀錄">
        <UButton
          icon="i-heroicons-clock"
          to=""
          variant="ghost"
          color="neutral"
          aria-label="歷史紀錄"
        />
      </UTooltip>
      <UTooltip text="會員登入">
        <UButton
          icon="i-heroicons-user-circle"
          to="/login"
          variant="ghost"
          color="neutral"
          aria-label="會員登入"
        />
      </UTooltip>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
