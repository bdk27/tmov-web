export type Theme = "light" | "dark";

export const useTheme = () => {
  // 使用 useCookie 來獲取/設定持久化的主題
  // 預設主題為 'dark' (符合您目前的網站)
  const themeCookie = useCookie<Theme>("theme", {
    default: () => "dark",
    maxAge: 60 * 60 * 24 * 365, // 一年
  });

  const theme = ref<Theme>(themeCookie.value || "dark");

  useHead(() => ({
    htmlAttrs: {
      class: theme.value === "dark" ? "dark" : "",
    },
  }));

  watchEffect(() => {
    themeCookie.value = theme.value;
  });

  // 切換函式
  const toggleTheme = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
  };

  return {
    theme,
    toggleTheme,
  };
};
