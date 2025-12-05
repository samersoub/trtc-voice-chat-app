"use client";

import React, { useState } from "react";
import { Mic, MicOff, Wifi, WifiOff, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  userId: string;
  name: string;
  avatarUrl?: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isHost?: boolean;
  connectionQuality?: "good" | "medium" | "poor";
  audioLevel?: number; // 0-100
}

interface EnhancedSpeakerViewProps {
  participants: Participant[];
  maxParticipants?: number;
  onParticipantClick?: (userId: string) => void;
  className?: string;
}

const EnhancedSpeakerView: React.FC<EnhancedSpeakerViewProps> = ({
  participants,
  maxParticipants = 8,
  onParticipantClick,
  className,
}) => {
  // Separate host and guests
  const host = participants.find((p) => p.isHost);
  const guests = participants.filter((p) => !p.isHost).slice(0, maxParticipants - 1);

  // Calculate circular positions for guests around the host
  const getCircularPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Start from top
    const radius = 42; // Percentage from center
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };

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

  const ParticipantCard = ({ participant, isCenter = false }: { participant: Participant; isCenter?: boolean }) => {
    const size = isCenter ? "w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36" : "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28";
    const audioLevel = participant.audioLevel || 0;

    return (
      <div
        className="flex flex-col items-center gap-2 cursor-pointer group animate-fade-in-up"
        onClick={() => onParticipantClick?.(participant.userId)}
      >
        <div className="relative">
          {/* Speaking pulse animation */}
          {participant.isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse-ring opacity-75" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse-ring-delayed opacity-50" />
            </>
          )}

          {/* Avatar container with gradient border */}
          <div
            className={cn(
              size,
              "rounded-full p-1 bg-gradient-to-br transition-all duration-300 relative",
              participant.isSpeaking
                ? "from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50 scale-105"
                : "from-gray-600 to-gray-700 group-hover:from-blue-600 group-hover:to-purple-600"
            )}
            style={{
              boxShadow: participant.isSpeaking
                ? `0 0 ${20 + audioLevel / 5}px rgba(139, 92, 246, 0.6)`
                : undefined,
            }}
          >
            {/* Avatar image */}
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500">
              {participant.avatarUrl ? (
                <img
                  src={participant.avatarUrl}
                  alt={participant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className={cn("font-bold text-white", isCenter ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl")}>
                    {participant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Host crown badge */}
            {participant.isHost && (
              <div className="absolute -top-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-subtle">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
              </div>
            )}

            {/* Mute status badge */}
            <div
              className={cn(
                "absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-all",
                participant.isMuted
                  ? "bg-red-500"
                  : "bg-green-500"
              )}
            >
              {participant.isMuted ? (
                <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              ) : (
                <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              )}
            </div>

            {/* Connection quality indicator */}
            <div className="absolute top-0 left-0 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
              <div
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  getConnectionColor(participant.connectionQuality)
                )}
              />
              {participant.connectionQuality === "poor" && (
                <WifiOff className="w-3 h-3 text-red-400" />
              )}
              {participant.connectionQuality !== "poor" && (
                <Wifi className="w-3 h-3 text-green-400" />
              )}
            </div>

            {/* Volume level visualization */}
            {participant.isSpeaking && audioLevel > 0 && (
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500/30 to-transparent transition-all duration-150"
                  style={{ height: `${audioLevel}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Participant name */}
        <div className="text-center">
          <p
            className={cn(
              "font-semibold transition-all duration-300 drop-shadow-lg",
              isCenter ? "text-base sm:text-lg md:text-xl" : "text-xs sm:text-sm",
              participant.isSpeaking
                ? "text-purple-400 scale-105"
                : "text-white group-hover:text-purple-300"
            )}
          >
            {participant.name}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative w-full h-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px]", className)}>
      {/* Desktop: Circular layout */}
      <div className="hidden md:block relative w-full h-full">
        {/* Center host */}
        {host && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <ParticipantCard participant={host} isCenter />
          </div>
        )}

        {/* Surrounding guests in circular pattern */}
        {guests.map((guest, index) => {
          const pos = getCircularPosition(index, guests.length);
          return (
            <div
              key={guest.userId}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-0"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                animationDelay: `${index * 100}ms`,
              }}
            >
              <ParticipantCard participant={guest} />
            </div>
          );
        })}
      </div>

      {/* Tablet: 2x2 Grid */}
      <div className="hidden sm:grid md:hidden grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6">
        {host && <ParticipantCard participant={host} isCenter />}
        {guests.map((guest) => (
          <ParticipantCard key={guest.userId} participant={guest} />
        ))}
      </div>

      {/* Mobile: Vertical stack */}
      <div className="grid sm:hidden grid-cols-1 gap-6 p-4 place-items-center">
        {host && <ParticipantCard participant={host} isCenter />}
        {guests.map((guest) => (
          <ParticipantCard key={guest.userId} participant={guest} />
        ))}
      </div>

      {/* Empty state */}
      {participants.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/60">
            <p className="text-lg font-medium">No participants yet</p>
            <p className="text-sm mt-2">Invite friends to join the room</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSpeakerView;
