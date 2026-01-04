<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { fetchDetail, posterUrl, titleOf } = useTmdb();
const { getDates, getShowtimes, getSeats } = useTicket();
const authStore = useAuthStore();

// 電影 ID
const movieId = Number(route.params.id);
const movie = ref<any>(null);

// 步驟控制
const currentStep = ref(1);
const steps = [
  { label: "選擇場次", icon: "i-heroicons-calendar" },
  { label: "選擇座位", icon: "i-heroicons-squares-2x2" },
  { label: "確認結帳", icon: "i-heroicons-credit-card" },
];

const areaValue = ref("");
const area = ref([
  { label: "請選擇地區", value: "" },
  { label: "基榮", value: "keelung" },
  { label: "台北", value: "taipei" },
  { label: "新北", value: "new-taipei" },
  { label: "桃園", value: "taoyuan" },
  { label: "新竹", value: "hsinchu" },
  { label: "苗栗", value: "miaoli" },
  { label: "台中", value: "taichung" },
  { label: "彰化", value: "changhua" },
  { label: "雲林", value: "yunlin" },
  { label: "南投", value: "nantou" },
  { label: "嘉義", value: "chiayi" },
  { label: "台南", value: "tainan" },
  { label: "高雄", value: "kaohsiung" },
  { label: "宜蘭", value: "yilan" },
  { label: "花蓮", value: "hualien" },
  { label: "台東", value: "taitung" },
  { label: "屏東", value: "pingtung" },
  { label: "澎湖", value: "penghu" },
  { label: "金門", value: "kinmen" },
]);

// --- 初始化 ---
onMounted(async () => {
  try {
    movie.value = await fetchDetail("movie", movieId);
  } catch (e) {
    router.replace("/");
  }
});

// --- Step 1: 場次選擇 ---
const dates = getDates();
const selectedDate = ref(dates[0]?.value || "");
const showtimes = ref<Showtime[]>([]);
const selectedShowtime = ref<Showtime | null>(null);
const loadingShowtimes = ref(false);

// 當日期改變時，重新抓取場次
watch(
  [selectedDate, areaValue],
  async ([newDate, newArea]) => {
    selectedShowtime.value = null;
    showtimes.value = []; // 先清空

    // 如果沒有選擇地區，就不載入
    if (!newArea) {
      return;
    }

    loadingShowtimes.value = true;
    try {
      // 傳入地區參數
      showtimes.value = await getShowtimes(newArea);
    } finally {
      loadingShowtimes.value = false;
    }
  },
  { immediate: true }
);

function selectShowtime(time: Showtime) {
  selectedShowtime.value = time;
  currentStep.value = 2;
  loadSeats();
}

// --- Step 2: 座位選擇 ---
const seats = ref<Seat[]>([]);
const selectedSeats = ref<Seat[]>([]);
const loadingSeats = ref(false);

async function loadSeats() {
  if (!selectedShowtime.value) return;
  loadingSeats.value = true;
  seats.value = await getSeats(selectedShowtime.value.id);
  selectedSeats.value = []; // 清空已選
  loadingSeats.value = false;
}

function toggleSeat(seat: Seat) {
  if (seat.status === "occupied") return;

  const idx = selectedSeats.value.findIndex((s) => s.id === seat.id);
  if (idx !== -1) {
    // 取消選取
    selectedSeats.value.splice(idx, 1);
    seat.status = "available";
  } else {
    // 限制最多選 6 張
    if (selectedSeats.value.length >= 6) {
      toast.add({ title: "一次最多選擇 6 個座位", color: "warning" });
      return;
    }
    // 選取
    selectedSeats.value.push(seat);
    seat.status = "selected";
  }
}

// 取得座位名稱 (例如 A排5號)
const getSeatName = (seat: Seat) => {
  const rowName = String.fromCharCode(64 + seat.row); // 1->A, 2->B
  return `${rowName}排${seat.col}號`;
};

// 總金額
const totalPrice = computed(() => {
  return (selectedShowtime.value?.price || 0) * selectedSeats.value.length;
});

// --- Step 3: 結帳 ---
const isProcessing = ref(false);

async function handleCheckout() {
  if (!authStore.isAuthenticated) {
    toast.add({ title: "請先登入會員", color: "error" });
    router.push("/login");
    return;
  }

  isProcessing.value = true;
  // 模擬送出訂單給後端
  setTimeout(() => {
    isProcessing.value = false;
    toast.add({
      title: "訂票成功！",
      description: "您的訂單已確認，請至信箱查看電子票券。",
      color: "success",
      icon: "i-heroicons-check-circle",
    });
    // 導回首頁或訂單頁
    router.push("/");
  }, 2000);
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-20 px-4">
    <div v-if="movie" class="max-w-4xl mx-auto">
      <!-- 頂部資訊 -->
      <div
        class="flex items-center gap-6 mb-8 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
      >
        <img
          :src="posterUrl(movie.poster_path, 'w92')"
          class="w-16 h-24 object-cover rounded-lg shadow-md"
        />
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ titleOf(movie) }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
            片長：{{ movie.runtime }} 分鐘 · 分級：{{
              movie.custom_rating || "普"
            }}
          </p>
        </div>
      </div>

      <!-- 步驟條 -->
      <div class="flex justify-between items-center mb-8 px-4 relative">
        <div
          class="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-10"
        ></div>
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-950 px-2"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
            :class="[
              currentStep > index + 1
                ? 'bg-primary-500 border-primary-500 text-white' // 已完成
                : currentStep === index + 1
                ? 'bg-white dark:bg-gray-900 border-primary-500 text-primary-500' // 進行中
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400', // 未進行
            ]"
          >
            <UIcon
              v-if="currentStep > index + 1"
              name="i-heroicons-check"
              class="w-6 h-6"
            />
            <span v-else class="font-bold">{{ index + 1 }}</span>
          </div>
          <span
            class="text-xs font-medium"
            :class="
              currentStep >= index + 1
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400'
            "
          >
            {{ step.label }}
          </span>
        </div>
      </div>

      <!-- 內容區 -->
      <UCard>
        <!-- STEP 1: 選擇場次 -->
        <div v-if="currentStep === 1">
          <h2 class="text-lg font-bold mb-4">選擇日期與場次</h2>

          <div class="mb-6">
            <div class="flex-1 min-w-0 w-ful">
              <!-- 日期 Tabs -->
              <div class="flex gap-2 overflow-x-auto custom-scrollbar pb-4">
                <button
                  v-for="date in dates"
                  :key="date.value"
                  @click="date.value && (selectedDate = date.value)"
                  class="flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 transition-all shrink-0"
                  :class="[
                    selectedDate === date.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300',
                  ]"
                >
                  <span class="text-xs text-gray-500">{{ date.day }}</span>
                  <span class="text-lg">{{ date.label }}</span>
                </button>
              </div>
              <div>
                <USelect v-model="areaValue" :items="area" />
              </div>
            </div>
          </div>

          <!-- 場次列表 -->
          <div v-if="loadingShowtimes" class="space-y-4">
            <USkeleton class="h-20 w-full" v-for="i in 3" :key="i" />
          </div>
          <div v-else class="grid gap-4">
            <div
              v-for="time in showtimes"
              :key="time.id"
              class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 cursor-pointer transition-colors group"
              @click="selectShowtime(time)"
            >
              <div>
                <div class="font-bold text-lg text-gray-900 dark:text-white">
                  {{ time.time }}
                </div>
                <div class="text-sm text-gray-500">{{ time.theaterName }}</div>
              </div>
              <div class="text-right">
                <UBadge color="neutral" variant="soft" class="mb-1">{{
                  time.type
                }}</UBadge>
                <div class="text-primary-600 font-bold">${{ time.price }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2: 選擇座位 -->
        <div v-else-if="currentStep === 2" class="flex flex-col items-center">
          <div class="w-full flex justify-between items-center mb-6">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-arrow-left"
              @click="currentStep = 1"
            >
              重選場次
            </UButton>
            <div class="text-center">
              <p class="font-bold">{{ selectedShowtime?.theaterName }}</p>
              <p class="text-xs text-gray-500">
                {{ selectedShowtime?.time }} - {{ selectedShowtime?.type }}
              </p>
            </div>
            <div class="w-20"></div>
            <!-- 佔位 -->
          </div>

          <!-- 銀幕指示 -->
          <div class="w-full max-w-lg mb-10">
            <div
              class="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full mb-2 shadow-[0_4px_10px_rgba(255,255,255,0.2)]"
            ></div>
            <p class="text-center text-xs text-gray-400">銀幕 SCREEN</p>
          </div>

          <!-- 座位圖 -->
          <div v-if="loadingSeats" class="py-20">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
          </div>
          <div
            v-else
            class="grid gap-2 mb-8"
            :style="`grid-template-columns: repeat(10, min-content)`"
          >
            <div
              v-for="seat in seats"
              :key="seat.id"
              class="w-6 h-6 sm:w-8 sm:h-8 rounded-t-lg text-[8px] flex items-center justify-center cursor-pointer transition-colors border border-transparent"
              :class="[
                seat.status === 'occupied'
                  ? 'bg-gray-200 dark:bg-gray-800 text-transparent cursor-not-allowed' // 已售出
                  : seat.status === 'selected'
                  ? 'bg-primary-500 text-white shadow-lg scale-110' // 已選
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-primary-400', // 可選
              ]"
              @click="toggleSeat(seat)"
            >
              <!-- 只有選取時顯示座位號 -->
              <span v-if="seat.status === 'selected'">{{ seat.col }}</span>
            </div>
          </div>

          <!-- 圖示說明 -->
          <div class="flex gap-6 text-sm text-gray-500 mb-8">
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 bg-white dark:bg-gray-700 border border-gray-300 rounded-t-sm"
              ></div>
              可選
            </div>
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-t-sm"
              ></div>
              已售
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-primary-500 rounded-t-sm"></div>
              已選
            </div>
          </div>

          <!-- 底部選單 -->
          <div
            class="w-full border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between items-center"
          >
            <div>
              <p class="text-sm text-gray-500">
                已選 {{ selectedSeats.length }} 席
              </p>
              <p class="text-xl font-bold text-primary-600">
                NT$ {{ totalPrice }}
              </p>
            </div>
            <UButton
              size="lg"
              color="primary"
              :disabled="selectedSeats.length === 0"
              @click="currentStep = 3"
            >
              下一步
            </UButton>
          </div>
        </div>

        <!-- STEP 3: 確認與結帳 -->
        <div v-else-if="currentStep === 3" class="max-w-md mx-auto">
          <div class="text-center mb-6">
            <h2 class="text-xl font-bold mb-2">確認訂單資訊</h2>
            <p class="text-gray-500 text-sm">請確認以下資訊無誤</p>
          </div>

          <div
            class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4 mb-8 border border-dashed border-gray-300 dark:border-gray-700 relative overflow-hidden"
          >
            <!-- 票券裝飾圓圈 -->
            <div
              class="absolute -left-3 top-1/2 w-6 h-6 bg-white dark:bg-gray-950 rounded-full"
            ></div>
            <div
              class="absolute -right-3 top-1/2 w-6 h-6 bg-white dark:bg-gray-950 rounded-full"
            ></div>

            <div class="flex justify-between">
              <span class="text-gray-500">電影</span>
              <span class="font-bold">{{ titleOf(movie) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">影城</span>
              <span>{{ selectedShowtime?.theaterName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">時間</span>
              <span class="text-primary-500 font-bold"
                >{{ selectedDate }} {{ selectedShowtime?.time }}</span
              >
            </div>
            <div class="flex justify-between items-start">
              <span class="text-gray-500">座位</span>
              <div class="text-right">
                <span
                  v-for="seat in selectedSeats"
                  :key="seat.id"
                  class="block"
                >
                  {{ getSeatName(seat) }}
                </span>
              </div>
            </div>
            <div
              class="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center"
            >
              <span class="font-bold">總金額</span>
              <span class="text-2xl font-bold text-primary-600"
                >NT$ {{ totalPrice }}</span
              >
            </div>
          </div>

          <div class="flex gap-4">
            <UButton
              block
              color="neutral"
              variant="ghost"
              class="flex-1"
              @click="currentStep = 2"
            >
              重選座位
            </UButton>
            <UButton
              block
              color="primary"
              class="flex-2"
              :loading="isProcessing"
              @click="handleCheckout"
            >
              確認付款
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 1) transparent;
}
</style>
