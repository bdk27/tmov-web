import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiBase: "",
      googleClientId: process.env.GOOGLE_CLIENT_ID || "",
      tmdbImageBase: "https://image.tmdb.org/t/p",
      tmdbPosterSize: "w342",
      tmdbBackdropSize: "w780",
      defaultLanguage: "zh-TW",
      defaultRegion: "TW",
    },
  },
  routeRules: {
    // 認證相關
    "/api/auth/**": {
      proxy: `${process.env.API_BASE}/api/auth/**`,
    },
    // TMDB 資料相關
    "/api/tmdb/**": {
      proxy: `${process.env.API_BASE}/api/tmdb/**`,
    },
    // 收藏相關
    "/api/favorites/**": {
      proxy: `${process.env.API_BASE}/api/favorites/**`,
    },
    // 歷史紀錄相關
    "/api/history/**": {
      proxy: `${process.env.API_BASE}/api/history/**`,
    },
    // 上傳相關
    "/api/upload": {
      proxy: `${process.env.API_BASE}/api/upload`,
    },
  },
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore"],
      },
    ],
    "@nuxt/ui",
  ],
  fonts: {
    families: [
      { name: "Momo Trust Display", provider: "google", weights: [400] },
      { name: "Noto Sans TC", provider: "google", weights: [400, 700] },
    ],
  },
});
