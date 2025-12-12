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
import { Activity, Users, Signal, TrendingUp, BarChart3, UserCog, Shield, Backpack, Crown, Frame, Sparkles, ImageIcon } from "lucide-react";

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
      // Silently handle error if Supabase is not configured
      console.warn("Failed to load profiles:", e.message);
      setProfiles([]);
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
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-2">
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
          <TabsTrigger value="backpack" className="text-xs sm:text-sm">
            <Backpack className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Backpack
          </TabsTrigger>
          <TabsTrigger value="svip" className="text-xs sm:text-sm">
            <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            SVIP
          </TabsTrigger>
          <TabsTrigger value="blocklist" className="text-xs sm:text-sm">
            <UserCog className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Blocklist
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

        <TabsContent value="backpack" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Backpack Items Management</h2>
            <Button variant="default">
              <Backpack className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </div>
          
          {/* Frames Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Frame className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Profile Frames</h3>
              <span className="text-sm text-gray-500 ml-auto">12 items</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {['Gold Frame', 'Diamond Frame', 'Silver Frame', 'Bronze Frame', 'Platinum Frame', 'Ruby Frame'].map((name, i) => (
                <div key={i} className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow">
                  <Frame className="w-full h-16 text-purple-400 mb-2" />
                  <p className="text-xs text-center font-medium truncate">{name}</p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                    <Button size="sm" variant="destructive" className="flex-1 text-xs">Del</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Entrances Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Room Entrances</h3>
              <span className="text-sm text-gray-500 ml-auto">8 items</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {['VIP Entrance', 'Royal Entrance', 'Fire Entrance', 'Ice Entrance', 'Thunder Entrance', 'Galaxy Entrance'].map((name, i) => (
                <div key={i} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200 hover:shadow-lg transition-shadow">
                  <Sparkles className="w-full h-16 text-yellow-400 mb-2" />
                  <p className="text-xs text-center font-medium truncate">{name}</p>
                  <p className="text-[10px] text-center text-gray-500 mb-2">30 days</p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                    <Button size="sm" variant="destructive" className="flex-1 text-xs">Del</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Backgrounds Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Room Backgrounds</h3>
              <span className="text-sm text-gray-500 ml-auto">15 items</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {['Galaxy', 'Rose', 'Ocean', 'Forest', 'Sunset', 'Aurora'].map((name, i) => (
                <div key={i} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow">
                  <div className="w-full h-16 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-lg mb-2" />
                  <p className="text-xs text-center font-medium truncate">{name}</p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                    <Button size="sm" variant="destructive" className="flex-1 text-xs">Del</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="svip" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">SVIP Management</h2>
            <Button variant="default">
              <Crown className="h-4 w-4 mr-2" />
              Add SVIP Level
            </Button>
          </div>

          {/* SVIP Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="p-5 bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
              <Crown className="h-8 w-8 mb-2" />
              <p className="text-3xl font-bold">124</p>
              <p className="text-sm text-white/80">Active SVIP Users</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <TrendingUp className="h-8 w-8 mb-2" />
              <p className="text-3xl font-bold">$12,450</p>
              <p className="text-sm text-white/80">Monthly Revenue</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Users className="h-8 w-8 mb-2" />
              <p className="text-3xl font-bold">89%</p>
              <p className="text-sm text-white/80">Renewal Rate</p>
            </Card>
          </div>

          {/* SVIP Levels */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">SVIP Levels Configuration</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((level) => (
                <div key={level} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white font-bold">
                    {level}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">SVIP Level {level}</p>
                    <p className="text-sm text-gray-600">Required Points: {level * 1000} | Price: ${level * 10}/month</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit Benefits</Button>
                    <Button size="sm" variant="outline">Pricing</Button>
                    <Button size="sm" variant="outline">View Users</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SVIP Benefits */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Available Benefits</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                'Exclusive Chat Masks',
                'Room Chat Masks',
                'Wealth Badge',
                'Custom Avatar Frame',
                'Luxury Gift Display',
                'Animated Stickers',
                'Profile Card',
                'Profile Theme',
                'Emoji Pack',
                'Lucky Coins',
                'Diamond Rewards',
                'Visitor Log'
              ].map((benefit, i) => (
                <div key={i} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <Shield className="h-6 w-6 text-purple-500 mb-2" />
                  <p className="text-sm font-medium">{benefit}</p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">Edit</Button>
                    <Button size="sm" variant="ghost" className="flex-1 text-xs">Toggle</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="blocklist" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Blocklist Management</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                Export Report
              </Button>
              <Button variant="default">
                View All Blocks
              </Button>
            </div>
          </div>

          {/* Blocklist Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <Card className="p-5 bg-gradient-to-br from-red-500 to-pink-500 text-white">
              <Shield className="h-8 w-8 mb-2" />
              <p className="text-3xl font-bold">156</p>
              <p className="text-sm text-white/80">Total Blocked Users</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <Activity className="h-8 w-8 mb-2" />
              <p className="text-3xl font-bold">23</p>
              <p className="text-sm text-white/80">Blocks Today</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
              <TrendingUp className="h-8 w-8 mb-2" />
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-white/80">Unblocked Today</p>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Users className="h-8 w-8 mb-2" />
              <p className="text-3xl font-bold">89</p>
              <p className="text-sm text-white/80">Mutual Blocks</p>
            </Card>
          </div>

          {/* Block Reasons */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Block Reasons</h3>
            <div className="space-y-2">
              {[
                { reason: 'Inappropriate Behavior', count: 45, color: 'bg-red-500' },
                { reason: 'Spam/Advertisement', count: 38, color: 'bg-orange-500' },
                { reason: 'Harassment', count: 32, color: 'bg-yellow-500' },
                { reason: 'Offensive Language', count: 24, color: 'bg-purple-500' },
                { reason: 'Scam/Fraud', count: 17, color: 'bg-pink-500' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.reason}</span>
                      <span className="text-sm text-gray-600">{item.count} blocks</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color}`} 
                        style={{ width: `${(item.count / 45) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Blocks */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Blocks (Last 24h)</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      U{i}
                    </div>
                    <div>
                      <p className="font-semibold">User {i}</p>
                      <p className="text-sm text-gray-600">Blocked User {i + 10}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{i} hour{i > 1 ? 's' : ''} ago</p>
                    <p className="text-xs text-gray-500">Reason: Spam</p>
                  </div>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Dashboard;