"use client";

import React from "react";
import { X, Crown, Mic, MicOff, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Participant {
  userId: string;
  name: string;
  avatarUrl?: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isHost?: boolean;
}

interface ParticipantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onInvite?: () => void;
  className?: string;
}

const ParticipantPanel: React.FC<ParticipantPanelProps> = ({
  isOpen,
  onClose,
  participants,
  onInvite,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 w-80 sm:w-96 z-50",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
          "border-l border-gray-200 dark:border-gray-700",
          "shadow-2xl",
          "transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Participants
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {participants.length} {participants.length === 1 ? "person" : "people"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Invite button */}
        {onInvite && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Button
              onClick={onInvite}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite People
            </Button>
          </div>
        )}

        {/* Participant list */}
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-2 space-y-1">
            {participants.map((participant) => (
              <div
                key={participant.userId}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  participant.isSpeaking && "bg-green-50 dark:bg-green-900/20"
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full overflow-hidden border-2",
                      participant.isSpeaking
                        ? "border-green-500"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {participant.avatarUrl ? (
                      <img
                        src={participant.avatarUrl}
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Host badge */}
                  {participant.isHost && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Name and status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "font-medium truncate",
                        participant.isSpeaking
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      {participant.name}
                    </p>
                    {participant.isHost && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold">
                        Host
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {participant.isSpeaking
                      ? "Speaking..."
                      : participant.isMuted
                      ? "Muted"
                      : "Connected"}
                  </p>
                </div>

                {/* Mic indicator */}
                <div className="flex-shrink-0">
                  {participant.isMuted ? (
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <MicOff className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  ) : participant.isSpeaking ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-pulse">
                      <Mic className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Mic className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default ParticipantPanel;
