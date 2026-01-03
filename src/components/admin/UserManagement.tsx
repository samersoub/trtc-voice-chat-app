/**
 * User management component for admin dashboard
 * Search users, view profiles, manage follows, suspend/ban
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  UserX,
  Ban,
  Eye,
  Users,
  MessageSquare,
  Gift,
  Clock,
  UserPlus,
  UserMinus,
  Pencil,
  ArrowUpCircle
} from 'lucide-react';
import { SocialService } from '@/services/SocialService';
import { RoomMonitoringService } from '@/services/RoomMonitoringService';
import { PremiumIdService } from '@/services/PremiumIdService';
import { ProfileService } from '@/services/ProfileService';
import UserAvatar from '@/components/profile/UserAvatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';

interface UserEngagement {
  totalTimeInRooms: number;
  roomsJoined: number;
  messagesSent: number;
  giftsSent: number;
  giftValue: number;
}

interface UserWithStats {
  userId: string;
  displayId?: string; // Custom Premium ID
  userName: string;
  followersCount: number;
  followingCount: number;
  roomsHosted: number;
  totalSpeakingTime: number;
  engagement?: UserEngagement;
  level?: number;
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [userRoomHistory, setUserRoomHistory] = useState<Array<{ roomId: string; roomName: string; joinedAt: Date }>>([]);
  const { toast } = useToast();

  // Edit ID State
  const [isEditIdOpen, setIsEditIdOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [newIdInput, setNewIdInput] = useState('');
  const [idTypeInput, setIdTypeInput] = useState<'admin' | 'purchased' | 'gifted'>('admin');

  // Edit Level State
  const [isEditLevelOpen, setIsEditLevelOpen] = useState(false);
  const [newLevelInput, setNewLevelInput] = useState(1);

  const loadUsers = async () => {
    const allStats = SocialService.getAllUserStats();
    let premiumIds: any[] = [];
    try {
      premiumIds = await PremiumIdService.getAllIds();
    } catch (e) {
      console.error("Failed to load premium IDs in user management", e);
    }

    const usersWithStats: UserWithStats[] = allStats.map(stat => {
      const engagement = RoomMonitoringService.getUserEngagement(stat.userId);
      const premiumId = premiumIds.find(p => p.user_id === stat.userId && p.status === 'active')?.custom_id;

      return {
        userId: stat.userId,
        displayId: premiumId,
        userName: `User ${stat.userId.slice(0, 8)}`,
        followersCount: stat.followersCount,
        followingCount: stat.followingCount,
        roomsHosted: stat.roomsHosted,
        totalSpeakingTime: stat.totalSpeakingTime,
        engagement,
        level: stat.level || 1,
      };
    });
    setUsers(usersWithStats);
    setFilteredUsers(usersWithStats);
  };

  useEffect(() => {
    loadUsers();
    const unsubscribe = SocialService.subscribe(loadUsers);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        u =>
          u.userName.toLowerCase().includes(query) ||
          u.userId.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleViewUser = (user: UserWithStats) => {
    setSelectedUser(user);
    // Get room history (mock for now)
    const history = [
      { roomId: 'room1', roomName: 'Music Lounge', joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { roomId: 'room2', roomName: 'Gaming Chat', joinedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { roomId: 'room3', roomName: 'Study Session', joinedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    ];
    setUserRoomHistory(history);
  };

  const handleSuspendUser = (userId: string) => {
    // TODO: Implement suspend logic
    alert(`Suspending user: ${userId}`);
  };

  const handleBanUser = (userId: string) => {
    // TODO: Implement ban logic
    alert(`Banning user: ${userId}`);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleOpenEditId = (user: UserWithStats) => {
    setEditingUser(user);
    setNewIdInput(user.displayId || '');
    setIsEditIdOpen(true);
  };

  const handleSaveId = async () => {
    if (!editingUser || !newIdInput) return;
    if (newIdInput.length !== 7) {
      toast({ title: 'خطأ', description: 'يجب أن يكون الرقم 7 خانات', variant: 'destructive' });
      return;
    }

    try {
      // 1. Check if ID exists
      const available = await PremiumIdService.checkAvailability(newIdInput);

      if (available) {
        // Create new ID and assign
        const newIdObj = await PremiumIdService.createId(newIdInput, idTypeInput, undefined, 0, 'admin');
        await PremiumIdService.assignId(newIdObj.id, editingUser.userId);
      } else {
        // ID exists. Find it and check if assigned.
        const all = await PremiumIdService.getAllIds();
        const existing = all.find(p => p.custom_id === newIdInput);

        if (existing) {
          if (existing.user_id && existing.user_id !== editingUser.userId) {
            throw new Error(`هذا الرقم مستخدم بالفعل بواسطة مستخدم آخر`);
          }
          // Assign to this user
          await PremiumIdService.assignId(existing.id, editingUser.userId);
        }
      }

      toast({ title: 'تمت العملية', description: 'تم تحديث الرقم المميز للمستخدم' });
      setIsEditIdOpen(false);
      loadUsers(); // Refresh list
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    }
  };

  const handleOpenEditLevel = (user: UserWithStats) => {
    setEditingUser(user);
    setNewLevelInput(user.level || 1);
    setIsEditLevelOpen(true);
  };

  const handleSaveLevel = async () => {
    if (!editingUser) return;
    try {
      await ProfileService.updateLevel(editingUser.userId, Number(newLevelInput));
      toast({ title: 'Success', description: 'User level updated successfully' });
      setIsEditLevelOpen(false);
      loadUsers();
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to update level', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* User List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Users ({filteredUsers.length})
        </h3>
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No users found</p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <UserAvatar
                    userId={user.userId}
                    userName={user.userName}
                    size="md"
                    enableProfileModal={false}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{user.userName}</p>
                      {user.displayId ? (
                        <Badge className="text-xs bg-amber-500 hover:bg-amber-600 border-0">
                          ID: {user.displayId}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          ID: {user.userId.slice(0, 8)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        LVL {user.level || 1}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <UserPlus className="h-3 w-3" />
                        {user.followersCount} followers
                      </span>
                      <span className="flex items-center gap-1">
                        <UserMinus className="h-3 w-3" />
                        {user.followingCount} following
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {user.roomsHosted} rooms
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(user.totalSpeakingTime)}
                      </span>
                    </div>
                    {user.engagement && (
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <MessageSquare className="h-3 w-3" />
                          {user.engagement.messagesSent} messages
                        </span>
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <Gift className="h-3 w-3" />
                          {user.engagement.giftsSent} gifts
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditId(user)}
                    className="h-8 w-8 p-0"
                    title="Edit ID"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditLevel(user)}
                    className="h-8 w-8 p-0"
                    title="Edit Level"
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                          View user profile, activity, and follow relationships
                        </DialogDescription>
                      </DialogHeader>
                      {selectedUser && (
                        <div className="space-y-4">
                          {/* User Info */}
                          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <UserAvatar
                              userId={selectedUser.userId}
                              userName={selectedUser.userName}
                              size="xl"
                              enableProfileModal={false}
                            />
                            <div>
                              <h3 className="font-semibold text-lg">{selectedUser.userName}</h3>
                              {selectedUser.displayId && (
                                <Badge className="mb-1 bg-amber-500 border-0">Premium ID: {selectedUser.displayId}</Badge>
                              )}
                              <p className="text-sm text-gray-500">UUID: {selectedUser.userId}</p>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Followers</p>
                              <p className="text-2xl font-bold">{selectedUser.followersCount}</p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Following</p>
                              <p className="text-2xl font-bold">{selectedUser.followingCount}</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Rooms Hosted</p>
                              <p className="text-2xl font-bold">{selectedUser.roomsHosted}</p>
                            </div>
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Speaking Time</p>
                              <p className="text-2xl font-bold">{formatTime(selectedUser.totalSpeakingTime)}</p>
                            </div>
                          </div>

                          {/* Room History */}
                          <div>
                            <h4 className="font-semibold mb-2">Recent Room Activity</h4>
                            <div className="space-y-2">
                              {userRoomHistory.map((room, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                                >
                                  <span className="font-medium">{room.roomName}</span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(room.joinedAt).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleSuspendUser(selectedUser.userId)}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleBanUser(selectedUser.userId)}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Edit ID Dialog - ADDED THIS SECTION */}
      <Dialog open={isEditIdOpen} onOpenChange={setIsEditIdOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الرقم المميز (Edit ID)</DialogTitle>
            <DialogDescription>
              تخصيص رقم جديد للمستخدم {editingUser?.userName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الرقم المميز الجديد</label>
              <Input
                placeholder="7777777"
                value={newIdInput}
                maxLength={7}
                onChange={(e) => setNewIdInput(e.target.value.replace(/\D/g, ''))}
                className="font-mono text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع الرقم</label>
              <Select value={idTypeInput} onValueChange={(v: any) => setIdTypeInput(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">إداري (Admin)</SelectItem>
                  <SelectItem value="gifted">هدية (Gifted)</SelectItem>
                  <SelectItem value="purchased">مدفوع (Purchased)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditIdOpen(false)}>إلغاء</Button>
            <Button onClick={handleSaveId}>حفظ التغييرات</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Level Dialog */}
      <Dialog open={isEditLevelOpen} onOpenChange={setIsEditLevelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل مستوى المستخدم (Level Up)</DialogTitle>
            <DialogDescription>
              تغيير مستوى المستخدم {editingUser?.userName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">المستوى الجديد (Level)</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={newLevelInput}
                onChange={(e) => setNewLevelInput(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditLevelOpen(false)}>إلغاء</Button>
            <Button onClick={handleSaveLevel}>حفظ التغييرات</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
