"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import ChatLayout from "@/components/chat/ChatLayout";
import DiscoverHeader from "@/components/discover/DiscoverHeader";
import LuxBannerCarousel from "@/components/discover/LuxBannerCarousel";
import ArabicQuickActions from "@/components/discover/ArabicQuickActions";
import FilterTagsBar from "@/components/discover/FilterTagsBar";
import LuxRoomsGrid from "@/components/discover/LuxRoomsGrid";
import { useLocale } from "@/contexts";
import { fetchActiveRooms } from "@/services/roomService";
import { RoomData } from "@/models/RoomData";

const Index: React.FC = () => {
  const [rooms, setRooms] = React.useState<RoomData[]>([]);
  const [activeTab, setActiveTab] = React.useState<"popular" | "following">("popular");
  const [selectedTag, setSelectedTag] = React.useState<string>("الجميع");
  const navigate = useNavigate();

  const { setLocale } = useLocale();
  React.useEffect(() => {
    // Force Arabic + RTL for this design
    setLocale("ar");
  }, [setLocale]);

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

  return (
    <ChatLayout hideHeader>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 pb-24 sm:pb-28" dir="rtl">
        <DiscoverHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <LuxBannerCarousel />
        <ArabicQuickActions />
        <FilterTagsBar selected={selectedTag} onChange={setSelectedTag} />
        <LuxRoomsGrid
          rooms={rooms}
          filter={selectedTag}
          onEnter={(roomId) => navigate(`/voice/rooms/${roomId}/join?autoJoin=1`)}
        />
      </div>
    </ChatLayout>
  );
};

export default Index;