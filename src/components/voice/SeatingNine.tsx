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
  showFrame?: boolean;
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
  showFrame = true,
}) => {
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
          "rounded-2xl p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-700/20 border border-yellow-500/50 shadow-xl backdrop-blur-lg"
        )}
      >
        <div className="cursor-pointer hover:scale-105 transition-transform" onClick={onClickHost}>
          <Seat
            name={hostName}
            imageUrl={hostAvatarUrl}
            speaking={false}
            muted={false}
            locked={false}
            showFrame={showFrame}
            avatarClassName={"h-12 w-12 sm:h-14 sm:w-14"}
          />
        </div>

        {/* Host info badges under seat */}
        <div className="mt-2 flex items-center gap-2">
          {flagEmoji && (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/30 border border-yellow-500/50 text-lg">
              {flagEmoji}
            </span>
          )}
          <span className="text-sm px-3 py-1 rounded-full bg-yellow-600/30 border border-yellow-600/50 text-yellow-100">
            المضيف
          </span>
        </div>
      </div>

      {/* Circular guest seats */}
      <div className="relative w-[320px] h-[320px]">
        {paddedGuests.map((seat, i) => {
          const angle = (i / paddedGuests.length) * 360;
          const empty = !seat.userId;
          return (
            <div
              key={seat.index}
              className="absolute transition-transform hover:scale-110"
              style={{
                transform: `rotate(${angle}deg) translate(150px) rotate(-${angle}deg)`,
              }}
            >
              {empty ? (
                <button
                  type="button"
                  onClick={() => onClickGuest?.(seat.index, seat)}
                  className="relative flex items-center justify-center h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-gradient-to-br from-white/10 to-white/20 border border-white/30 hover:bg-white/30 transition-colors backdrop-blur-md shadow-md"
                  aria-label={`Take seat ${seat.index}`}
                >
                  <Plus className="h-6 w-6 text-white/85" />
                  <span className="absolute -bottom-5 text-xs text-white/80"> {seat.index} </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onClickGuest?.(seat.index, seat)}
                  className="cursor-pointer"
                  aria-label={`Seat ${seat.index} • ${seat.name ?? "Guest"}`}
                >
                  <Seat
                    name={seat.name || "Guest"}
                    speaking={!!seat.speaking}
                    muted={!!seat.muted}
                    locked={!!seat.locked}
                    showFrame={showFrame}
                  />
                  <div className="mt-1 text-xs text-white/75 text-center">{seat.index}</div>
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