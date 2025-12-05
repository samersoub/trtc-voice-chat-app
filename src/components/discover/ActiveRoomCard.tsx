"use client";

import React from "react";
import { RoomData } from "@/models/RoomData";
import { Users, Heart, Share2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/profile/UserAvatar";
import UserProfilePopup from "@/components/profile/UserProfilePopup";

interface ActiveRoomCardProps {
  room: RoomData;
  onClick: (roomId: string) => void;
}

function codeToFlagEmoji(code: string): string {
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2) return "🏳️";
  const base = 127397;
  return String.fromCodePoint(cc.charCodeAt(0) + base) + String.fromCodePoint(cc.charCodeAt(1) + base);
}

const ActiveRoomCard: React.FC<ActiveRoomCardProps> = ({ room, onClick }) => {
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [isPressed, setIsPressed] = React.useState(false);
  const [showHeartBurst, setShowHeartBurst] = React.useState(false);
  const isLive = room.listenerCount > 0;
  
  // Generate mock participant avatars if guests are available, otherwise use placeholder
  const participantAvatars = room.guests
    ? room.guests
        .filter((g) => g.userId)
        .slice(0, 4)
        .map((g) => ({
          userId: g.userId,
          userName: g.displayName || "Guest",
          avatarUrl: g.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${g.userId}`,
        }))
    : Array.from({ length: Math.min(4, room.listenerCount) }, (_, i) => ({
        userId: `${room.id}-${i}`,
        userName: `Guest ${i + 1}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.id}-${i}`,
      }));

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    
    // Trigger heart burst animation
    if (!isFavorited) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 600);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: room.title,
        text: `Join ${room.title} on Voice Chat`,
        url: window.location.href,
      });
    }
  };

  return (
    <div
      onClick={() => onClick(room.id)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={cn(
        "flex-shrink-0 w-[260px] sm:w-[280px] h-[180px] sm:h-[200px] rounded-2xl overflow-hidden cursor-pointer",
        "transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
        "bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-indigo-600/90",
        "group relative",
        isPressed && "scale-[0.98] shadow-lg"
      )}
      style={{
        boxShadow: "0 8px 32px rgba(59, 130, 246, 0.25), 0 4px 16px rgba(139, 92, 246, 0.2)",
      }}
    >
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${room.coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 via-purple-600/70 to-indigo-700/70 group-hover:from-blue-600/80 group-hover:via-purple-600/80 group-hover:to-indigo-700/80 transition-all duration-300" />
      </div>

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
          <div className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse-slow">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        </div>
      )}

      {/* Heart Burst Animation */}
      {showHeartBurst && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <Heart
              key={i}
              className="absolute h-4 w-4 text-red-500 fill-current animate-heart-burst"
              style={{
                animationDelay: `${i * 0.1}s`,
                transform: `rotate(${i * 60}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex gap-1.5 sm:gap-2" dir="ltr">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleFavorite}
          className={cn(
            "h-8 w-8 rounded-full backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-lg",
            "hover:scale-110 active:scale-95",
            isFavorited 
              ? "bg-red-500/90 hover:bg-red-600/90 text-white scale-110 animate-bounce-once" 
              : "bg-white/20 hover:bg-white/30 text-white"
          )}
        >
          <Heart className={cn("h-4 w-4 transition-all duration-300", isFavorited && "fill-current scale-110")} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleShare}
          className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white shadow-md hover:shadow-lg transition-all btn-press"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-end z-10">
        {/* Room Title */}
        <h3 className="text-white font-bold text-base sm:text-lg mb-2 line-clamp-1 drop-shadow-lg">
          {room.title}
        </h3>

        {/* Host Info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 border-2 border-white shadow-lg flex items-center justify-center">
              <Crown className="h-4 w-4 text-white drop-shadow" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 text-sm">
              {codeToFlagEmoji(room.countryFlag)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate drop-shadow">
              {room.hostName}
            </p>
            <p className="text-white/90 text-xs font-semibold">
              Level {room.hostLevel}
            </p>
          </div>
        </div>

        {/* Participants Row */}
        <div className="flex items-center justify-between">
          {/* Participant Avatars */}
          <div className="flex items-center">
            {participantAvatars.length > 0 && (
              <div className="flex -space-x-2">
                {participantAvatars.map((participant, idx) => (
                  <div
                    key={idx}
                    className="relative"
                    style={{ zIndex: participantAvatars.length - idx }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUserId(participant.userId);
                    }}
                  >
                    <UserAvatar
                      userId={participant.userId}
                      userName={participant.userName}
                      avatarUrl={participant.avatarUrl}
                      size="sm"
                      showStatus={false}
                      className="ring-2 ring-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}
            {room.listenerCount > 4 && (
              <div className="ml-2 text-xs text-white/95 font-semibold drop-shadow">
                +{room.listenerCount - 4}
              </div>
            )}
          </div>

          {/* Participant Count */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-sm shadow-md">
            <Users className="h-3.5 w-3.5 text-white" />
            <span className="text-white text-xs font-bold">
              {room.listenerCount}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* User Profile Popup */}
      {selectedUserId && (
        <UserProfilePopup
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          userId={selectedUserId}
          userName={participantAvatars.find(p => p.userId === selectedUserId)?.userName || "User"}
          userAvatar={participantAvatars.find(p => p.userId === selectedUserId)?.avatarUrl}
          isOwnProfile={false}
        />
      )}
    </div>
  );
};

export default ActiveRoomCard;
