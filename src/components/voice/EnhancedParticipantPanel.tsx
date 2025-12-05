"use client";

import React from "react";
import { X, Mic, MicOff, Crown, MoreVertical, UserX, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/profile/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Participant {
  userId: string;
  name: string;
  avatarUrl?: string;
  isMuted?: boolean;
  isHost?: boolean;
  connectionQuality?: "good" | "medium" | "poor";
}

interface EnhancedParticipantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  currentUserId?: string;
  isCurrentUserHost?: boolean;
  onKickUser?: (userId: string) => void;
  onMuteUser?: (userId: string) => void;
  onUnmuteUser?: (userId: string) => void;
  className?: string;
}

const EnhancedParticipantPanel: React.FC<EnhancedParticipantPanelProps> = ({
  isOpen,
  onClose,
  participants,
  currentUserId,
  isCurrentUserHost = false,
  onKickUser,
  onMuteUser,
  onUnmuteUser,
  className,
}) => {
  const getConnectionColor = (quality?: "good" | "medium" | "poor") => {
    switch (quality) {
      case "good":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "poor":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-full sm:w-96 md:w-[420px]",
          "bg-[rgba(26,26,46,0.95)] backdrop-blur-[24px]",
          "shadow-2xl z-50 transition-transform duration-300",
          "border-l border-white/10",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-white/10 bg-white/5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Participants</h2>
            <p className="text-xs sm:text-sm text-white/60 mt-0.5">
              {participants.length} {participants.length === 1 ? "person" : "people"} in room
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 text-white p-0 touch-manipulation"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Participants list */}
        <ScrollArea className="flex-1 h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)]">
          <div className="p-3 sm:p-4 space-y-2">
            {participants.map((participant) => {
              const isCurrentUser = participant.userId === currentUserId;
              const showHostControls = isCurrentUserHost && !participant.isHost && !isCurrentUser;

              return (
                <div
                  key={participant.userId}
                  className={cn(
                    "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all",
                    participant.isHost
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                      : "bg-white/5 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {/* Avatar with Profile Modal */}
                  <div className="flex-shrink-0">
                    <UserAvatar
                      userId={participant.userId}
                      userName={participant.name}
                      avatarUrl={participant.avatarUrl}
                      size="lg"
                      showStatus={false}
                      enableProfileModal={true}
                      className="ring-2 ring-white/20"
                    />
                    
                    {/* Connection quality indicator */}
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-[rgba(26,26,46,0.95)]",
                        getConnectionColor(participant.connectionQuality)
                      )}
                    />
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm sm:text-base font-semibold text-white truncate">
                        {participant.name}
                        {isCurrentUser && <span className="text-white/60 ml-1">(You)</span>}
                      </p>
                      {participant.isHost && (
                        <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-xs text-white/50">
                      {participant.connectionQuality === "good" && "Excellent connection"}
                      {participant.connectionQuality === "medium" && "Fair connection"}
                      {participant.connectionQuality === "poor" && "Poor connection"}
                      {!participant.connectionQuality && "Connected"}
                    </p>
                  </div>

                  {/* Mic status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full",
                        participant.isMuted
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      )}
                    >
                      {participant.isMuted ? (
                        <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>

                    {/* More options (host only) */}
                    {showHostControls && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/10 hover:bg-white/20 text-white p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[rgba(26,26,46,0.98)] backdrop-blur-xl border-white/20">
                          {participant.isMuted ? (
                            <DropdownMenuItem
                              onClick={() => onUnmuteUser?.(participant.userId)}
                              className="text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Volume2 className="w-4 h-4 mr-2 text-green-400" />
                              Unmute User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => onMuteUser?.(participant.userId)}
                              className="text-white hover:bg-white/10 cursor-pointer"
                            >
                              <VolumeX className="w-4 h-4 mr-2 text-orange-400" />
                              Mute User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem
                            onClick={() => onKickUser?.(participant.userId)}
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Remove from Room
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default EnhancedParticipantPanel;
