/**
 * 系统设置 Mock API
 */

import type { UserSettings } from "@/types/backoffice/settings";
import { defaultUserSettings } from "@/types/backoffice/settings";

// 模拟存储的用户设置（内存存储）
let userSettings: UserSettings = { ...defaultUserSettings };

// 模拟延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API 方法
export const settingsApi = {
  // 获取用户设置
  getSettings: async (): Promise<UserSettings> => {
    await delay(400);
    // 同时从 localStorage 读取（如果有）
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userSettings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          userSettings = { ...defaultUserSettings, ...parsed };
        } catch {
          // 解析失败使用默认值
        }
      }
    }
    return { ...userSettings };
  },

  // 更新用户设置
  updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    await delay(600);
    userSettings = { ...userSettings, ...settings };
    
    // 保存到 localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("userSettings", JSON.stringify(userSettings));
    }
    
    return { ...userSettings };
  },

  // 重置为默认设置
  resetSettings: async (): Promise<UserSettings> => {
    await delay(500);
    userSettings = { ...defaultUserSettings };
    
    // 清除 localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("userSettings");
    }
    
    return { ...userSettings };
  },

  // 更新界面设置
  updateInterfaceSettings: async (interfaceSettings: {
    theme?: UserSettings["theme"];
    sidebarCollapsed?: boolean;
    tablePageSize?: UserSettings["tablePageSize"];
  }): Promise<UserSettings> => {
    await delay(500);
    userSettings = {
      ...userSettings,
      ...interfaceSettings,
    };
    
    if (typeof window !== "undefined") {
      localStorage.setItem("userSettings", JSON.stringify(userSettings));
    }
    
    return { ...userSettings };
  },

  // 更新通知设置
  updateNotificationSettings: async (notificationSettings: UserSettings["notifications"]): Promise<UserSettings> => {
    await delay(500);
    userSettings = {
      ...userSettings,
      notifications: notificationSettings,
    };
    
    if (typeof window !== "undefined") {
      localStorage.setItem("userSettings", JSON.stringify(userSettings));
    }
    
    return { ...userSettings };
  },
};

// 从 localStorage 初始化设置（客户端）
export const initSettingsFromStorage = (): UserSettings => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("userSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        userSettings = { ...defaultUserSettings, ...parsed };
      } catch {
        // 解析失败使用默认值
      }
    }
  }
  return userSettings;
};
