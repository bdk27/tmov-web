<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { fetchDetail, posterUrl, titleOf } = useTmdb();
const { getDates, getSchedules, generateSeats, createBooking } = useTicket();
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

const selectedTheater = ref("請選擇影城");
const tmovTheaters = ref<Array<{ value: string; label: string }>>([
  { value: "請選擇影城", label: "請選擇影城" },
  { value: "台北信義 TMOV 影城", label: "台北信義 TMOV 影城" },
  { value: "台北松仁 TMOV TITAN", label: "台北松仁 TMOV TITAN" },
  { value: "台北京站 TMOV 影城", label: "台北京站 TMOV 影城" },
  { value: "板橋大遠百 TMOV 影城", label: "板橋大遠百 TMOV 影城" },
  { value: "桃園統領 TMOV 影城", label: "桃園統領 TMOV 影城" },
  { value: "新竹巨城 TMOV 影城", label: "新竹巨城 TMOV 影城" },
  { value: "台中大遠百 TMOV 影城", label: "台中大遠百 TMOV 影城" },
  { value: "台中 TMOV 影城", label: "台中 TMOV 影城" },
  { value: "台南大遠百 TMOV 影城", label: "台南大遠百 TMOV 影城" },
  { value: "台南南紡 TMOV 影城", label: "台南南紡 TMOV 影城" },
  { value: "高雄大遠百 TMOV 影城", label: "高雄大遠百 TMOV 影城" },
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
const selectedDate = ref(dates[0]?.value || ""); // YYYY-MM-DD
const scheduleList = ref<Schedule[]>([]);
const selectedSchedule = ref<Schedule | null>(null);
const loadingSchedules = ref(false);

// 當日期改變時，重新抓取場次
watch(
  selectedDate,
  async (newDate) => {
    if (!newDate) return;
    selectedSchedule.value = null;
    loadingSchedules.value = true;
    try {
      scheduleList.value = await getSchedules(movieId, newDate);
    } finally {
      loadingSchedules.value = false;
    }
  },
  { immediate: true }
);

const typeOrder: Record<string, number> = {
  "Digital-A": 1,
  "Digital-B": 2,
  "3D": 4,
  IMAX: 5,
  GoldClass: 6,
};

interface GroupedTheater {
  name: string;
  types: {
    name: string;
    schedules: Schedule[];
  }[];
}

const groupedSchedules = computed<GroupedTheater[]>(() => {
  if (!scheduleList.value.length) return [];

  // 1. 篩選影城
  let list = scheduleList.value;
  if (selectedTheater.value) {
    list = list.filter((s) => s.hallName.startsWith(selectedTheater.value));
  }

  // 2. 依影城分組
  const theaterMap = new Map<string, Schedule[]>();
  list.forEach((s) => {
    // 從 "台北信義威秀 - A廳" 提取出 "台北信義威秀"
    const hallName = s.hallName.split(" - ")[0] || s.hallName;
    if (!theaterMap.has(hallName)) {
      theaterMap.set(hallName, []);
    }
    theaterMap.get(hallName)?.push(s);
  });

  // 3. 依廳種分組並轉換結構
  const result = [];
  for (const [hallName, schedules] of theaterMap.entries()) {
    // 找到對應的 TMOV 顯示名稱 (如果有的話)
    const theater = tmovTheaters.value.find((t) => t.value === hallName);
    const displayName = theater?.label ?? hallName;

    const typeMap = new Map<string, Schedule[]>();
    schedules.forEach((s) => {
      if (!typeMap.has(s.hallType)) {
        typeMap.set(s.hallType, []);
      }
      typeMap.get(s.hallType)?.push(s);
    });

    // 將 Map 轉為陣列並排序 (例如先 Digital 再 IMAX)
    const types = Array.from(typeMap.entries())
      .map(([typeName, scheds]) => ({
        name: typeName,
        // 時間排序
        schedules: scheds.sort((a, b) => a.showTime.localeCompare(b.showTime)),
      }))
      .sort((a, b) => {
        const scoreA = typeOrder[a.name] ?? 99; // 沒定義的排最後
        const scoreB = typeOrder[b.name] ?? 99;
        return scoreA - scoreB;
      });

    result.push({
      name: displayName,
      types,
    });
  }

  return result;
});

function selectSchedule(schedule: Schedule) {
  selectedSchedule.value = schedule;
  currentStep.value = 2;
  loadSeats();
}

const getTypeColor = (type: string) => {
  if (type.includes("IMAX"))
    return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300";
  if (type.includes("3D"))
    return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300";
  if (type.includes("GoldClass"))
    return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300";
  if (type.includes("Digital"))
    return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300";
  return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
};

// --- Step 2: 座位選擇 ---
const seats = ref<Seat[]>([]);
const selectedSeats = ref<Seat[]>([]);
const loadingSeats = ref(false);

const isAisle = (seat: Seat) => {
  if (!selectedSchedule.value) return false;

  const type = selectedSchedule.value.hallType.toUpperCase();
  if (type.includes("GOLD") || type.includes("CLASS")) return false;

  const col = parseInt(seat.colLabel);
  const total = selectedSchedule.value.colCount;

  const leftAisle = Math.floor(total / 4);
  const rightAisle = total - leftAisle;

  return col === leftAisle || col === rightAisle;
};

const rows = computed(() => {
  const map = new Map<string, Seat[]>();
  seats.value.forEach((seat) => {
    if (!map.has(seat.rowLabel)) {
      map.set(seat.rowLabel, []);
    }
    map.get(seat.rowLabel)?.push(seat);
  });
  return Array.from(map.entries()); // [ ["A", [Seat1, Seat2...]], ["B", [...]] ]
});

// 根據選中的場次生成座位圖
function loadSeats() {
  if (!selectedSchedule.value) return;
  loadingSeats.value = true;

  // 使用後端回傳的 row/col 和 bookedSeats 生成
  seats.value = generateSeats(selectedSchedule.value);

  selectedSeats.value = [];
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

const totalPrice = computed(() => {
  return (selectedSchedule.value?.price || 0) * selectedSeats.value.length;
});

// --- Step 3: 結帳 ---
const isProcessing = ref(false);

async function handleCheckout() {
  if (!authStore.isAuthenticated) {
    toast.add({ title: "請先登入會員", color: "error" });
    router.push("/login");
    return;
  }

  if (!selectedSchedule.value || !movie.value) return;

  isProcessing.value = true;

  try {
    await createBooking({
      tmdbId: movie.value.id,
      movieTitle: titleOf(movie.value),
      posterUrl: movie.value.poster_path,
      cinemaName: selectedSchedule.value.hallName,
      showDate: selectedSchedule.value.showDate,
      showTime: selectedSchedule.value.showTime,
      seats: selectedSeats.value.map((s) => s.id),
      scheduleId: selectedSchedule.value.scheduleId,
    });

    toast.add({
      title: "訂票成功！",
      description: "您的訂單已確認，請至會員中心查看。",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    // 成功後導回首頁或訂單列表
    router.push("/"); // 假設有這個頁面
  } catch (error) {
    toast.add({ title: "訂票失敗", description: "請稍後再試", color: "error" });
  } finally {
    isProcessing.value = false;
  }
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
                ? 'bg-primary-500 border-primary-500 text-white'
                : currentStep === index + 1
                ? 'bg-white dark:bg-gray-900 border-primary-500 text-primary-500'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400',
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
      <UCard class="min-h-[400px]">
        <!-- STEP 1: 選擇場次 -->
        <div v-if="currentStep === 1">
          <h2 class="text-lg font-bold mb-4">選擇日期與場次</h2>

          <!-- 日期 Tabs -->
          <div class="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-6">
            <button
              v-for="date in dates"
              :key="date.value"
              @click="selectedDate = date.value"
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

          <div class="mb-6">
            <USelect
              v-model="selectedTheater"
              :items="tmovTheaters"
              class="w-48"
            />
          </div>

          <!-- 場次列表 -->
          <div v-if="loadingSchedules" class="space-y-4">
            <USkeleton class="h-20 w-full" v-for="i in 3" :key="i" />
          </div>

          <div
            v-else-if="scheduleList.length === 0"
            class="py-12 text-center text-gray-500"
          >
            <UIcon
              name="i-heroicons-calendar"
              class="w-12 h-12 mx-auto mb-2 opacity-30"
            />
            <p>該日期沒有場次</p>
          </div>

          <div v-else class="space-y-6">
            <!-- 影城區塊 -->
            <div
              v-for="theater in groupedSchedules"
              :key="theater.name"
              class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
            >
              <!-- 影城標題 -->
              <div
                class="bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-800"
              >
                <h3
                  class="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2"
                >
                  <UIcon name="i-heroicons-map-pin" class="text-primary-500" />
                  {{ theater.name }}
                </h3>
              </div>

              <!-- 廳種與時間 -->
              <div class="p-5 space-y-5">
                <div
                  v-for="type in theater.types"
                  :key="type.name"
                  class="flex flex-col sm:flex-row sm:items-start gap-4"
                >
                  <!-- 左側：版本標籤 -->
                  <div class="shrink-0 w-24 pt-1">
                    <span
                      class="inline-block px-2 py-1 text-xs font-bold rounded border uppercase tracking-wider text-center w-full"
                      :class="getTypeColor(type.name)"
                    >
                      {{
                        type.name === "Digital-A"
                          ? "數位(A廳)"
                          : type.name === "Digital-B"
                          ? "數位(B廳)"
                          : type.name
                      }}
                    </span>
                  </div>

                  <!-- 右側：時間按鈕 -->
                  <div class="flex flex-wrap gap-3 flex-1">
                    <button
                      v-for="time in type.schedules"
                      :key="time.scheduleId"
                      @click="selectSchedule(time)"
                      class="group relative px-5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center min-w-[5rem]"
                    >
                      <div
                        class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400"
                      >
                        {{ time.showTime.substring(0, 5) }}
                      </div>
                      <div
                        class="text-[10px] text-gray-400 group-hover:text-primary-500/70"
                      >
                        ${{ time.price }}
                      </div>
                    </button>
                  </div>
                </div>
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
              <p class="font-bold">{{ selectedSchedule?.hallName }}</p>
              <p class="text-xs text-gray-500">
                {{ selectedSchedule?.showDate }}
                {{ selectedSchedule?.showTime?.substring(0, 5) }}
              </p>
            </div>
            <div class="w-20"></div>
          </div>

          <div class="w-full max-w-lg mb-10">
            <div
              class="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full mb-2 shadow-[0_4px_10px_rgba(255,255,255,0.2)]"
            ></div>
            <p class="text-center text-xs text-gray-400">銀幕 SCREEN</p>
          </div>

          <!-- 動態計算 Grid Column 數 -->
          <div v-if="loadingSeats" class="py-20">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
          </div>

          <!-- 座位圖容器，改為 Flex 直列顯示每一排 -->
          <div v-else class="w-full overflow-x-auto pb-6 mb-6 custom-scrollbar">
            <div class="w-fit mx-auto flex flex-col gap-2">
              <!-- 迴圈渲染每一排 -->
              <div
                v-for="(entry, rowIndex) in rows"
                :key="entry[0]"
                class="flex items-center gap-3"
              >
                <!-- 左側：排號 (A, B, C...) -->
                <div
                  class="w-4 sm:w-6 text-center text-xs font-bold text-gray-400 shrink-0"
                >
                  {{ entry[0] }}
                </div>

                <!-- 座位：Flex 排列 -->
                <div class="flex gap-1">
                  <div
                    v-for="seat in entry[1]"
                    :key="seat.id"
                    class="w-4 h-4 md:w-6 md:h-6 rounded-t-sm md:rounded-t-lg text-[8px] md:text-[10px] flex items-center justify-center cursor-pointer transition-colors border shrink-0"
                    :class="[
                      // 座位樣式與圖示一致
                      seat.status === 'occupied'
                        ? 'bg-gray-400 border-transparent dark:bg-gray-700 text-transparent cursor-not-allowed' // 已售: 深灰
                        : seat.status === 'selected'
                        ? 'bg-primary-500 border-primary-500 text-white shadow-lg scale-110' // 已選
                        : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-500 hover:border-primary-500 hover:text-primary-500', // 可選: 白底+淺灰框

                      // 走道 margin
                      isAisle(seat) ? 'mr-4 md:mr-8' : '',
                    ]"
                    @click="toggleSeat(seat)"
                  >
                    <span
                      v-if="seat.status === 'selected'"
                      class="scale-75 md:scale-100"
                      >{{ seat.colLabel }}</span
                    >
                  </div>
                </div>

                <!-- 右側：排號 (可選，對稱顯示) -->
                <div
                  class="w-4 sm:w-6 text-center text-xs font-bold text-gray-400 shrink-0"
                >
                  {{ entry[0] }}
                </div>
              </div>
            </div>
          </div>

          <!-- 圖示說明 -->
          <div
            class="flex gap-6 text-sm text-gray-600 dark:text-gray-400 mb-8 font-medium"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-500 rounded-t-sm"
              ></div>
              可選
            </div>
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 bg-gray-400 border border-transparent dark:bg-gray-700 rounded-t-sm"
              ></div>
              已售
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-primary-500 rounded-t-sm"></div>
              已選
            </div>
          </div>

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
              <span>{{ selectedSchedule?.hallName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">時間</span>
              <span class="text-primary-500 font-bold">
                {{ selectedDate }}
                {{ selectedSchedule?.showTime.substring(0, 5) }}
              </span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-gray-500">座位</span>
              <div class="text-right">
                <span
                  v-for="seat in selectedSeats"
                  :key="seat.id"
                  class="block"
                >
                  {{ seat.id }}
                  <!-- 顯示 A1, A2 -->
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
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 4px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #444;
}
</style>
