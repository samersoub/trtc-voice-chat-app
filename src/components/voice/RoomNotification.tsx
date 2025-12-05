"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LogIn, LogOut, Crown } from "lucide-react";

interface RoomNotificationProps {
  type: "join" | "leave";
  userName: string;
  userAvatar?: string;
  isHost?: boolean;
}

const RoomNotification: React.FC<RoomNotificationProps> = ({
  type,
  userName,
  userAvatar,
  isHost = false,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 50);
    
    // Auto-hide after 3 seconds
    const timer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const isJoin = type === "join";

  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-lg backdrop-blur-md transition-all duration-500",
        isJoin
          ? "bg-gradient-to-r from-green-500/90 to-emerald-500/90"
          : "bg-gradient-to-r from-gray-500/90 to-slate-500/90",
        isVisible
          ? "opacity-100 translate-x-0 animate-slide-in-right"
          : "opacity-0 translate-x-full"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white/20 border-2 border-white">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {isHost && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
            <Crown className="h-3 w-3 text-yellow-900" />
          </div>
        )}
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">
          {userName}
        </p>
        <p className="text-white/90 text-sm">
          {isJoin ? "joined the room" : "left the room"}
        </p>
      </div>

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 p-2 rounded-full",
        isJoin ? "bg-white/20" : "bg-white/10"
      )}>
        {isJoin ? (
          <LogIn className="h-5 w-5 text-white" />
        ) : (
          <LogOut className="h-5 w-5 text-white" />
        )}
      </div>
    </div>
  );
};

export default RoomNotification;
