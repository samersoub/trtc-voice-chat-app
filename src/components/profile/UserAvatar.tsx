"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import UserProfileModal from "./UserProfileModal";
import { UserStatusService, UserStatus } from "@/services/UserStatusService";

interface UserAvatarProps {
  userId: string;
  userName: string;
  avatarUrl?: string;
  bio?: string;
  status?: UserStatus; // Now using full UserStatus type
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  onClick?: () => void;
  enableProfileModal?: boolean; // New prop to enable modal on click
  className?: string;
  useRealTimeStatus?: boolean; // Fetch real-time status from UserStatusService
}

const SIZE_CONFIG = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-2xl",
};

const STATUS_SIZE_CONFIG = {
  xs: "w-2 h-2 border",
  sm: "w-2.5 h-2.5 border-2",
  md: "w-3 h-3 border-2",
  lg: "w-3.5 h-3.5 border-2",
  xl: "w-4 h-4 border-2",
};

const STATUS_POSITION_CONFIG = {
  xs: "bottom-0 right-0",
  sm: "bottom-0 right-0",
  md: "bottom-0 right-0",
  lg: "bottom-0.5 right-0.5",
  xl: "bottom-1 right-1",
};

const STATUS_COLOR: Record<UserStatus, string> = {
  online: "bg-green-500",
  "in-room": "bg-purple-500",
  away: "bg-yellow-500",
  dnd: "bg-red-500",
  offline: "bg-gray-400",
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  userName,
  avatarUrl,
  bio,
  status: propStatus,
  size = "md",
  showStatus = true,
  onClick,
  enableProfileModal = true, // Default to true for profile modal
  className,
  useRealTimeStatus = false, // Default to false for backwards compatibility
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<UserStatus>(propStatus || 'offline');

  // Subscribe to real-time status updates
  useEffect(() => {
    if (useRealTimeStatus) {
      const updateStatus = () => {
        const statusData = UserStatusService.getStatus(userId);
        setCurrentStatus(statusData.status);
      };

      updateStatus();
      const unsubscribe = UserStatusService.subscribe(updateStatus);
      return unsubscribe;
    } else if (propStatus) {
      setCurrentStatus(propStatus);
    }
  }, [userId, propStatus, useRealTimeStatus]);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (enableProfileModal) {
      setIsModalOpen(true);
    }
  };

  const isPulsing = currentStatus === 'in-room'; // Pulse animation for in-room status

  return (
    <>
      <div
        className={cn(
          "relative inline-block",
          (onClick || enableProfileModal) && "cursor-pointer hover:opacity-80 transition-opacity",
          className
        )}
        onClick={handleClick}
        {...((onClick || enableProfileModal) ? { role: "button", tabIndex: 0 } : {})}
        onKeyDown={(e) => {
          if ((onClick || enableProfileModal) && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div
          className={cn(
            "rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-semibold text-white shadow-md",
            SIZE_CONFIG[size]
          )}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {showStatus && (
          <div
            className={cn(
              "absolute rounded-full border-white dark:border-gray-900",
              STATUS_SIZE_CONFIG[size],
              STATUS_POSITION_CONFIG[size],
              STATUS_COLOR[currentStatus],
              isPulsing && "animate-pulse" // Add pulse animation for in-room
            )}
            aria-label={`User is ${UserStatusService.getStatusLabel(currentStatus)}`}
          />
        )}
      </div>

      {/* Profile Modal */}
      {enableProfileModal && (
        <UserProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={userId}
          userName={userName}
          avatarUrl={avatarUrl}
          bio={bio}
        />
      )}
    </>
  );
};

export default UserAvatar;
