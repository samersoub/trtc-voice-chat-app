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

          {/* Enhanced Search Bar with Glass Effect */}
          <div className="flex-1 max-w-md">
            <div className="flex gap-2">
              <div className="flex-1 relative group">
                {/* Search Icon with Animation */}
                <Search className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300 pointer-events-none" />
                
                {/* Glow Effect on Focus */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-300" />
                
                <Input
                  type="text"
                  placeholder={searchMode === "rooms" ? "ابحث عن غرف..." : "ابحث بالـ ID..."}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="relative w-full pr-8 sm:pr-10 pl-3 sm:pl-4 h-9 sm:h-10 text-sm rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-lg hover:shadow-xl group-focus-within:scale-[1.02]"
                  dir="rtl"
                />
              </div>
              
              {/* User Search Button with Gradient */}
              <Button
                onClick={() => setShowUserSearchDialog(true)}
                variant="outline"
                size="sm"
                className="relative h-9 sm:h-10 px-2 sm:px-3 rounded-full border-gray-200/50 dark:border-gray-700/50 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 hover:scale-110 hover:shadow-lg overflow-hidden group"
                title="البحث عن مستخدم"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                
                <User className="relative h-4 w-4 text-purple-500 group-hover:rotate-12 transition-transform duration-300" />
              </Button>
            </div>
          </div>

          {/* Enhanced User Search Dialog with Animations */}
          {showUserSearchDialog && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in" 
              onClick={() => setShowUserSearchDialog(false)}
            >
              <div 
                className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-purple-500/30 shadow-2xl animate-scale-in overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
              >
                {/* Animated Background Orbs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* Header with Gradient Text */}
                <h3 className="relative text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-bold text-2xl mb-6 text-center animate-gradient" dir="rtl">
                  البحث عن مستخدم
                </h3>
                
                {/* Input Field with Enhanced Effects */}
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-300" />
                  
                  <input
                    type="text"
                    value={userSearchId}
                    onChange={(e) => setUserSearchId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
                    placeholder="أدخل ID المستخدم"
                    className="relative w-full px-5 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg"
                    dir="rtl"
                    autoFocus
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-400 group-focus-within:scale-110 group-focus-within:text-purple-300 transition-all duration-300" />
                </div>
                
                {/* Action Buttons with Enhanced Effects */}
                <div className="relative flex gap-3">
                  <button
                    onClick={() => { setShowUserSearchDialog(false); setUserSearchId(''); }}
                    className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/10"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleUserSearch}
                    disabled={!userSearchId.trim()}
                    className="relative flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 overflow-hidden group"
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    <span className="relative">بحث</span>
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
