"use client";

import React from "react";
import { X, Edit2, Check, Camera, Mail, Calendar, Trophy, MessageCircle, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userAvatar?: string;
  userStatus?: "online" | "in-room" | "away" | "dnd" | "offline";
  userBio?: string;
  userEmail?: string;
  joinedDate?: string;
  isOwnProfile?: boolean;
  onSave?: (data: UserProfileData) => Promise<void>;
  stats?: UserStats;
  recentRooms?: RecentRoom[];
}

export interface UserProfileData {
  displayName: string;
  bio: string;
  status: "online" | "in-room" | "away" | "dnd" | "offline";
  avatar?: File | string;
}

export interface UserStats {
  totalRooms: number;
  totalMinutes: number;
  totalMessages: number;
  friendsCount: number;
  level: number;
  xp: number;
}

export interface RecentRoom {
  roomId: string;
  roomName: string;
  lastVisit: string;
  duration: number;
}

const STATUS_CONFIG = {
  online: { label: "Online", color: "bg-green-500", textColor: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" },
  "in-room": { label: "In Room", color: "bg-purple-500", textColor: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
  dnd: { label: "Do Not Disturb", color: "bg-red-500", textColor: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" },
  away: { label: "Away", color: "bg-yellow-500", textColor: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
  offline: { label: "Offline", color: "bg-gray-400", textColor: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-900/20" },
};

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({
  isOpen,
  onClose,
  userId,
  userName: initialUserName,
  userAvatar: initialUserAvatar,
  userStatus = "online",
  userBio = "",
  userEmail,
  joinedDate,
  isOwnProfile = false,
  onSave,
  stats = { totalRooms: 0, totalMinutes: 0, totalMessages: 0, friendsCount: 0, level: 1, xp: 0 },
  recentRooms = [],
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [userName, setUserName] = React.useState(initialUserName);
  const [bio, setBio] = React.useState(userBio);
  const [status, setStatus] = React.useState(userStatus);
  const [avatar, setAvatar] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState(initialUserAvatar);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setUserName(initialUserName);
    setBio(userBio);
    setStatus(userStatus);
    setAvatarPreview(initialUserAvatar);
  }, [initialUserName, userBio, userStatus, initialUserAvatar]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave({
        displayName: userName,
        bio,
        status,
        avatar: avatar || avatarPreview,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUserName(initialUserName);
    setBio(userBio);
    setStatus(userStatus);
    setAvatar(null);
    setAvatarPreview(initialUserAvatar);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  const xpToNextLevel = stats.level * 1000;
  const xpProgress = (stats.xp / xpToNextLevel) * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed left-0 right-0 bottom-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:bottom-auto w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto z-50 bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-in-right sm:animate-scale-in">
        {/* Header with cover */}
        <div className="relative h-24 sm:h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-t-3xl sm:rounded-t-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Avatar section */}
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 -mt-12 sm:-mt-16">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200 shadow-xl">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div className={cn(
                "absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900",
                STATUS_CONFIG[status].color
              )} />

              {/* Edit avatar button */}
              {isOwnProfile && isEditing && (
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
                    <Camera className="h-8 w-8 text-white" />
                  </label>
                </>
              )}
            </div>

            <div className="flex-1 pb-2">
              {isEditing ? (
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-2xl font-bold h-auto py-2"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userName}
                </h2>
              )}
              
              {isEditing ? (
                <Select value={status} onValueChange={(value: "online" | "in-room" | "away" | "dnd" | "offline") => setStatus(value)}>
                  <SelectTrigger className="w-40 mt-2">
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
                <Badge className={cn("mt-2", STATUS_CONFIG[status].bgColor, STATUS_CONFIG[status].textColor)}>
                  <div className={cn("w-2 h-2 rounded-full mr-1.5", STATUS_CONFIG[status].color)} />
                  {STATUS_CONFIG[status].label}
                </Badge>
              )}
            </div>

            {isOwnProfile && (
              <div className="pb-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Level progress */}
          <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold">Level {stats.level}</span>
              </div>
              <span className="text-xs text-gray-500">{stats.xp} / {xpToNextLevel} XP</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* Bio section */}
          <div className="mt-6">
            <Label className="text-sm font-semibold mb-2 block">About</Label>
            {isEditing ? (
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                className="min-h-[80px]"
                maxLength={200}
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {bio || "No bio yet."}
              </p>
            )}
          </div>

          {/* Contact info */}
          {(userEmail || joinedDate) && (
            <div className="mt-6 space-y-2">
              {userEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  {userEmail}
                </div>
              )}
              {joinedDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Joined {joinedDate}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalRooms}</div>
              <div className="text-xs text-gray-500">Rooms</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
              <Clock className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.floor(stats.totalMinutes / 60)}h</div>
              <div className="text-xs text-gray-500">Time</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <MessageCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalMessages}</div>
              <div className="text-xs text-gray-500">Messages</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
              <Users className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.friendsCount}</div>
              <div className="text-xs text-gray-500">Friends</div>
            </div>
          </div>

          {/* Recent rooms */}
          {recentRooms.length > 0 && (
            <div className="mt-6">
              <Label className="text-sm font-semibold mb-3 block">Recent Rooms</Label>
              <div className="space-y-2">
                {recentRooms.slice(0, 3).map((room) => (
                  <div
                    key={room.roomId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {room.roomName}
                      </p>
                      <p className="text-xs text-gray-500">
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
    </>
  );
};

export default UserProfilePopup;
