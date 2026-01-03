"use client";

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick?: () => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  label = "إنشاء غرفة",
  icon = <Plus className="h-6 w-6" />,
  className,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "fixed bottom-24 left-6 z-40",
        "flex items-center gap-2 px-4 py-3 rounded-full",
        "bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600",
        "text-white font-semibold shadow-xl hover:shadow-2xl",
        "transition-all duration-300 ease-out",
        "hover:scale-110 active:scale-95",
        "group",
        className
      )}
      style={{
        boxShadow: "0 8px 32px rgba(59, 130, 246, 0.4), 0 4px 16px rgba(139, 92, 246, 0.3)",
      }}
      dir="rtl"
    >
      <span className="text-white transform transition-transform group-hover:rotate-90 duration-300">
        {icon}
      </span>
      <span
        className={cn(
          "overflow-hidden transition-all duration-300 whitespace-nowrap",
          isExpanded ? "max-w-xs opacity-100" : "max-w-0 opacity-0"
        )}
      >
        {label}
      </span>
      
      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 animate-ping" />
    </button>
  );
};

export default FloatingActionButton;
