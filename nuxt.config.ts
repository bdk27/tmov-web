import tailwindcss from "@tailwindcss/vite";

import AutoImport from "unplugin-auto-import/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
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
    plugins: [
      tailwindcss(),
      AutoImport({
        imports: [
          {
            "naive-ui": [
              "useDialog",
              "useMessage",
              "useNotification",
              "useLoadingBar",
            ],
          },
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
    ],
  },
  modules: [
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore"],
      },
    ],
    "nuxtjs-naive-ui",
  ],
  build: { transpile: ["naive-ui", "vueuc"] },
});
