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
</script>

<template>
  <div class="min-h-full py-12 md:px-4 px-6 lg:px-8">
    <!-- 內容 -->
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto space-y-8">
        <UCard
          class="overflow-hidden shadow-md ring-1 ring-gray-200 dark:ring-gray-800"
        >
          <template #header>
            <div class="flex items-center justify-between px-4 py-3">
              <h3
                class="text-lg font-bold leading-6 text-gray-900 dark:text-white"
              >
                基本資料
              </h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-cog-6-tooth"
                to="/user/setting?tab=profile"
                >編輯資料</UButton
              >
            </div>
          </template>

          <div
            class="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start justify-center px-6 py-4"
          >
            <!-- 1. 左側：頭像與身分標籤 (固定寬度，居中對齊) -->
            <div
              class="w-full md:w-48 flex flex-col items-center gap-4 shrink-0"
            >
              <div class="relative">
                <!-- 載入中 -->
                <USkeleton
                  v-if="isLoading"
                  class="h-32 w-32 rounded-full"
                  :ui="{ rounded: 'rounded-full' }"
                />

                <!-- 頭像顯示 -->
                <UAvatar
                  v-else
                  :src="authStore.user?.pictureUrl || undefined"
                  :alt="authStore.user?.displayName || 'User'"
                  class="ring-4 ring-white dark:ring-gray-800 shadow-xl h-28 w-28 text-4xl rounded-full"
                />

                <!-- 性別圖示 -->
                <div
                  v-if="!isLoading && authStore.user?.gender"
                  class="absolute bottom-1 right-1 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md border border-gray-100 dark:border-gray-700"
                >
                  <svg
                    v-if="authStore.user?.gender === 'Male'"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    class="w-5 h-5 fill-current text-blue-500"
                  >
                    <path
                      d="M320 32c0-17.7 14.3-32 32-32L480 0c17.7 0 32 14.3 32 32l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-50.7-95 95c19.5 28.4 31 62.7 31 99.8 0 97.2-78.8 176-176 176S32 401.2 32 304 110.8 128 208 128c37 0 71.4 11.4 99.8 31l95-95-50.7 0c-17.7 0-32-14.3-32-32zM208 416a112 112 0 1 0 0-224 112 112 0 1 0 0 224z"
                    />
                  </svg>
                  <svg
                    v-else-if="authStore.user?.gender === 'Female'"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    class="w-5 h-5 fill-current text-pink-500"
                  >
                    <path
                      d="M80 176a112 112 0 1 1 224 0 112 112 0 1 1 -224 0zM223.9 349.1C305.9 334.1 368 262.3 368 176 368 78.8 289.2 0 192 0S16 78.8 16 176c0 86.3 62.1 158.1 144.1 173.1-.1 1-.1 1.9-.1 2.9l0 64-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-64c0-1 0-1.9-.1-2.9z"
                    />
                  </svg>
                </div>
              </div>

              <!-- 角色標籤 -->
              <div v-if="!isLoading" class="flex flex-col items-center">
                <UBadge
                  color="primary"
                  variant="subtle"
                  class="px-3 py-1 text-sm font-medium"
                >
                  {{
                    authStore.user?.role === "ROLE_ADMIN"
                      ? "管理員"
                      : "一般會員"
                  }}
                </UBadge>
              </div>
            </div>

            <div class="flex-1 w-full min-w-0">
              <!-- 標題區：姓名 -->
              <div class="mb-6 text-center md:text-left">
                <USkeleton
                  v-if="isLoading"
                  class="h-8 w-48 mb-2 mx-auto md:mx-0"
                />
                <h2
                  v-else
                  class="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {{ authStore.user?.displayName || "未設定暱稱" }}
                </h2>
                <p class="text-sm text-gray-500 mt-1">
                  加入時間：{{
                    isLoading
                      ? "..."
                      : formatDate(authStore.user?.createdAt || "")
                  }}
                </p>
              </div>

              <!-- 資訊網格：使用 grid 兩欄排列，提升可讀性 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Email -->
                <div class="group flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-envelope"
                    class="w-5 h-5 text-gray-500"
                  />

                  <div class="flex-1 min-w-0">
                    <p
                      class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5"
                    >
                      電子信箱
                    </p>
                    <USkeleton v-if="isLoading" class="h-5 w-32" />
                    <p
                      v-else
                      class="text-gray-900 dark:text-white font-medium truncate"
                    >
                      {{ authStore.user?.email || "-" }}
                    </p>
                  </div>
                </div>

                <!-- 手機 -->
                <div class="group flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-device-phone-mobile"
                    class="w-5 h-5 text-gray-500"
                  />

                  <div class="flex-1 min-w-0">
                    <p
                      class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5"
                    >
                      手機號碼
                    </p>
                    <USkeleton v-if="isLoading" class="h-5 w-32" />
                    <p v-else class="text-gray-900 dark:text-white font-medium">
                      {{ formatPhone(authStore.user?.phone || "-") }}
                    </p>
                  </div>
                </div>

                <!-- 生日 -->
                <div class="group flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-cake"
                    class="w-5 h-5 text-gray-500"
                  />

                  <div class="flex-1 min-w-0">
                    <p
                      class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5"
                    >
                      出生日期
                    </p>
                    <USkeleton v-if="isLoading" class="h-5 w-32" />
                    <p v-else class="text-gray-900 dark:text-white font-medium">
                      {{
                        authStore.user?.birthDate
                          ? formatDate(authStore.user.birthDate)
                          : "-"
                      }}
                    </p>
                  </div>
                </div>

                <!-- 地址 -->
                <div class="group flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-map-pin"
                    class="w-5 h-5 text-gray-500"
                  />

                  <div class="flex-1 min-w-0">
                    <p
                      class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5"
                    >
                      居住城市
                    </p>
                    <USkeleton v-if="isLoading" class="h-5 w-full" />
                    <p
                      v-else
                      class="text-gray-900 dark:text-white font-medium truncate"
                    >
                      {{ authStore.user?.address || "-" }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end items-center px-4 py-3">
              <div class="flex gap-3">
                <UButton
                  color="error"
                  variant="soft"
                  icon="i-heroicons-arrow-right-on-rectangle"
                  @click="handleLogout"
                >
                  登出
                </UButton>
              </div>
            </div>
          </template>
        </UCard>

        <!-- 功能區塊 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UCard
            @click="$router.push('/user/favorites')"
            class="hover:border-primary-500/50 transition-colors cursor-pointer group shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center"
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
            @click="$router.push('/user/history')"
            class="hover:border-primary-500/50 transition-colors cursor-pointer group shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center"
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
