export function useFavorite(item: any) {
  const authStore = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  const isFavorite = ref(false);
  const isLoading = ref(false);

  onMounted(() => {
    checkFavoriteStatus();
  });

  // 監聽登入狀態變化
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

  function getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authStore.token}`,
    };
  }

  // 檢查狀態
  async function checkFavoriteStatus() {
    if (!authStore.isAuthenticated) {
      isFavorite.value = false;
      return;
    }

    try {
      const params = new URLSearchParams([
        ["tmdbId", String(item.id)],
        ["mediaType", computedMediaType.value],
      ]);

      const response = await fetch(
        `/api/favorites/check?${params.toString()}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        isFavorite.value = data.isFavorite;
      } else {
        isFavorite.value = false;
      }
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
      const requestBody = JSON.stringify({
        tmdbId: item.id,
        mediaType: computedMediaType.value,
      });

      const method = newState ? "POST" : "DELETE";

      const response = await fetch(`/api/favorites`, {
        method,
        headers: getAuthHeaders(),
        body: requestBody,
      });

      if (!response.ok) throw new Error("更新收藏狀態失敗");

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
