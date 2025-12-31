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
  <div
    class="min-h-[calc(100vh-64px)] dark:bg-gray-950/50 bg-white py-12 md:px-4 px-6 lg:px-8"
  >
    <!-- 內容 -->
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto space-y-8">
        <UCard
          class="overflow-hidden shadow-md ring-1 ring-gray-200 dark:ring-gray-800"
        >
          <template #header>
            <div class="flex items-center justify-between">
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
            class="flex flex-col md:flex-row items-center justify-center py-4"
          >
            <!-- 頭像 -->
            <div class="w-1/2 flex flex-col items-center gap-1">
              <!-- 載入中 -->
              <USkeleton
                v-if="isLoading"
                class="h-24 w-24 rounded-full"
                :ui="{ rounded: 'rounded-full' }"
              />

              <!-- 資料已載入 -->
              <div
                v-else
                class="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900/30 shadow-inner overflow-hidden"
              >
                <img
                  v-if="authStore.user?.pictureUrl"
                  :src="authStore.user.pictureUrl"
                  alt="User"
                  class="h-full w-full object-cover"
                />
              </div>

              <!-- 使用者名稱 -->
              <div>
                <USkeleton v-if="isLoading" class="h-4 w-full" />
                <p v-else class="text-xl text-gray-900 dark:text-white">
                  {{ authStore.user?.displayName || "-" }}
                </p>
              </div>

              <div class="flex items-center justify-center gap-3">
                <!-- 性別 -->
                <div>
                  <!-- 男性 -->
                  <svg
                    v-if="authStore.user?.gender === 'Male'"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    class="w-4 h-4 fill-current text-blue-500"
                  >
                    <path
                      d="M320 32c0-17.7 14.3-32 32-32L480 0c17.7 0 32 14.3 32 32l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-50.7-95 95c19.5 28.4 31 62.7 31 99.8 0 97.2-78.8 176-176 176S32 401.2 32 304 110.8 128 208 128c37 0 71.4 11.4 99.8 31l95-95-50.7 0c-17.7 0-32-14.3-32-32zM208 416a112 112 0 1 0 0-224 112 112 0 1 0 0 224z"
                    />
                  </svg>
                  <!-- 女性 -->
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    class="w-4 h-4 fill-current text-pink-500"
                  >
                    <path
                      d="M80 176a112 112 0 1 1 224 0 112 112 0 1 1 -224 0zM223.9 349.1C305.9 334.1 368 262.3 368 176 368 78.8 289.2 0 192 0S16 78.8 16 176c0 86.3 62.1 158.1 144.1 173.1-.1 1-.1 1.9-.1 2.9l0 64-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-64c0-1 0-1.9-.1-2.9z"
                    />
                  </svg>
                </div>
                <!-- 出生日期 -->
                <div>
                  <USkeleton v-if="isLoading" class="h-4 w-full" />
                  <p v-else class="text-gray-900 dark:text-white">
                    {{ formatDate(authStore.user?.birthDate || "-") }}
                  </p>
                </div>
                <!-- 角色權限 -->
                <div class="">
                  <USkeleton
                    v-if="isLoading"
                    class="h-5 w-24 rounded-full mx-auto sm:mx-0"
                  />
                  <div v-else-if="authStore.user?.role">
                    <!-- <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <UIcon
                        name="i-heroicons-shield-check"
                        class="w-4 h-4 mr-1"
                      />
                      {{
                        authStore.user.role === "ROLE_ADMIN"
                          ? "管理員"
                          : "一般會員"
                      }}
                    </span> -->
                    <UBadge
                      v-if="authStore.user"
                      color="primary"
                      variant="subtle"
                    >
                      <!-- <UIcon
                        name="i-heroicons-shield-check"
                        class="w-4 h-4 mr-1"
                      /> -->
                      {{
                        authStore.user.role === "ROLE_ADMIN"
                          ? "管理員"
                          : "一般會員"
                      }}</UBadge
                    >
                  </div>
                </div>
                <!-- <div>
                  <USkeleton v-if="isLoading" class="h-4 w-full" />
                  <p v-else class="text-gray-900 dark:text-white">
                    {{ authStore.user?.email || "-" }}
                  </p>
                </div> -->
              </div>
            </div>

            <!-- 文字資訊 -->
            <div
              class="flex flex-col items-center md:items-start gap-3 text-center"
            >
              <!-- 電子信箱 -->
              <div
                class="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3"
              >
                <p class="text-gray-500 dark:text-gray-400 text-sm">
                  電子信箱:
                </p>

                <USkeleton v-if="isLoading" class="h-4 w-full" />
                <p v-else class="text-gray-900 dark:text-white">
                  {{ authStore.user?.email || "-" }}
                </p>
              </div>

              <!-- 手機號碼 -->
              <div
                class="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3"
              >
                <p class="text-gray-500 dark:text-gray-400 text-sm">
                  手機號碼:
                </p>
                <!-- Skeleton / Real Text -->
                <USkeleton v-if="isLoading" class="h-4 w-full" />
                <p v-else class="text-gray-900 dark:text-white">
                  {{ formatPhone(authStore.user?.phone || "") }}
                </p>
              </div>

              <!-- 住址 -->
              <div
                class="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3"
              >
                <p class="text-gray-500 dark:text-gray-400 text-sm">住址:</p>
                <USkeleton v-if="isLoading" class="h-4 w-full" />
                <p v-else class="text-gray-900 dark:text-white">
                  {{ authStore.user?.address || "-" }}
                </p>
              </div>

              <!-- 角色權限 -->
              <!-- <div class="pt-2 h-6">
                <USkeleton
                  v-if="isLoading"
                  class="h-5 w-24 rounded-full mx-auto sm:mx-0"
                />
                <div v-else-if="authStore.user?.role">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <UIcon
                      name="i-heroicons-shield-check"
                      class="w-4 h-4 mr-1"
                    />
                    {{
                      authStore.user.role === "ROLE_ADMIN"
                        ? "管理員"
                        : "一般會員"
                    }}
                  </span>
                  <UBadge
                    v-if="authStore.user"
                    color="primary"
                    variant="subtle"
                  >
                    <UIcon
                      name="i-heroicons-shield-check"
                      class="w-4 h-4 mr-1"
                    />
                    {{
                      authStore.user.role === "ROLE_ADMIN"
                        ? "管理員"
                        : "一般會員"
                    }}</UBadge
                  >
                </div>
              </div> -->
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between items-center">
              <p class="text-xs text-gray-400">
                加入時間：{{ formatDate(authStore.user?.createdAt || "") }}
              </p>
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
