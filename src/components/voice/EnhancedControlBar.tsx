"use client";

import React, { useState } from "react";
import { Mic, MicOff, PhoneOff, Settings, Users, Share2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedControlBarProps {
  micOn: boolean;
  onToggleMic: () => void;
  onLeaveRoom: () => void;
  onOpenParticipants: () => void;
  onShare: () => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  className?: string;
}

const EnhancedControlBar: React.FC<EnhancedControlBarProps> = ({
  micOn,
  onToggleMic,
  onLeaveRoom,
  onOpenParticipants,
  onShare,
  volume = 80,
  onVolumeChange,
  className,
}) => {
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setLocalVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 safe-area-bottom",
        "bg-[rgba(26,26,46,0.85)] backdrop-blur-[20px]",
        "border-t border-white/10",
        "shadow-2xl shadow-black/50",
        className
      )}
    >
      {/* Volume control popup */}
      {showVolumeControl && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[rgba(26,26,46,0.95)] backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10 min-w-[200px] sm:min-w-[280px] animate-scale-in">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Slider
              value={[localVolume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          </div>
          <div className="text-center text-sm text-white/80 font-medium">
            {localVolume}%
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
        <div className="flex items-center justify-between gap-3 sm:gap-4 md:gap-6">
          {/* Left side: Leave button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={onLeaveRoom}
              className={cn(
                "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
                "text-white font-semibold shadow-lg shadow-red-500/30",
                "h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6",
                "rounded-xl sm:rounded-2xl",
                "transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/40",
                "btn-press touch-manipulation"
              )}
            >
              <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>

          {/* Center: Large mic button */}
          <div className="flex-shrink-0">
            <button
              onClick={onToggleMic}
              className={cn(
                "relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full",
                "flex items-center justify-center",
                "transition-all duration-300 hover:scale-110",
                "shadow-2xl touch-manipulation",
                micOn
                  ? "bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-700 shadow-purple-500/50"
                  : "bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-gray-900/50"
              )}
              style={{
                boxShadow: micOn
                  ? "0 0 40px rgba(139, 92, 246, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5)"
                  : "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Ripple effect when mic is on */}
              {micOn && (
                <>
                  <div className="absolute inset-0 rounded-full bg-purple-500 animate-ripple opacity-0" />
                  <div className="absolute inset-0 rounded-full bg-blue-500 animate-ripple opacity-0 animation-delay-300" />
                </>
              )}

              {micOn ? (
                <Mic className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white relative z-10" />
              ) : (
                <MicOff className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white relative z-10" />
              )}
            </button>

            {/* Mic status text */}
            <p className="text-center mt-2 text-xs sm:text-sm font-medium text-white/80">
              {micOn ? "Tap to Mute" : "Tap to Unmute"}
            </p>
          </div>

          {/* Right side: Settings, Participants, Share */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Settings with volume control */}
            <DropdownMenu open={showVolumeControl} onOpenChange={setShowVolumeControl}>
              <DropdownMenuTrigger asChild>
                <Button
                  className={cn(
                    "bg-white/10 hover:bg-white/20 backdrop-blur-sm",
                    "text-white border border-white/20",
                    "h-10 sm:h-11 md:h-12 w-10 sm:w-11 md:w-12",
                    "rounded-xl sm:rounded-2xl",
                    "transition-all duration-300 hover:scale-105",
                    "btn-press touch-manipulation p-0"
                  )}
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>

            {/* Participants */}
            <Button
              onClick={onOpenParticipants}
              className={cn(
                "bg-white/10 hover:bg-white/20 backdrop-blur-sm",
                "text-white border border-white/20",
                "h-10 sm:h-11 md:h-12 w-10 sm:w-11 md:w-12",
                "rounded-xl sm:rounded-2xl",
                "transition-all duration-300 hover:scale-105",
                "btn-press touch-manipulation p-0"
              )}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* Share */}
            <Button
              onClick={onShare}
              className={cn(
                "bg-white/10 hover:bg-white/20 backdrop-blur-sm",
                "text-white border border-white/20",
                "h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-5",
                "rounded-xl sm:rounded-2xl",
                "transition-all duration-300 hover:scale-105",
                "btn-press touch-manipulation"
              )}
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline text-sm font-medium">Share</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedControlBar;
