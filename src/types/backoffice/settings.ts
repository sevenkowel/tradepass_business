/**
 * 系统设置类型定义
 */

// 用户设置
export interface UserSettings {
  // 界面设置
  theme: 'system' | 'light' | 'dark';
  sidebarCollapsed: boolean;
  tablePageSize: 10 | 20 | 50 | 100;
  
  // 通知设置
  notifications: {
    email: {
      enabled: boolean;
      kyc: boolean;
      risk: boolean;
      withdrawal: boolean;
      announcement: boolean;
    };
    inApp: boolean;
  };
}

// 默认设置
export const defaultUserSettings: UserSettings = {
  theme: 'system',
  sidebarCollapsed: false,
  tablePageSize: 10,
  notifications: {
    email: {
      enabled: true,
      kyc: true,
      risk: true,
      withdrawal: true,
      announcement: true,
    },
    inApp: true,
  },
};

// 界面设置表单
export interface InterfaceSettingsForm {
  theme: 'system' | 'light' | 'dark';
  sidebarCollapsed: boolean;
  tablePageSize: 10 | 20 | 50 | 100;
}

// 通知设置表单
export interface NotificationSettingsForm {
  emailEnabled: boolean;
  emailKyc: boolean;
  emailRisk: boolean;
  emailWithdrawal: boolean;
  emailAnnouncement: boolean;
  inApp: boolean;
}
