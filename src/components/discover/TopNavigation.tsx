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
  const [searchMode, setSearchMode] = React.useState<"rooms" | "users">("rooms");
  const [showUserSearchDialog, setShowUserSearchDialog] = React.useState(false);
  const [userSearchId, setUserSearchId] = React.useState("");

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
    
    // Check if searching by ID (numbers only)
    if (/^\d+$/.test(value.trim()) && value.trim().length > 3) {
      setSearchMode("users");
    } else {
      setSearchMode("rooms");
    }
    
    onSearch?.(value);
  };

  const handleUserSearch = () => {
    if (userSearchId.trim()) {
      // TODO: Navigate to user profile or show user card
      window.location.href = `/profile/${userSearchId}`;
      setShowUserSearchDialog(false);
      setUserSearchId("");
    }
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
            <div className="w-auto h-16 sm:h-20 flex items-center justify-center">
              <img 
                src="/images/dandanh-logo.png.jpg" 
                alt="Dandanh Chat Logo" 
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                دندنة شات
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">دندنة شات</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder={searchMode === "rooms" ? "ابحث عن غرف..." : "ابحث بالـ ID..."}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pr-8 sm:pr-10 pl-3 sm:pl-4 h-9 sm:h-10 text-sm rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  dir="rtl"
                />
              </div>
              <Button
                onClick={() => setShowUserSearchDialog(true)}
                variant="outline"
                size="sm"
                className="h-9 sm:h-10 px-2 sm:px-3 rounded-full border-gray-200/50 dark:border-gray-700/50 hover:bg-blue-50 dark:hover:bg-gray-800"
                title="البحث عن مستخدم"
              >
                <User className="h-4 w-4 text-blue-500" />
              </Button>
            </div>
          </div>

          {/* User Search Dialog */}
          {showUserSearchDialog && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowUserSearchDialog(false)}>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-purple-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-white font-bold text-xl mb-4 text-center" dir="rtl">البحث عن مستخدم</h3>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={userSearchId}
                      onChange={(e) => setUserSearchId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
                      placeholder="أدخل ID المستخدم"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      dir="rtl"
                      autoFocus
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowUserSearchDialog(false); setUserSearchId(''); }}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleUserSearch}
                    disabled={!userSearchId.trim()}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    بحث
                  </button>
                </div>
              </div>
            </div>
          )}

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
