// 對應後端 Scheduleresponseponse DTO
export interface Schedule {
  scheduleId: number;
  tmdbId: number;
  movieTitle: string;
  hallName: string;
  hallType: string;
  showDate: string;
  showTime: string;
  price: number;
  rowCount: number;
  colCount: number;
  bookedSeats: string[]; // e.g. ["A1", "B5"]
}

// 前端座位物件 (用於 UI 顯示)
export interface Seat {
  id: string; // "A-1"
  rowLabel: string; // "A"
  colLabel: string; // "1"
  status: "available" | "occupied" | "selected";
  type: "standard" | "wheelchair";
}

// 對應後端 BookingRequest DTO
export interface BookingRequest {
  tmdbId: number;
  movieTitle: string;
  posterUrl: string;
  cinemaName: string;
  showDate: string;
  showTime: string;
  seats: string[]; // ["A1", "A2"]
  scheduleId: number;
  totalPrice: number;
}

export function useTicket() {
  const authStore = useAuthStore();
  const toast = useToast();

  function getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authStore.token}`,
    };
  }

  // 1. 產生日期選項
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      // 格式化為 YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const date = String(d.getDate()).padStart(2, "0");
      const day = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"][
        d.getDay()
      ];

      dates.push({
        value: `${year}-${month}-${date}`,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        day: day,
      });
    }
    return dates;
  };

  // 2. 取得場次 (Call Backend)
  const getSchedules = async (
    tmdbId: number,
    date: string
  ): Promise<Schedule[]> => {
    try {
      // GET /api/theater/schedules?tmdbId=550&date=2024-01-01
      const data = await $fetch<Schedule[]>(`/api/theater/schedules`, {
        method: "GET",
        params: {
          tmdbId,
          date,
        },
      });

      return data;
    } catch (e) {
      console.error("Fetch schedules error", e);
      return [];
    }
  };

  // 3. 產生座位圖 (根據 Schedule 的 row/col 和 bookedSeats)
  const generateSeats = (schedule: Schedule): Seat[] => {
    const seats: Seat[] = [];
    const bookedSet = new Set(schedule.bookedSeats); // 轉 Set 提升查找效能

    for (let r = 1; r <= schedule.rowCount; r++) {
      const rowLabel = String.fromCharCode(64 + r); // 1->A, 2->B

      for (let c = 1; c <= schedule.colCount; c++) {
        const colLabel = String(c);
        const seatCode = `${rowLabel}${colLabel}`; // "A3"

        // 判斷是否已售出
        const isOccupied = bookedSet.has(seatCode);

        seats.push({
          id: seatCode,
          rowLabel,
          colLabel,
          status: isOccupied ? "occupied" : "available",
          type: "standard",
        });
      }
    }
    return seats;
  };

  // 4. 送出訂單 (Call Backend)
  // 假設後端有一個 BookingController 對應 /api/bookings
  const createBooking = async (payload: BookingRequest) => {
    if (!authStore.isAuthenticated) {
      toast.add({ title: "請先登入", color: "error" });
      throw new Error("Unauthorized");
    }

    try {
      const res = await $fetch(`/api/bookings`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: payload,
      });

      return res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const groupSchedulesByHall = (schedules: Schedule[]) => {
    const grouped: Record<string, Schedule[]> = {};

    schedules.forEach((s) => {
      const type = s.hallType || "一般廳";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(s);
    });

    // 每個群組內依照時間排序
    Object.keys(grouped).forEach((key) => {
      grouped[key]?.sort((a, b) => a.showTime.localeCompare(b.showTime));
    });

    return grouped;
  };

  return {
    getDates,
    getSchedules,
    generateSeats,
    createBooking,
    groupSchedulesByHall,
  };
}
