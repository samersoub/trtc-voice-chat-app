"use client";

export type Balance = { coins: number; diamonds: number };
export type Transaction = { id: string; type: "recharge" | "transfer" | "exchange" | "gift"; amount: number; meta?: Record<string, any>; at: number };
export type Inventory = { frames: string[]; equippedFrame?: string; bubbles: string[]; entrances: string[] };

const BAL_KEY = "economy.balance";
const INV_KEY = "economy.inventory";
const LOG_KEY = "economy.agentLogs";

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(prefix = "tx") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export const EconomyService = {
  getBalance(userId?: string): Balance {
    return read<Balance>(BAL_KEY, { coins: 5000, diamonds: 200 });
  },
  saveBalance(bal: Balance) {
    write(BAL_KEY, bal);
    // EMIT: balance updated
    window.dispatchEvent(new CustomEvent<Balance>("economy:balance", { detail: bal }));
  },
  getInventory(): Inventory {
    return read<Inventory>(INV_KEY, { frames: [], equippedFrame: undefined, bubbles: [], entrances: [] });
  },
  saveInventory(inv: Inventory) {
    write(INV_KEY, inv);
    // EMIT: inventory updated
    window.dispatchEvent(new CustomEvent<Inventory>("economy:inventory", { detail: inv }));
  },
  log(tx: Transaction) {
    const logs = read<Transaction[]>(LOG_KEY, []);
    logs.push(tx);
    write(LOG_KEY, logs);
  },
  getLogs(): Transaction[] {
    return read<Transaction[]>(LOG_KEY, []);
  },

  // Finance
  rechargeCoins(amount: number, channel: "stripe" | "play" | "paypal" | "stcpay" | "carrier"): Balance {
    const bal = this.getBalance();
    bal.coins += amount;
    this.saveBalance(bal);
    this.log({ id: uid(), type: "recharge", amount, meta: { channel }, at: Date.now() });
    return bal;
  },
  exchangeDiamondsToCoins(diamonds: number, rate = 1): Balance {
    const bal = this.getBalance();
    if (diamonds > bal.diamonds) throw new Error("Not enough Diamonds");
    bal.diamonds -= diamonds;
    bal.coins += Math.floor(diamonds * rate);
    this.saveBalance(bal);
    this.log({ id: uid(), type: "exchange", amount: diamonds, meta: { rate }, at: Date.now() });
    return bal;
  },
  transferCoinsToUser(agentId: string, targetUid: string, amount: number): Balance {
    const bal = this.getBalance();
    if (amount > bal.coins) throw new Error("Insufficient Coins");
    bal.coins -= amount;
    this.saveBalance(bal);
    this.log({ id: uid(), type: "transfer", amount, meta: { agentId, targetUid }, at: Date.now() });
    return bal;
  },

  // General spending helper
  spendCoins(amount: number, meta?: Record<string, any>): Balance {
    const bal = this.getBalance();
    if (amount > bal.coins) throw new Error("Insufficient Coins");
    bal.coins -= amount;
    this.saveBalance(bal);
    this.log({ id: uid(), type: "transfer", amount, meta, at: Date.now() });
    return bal;
  },

  // Add coins (for rewards, referrals, etc.)
  addCoins(userId: string, amount: number, reason?: string): Balance {
    const bal = this.getBalance();
    bal.coins += amount;
    this.saveBalance(bal);
    this.log({ id: uid(), type: "recharge", amount, meta: { userId, reason }, at: Date.now() });
    return bal;
  },

  // Add diamonds (for rewards, gifts, etc.)
  addDiamonds(userId: string, amount: number, reason?: string): Balance {
    const bal = this.getBalance();
    bal.diamonds += amount;
    this.saveBalance(bal);
    this.log({ id: uid(), type: "recharge", amount, meta: { userId, reason, currency: 'diamonds' }, at: Date.now() });
    return bal;
  },

  // Deduct coins (for purchases, subscriptions, etc.)
  deductCoins(userId: string, amount: number, reason?: string): Balance {
    const bal = this.getBalance();
    if (amount > bal.coins) throw new Error("Insufficient Coins");
    bal.coins -= amount;
    this.saveBalance(bal);
    this.log({ id: uid(), type: "transfer", amount, meta: { userId, reason }, at: Date.now() });
    return bal;
  },

  // Gifts
  sendGift(senderUid: string, receiverUid: string, giftId: string, priceCoins: number, rewardDiamonds: number): Balance {
    const bal = this.getBalance();
    if (priceCoins > bal.coins) throw new Error("Insufficient Coins");
    bal.coins -= priceCoins;
    bal.diamonds += rewardDiamonds;
    this.saveBalance(bal);
    this.log({ id: uid(), type: "gift", amount: priceCoins, meta: { senderUid, receiverUid, giftId, rewardDiamonds }, at: Date.now() });
    return bal;
  },

  // Store
  purchaseItem(kind: "frame" | "bubble" | "entrance", itemId: string, priceCoins: number) {
    const bal = this.getBalance();
    if (priceCoins > bal.coins) throw new Error("Insufficient Coins");
    bal.coins -= priceCoins;
    this.saveBalance(bal);
    const inv = this.getInventory();
    if (kind === "frame") inv.frames = Array.from(new Set([...inv.frames, itemId]));
    if (kind === "bubble") inv.bubbles = Array.from(new Set([...inv.bubbles, itemId]));
    if (kind === "entrance") inv.entrances = Array.from(new Set([...inv.entrances, itemId]));
    this.saveInventory(inv);
  },
  equipFrame(frameId?: string) {
    const inv = this.getInventory();
    inv.equippedFrame = frameId;
    this.saveInventory(inv);
  },
};