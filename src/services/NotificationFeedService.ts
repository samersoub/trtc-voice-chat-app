"use client";

import { NotificationHelper } from "@/utils/NotificationHelper";
import { EconomyService, Transaction } from "@/services/EconomyService";

export type NotificationType = "music" | "moderation" | "economy" | "system";

export type FeedItem = {
  id: string;
  title: string;
  body?: string;
  type: NotificationType;
  at: number;
  read?: boolean;
  roomId?: string;
  meta?: Record<string, any>;
};

function mapEconomyTx(tx: Transaction): FeedItem {
  const base = { id: `eco_${tx.id}`, at: tx.at, type: "economy" as const, read: true };
  if (tx.type === "recharge") {
    return { ...base, title: "Recharge", body: `+${tx.amount} coins via ${tx.meta?.channel}` };
  }
  if (tx.type === "exchange") {
    return { ...base, title: "Diamond Exchange", body: `-${tx.amount} diamonds at rate ${tx.meta?.rate}` };
  }
  if (tx.type === "transfer") {
    const target = tx.meta?.targetUid ? ` to ${tx.meta.targetUid}` : "";
    return { ...base, title: "Transfer", body: `-${tx.amount} coins${target}` };
  }
  if (tx.type === "gift") {
    const giftId = tx.meta?.giftId;
    const receiver = tx.meta?.receiverUid;
    return { ...base, title: "Gift Sent", body: `${giftId ?? "gift"} to ${receiver ?? "user"} (-${tx.amount} coins)` };
  }
  return { ...base, title: "Transaction", body: `${tx.type} ${tx.amount}` };
}

export const NotificationFeedService = {
  list(): FeedItem[] {
    const feed = NotificationHelper.list();
    const eco = EconomyService.getLogs().map(mapEconomyTx);
    const combined = [...feed, ...eco];
    return combined.sort((a, b) => b.at - a.at);
  },
  byType(type?: NotificationType): FeedItem[] {
    const items = this.list();
    return type ? items.filter((i) => i.type === type) : items;
  },
  clearFeed() {
    NotificationHelper.clear();
  },
  markAllRead(category?: NotificationType) {
    NotificationHelper.markAllAsRead(category);
  },
  markItemRead(id: string) {
    NotificationHelper.markAsRead(id);
  },
};