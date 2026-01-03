"use client";

import React, { useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EconomyService } from "@/services/EconomyService";
import { showSuccess, showError } from "@/utils/toast";
import { AnalyticsService } from "@/services/AnalyticsService";

const packages = [
  { id: "starter", coins: 100, price: 0.99 },
  { id: "premium", coins: 500, price: 4.99 },
  { id: "elite", coins: 1200, price: 9.99 },
];

const CoinPurchase: React.FC = () => {
  const [bal, setBal] = useState(EconomyService.getBalance());

  return (
    <ChatLayout title="Purchase Coins">
      <div className="mx-auto max-w-2xl p-4 space-y-4">
        <Card className="bg-gradient-to-r from-[#2E0249] to-[#570A57] text-white border-white/10">
          <CardHeader><CardTitle>Your Balance</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-6">
            <div>
              <div className="text-xs opacity-80">Coins</div>
              <div className="text-2xl font-bold text-[#FFD700]">{bal.coins}</div>
            </div>
            <div>
              <div className="text-xs opacity-80">Diamonds</div>
              <div className="text-2xl font-bold">{bal.diamonds}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Choose a Package</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {packages.map((p) => (
              <div key={p.id} className="rounded-lg border p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold capitalize">{p.id} package</div>
                  <div className="text-sm text-muted-foreground">{p.coins} coins • ${p.price}</div>
                </div>
                <Button
                  onClick={() => {
                    try {
                      const b = EconomyService.rechargeCoins(p.coins, "stripe");
                      setBal({ ...b });
                      AnalyticsService.track("coin_purchase", { package: p.id, coins: p.coins, price: p.price });
                      showSuccess(`Purchased ${p.coins} coins`);
                    } catch (e: any) {
                      showError(e.message || "Purchase failed");
                    }
                  }}
                >
                  Buy
                </Button>
              </div>
            ))}
            <div className="text-xs text-muted-foreground">
              Payments are simulated in this demo. Integrate a real gateway to process charges securely.
            </div>
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default CoinPurchase;