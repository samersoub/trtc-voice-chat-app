"use client";

import React from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantAvatarProps {
  userId: string;
  name: string;
  avatarUrl?: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isHost?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg" | "xl";
}

const ParticipantAvatar: React.FC<ParticipantAvatarProps> = ({
  userId,
  name,
  avatarUrl,
  isSpeaking = false,
  isMuted = false,
  isHost = false,
  onClick,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16",
    md: "w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20",
    lg: "w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24",
    xl: "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
    xl: "h-5 w-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const badgeSizes = {
    sm: "h-4 w-4 sm:h-5 sm:w-5 -bottom-0.5 -right-0.5",
    md: "h-5 w-5 sm:h-6 sm:w-6 -bottom-1 -right-1",
    lg: "h-6 w-6 sm:h-7 sm:w-7 -bottom-1 -right-1",
    xl: "h-7 w-7 sm:h-8 sm:w-8 -bottom-2 -right-2",
  };

  return (
    <div className="flex flex-col items-center gap-2 group" onClick={onClick}>
      <div className="relative">
        {/* Avatar with speaking indicator ring */}
        <div
          className={cn(
            sizeClasses[size],
            "rounded-full overflow-hidden border-4 transition-all duration-300",
            isSpeaking
              ? "border-green-500 shadow-lg shadow-green-500/50 scale-105"
              : isMuted
              ? "border-gray-400 dark:border-gray-600"
              : "border-blue-500 shadow-md shadow-blue-500/30",
            onClick && "cursor-pointer group-hover:scale-110"
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 flex items-center justify-center">
              <span className={cn("font-bold text-white", textSizes[size])}>
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Host badge */}
        {isHost && (
          <div className="absolute -top-1 -left-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-1.5 shadow-lg border-2 border-white dark:border-gray-900">
            <svg
              className={iconSizes[size]}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}

        {/* Mute/Speaking indicator badge */}
        <div
          className={cn(
            "absolute rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 transition-all",
            badgeSizes[size],
            isMuted
              ? "bg-red-500"
              : isSpeaking
              ? "bg-green-500 animate-pulse"
              : "bg-gray-500 dark:bg-gray-600"
          )}
        >
          {isMuted ? (
            <MicOff className={cn(iconSizes[size], "text-white")} />
          ) : isSpeaking ? (
            <Volume2 className={cn(iconSizes[size], "text-white")} />
          ) : (
            <Mic className={cn(iconSizes[size], "text-white")} />
          )}
        </div>

        {/* Glowing ring animation for speaking */}
        {isSpeaking && (
          <div
            className={cn(
              sizeClasses[size],
              "absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-75"
            )}
          />
        )}
      </div>

      {/* Name label */}
      <div className="text-center max-w-[100px]">
        <p
          className={cn(
            "font-medium truncate",
            textSizes[size],
            isSpeaking
              ? "text-green-600 dark:text-green-400"
              : "text-gray-700 dark:text-gray-300"
          )}
        >
          {name}
        </p>
      </div>
    </div>
  );
};

export default ParticipantAvatar;
