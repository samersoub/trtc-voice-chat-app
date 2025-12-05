"use client";

import React, { useEffect, useState } from "react";
import { Crown, Users, Clock, Share2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EnhancedRoomHeaderProps {
  roomName: string;
  participantCount: number;
  hostName?: string;
  isHost?: boolean;
  roomTags?: string[];
  roomTopic?: string;
  onInvite?: () => void;
  className?: string;
}

const EnhancedRoomHeader: React.FC<EnhancedRoomHeaderProps> = ({
  roomName,
  participantCount,
  hostName,
  isHost = false,
  roomTags = [],
  roomTopic,
  onInvite,
  className,
}) => {
  const [duration, setDuration] = useState(0);

  // Room duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-40 safe-area-top",
        "bg-[rgba(26,26,46,0.85)] backdrop-blur-[20px]",
        "border-b border-white/10",
        "shadow-xl shadow-black/30",
        className
      )}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Room info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              {/* Room name */}
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
                {roomName}
              </h1>

              {/* Host badge */}
              {isHost && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-2 py-0.5 text-xs font-semibold shadow-lg">
                  <Crown className="w-3 h-3 mr-1" fill="currentColor" />
                  Host
                </Badge>
              )}
            </div>

            {/* Room metadata */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Participant count */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                <span className="font-medium">{participantCount}</span>
              </div>

              {/* Duration timer */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                <span className="font-mono font-medium">{formatDuration(duration)}</span>
              </div>

              {/* Room topic */}
              {roomTopic && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm text-white/80 max-w-[200px]">
                  <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  <span className="truncate">{roomTopic}</span>
                </div>
              )}

              {/* Room tags */}
              {roomTags.length > 0 && (
                <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                  {roomTags.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-white/20 text-white/70 bg-white/5 hover:bg-white/10 px-2 py-0.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {roomTags.length > 3 && (
                    <span className="text-xs text-white/50">+{roomTags.length - 3}</span>
                  )}
                </div>
              )}
            </div>

            {/* Host name (mobile only) */}
            {hostName && !isHost && (
              <div className="text-xs text-white/60 mt-1 sm:hidden">
                Hosted by {hostName}
              </div>
            )}
          </div>

          {/* Right: Invite button */}
          <Button
            onClick={onInvite}
            className={cn(
              "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600",
              "text-white font-semibold shadow-lg shadow-purple-500/30",
              "h-9 sm:h-10 md:h-11 px-3 sm:px-4 md:px-5",
              "rounded-xl sm:rounded-2xl",
              "transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40",
              "btn-press touch-manipulation flex-shrink-0"
            )}
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        </div>

        {/* Mobile: Room topic and host */}
        <div className="flex sm:hidden items-center gap-2 mt-2 flex-wrap">
          {roomTopic && (
            <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/5 rounded-lg px-2 py-1">
              <Tag className="w-3 h-3 text-green-400" />
              <span className="truncate max-w-[150px]">{roomTopic}</span>
            </div>
          )}
          {hostName && !isHost && (
            <div className="text-xs text-white/60 bg-white/5 rounded-lg px-2 py-1">
              <Crown className="w-3 h-3 inline mr-1 text-yellow-400" />
              {hostName}
            </div>
          )}
        </div>

        {/* Mobile: Tags */}
        {roomTags.length > 0 && (
          <div className="flex md:hidden items-center gap-1.5 mt-2 flex-wrap">
            {roomTags.slice(0, 4).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs border-white/20 text-white/70 bg-white/5 px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {roomTags.length > 4 && (
              <span className="text-xs text-white/50">+{roomTags.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRoomHeader;
