"use client";

import React from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const tags = ["الجميع", "الأردن", "سوريا", "مصر", "العراق", "السعودية", "المغرب", "الجزائر", "تونس", "ليبيا", "لبنان", "فلسطين"];

type Props = {
  selected: string;
  onChange: (tag: string) => void;
};

const FilterTagsBar: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <div className="flex items-center gap-2" dir="rtl">
      <button className="h-9 px-3 rounded-full border bg-background text-foreground flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">فلترة</span>
      </button>
      <div className="flex-1 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max pr-2">
          {tags.map((t) => {
            const active = selected === t;
            return (
              <button
                key={t}
                onClick={() => onChange(t)}
                className={cn(
                  "px-3 h-9 rounded-full text-sm border transition-colors",
                  active ? "bg-teal-500 text-white border-teal-500" : "bg-muted text-foreground"
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterTagsBar;