"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Users, MessageSquare, Gift, TrendingUp, Activity } from 'lucide-react';

interface RoomMetric {
  roomId: string;
  roomName: string;
  hostName: string;
  participantCount: number;
  duration: number;
  audioQuality: 'excellent' | 'good' | 'fair' | 'poor';
  engagementScore: number;
  messagesCount: number;
  giftsCount: number;
}

interface ActiveRoomsMonitorProps {
  rooms: RoomMetric[];
  onRoomClick?: (roomId: string) => void;
}

const ActiveRoomsMonitor: React.FC<ActiveRoomsMonitorProps> = ({ rooms, onRoomClick }) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500 bg-green-500/10';
      case 'good': return 'text-blue-500 bg-blue-500/10';
      case 'fair': return 'text-yellow-500 bg-yellow-500/10';
      case 'poor': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (rooms.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No active rooms at the moment</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <Card
          key={room.roomId}
          className={cn(
            "p-4 sm:p-5 transition-all duration-200 hover:shadow-lg cursor-pointer",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          )}
          onClick={() => onRoomClick?.(room.roomId)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Room Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                    {room.roomName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Host: {room.hostName}
                  </p>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                  getQualityColor(room.audioQuality)
                )}>
                  {room.audioQuality}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {room.participantCount}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {room.messagesCount}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-pink-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {room.giftsCount}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <TrendingUp className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4",
                    getEngagementColor(room.engagementScore)
                  )} />
                  <span className={cn(
                    "text-xs sm:text-sm font-medium",
                    getEngagementColor(room.engagementScore)
                  )}>
                    {room.engagementScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:pl-4 sm:border-l border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">Duration:</span>
              <span className="text-sm sm:text-base font-mono font-semibold text-gray-900 dark:text-white">
                {formatDuration(room.duration)}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ActiveRoomsMonitor;
