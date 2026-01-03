"use client";

import React from "react";
import ParticipantAvatar from "./ParticipantAvatar";
import { cn } from "@/lib/utils";

interface Participant {
  userId: string;
  name: string;
  avatarUrl?: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isHost?: boolean;
}

interface RoomSpeakerViewProps {
  participants: Participant[];
  maxParticipants?: number;
  onParticipantClick?: (userId: string) => void;
  className?: string;
}

const RoomSpeakerView: React.FC<RoomSpeakerViewProps> = ({
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
    const radius = 45; // Percentage from center
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className={cn("relative w-full h-full min-h-[350px] sm:min-h-[400px] md:min-h-[500px]", className)}>
      {/* Center host */}
      {host && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <ParticipantAvatar
            userId={host.userId}
            name={host.name}
            avatarUrl={host.avatarUrl}
            isSpeaking={host.isSpeaking}
            isMuted={host.isMuted}
            isHost={true}
            size="xl"
            onClick={() => onParticipantClick?.(host.userId)}
          />
        </div>
      )}

      {/* Circular arrangement for guests */}
      {guests.map((participant, index) => {
        const { x, y } = getCircularPosition(index, guests.length);
        return (
          <div
            key={participant.userId}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
          >
            <ParticipantAvatar
              userId={participant.userId}
              name={participant.name}
              avatarUrl={participant.avatarUrl}
              isSpeaking={participant.isSpeaking}
              isMuted={participant.isMuted}
              size="lg"
              onClick={() => onParticipantClick?.(participant.userId)}
            />
          </div>
        );
      })}

      {/* Connection lines from host to guests (optional decorative element) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        {host &&
          guests.map((participant, index) => {
            const { x, y } = getCircularPosition(index, guests.length);
            return (
              <line
                key={participant.userId}
                x1="50%"
                y1="50%"
                x2={`${x}%`}
                y2={`${y}%`}
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-500"
              />
            );
          })}
      </svg>

      {/* Empty seats indicators */}
      {guests.length < maxParticipants - 1 &&
        Array.from({ length: maxParticipants - 1 - guests.length }).map(
          (_, index) => {
            const actualIndex = guests.length + index;
            const { x, y } = getCircularPosition(
              actualIndex,
              maxParticipants - 1
            );
            return (
              <div
                key={`empty-${index}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                <div className="w-20 h-20 rounded-full border-4 border-dashed border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              </div>
            );
          }
        )}
    </div>
  );
};

export default RoomSpeakerView;
