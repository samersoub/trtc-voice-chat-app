"use client";

import React, { useMemo, useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EconomyService } from "@/services/EconomyService";
import { showSuccess, showError } from "@/utils/toast";

const Wallet: React.FC = () => {
  const [dirRtl, setDirRtl] = useState(false);
  const [bal, setBal] = useState(EconomyService.getBalance());
  const logs = useMemo(() => EconomyService.getLogs().slice().reverse(), []);
  const [amount, setAmount] = useState(100);
  const [diamonds, setDiamonds] = useState(50);
  const rate = 1;

  return (
    <ChatLayout title="Wallet">
      <div className="mx-auto max-w-xl p-4 sm:p-6 space-y-4" dir={dirRtl ? "rtl" : "ltr"}>
        <Card className="bg-gradient-to-br from-[#2E0249] via-[#570A57] to-[#570A57] text-white border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Balances</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="opacity-80">RTL</span>
                <Switch checked={dirRtl} onCheckedChange={(v) => setDirRtl(!!v)} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/10 p-3">
              <div className="text-xs opacity-80">Coins</div>
              <div className="text-2xl font-bold text-[#FFD700]">{bal.coins}</div>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <div className="text-xs opacity-80">Diamonds</div>
              <div className="text-2xl font-bold">{bal.diamonds}</div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="recharge">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="recharge">Recharge</TabsTrigger>
            <TabsTrigger value="exchange">Exchange</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="recharge">
            <Card>
              <CardHeader><CardTitle>Recharge Coins</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Label className="text-sm">Amount</Label>
                  <Input type="number" min={1} value={amount} onChange={(e) => setAmount(parseInt(e.target.value || "0"))} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="bg-black text-white hover:bg-black/80"
                    onClick={() => {
                      const b = EconomyService.rechargeCoins(amount, "stripe");
                      setBal({ ...b });
                      showSuccess(`Recharged ${amount} coins via Stripe`);
                    }}
                  >
                    Stripe (Visa/Mastercard)
                  </Button>
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      const b = EconomyService.rechargeCoins(amount, "play");
                      setBal({ ...b });
                      showSuccess(`Recharged ${amount} coins via Google Play`);
                    }}
                  >
                    Google Play Billing
                  </Button>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => {
                      const b = EconomyService.rechargeCoins(amount, "paypal");
                      setBal({ ...b });
                      showSuccess(`Recharged ${amount} coins via PayPal`);
                    }}
                  >
                    PayPal
                  </Button>
                  <Button
                    className="bg-purple-600 text-white hover:bg-purple-700"
                    onClick={() => {
                      const b = EconomyService.rechargeCoins(amount, "stcpay");
                      setBal({ ...b });
                      showSuccess(`Recharged ${amount} coins via STC Pay`);
                    }}
                  >
                    STC Pay
                  </Button>
                  <Button
                    className="bg-amber-600 text-white hover:bg-amber-700"
                    onClick={() => {
                      const b = EconomyService.rechargeCoins(amount, "carrier");
                      setBal({ ...b });
                      showSuccess(`Recharged ${amount} coins via Carrier Billing`);
                    }}
                  >
                    Carrier Billing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exchange">
            <Card>
              <CardHeader><CardTitle>Exchange Diamonds → Coins</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Label className="text-sm">Diamonds</Label>
                  <Input type="number" min={1} value={diamonds} onChange={(e) => setDiamonds(parseInt(e.target.value || "0"))} />
                </div>
                <div className="text-sm text-muted-foreground">Rate: 1 diamond = {rate} coin</div>
                <Button
                  onClick={() => {
                    try {
                      const b = EconomyService.exchangeDiamondsToCoins(diamonds, rate);
                      setBal({ ...b });
                      showSuccess(`Exchanged ${diamonds} diamonds`);
                    } catch (e: any) {
                      showError(e.message || "Exchange failed");
                    }
                  }}
                >
                  Exchange
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {logs.length === 0 && <div className="text-sm text-muted-foreground">No logs yet.</div>}
                {logs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-sm border-b py-2">
                    <div className="capitalize">{l.type}</div>
                    <div>{l.amount}</div>
                    <div className="text-muted-foreground">{new Date(l.at).toLocaleString()}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ChatLayout>
  );
};

export default Wallet;