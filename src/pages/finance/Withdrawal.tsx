"use client";

import React, { useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";

const methods = [
  { key: "paypal", label: "PayPal", min: 10 },
  { key: "bank", label: "Bank Transfer", min: 20 },
];

const Withdrawal: React.FC = () => {
  const [method, setMethod] = useState(methods[0].key);
  const [amount, setAmount] = useState(10);

  const min = methods.find((m) => m.key === method)?.min ?? 10;

  return (
    <ChatLayout title="Withdrawal">
      <div className="mx-auto max-w-xl p-4">
        <Card>
          <CardHeader><CardTitle>Request Withdrawal</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Amount (USD)</Label>
              <Input type="number" min={min} value={amount} onChange={(e) => setAmount(parseInt(e.target.value || "0"))} />
              <div className="text-xs text-muted-foreground">Minimum: ${min}</div>
            </div>
            <div>
              <Button
                onClick={() => {
                  if (amount < min) {
                    showError(`Minimum is $${min}`);
                    return;
                  }
                  showSuccess(`Withdrawal requested via ${method} for $${amount}`);
                }}
              >
                Submit Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default Withdrawal;