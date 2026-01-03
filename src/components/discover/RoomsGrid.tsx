"use client";

import React from "react";
import RoomCard from "./RoomCard";
import { ChatRoom } from "@/models/ChatRoom";

const RoomsGrid: React.FC<{ rooms: ChatRoom[] }> = ({ rooms }) => {
  if (rooms.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No active rooms yet. Create one to start chatting!</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {rooms.map((r) => (
        <RoomCard key={r.id} room={r} />
      ))}
    </div>
  );
};

export default RoomsGrid;