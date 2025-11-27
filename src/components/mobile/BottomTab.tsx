"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquareText, Camera, Gamepad2, User2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/messages", label: "Messages", icon: MessageSquareText },
  { to: "/voice/create", label: "Create", icon: Camera, center: true },
  { to: "/hosts", label: "Games", icon: Gamepad2 },
  { to: "/profile", label: "Profile", icon: User2 },
];

const BottomTab: React.FC = () => {
  const loc = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto w-full max-w-4xl bg-white/80 backdrop-blur border-t">
        <div className="grid grid-cols-5 min-w-0">
          {items.map(({ to, label, icon: Icon, center }) => {
            const active = loc.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center py-2 text-xs min-w-0",
                  active ? "text-teal-600" : "text-muted-foreground",
                  center ? "relative" : ""
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center",
                    center
                      ? "h-12 w-12 -mt-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow"
                      : ""
                  )}
                >
                  <Icon className={cn("h-5 w-5", center ? "h-6 w-6" : "")} />
                </div>
                <span className={cn(center ? "mt-1 font-semibold text-[10px] whitespace-nowrap" : "whitespace-nowrap")}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomTab;