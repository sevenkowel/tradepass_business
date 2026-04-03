"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={[
      "peer h-4 w-4 shrink-0 rounded-[4px] border-2 border-slate-300 bg-white",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tp-primary)] focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-[var(--tp-primary)] data-[state=checked]:border-[var(--tp-primary)]",
      "hover:border-slate-400",
      "data-[state=checked]:hover:bg-[var(--tp-primary)]/90",
      "transition-all duration-150 ease-in-out",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={[
        "flex items-center justify-center h-full w-full",
        "data-[state=checked]:animate-in data-[state=checked]:fade-in data-[state=checked]:zoom-in-50",
        "data-[state=unchecked]:animate-out data-[state=unchecked]:fade-out data-[state=unchecked]:zoom-out-50",
      ].join(" ")}
    >
      <Check className="h-3 w-3 stroke-[3] text-white" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
