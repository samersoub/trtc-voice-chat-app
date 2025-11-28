"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Power, Share2, Mic, MicOff } from "lucide-react";

type Props = {
  roomTitle: string;
  roomId?: string;
  onExit: () => void;
  onTakeMic: () => void;
  onLeaveMic: () => void;
};

const VoiceHeader: React.FC<Props> = ({ roomTitle, roomId, onExit, onTakeMic, onLeaveMic }) => {
  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

  return (
    <div className="absolute top-4 left-4 flex items-center gap-3">
      {/* Exit */}
      <Button
        variant="outline"
        className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
        onClick={onExit}
        title="Leave room"
      >
        <Power className="h-5 w-5" />
      </Button>

      {/* Share */}
      <Button
        variant="outline"
        className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
        onClick={share}
        title="Copy room link"
      >
        <Share2 className="h-5 w-5" />
      </Button>

      {/* Mic actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
          onClick={onTakeMic}
          title="Take mic"
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
          onClick={onLeaveMic}
          title="Leave mic"
        >
          <MicOff className="h-5 w-5" />
        </Button>
      </div>

      {/* Room pill */}
      <div className="ml-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white">
        <div className="text-xs font-semibold">{roomTitle}</div>
        <div className="text-[10px] text-white/80">ID: {roomId ?? "—"}</div>
      </div>
    </div>
  );
};

export default VoiceHeader;