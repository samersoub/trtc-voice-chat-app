"use client";

import React from "react";
import Seat from "@/components/voice/Seat";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

type GuestSeat = {
  index: number; // 1..8 display number
  userId?: string;
  name?: string;
  muted?: boolean;
  locked?: boolean;
  speaking?: boolean;
};

type SeatingNineProps = {
  hostName?: string;
  hostAvatarUrl?: string;
  hostFlagCode?: string; // ISO-2 like "JO"
  onClickHost?: () => void;
  guests: GuestSeat[];
  onClickGuest?: (index: number, seat: GuestSeat) => void;
};

function codeToFlagEmoji(code?: string): string | null {
  if (!code) return null;
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2) return null;
  const base = 127397;
  return String.fromCodePoint(cc.charCodeAt(0) + base) + String.fromCodePoint(cc.charCodeAt(1) + base);
}

const SeatingNine: React.FC<SeatingNineProps> = ({
  hostName = "Host",
  hostAvatarUrl,
  hostFlagCode,
  onClickHost,
  guests,
  onClickGuest,
}) => {
  // Ensure exactly 8 guest slots
  const paddedGuests: GuestSeat[] = Array.from({ length: 8 }, (_, i) => {
    const found = guests.find((g) => g.index === i + 1);
    return (
      found || {
        index: i + 1,
        muted: false,
        locked: false,
        speaking: false,
      }
    );
  });

  const flagEmoji = codeToFlagEmoji(hostFlagCode);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Host seat at the top center */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center",
          "rounded-2xl p-4 bg-white/10 border border-yellow-500/30 shadow-lg backdrop-blur"
        )}
      >
        <div className="cursor-pointer" onClick={onClickHost}>
          <Seat name={hostName} imageUrl={hostAvatarUrl} speaking={false} muted={false} locked={false} />
        </div>

        {/* Host info badges under seat */}
        <div className="mt-2 flex items-center gap-2">
          {flagEmoji && (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/40 text-lg">
              {flagEmoji}
            </span>
          )}
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-600/20 border border-yellow-600/30 text-yellow-100">
            المضيف
          </span>
        </div>
      </div>

      {/* 8 guest seats: 2 rows of 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {paddedGuests.map((seat) => {
          const empty = !seat.userId;
          return (
            <div key={seat.index} className="flex flex-col items-center">
              {empty ? (
                <button
                  type="button"
                  onClick={() => onClickGuest?.(seat.index, seat)}
                  className="relative flex items-center justify-center h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-white/15 border border-white/30 hover:bg-white/25 transition-colors backdrop-blur"
                  aria-label={`Take seat ${seat.index}`}
                >
                  <Plus className="h-9 w-9 text-white/85" />
                  <span className="absolute -bottom-5 text-xs text-white/80"> {seat.index} </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onClickGuest?.(seat.index, seat)}
                  className="cursor-pointer"
                  aria-label={`Seat ${seat.index} • ${seat.name ?? "Guest"}`}
                >
                  <Seat name={seat.name || "Guest"} speaking={!!seat.speaking} muted={!!seat.muted} locked={!!seat.locked} />
                  <div className="mt-1 text-[11px] text-white/75 text-center">{seat.index}</div>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeatingNine;