/**
 * 移除演員、劇組等陣列中的重複項目，根據 id 屬性判斷
 */
export function getUniqueItems<T extends { id?: number | string }>(
  list: T[]
): T[] {
  if (!Array.isArray(list)) return [];

  const seen = new Set();
  return list.filter((item) => {
    const duplicate = seen.has(item.id);
    seen.add(item.id);
    return !duplicate;
  });
}

/**
 * 根據分數回傳顏色 Class
 */
export const getRatingColor = (rating: number) => {
  if (rating >= 70) return "text-primary";
  if (rating >= 40) return "text-warning";
  return "text-error";
};
