"use client";

import React from "react";
import LuxRoomCard from "./LuxRoomCard";
import { RoomData } from "@/models/RoomData";

const countryMap: Record<string, string> = {
  JO: "الأردن",
  SY: "سوريا",
  EG: "مصر",
  IQ: "العراق",
  SA: "السعودية",
  MA: "المغرب",
  DZ: "الجزائر",
  TN: "تونس",
  LY: "ليبيا",
  LB: "لبنان",
  PS: "فلسطين",
  TR: "تركيا",
  DE: "ألمانيا",
  YE: "اليمن",
};

const LuxRoomsGrid: React.FC<{ rooms: RoomData[]; filter: string; onEnter?: (id: string) => void }> = ({ rooms, filter, onEnter }) => {
  const items = rooms
    .map((room) => ({ room, countryName: countryMap[room.countryFlag] ?? room.countryFlag }))
    .filter((x) => (filter === "الجميع" ? true : x.countryName === filter));

  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">لا توجد غرف حالياً.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6" dir="rtl">
      {items.map(({ room }) => (
        <LuxRoomCard key={room.id} room={room} onEnter={onEnter} />
      ))}
    </div>
  );
};

export default LuxRoomsGrid;