"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentPreviewProps {
  frontImage: string;
  backImage?: string | null;
  documentType: string;
}

// 确保图片 URL 是有效的 data URL 或 http URL
function normalizeImageUrl(url: string): string {
  if (!url) return "";
  // 如果已经是完整 URL 或 data URL，直接返回
  if (url.startsWith("http") || url.startsWith("data:")) {
    return url;
  }
  // 如果是纯 base64，添加 data URL 前缀
  if (url.length > 100 && /^[A-Za-z0-9+/=]+$/.test(url.slice(0, 100))) {
    return `data:image/jpeg;base64,${url}`;
  }
  return url;
}

export function DocumentPreview({
  frontImage,
  backImage,
  documentType,
}: DocumentPreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"front" | "back">("front");

  const hasBack = !!backImage;

  // 规范化图片 URL
  const normalizedFrontImage = useMemo(() => normalizeImageUrl(frontImage), [frontImage]);
  const normalizedBackImage = useMemo(() => backImage ? normalizeImageUrl(backImage) : null, [backImage]);

  return (
    <>
      {/* 缩略图预览 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">
            证件预览
          </h4>
          <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">
            点击放大查看
          </span>
        </div>

        <div className="flex gap-3">
          {/* 正面 */}
          <div
            onClick={() => {
              setCurrentView("front");
              setIsModalOpen(true);
            }}
            className={cn(
              "relative flex-1 aspect-[3/2] rounded-xl overflow-hidden cursor-pointer group",
              "border-2 border-dashed border-[rgba(var(--tp-fg-rgb),0.15)]",
              "hover:border-[rgb(var(--tp-accent-rgb))] transition-colors"
            )}
          >
            <img
              src={normalizedFrontImage}
              alt="Document Front"
              className="w-full h-full object-contain bg-[rgba(var(--tp-fg-rgb),0.03)]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-xs">
              正面
            </div>
          </div>

          {/* 背面 */}
          {hasBack && normalizedBackImage && (
            <div
              onClick={() => {
                setCurrentView("back");
                setIsModalOpen(true);
              }}
              className={cn(
                "relative flex-1 aspect-[3/2] rounded-xl overflow-hidden cursor-pointer group",
                "border-2 border-dashed border-[rgba(var(--tp-fg-rgb),0.15)]",
                "hover:border-[rgb(var(--tp-accent-rgb))] transition-colors"
              )}
            >
              <img
                src={normalizedBackImage}
                alt="Document Back"
                className="w-full h-full object-contain bg-[rgba(var(--tp-fg-rgb),0.03)]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-xs">
                背面
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 大图模态框 */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setIsModalOpen(false)}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 切换按钮 */}
            {hasBack && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView("front");
                  }}
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
                    currentView === "front"
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  )}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView("back");
                  }}
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors",
                    currentView === "back"
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  )}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* 图片 */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentView === "front" ? normalizedFrontImage : normalizedBackImage || ""}
                alt={currentView === "front" ? "Document Front" : "Document Back"}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 text-white text-sm">
                {currentView === "front" ? "正面" : "背面"} - 点击空白处关闭
              </div>
            </motion.div>

            {/* 底部指示器 */}
            {hasBack && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView("front");
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    currentView === "front" ? "bg-white" : "bg-white/40"
                  )}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView("back");
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    currentView === "back" ? "bg-white" : "bg-white/40"
                  )}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
