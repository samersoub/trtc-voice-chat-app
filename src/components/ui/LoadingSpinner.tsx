"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "white" | "gradient";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "primary",
  text,
  fullScreen = false,
  className,
}) => {
  const spinnerContent = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative">
        {variant === "gradient" ? (
          <div className={cn(
            "rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-1 animate-spin",
            SIZE_CONFIG[size]
          )}>
            <div className="h-full w-full rounded-full bg-white dark:bg-gray-900" />
          </div>
        ) : (
          <Loader2
            className={cn(
              "animate-spin",
              SIZE_CONFIG[size],
              variant === "primary" && "text-blue-600",
              variant === "white" && "text-white"
            )}
          />
        )}
      </div>
      
      {text && (
        <p className={cn(
          "text-sm font-medium animate-pulse",
          variant === "white" ? "text-white" : "text-gray-600 dark:text-gray-400"
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
