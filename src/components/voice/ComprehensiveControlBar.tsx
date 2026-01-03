"use client";

import React from "react";
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Users, 
  Settings, 
  ScreenShare,
  Volume2,
  VolumeX,
  Monitor,
  MonitorOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ComprehensiveControlBarProps {
  micOn: boolean;
  onToggleMic: () => void;
  onLeaveRoom: () => void;
  onToggleParticipants: () => void;
  participantCount?: number;
  isScreenSharing?: boolean;
  onToggleScreenShare?: () => void;
  soundQuality?: "low" | "medium" | "high";
  onChangeSoundQuality?: (quality: "low" | "medium" | "high") => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  className?: string;
}

const ComprehensiveControlBar: React.FC<ComprehensiveControlBarProps> = ({
  micOn,
  onToggleMic,
  onLeaveRoom,
  onToggleParticipants,
  participantCount = 0,
  isScreenSharing = false,
  onToggleScreenShare,
  soundQuality = "high",
  onChangeSoundQuality,
  volume = 80,
  onVolumeChange,
  className,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);

  const soundQualityLabels = {
    low: "Low (32kbps)",
    medium: "Medium (64kbps)",
    high: "High (128kbps)",
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 pt-2 sm:pt-3",
        className
      )}
    >
      <div className="max-w-4xl mx-auto">
        {/* Glassmorphism container */}
        <div className="relative rounded-2xl border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />

          {/* Control buttons grid */}
          <div className="relative px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
            {/* Left side controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Participants button */}
              <Button
                variant="ghost"
                onClick={onToggleParticipants}
                className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-800/30 dark:hover:bg-gray-700/40 backdrop-blur-sm border border-white/20 transition-all shadow-md hover:shadow-lg btn-press"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                {participantCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-lg">
                    {participantCount > 99 ? "99+" : participantCount}
                  </span>
                )}
              </Button>

              {/* Screen share button */}
              {onToggleScreenShare && (
                <Button
                  variant="ghost"
                  onClick={onToggleScreenShare}
                  className={cn(
                    "h-12 w-12 rounded-full backdrop-blur-sm border border-white/20 transition-all shadow-md hover:shadow-lg btn-press",
                    isScreenSharing
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      : "bg-white/10 hover:bg-white/20 dark:bg-gray-800/30 dark:hover:bg-gray-700/40"
                  )}
                >
                  {isScreenSharing ? (
                    <Monitor className="h-5 w-5 text-white" />
                  ) : (
                    <MonitorOff className="h-5 w-5 text-white" />
                  )}
                </Button>
              )}

              {/* Volume control */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-800/30 dark:hover:bg-gray-700/40 backdrop-blur-sm border border-white/20 transition-all shadow-md hover:shadow-lg btn-press"
                >
                  {volume > 50 ? (
                    <Volume2 className="h-5 w-5 text-white" />
                  ) : volume > 0 ? (
                    <Volume2 className="h-5 w-5 text-white opacity-70" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-white" />
                  )}
                </Button>

                {/* Volume slider popup */}
                {showVolumeSlider && onVolumeChange && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-xl bg-white/20 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl animate-scale-in">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-white">{volume}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                        className="w-24 h-32 [writing-mode:vertical-lr] appearance-none bg-white/20 rounded-full cursor-pointer accent-blue-500"
                        aria-label="Volume control"
                        title="Adjust volume"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center - Main mic button */}
            <Button
              onClick={onToggleMic}
              className={cn(
                "h-14 w-14 sm:h-16 sm:w-16 rounded-full transition-all duration-300 shadow-2xl border-3 sm:border-4 btn-press",
                micOn
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-green-400 hover:scale-110 shadow-green-500/50 animate-ripple"
                  : "bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-red-400 hover:scale-110 shadow-red-500/50"
              )}
            >
              {micOn ? (
                <Mic className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              ) : (
                <MicOff className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              )}
            </Button>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              {/* Settings dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-800/30 dark:hover:bg-gray-700/40 backdrop-blur-sm border border-white/20 transition-all shadow-md hover:shadow-lg btn-press"
                  >
                    <Settings className="h-5 w-5 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20"
                >
                  <DropdownMenuLabel>Audio Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-gray-500">
                    Sound Quality
                  </DropdownMenuLabel>
                  {(["low", "medium", "high"] as const).map((quality) => (
                    <DropdownMenuItem
                      key={quality}
                      onClick={() => onChangeSoundQuality?.(quality)}
                      className={cn(
                        "cursor-pointer",
                        soundQuality === quality && "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="capitalize">{quality}</span>
                        {soundQuality === quality && (
                          <span className="text-xs opacity-60">✓</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 block">
                        {soundQualityLabels[quality]}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Leave room button */}
              <Button
                variant="ghost"
                onClick={onLeaveRoom}
                className="h-10 sm:h-12 px-3 sm:px-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 backdrop-blur-sm border border-red-400/50 transition-all shadow-lg hover:shadow-xl shadow-red-500/30 hover:scale-105 btn-press"
              >
                <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5 text-white sm:mr-2" />
                <span className="text-white font-semibold text-sm hidden sm:inline">
                  Leave
                </span>
              </Button>
            </div>
          </div>

          {/* Status indicator bar */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 opacity-50" />
        </div>
      </div>

      {/* Safe area spacing for mobile */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
};

export default ComprehensiveControlBar;
