<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

useHead({
  title: "編輯資料",
});

// 定義頁籤
const items = [
  {
    slot: "account",
    label: "基本資料",
    icon: "i-heroicons-user-circle",
    value: "profile",
  },
  {
    slot: "password",
    label: "更改密碼",
    icon: "i-heroicons-lock-closed",
    value: "security",
  },
];

// 路由與頁籤連動
const selectedTab = computed<string>({
  get() {
    return route.query.tab?.toString() || "profile";
  },
  set(value) {
    router.replace({
      query: { ...route.query, tab: value },
    });
  },
});

// 狀態定義
const state = reactive({
  displayName: "",
  pictureUrl: "",
  gender: "",
  birthDate: "",
  phone: "",
  address: "",
});

// 密碼
const passwordState = reactive({
  currentPassword: "",
  currentPasswordShow: false,
  newPassword: "",
  newPasswordShow: false,
  confirmPassword: "",
  confirmPasswordShow: false,
});

const genderOptions = [
  { label: "男性", value: "Male" },
  { label: "女性", value: "Female" },
];

const loading = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// 初始化資料
watch(
  () => authStore.user,
  (user) => {
    if (user) {
      state.displayName = user.displayName || "";
      state.pictureUrl = user.pictureUrl || "";
      state.gender = user.gender || "";
      state.birthDate = user.birthDate || "";
      state.phone = user.phone || "";
      state.address = user.address || "";
    }
  },
  { immediate: true }
);

// 上傳大頭貼
function triggerFileInput() {
  fileInputRef.value?.click();
}

async function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.add({ title: "請上傳圖片格式檔案", color: "error" });
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    toast.add({ title: "圖片大小不能超過 2MB", color: "error" });
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  const oldUrl = state.pictureUrl;
  state.pictureUrl = previewUrl;
  loading.value = true;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const data = await $fetch<{ url: string }>(`/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    });

    state.pictureUrl = data.url;
    toast.add({
      title: "圖片上傳成功",
      description: "請記得點擊下方按鈕儲存設定",
      color: "primary",
    });
  } catch (error) {
    state.pictureUrl = oldUrl;
    toast.add({ title: "圖片上傳失敗", color: "error" });
  } finally {
    loading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
}

// 更新基本資料
const phoneRegex = /^09\d{8}$/;
const profileSchema = z.object({
  displayName: z.string().min(1, "暱稱不能為空"),
  pictureUrl: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  phone: z
    .string()
    .refine(
      (val) => !val || phoneRegex.test(val),
      "手機號碼格式錯誤 (例: 0912345678)"
    )
    .optional(),
  address: z.string().optional(),
});
type ProfileSchema = z.output<typeof profileSchema>;

async function handleUpdateProfile(payload: FormSubmitEvent<ProfileSchema>) {
  loading.value = true;

  try {
    await $fetch(`/api/auth/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: {
        displayName: payload.data.displayName,
        pictureUrl: state.pictureUrl,
        gender: payload.data.gender,
        birthDate: payload.data.birthDate,
        phone: payload.data.phone,
        address: payload.data.address,
      },
    });

    if (authStore.user) {
      Object.assign(authStore.user, {
        displayName: state.displayName,
        pictureUrl: state.pictureUrl,
        gender: state.gender,
        birthDate: state.birthDate,
        phone: state.phone,
        address: state.address,
      });
    }
    toast.add({ title: "個人資料已更新", color: "primary" });

    router.push("/user");
  } catch (error) {
    toast.add({ title: "更新失敗", color: "error" });
  } finally {
    loading.value = false;
  }
}

// 修改密碼
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "請輸入目前密碼"),
    newPassword: z.string().min(8, "新密碼長度至少需 8 碼"),
    confirmPassword: z.string().min(1, "請再次輸入新密碼"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "兩次輸入的密碼不一致",
    path: ["confirmPassword"], // 錯誤訊息會顯示在 confirmPassword 欄位下
  });

type PasswordSchema = z.output<typeof passwordSchema>;

async function handleChangePassword(payload: FormSubmitEvent<PasswordSchema>) {
  loading.value = true;
  try {
    await $fetch(`/api/auth/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: {
        oldPassword: payload.data.currentPassword,
        newPassword: payload.data.newPassword,
      },
    });

    toast.add({
      title: "密碼修改成功",
      description: "請使用新密碼重新登入",
      color: "primary",
    });

    passwordState.currentPassword = "";
    passwordState.newPassword = "";
    passwordState.confirmPassword = "";
  } catch (error: any) {
    toast.add({
      title: "修改失敗",
      description: error.message || "請確認舊密碼是否正確",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] px-4 py-12 bg-gray-50 dark:bg-gray-950">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <!-- <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          編輯個人資料
        </h1> -->
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          @click="$router.back()"
        >
          返回
        </UButton>
      </div>

      <UTabs v-model="selectedTab" :items="items" class="w-full">
        <!-- 基本資料 -->
        <template #account="{ item }">
          <UCard class="mt-4 shadow-lg ring-1 ring-gray-200 dark:ring-gray-800">
            <template #header>
              <p
                class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
              >
                {{ item.label }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                更新您的公開資訊與頭像
              </p>
            </template>

            <UForm
              :schema="profileSchema"
              :state="state"
              class="w-full flex flex-col items-center justify-center gap-6"
              @submit="handleUpdateProfile"
            >
              <!-- 大頭貼上傳區 -->
              <div class="flex flex-col items-center">
                <div
                  class="relative group cursor-pointer"
                  @click="triggerFileInput"
                >
                  <img
                    :src="state.pictureUrl"
                    alt="User"
                    class="h-24 w-24 object-cover rounded-full bg-neutral-200 dark:bg-neutral-700"
                  />

                  <!-- 懸停時顯示相機圖示 -->
                  <div
                    class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <UIcon
                      name="i-heroicons-camera"
                      class="w-8 h-8 text-white"
                    />
                  </div>
                </div>

                <p class="text-sm text-gray-400 mt-2">
                  支援 JPG, PNG, WebP, SVG (最大為 2MB)
                </p>

                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileSelect"
                />
              </div>

              <div class="w-full">
                <UFormField label="暱稱" name="displayName" required>
                  <UInput
                    v-model="state.displayName"
                    size="lg"
                    maxlength="20"
                    placeholder="暱稱"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <div class="w-full">
                <UFormField label="性別" name="gender">
                  <URadioGroup
                    v-model="state.gender"
                    :items="genderOptions"
                    orientation="horizontal"
                  />
                </UFormField>
              </div>

              <div class="w-full">
                <UFormField label="出生日期" name="birthDate">
                  <UInput
                    v-model="state.birthDate"
                    size="lg"
                    type="date"
                    placeholder="月份"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <div class="w-full">
                <UFormField label="手機號碼" name="phone">
                  <UInput
                    v-model="state.phone"
                    size="lg"
                    type="tel"
                    maxlength="10"
                    placeholder="手機號碼"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <div class="w-full">
                <UFormField label="居住城市" name="address">
                  <UInput
                    v-model="state.address"
                    size="lg"
                    type="text"
                    placeholder="例如: 台北市"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UButton
                type="submit"
                color="primary"
                :loading="loading"
                icon="i-heroicons-check"
              >
                儲存變更
              </UButton>
            </UForm>
          </UCard>
        </template>

        <!-- 密碼修改 -->
        <template #password="{ item }">
          <UCard class="mt-4 shadow-lg ring-1 ring-gray-200 dark:ring-gray-800">
            <template #header>
              <p
                class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
              >
                {{ item.label }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                為了您的帳號安全，請定期更換密碼
              </p>
            </template>

            <UForm
              :schema="passwordSchema"
              :state="passwordState"
              class="w-full flex flex-col items-center justify-center gap-6"
              @submit="handleChangePassword"
            >
              <UFormField
                label="舊密碼"
                name="currentPassword"
                class="w-full"
                required
              >
                <UInput
                  v-model="passwordState.currentPassword"
                  size="lg"
                  placeholder="請輸入現在使用的密碼"
                  class="w-full"
                  :type="
                    passwordState.currentPasswordShow ? 'text' : 'password'
                  "
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      :icon="
                        passwordState.currentPasswordShow
                          ? 'i-lucide-eye-off'
                          : 'i-lucide-eye'
                      "
                      :aria-label="
                        passwordState.currentPasswordShow
                          ? 'Hide password'
                          : 'Show password'
                      "
                      :aria-pressed="passwordState.currentPasswordShow"
                      aria-controls="password"
                      @click="
                        passwordState.currentPasswordShow =
                          !passwordState.currentPasswordShow
                      "
                    />
                  </template>
                </UInput>
              </UFormField>

              <UFormField
                label="新密碼"
                name="newPassword"
                help="長度至少 8 個字元"
                class="w-full"
                required
              >
                <UInput
                  v-model="passwordState.newPassword"
                  size="lg"
                  minlength="8"
                  placeholder="請輸入新密碼"
                  class="w-full"
                  :type="passwordState.newPasswordShow ? 'text' : 'password'"
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      :icon="
                        passwordState.newPasswordShow
                          ? 'i-lucide-eye-off'
                          : 'i-lucide-eye'
                      "
                      :aria-label="
                        passwordState.newPasswordShow
                          ? 'Hide password'
                          : 'Show password'
                      "
                      :aria-pressed="passwordState.newPasswordShow"
                      aria-controls="password"
                      @click="
                        passwordState.newPasswordShow =
                          !passwordState.newPasswordShow
                      "
                    />
                  </template>
                </UInput>
              </UFormField>

              <UFormField
                label="確認新密碼"
                name="confirmPassword"
                class="w-full"
                required
              >
                <UInput
                  v-model="passwordState.confirmPassword"
                  size="lg"
                  :type="
                    passwordState.confirmPasswordShow ? 'text' : 'password'
                  "
                  placeholder="再次輸入新密碼"
                  class="w-full"
                  :color="
                    passwordState.confirmPassword &&
                    passwordState.newPassword !== passwordState.confirmPassword
                      ? 'error'
                      : 'neutral'
                  "
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      :icon="
                        passwordState.confirmPasswordShow
                          ? 'i-lucide-eye-off'
                          : 'i-lucide-eye'
                      "
                      :aria-label="
                        passwordState.confirmPasswordShow
                          ? 'Hide password'
                          : 'Show password'
                      "
                      :aria-pressed="passwordState.confirmPasswordShow"
                      aria-controls="password"
                      @click="
                        passwordState.confirmPasswordShow =
                          !passwordState.confirmPasswordShow
                      "
                    />
                  </template>
                </UInput>
              </UFormField>

              <UButton
                type="submit"
                color="primary"
                icon="i-heroicons-check"
                :loading="loading"
              >
                確認修改
              </UButton>
            </UForm>
          </UCard>
        </template>
      </UTabs>
    </div>
  </div>
</template>
