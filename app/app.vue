<script setup lang="ts">
import { lightTheme, darkTheme, type GlobalThemeOverrides } from "naive-ui";

const { theme } = useTheme();

const naiveTheme = computed(() =>
  theme.value === "light" ? lightTheme : darkTheme
);

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#a855f7",
    primaryColorHover: "#c084fc",
    primaryColorPressed: "#9333ea",
  },
};
</script>

<template>
  <NConfigProvider>
    <NLoadingBarProvider>
      <NNotificationProvider>
        <NMessageProvider>
          <NDialogProvider>
            <NuxtLayout>
              <NuxtPage />
            </NuxtLayout>
          </NDialogProvider>
        </NMessageProvider>
      </NNotificationProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>
