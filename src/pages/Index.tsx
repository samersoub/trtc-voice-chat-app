import React from "react";
import { useNavigate } from "react-router-dom";
import ChatLayout from "@/components/chat/ChatLayout";
import TopNavigation from "@/components/discover/TopNavigation";
import DiscoverHeader from "@/components/discover/DiscoverHeader";
import LuxBannerCarousel from "@/components/discover/LuxBannerCarousel";
import ArabicQuickActions from "@/components/discover/ArabicQuickActions";
import FilterTagsBar from "@/components/discover/FilterTagsBar";
import LuxRoomsGrid from "@/components/discover/LuxRoomsGrid";
import ActiveRoomsScroll from "@/components/discover/ActiveRoomsScroll";
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
      <div className="p-3 sm:p-4 lg:p-6 max-w-6xl mx-auto space-y-3 sm:space-y-4 pb-20 sm:pb-24 md:pb-28" dir="rtl">
        <DiscoverHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <LuxBannerCarousel />
        <ArabicQuickActions />
        <ActiveRoomsScroll 
          rooms={rooms} 
          onRoomClick={(roomId) => navigate(`/voice/rooms/${roomId}/join?autoJoin=1`)}
        />
        <FilterTagsBar selected={selectedTag} onChange={setSelectedTag} />
        <LuxRoomsGrid
          rooms={filteredRooms.length > 0 || searchQuery || activeFilter !== "all" ? filteredRooms : rooms}
          filter={selectedTag}
          onEnter={(roomId) => navigate(`/voice/rooms/${roomId}/join?autoJoin=1`)}
        />
      </div>

      {/* Floating Action Button for Create Room */}
      <Button
        onClick={() => setShowCreateRoom(true)}
        className="fixed bottom-16 sm:bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 md:right-6 z-40 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 btn-press animate-bounce-subtle touch-manipulation"
        size="icon"
      >
        <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onCreate={handleCreateRoom}
      />
    </ChatLayout>
  );
};

export default Index;