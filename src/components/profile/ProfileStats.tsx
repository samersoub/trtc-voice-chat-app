"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { type Profile } from "@/services/ProfileService";
import { useLocale } from "@/contexts";

type Props = {
  profile: Profile | null;
};

const StatItem: React.FC<{ label: string; value: number | string }> = ({ label, value }) => {
  return (
    <Card className="bg-muted/40">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
};

const ProfileStats: React.FC<Props> = ({ profile }) => {
  const { dir } = useLocale();
  const coins = profile?.coins ?? 0;
  // Demo placeholders for social metrics
  const followers = Math.max(10, Math.floor(coins / 2));
  const following = Math.max(5, Math.floor(coins / 3));
  const likes = Math.max(25, coins);

  return (
    <div className={dir === "rtl" ? "text-right" : "text-left"}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatItem label={dir === "rtl" ? "العملات" : "Coins"} value={coins} />
        <StatItem label={dir === "rtl" ? "المتابِعون" : "Followers"} value={followers} />
        <StatItem label={dir === "rtl" ? "تتابع" : "Following"} value={following} />
        <StatItem label={dir === "rtl" ? "الإعجابات" : "Likes"} value={likes} />
      </div>
    </div>
  );
};

export default ProfileStats;