"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Image, Disc3, CheckCircle2, Shuffle, RadioTower } from "lucide-react";

type Props = {
  wallpaper: "royal" | "nebula" | "galaxy";
  onToggleWallpaper: () => void;
  onToggleRecording: () => void;
  onSubmitReview: () => void;
  subscribeMode: "auto" | "manual";
  onToggleSubscribeMode: () => void;
  onJoinTRTC: () => void;
};

const WallpaperControls: React.FC<Props> = ({
  wallpaper,
  onToggleWallpaper,
  onToggleRecording,
  onSubmitReview,
  subscribeMode,
  onToggleSubscribeMode,
  onJoinTRTC,
}) => {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <Button
        variant="outline"
        className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
        onClick={onToggleWallpaper}
        aria-label="Toggle wallpaper"
        title={`Wallpaper: ${wallpaper}`}
      >
        <Image className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
        onClick={onToggleRecording}
        aria-label="Toggle recording"
        title="Toggle recording"
      >
        <Disc3 className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
        onClick={onSubmitReview}
        aria-label="Submit review"
        title="Submit review"
      >
        <CheckCircle2 className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0 relative"
        onClick={onToggleSubscribeMode}
        aria-label="Toggle subscribe mode"
        title={`Subscribe: ${subscribeMode === "auto" ? "Auto" : "Manual"}`}
      >
        <Shuffle className="h-5 w-5" />
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/80">
          {subscribeMode === "auto" ? "Auto" : "Manual"}
        </span>
      </Button>
      <Button
        variant="outline"
        className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
        onClick={onJoinTRTC}
        aria-label="Join TRTC"
        title="Join TRTC test room"
      >
        <RadioTower className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default WallpaperControls;