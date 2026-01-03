"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EconomyService as ES, type Inventory } from "@/services/EconomyService";
import { cn } from "@/lib/utils";

const AvatarWithFrame: React.FC<{ name?: string; imageUrl?: string; size?: number }> = ({ name = "User", imageUrl, size = 96 }) => {
  const [inv, setInv] = React.useState<Inventory>(ES.getInventory());

  React.useEffect(() => {
    const onInv = (e: Event) => setInv((e as CustomEvent<Inventory>).detail);
    window.addEventListener("economy:inventory", onInv);
    return () => window.removeEventListener("economy:inventory", onInv);
  }, []);

  const hasFrame = !!inv.equippedFrame;

  function resolveFrameStyle(id?: string) {
    switch (id) {
      case "vip":
        return {
          ring: "ring-2 ring-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.6)]",
          label: "VIP Gold Frame",
          labelClass: "text-[#FFD700]",
        };
      case "silver":
        return {
          ring: "ring-2 ring-gray-300 shadow-[0_0_8px_rgba(156,163,175,0.6)]",
          label: "Silver Frame",
          labelClass: "text-gray-400",
        };
      case "neon":
        return {
          ring: "ring-2 ring-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.7)]",
          label: "Neon Frame",
          labelClass: "text-fuchsia-500",
        };
      default:
        return {
          ring: "ring-2 ring-white/20",
          label: undefined,
          labelClass: "text-muted-foreground",
        };
    }
  }

  const { ring, label, labelClass } = resolveFrameStyle(inv.equippedFrame);

  return (
    <div className="inline-flex flex-col items-center">
      <div className={cn("rounded-full p-1", ring)} style={{ width: size + 8, height: size + 8 }}>
        <Avatar style={{ width: size, height: size }}>
          {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : <AvatarFallback className="bg-purple-500/30 text-white">{name.slice(0, 1).toUpperCase()}</AvatarFallback>}
        </Avatar>
      </div>
      {hasFrame && label && <div className={cn("mt-1 text-[10px]", labelClass)}>{label}</div>}
    </div>
  );
};

export default AvatarWithFrame;