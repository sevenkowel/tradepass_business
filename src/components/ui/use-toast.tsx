"use client"

import * as React from "react"
import { Toast, ToastProvider, ToastViewport, type ToastProps } from "./toast"

type ToastVariant = "default" | "success" | "error" | "warning" | "info"

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastState extends ToastOptions {
  id: string
  open: boolean
}

interface ToastContextType {
  toast: (options: ToastOptions) => void
  success: (message: string, options?: Omit<ToastOptions, "variant" | "description">) => void
  error: (message: string, options?: Omit<ToastOptions, "variant" | "description">) => void
  warning: (message: string, options?: Omit<ToastOptions, "variant" | "description">) => void
  info: (message: string, options?: Omit<ToastOptions, "variant" | "description">) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = React.useState<ToastState[]>([])

  const toast = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastState = {
      ...options,
      id,
      open: true,
      duration: options.duration || 3000,
    }
    setToasts((prev) => [...prev, newToast])

    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, open: false } : t))
      )
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, newToast.duration)
  }, [])

  const success = React.useCallback(
    (message: string, options?: Omit<ToastOptions, "variant" | "description">) => {
      toast({ ...options, description: message, variant: "success" })
    },
    [toast]
  )

  const error = React.useCallback(
    (message: string, options?: Omit<ToastOptions, "variant" | "description">) => {
      toast({ ...options, description: message, variant: "error" })
    },
    [toast]
  )

  const warning = React.useCallback(
    (message: string, options?: Omit<ToastOptions, "variant" | "description">) => {
      toast({ ...options, description: message, variant: "warning" })
    },
    [toast]
  )

  const info = React.useCallback(
    (message: string, options?: Omit<ToastOptions, "variant" | "description">) => {
      toast({ ...options, description: message, variant: "info" })
    },
    [toast]
  )

  const handleOpenChange = (id: string, open: boolean) => {
    if (!open) {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)))
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      <ToastProvider>
        {children}
        {toasts.map((t) => (
          <Toast
            key={t.id}
            open={t.open}
            onOpenChange={(open) => handleOpenChange(t.id, open)}
            variant={t.variant}
            title={t.title}
            description={t.description}
          />
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastContextProvider")
  }
  return context
}

// Standalone toast function for non-React contexts
let toastInstance: ToastContextType | null = null

export function setToastInstance(instance: ToastContextType) {
  toastInstance = instance
}

export const toast = {
  success: (message: string, options?: Omit<ToastOptions, "variant" | "description">) =>
    toastInstance?.success(message, options),
  error: (message: string, options?: Omit<ToastOptions, "variant" | "description">) =>
    toastInstance?.error(message, options),
  warning: (message: string, options?: Omit<ToastOptions, "variant" | "description">) =>
    toastInstance?.warning(message, options),
  info: (message: string, options?: Omit<ToastOptions, "variant" | "description">) =>
    toastInstance?.info(message, options),
  custom: (options: ToastOptions) => toastInstance?.toast(options),
}
