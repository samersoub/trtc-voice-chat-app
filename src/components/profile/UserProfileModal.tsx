"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  UserPlus, 
  UserMinus, 
  MessageCircle, 
  Calendar, 
  Users, 
  Mic, 
  Crown,
  X
} from 'lucide-react';
import { SocialService, UserSocialStats } from '@/services/SocialService';
import { UserProfileService } from '@/services/UserProfileService';
import { AuthService } from '@/services/AuthService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  avatarUrl?: string;
  bio?: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName: initialUserName,
  avatarUrl: initialAvatarUrl,
  bio: initialBio,
}) => {
  const currentUser = AuthService.getCurrentUser();
  const isOwnProfile = currentUser?.id === userId;

  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState<UserSocialStats | null>(null);
  const [userName, setUserName] = useState(initialUserName || userId);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [bio, setBio] = useState(initialBio);
  const [loading, setLoading] = useState(false);

  // Load user data and stats
  useEffect(() => {
    if (!isOpen || !userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load user profile
        const profile = await UserProfileService.getProfile(userId);
        if (profile) {
          setUserName(profile.name || profile.username || userId);
          setAvatarUrl(profile.avatarUrl);
          setBio(profile.bio);
        }

        // Load social stats
        const socialStats = SocialService.getUserStats(userId);
        setStats(socialStats);

        // Check if following
        if (currentUser?.id) {
          setIsFollowing(SocialService.isFollowing(currentUser.id, userId));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, userId, currentUser?.id]);

  // Subscribe to social updates
  useEffect(() => {
    const unsubscribe = SocialService.subscribe(() => {
      if (userId) {
        const updatedStats = SocialService.getUserStats(userId);
        setStats(updatedStats);
        if (currentUser?.id) {
          setIsFollowing(SocialService.isFollowing(currentUser.id, userId));
        }
      }
    });

    return unsubscribe;
  }, [userId, currentUser?.id]);

  const handleFollowToggle = () => {
    if (!currentUser?.id || !userId) return;

    if (isFollowing) {
      SocialService.unfollow(currentUser.id, userId);
    } else {
      SocialService.follow(currentUser.id, userId);
    }
  };

  const handleMessage = () => {
    // TODO: Implement direct messaging
    console.log('Message user:', userId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close profile modal"
          className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Cover/Header Background */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Content */}
        <div className="relative px-4 sm:px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 sm:-top-20 left-4 sm:left-6">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 flex items-center justify-center shadow-xl">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {isOwnProfile && (
                <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-yellow-500 shadow-lg">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && currentUser && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFollowToggle}
                className={cn(
                  "transition-all font-semibold",
                  isFollowing 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0" 
                    : "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:from-[#5558E3] hover:to-[#7C4DE8] border-0"
                )}
              >
                {isFollowing ? (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleMessage}
                className="border-2"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          )}

          {/* User Info */}
          <div className="mt-12 sm:mt-16">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {userName}
              </h2>
              {isOwnProfile && (
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              )}
            </div>

            {bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {bio}
              </p>
            )}

            {/* Join Date */}
            {stats && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Calendar className="h-4 w-4" />
                <span>Joined {SocialService.formatJoinDate(stats.joinDate)}</span>
              </div>
            )}

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.followersCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Followers
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.followingCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Following
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.roomsHosted}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Rooms Hosted
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Mic className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {SocialService.formatSpeakingTime(stats.totalSpeakingTime)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Speaking Time
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            )}

            {/* Mutual Followers / Friends Badge */}
            {!isOwnProfile && currentUser && stats && (
              <div className="mt-4 p-3 rounded-lg">
                {(() => {
                  const isMutual = SocialService.isFollowing(userId, currentUser.id) && isFollowing;
                  if (isMutual) {
                    return (
                      <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-3 rounded-lg">
                        <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">Friends</span>
                        <span className="text-purple-600/80 dark:text-purple-400/80">• You follow each other</span>
                      </div>
                    );
                  }
                  if (isFollowing) {
                    return (
                      <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-blue-600 dark:text-blue-400">✓ You're following {userName}</span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg text-gray-600 dark:text-gray-400">
                      Follow {userName} to see their activity
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
