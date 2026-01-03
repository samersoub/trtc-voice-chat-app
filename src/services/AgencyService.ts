"use client";

export type HostAgency = {
  id: string;
  name: string;
  ownerName: string;
  commission: number; // %
  approved: boolean;
};

export type RechargeAgency = {
  id: string;
  name: string;
  channel: "stripe" | "paypal" | "stcpay" | "play" | "carrier";
  commission: number; // %
  approved: boolean;
};

const HOST_KEY = "agency.hosts";
const RECHARGE_KEY = "agency.recharges";

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

function ensureSeed() {
  if (!localStorage.getItem(HOST_KEY)) {
    const hosts: HostAgency[] = [
      { id: "H-TR-01", name: "وكالة (Batman)", ownerName: "الوك emad", commission: 15, approved: true },
      { id: "H-DE-02", name: "وكالة أسود حلب", ownerName: "كفاح", commission: 12, approved: false },
      { id: "H-YE-03", name: "وكالة تعز الحالمة", ownerName: "الصقر", commission: 10, approved: true },
    ];
    write(HOST_KEY, hosts);
  }
  if (!localStorage.getItem(RECHARGE_KEY)) {
    const recs: RechargeAgency[] = [
      { id: "R-STR-01", name: "Stripe Hub", channel: "stripe", commission: 5, approved: true },
      { id: "R-STC-02", name: "STC Pay KSA", channel: "stcpay", commission: 7, approved: true },
      { id: "R-PLY-03", name: "Google Play Billing", channel: "play", commission: 30, approved: true },
    ];
    write(RECHARGE_KEY, recs);
  }
}

ensureSeed();

export const AgencyService = {
  listHostAgencies(): HostAgency[] {
    return read<HostAgency[]>(HOST_KEY, []);
  },
  listRechargeAgencies(): RechargeAgency[] {
    return read<RechargeAgency[]>(RECHARGE_KEY, []);
  },
  approveHostAgency(id: string, approved: boolean) {
    const list = this.listHostAgencies();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return;
    list[idx].approved = approved;
    write(HOST_KEY, list);
  },
  approveRechargeAgency(id: string, approved: boolean) {
    const list = this.listRechargeAgencies();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return;
    list[idx].approved = approved;
    write(RECHARGE_KEY, list);
  },
  addHostAgency(agency: Omit<HostAgency, "approved"> & { approved?: boolean }) {
    const list = this.listHostAgencies();
    if (list.some((a) => a.id === agency.id)) throw new Error("Agency ID already exists");
    const next: HostAgency = { ...agency, approved: agency.approved ?? false };
    list.push(next);
    write(HOST_KEY, list);
    return next;
  },
  updateHostAgency(id: string, patch: Partial<HostAgency>) {
    const list = this.listHostAgencies();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Agency not found");
    list[idx] = { ...list[idx], ...patch };
    write(HOST_KEY, list);
    return list[idx];
  },
  removeHostAgency(id: string) {
    const list = this.listHostAgencies().filter((a) => a.id !== id);
    write(HOST_KEY, list);
  },
  hostCommissionStatement(id: string) {
    // Dummy statement totals
    return { month: "2025-11", totalHours: 320, totalGifts: 12400, commissionEarned: 1860 };
  },
  rechargeStatement(id: string) {
    return { month: "2025-11", totalRecharges: 842, volumeCoins: 145000, commissionEarned: 7250 };
  },
};