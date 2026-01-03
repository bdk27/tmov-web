<script setup lang="ts">
declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleLoginResponse {
  token: string;
  email: string;
  displayName: string;
  pictureUrl: string;
  role: string;
  createdAt: string;
}

const config = useRuntimeConfig().public;
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const buttonRef = ref<HTMLElement | null>(null);

// 使用 useHead 載入 Google SDK
useHead({
  script: [
    {
      src: "https://accounts.google.com/gsi/client",
      async: true,
      defer: true,
      onload: () => initGoogleBtn(),
    },
  ],
});

onMounted(() => {
  if (window.google) {
    initGoogleBtn();
  }
});

const initGoogleBtn = () => {
  // 確保 window.google 存在且容器已掛載
  if (!window.google || !buttonRef.value) return;

  // 初始化設定
  window.google.accounts.id.initialize({
    client_id: config.googleClientId,
    callback: handleGoogleCallback,
    // auto_select: true, // 若要自動登入可開啟
    cancel_on_tap_outside: false,
  });

  // 渲染按鈕
  window.google.accounts.id.renderButton(buttonRef.value, {
    type: "standard",
    theme: "outline",
    size: "large",
    width: "100%",
    text: "sign_in_with",
    shape: "rectangular",
    logo_alignment: "left",
  });
};

// 處理回傳
async function handleGoogleCallback(response: any) {
  const idToken = response.credential;

  try {
    const data = await $fetch<GoogleLoginResponse>(`/api/auth/google`, {
      method: "POST",
      body: { idToken },
    });

    if (data.token) {
      authStore.token = data.token;

      await authStore.fetchUser();

      toast.add({ title: "Google 登入成功", color: "primary" });
      router.push("/");
    }
  } catch (error: any) {
    console.error("Google Login Failed:", error);
    toast.add({
      title: "登入失敗",
      description: "Google 驗證通過，但伺服器登入失敗",
      color: "error",
    });
  }
}
</script>

<template>
  <div class="w-full">
    <!-- Google 按鈕掛載點 -->
    <div ref="buttonRef" class="w-full flex justify-center"></div>
  </div>
</template>
