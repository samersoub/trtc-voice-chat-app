"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
}) => {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [startY, setStartY] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || window.scrollY > 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  };

  const refreshProgress = Math.min((pullDistance / threshold) * 100, 100);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-50",
          "bg-gradient-to-b from-white/80 to-transparent dark:from-gray-900/80 backdrop-blur-sm"
        )}
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <RefreshCw
            className={cn(
              "h-6 w-6 transition-all duration-300",
              shouldTrigger ? "text-blue-500" : "text-gray-400",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: `rotate(${refreshProgress * 3.6}deg)`,
            }}
          />
          {!isRefreshing && (
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {shouldTrigger ? "اترك للتحديث" : "اسحب للتحديث"}
            </span>
          )}
          {isRefreshing && (
            <span className="text-xs font-medium text-blue-500">جاري التحديث...</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${isRefreshing ? threshold : pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
