"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  roomTitle: string;
  roomId?: string;
  onExit: () => void;
  onTakeMic: () => void;
  onLeaveMic: () => void;
};

const VoiceHeader: React.FC<Props> = ({ roomTitle, roomId, onExit, onTakeMic, onLeaveMic }) => {
  return (
    <div className="absolute top-4 left-4 flex items-center gap-3">
      <div className="text-white">
        <div className="text-sm font-semibold">{roomTitle}</div>
        <div className="text-xs text-white/80">ID: {roomId ?? "—"}</div>
      </div>
      <Button
        variant="outline"
        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
        onClick={onExit}
      >
        Exit Room
      </Button>
      <Button
        variant="outline"
        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
        onClick={onTakeMic}
      >
        Take Mic
      </Button>
      <Button
        variant="outline"
        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
        onClick={onLeaveMic}
      >
        Leave Mic
      </Button>
    </div>
  );
};

export default VoiceHeader;