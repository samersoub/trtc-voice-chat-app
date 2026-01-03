"use client";

export type GiftCategory = "basic" | "premium" | "vip";

export type AdminGift = {
  id: string;
  name: string;
  image_url?: string | null;
  animation_url?: string | null;
  price: number; // coins
  category: GiftCategory;
  is_active: boolean;
  limitation?: {
    perUserPerDay?: number;
  };
  created_at: string;
};

const KEY = "admin:gifts";

function read(): AdminGift[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminGift[]) : seed();
  } catch {
    return seed();
  }
}

function write(items: AdminGift[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function seed(): AdminGift[] {
  const defaults: AdminGift[] = [
    { id: "rose", name: "Rose", price: 10, category: "basic", is_active: true, created_at: new Date().toISOString() },
    { id: "car", name: "Luxury Car", price: 1000, category: "premium", is_active: true, created_at: new Date().toISOString(), animation_url: "/lottie/car.json" },
    { id: "dragon", name: "Golden Dragon", price: 5000, category: "vip", is_active: true, created_at: new Date().toISOString(), animation_url: "/lottie/dragon.json" },
  ];
  write(defaults);
  return defaults;
}

export const GiftAdminService = {
  list(): AdminGift[] {
    return read().sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  },
  get(id: string): AdminGift | null {
    return read().find((g) => g.id === id) || null;
  },
  add(g: Omit<AdminGift, "created_at">) {
    const items = read();
    if (items.some((x) => x.id === g.id)) throw new Error("Gift ID already exists");
    const next: AdminGift = { ...g, created_at: new Date().toISOString() };
    items.push(next);
    write(items);
    return next;
  },
  update(id: string, patch: Partial<AdminGift>) {
    const items = read();
    const idx = items.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Gift not found");
    items[idx] = { ...items[idx], ...patch };
    write(items);
    return items[idx];
  },
  remove(id: string) {
    const items = read().filter((x) => x.id !== id);
    write(items);
  },
  clearAll() {
    write([]);
  },
};