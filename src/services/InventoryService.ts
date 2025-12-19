import { InventoryItem } from '@/types/UserTypes';
import { supabase, isSupabaseReady } from '@/services/db/supabaseClient';

class InventoryServiceClass {
    private readonly STORAGE_KEY = 'user_inventory_data';

    /**
     * Add item to user's backpack
     */
    async addItem(userId: string, item: Omit<InventoryItem, 'id' | 'purchasedAt' | 'isActive'>): Promise<InventoryItem> {
        const newItem: InventoryItem = {
            ...item,
            id: crypto.randomUUID(),
            userId,
            purchasedAt: new Date().toISOString(),
            isActive: false
        };

        // save to local
        const all = this.loadLocal();
        all.push(newItem);
        this.saveLocal(all);

        // save to remote if ready
        if (isSupabaseReady && supabase) {
            try {
                await supabase.from('user_inventory').insert(newItem);
            } catch (e) {
                console.warn('Failed to sync inventory item to Supabase', e);
            }
        }

        return newItem;
    }

    /**
     * Get all items for a user (filtering expired)
     */
    async getItems(userId: string): Promise<InventoryItem[]> {
        let items: InventoryItem[] = [];

        // Try remote
        if (isSupabaseReady && supabase) {
            try {
                const { data } = await supabase.from('user_inventory').select('*').eq('userId', userId);
                if (data) items = data as InventoryItem[];
            } catch (e) {
                items = this.loadLocal().filter(i => i.userId === userId);
            }
        } else {
            items = this.loadLocal().filter(i => i.userId === userId);
        }

        // Filter expired
        const now = new Date();
        return items.filter(item => !item.expiresAt || new Date(item.expiresAt) > now);
    }

    /**
     * Toggle item activation (Equip/Unequip)
     * Ensures only one item of a specific type is active at a time.
     */
    async toggleItem(itemId: string, userId: string): Promise<void> {
        const items = await this.getItems(userId);
        const target = items.find(i => i.id === itemId);
        if (!target) return;

        if (target.isActive) {
            // Unequip
            target.isActive = false;
        } else {
            // Equip - First unequip others of same type
            items.filter(i => i.type === target.type && i.id !== itemId).forEach(i => i.isActive = false);
            target.isActive = true;
        }

        // Save changes
        this.updateLocalItems(items);

        if (isSupabaseReady && supabase) {
            // Batch update (simulated)
            for (const item of items.filter(i => i.type === target.type)) {
                await supabase.from('user_inventory').update({ isActive: item.isActive }).eq('id', item.id);
            }
        }
    }

    /**
     * Transfer item to another user (Gift)
     */
    async transferItem(itemId: string, fromUserId: string, toUserId: string): Promise<boolean> {
        const items = await this.getItems(fromUserId);
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex === -1) return false;

        const item = items[itemIndex];

        // Update ownership
        item.userId = toUserId;
        item.isActive = false; // Reset state
        item.source = 'gift';

        // We need to update the ALL list, not just the user filtered list if we are using local storage
        const all = this.loadLocal();
        const globalIndex = all.findIndex(i => i.id === itemId);
        if (globalIndex !== -1) {
            all[globalIndex] = item;
            this.saveLocal(all);
        }

        // Supabase
        if (isSupabaseReady && supabase) {
            await supabase.from('user_inventory').update({ userId: toUserId, isActive: false, source: 'gift' }).eq('id', itemId);
        }

        return true;
    }

    // --- Helpers ---

    private loadLocal(): InventoryItem[] {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    private saveLocal(items: InventoryItem[]) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    }

    private updateLocalItems(userItems: InventoryItem[]) {
        const all = this.loadLocal();
        // Replace items that match IDs
        const updated = all.map(i => {
            const match = userItems.find(u => u.id === i.id);
            return match || i;
        });
        this.saveLocal(updated);
    }
}

export const InventoryService = new InventoryServiceClass();
