"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, MessageSquare, Gift, Clock, Award } from 'lucide-react';

interface UserEngagement {
  userId: string;
  userName: string;
  totalTimeInRooms: number;
  roomsJoined: number;
  messagesSent: number;
  giftsSent: number;
  giftValue: number;
  lastActive: Date;
}

interface EngagementMetricsProps {
  users: UserEngagement[];
  limit?: number;
}

const EngagementMetrics: React.FC<EngagementMetricsProps> = ({ users, limit = 10 }) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatLastActive = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const topUsers = users.slice(0, limit);

  if (topUsers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No user engagement data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {topUsers.map((user, index) => (
        <Card
          key={user.userId}
          className={cn(
            "p-4 sm:p-5 transition-all duration-200",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            index < 3 && "ring-2 ring-blue-500/20"
          )}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Rank Badge */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base",
              index === 0 && "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white",
              index === 1 && "bg-gradient-to-br from-gray-300 to-gray-500 text-white",
              index === 2 && "bg-gradient-to-br from-orange-400 to-orange-600 text-white",
              index >= 3 && "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}>
              {index < 3 ? <Award className="h-4 w-4 sm:h-5 sm:w-5" /> : index + 1}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                    {user.userName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Last active: {formatLastActive(user.lastActive)}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {formatTime(user.totalTimeInRooms)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Rooms</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {user.roomsJoined}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Messages</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {user.messagesSent}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-pink-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Gifts</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {user.giftsSent}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 col-span-2 sm:col-span-1">
                  <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Value</p>
                    <p className="text-sm sm:text-base font-semibold text-yellow-600 dark:text-yellow-500">
                      {user.giftValue.toLocaleString()} 🪙
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default EngagementMetrics;
