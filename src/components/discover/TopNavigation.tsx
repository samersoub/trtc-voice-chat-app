"use client";

import React from "react";
import { Search, Bell, User, Sparkles, LogOut, Settings, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/profile/UserAvatar";
import UserProfilePopup from "@/components/profile/UserProfilePopup";
import { NotificationBell } from "@/components/NotificationBell";

type FilterType = "all" | "popular" | "new" | "following";

interface TopNavigationProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: FilterType) => void;
  activeFilter?: FilterType;
  notificationCount?: number;
  userAvatar?: string;
  userName?: string;
  userId?: string;
  userStatus?: "online" | "in-room" | "away" | "dnd" | "offline";
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onSettingsClick?: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  onSearch,
  onFilterChange,
  activeFilter = "all",
  notificationCount = 0,
  userAvatar,
  userName = "المستخدم",
  userId = "current-user",
  userStatus = "online",
  onNotificationClick,
  onProfileClick,
  onLogout,
  onSettingsClick,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showProfilePopup, setShowProfilePopup] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const filters: Array<{ key: FilterType; label: string; icon?: React.ReactNode }> = [
    { key: "all", label: "الجميع" },
    { key: "popular", label: "الشائع", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: "new", label: "جديد" },
    { key: "following", label: "متابعين" },
  ];

  return (
    <div
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
          : "bg-white/80 dark:bg-gray-900/80"
      )}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        {/* Top Row: Logo, Search, User Actions */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🎤</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                غرف الصوت
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Voice Rooms</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="ابحث عن غرف..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pr-8 sm:pr-10 pl-3 sm:pl-4 h-9 sm:h-10 text-sm rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              dir="rtl"
            />
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notifications */}
            <NotificationBell />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-1.5 sm:px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all btn-press"
                >
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                    {userName}
                  </span>
                  <UserAvatar
                    userId={userId}
                    userName={userName}
                    avatarUrl={userAvatar}
                    status={userStatus}
                    size="sm"
                    showStatus={true}
                    onClick={() => setShowProfilePopup(true)}
                    className="ring-2 ring-blue-500"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-right">حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    setShowProfilePopup(true);
                    onProfileClick?.();
                  }} 
                  className="cursor-pointer"
                >
                  <UserCircle className="ml-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
                  <Settings className="ml-2 h-4 w-4" />
                  <span>الإعدادات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600 dark:text-red-400">
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bottom Row: Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              onClick={() => onFilterChange?.(filter.key)}
              variant={activeFilter === filter.key ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 flex-shrink-0 btn-press",
                activeFilter === filter.key
                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 scale-105"
                  : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:scale-105"
              )}
            >
              {filter.icon && <span className="ml-1">{filter.icon}</span>}
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Profile Popup */}
      <UserProfilePopup
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        userId={userId}
        userName={userName}
        userAvatar={userAvatar}
        userStatus={userStatus}
        isOwnProfile={true}
      />
    </div>
  );
};

export default TopNavigation;
