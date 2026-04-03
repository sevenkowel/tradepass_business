"use client";

/**
 * 开发者配置 Context
 * 用于开发环境切换视角、主题、布局等
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserPerspective } from "@/types/user";
import { USER_PERSPECTIVES, getUserPerspective, getCurrentPerspective } from "./user-perspectives";

// 存储键
const STORAGE_KEY = "tradepass_dev_config";
const POSITION_KEY = "tradepass_dev_toolbox_position";

// 开发者配置状态
interface DevConfigState {
  currentPerspective: UserPerspective;
  toolboxOpen: boolean;
  toolboxPosition: { x: number; y: number };
}

// Context 类型
interface DevConfigContextType extends DevConfigState {
  // 视角切换
  setPerspective: (id: string) => void;
  perspectives: UserPerspective[];
  
  // 工具箱控制
  setToolboxOpen: (open: boolean) => void;
  toggleToolbox: () => void;
  setToolboxPosition: (position: { x: number; y: number }) => void;
  resetToolboxPosition: () => void;
}

// 默认位置（右下角）
const DEFAULT_POSITION = { x: -20, y: -100 };

// 创建 Context
const DevConfigContext = createContext<DevConfigContextType | null>(null);

// Provider 组件
export function DevConfigProvider({ children }: { children: React.ReactNode }) {
  // 从 localStorage 恢复状态
  const [state, setState] = useState<DevConfigState>(() => {
    if (typeof window === "undefined") {
      return {
        currentPerspective: getCurrentPerspective(),
        toolboxOpen: false,
        toolboxPosition: DEFAULT_POSITION,
      };
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedPosition = localStorage.getItem(POSITION_KEY);
      
      const parsed = saved ? JSON.parse(saved) : {};
      const parsedPosition = savedPosition ? JSON.parse(savedPosition) : DEFAULT_POSITION;
      
      return {
        currentPerspective: parsed.currentPerspectiveId 
          ? getUserPerspective(parsed.currentPerspectiveId)
          : getCurrentPerspective(),
        toolboxOpen: parsed.toolboxOpen ?? false,
        toolboxPosition: parsedPosition,
      };
    } catch {
      return {
        currentPerspective: getCurrentPerspective(),
        toolboxOpen: false,
        toolboxPosition: DEFAULT_POSITION,
      };
    }
  });

  // 保存状态到 localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const toSave = {
      currentPerspectiveId: state.currentPerspective.id,
      toolboxOpen: state.toolboxOpen,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    localStorage.setItem(POSITION_KEY, JSON.stringify(state.toolboxPosition));
  }, [state.currentPerspective.id, state.toolboxOpen, state.toolboxPosition]);

  // 设置视角
  const setPerspective = useCallback((id: string) => {
    const perspective = getUserPerspective(id);
    setState(prev => ({ ...prev, currentPerspective: perspective }));
  }, []);

  // 设置工具箱展开状态
  const setToolboxOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, toolboxOpen: open }));
  }, []);

  // 切换工具箱展开状态
  const toggleToolbox = useCallback(() => {
    setState(prev => ({ ...prev, toolboxOpen: !prev.toolboxOpen }));
  }, []);

  // 设置工具箱位置
  const setToolboxPosition = useCallback((position: { x: number; y: number }) => {
    setState(prev => ({ ...prev, toolboxPosition: position }));
  }, []);

  // 重置工具箱位置
  const resetToolboxPosition = useCallback(() => {
    setState(prev => ({ ...prev, toolboxPosition: DEFAULT_POSITION }));
  }, []);

  const value: DevConfigContextType = {
    ...state,
    setPerspective,
    perspectives: USER_PERSPECTIVES,
    setToolboxOpen,
    toggleToolbox,
    setToolboxPosition,
    resetToolboxPosition,
  };

  return (
    <DevConfigContext.Provider value={value}>
      {children}
    </DevConfigContext.Provider>
  );
}

// Hook
export function useDevConfig() {
  const context = useContext(DevConfigContext);
  if (!context) {
    throw new Error("useDevConfig must be used within DevConfigProvider");
  }
  return context;
}

// 判断是否在开发环境
export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}
