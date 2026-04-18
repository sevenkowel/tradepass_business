"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => Promise<void> | void;
  trigger: React.ReactNode;
}

export function ConfirmDialog({
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  variant = "default",
  onConfirm,
  trigger,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    default: "bg-[#1E40AF] hover:bg-[#1E3A8A] text-white",
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !loading && setOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                className={variantStyles[variant]}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
