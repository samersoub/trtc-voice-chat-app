"use client";

import React from "react";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import LiveEqualizer from "./LiveEqualizer";
import { ChatRoom } from "@/models/ChatRoom";
import { cn } from "@/lib/utils";

function randomFlag(): string {
  const flags = ["🇯🇴", "🇸🇦", "🇺🇸", "🇮🇳", "🇪🇬", "🇹🇷", "🇦🇪"];
  return flags[Math.floor(Math.random() * flags.length)];
}

const RoomCard: React.FC<{ room: ChatRoom; className?: string }> = ({ room, className }) => {
  const flag = randomFlag();
  const bg = "/placeholder.svg";
  const hostShort = room.hostId ? `${room.hostId.slice(0, 6)}` : "Host";

  return (
    <Link to={`/voice/rooms/${room.id}`} className={cn("group", className)}>
      <AspectRatio ratio={16 / 9} className="relative overflow-hidden rounded-lg">
        <img
          src={bg}
          alt={room.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-2 left-2 rounded-md bg-white/90 px-2 py-1 text-xs shadow">
          {flag}
        </div>
        <LiveEqualizer className="absolute top-2 right-2" />
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-white text-sm sm:text-base font-semibold line-clamp-1 drop-shadow">
            {room.name}
          </div>
          <div className="text-white/80 text-[11px] sm:text-xs drop-shadow">
            Host: {hostShort}
          </div>
        </div>
      </AspectRatio>
    </Link>
  );
};

export default RoomCard;