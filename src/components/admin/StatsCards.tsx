"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/services/ProfileService";
import { Badge } from "@/components/ui/badge";

type Props = {
  profiles: Profile[];
};

const StatsCards: React.FC<Props> = ({ profiles }) => {
  const stats = useMemo(() => {
    const total = profiles.length;
    const active = profiles.filter((p) => p.is_active).length;
    const banned = total - active;
    const verified = profiles.filter((p) => p.is_verified).length;
    const coins = profiles.reduce((acc, p) => acc + (p.coins || 0), 0);
    return { total, active, banned, verified, coins };
  }, [profiles]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Total Users</CardTitle></CardHeader>
        <CardContent className="text-3xl font-semibold">{stats.total}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Active</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2">
          <span className="text-3xl font-semibold">{stats.active}</span>
          <Badge variant="secondary">{((stats.active / Math.max(1, stats.total)) * 100).toFixed(0)}%</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Banned</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2">
          <span className="text-3xl font-semibold">{stats.banned}</span>
          <Badge variant="destructive">{((stats.banned / Math.max(1, stats.total)) * 100).toFixed(0)}%</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Verified</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2">
          <span className="text-3xl font-semibold">{stats.verified}</span>
          <Badge variant="outline">Coins {stats.coins}</Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;