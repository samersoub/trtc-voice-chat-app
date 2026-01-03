import React from "react";
import { useNavigate } from "react-router-dom";
import ChatLayout from "@/components/chat/ChatLayout";
import TopNavigation from "@/components/discover/TopNavigation";
import DiscoverHeader from "@/components/discover/DiscoverHeader";
import LuxBannerCarousel from "@/components/discover/LuxBannerCarousel";
import ArabicQuickActions from "@/components/discover/ArabicQuickActions";
import Phase1QuickAccess from "@/components/discover/Phase1QuickAccess";
import FilterTagsBar from "@/components/discover/FilterTagsBar";
import LuxRoomsGrid from "@/components/discover/LuxRoomsGrid";
import ActiveRoomsScroll from "@/components/discover/ActiveRoomsScroll";
import SmartAssistant from "@/components/chat/SmartAssistant";
import { useLocale } from "@/contexts";
import { fetchActiveRooms } from "@/services/roomService";
import { RoomData } from "@/models/RoomData";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { AuthService } from "@/services/AuthService";
import { UserProfileService } from "@/services/UserProfileService";
import { showSuccess } from "@/utils/toast";
import CreateRoomModal, { RoomCreationData } from "@/components/voice/CreateRoomModal";
import { initializeDemoPresence } from "@/utils/demoData";
import { MomentsService } from "@/services/MomentsService";
import { InviteRewardsService } from "@/services/InviteRewardsService";
import { MessagesService } from "@/services/MessagesService";
import { RelationshipLevelService } from "@/services/RelationshipLevelService";

const Index: React.FC = () => {
  const [rooms, setRooms] = React.useState<RoomData[]>([]);
  const [filteredRooms, setFilteredRooms] = React.useState<RoomData[]>([]);
  const [activeTab, setActiveTab] = React.useState<"popular" | "following">("popular");
  const [selectedTag, setSelectedTag] = React.useState<string>("الجميع");
  const [activeFilter, setActiveFilter] = React.useState<"all" | "popular" | "new" | "following">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showCreateRoom, setShowCreateRoom] = React.useState(false);
  const navigate = useNavigate();

  // Get current user data
  const currentUser = AuthService.getCurrentUser();
  const userId = currentUser?.id || "guest";
  const userAvatar = currentUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
  const userName = currentUser?.name || "المستخدم";
  const userStatus = UserProfileService.getUserStatus(userId);

  const { setLocale } = useLocale();
  
  React.useEffect(() => {
    // Force Arabic + RTL for this design
    setLocale("ar");
    
    // Initialize demo data for testing user presence
    initializeDemoPresence();
    
    // Initialize demo posts
    MomentsService.initializeDemoPosts();
    
    // Initialize invite rewards demo data
    if (currentUser?.id) {
      InviteRewardsService.initializeDemoData(currentUser.id);
    }
    
    // Initialize messages demo data
    if (currentUser?.id) {
      MessagesService.initializeDemoMessages(currentUser.id);
    }
    
    // Initialize relationship level demo data
    if (currentUser?.id) {
      RelationshipLevelService.initializeDemoRelationship(currentUser.id);
    }
    
    // Initialize badges and wealth demo data
    const initBadges = async () => {
      if (currentUser?.id) {
        const { BadgeService } = await import('@/services/BadgeService');
        BadgeService.initializeDemoData();
        
        const { WealthLevelService } = await import('@/services/WealthLevelService');
        WealthLevelService.initializeDemoData();
      }
    };
    initBadges();
  }, [setLocale, currentUser?.id]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await fetchActiveRooms();
      if (mounted) setRooms(data);
    };
    load();
    const id = setInterval(load, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // Filter and search rooms
  React.useEffect(() => {
    let filtered = [...rooms];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(room =>
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.hostName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case "popular":
        filtered = filtered.filter(room => room.listenerCount > 50).sort((a, b) => b.listenerCount - a.listenerCount);
        break;
      case "new":
        filtered = filtered.filter(room => room.tags?.includes("New"));
        break;
      case "following":
        // TODO: Filter by followed hosts when feature is implemented
        break;
      case "all":
      default:
        // Show all rooms
        break;
    }

    setFilteredRooms(filtered);
  }, [rooms, searchQuery, activeFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: "all" | "popular" | "new" | "following") => {
    setActiveFilter(filter);
  };

  const handleLogout = () => {
    AuthService.logout();
    showSuccess("تم تسجيل الخروج بنجاح");
    navigate("/auth/login");
  };

  const handleSettings = () => {
    navigate("/profile/settings");
  };

  const handleCreateRoom = async (roomData: RoomCreationData) => {
    try {
      // TODO: Implement actual room creation with backend
      console.log("Creating room with data:", roomData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess(`Room "${roomData.name}" created successfully!`);
      
      // Navigate to the new room (for now, navigate to first room as placeholder)
      if (rooms.length > 0) {
        navigate(`/voice/rooms/${rooms[0].id}/join?autoJoin=1`);
      }
    } catch (error) {
      throw new Error("Failed to create room");
    }
  };

  return (
    <ChatLayout hideHeader>
      <TopNavigation
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        activeFilter={activeFilter}
        notificationCount={3}
        userId={userId}
        userAvatar={userAvatar}
        userName={userName}
        userStatus={userStatus}
        onNotificationClick={() => navigate("/notifications")}
        onProfileClick={() => navigate("/profile")}
        onLogout={handleLogout}
        onSettingsClick={handleSettings}
      />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }} />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s', animationDuration: '12s' }} />
      </div>

      <div className="relative p-3 sm:p-4 lg:p-6 max-w-6xl mx-auto space-y-3 sm:space-y-4 pb-20 sm:pb-24 md:pb-28 animate-fade-in" dir="rtl">
        <div className="animate-slide-down" style={{ animationDelay: '100ms' }}>
          <DiscoverHeader activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        <div className="animate-slide-down" style={{ animationDelay: '200ms' }}>
          <LuxBannerCarousel />
        </div>
        
        <div className="animate-slide-down" style={{ animationDelay: '300ms' }}>
          <ArabicQuickActions />
        </div>
        
        <div className="animate-slide-down" style={{ animationDelay: '400ms' }}>
          <Phase1QuickAccess />
        </div>
        
        <div className="animate-slide-down" style={{ animationDelay: '500ms' }}>
          <ActiveRoomsScroll 
            rooms={rooms} 
            onRoomClick={(roomId) => navigate(`/voice/rooms/${roomId}/join?autoJoin=1`)}
          />
        </div>
        
        <div className="animate-slide-down" style={{ animationDelay: '600ms' }}>
          <FilterTagsBar selected={selectedTag} onChange={setSelectedTag} />
        </div>
        
        <div className="animate-slide-down" style={{ animationDelay: '700ms' }}>
          <LuxRoomsGrid
            rooms={filteredRooms.length > 0 || searchQuery || activeFilter !== "all" ? filteredRooms : rooms}
            filter={selectedTag}
            onEnter={(roomId) => {
              console.log('🚀 Navigating to room:', roomId, 'Path:', `/voice/rooms/${roomId}/join?autoJoin=1`);
              navigate(`/voice/rooms/${roomId}/join?autoJoin=1`);
            }}
          />
        </div>
      </div>

      {/* Floating Action Button for Create Room with Enhanced Effects */}
      <div className="fixed bottom-16 sm:bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 md:right-6 z-40 animate-scale-in" style={{ animationDelay: '800ms' }}>
        {/* Pulse Rings */}
        <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        
        <Button
          onClick={() => setShowCreateRoom(true)}
          className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-2xl hover:shadow-purple-500/60 hover:scale-110 transition-all duration-300 btn-press touch-manipulation overflow-hidden group"
          size="icon"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          
          {/* Plus Icon with Animation */}
          <Plus className="h-5 w-5 sm:h-6 sm:w-6 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onCreate={handleCreateRoom}
      />

      {/* Smart Assistant */}
      <SmartAssistant />
    </ChatLayout>
  );
};

export default Index;