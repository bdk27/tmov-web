// 使用者資料介面
export interface User {
  id: number;
  displayName: string;
  email: string;
  role?: string;
  pictureUrl?: string;
  createdAt?: string;
}

// 登入回應介面
export interface AuthResponse {
  token: string;
  user: User;
}

// 錯誤回應介面
export interface ApiError {
  message: string;
  status: number;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const token = useCookie<string | null>("auth_token", {
    maxAge: 60 * 60 * 24 * 7, // 7 天
    watch: true,
  });

  // 判斷是否已登入
  const isAuthenticated = computed(() => !!token.value);

  // 登入
  const login = async (credentials: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    loading.value = true;
    try {
      const res = await $fetch<AuthResponse>(`/api/auth/login`, {
        method: "POST",
        body: credentials,
      });

      const maxAge = credentials.rememberMe ? 60 * 60 * 24 * 7 : undefined;
      const authCookie = useCookie("auth_token", { maxAge });
      authCookie.value = res.token;

      // 登入成功，更新狀態
      token.value = res.token; // 自動寫入 Cookie
      user.value = res.user;

      return { success: true };
    } catch (error: any) {
      console.error("登入失敗:", error);
      return {
        success: false,
        message: error.data?.message || "登入失敗，請檢查帳號密碼",
      };
    } finally {
      loading.value = false;
    }
  };

  // 註冊
  const register = async (userData: { email: string; password: string }) => {
    loading.value = true;
    try {
      const res = await $fetch<AuthResponse>(`/api/auth/register`, {
        method: "POST",
        body: userData,
      });

      // 註冊成功通常直接登入
      token.value = res.token;
      user.value = res.user;

      return { success: true };
    } catch (error: any) {
      console.error("註冊失敗:", error);
      return {
        success: false,
        message: error.data?.message || "註冊失敗，請稍後再試",
      };
    } finally {
      loading.value = false;
    }
  };

  // 登出
  const logout = () => {
    token.value = null; // 清除 Cookie
    user.value = null; // 清除狀態

    // 導回首頁或登入頁
    const router = useRouter();
    router.push("/login");
  };

  // 重新整理後恢復 user 狀態
  const fetchUser = async () => {
    if (!token.value) return;

    try {
      const res = await $fetch<User>(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      user.value = res;
    } catch (error) {
      // Token 可能過期，執行登出
      logout();
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    fetchUser,
  };
});
