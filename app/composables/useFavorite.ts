export function useFavorite(item: any) {
  const authStore = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  const isFavorite = ref(false);
  const isLoading = ref(false);

  onMounted(() => {
    checkFavoriteStatus();
  });

  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) checkFavoriteStatus();
      else isFavorite.value = false;
    }
  );

  // 統一判斷 Media Type 邏輯
  const computedMediaType = computed(() => {
    if (item?.media_type) return item.media_type;

    if (
      item?.gender !== undefined ||
      item?.known_for_department ||
      item?.birthday ||
      item?.deathday
    ) {
      return "person";
    }

    if (item?.first_air_date || item?.name) return "tv";

    return "movie";
  });

  // 檢查狀態
  async function checkFavoriteStatus() {
    if (!authStore.isAuthenticated) {
      isFavorite.value = false;
      return;
    }

    if (!item?.id) return;

    try {
      const data = await $fetch<{ isFavorite: boolean }>(
        "/api/favorites/check",
        {
          headers: getAuthHeaders(),
          params: {
            tmdbId: item.id,
            mediaType: computedMediaType.value,
          },
        }
      );

      isFavorite.value = data.isFavorite;
    } catch (error) {
      console.error("檢查收藏狀態失敗:", error);
      isFavorite.value = false;
    }
  }

  // 處理點擊
  async function handleFavorite() {
    if (!authStore.isAuthenticated) {
      toast.add({
        title: "請先登入",
        description: "登入後即可建立專屬片單",
        icon: "i-heroicons-user-circle",
        color: "primary",
        actions: [
          {
            label: "前往登入",
            onClick: () => {
              router.push("/login");
            },
          },
        ],
      });
      return;
    }

    if (isLoading.value) return;

    const previousState = isFavorite.value;
    const newState = !previousState;

    isFavorite.value = newState;
    isLoading.value = true;

    try {
      const method = newState ? "POST" : "DELETE";

      await $fetch("/api/favorites", {
        method,
        headers: getAuthHeaders(),
        body: {
          tmdbId: item.id,
          mediaType: computedMediaType.value,
        },
      });

      toast.add({
        title: newState ? "已加入收藏" : "已從收藏移除",
        icon: newState ? "i-heroicons-heart-solid" : "i-heroicons-heart",
        color: "success",
      });
    } catch (error) {
      isFavorite.value = previousState;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isFavorite,
    isLoading,
    handleFavorite,
    checkFavoriteStatus,
  };
}
