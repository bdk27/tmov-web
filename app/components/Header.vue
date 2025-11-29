<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "首頁",
    to: "/",
    // icon: "i-lucide-home",
    // active: route.path.startsWith("/docs/getting-started"),
  },
  {
    label: "電影",
    to: "/movie",
    children: [
      {
        label: "熱門",
        to: "/movie",
        // icon: "i-lucide-download",
      },
      {
        label: "現正熱映",
        to: "/movie/now-playing",
        // icon: "i-lucide-download",
      },
      {
        label: "即將上映",
        // to: "/docs/installation",
        // icon: "i-lucide-download",
      },
      {
        label: "好評推薦",
        // to: "/docs/installation",
        // icon: "i-lucide-download",
      },
    ],
    // icon: "i-lucide-film",
    // active: route.path.startsWith("/docs/getting-started"),
  },
  {
    label: "電視節目",
    // icon: "i-lucide-tv",
    children: [
      {
        label: "所有",
        // to: "/docs/installation",
        // icon: "i-lucide-download",
      },
      {
        label: "動畫",
        // to: "/docs/installation",
        // icon: "i-lucide-download",
      },
      {
        label: "電視劇",
        // to: "/docs/upgrade-guide",
        // icon: "i-lucide-arrow-up-circle",
      },
      {
        label: "綜藝",
        // to: "/docs/upgrade-guide",
        // icon: "i-lucide-arrow-up-circle",
      },
    ],
    // to: "/docs/components",
    // icon: "i-lucide-box",
    // active: route.path.startsWith("/docs/components"),
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
