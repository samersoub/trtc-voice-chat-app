"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Crown, ArrowUpCircle, Save, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import UserAvatar from "@/components/profile/UserAvatar";

import { ProfileService } from "@/services/ProfileService";
import { PremiumIdService } from "@/services/PremiumIdService";

interface UserCompact {
    userId: string;
    userName: string;
    displayId?: string;
    level: number;
    avatarUrl?: string;
}

export default function IdLevelControl() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserCompact[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserCompact[]>([]);
    const { toast } = useToast();

    // Edit State
    const [selectedUser, setSelectedUser] = useState<UserCompact | null>(null);

    // ID Edit
    const [isIdDialogOpen, setIsIdDialogOpen] = useState(false);
    const [newId, setNewId] = useState("");
    const [idType, setIdType] = useState<"admin" | "purchased" | "gifted">("admin");

    // Level Edit
    const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
    const [newLevel, setNewLevel] = useState(1);

    // Load Data
    const loadData = async () => {
        setLoading(true);
        try {
            const profiles = await ProfileService.listAll();
            let premiumIds: any[] = [];
            try {
                premiumIds = await PremiumIdService.getAllIds();
            } catch (e) {
                console.error("Failed loading IDs", e);
            }

            const mapped: UserCompact[] = profiles.map(p => {
                const existingPid = premiumIds.find(pid => pid.user_id === p.id && pid.status === 'active')?.custom_id;

                return {
                    userId: p.id,
                    userName: p.username || p.full_name || `User ${p.id.slice(0, 6)}`,
                    level: p.level || 1,
                    displayId: p.display_id || existingPid,
                    avatarUrl: p.avatar_url || p.profile_image || undefined
                };
            });
            setUsers(mapped);
            setFilteredUsers(mapped);
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter
    useEffect(() => {
        if (!searchQuery) {
            setFilteredUsers(users);
            return;
        }
        const q = searchQuery.toLowerCase();
        const filtered = users.filter(u =>
            u.userName.toLowerCase().includes(q) ||
            u.userId.toLowerCase().includes(q) ||
            (u.displayId && u.displayId.includes(q))
        );
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    // Actions
    const handleOpenIdDialog = (user: UserCompact) => {
        setSelectedUser(user);
        setNewId(user.displayId || "");
        setIsIdDialogOpen(true);
    };

    const handleSaveId = async () => {
        if (!selectedUser || !newId) return;
        // User requested removing restrictions for admin ("any ID")
        // if (newId.length !== 7) { ... } REMOVED

        try {
            // Logic from UserManagement
            const available = await PremiumIdService.checkAvailability(newId);
            if (available) {
                // Pass a flag or ensure service accepts it.
                // Assuming service validation is relaxed or we handle it there.
                const newIdObj = await PremiumIdService.createId(newId, idType, undefined, 0, 'admin');
                await PremiumIdService.assignId(newIdObj.id, selectedUser.userId);
            } else {
                const all = await PremiumIdService.getAllIds();
                const existing = all.find(p => p.custom_id === newId);
                if (existing) {
                    // Reassign
                    await PremiumIdService.assignId(existing.id, selectedUser.userId);
                }
            }

            toast({ title: "Success", description: `Premium ID updated to ${newId}` });
            setIsIdDialogOpen(false);
            loadData();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const handleOpenLevelDialog = (user: UserCompact) => {
        setSelectedUser(user);
        setNewLevel(user.level);
        setIsLevelDialogOpen(true);
    };

    const handleSaveLevel = async () => {
        if (!selectedUser) return;
        try {
            await ProfileService.updateLevel(selectedUser.userId, newLevel);
            toast({ title: "Success", description: `User level updated to ${newLevel}` });
            setIsLevelDialogOpen(false);
            loadData();
        } catch (e: any) {
            toast({ title: "Error", description: "Failed to update level", variant: "destructive" });
        }
    };

    return (
        <AdminLayout title="ID & Level Control">
            <div className="space-y-6">
                {/* Header / Search */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">IDs & Levels Management</h2>
                        <p className="text-muted-foreground">Specialized control for User IDs and Levels.</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Name, UUID, or Premium ID..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* User Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No users found matching your search.
                        </div>
                    ) : (
                        filteredUsers.map(user => (
                            <Card key={user.userId} className="overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar userId={user.userId} userName={user.userName} />
                                            <div>
                                                <h3 className="font-bold text-sm">{user.userName}</h3>
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    {user.userId.slice(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={user.displayId ? "default" : "secondary"} className={user.displayId ? "bg-amber-500" : ""}>
                                            {user.displayId ? `ID: ${user.displayId}` : "No Premium ID"}
                                        </Badge>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between pb-4 border-b">
                                        <span className="text-sm text-muted-foreground">Current Level</span>
                                        <Badge variant="outline" className="text-sm px-3 py-1 border-primary/20 bg-primary/5">
                                            Level {user.level}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            size="sm"
                                            onClick={() => handleOpenIdDialog(user)}
                                        >
                                            <Crown className="w-4 h-4 mr-2 text-amber-500" />
                                            Edit ID
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            size="sm"
                                            onClick={() => handleOpenLevelDialog(user)}
                                        >
                                            <ArrowUpCircle className="w-4 h-4 mr-2" />
                                            Level Up
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Edit ID Dialog */}
                <Dialog open={isIdDialogOpen} onOpenChange={setIsIdDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modify Premium ID</DialogTitle>
                            <DialogDescription>
                                Assign a new Premium ID to <strong>{selectedUser?.userName}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">New 7-Digit ID</label>
                                <Input
                                    value={newId}
                                    onChange={e => setNewId(e.target.value.replace(/\D/g, ''))}
                                    maxLength={20}
                                    placeholder="Enter Custom ID..."
                                    className="font-mono text-lg tracking-widest text-center"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ID Type</label>
                                <Select value={idType} onValueChange={(v: any) => setIdType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">System/Admin</SelectItem>
                                        <SelectItem value="gifted">Gifted</SelectItem>
                                        <SelectItem value="purchased">Purchased</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsIdDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveId}>Save New ID</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Level Dialog */}
                <Dialog open={isLevelDialogOpen} onOpenChange={setIsLevelDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Update User Level</DialogTitle>
                            <DialogDescription>
                                Change the specialized level for <strong>{selectedUser?.userName}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 flex flex-col items-center justify-center gap-4">
                            <div className="text-5xl font-bold text-primary">{newLevel}</div>
                            <div className="flex items-center gap-4 w-full px-8">
                                <Button variant="outline" size="icon" onClick={() => setNewLevel(Math.max(1, newLevel - 1))}>
                                    -
                                </Button>
                                <Input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={newLevel}
                                    onChange={e => setNewLevel(Number(e.target.value))}
                                    className="flex-1"
                                />
                                <Button variant="outline" size="icon" onClick={() => setNewLevel(Math.min(100, newLevel + 1))}>
                                    +
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Range: 1 - 100</p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsLevelDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveLevel}>Update Level</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </AdminLayout>
    );
}
