"use client";

import React, { useMemo, useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, BadgeCheck } from "lucide-react";
import { HostService } from "@/services/HostService";
import { EconomyService } from "@/services/EconomyService";
import { showSuccess, showError } from "@/utils/toast";

const Hosts: React.FC = () => {
  const hosts = useMemo(() => HostService.list(), []);
  const [minutes, setMinutes] = useState<number>(30);
  const [bal, setBal] = useState(EconomyService.getBalance());

  return (
    <ChatLayout title="Hosts">
      <div className="mx-auto max-w-2xl p-4 space-y-4">
        <Card className="bg-gradient-to-r from-[#2E0249] to-[#570A57] text-white border-white/10">
          <CardHeader><CardTitle>Book a Verified Host</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <div>
              <div className="text-xs opacity-80">Your Coins</div>
              <div className="text-xl font-bold text-[#FFD700]">{bal.coins}</div>
            </div>
            <div className="ml-auto grid gap-2">
              <Label className="text-sm">Session Length (minutes)</Label>
              <Input
                type="number"
                min={15}
                step={15}
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value || "0"))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {hosts.map((h) => {
            const cost = Math.ceil((h.hourlyRateCoins / 60) * minutes);
            return (
              <Card key={h.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {h.name}
                    {h.verified && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {h.rating.toFixed(1)} ({h.reviews} reviews)
                    <span className="ml-3">Rate: {h.hourlyRateCoins} coins/hr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>Cost: {cost} coins</Badge>
                    <Button
                      size="sm"
                      onClick={() => {
                        try {
                          const updated = EconomyService.rechargeCoins(0, "stripe"); // no-op to refresh keys
                          // Deduct coins for booking by transferring to host ID (local demo)
                          EconomyService.transferCoinsToUser("booking", h.id, cost);
                          setBal({ ...EconomyService.getBalance() });
                          showSuccess(`Booked ${h.name} for ${minutes} min`);
                        } catch (e: any) {
                          showError(e.message || "Booking failed");
                        }
                      }}
                    >
                      Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ChatLayout>
  );
};

export default Hosts;