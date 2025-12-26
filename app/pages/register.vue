<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const authForm = useTemplateRef("authForm");

const errorMessage = ref("");

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
    type: "password",
    label: "密碼",
    placeholder: "輸入你的密碼",
    size: "lg",
    required: true,
  },
];

const providers = [
  {
    label: "Google",
    icon: "i-simple-icons-google",
    onClick: () => {
      toast.add({ title: "Google", description: "使用 Google 登入中" });
    },
  },
];

const schema = z.object({
  email: z.email("無效的 email"),
  password: z.string("密碼為必填").min(8, "密碼長度至少為 8 個字元"),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const res = await authStore.register({
    email: payload.data.email,
    password: payload.data.password,
  });

  if (res.success) {
    toast.add({
      title: "註冊成功",
      description: "帳號建立成功，請繼續登入！",
      color: "success",
    });

    router.push("/login");
  } else {
    errorMessage.value = res.message || "註冊失敗，請檢查您的帳號或密碼";
  }

  if (authForm.value) {
    authForm.value.state.email = "";
    authForm.value.state.password = "";
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        ref="authForm"
        :schema="schema"
        title="註冊"
        icon="i-lucide-user-plus"
        :fields="fields"
        :providers="providers"
        separator="或"
        :submit="{
          label: '註冊',
        }"
        @submit="onSubmit"
      >
        <template #description>
          已經有帳號了嗎？
          <ULink to="/login" class="text-primary font-medium">登入</ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
