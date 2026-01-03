import { PremiumId } from '../types/UserTypes';
import { supabase, isSupabaseReady } from '@/services/db/supabaseClient';

class PremiumIdServiceClass {
    private readonly STORAGE_KEY = 'premium_ids_data';
    private localIds: PremiumId[] = [];

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Initialize and load data
     */
    private loadFromStorage() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                this.localIds = JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load local premium IDs', e);
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.localIds));
        } catch (e) {
            console.error('Failed to save local premium IDs', e);
        }
    }

    /**
     * Validate if an ID is acceptable (7 digits)
     */
    isValidFormat(customId: string): boolean {
        // Relaxed validation: 1 to 20 digits
        return /^\d{1,20}$/.test(customId);
    }

    /**
     * Check if ID exists
     */
    async checkAvailability(customId: string): Promise<boolean> {
        // Check local
        if (this.localIds.some(pid => pid.custom_id === customId)) {
            return false;
        }

        // Check Supabase if ready
        if (isSupabaseReady && supabase) {
            try {
                const { data } = await supabase
                    .from('premium_ids')
                    .select('id')
                    .eq('custom_id', customId)
                    .single();
                if (data) return false;
            } catch {
                // Table might not exist, ignore
            }
        }
        return true;
    }

    /**
     * Create a new Premium ID
     */
    async createId(
        customId: string,
        type: PremiumId['type'],
        expiresAt?: Date,
        price?: number,
        createdBy?: string
    ): Promise<PremiumId> {
        if (!this.isValidFormat(customId)) {
            throw new Error('ID must be numeric (1-20 digits)');
        }

        if (!(await this.checkAvailability(customId))) {
            throw new Error('ID is already taken');
        }

        const newId: PremiumId = {
            id: crypto.randomUUID(),
            user_id: null,
            custom_id: customId,
            type,
            price,
            status: 'active',
            created_at: new Date().toISOString(),
            expires_at: expiresAt ? expiresAt.toISOString() : null,
            created_by: createdBy
        };

        // Save Local
        this.localIds.push(newId);
        this.saveToStorage();

        // Try Save Remote
        if (isSupabaseReady && supabase) {
            try {
                await supabase.from('premium_ids').insert(newId);
            } catch (e) {
                console.warn('Failed to sync new ID to Supabase (using local only)', e);
            }
        }

        return newId;
    }

    /**
     * Get all IDs (Admin)
     */
    async getAllIds(): Promise<PremiumId[]> {
        // Sync with remote if possible
        if (isSupabaseReady && supabase) {
            try {
                const { data } = await supabase.from('premium_ids').select('*');
                if (data) {
                    // Merge strategies could be complex, for now trust remote if available, else local
                    return data as PremiumId[];
                }
            } catch { /* ignore */ }
        }
        return this.localIds;
    }

    /**
     * Get IDs owned by a specific user
     */
    async getIdsByUserId(userId: string): Promise<PremiumId[]> {
        const all = await this.getAllIds();
        return all.filter(p => p.user_id === userId);
    }

    /**
     * Set a specific ID as the display ID
     */
    async activateId(userId: string, customId: string): Promise<void> {
        // Verify ownership
        const owned = await this.getIdsByUserId(userId);
        if (!owned.some(p => p.custom_id === customId)) {
            throw new Error('You do not own this ID');
        }

        // Update Local Profile (hacky sync)
        // We rely on ProfileService usually, but let's try to update DB directly
        if (isSupabaseReady && supabase) {
            await supabase
                .from('users')
                .update({ display_id: customId })
                .eq('id', userId);
        }

        // Also update local storage user if exists to reflect change immediately
        const userStr = localStorage.getItem('auth:user');
        if (userStr) {
            const u = JSON.parse(userStr);
            if (u.id === userId) {
                u.displayId = customId;
                localStorage.setItem('auth:user', JSON.stringify(u));
            }
        }
    }

    /**
     * Assign ID to User
     */
    async assignId(id: string, userId: string): Promise<void> {
        const pidIndex = this.localIds.findIndex(p => p.id === id);
        if (pidIndex === -1 && (!isSupabaseReady || !supabase)) {
            throw new Error('ID not found');
        }

        // Update Local
        if (pidIndex !== -1) {
            this.localIds[pidIndex].user_id = userId;
            this.localIds[pidIndex].status = 'active'; // Ensure active
            this.saveToStorage();
        }

        // Update Remote
        if (isSupabaseReady && supabase) {
            try {
                // 1. Update ID record
                await supabase
                    .from('premium_ids')
                    .update({ user_id: userId, status: 'active' })
                    .eq('id', id);

                // 2. Update User Profile (display_id)
                const pid = this.localIds[pidIndex] || (await this.getAllIds()).find(p => p.id === id);
                if (pid) {
                    await supabase
                        .from('users')
                        .update({ display_id: pid.custom_id })
                        .eq('id', userId);
                }
            } catch (e) {
                console.error('Failed to assign ID in Supabase', e);
            }
        }
    }

    /**
     * Revoke/Unassign ID
     */
    async revokeId(id: string): Promise<void> {
        const pid = this.localIds.find(p => p.id === id);
        if (pid) {
            pid.user_id = null;
            this.saveToStorage();
        }

        if (isSupabaseReady && supabase) {
            await supabase.from('premium_ids').update({ user_id: null }).eq('id', id);
            // Also clear display_id from user? Complex without transaction, skip for now.
        }
    }
}

export const PremiumIdService = new PremiumIdServiceClass();
