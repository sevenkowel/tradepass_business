"use client";

/**
 * 悬浮开发工具箱
 * 仅在开发环境显示，支持拖拽、展开收起、位置记忆
 */

import { useState, useRef, useEffect } from "react";
import { motion, useDragControls, PanInfo } from "framer-motion";
import { 
  Wrench, 
  X, 
  GripHorizontal,
  Eye,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useDevConfig } from "@/lib/dev-config";
import { PerspectiveSwitcher } from "./PerspectiveSwitcher";
import { KYCDevPanel } from "./KYCDevPanel";
import { cn } from "@/lib/utils";

// 工具定义
interface DevTool {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.FC;
}

// 可用工具列表
const DEV_TOOLS: DevTool[] = [
  {
    id: "perspective",
    name: "视角切换",
    icon: Eye,
    component: PerspectiveSwitcher,
  },
  {
    id: "kyc-control",
    name: "KYC 控制",
    icon: ShieldCheck,
    component: KYCDevPanel,
  },
];

export function FloatingDevToolbox() {
  const { 
    toolboxOpen, 
    toggleToolbox, 
    setToolboxOpen,
    toolboxPosition, 
    setToolboxPosition,
    resetToolboxPosition,
  } = useDevConfig();
  
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // 获取当前激活的工具
  const activeTool = DEV_TOOLS.find(t => t.id === activeToolId);
  const ActiveToolComponent = activeTool?.component;

  // 处理拖拽结束，保存位置
  const handleDragEnd = () => {
    setIsDragging(false);
    
    if (!containerRef.current || typeof window === "undefined") return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 计算相对于视口右下角的位置
    const x = rect.right - viewportWidth;
    const y = rect.bottom - viewportHeight;
    
    setToolboxPosition({ x, y });
  };

  // 处理工具选择
  const handleToolSelect = (toolId: string) => {
    setActiveToolId(toolId);
  };

  // 返回工具列表
  const handleBack = () => {
    setActiveToolId(null);
  };

  // 计算初始位置（仅在客户端）
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setInitialPosition({
        x: Math.max(0, window.innerWidth + toolboxPosition.x - 280),
        y: Math.max(0, window.innerHeight + toolboxPosition.y - (toolboxOpen ? 400 : 60)),
      });
    }
  }, [toolboxPosition.x, toolboxPosition.y, toolboxOpen]);

  // 避免 SSR hydration 不匹配
  if (!mounted) return null;

  return (
    <motion.div
      ref={containerRef}
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      initial={{ x: initialPosition.x, y: initialPosition.y }}
      animate={{ 
        x: toolboxOpen ? undefined : initialPosition.x,
        y: toolboxOpen ? undefined : initialPosition.y,
      }}
      className={cn(
        "fixed z-[9999] select-none",
        isDragging && "cursor-grabbing",
        !isDragging && toolboxOpen && "cursor-default",
        !isDragging && !toolboxOpen && "cursor-grab"
      )}
      style={{ touchAction: "none" }}
    >
      {/* 收起状态 - 悬浮球 */}
      {!toolboxOpen && (
        <motion.button
          onClick={toggleToolbox}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full shadow-lg",
            "bg-gray-900 text-white hover:bg-gray-800",
            "transition-colors duration-200"
          )}
          title="开发工具箱"
        >
          <Wrench size={20} />
        </motion.button>
      )}

      {/* 展开状态 - 工具箱面板 */}
      {toolboxOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden",
            "w-72"
          )}
        >
          {/* 拖拽手柄 */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className={cn(
              "flex items-center justify-center h-6 bg-gray-50 border-b border-gray-100",
              "cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors"
            )}
          >
            <GripHorizontal size={16} className="text-gray-400" />
          </div>

          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {activeTool ? (
                <>
                  <button
                    onClick={handleBack}
                    className="p-1 -ml-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight size={16} className="rotate-180 text-gray-500" />
                  </button>
                  <span className="text-sm font-medium text-gray-900">{activeTool.name}</span>
                </>
              ) : (
                <>
                  <Wrench size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">开发工具箱</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!activeTool && (
                <button
                  onClick={resetToolboxPosition}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  title="重置位置"
                >
                  <span className="text-xs text-gray-500">复位</span>
                </button>
              )}
              <button
                onClick={() => setToolboxOpen(false)}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                title="收起"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* 内容区 */}
          <div className="p-4">
            {activeTool && ActiveToolComponent ? (
              <ActiveToolComponent />
            ) : (
              <div className="space-y-2">
                {DEV_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                      "text-left text-sm text-gray-700",
                      "hover:bg-gray-50 transition-colors",
                      "border border-transparent hover:border-gray-100"
                    )}
                  >
                    <tool.icon size={18} className="text-gray-500" />
                    <span className="flex-1">{tool.name}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              拖拽顶部手柄移动位置
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
