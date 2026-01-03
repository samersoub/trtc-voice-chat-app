"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Mic, MicOff, Image, Disc3, CheckCircle2, Shuffle, RadioTower, Eye, EyeOff } from "lucide-react";

type Props = {
  micOn: boolean;
  onTakeMic: () => void;
  onLeaveMic: () => void;
  wallpaper: "royal" | "nebula" | "galaxy";
  subscribeMode: "auto" | "manual";
  onToggleWallpaper: () => void;
  onToggleRecording: () => void;
  onSubmitReview: () => void;
  onToggleSubscribeMode: () => void;
  onJoinTRTC: () => void;
  isOwner?: boolean;
  showReports: boolean;
  onToggleReports: () => void;
};

const MobileActionsSheet: React.FC<Props> = ({
  micOn,
  onTakeMic,
  onLeaveMic,
  wallpaper,
  subscribeMode,
  onToggleWallpaper,
  onToggleRecording,
  onSubmitReview,
  onToggleSubscribeMode,
  onJoinTRTC,
  isOwner = false,
  showReports,
  onToggleReports,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-24 right-4 z-30 sm:hidden rounded-full h-12 w-12 p-0 bg-gradient-to-br from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-lg"
          aria-label="Open actions"
          title="Actions"
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-base">Room Actions</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Button
            variant="outline"
            className="h-11 rounded-lg bg-white/10 border-white/20 text-white"
            onClick={micOn ? onLeaveMic : onTakeMic}
          >
            {micOn ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            <span className="ml-2 text-xs">{micOn ? "Leave Mic" : "Take Mic"}</span>
          </Button>
          {isOwner && (
            <Button
              variant="outline"
              className="h-11 rounded-lg bg-white/10 border-white/20 text-white"
              onClick={onToggleWallpaper}
              title={`Wallpaper: ${wallpaper}`}
            >
              <Image className="h-5 w-5" />
              <span className="ml-2 text-xs">Wallpaper</span>
            </Button>
          )}
          <Button
            variant="outline"
            className="h-11 rounded-lg bg-white/10 border-white/20 text-white"
            onClick={onToggleRecording}
            title="Recording"
          >
            <Disc3 className="h-5 w-5" />
            <span className="ml-2 text-xs">Record</span>
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-lg bg-white/10 border-white/20 text-white"
            onClick={onSubmitReview}
            title="Submit Review"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="ml-2 text-xs">Review</span>
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-lg bg-white/10 border-white/20 text-white"
            onClick={onToggleSubscribeMode}
            title={`Subscribe: ${subscribeMode === "auto" ? "Auto" : "Manual"}`}
          >
            <Shuffle className="h-5 w-5" />
            <span className="ml-2 text-xs">{subscribeMode === "auto" ? "Auto" : "Manual"}</span>
          </Button>
          {isOwner && (
            <Button
              variant="outline"
              className="h-11 rounded-lg bg-white/10 border-white/20 text-white"
              onClick={onToggleReports}
              title={showReports ? "Hide reports" : "Show reports"}
            >
              {showReports ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              <span className="ml-2 text-xs">{showReports ? "Hide Reports" : "Show Reports"}</span>
            </Button>
          )}
          <Button
            variant="outline"
            className="h-11 rounded-lg bg-white/10 border-white/20 text-white"
            onClick={onJoinTRTC}
            title="Join Voice Engine"
          >
            <RadioTower className="h-5 w-5" />
            <span className="ml-2 text-xs">Join TRTC</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileActionsSheet;