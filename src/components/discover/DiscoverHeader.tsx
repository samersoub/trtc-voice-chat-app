"use client";

import React from "react";
import { Search, Home } from "lucide-react";
import { cn } from "@/lib/utils";

type DiscoverHeaderProps = {
  activeTab: "popular" | "following";
  onTabChange: (v: "popular" | "following") => void;
};

const DiscoverHeader: React.FC<DiscoverHeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 py-3 px-2 min-w-0" dir="rtl">
      {/* Left icons */}
      <div className="flex items-center gap-3">
        <button className="h-9 w-9 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center">
          <Search className="h-5 w-5" />
        </button>
        <button className="h-9 w-9 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center">
          <Home className="h-5 w-5" />
        </button>
      </div>

      {/* Right tabs */}
      <div className="flex items-center justify-end gap-3 sm:gap-6 flex-wrap min-w-0">
        {[
          { key: "popular", label: "الشائع" },
          { key: "following", label: "المتابعين" },
        ].map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key as "popular" | "following")}
              className={cn(
                "text-sm font-medium relative pb-1 transition-colors whitespace-nowrap",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t.label}
              {active && (
                <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-10 h-[2px] rounded-full bg-teal-500"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DiscoverHeader;