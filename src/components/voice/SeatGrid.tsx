"use client";

import React from "react";
import Seat from "./Seat";

type GridSeat = {
  id: string;
  name: string;
  imageUrl?: string;
  speaking?: boolean;
  muted?: boolean;
  locked?: boolean;
};

const SeatGrid: React.FC<{ seats: GridSeat[] }> = ({ seats }) => {
  const padded = [...seats];
  while (padded.length < 10) {
    padded.push({
      id: `empty-${padded.length}`,
      name: "Empty",
      imageUrl: undefined,
      speaking: false,
      muted: false,
      locked: false,
    });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 sm:gap-8">
      {padded.slice(0, 10).map((s) => (
        <Seat key={s.id} name={s.name} imageUrl={s.imageUrl} speaking={s.speaking} muted={s.muted} locked={s.locked} />
      ))}
    </div>
  );
};

export default SeatGrid;