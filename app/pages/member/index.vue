<script setup lang="ts">
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const isLoading = computed(() => !authStore.user);

// 如果有 Token 但沒有 User 資料 (例如重新整理)，嘗試抓取
onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchUser();
  }
});

// 登出邏輯
function handleLogout() {
  authStore.logout();
  toast.add({
    title: "已登出",
    description: "您已成功登出系統",
    color: "neutral",
  });
  router.push("/");
}

const createdTime = computed(() => {
  if (!authStore.user?.createdAt) return "載入中...";
  const date = new Date(authStore.user.createdAt);
  return date.toLocaleDateString();
});
</script>

<template>
  <div
    class="min-h-[calc(100vh-64px)] bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8"
  >
    <!-- 背景 -->
    <div class="absolute inset-0 h-[40vh] w-full overflow-hidden">
      <div
        class="w-full h-full bg-linear-to-br from-gray-700 via-gray-800 to-black"
      ></div>
      <div
        class="absolute inset-0 bg-linear-to-t from-white to-white/50 dark:from-gray-950 dark:to-gray-950/50 z-10"
      ></div>
    </div>

    <!-- 內容 -->
    <div class="relative z-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto space-y-8">
        <!-- 1. 歡迎標題 -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            會員專區
          </h1>
          <p class="mt-4 text-lg text-gray-500 dark:text-gray-400">
            管理您的個人資料與帳號設定
          </p>
        </div>

        <!-- 2. 會員資料卡片 -->
        <UCard
          class="overflow-hidden shadow-xl ring-1 ring-gray-200 dark:ring-gray-800"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3
                class="text-lg font-bold leading-6 text-gray-900 dark:text-white"
              >
                基本資料
              </h3>
              <USkeleton v-if="isLoading" class="h-6 w-20 rounded-full" />
              <UBadge v-else color="primary" variant="subtle">正式會員</UBadge>
            </div>
          </template>

          <div class="flex flex-col sm:flex-row items-center gap-8 py-4">
            <!-- 頭像 -->
            <div class="relative">
              <!-- 載入中 -->
              <USkeleton
                v-if="isLoading"
                class="h-24 w-24 rounded-full"
                :ui="{ rounded: 'rounded-full' }"
              />

              <!-- 資料已載入 -->
              <div
                v-else
                class="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-4xl font-bold shadow-inner overflow-hidden"
              >
                <img
                  v-if="authStore.user?.pictureUrl"
                  :src="authStore.user.pictureUrl"
                  alt="User"
                  class="h-full w-full object-cover"
                />
                <!-- 如果沒有圖片網址，顯示替代文字 -->
                <span v-else>{{
                  authStore.user?.displayName?.charAt(0) || "U"
                }}</span>
              </div>

              <!-- 線上狀態指示燈 -->
              <div
                v-if="!isLoading"
                class="absolute bottom-0 right-0 h-6 w-6 bg-primary border-4 border-white dark:border-gray-900 rounded-full"
                title="線上"
              ></div>
            </div>

            <!-- 文字資訊 -->
            <div
              class="flex-1 text-center sm:text-left space-y-4 w-full sm:w-auto"
            >
              <!-- 使用者名稱 -->
              <div>
                <p
                  class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  使用者名稱
                </p>
                <!-- Skeleton / Real Text -->
                <USkeleton v-if="isLoading" class="h-8 w-48 mx-auto sm:mx-0" />
                <p
                  v-else
                  class="text-xl font-bold text-gray-900 dark:text-white"
                >
                  {{ authStore.user?.displayName }}
                </p>
              </div>

              <!-- 電子信箱 -->
              <div>
                <p
                  class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  電子信箱
                </p>
                <!-- Skeleton / Real Text -->
                <USkeleton v-if="isLoading" class="h-6 w-64 mx-auto sm:mx-0" />
                <p
                  v-else
                  class="text-base text-gray-900 dark:text-white font-mono"
                >
                  {{ authStore.user?.email }}
                </p>
              </div>

              <!-- 角色權限 -->
              <div class="pt-2 h-6">
                <!-- 固定高度防止跳動 -->
                <USkeleton
                  v-if="isLoading"
                  class="h-5 w-24 rounded-full mx-auto sm:mx-0"
                />
                <div v-else-if="authStore.user?.role">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <UIcon
                      name="i-heroicons-shield-check"
                      class="w-4 h-4 mr-1"
                    />
                    {{ authStore.user.role }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between items-center">
              <p class="text-xs text-gray-400">加入時間：{{ createdTime }}</p>
              <div class="flex gap-3">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-cog-6-tooth"
                  ><span class="hidden md:block">編輯</span></UButton
                >
                <UButton
                  color="error"
                  variant="soft"
                  icon="i-heroicons-arrow-right-on-rectangle"
                  @click="handleLogout"
                >
                  <span class="hidden md:block">登出</span>
                </UButton>
              </div>
            </div>
          </template>
        </UCard>

        <!-- 3. 功能區塊 (預留) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UCard
            @click="$router.push('/member/favorites')"
            class="hover:border-primary-500/50 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-4">
              <div
                class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500"
              >
                <UIcon name="i-heroicons-heart" class="w-6 h-6" />
              </div>
              <div>
                <h4
                  class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500"
                >
                  我的收藏
                </h4>
                <p class="text-sm text-gray-500">查看您收藏的電影與影集</p>
              </div>
            </div>
          </UCard>

          <UCard
            @click="$router.push('/member/history')"
            class="hover:border-primary-500/50 transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-4">
              <div
                class="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-500"
              >
                <UIcon name="i-heroicons-clock" class="w-6 h-6" />
              </div>
              <div>
                <h4
                  class="font-bold text-gray-900 dark:text-white group-hover:text-primary-500"
                >
                  觀看紀錄
                </h4>
                <p class="text-sm text-gray-500">瀏覽您最近看過的內容</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
