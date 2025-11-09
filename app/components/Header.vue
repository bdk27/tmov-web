<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "電影",
    // to: "/docs/getting-started",
    // icon: "i-lucide-book-open",
    // active: route.path.startsWith("/docs/getting-started"),
  },
  {
    label: "電視節目",
    // to: "/docs/components",
    // icon: "i-lucide-box",
    // active: route.path.startsWith("/docs/components"),
  },
  {
    label: "戲院",
    // icon: "i-simple-icons-figma",
    // to: "https://go.nuxt.com/figma-ui",
    target: "_blank",
  },
  {
    label: "消息",
    // icon: "i-lucide-rocket",
    to: "https://github.com/nuxt/ui/releases",
    target: "_blank",
  },
]);
</script>

<template>
  <UHeader mode="slideover" toggleSide="right">
    <template #title>
      <Logo />
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
