"use client";

import React from "react";
import { Crown, Headphones, Heart, Share2, Users } from "lucide-react";
import { RoomData } from "@/models/RoomData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  room: RoomData;
  onEnter?: (id: string) => void;
};

function codeToFlagEmoji(code: string): string {
  // Convert ISO country code to emoji flag
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2) return "🏳️";
  const base = 127397;
  return String.fromCodePoint(cc.charCodeAt(0) + base) + String.fromCodePoint(cc.charCodeAt(1) + base);
}

const LuxRoomCard: React.FC<Props> = ({ room, onEnter }) => {
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const [showHeartBurst, setShowHeartBurst] = React.useState(false);
  const listeners = room.listenerCount;
  const isLive = listeners > 0;

  // Generate participant avatars
  const participantAvatars = React.useMemo(() => {
    const avatars = [];
    const count = Math.min(listeners, 4);
    
    for (let i = 0; i < count; i++) {
      avatars.push({
        id: `${room.id}-participant-${i}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.id}-${i}`,
      });
    }
    
    return avatars;
  }, [room.id, listeners]);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
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

  const handleCardClick = () => {
    console.log('🎯 Room card clicked:', room.id, 'onEnter:', typeof onEnter);
    if (onEnter) {
      onEnter(room.id);
    } else {
      console.error('❌ onEnter is not defined!');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "relative rounded-2xl overflow-hidden group aspect-[4/5] sm:aspect-[3/4] cursor-pointer",
        "transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
        "bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-indigo-600/90"
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
          <div className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex gap-1.5 sm:gap-2" dir="ltr">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleFavorite}
          className={cn(
            "h-8 w-8 rounded-full backdrop-blur-sm transition-all shadow-md hover:shadow-lg btn-press",
            isFavorited 
              ? "bg-red-500/90 hover:bg-red-600/90 text-white scale-110" 
              : "bg-white/20 hover:bg-white/30 text-white",
            showHeartBurst && "animate-heart-beat"
          )}
        >
          <Heart className={cn("h-4 w-4 transition-transform", isFavorited && "fill-current")} />
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
        <h3 className="text-white font-bold text-lg sm:text-xl mb-3 line-clamp-2 drop-shadow-lg" dir="rtl">
          {room.title}
        </h3>

        {/* Host Info */}
        <div className="flex items-center gap-2 mb-3" dir="rtl">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 border-2 border-white shadow-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-white drop-shadow" />
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
        <div className="flex items-center justify-between" dir="rtl">
          {/* Participant Avatars */}
          <div className="flex items-center">
            {participantAvatars.length > 0 && (
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {participantAvatars.map((participant, idx) => (
                  <div
                    key={participant.id}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-white/10 backdrop-blur-sm"
                    style={{ zIndex: participantAvatars.length - idx }}
                  >
                    <img
                      src={participant.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
            {listeners > 4 && (
              <div className="mr-2 text-xs text-white/95 font-semibold drop-shadow">
                +{listeners - 4}
              </div>
            )}
          </div>

          {/* Participant Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-sm shadow-md">
            <Users className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-bold">
              {listeners}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default LuxRoomCard;