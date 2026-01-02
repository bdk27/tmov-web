<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const authForm = useTemplateRef("authForm");

const errorMessage = ref("");

// 帳號/密碼
const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "帳號",
    placeholder: "請輸入你的電子郵件",
    size: "lg",
    required: true,
  },
  {
    name: "password",
    label: "密碼",
    type: "password",
    placeholder: "輸入你的密碼",
    size: "lg",
    required: true,
  },
  {
    name: "rememberMe",
    label: "記住我",
    type: "checkbox",
  },
];

// 驗證
type Schema = z.output<typeof schema>;
const schema = z.object({
  email: z.email("無效的 email"),
  password: z.string("密碼為必填").min(8, "密碼長度至少為 8 個字元"),
  rememberMe: z.boolean().optional(),
});

// 提交表單
async function onSubmit(payload: FormSubmitEvent<Schema>) {
  errorMessage.value = "";

  const res = await authStore.login({
    email: payload.data.email,
    password: payload.data.password,
    rememberMe: payload.data.rememberMe,
  });

  if (res.success) {
    toast.add({
      title: "登入成功",
      description: "歡迎回來！",
      color: "success",
    });

    await nextTick();

    await router.replace("/user");
  } else {
    errorMessage.value = res.message || "登入失敗，請檢查您的帳號或密碼";
  }

  if (authForm.value) {
    authForm.value.state.email = "";
    authForm.value.state.password = "";
  }
}
</script>

<template>
  <div
    class="min-h-[calc(100vh-64px)] dark:bg-gray-950/50 bg-white flex flex-col items-center justify-center gap-4 p-4"
  >
    <UPageCard class="w-full max-w-md shadow-md">
      <UAuthForm
        ref="authForm"
        :schema="schema"
        title="登入"
        icon="i-lucide-user"
        :fields="fields"
        :submit="{
          label: '登入',
        }"
        @submit="onSubmit"
      >
        <template #description>
          <div class="space-y-4">
            <p>
              還沒有帳號嗎？
              <ULink to="/register" class="text-primary font-medium"
                >註冊</ULink
              >
            </p>

            <!-- 插入 Google 按鈕元件 -->
            <GoogleLoginButton />

            <!-- 分隔線 -->
            <div class="flex items-center gap-2 py-2">
              <span class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></span>
              <span class="text-gray-500 dark:text-gray-400 text-sm font-medium"
                >或</span
              >
              <span class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></span>
            </div>
          </div>
        </template>
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1"
            >忘記密碼?</ULink
          >
        </template>
        <template #validation>
          <UAlert
            v-if="errorMessage"
            color="error"
            icon="i-lucide-info"
            :title="errorMessage"
          />
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
