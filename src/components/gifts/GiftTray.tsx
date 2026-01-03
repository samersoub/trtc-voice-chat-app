"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EconomyService } from "@/services/EconomyService";
import { showSuccess, showError } from "@/utils/toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import GiftAnimation from "@/components/gifts/GiftAnimation";
import { GiftService, type GiftCategory } from "@/services/GiftService";
import { NotificationHelper } from "@/utils/NotificationHelper";

export type GiftItem = { id: "rose" | "car" | "dragon"; name: string; price: number; rewardDiamonds: number };

const GiftTray: React.FC<{ senderUid: string; receiverUid: string; onSent?: (gift: GiftItem) => void }> = ({ senderUid, receiverUid, onSent }) => {
  const categories = GiftService.getCategories();
  const [activeCat, setActiveCat] = useState<GiftCategory>("popular");
  const gifts = useMemo(() => GiftService.getGiftsByCategory(activeCat).map(g => ({ id: g.id, name: g.name, price: g.price, rewardDiamonds: g.rewardDiamonds })), [activeCat]);

  // Dedication feature: allow overriding receiverUid
  const [dedicateTo, setDedicateTo] = useState(receiverUid);

  // Preview animation
  const [previewGift, setPreviewGift] = useState<GiftItem | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={dedicateTo}
          onChange={(e) => setDedicateTo(e.target.value)}
          placeholder="Dedicate to user (receiver UID)"
          className="h-9"
        />
        <Button
          variant="outline"
          onClick={() => setDedicateTo(receiverUid)}
          className="h-9"
        >
          Reset
        </Button>
      </div>

      {previewGift && (
        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold mb-2">Preview: {previewGift.name}</div>
          <div className="h-40">
            <GiftAnimation type={previewGift.id} />
          </div>
        </div>
      )}

      <Tabs value={activeCat} onValueChange={(v) => setActiveCat(v as GiftCategory)}>
        <TabsList className="w-full justify-start flex-wrap">
          {categories.map((c) => (
            <TabsTrigger key={c.key} value={c.key}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((c) => (
          <TabsContent key={c.key} value={c.key} className="mt-3">
            <div className="grid grid-cols-3 gap-3">
              {GiftService.getGiftsByCategory(c.key).map((g) => {
                const mapped: GiftItem = { id: g.id, name: g.name, price: g.price, rewardDiamonds: g.rewardDiamonds };
                return (
                  <div key={g.id} className="rounded-lg border p-3 bg-white">
                    <div className="text-sm font-semibold">{g.name}</div>
                    <div className="text-xs text-muted-foreground">{g.price} coins</div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        onClick={() => setPreviewGift(mapped)}
                      >
                        Preview
                      </Button>
                      <Button
                        onClick={() => {
                          try {
                            const b = EconomyService.sendGift(senderUid, dedicateTo, g.id, g.price, g.rewardDiamonds);
                            showSuccess(`Sent ${g.name}. Coins: ${b.coins}, Diamonds: ${b.diamonds}`);
                            NotificationHelper.notify("Gift Sent", `You sent ${g.name} to ${dedicateTo}`);
                            onSent?.(mapped);
                          } catch (e: any) {
                            showError(e.message || "Failed to send gift");
                          }
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default GiftTray;