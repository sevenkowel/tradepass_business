/**
 * 租户认证配置类型与默认值
 * 存储在 TenantConfig.auth JSON 字段中
 */

export interface AuthFormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "password" | "select" | "checkbox" | "date";
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface AuthConfig {
  /** 支持的注册方式 */
  registerMethods: ("email" | "phone")[];
  /** 支持的登录方式 */
  loginMethods: ("email" | "phone")[];
  /** 注册表单字段（动态配置） */
  registerFields: AuthFormField[];
  /** 登录表单字段 */
  loginFields: AuthFormField[];
  /** 注册时是否需要邮箱验证 */
  emailVerificationRequired: boolean;
  /** 注册时是否需要手机验证 */
  phoneVerificationRequired: boolean;
  /** 是否允许跳过验证（开发模式） */
  allowSkipVerification: boolean;
  /** 是否启用 2FA */
  twoFactorEnabled: boolean;
  /** 2FA 类型 */
  twoFactorType: "sms" | "email" | "app";
  /** 注册协议列表 */
  agreements: { id: string; title: string; required: boolean }[];
  /** 密码策略 */
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumber: boolean;
    requireSpecial: boolean;
  };
}

export const defaultAuthConfig: AuthConfig = {
  registerMethods: ["email"],
  loginMethods: ["email"],
  registerFields: [
    { name: "name", label: "姓名", type: "text", required: true, placeholder: "请输入您的姓名" },
    { name: "email", label: "邮箱", type: "email", required: true, placeholder: "your@email.com" },
    { name: "phone", label: "手机号", type: "tel", required: false, placeholder: "+86 138 0000 0000" },
    { name: "password", label: "密码", type: "password", required: true, placeholder: "至少8位字符" },
  ],
  loginFields: [
    { name: "email", label: "邮箱", type: "email", required: true, placeholder: "your@email.com" },
    { name: "password", label: "密码", type: "password", required: true, placeholder: "请输入密码" },
  ],
  emailVerificationRequired: true,
  phoneVerificationRequired: false,
  allowSkipVerification: true,
  twoFactorEnabled: false,
  twoFactorType: "sms",
  agreements: [
    { id: "terms", title: "服务条款", required: true },
    { id: "privacy", title: "隐私政策", required: true },
    { id: "risk", title: "风险披露声明", required: true },
  ],
  passwordPolicy: {
    minLength: 8,
    requireUppercase: false,
    requireNumber: false,
    requireSpecial: false,
  },
};

/**
 * 解析租户的 auth 配置
 */
export function parseAuthConfig(authJson: string | null | undefined): AuthConfig {
  if (!authJson) return defaultAuthConfig;
  try {
    const parsed = JSON.parse(authJson) as Partial<AuthConfig>;
    return { ...defaultAuthConfig, ...parsed };
  } catch {
    return defaultAuthConfig;
  }
}
