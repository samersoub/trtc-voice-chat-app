"use client";

export type Banner = {
  id: string;
  title: string;
  sub?: string;
  imageUrl: string;
  linkUrl?: string;
};

const KEY = "ui:banners";

function read(): Banner[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const seed: Banner[] = [
      {
        id: "b1",
        title: "ادعُ الأصدقاء واحصل على مكافآت",
        sub: "مكافآت ذهبية ومزايا حصرية",
        imageUrl: "https://images.unsplash.com/photo-1548095115-45697e336b54?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/invite",
      },
      {
        id: "b2",
        title: "ترقيات VIP وتاج الملك",
        sub: "ارفع مستواك وتميّز بإطار ذهبي",
        imageUrl: "https://images.unsplash.com/photo-1519682335074-1c3b3b66f2d4?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/store",
      },
      {
        id: "b3",
        title: "سجادة حمراء وجوائز يومية",
        sub: "كُن نجم الغرفة واحصل على الجوائز",
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
        linkUrl: "/events",
      },
    ];
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as Banner[];
  } catch {
    return [];
  }
}

function write(banners: Banner[]) {
  localStorage.setItem(KEY, JSON.stringify(banners));
}

export const BannerService = {
  list(): Banner[] {
    return read();
  },
  create(data: Omit<Banner, "id">): Banner {
    const banners = read();
    const banner: Banner = { id: crypto.randomUUID(), ...data };
    banners.push(banner);
    write(banners);
    return banner;
  },
  update(id: string, patch: Partial<Omit<Banner, "id">>): Banner {
    const banners = read();
    const idx = banners.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Banner not found");
    const updated = { ...banners[idx], ...patch };
    banners[idx] = updated;
    write(banners);
    return updated;
  },
  remove(id: string) {
    const banners = read().filter((b) => b.id !== id);
    write(banners);
  },
};