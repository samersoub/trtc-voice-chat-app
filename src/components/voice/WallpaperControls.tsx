"use client";

import React from "react";
import { Button } from "@/components/ui/button";

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
        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
        onClick={onToggleWallpaper}
      >
        Wallpaper
      </Button>
      <Button
        variant="outline"
        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
        onClick={onToggleRecording}
      >
        Toggle Recording
      </Button>
      <Button
        variant="outline"
        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
        onClick={onSubmitReview}
      >
        Submit Review
      </Button>
      <Button
        variant="outline"
        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
        onClick={onToggleSubscribeMode}
      >
        Subscribe: {subscribeMode === "auto" ? "Auto" : "Manual"}
      </Button>
      <Button
        variant="outline"
        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
        onClick={onJoinTRTC}
      >
        Join TRTC Test Room
      </Button>
    </div>
  );
};

export default WallpaperControls;