/**
 * 字符串相似度计算 - Levenshtein Distance (编辑距离)
 * 用于校验用户修改的姓名与 OCR 识别结果的一致性
 */

/**
 * 计算两个字符串的 Levenshtein Distance
 * 时间复杂度: O(n*m), 空间复杂度: O(min(n,m))
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toUpperCase().trim();
  const s2 = str2.toUpperCase().trim();

  // 边界情况
  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  // 确保 s1 是较短的字符串，优化空间复杂度
  const [shorter, longer] = s1.length < s2.length ? [s1, s2] : [s2, s1];
  const m = shorter.length;
  const n = longer.length;

  // 只使用两行来存储中间结果
  let previousRow = new Array(m + 1).fill(0);
  let currentRow = new Array(m + 1).fill(0);

  // 初始化第一行
  for (let j = 0; j <= m; j++) {
    previousRow[j] = j;
  }

  // 填充矩阵
  for (let i = 1; i <= n; i++) {
    currentRow[0] = i;

    for (let j = 1; j <= m; j++) {
      const cost = longer[i - 1] === shorter[j - 1] ? 0 : 1;

      currentRow[j] = Math.min(
        previousRow[j] + 1, // 删除
        currentRow[j - 1] + 1, // 插入
        previousRow[j - 1] + cost // 替换
      );
    }

    // 交换行
    [previousRow, currentRow] = [currentRow, previousRow];
  }

  return previousRow[m];
}

/**
 * 计算字符串相似度 (0-1)
 * 1 表示完全相同，0 表示完全不同
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const s1 = str1.trim();
  const s2 = str2.trim();

  if (s1 === s2) return 1;

  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1;

  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLength;
}

/**
 * 检查姓名是否通过相似度校验
 * @param ocrName OCR 识别的姓名
 * @param userName 用户输入的姓名
 * @param threshold 相似度阈值 (默认 0.8)
 */
export function validateNameSimilarity(
  ocrName: string,
  userName: string,
  threshold: number = 0.8
): {
  isValid: boolean;
  similarity: number;
  message?: string;
} {
  const similarity = calculateSimilarity(ocrName, userName);
  const isValid = similarity >= threshold;

  return {
    isValid,
    similarity,
    message: isValid
      ? undefined
      : "您填写的姓名与证件不一致，请确保与证件完全一致",
  };
}

/**
 * 预处理姓名（移除常见 OCR 错误字符）
 * 例如: 数字0和字母O混淆，数字1和字母I/l混淆
 */
export function normalizeName(name: string): string {
  return (
    name
      .toUpperCase()
      .trim()
      // 常见 OCR 错误替换
      .replace(/0/g, "O") // 数字0 -> 字母O
      .replace(/1/g, "I") // 数字1 -> 字母I
      .replace(/5/g, "S") // 数字5 -> 字母S
      .replace(/8/g, "B") // 数字8 -> 字母B
      // 移除多余空格
      .replace(/\s+/g, " ")
  );
}

/**
 * 使用归一化后的姓名计算相似度
 */
export function calculateNormalizedSimilarity(
  str1: string,
  str2: string
): number {
  return calculateSimilarity(normalizeName(str1), normalizeName(str2));
}
