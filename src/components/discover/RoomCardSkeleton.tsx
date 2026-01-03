"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RoomCardSkeletonProps {
  variant?: "horizontal" | "grid";
}

const RoomCardSkeleton: React.FC<RoomCardSkeletonProps> = ({ variant = "grid" }) => {
  if (variant === "horizontal") {
    return (
      <div className="flex-shrink-0 w-[260px] sm:w-[280px] h-[180px] sm:h-[200px] rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        {/* Image skeleton */}
        <div className="h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 relative animate-shimmer">
          {/* Live badge skeleton */}
          <div className="absolute top-3 left-3">
            <div className="w-16 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
          
          {/* Action buttons skeleton */}
          <div className="absolute top-3 right-3 flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          {/* Content skeleton */}
          <div className="absolute bottom-4 left-4 right-4 space-y-3">
            {/* Title */}
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            
            {/* Host info */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="space-y-1 flex-1">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
              </div>
            </div>

            {/* Participants */}
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800" />
                ))}
              </div>
              <div className="h-6 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm animate-pulse">
      {/* Image skeleton */}
      <div className="h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 relative">
        {/* Live badge skeleton */}
        <div className="absolute top-3 left-3">
          <div className="w-16 h-7 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        
        {/* Action buttons skeleton */}
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Content skeleton */}
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          {/* Title */}
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-4/5" />
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
          
          {/* Host info */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800" />
              ))}
            </div>
            <div className="h-7 w-14 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCardSkeleton;
