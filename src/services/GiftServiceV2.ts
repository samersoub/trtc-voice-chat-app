/**
 * GiftService V2 - Supabase Backend Integration
 * يعمل مع قاعدة البيانات Supabase أو demo data كـ fallback
 */

import { supabase, isSupabaseReady } from "@/services/db/supabaseClient";
import { EconomyService } from "@/services/EconomyService";
import type { DbGift, DbGiftTransaction, DbGiftTransactionInsert } from "@/types/database.types";

export type GiftCategory = "popular" | "premium" | "animated" | "limited" | "romantic" | "luxury" | "legendary" | "basic";

export type GiftDef = {
  id: string;
  name: string;
  price: number;
  rewardDiamonds: number;
  categories: GiftCategory[];
};

// Demo data as fallback
const DEMO_GIFTS: GiftDef[] = [
  { id: "rose", name: "Rose", price: 10, rewardDiamonds: 5, categories: ["popular", "romantic", "basic"] },
  { id: "car", name: "Luxury Car", price: 500, rewardDiamonds: 250, categories: ["premium", "luxury"] },
  { id: "dragon", name: "Golden Dragon", price: 1000, rewardDiamonds: 500, categories: ["legendary", "premium"] },
];

/**
 * Convert DB gift to app GiftDef format
 */
function dbGiftToGiftDef(dbGift: DbGift): GiftDef {
  return {
    id: dbGift.id,
    name: dbGift.name,
    price: dbGift.price,
    rewardDiamonds: dbGift.reward_diamonds,
    categories: dbGift.categories as GiftCategory[],
  };
}

export const GiftService = {
  /**
   * Get all available gift categories
   */
  getCategories(): { key: GiftCategory; label: string }[] {
    return [
      { key: "popular", label: "Popular" },
      { key: "romantic", label: "Romantic" },
      { key: "premium", label: "Premium" },
      { key: "luxury", label: "Luxury" },
      { key: "legendary", label: "Legendary" },
      { key: "animated", label: "Animated" },
      { key: "limited", label: "Limited" },
      { key: "basic", label: "Basic" },
    ];
  },

  /**
   * Get all available gifts
   * Tries Supabase first, falls back to demo data
   */
  async getAll(): Promise<GiftDef[]> {
    // Try Supabase
    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from("gifts")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true });

        if (!error && data) {
          return data.map(dbGiftToGiftDef);
        }

        console.warn("Failed to fetch gifts from DB:", error);
      } catch (err) {
        console.error("Error fetching gifts:", err);
      }
    }

    // Fallback to demo data
    return DEMO_GIFTS;
  },

  /**
   * Get gifts by category
   */
  async getGiftsByCategory(category: GiftCategory): Promise<GiftDef[]> {
    const allGifts = await this.getAll();
    return allGifts.filter((g) => g.categories.includes(category));
  },

  /**
   * Get single gift by ID
   */
  async getGiftById(giftId: string): Promise<GiftDef | null> {
    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from("gifts")
          .select("*")
          .eq("id", giftId)
          .eq("is_active", true)
          .single();

        if (!error && data) {
          return dbGiftToGiftDef(data);
        }
      } catch (err) {
        console.error("Error fetching gift:", err);
      }
    }

    // Fallback
    return DEMO_GIFTS.find((g) => g.id === giftId) || null;
  },

  /**
   * Send gift from sender to receiver
   * Handles coin deduction, diamond reward, and transaction logging
   */
  async sendGift(
    senderId: string,
    receiverId: string,
    giftId: string,
    quantity: number = 1,
    roomId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Get gift details
      const gift = await this.getGiftById(giftId);
      if (!gift) {
        return { success: false, message: "Gift not found" };
      }

      const totalCost = gift.price * quantity;
      const totalReward = gift.rewardDiamonds * quantity;

      // If Supabase available, use DB transactions
      if (isSupabaseReady && supabase) {
        // 2. Check sender's balance
        const { data: senderData, error: senderError } = await supabase
          .from("users")
          .select("coins, total_gifts_sent")
          .eq("id", senderId)
          .single();

        if (senderError || !senderData) {
          return { success: false, message: "Sender not found" };
        }

        if (senderData.coins < totalCost) {
          return { success: false, message: "Insufficient coins" };
        }

        // 3. Create gift transaction record
        const transaction: DbGiftTransactionInsert = {
          sender_id: senderId,
          receiver_id: receiverId,
          gift_id: giftId,
          quantity,
          total_cost: totalCost,
          room_id: roomId || null,
        };

        const { error: txError } = await supabase.from("gift_transactions").insert(transaction);

        if (txError) {
          console.error("Failed to create gift transaction:", txError);
          return { success: false, message: "Transaction failed" };
        }

        // 4. Deduct coins from sender & update total_gifts_sent
        const newSenderCoins = senderData.coins - totalCost;
        const newTotalGiftsSent = (senderData.total_gifts_sent || 0) + totalCost;

        const { error: senderUpdateError } = await supabase
          .from("users")
          .update({
            coins: newSenderCoins,
            total_gifts_sent: newTotalGiftsSent,
          })
          .eq("id", senderId);

        if (senderUpdateError) {
          console.error("Failed to update sender:", senderUpdateError);
          return { success: false, message: "Failed to update sender balance" };
        }

        // 5. Add diamonds to receiver
        const { data: receiverData } = await supabase
          .from("users")
          .select("diamonds")
          .eq("id", receiverId)
          .single();

        const newReceiverDiamonds = (receiverData?.diamonds || 0) + totalReward;

        await supabase
          .from("users")
          .update({ diamonds: newReceiverDiamonds })
          .eq("id", receiverId);

        // 6. Log coin transaction
        await supabase.from("coin_transactions").insert({
          user_id: senderId,
          transaction_type: "gift_sent",
          amount: -totalCost,
          balance_after: newSenderCoins,
          description: `Sent ${gift.name} x${quantity}`,
          reference_id: giftId,
        });

        // 7. Send notification to receiver
        await supabase.from("notifications").insert({
          user_id: receiverId,
          title: "🎁 هدية جديدة!",
          message: `استلمت ${gift.name} (${totalReward} ألماسة)`,
          type: "gift",
          icon: "🎁",
          is_read: false,
          metadata: {
            senderId,
            giftId,
            quantity,
            diamonds: totalReward,
          },
        });

        return {
          success: true,
          message: `Successfully sent ${gift.name} x${quantity}!`,
        };
      }

      // Fallback to local EconomyService (demo mode)
      try {
        const balance = EconomyService.sendGift(
          senderId,
          receiverId,
          giftId,
          totalCost,
          totalReward
        );

        return {
          success: true,
          message: `Successfully sent ${gift.name} x${quantity}!`,
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Insufficient balance",
        };
      }
    } catch (error) {
      console.error("Error sending gift:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send gift",
      };
    }
  },

  /**
   * Get gift transaction history for a user
   */
  async getGiftHistory(
    userId: string,
    type: "sent" | "received" | "all" = "all"
  ): Promise<DbGiftTransaction[]> {
    if (!isSupabaseReady || !supabase) return [];

    try {
      let query = supabase
        .from("gift_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (type === "sent") {
        query = query.eq("sender_id", userId);
      } else if (type === "received") {
        query = query.eq("receiver_id", userId);
      } else {
        query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch gift history:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching gift history:", error);
      return [];
    }
  },

  /**
   * Get leaderboard of top gift receivers
   */
  async getLeaderboard(limit: number = 10): Promise<
    Array<{
      userId: string;
      totalGiftsValue: number;
      giftsCount: number;
      topGift?: string;
    }>
  > {
    if (!isSupabaseReady || !supabase) {
      // Fallback to demo leaderboard
      return [];
    }

    try {
      // Aggregate gift transactions by receiver
      const { data, error } = await supabase
        .from("gift_transactions")
        .select("receiver_id, total_cost, gift_id")
        .order("created_at", { ascending: false });

      if (error || !data) {
        console.error("Failed to fetch leaderboard:", error);
        return [];
      }

      // Group by receiver
      const grouped = new Map<
        string,
        { totalGiftsValue: number; giftsCount: number; gifts: string[] }
      >();

      for (const tx of data) {
        const existing = grouped.get(tx.receiver_id) || {
          totalGiftsValue: 0,
          giftsCount: 0,
          gifts: [],
        };
        existing.totalGiftsValue += tx.total_cost;
        existing.giftsCount += 1;
        existing.gifts.push(tx.gift_id);
        grouped.set(tx.receiver_id, existing);
      }

      // Sort and format
      const leaderboard = Array.from(grouped.entries())
        .map(([userId, stats]) => ({
          userId,
          totalGiftsValue: stats.totalGiftsValue,
          giftsCount: stats.giftsCount,
          topGift: stats.gifts[0], // Most recent gift
        }))
        .sort((a, b) => b.totalGiftsValue - a.totalGiftsValue)
        .slice(0, limit);

      return leaderboard;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  },

  /**
   * Get gift statistics for a user
   */
  async getUserGiftStats(userId: string): Promise<{
    totalSent: number;
    totalReceived: number;
    sentCount: number;
    receivedCount: number;
  }> {
    if (!isSupabaseReady || !supabase) {
      return { totalSent: 0, totalReceived: 0, sentCount: 0, receivedCount: 0 };
    }

    try {
      // Gifts sent
      const { data: sentData } = await supabase
        .from("gift_transactions")
        .select("total_cost")
        .eq("sender_id", userId);

      const totalSent = sentData?.reduce((sum, tx) => sum + tx.total_cost, 0) || 0;
      const sentCount = sentData?.length || 0;

      // Gifts received
      const { data: receivedData } = await supabase
        .from("gift_transactions")
        .select("total_cost")
        .eq("receiver_id", userId);

      const totalReceived = receivedData?.reduce((sum, tx) => sum + tx.total_cost, 0) || 0;
      const receivedCount = receivedData?.length || 0;

      return {
        totalSent,
        totalReceived,
        sentCount,
        receivedCount,
      };
    } catch (error) {
      console.error("Error fetching gift stats:", error);
      return { totalSent: 0, totalReceived: 0, sentCount: 0, receivedCount: 0 };
    }
  },
};
