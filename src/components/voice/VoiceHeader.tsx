"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Power, Share2, Mic, MicOff, Sun, Grid3x3, Users } from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "@/contexts/ThemeContext";

type Props = {
  roomTitle: string;
  roomId?: string;
  onExit: () => void;
  onTakeMic: () => void;
  onLeaveMic: () => void;
  viewMode?: "classic" | "speaker";
  onToggleView?: () => void;
};

const VoiceHeader: React.FC<Props> = ({ roomTitle, roomId, onExit, onTakeMic, onLeaveMic, viewMode = "speaker", onToggleView }) => {
  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

  const { toggleTheme } = useContext(ThemeContext);

  return (
    <div className="absolute top-4 left-4 flex items-center gap-3 voice-controls-header">
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

      {/* View mode toggle */}
      {onToggleView && (
        <Button
          variant="outline"
          className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
          onClick={onToggleView}
          title={viewMode === "speaker" ? "Switch to classic view" : "Switch to speaker view"}
        >
          {viewMode === "speaker" ? (
            <Grid3x3 className="h-5 w-5" />
          ) : (
            <Users className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* Background toggle */}
      <Button
        variant="outline"
        className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
        onClick={() => { toggleTheme(); }}
        title="Toggle background"
      >
        <Sun className="h-5 w-5" />
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