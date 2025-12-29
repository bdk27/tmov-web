export function useHistory() {
  const authStore = useAuthStore();
  const config = useRuntimeConfig().public;
  const api = config.apiBase;

  // 加入歷史紀錄
  async function addToHistory(item: any) {
    if (!authStore.isAuthenticated || !authStore.user) {
      return;
    }

    let mediaType = item.media_type;
    if (!mediaType) {
      if (item.first_air_date || item.name) mediaType = "tv";
      else mediaType = "movie";
    }

    try {
      await fetch(`${api}/api/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType: mediaType,
        }),
      });
    } catch (error) {
      console.error("加入歷史紀錄失敗", error);
    }
  }

  return {
    addToHistory,
  };
}
