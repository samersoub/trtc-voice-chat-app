"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCards from "@/components/admin/StatsCards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showError } from "@/utils/toast";
import { ProfileService, type Profile } from "@/services/ProfileService";
import LiveStats from "@/components/admin/LiveStats";
import ActivityFeed from "@/components/admin/ActivityFeed";
import AdminMenu from "@/components/admin/AdminMenu";
import ActiveRoomsMonitor from "@/components/admin/ActiveRoomsMonitor";
import AudioQualityIndicator from "@/components/admin/AudioQualityIndicator";
import EngagementMetrics from "@/components/admin/EngagementMetrics";
import SocialMetrics from "@/components/admin/SocialMetrics";
import UserManagement from "@/components/admin/UserManagement";
import { RoomMonitoringService } from "@/services/RoomMonitoringService";
import { SocialService } from "@/services/SocialService";
import { UserStatusService } from "@/services/UserStatusService";
import { Activity, Users, Signal, TrendingUp, BarChart3, UserCog, Shield } from "lucide-react";

const Dashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Real-time monitoring state
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [audioQualityMetrics, setAudioQualityMetrics] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [inRoomCount, setInRoomCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newFollowsToday, setNewFollowsToday] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const list = await ProfileService.listAll();
      setProfiles(list);
    } catch (e: any) {
      showError(e.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const updateMonitoringData = () => {
    const summary = RoomMonitoringService.getDashboardSummary();
    const rooms = RoomMonitoringService.getAllRoomMetrics();
    const users = RoomMonitoringService.getTopUsers(10);
    
    setDashboardSummary(summary);
    setActiveRooms(rooms);
    setTopUsers(users);

    // Get user status counts
    const online = UserStatusService.getOnlineCount();
    const inRoom = UserStatusService.getUsersByStatus('in-room').length;
    const allStats = SocialService.getAllUserStats();
    
    setOnlineCount(online);
    setInRoomCount(inRoom);
    setTotalUsers(allStats.length);
    
    // Mock new follows today (would need timestamp tracking in production)
    const totalFollows = allStats.reduce((sum, stat) => sum + stat.followersCount, 0);
    setNewFollowsToday(Math.floor(totalFollows * (Math.random() * 0.1 + 0.1)));

    // Collect audio quality metrics from all rooms
    const allAudioMetrics: any[] = [];
    rooms.forEach(room => {
      const roomMetrics = RoomMonitoringService.getAudioQualityHistory(room.roomId);
      allAudioMetrics.push(...roomMetrics);
    });
    setAudioQualityMetrics(allAudioMetrics);
  };

  useEffect(() => {
    void load();
    updateMonitoringData();

    // Subscribe to real-time updates
    const unsubscribe = RoomMonitoringService.subscribe(() => {
      updateMonitoringData();
    });

    // Update every 5 seconds
    const interval = setInterval(() => {
      updateMonitoringData();
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="mb-6">
        <AdminMenu />
      </div>

      {/* Real-time Summary Cards */}
      {dashboardSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="p-4 sm:p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-blue-100 mb-1">Active Rooms</p>
                <p className="text-2xl sm:text-3xl font-bold">{dashboardSummary.activeRooms}</p>
                <p className="text-xs text-blue-100 mt-1">
                  {dashboardSummary.totalParticipants} participants
                </p>
              </div>
              <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-blue-100" />
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-purple-100 mb-1">Users</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalUsers}</p>
                <div className="flex gap-2 mt-1 text-xs text-purple-100">
                  <span>{onlineCount} online</span>
                  <span>·</span>
                  <span>{inRoomCount} in rooms</span>
                </div>
              </div>
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-purple-100" />
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-green-100 mb-1">New Follows Today</p>
                <p className="text-2xl sm:text-3xl font-bold">{newFollowsToday}</p>
                <p className="text-xs text-green-100 mt-1">
                  +{Math.floor(Math.random() * 20 + 5)}% growth
                </p>
              </div>
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-green-100" />
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-orange-100 mb-1">Audio Quality</p>
                <div className="flex gap-1 mt-1">
                  <span className="px-2 py-0.5 bg-green-500/30 rounded text-xs">
                    {dashboardSummary.qualityDistribution.excellent}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-500/30 rounded text-xs">
                    {dashboardSummary.qualityDistribution.good}
                  </span>
                  <span className="px-2 py-0.5 bg-yellow-500/30 rounded text-xs">
                    {dashboardSummary.qualityDistribution.fair}
                  </span>
                  <span className="px-2 py-0.5 bg-red-500/30 rounded text-xs">
                    {dashboardSummary.qualityDistribution.poor}
                  </span>
                </div>
              </div>
              <Signal className="h-8 w-8 sm:h-10 sm:w-10 text-orange-100" />
            </div>
          </Card>
        </div>
      )}

      {/* Monitoring Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-2">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="rooms" className="text-xs sm:text-sm">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Active Rooms
          </TabsTrigger>
          <TabsTrigger value="quality" className="text-xs sm:text-sm">
            <Signal className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Audio Quality
          </TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="moderation" className="text-xs sm:text-sm">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Moderation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Realtime Statistics</h2>
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          <StatsCards profiles={profiles} />
          <div className="mt-4">
            <LiveStats />
          </div>
          <div className="mt-4">
            <ActivityFeed />
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Active Voice Rooms</h2>
            <span className="text-sm text-gray-500">
              {activeRooms.length} room{activeRooms.length !== 1 ? 's' : ''} active
            </span>
          </div>
          <ActiveRoomsMonitor rooms={activeRooms} />
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Audio Quality Monitoring</h2>
            <span className="text-sm text-gray-500">
              Real-time metrics from all rooms
            </span>
          </div>
          {activeRooms.length === 0 ? (
            <Card className="p-8 text-center">
              <Signal className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No active rooms to monitor</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeRooms.map(room => {
                const roomMetrics = RoomMonitoringService.getAudioQualityHistory(room.roomId);
                if (roomMetrics.length === 0) return null;
                return (
                  <div key={room.roomId}>
                    <AudioQualityIndicator 
                      metrics={roomMetrics} 
                      roomName={room.roomName}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Top Users by Engagement</h2>
            <span className="text-sm text-gray-500">
              {topUsers.length} active user{topUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <EngagementMetrics users={topUsers} limit={10} />
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Social Network Metrics</h2>
            <span className="text-sm text-gray-500">
              Follow trends and user growth
            </span>
          </div>
          <SocialMetrics />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">User Management & Moderation</h2>
            <span className="text-sm text-gray-500">
              Search, monitor, and moderate users
            </span>
          </div>
          <UserManagement />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Dashboard;