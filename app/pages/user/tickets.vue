<script setup lang="ts">
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const { posterUrl } = useTmdb();

// 定義資料介面
interface BookingItem {
  bookingId: number;
  tmdbId: number;
  movieTitle: string;
  posterUrl: string;
  cinemaName: string;
  showDate: string;
  showTime: string;
  seats: string; // "A1,A2"
  ticketCount: number;
  totalPrice: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  createdAt: string;
}

const bookings = ref<BookingItem[]>([]);
const loading = ref(true);

const now = ref(Date.now());
let timer: any = null;

onMounted(() => {
  fetchBookings();

  timer = setInterval(() => {
    now.value = Date.now();
    processAutoCancel();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authStore.token}`,
  };
}

// 取得訂單列表
async function fetchBookings() {
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }
  loading.value = true;
  try {
    const response = await fetch("/api/bookings", {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      // 依照建立時間排序 (新的在前)
      const data = await response.json();
      bookings.value = data.sort((a: BookingItem, b: BookingItem) => {
        // 排序邏輯：有效訂單在前，取消/過期訂單在後
        const aIsInactive = a.status === "CANCELLED" || checkIsExpired(a);
        const bIsInactive = b.status === "CANCELLED" || checkIsExpired(b);

        if (aIsInactive !== bIsInactive) {
          // 如果狀態不同，無效的 (Inactive) 放後面 (return 1)
          return aIsInactive ? 1 : -1;
        }

        // 如果狀態相同 (都是有效 或 都是無效)，則依照 ID 倒序 (新->舊)
        return b.bookingId - a.bookingId;
      });

      await processAutoCancel();
    }
  } catch (error) {
    console.error(error);
    toast.add({ title: "無法取得訂票紀錄", color: "error" });
  } finally {
    loading.value = false;
  }
}

// 付款 (模擬)
const isActionLoading = ref<number | null>(null);
async function handlePay(id: number) {
  isActionLoading.value = id;
  try {
    const res = await fetch(`/api/bookings/${id}/pay`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      toast.add({
        title: "付款成功",
        color: "success",
        icon: "i-heroicons-check-circle",
      });
      fetchBookings(); // 重新整理列表
    } else {
      throw new Error("Payment failed");
    }
  } catch (e) {
    toast.add({ title: "付款失敗", color: "error" });
  } finally {
    isActionLoading.value = null;
  }
}

// 手動取消訂單
async function handleCancel(id: number) {
  if (!confirm("確定要取消這筆訂單嗎？")) return;

  isActionLoading.value = id;
  await executeCancel(id, false); // 非靜默模式
  isActionLoading.value = null;
}

// 自動取消訂單
async function executeCancel(id: number, silent = false) {
  try {
    const res = await fetch(`/api/bookings/${id}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (res.ok) {
      if (!silent) {
        toast.add({ title: "訂單已取消", color: "neutral" });
        fetchBookings();
      }
      return true;
    } else {
      throw new Error("Cancel failed");
    }
  } catch (e) {
    if (!silent) {
      toast.add({ title: "取消失敗", color: "error" });
    }
    return false;
  }
}

async function processAutoCancel() {
  // 找出所有「待付款」且「已過期」的訂單
  const expiredOrders = bookings.value.filter(
    (t) => t.status === "PENDING" && checkIsExpired(t)
  );

  for (const ticket of expiredOrders) {
    console.log(`訂單 #${ticket.bookingId} 已逾期，正在自動取消...`);

    // 先更新前端狀態，避免重複觸發 (Optimistic Update)
    ticket.status = "CANCELLED";

    // 呼叫後端 API
    await executeCancel(ticket.bookingId, true);
  }
}

// 是否逾時
function checkIsExpired(ticket: BookingItem) {
  if (ticket.status !== "PENDING") return false;

  const createdTime = new Date(ticket.createdAt).getTime();
  const now = new Date().getTime();
  const diffInMinutes = (now - createdTime) / (1000 * 60);

  // 超過 30 分鐘未付款視為過期
  return diffInMinutes > 30;
}

// 倒數計時
function getCountdown(ticket: BookingItem) {
  const createdTime = new Date(ticket.createdAt).getTime();
  const deadline = createdTime + 30 * 60 * 1000;
  const diff = deadline - now.value;

  if (diff <= 0) return "00:00";

  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// 狀態樣式
function getStatusBadge(ticket: BookingItem) {
  // 優先判斷取消
  if (ticket.status === "CANCELLED" || checkIsExpired(ticket)) {
    return {
      color: "neutral" as const,
      label: "已取消",
      icon: "i-heroicons-x-circle",
    };
  }

  // 正常狀態
  switch (ticket.status) {
    case "PAID":
      return {
        color: "success" as const,
        label: "已付款",
        icon: "i-heroicons-check-circle",
        isExpired: false,
      };
    case "PENDING":
      return {
        color: "secondary" as const,
        label: "待付款",
        icon: "i-heroicons-banknotes",
        isExpired: false,
      };
    default:
      return {
        color: "neutral" as const,
        label: ticket.status,
        icon: "",
        isExpired: false,
      };
  }
}
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <!-- 標題區 -->
    <SubTitle title="訂票紀錄" size="xl" class="mb-5" />

    <!-- 載入中 -->
    <div v-if="loading" class="space-y-4">
      <UCard v-for="i in 3" :key="i">
        <div class="flex gap-4">
          <USkeleton class="w-24 h-36 rounded-lg shrink-0" />
          <div class="flex-1 space-y-3">
            <USkeleton class="h-6 w-1/2" />
            <USkeleton class="h-4 w-1/3" />
            <USkeleton class="h-4 w-1/4" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- 空狀態 -->
    <div
      v-else-if="bookings.length === 0"
      class="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800"
    >
      <div
        class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <UIcon name="i-heroicons-ticket" class="w-10 h-10 text-gray-400" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        尚無購票紀錄
      </h3>
      <p class="text-gray-500 mb-6">您還沒有預訂任何電影票</p>
      <UButton to="/movie/now-playing" size="lg" color="primary">
        前往訂票
      </UButton>
    </div>

    <!-- 訂單列表 -->
    <div v-else class="space-y-6">
      <div
        v-for="ticket in bookings"
        :key="ticket.bookingId"
        class="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row"
      >
        <!-- 左側：海報與狀態條 -->
        <div
          class="w-full md:w-48 shrink-0 relative bg-gray-100 dark:bg-gray-800"
        >
          <img
            :src="posterUrl(ticket.posterUrl)"
            class="w-full h-full object-cover opacity-90"
            :class="{ 'grayscale opacity-50': ticket.status === 'CANCELLED' }"
          />
          <!-- 手機版狀態標籤 -->
          <div class="absolute top-2 left-2 md:hidden">
            <UBadge :color="getStatusBadge(ticket).color" variant="solid">
              {{ getStatusBadge(ticket).label }}
            </UBadge>
          </div>
        </div>

        <!-- 右側：票券內容 -->
        <div
          class="flex-1 p-6 flex flex-col justify-between relative overflow-hidden"
        >
          <!-- 裝飾用圓圈 (模擬票券撕線) -->
          <div
            class="hidden md:block absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 dark:bg-gray-950 rounded-full z-10 border-r border-gray-200 dark:border-gray-800"
          ></div>

          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {{ ticket.movieTitle }}
              </h3>
              <div class="flex items-center gap-2 text-gray-500 text-sm">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                {{ ticket.cinemaName }}
              </div>
            </div>

            <!-- 桌機版狀態標籤 -->
            <div class="hidden md:block text-right">
              <UBadge
                :color="getStatusBadge(ticket).color"
                variant="soft"
                size="md"
                :icon="getStatusBadge(ticket).icon"
              >
                {{ getStatusBadge(ticket).label }}
              </UBadge>
            </div>
          </div>

          <!-- 詳細資訊 Grid -->
          <div
            class="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-t border-b border-gray-100 dark:border-gray-800 py-4 my-2"
          >
            <div>
              <p class="text-gray-400 mb-1 text-xs uppercase tracking-wider">
                日期
              </p>
              <p class="font-bold text-gray-900 dark:text-white text-lg">
                {{ ticket.showDate }}
              </p>
            </div>
            <div>
              <p class="text-gray-400 mb-1 text-xs uppercase tracking-wider">
                時間
              </p>
              <p class="font-bold text-gray-900 dark:text-white text-lg">
                {{ ticket.showTime.substring(0, 5) }}
              </p>
            </div>
            <div>
              <p class="text-gray-400 mb-1 text-xs uppercase tracking-wider">
                座位
              </p>
              <p class="font-bold text-primary-500 text-lg">
                {{ ticket.seats }}
              </p>
            </div>
            <div>
              <p class="text-gray-400 mb-1 text-xs uppercase tracking-wider">
                總金額
              </p>
              <p class="font-bold text-gray-900 dark:text-white text-lg">
                NT$ {{ ticket.totalPrice }}
              </p>
            </div>
          </div>

          <!-- 底部操作區 -->
          <div class="flex justify-between items-center mt-2 pt-2">
            <p class="text-xs text-gray-400">
              訂單編號：#{{ ticket.bookingId }}
            </p>

            <div class="flex gap-3">
              <!-- 待付款時顯示 -->
              <template v-if="ticket.status === 'PENDING'">
                <!-- 倒數計時 -->
                <span class="text-sm text-error flex items-center gap-1 mr-2">
                  <UIcon name="i-heroicons-clock" />
                  剩餘 {{ getCountdown(ticket) }}
                </span>

                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :loading="isActionLoading === ticket.bookingId"
                  @click="handleCancel(ticket.bookingId)"
                >
                  取消訂單
                </UButton>
                <UButton
                  color="primary"
                  size="sm"
                  icon="i-heroicons-credit-card"
                  :loading="isActionLoading === ticket.bookingId"
                  @click="handlePay(ticket.bookingId)"
                >
                  立即付款
                </UButton>
              </template>

              <!-- 已付款時顯示 -->
              <template v-else-if="ticket.status === 'PAID'">
                <UButton
                  color="neutral"
                  variant="soft"
                  size="sm"
                  icon="i-heroicons-qr-code"
                >
                  顯示 QR Code
                </UButton>
              </template>

              <!-- 已取消 -->
              <template v-else>
                <span class="text-sm text-gray-400">無效票券</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
