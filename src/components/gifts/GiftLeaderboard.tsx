"use client";

import React from "react";
import { GiftService } from "@/services/GiftService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const GiftLeaderboard: React.FC<{ className?: string }> = ({ className }) => {
  const data = GiftService.getLeaderboard(5);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Gift Receivers</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No gifts yet.</div>
        ) : (
          <div className="space-y-2">
            {data.map((row, idx) => (
              <div key={row.receiverUid} className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-xs flex items-center justify-center">{idx + 1}</div>
                  <div className="text-sm font-medium">{row.receiverUid}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.giftsCount} gifts • {row.totalCoins} coins
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GiftLeaderboard;