"use client";

import { cn } from "@/lib/utils";

interface ConsolePageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-full",
};

/**
 * Console 页面统一容器
 * 确保所有页面内容居中显示，保持一致的布局规范
 */
export function ConsolePageContainer({
  children,
  className,
  maxWidth = "xl",
}: ConsolePageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * 页面标题区域
 */
export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

/**
 * 面包屑导航
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-blue-600 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
