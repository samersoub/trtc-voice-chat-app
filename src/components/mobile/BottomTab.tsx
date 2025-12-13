"use client";

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquareText, Camera, Gamepad2, User2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationService, type Phase1Badges } from "@/services/NotificationService";
import { AuthService } from "@/services/AuthService";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/messages", label: "Messages", icon: MessageSquareText },
  { to: "/voice/create", label: "Create", icon: Camera, center: true },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/profile", label: "Profile", icon: User2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

const BottomTab: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const loc = useLocation();
  const [badges, setBadges] = useState<Phase1Badges>(() => NotificationService.getCachedPhase1Badges());
  const currentUser = AuthService.getCurrentUser();

  // Load badges on mount and when user changes
  useEffect(() => {
    const loadBadges = async () => {
      if (currentUser?.id) {
        await NotificationService.refreshPhase1Badges(currentUser.id);
        setBadges(NotificationService.getCachedPhase1Badges());
      }
    };

    loadBadges();

    // Refresh every 30 seconds
    const interval = setInterval(loadBadges, 30000);

    return () => clearInterval(interval);
  }, [currentUser?.id]);
  const colsClass = items.length === 5 ? "grid-cols-5" : items.length === 6 ? "grid-cols-6" : "grid-cols-5";
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 transition-all duration-200 ease-out pb-safe",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
      )}
      {...(!visible && { 'aria-hidden': true })}
    >
      <div className="mx-auto w-full max-w-4xl bg-white/80 backdrop-blur border-t">
        <div className={cn("grid min-w-0", colsClass)}>
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
                    "flex items-center justify-center relative",
                    center
                      ? "h-12 w-12 -mt-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow"
                      : ""
                  )}
                >
                  <Icon className={cn("h-5 w-5", center ? "h-6 w-6" : "")} />
                  
                  {/* Phase 1 Badges */}
                  {!center && (
                    <>
                      {to === "/games" && badges.wheel > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {badges.wheel > 9 ? '9+' : badges.wheel}
                        </span>
                      )}
                      {to === "/profile" && (badges.missions > 0 || badges.rewards > 0) && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {(badges.missions + badges.rewards) > 9 ? '9+' : (badges.missions + badges.rewards)}
                        </span>
                      )}
                      {to === "/" && badges.friends > 0 && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {badges.friends > 9 ? '9+' : badges.friends}
                        </span>
                      )}
                    </>
                  )}
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