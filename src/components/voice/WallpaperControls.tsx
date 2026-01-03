"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Image, Disc3, CheckCircle2, Shuffle, RadioTower, Eye, EyeOff } from "lucide-react";

type Props = {
  wallpaper: "royal" | "nebula" | "galaxy";
  onToggleWallpaper: () => void;
  onToggleRecording: () => void;
  onSubmitReview: () => void;
  subscribeMode: "auto" | "manual";
  onToggleSubscribeMode: () => void;
  onJoinTRTC: () => void;
  isOwner?: boolean;
  showReports: boolean;
  onToggleReports: () => void;
};

const WallpaperControls: React.FC<Props> = ({
  wallpaper,
  onToggleWallpaper,
  onToggleRecording,
  onSubmitReview,
  subscribeMode,
  onToggleSubscribeMode,
  onJoinTRTC,
  isOwner = false,
  showReports,
  onToggleReports,
}) => {
  return (
    <div className="absolute top-4 right-4 hidden sm:flex items-center gap-2">
      {isOwner && (
        <Button
          variant="outline"
          className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
          onClick={onToggleWallpaper}
          aria-label="Toggle wallpaper"
          title={`Wallpaper: ${wallpaper}`}
        >
          <Image className="h-5 w-5" />
        </Button>
      )}
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
      {isOwner && (
        <Button
          variant="outline"
          className="h-10 w-10 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
          onClick={onToggleReports}
          aria-label={showReports ? "Hide reports" : "Show reports"}
          title={showReports ? "Hide reports" : "Show reports"}
        >
          {showReports ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
      )}
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