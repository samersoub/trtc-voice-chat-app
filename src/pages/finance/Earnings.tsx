"use client";

import React, { useMemo, useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EconomyService, Transaction } from "@/services/EconomyService";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";

const DAILY_KEY = "earnings:daily:last";
const COMMISSION_KEY = "earnings:commission:lastTotal";

const Earnings: React.FC = () => {
  const [bal, setBal] = useState(EconomyService.getBalance());
  const logs = useMemo(() => EconomyService.getLogs(), []);
  const commissionRate = 0.3; // 30% (from config, simplified here)

  return (
    <ChatLayout title="Earnings">
      <div className="mx-auto max-w-xl p-4 space-y-4">
        <Card>
          <CardHeader><CardTitle>Balance</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded bg-muted p-3">
              <div className="text-xs text-muted-foreground">Coins</div>
              <div className="text-2xl font-bold">{bal.coins}</div>
            </div>
            <div className="rounded bg-muted p-3">
              <div className="text-xs text-muted-foreground">Diamonds</div>
              <div className="text-2xl font-bold">{bal.diamonds}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Daily Bonus</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => {
                const last = parseInt(localStorage.getItem(DAILY_KEY) || "0");
                const today = new Date();
                const lastDate = new Date(last);
                const sameDay =
                  last &&
                  today.getFullYear() === lastDate.getFullYear() &&
                  today.getMonth() === lastDate.getMonth() &&
                  today.getDate() === lastDate.getDate();
                if (sameDay) {
                  showError("Already claimed today");
                  return;
                }
                const b = EconomyService.rechargeCoins(20, "stripe");
                setBal({ ...b });
                localStorage.setItem(DAILY_KEY, Date.now().toString());
                showSuccess("Daily bonus +20 coins");
              }}
            >
              Claim Daily Bonus
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Watch Ads</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={async () => {
                const tid = showLoading("Watching ad...");
                setTimeout(() => {
                  dismissToast(tid as any);
                  const b = EconomyService.rechargeCoins(5, "play");
                  setBal({ ...b });
                  showSuccess("+5 coins for watching ad");
                }, 1500);
              }}
            >
              Watch Ad
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Invite Friends</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline">
              <a href="/contacts/invite">Invite Now</a>
            </Button>
            <Button
              onClick={() => {
                const b = EconomyService.rechargeCoins(15, "paypal");
                setBal({ ...b });
                showSuccess("+15 coins for inviting friends");
              }}
            >
              Claim Invite Reward
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Participation Rewards</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => {
                const b = EconomyService.rechargeCoins(10, "carrier");
                setBal({ ...b });
                showSuccess("+10 coins for participation");
              }}
            >
              Claim Participation Reward
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Gift Commission</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => {
                const totalGifts = logs.filter((l: Transaction) => l.type === "gift").reduce((sum, l) => sum + l.amount, 0);
                const lastTotal = parseInt(localStorage.getItem(COMMISSION_KEY) || "0");
                const delta = Math.max(0, totalGifts - lastTotal);
                if (delta <= 0) {
                  showError("No new gifts to claim commission");
                  return;
                }
                const commission = Math.floor(delta * commissionRate);
                const b = EconomyService.rechargeCoins(commission, "paypal");
                setBal({ ...b });
                localStorage.setItem(COMMISSION_KEY, totalGifts.toString());
                showSuccess(`Claimed commission: +${commission} coins`);
              }}
            >
              Claim Gift Commission
            </Button>
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default Earnings;