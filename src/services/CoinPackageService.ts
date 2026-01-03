"use client";

export type CoinPackage = {
  id: string;
  name: string;
  coins: number;
  price: number; // USD equivalent
  active: boolean;
  created_at: string;
};

export type RechargeConfig = {
  rateMultiplier: number; // e.g., 1.0 normal, 1.1 bonus (10%)
};

const PKG_KEY = "coins:packages";
const RATE_KEY = "coins:recharge:config";

function readPackages(): CoinPackage[] {
  try {
    const raw = localStorage.getItem(PKG_KEY);
    return raw ? (JSON.parse(raw) as CoinPackage[]) : seedPackages();
  } catch {
    return seedPackages();
  }
}

function writePackages(items: CoinPackage[]) {
  localStorage.setItem(PKG_KEY, JSON.stringify(items));
}

function seedPackages(): CoinPackage[] {
  const defaults: CoinPackage[] = [
    { id: "p100", name: "Starter 100", coins: 100, price: 0.99, active: true, created_at: new Date().toISOString() },
    { id: "p1k", name: "Pro 1,000", coins: 1000, price: 8.99, active: true, created_at: new Date().toISOString() },
    { id: "p10k", name: "Elite 10,000", coins: 10000, price: 79.99, active: true, created_at: new Date().toISOString() },
  ];
  writePackages(defaults);
  return defaults;
}

function readRate(): RechargeConfig {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    return raw ? (JSON.parse(raw) as RechargeConfig) : { rateMultiplier: 1.0 };
  } catch {
    return { rateMultiplier: 1.0 };
  }
}

function writeRate(cfg: RechargeConfig) {
  localStorage.setItem(RATE_KEY, JSON.stringify(cfg));
}

export const CoinPackageService = {
  list(): CoinPackage[] {
    return readPackages().sort((a, b) => a.coins - b.coins);
  },
  add(pkg: Omit<CoinPackage, "created_at">) {
    const items = readPackages();
    if (items.some((x) => x.id === pkg.id)) throw new Error("Package ID exists");
    const next: CoinPackage = { ...pkg, created_at: new Date().toISOString() };
    items.push(next);
    writePackages(items);
    return next;
  },
  update(id: string, patch: Partial<CoinPackage>) {
    const items = readPackages();
    const idx = items.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Package not found");
    items[idx] = { ...items[idx], ...patch };
    writePackages(items);
    return items[idx];
  },
  remove(id: string) {
    const items = readPackages().filter((x) => x.id !== id);
    writePackages(items);
  },
  getRate(): RechargeConfig {
    return readRate();
  },
  setRate(cfg: RechargeConfig) {
    writeRate(cfg);
    return cfg;
  },
};