"use client";

import React from "react";
import { Users } from "lucide-react";

type Props = {
  title: string;
  count?: number;
};

const RoomTitlePill: React.FC<Props> = ({ title, count }) => {
  return (
    <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-20">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 text-white px-4 py-2 backdrop-blur-md shadow-md">
        <span className="text-xs sm:text-sm font-semibold">{title}</span>
        {typeof count === "number" && (
          <span className="flex items-center gap-1 text-[11px] sm:text-xs text-white/85">
            <Users className="h-3.5 w-3.5" />
            {count}
          </span>
        )}
      </div>
    </div>
  );
};

export default RoomTitlePill;