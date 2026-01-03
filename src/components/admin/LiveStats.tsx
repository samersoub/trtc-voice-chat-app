"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileService } from "@/services/ProfileService";
import { VoiceChatService } from "@/services/VoiceChatService";
import { EconomyService } from "@/services/EconomyService";
import { isSupabaseReady } from "@/services/db/supabaseClient";

type Stat = { label: string; value: string | number; badge?: string; badgeVariant?: "secondary" | "outline" | "destructive" };

const LiveStats: React.FC = () => {
  const [stats, setStats] = React.useState<Stat[]>([
    { label: "Live Users", value: "—" },
    { label: "Active Rooms", value: "—" },
    { label: "Revenue (Coins, 24h)", value: "—" },
    { label: "Gifts Sent (24h)", value: "—" },
    { label: "Transfers (24h)", value: "—" },
    { label: "System Health", value: isSupabaseReady ? "OK" : "Offline", badge: isSupabaseReady ? "Ready" : "Not Configured", badgeVariant: isSupabaseReady ? "secondary" : "destructive" },
  ]);

  const compute = React.useCallback(async () => {
    const users = await ProfileService.listAll();
    const rooms = VoiceChatService.listRooms();
    const logs = EconomyService.getLogs();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const lastDay = logs.filter((l) => l.at >= cutoff);

    const revenueCoins = lastDay
      .filter((l) => l.type === "recharge")
      .reduce((acc, l) => acc + (l.amount || 0), 0);

    const giftsCount = lastDay.filter((l) => l.type === "gift").length;
    const transfersCount = lastDay.filter((l) => l.type === "transfer").length;

    setStats([
      { label: "Live Users", value: users.length },
      { label: "Active Rooms", value: rooms.length },
      { label: "Revenue (Coins, 24h)", value: revenueCoins },
      { label: "Gifts Sent (24h)", value: giftsCount },
      { label: "Transfers (24h)", value: transfersCount },
      { label: "System Health", value: isSupabaseReady ? "OK" : "Offline", badge: isSupabaseReady ? "Ready" : "Not Configured", badgeVariant: isSupabaseReady ? "secondary" : "destructive" },
    ]);
  }, []);

  React.useEffect(() => {
    void compute();
    const onBalance = () => void compute();
    const interval = setInterval(() => void compute(), 5000);
    window.addEventListener("economy:balance", onBalance as EventListener);
    return () => {
      clearInterval(interval);
      window.removeEventListener("economy:balance", onBalance as EventListener);
    };
  }, [compute]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm">{s.label}</CardTitle>
            {s.badge && <Badge variant={s.badgeVariant || "outline"}>{s.badge}</Badge>}
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{s.value}</CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LiveStats;