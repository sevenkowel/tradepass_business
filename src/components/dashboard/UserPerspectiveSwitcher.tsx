"use client";

import { useState } from "react";
import { UserPerspective } from "@/types/user";
import { USER_PERSPECTIVES, getCurrentPerspective } from "@/lib/user-perspectives";
import { Check, ChevronDown } from "lucide-react";

interface UserPerspectiveSwitcherProps {
  onChange?: (perspective: UserPerspective) => void;
}

export function UserPerspectiveSwitcher({ onChange }: UserPerspectiveSwitcherProps) {
  const [current, setCurrent] = useState<UserPerspective>(getCurrentPerspective());
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (perspective: UserPerspective) => {
    setCurrent(perspective);
    setIsOpen(false);
    onChange?.(perspective);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <span>视角: {current.name}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
              切换用户视角
            </div>
            {USER_PERSPECTIVES.map((perspective) => (
              <button
                key={perspective.id}
                onClick={() => handleSelect(perspective)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>{perspective.name}</span>
                {current.id === perspective.id && (
                  <Check size={14} className="text-gray-900" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
