/**
 * 年龄校验工具
 * 根据出生日期计算年龄，并校验是否符合平台要求
 */

export interface AgeValidationResult {
  isValid: boolean;
  age: number;
  message?: string;
}

/**
 * 根据出生日期计算年龄
 * @param dateOfBirth 出生日期 (ISO 8601 格式: YYYY-MM-DD)
 * @returns 年龄（周岁）
 */
export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // 如果今年生日还没到，年龄减1
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * 校验年龄是否符合要求
 * @param dateOfBirth 出生日期
 * @param minAge 最小年龄（默认 18）
 * @param maxAge 最大年龄（默认 60）
 */
export function validateAge(
  dateOfBirth: string,
  minAge: number = 18,
  maxAge: number = 60
): AgeValidationResult {
  const age = calculateAge(dateOfBirth);

  if (age < minAge) {
    return {
      isValid: false,
      age,
      message: "您未满18岁，暂无法完成实名认证",
    };
  }

  if (age > maxAge) {
    return {
      isValid: false,
      age,
      message: "您的年龄不符合平台要求，暂无法完成实名认证",
    };
  }

  return {
    isValid: true,
    age,
  };
}

/**
 * 检查日期格式是否有效
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 格式化日期显示
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
