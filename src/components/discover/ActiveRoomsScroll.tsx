import React from "react";
import { RoomData } from "@/models/RoomData";
import ActiveRoomCard from "./ActiveRoomCard";

interface ActiveRoomsScrollProps {
  rooms: RoomData[];
  onRoomClick?: (roomId: string) => void;
}

const ActiveRoomsScroll: React.FC<ActiveRoomsScrollProps> = ({ rooms, onRoomClick }) => {
  // Filter to only show rooms with active participants
  const activeRooms = rooms.filter(room => room.listenerCount > 0);

  if (activeRooms.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          🔥 الغرف النشطة
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {activeRooms.length} غرفة
        </div>
      </div>
      
      <div className="relative">
        {/* Gradient shadow on left - more pronounced */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent z-10 pointer-events-none" />
        
        {/* Gradient shadow on right - more pronounced */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent z-10 pointer-events-none" />
        
        {/* Scrollable container with smooth scrolling */}
        <div 
          className="overflow-x-auto scrollbar-hide pb-3 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="flex gap-3 sm:gap-4 md:gap-5 px-3">
            {activeRooms.map((room) => (
              <ActiveRoomCard
                key={room.id}
                room={room}
                onClick={() => onRoomClick?.(room.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRoomsScroll;
