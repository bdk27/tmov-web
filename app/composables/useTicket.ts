export interface Showtime {
  id: string;
  theaterName: string;
  time: string;
  type: string; // 數位, IMAX
  price: number;
  region: string;
}

export interface Seat {
  id: string;
  row: number;
  col: number;
  status: "available" | "occupied" | "selected";
  type: "standard" | "wheelchair";
}

export function useTicket() {
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        value: d.toISOString().split("T")[0],
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        day: ["週日", "週一", "週二", "週三", "週四", "週五", "週六"][
          d.getDay()
        ],
      });
    }
    return dates;
  };

  // 不同地區的戲院
  const getShowtimes = async (region: string) => {
    const allShowtimes: Showtime[] = [
      // 台北
      {
        id: "tp1",
        theaterName: "台北信義威秀影城",
        time: "10:30",
        type: "數位 2D",
        price: 330,
        region: "taipei",
      },
      {
        id: "tp2",
        theaterName: "台北信義威秀影城",
        time: "13:40",
        type: "IMAX 3D",
        price: 460,
        region: "taipei",
      },
      {
        id: "tp3",
        theaterName: "台北松仁威秀影城",
        time: "15:20",
        type: "TITAN",
        price: 500,
        region: "taipei",
      },
      // 新北
      {
        id: "nt1",
        theaterName: "板橋大遠百威秀影城",
        time: "11:00",
        type: "數位 2D",
        price: 310,
        region: "new-taipei",
      },
      {
        id: "nt2",
        theaterName: "板橋大遠百威秀影城",
        time: "14:20",
        type: "IMAX",
        price: 440,
        region: "new-taipei",
      },
      // 桃園
      {
        id: "ty1",
        theaterName: "桃園統領威秀影城",
        time: "12:00",
        type: "數位 2D",
        price: 300,
        region: "taoyuan",
      },
      // 新竹
      {
        id: "hc1",
        theaterName: "新竹巨城威秀影城",
        time: "16:30",
        type: "IMAX",
        price: 420,
        region: "hsinchu",
      },
      // 台中
      {
        id: "tc1",
        theaterName: "台中大遠百威秀影城",
        time: "10:00",
        type: "IMAX",
        price: 410,
        region: "taichung",
      },
      {
        id: "tc2",
        theaterName: "台中大遠百威秀影城",
        time: "14:30",
        type: "數位 2D",
        price: 290,
        region: "taichung",
      },
      // 台南
      {
        id: "tn1",
        theaterName: "台南南紡威秀影城",
        time: "11:30",
        type: "IMAX",
        price: 400,
        region: "tainan",
      },
      // 高雄
      {
        id: "ks1",
        theaterName: "高雄大遠百威秀影城",
        time: "13:00",
        type: "數位 2D",
        price: 280,
        region: "kaohsiung",
      },
      {
        id: "ks2",
        theaterName: "高雄大遠百威秀影城",
        time: "16:40",
        type: "4DX",
        price: 500,
        region: "kaohsiung",
      },
    ];

    if (!region) return [];

    // 過濾出符合地區的場次
    return allShowtimes.filter((s) => s.region === region);
  };

  // 3. 模擬產生座位圖 (8列 x 10行)
  const getSeats = async (showtimeId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const rows = 8;
    const cols = 10;
    const seats: Seat[] = [];

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        // 隨機產生一些已售出的座位
        const isOccupied = Math.random() < 0.2;
        seats.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          status: isOccupied ? "occupied" : "available",
          type: "standard",
        });
      }
    }
    return seats;
  };

  return {
    getDates,
    getShowtimes,
    getSeats,
  };
}
