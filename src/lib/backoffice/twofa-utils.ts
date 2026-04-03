/**
 * 2FA 工具函数
 * 使用 otplib 实现 TOTP 算法
 */

import {
  generateSecret as generateSecretFn,
  generateSync,
  verifySync,
  generateURI,
} from "otplib";
import QRCode from "qrcode";

// TOTP 配置
const TOTP_CONFIG = {
  step: 30, // 时间窗口 30 秒
  digits: 6, // 6 位数字
  window: 1, // 容错窗口：前后各 1 个时间窗口
};

/**
 * 生成新的 TOTP Secret
 */
export function generateSecret(): string {
  return generateSecretFn();
}

/**
 * 生成 TOTP 验证码（用于测试）
 */
export function generateToken(secret: string): string {
  return generateSync({ secret });
}

/**
 * 验证 TOTP 验证码
 * @param token 用户输入的 6 位验证码
 * @param secret TOTP Secret
 * @returns 是否验证通过
 */
export function verifyToken(token: string, secret: string): boolean {
  try {
    const result = verifySync({ token, secret });
    return result !== null;
  } catch {
    return false;
  }
}

/**
 * 生成二维码 Data URL
 * @param secret TOTP Secret
 * @param username 用户名
 * @param issuer 应用名称
 * @returns QR Code Data URL
 */
export async function generateQRCode(
  secret: string,
  username: string,
  issuer: string = "TradePass"
): Promise<string> {
  const otpauthUrl = generateURI({
    secret,
    label: username,
    issuer,
    algorithm: "sha1",
    digits: 6,
    period: 30,
  });
  return QRCode.toDataURL(otpauthUrl, {
    width: 200,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

/**
 * 格式化 Secret 为易读格式 (XXXX XXXX XXXX XXXX)
 */
export function formatSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") || secret;
}

/**
 * 生成备份码
 * 生成 10 个 12 位数字的备份码，格式：XXXX-XXXX-XXXX
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    // 格式化为 XXXX-XXXX-XXXX
    const formatted = code.match(/.{1,4}/g)?.join("-") || code;
    codes.push(formatted);
  }
  return codes;
}

/**
 * 验证备份码格式
 */
export function isValidBackupCodeFormat(code: string): boolean {
  // 支持 XXXX-XXXX-XXXX 或 XXXXXXXXXXXX 格式
  const clean = code.replace(/-/g, "");
  return /^\d{12}$/.test(clean);
}

/**
 * 标准化备份码（移除连字符）
 */
export function normalizeBackupCode(code: string): string {
  return code.replace(/-/g, "");
}

/**
 * 格式化备份码显示
 */
export function formatBackupCode(code: string): string {
  const clean = normalizeBackupCode(code);
  return clean.match(/.{1,4}/g)?.join("-") || clean;
}

/**
 * 模拟后端：哈希备份码（实际应使用 bcrypt）
 */
export function hashBackupCode(code: string): string {
  // 实际项目中应使用 bcrypt 或 argon2
  // 这里使用简单的哈希模拟
  const clean = normalizeBackupCode(code);
  return `hash_${clean.slice(-4)}_${Date.now()}`;
}

/**
 * 模拟后端：验证备份码哈希
 */
export function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): boolean {
  // 实际项目中应使用 bcrypt.compare
  const clean = normalizeBackupCode(code);
  return hashedCodes.some((hash) => hash.includes(clean.slice(-4)));
}

/**
 * 生成 2FA 设置响应（模拟后端）
 */
export async function mockGenerate2FASetup(
  username: string
): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
  const secret = generateSecret();
  const qrCodeUrl = await generateQRCode(secret, username);
  const backupCodes = generateBackupCodes();

  return {
    secret,
    qrCodeUrl,
    backupCodes,
  };
}
