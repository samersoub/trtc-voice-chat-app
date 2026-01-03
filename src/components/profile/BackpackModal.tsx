
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Backpack, Clock, Gift, Check, Send, AlertCircle, X } from 'lucide-react';
import { InventoryService } from '@/services/InventoryService';
import { InventoryItem } from '@/types/UserTypes';
import { AuthService } from '@/services/AuthService';
import { useToast } from '@/components/ui/use-toast';

interface BackpackModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    trigger?: React.ReactNode;
}

export function BackpackModal({ isOpen, onClose, trigger }: BackpackModalProps) {
    const [open, setOpen] = useState(isOpen || false);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const { toast } = useToast();

    // Gift Dialog State
    const [giftTargetId, setGiftTargetId] = useState("");
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
        if (user && open) {
            loadItems(user.id);
        }
    }, [open]);

    const loadItems = async (userId: string) => {
        setLoading(true);
        const data = await InventoryService.getItems(userId);
        setItems(data);
        setLoading(false);
    };

    const handleToggleEquip = async (item: InventoryItem) => {
        if (!currentUser) return;
        await InventoryService.toggleItem(item.id, currentUser.id);
        await loadItems(currentUser.id); // Refresh
        toast({
            title: item.isActive ? "Unequipped" : "Equipped",
            description: `${item.name} is now ${item.isActive ? "inactive" : "active"}.`
        });
    };

    const handleSendGift = async () => {
        if (!currentUser || !selectedItem || !giftTargetId) return;

        const success = await InventoryService.transferItem(selectedItem.id, currentUser.id, giftTargetId);

        if (success) {
            toast({ title: "Sent!", description: `Successfully sent ${selectedItem.name} to ${giftTargetId}` });
            setIsGiftDialogOpen(false);
            setGiftTargetId("");
            setSelectedItem(null);
            loadItems(currentUser.id);
        } else {
            toast({ title: "Error", description: "Failed to send item. Check ID and try again.", variant: "destructive" });
        }
    };

    const getRemainingTime = (expiresAt?: string | null) => {
        if (!expiresAt) return "Permanent";
        const end = new Date(expiresAt).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) return "Expired";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    };

    const filteredItems = items.filter(item => {
        if (activeTab === "all") return true;
        return item.type === activeTab;
    });

    const categories = [
        { id: "all", label: "All Items" },
        { id: "frame", label: "Frames" },
        { id: "entry_effect", label: "Effects" },
        { id: "vehicle", label: "Vehicles" },
        { id: "gift", label: "Gifts" }
    ];

    const Content = (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-white dark:bg-black/20 flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Backpack className="text-orange-500" /> My Backpack
                </h2>
                <div className="text-xs text-slate-500 font-mono">
                    {items.length} Items
                </div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-2">
                    <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-4 overflow-x-auto">
                        {categories.map(cat => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className="data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:shadow-none rounded-none px-2 pb-2 bg-transparent"
                            >
                                {cat.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <ScrollArea className="flex-1 p-4 bg-slate-100/50 dark:bg-black/10">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {loading ? (
                            <div className="col-span-full py-10 text-center text-slate-400">Loading inventory...</div>
                        ) : filteredItems.length === 0 ? (
                            <div className="col-span-full py-10 text-center flex flex-col items-center gap-2 text-slate-400">
                                <Backpack size={40} className="opacity-20" />
                                <p>No items found in this category.</p>
                            </div>
                        ) : (
                            filteredItems.map(item => (
                                <div key={item.id} className="relative bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-2 group">
                                    {/* Active Badge */}
                                    {item.isActive && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10">
                                            EQUIPPED
                                        </div>
                                    )}

                                    {/* Expiry Badge */}
                                    {item.expiresAt && (
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur rounded-full px-1.5 py-0.5 flex items-center gap-1 text-[10px] text-white">
                                            <Clock size={10} />
                                            {getRemainingTime(item.expiresAt)}
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className="w-full aspect-square rounded-lg bg-slate-50 dark:bg-black/20 flex items-center justify-center text-4xl relative overflow-hidden">
                                        {item.icon.startsWith('http') ? (
                                            <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span>{item.icon}</span>
                                        )}

                                        {/* Hover Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            {/* Equip Action */}
                                            {['frame', 'entry_effect', 'vehicle'].includes(item.type) && (
                                                <Button
                                                    size="sm"
                                                    variant={item.isActive ? "destructive" : "default"}
                                                    className={`h-8 text-xs ${item.isActive ? 'bg-red-500' : 'bg-green-500 hover:bg-green-600'}`}
                                                    onClick={() => handleToggleEquip(item)}
                                                >
                                                    {item.isActive ? 'Unequip' : 'Equip'}
                                                </Button>
                                            )}

                                            {/* Gift Action */}
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-8 text-xs bg-white text-black hover:bg-slate-200"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsGiftDialogOpen(true);
                                                }}
                                            >
                                                <Gift size={12} className="mr-1" /> Gift
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="text-center">
                                        <h3 className="font-bold text-sm truncate" title={item.name}>{item.name}</h3>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </Tabs>

            {/* Gift Dialog Overlay */}
            <Dialog open={isGiftDialogOpen} onOpenChange={setIsGiftDialogOpen}>
                <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                        <DialogTitle>Send Gift</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">
                                {selectedItem?.icon && selectedItem.icon.startsWith('http') ?
                                    <img src={selectedItem.icon} className="w-full h-full object-cover rounded" /> :
                                    selectedItem?.icon
                                }
                            </div>
                            <div>
                                <div className="font-bold text-sm">{selectedItem?.name}</div>
                                <div className="text-xs text-slate-500">Will be removed from your backpack</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Recipient ID</label>
                            <Input
                                value={giftTargetId}
                                onChange={e => setGiftTargetId(e.target.value)}
                                placeholder="Enter User ID..."
                            />
                        </div>

                        <Button className="w-full gap-2" onClick={handleSendGift} disabled={!giftTargetId}>
                            <Send size={16} /> Send Item
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );

    if (trigger) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden h-[600px]">
                    {Content}
                </DialogContent>
            </Dialog>
        );
    }

    return isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-[90%] max-w-md h-[600px] relative shadow-2xl animate-in zoom-in-95">
                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1 bg-black/10 rounded-full hover:bg-black/20">
                    <X size={16} />
                </button>
                {Content}
            </div>
        </div>
    ) : null;
}
