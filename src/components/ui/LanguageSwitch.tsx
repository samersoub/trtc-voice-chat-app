"use client";

import React from "react";
import { useLocale } from "@/contexts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const LanguageSwitch: React.FC = () => {
  const { locale, setLocale } = useLocale();

  return (
    <Select value={locale} onValueChange={(v: "en" | "ar") => setLocale(v)}>
      <SelectTrigger className="w-24 h-8">
        <SelectValue placeholder="Lang" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">EN</SelectItem>
        <SelectItem value="ar">AR</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitch;