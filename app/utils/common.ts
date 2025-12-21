/**
 * 防抖函式 (Debounce)
 * 用於搜尋輸入框，避免每打一個字就發一次請求
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 睡眠/延遲 (用於模擬 loading 或動畫等待)
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
