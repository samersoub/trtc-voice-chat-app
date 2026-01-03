"use client";

import React from "react";
import RoomNotification from "./RoomNotification";

interface NotificationItem {
  id: string;
  type: "join" | "leave";
  userName: string;
  userAvatar?: string;
  isHost?: boolean;
}

interface RoomNotificationContainerProps {
  notifications: NotificationItem[];
}

const RoomNotificationContainer: React.FC<RoomNotificationContainerProps> = ({
  notifications,
}) => {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.slice(-3).map((notification) => (
        <RoomNotification
          key={notification.id}
          type={notification.type}
          userName={notification.userName}
          userAvatar={notification.userAvatar}
          isHost={notification.isHost}
        />
      ))}
    </div>
  );
};

export default RoomNotificationContainer;
