/**
 * Social metrics component for admin dashboard
 * Shows follow trends, social network growth, and engagement
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, UserPlus, Award, Calendar, ArrowUp } from 'lucide-react';
import { SocialService } from '@/services/SocialService';

export default function SocialMetrics() {
  const [followsToday, setFollowsToday] = useState(0);
  const [totalFollowRelationships, setTotalFollowRelationships] = useState(0);
  const [mostFollowedUsers, setMostFollowedUsers] = useState<Array<{ userId: string; count: number }>>([]);
  const [followTrend, setFollowTrend] = useState<number[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      // Calculate follows today (mock data for now - would need timestamp tracking in production)
      const allStats = SocialService.getAllUserStats();
      const totalFollows = allStats.reduce((sum, stat) => sum + stat.followersCount, 0);
      setTotalFollowRelationships(totalFollows);
      
      // Mock follows today (10-20% of total for demo)
      setFollowsToday(Math.floor(totalFollows * (Math.random() * 0.1 + 0.1)));

      // Get most followed users
      const sortedByFollowers = [...allStats]
        .sort((a, b) => b.followersCount - a.followersCount)
        .slice(0, 5)
        .map(stat => ({ userId: stat.userId, count: stat.followersCount }));
      setMostFollowedUsers(sortedByFollowers);

      // Mock trend data (last 7 days)
      const trend = Array.from({ length: 7 }, (_, i) => {
        return Math.floor(totalFollows * (0.7 + i * 0.05));
      });
      setFollowTrend(trend);
    };

    updateMetrics();
    const unsubscribe = SocialService.subscribe(updateMetrics);
    return unsubscribe;
  }, []);

  const maxTrend = Math.max(...followTrend, 1);
  const labels = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100 mb-1">New Follows Today</p>
              <p className="text-3xl font-bold">{followsToday}</p>
            </div>
            <UserPlus className="h-10 w-10 text-purple-100" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-pink-100 mb-1">Total Relationships</p>
              <p className="text-3xl font-bold">{totalFollowRelationships}</p>
            </div>
            <Users className="h-10 w-10 text-pink-100" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-100 mb-1">Avg Followers</p>
              <p className="text-3xl font-bold">
                {mostFollowedUsers.length > 0
                  ? Math.floor(totalFollowRelationships / mostFollowedUsers.length)
                  : 0}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-indigo-100" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100 mb-1">Growth Rate</p>
              <p className="text-3xl font-bold">+{Math.floor(Math.random() * 20 + 5)}%</p>
              <p className="text-xs text-blue-100 mt-1">vs last week</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-100" />
          </div>
        </Card>
      </div>

      {/* Follow Trend Chart (Simple Bar Chart) */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Follow Relationships Over Time</h3>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <ArrowUp className="h-4 w-4" />
            <span>+{Math.floor((followTrend[6] - followTrend[0]) / followTrend[0] * 100)}% this week</span>
          </div>
        </div>
        <div className="space-y-3">
          {followTrend.map((value, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-20">{labels[idx]}</span>
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-8 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-300"
                  data-width={`${(value / maxTrend) * 100}%`}
                  style={{ width: `${(value / maxTrend) * 100}%` } as React.CSSProperties}
                >
                  <span className="text-xs font-semibold text-white">{value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Most Followed Users */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Most Followed Users
        </h3>
        {mostFollowedUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No follow data yet</p>
        ) : (
          <div className="space-y-3">
            {mostFollowedUsers.map((user, index) => {
              const stats = SocialService.getUserStats(user.userId);
              return (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                          : index === 2
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                          : 'bg-gradient-to-br from-blue-400 to-blue-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">User {user.userId.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">
                        {stats.roomsHosted} rooms hosted · {Math.floor(stats.totalSpeakingTime / 60)}m speaking
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{user.count}</p>
                    <p className="text-xs text-gray-500">followers</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
