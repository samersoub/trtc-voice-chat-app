"use client";

import React from "react";

type Locale = "en" | "ar";
type Dir = "ltr" | "rtl";

type LocaleContextType = {
  locale: Locale;
  dir: Dir;
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
};

const LOCALE_KEY = "app:locale";

const dict: Record<Locale, Record<string, string>> = {
  en: {
    "Discover": "Discover",
    "Popular": "Popular",
    "Following": "Following",
    "New": "New",
    "Lama Chat": "Lama Chat",
    "Conversations": "Conversations",
    "Quick links": "Quick links",
    "All Rooms": "All Rooms",
    "Contacts": "Contacts",
    "Profile": "Profile",
    "Settings": "Settings",
    "Search…": "Search…",
    "Notifications": "Notifications",
  },
  ar: {
    "Discover": "اكتشف",
    "Popular": "شائع",
    "Following": "المتابَعون",
    "New": "جديد",
    "Lama Chat": "دردشة لاما",
    "Conversations": "المحادثات",
    "Quick links": "روابط سريعة",
    "All Rooms": "كل الغرف",
    "Contacts": "جهات الاتصال",
    "Profile": "الملف الشخصي",
    "Settings": "الإعدادات",
    "Search…": "ابحث…",
    "Notifications": "الإشعارات",
  },
};

const LocaleContext = React.createContext<LocaleContextType | null>(null);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = React.useState<Locale>(() => {
    const saved = localStorage.getItem(LOCALE_KEY) as Locale | null;
    return saved || "en";
  });

  const dir: Dir = locale === "ar" ? "rtl" : "ltr";

  React.useEffect(() => {
    localStorage.setItem(LOCALE_KEY, locale);
    // تحديث اتجاه المستند ولغته
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
  }, [locale, dir]);

  const t = React.useCallback(
    (key: string) => {
      const table = dict[locale];
      return table[key] ?? key;
    },
    [locale],
  );

  const value: LocaleContextType = { locale, dir, t, setLocale };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
};