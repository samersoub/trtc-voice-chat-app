"use client";

import React from "react";
import { MicOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type SeatProps = {
  name?: string;
  imageUrl?: string;
  speaking?: boolean;
  muted?: boolean;
  locked?: boolean;
  showFrame?: boolean;
  avatarClassName?: string;
};

const Seat: React.FC<SeatProps> = ({ name = "User", imageUrl, speaking = false, muted = false, locked = false, showFrame = true, avatarClassName }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="rounded-full p-0 transition-all">
        {/** allow overriding avatar size classes via `avatarClassName` prop */}
        <Avatar className={cn("h-10 w-10 sm:h-10 sm:w-10 rounded-full border-0 shadow-none", avatarClassName || "")}>
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt={name} />
          ) : (
            <AvatarFallback className="bg-transparent text-white">{name.slice(0, 1).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
      </div>
      {muted && (
        <div className="absolute -bottom-1 -right-1 bg-black/60 text-white rounded-full p-1">
          <MicOff className="h-4 w-4" />
        </div>
      )}
      {locked && (
        <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-xs text-white/80">
          Locked
        </div>
      )}
      <div className="mt-1 text-[10px] text-white/80 text-center w-12 truncate">{name}</div>
    </div>
  );
};

export default Seat;