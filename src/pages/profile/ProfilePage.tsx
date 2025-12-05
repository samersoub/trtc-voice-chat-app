"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Edit2, Check, Trophy, Users, MessageCircle, Clock } from "lucide-react";
import ChatLayout from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/AuthService";
import { UserProfileService, UserProfileData, UserStats, RecentRoom } from "@/services/UserProfileService";
import { showSuccess, showError } from "@/utils/toast";

const STATUS_CONFIG = {
  online: { label: "Online", color: "bg-green-500", textColor: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" },
  busy: { label: "Busy", color: "bg-red-500", textColor: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" },
  away: { label: "Away", color: "bg-yellow-500", textColor: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
  offline: { label: "Offline", color: "bg-gray-400", textColor: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-900/20" },
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [userName, setUserName] = React.useState(currentUser?.name || "User");
  const [bio, setBio] = React.useState("");
  const [status, setStatus] = React.useState<"online" | "busy" | "away" | "offline">("online");
  const [avatar, setAvatar] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState(currentUser?.avatarUrl);
  const [stats, setStats] = React.useState<UserStats>({
    totalRooms: 0,
    totalMinutes: 0,
    totalMessages: 0,
    friendsCount: 0,
    level: 1,
    xp: 0,
  });
  const [recentRooms, setRecentRooms] = React.useState<RecentRoom[]>([]);

  const userId = currentUser?.id || "guest";

  // Load profile data
  React.useEffect(() => {
    const loadProfile = async () => {
      const profile = await UserProfileService.getProfile(userId);
      if (profile) {
        setUserName(profile.name || profile.username || "User");
        setBio(profile.bio || "");
        setStatus(profile.status || "online");
        setAvatarPreview(profile.avatarUrl);
        setStats(profile.stats || stats);
        setRecentRooms(profile.recentRooms || []);
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("Avatar must be less than 5MB");
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const profileData: UserProfileData = {
        displayName: userName,
        bio,
        status,
        avatar: avatar || avatarPreview,
      };

      const success = await UserProfileService.updateProfile(userId, profileData);
      
      if (success) {
        showSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        showError("Failed to update profile");
      }
    } catch (error) {
      console.error("Save error:", error);
      showError("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUserName(currentUser?.name || "User");
    const profileData = UserProfileService.getProfile(userId);
    profileData.then(p => {
      if (p) {
        setBio(p.bio || "");
        setStatus(p.status || "online");
      }
    });
    setAvatar(null);
    setAvatarPreview(currentUser?.avatarUrl);
    setIsEditing(false);
  };

  const xpToNextLevel = stats.level * 1000;
  const xpProgress = (stats.xp / xpToNextLevel) * 100;

  return (
    <ChatLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Profile</h1>
            <div className="w-9" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Cover Photo */}
        <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 -mt-16 sm:-mt-20">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200 shadow-2xl">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div className={cn(
                "absolute bottom-3 right-3 w-7 h-7 rounded-full border-4 border-white dark:border-gray-900",
                STATUS_CONFIG[status].color
              )} />

              {/* Edit avatar */}
              {isEditing && (
                <>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    aria-label="Upload profile picture"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-10 w-10 text-white" />
                  </label>
                </>
              )}
            </div>

            <div className="flex-1 sm:pb-4">
              {isEditing ? (
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-3xl font-bold h-auto py-2 mb-2"
                />
              ) : (
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {userName}
                </h2>
              )}
              
              {isEditing ? (
                <Select value={status} onValueChange={(value: "online" | "busy" | "away" | "offline") => setStatus(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", config.color)} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={cn("mb-2", STATUS_CONFIG[status].bgColor, STATUS_CONFIG[status].textColor)}>
                  <div className={cn("w-2 h-2 rounded-full mr-1.5", STATUS_CONFIG[status].color)} />
                  {STATUS_CONFIG[status].label}
                </Badge>
              )}
            </div>

            <div className="sm:pb-4">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Level {stats.level}</span>
              </div>
              <span className="text-sm text-gray-500">{stats.xp} / {xpToNextLevel} XP</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <Label className="text-base font-semibold mb-3 block">About</Label>
            {isEditing ? (
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                className="min-h-[100px]"
                maxLength={200}
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                {bio || "No bio yet. Click Edit Profile to add one!"}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-100 dark:border-blue-800">
              <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRooms}</div>
              <div className="text-sm text-gray-500">Rooms Joined</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-100 dark:border-purple-800">
              <Clock className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.floor(stats.totalMinutes / 60)}h</div>
              <div className="text-sm text-gray-500">Time Spent</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-100 dark:border-green-800">
              <MessageCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMessages}</div>
              <div className="text-sm text-gray-500">Messages</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center border border-orange-100 dark:border-orange-800">
              <Users className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.friendsCount}</div>
              <div className="text-sm text-gray-500">Friends</div>
            </div>
          </div>

          {/* Recent Rooms */}
          {recentRooms.length > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <Label className="text-base font-semibold mb-4 block">Recent Activity</Label>
              <div className="space-y-3">
                {recentRooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate(`/voice/rooms/${room.roomId}/join`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {room.roomName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {room.lastVisit} • {room.duration} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ChatLayout>
  );
};

export default ProfilePage;
