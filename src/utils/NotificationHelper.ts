export class NotificationHelper {
  static FEED_KEY = "notifications.feed";

  static readFeed(): Array<{ id: string; title: string; body?: string; type: "music" | "moderation" | "economy" | "system"; at: number; read?: boolean; roomId?: string; meta?: Record<string, any> }> {
    try {
      const raw = localStorage.getItem(this.FEED_KEY);
      return raw ? (JSON.parse(raw) as any[]) : [];
    } catch {
      return [];
    }
  }

  static writeFeed(items: ReturnType<typeof NotificationHelper.readFeed>) {
    localStorage.setItem(this.FEED_KEY, JSON.stringify(items));
  }

  static classify(title: string): "music" | "moderation" | "economy" | "system" {
    const t = title.toLowerCase();
    if (t.includes("playing") || t.includes("song") || t.includes("auto-play") || t.includes("music")) return "music";
    if (t.includes("auto-moderation") || t.includes("report")) return "moderation";
    if (t.includes("recharge") || t.includes("gift") || t.includes("purchase") || t.includes("transfer") || t.includes("exchange")) return "economy";
    return "system";
  }

  static async notify(title: string, body?: string, opts?: { roomId?: string; meta?: Record<string, any> }) {
    // Persist to local feed
    const items = this.readFeed();
    items.push({
      id: `n_${Math.random().toString(36).slice(2, 10)}`,
      title,
      body,
      type: this.classify(title),
      at: Date.now(),
      read: false,
      roomId: opts?.roomId,
      meta: opts?.meta,
    });
    this.writeFeed(items);

    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
      return;
    }
    if (Notification.permission !== "denied") {
      const perm = await Notification.requestPermission();
      if (perm === "granted") new Notification(title, { body });
    }
  }

  static list() {
    return this.readFeed().slice().sort((a, b) => b.at - a.at);
  }

  static clear() {
    this.writeFeed([]);
  }

  static markAsRead(id: string) {
    const items = this.readFeed();
    const idx = items.findIndex((i) => i.id === id);
    if (idx >= 0) {
      items[idx].read = true;
      this.writeFeed(items);
    }
  }

  static markAllAsRead(category?: "music" | "moderation" | "economy" | "system") {
    const items = this.readFeed();
    this.writeFeed(items.map((i) => (category ? (i.type === category ? { ...i, read: true } : i) : { ...i, read: true })));
  }
}