"use client";

import React from "react";
import { AudioLines } from "lucide-react";

const LiveEqualizer: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-1 bg-black/40 text-emerald-400 px-2 py-1 rounded-full backdrop-blur">
        <AudioLines className="h-4 w-4 animate-pulse" />
        <span className="text-[10px] font-semibold">LIVE</span>
      </div>
    </div>
  );
};

export default LiveEqualizer;