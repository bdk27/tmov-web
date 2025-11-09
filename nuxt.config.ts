import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || "http://localhost:8080",
      tmdbImageBase: "https://image.tmdb.org/t/p",
      tmdbPosterSize: "w342",
      tmdbBackdropSize: "w780",
      defaultLanguage: "zh-TW",
      defaultRegion: "TW",
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
