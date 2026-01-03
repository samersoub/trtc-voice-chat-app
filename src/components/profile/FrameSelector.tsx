"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, ShoppingCart, Undo2 } from "lucide-react";
import { EconomyService, type Balance, type Inventory } from "@/services/EconomyService";
import { showError, showSuccess } from "@/utils/toast";
import { useLocale } from "@/contexts";
import { cn } from "@/lib/utils";

type FrameItem = {
  id: string;
  name: string;
  price: number;
  icon?: React.ReactNode;
};

const frames: FrameItem[] = [
  { id: "vip", name: "VIP Gold Frame", price: 2000, icon: <Crown className="h-4 w-4 text-yellow-500" /> },
  { id: "silver", name: "Silver Frame", price: 1000, icon: <Crown className="h-4 w-4 text-gray-400" /> },
  { id: "neon", name: "Neon Frame", price: 1500, icon: <Crown className="h-4 w-4 text-fuchsia-500" /> },
];

const FrameSelector: React.FC<{ className?: string }> = ({ className }) => {
  const { dir } = useLocale();
  const [balance, setBalance] = React.useState<Balance>(EconomyService.getBalance());
  const [inventory, setInventory] = React.useState<Inventory>(EconomyService.getInventory());

  const refresh = () => {
    setBalance(EconomyService.getBalance());
    setInventory(EconomyService.getInventory());
  };

  const purchase = (f: FrameItem) => {
    try {
      EconomyService.purchaseItem("frame", f.id, f.price);
      showSuccess(dir === "rtl" ? "تم الشراء" : "Purchased");
      refresh();
    } catch (e: any) {
      showError(e.message || (dir === "rtl" ? "فشل الشراء" : "Purchase failed"));
    }
  };

  const equip = (id?: string) => {
    EconomyService.equipFrame(id);
    showSuccess(
      id
        ? dir === "rtl" ? "تم تجهيز الإطار" : "Frame equipped"
        : dir === "rtl" ? "تمت إزالة الإطار" : "Frame removed"
    );
    refresh();
  };

  const owned = new Set(inventory.frames);
  const equipped = inventory.equippedFrame;

  return (
    <Card className={className}>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base sm:text-lg">
          {dir === "rtl" ? "إطارات الصورة الرمزية" : "Avatar Frames"}
        </CardTitle>
        <Badge variant="secondary">
          {dir === "rtl" ? `العملات: ${balance.coins}` : `Coins: ${balance.coins}`}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-3", "grid-cols-1 sm:grid-cols-2")}>
          {frames.map((f) => {
            const isOwned = owned.has(f.id);
            const isEquipped = equipped === f.id;
            return (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-md border p-3 bg-muted/30"
              >
                <div className={cn("flex items-center gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
                  {f.icon}
                  <div className={dir === "rtl" ? "text-right" : "text-left"}>
                    <div className="text-sm font-medium">{f.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {dir === "rtl" ? `السعر: ${f.price}` : `Price: ${f.price}`}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {isOwned ? (
                        <Badge variant="outline">{dir === "rtl" ? "مملوك" : "Owned"}</Badge>
                      ) : (
                        <Badge variant="default">{dir === "rtl" ? "غير مملوك" : "Not owned"}</Badge>
                      )}
                      {isEquipped && (
                        <Badge variant="secondary" className="inline-flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {dir === "rtl" ? "مجهز" : "Equipped"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className={cn("flex items-center gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
                  {!isOwned ? (
                    <Button size="sm" onClick={() => purchase(f)}>
                      <ShoppingCart className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {dir === "rtl" ? "شراء" : "Buy"}
                    </Button>
                  ) : isEquipped ? (
                    <Button variant="outline" size="sm" onClick={() => equip(undefined)}>
                      <Undo2 className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {dir === "rtl" ? "إزالة" : "Remove"}
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => equip(f.id)}>
                      <Check className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {dir === "rtl" ? "تجهيز" : "Equip"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FrameSelector;