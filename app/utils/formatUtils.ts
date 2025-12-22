/**
 * 格式化金額 (e.g. 1000000 => $1,000,000)
 */
export const formatCurrency = (amount?: number) => {
  if (!amount) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * 格式化時間 (e.g. 90 => 1h 30m)
 */
export const formatRuntime = (minutes?: number) => {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/**
 * 取得年份 (e.g. "2023-12-25" => "2023")
 */
export const getYear = (dateStr?: string) => {
  return dateStr ? dateStr.split("-")[0] : "";
};

/**
 * 數字取小數點第一位 (e.g. 7.823 => 7.8)
 */
export const formatRating = (val?: number) => {
  if (!val) return "0.0";
  return val.toFixed(1);
};
