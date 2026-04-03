/**
 * 证件有效期校验工具
 */

export interface ExpiryValidationResult {
  isValid: boolean;
  monthsRemaining: number;
  message?: string;
}

/**
 * 计算距离过期日期的剩余月数
 * @param expiryDate 过期日期 (ISO 8601 格式: YYYY-MM-DD)
 * @returns 剩余月数
 */
export function calculateMonthsUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const today = new Date();

  // 计算年份和月份差异
  let months =
    (expiry.getFullYear() - today.getFullYear()) * 12 +
    (expiry.getMonth() - today.getMonth());

  // 如果过期日期的天数小于今天，减去一个月
  if (expiry.getDate() < today.getDate()) {
    months--;
  }

  return months;
}

/**
 * 校验证件有效期是否满足要求
 * @param expiryDate 过期日期
 * @param minMonths 最少剩余月数（默认 3 个月）
 */
export function validateExpiry(
  expiryDate: string,
  minMonths: number = 3
): ExpiryValidationResult {
  const monthsRemaining = calculateMonthsUntilExpiry(expiryDate);

  if (monthsRemaining < minMonths) {
    return {
      isValid: false,
      monthsRemaining,
      message:
        "您的护照有效期不足3个月，请更换有效证件后再试",
    };
  }

  return {
    isValid: true,
    monthsRemaining,
  };
}

/**
 * 检查证件是否已过期
 */
export function isExpired(expiryDate: string): boolean {
  const expiry = new Date(expiryDate);
  const today = new Date();
  return expiry < today;
}

/**
 * 获取有效期状态描述
 */
export function getExpiryStatus(
  expiryDate: string
): "valid" | "expiring_soon" | "expired" {
  if (isExpired(expiryDate)) {
    return "expired";
  }

  const monthsRemaining = calculateMonthsUntilExpiry(expiryDate);
  if (monthsRemaining < 3) {
    return "expiring_soon";
  }

  return "valid";
}
