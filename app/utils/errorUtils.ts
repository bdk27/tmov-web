import { H3Error } from "h3";

const errorMessages: Record<string | number, string> = {
  // HTTP 狀態碼
  400: "請求無效，請檢查您的輸入",
  401: "您尚未登入或憑證已過期，請重新登入",
  404: "很抱歉，找不到此頁面",
  500: "伺服器發生內部錯誤，請稍後再試",
  503: "服務目前無法使用，請稍後再試",

  // 後端自訂錯誤碼
  VALIDATION_FAILED: "您輸入的資料不完整或格式有誤",
  INVALID_PARAMETER: "請求的參數不正確",
  DOWNSTREAM_API_FAILED: "搜尋服務暫時無法使用，請稍後再試",
  INTERNAL_SERVER_ERROR: "系統發生內部錯誤，請聯繫客服",
  FETCH_ERROR: "網路連線失敗，請檢查您的網路",
  DEFAULT: "發生未知錯誤",
};

export function getErrorMessage(error: any): string {
  if (error instanceof H3Error || (error && error.statusCode)) {
    const statusCode = error.statusCode;

    const customErrorCode = error.data?.errorCode;
    if (customErrorCode && errorMessages[customErrorCode]) {
      return errorMessages[customErrorCode];
    }

    if (errorMessages[statusCode]) {
      return errorMessages[statusCode];
    }
  }

  if (error?.message?.includes("Failed to fetch")) {
    return errorMessages["FETCH_ERROR"]!;
  }

  return errorMessages["DEFAULT"]!;
}
