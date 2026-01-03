"use client";

import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { EconomyService } from "@/services/EconomyService";
import { showSuccess, showError } from "@/utils/toast";

const RechargeAgency: React.FC = () => {
  const [agentId, setAgentId] = useState("AG001");
  const [targetUid, setTargetUid] = useState("");
  const [amount, setAmount] = useState<number>(100);
  const [logs, setLogs] = useState(EconomyService.getLogs().filter(l => l.type === "transfer").slice().reverse());

  return (
    <AdminLayout title="Recharge Agency">
      <div className="grid gap-4 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Transfer Coins</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label>Agent ID</Label>
              <Input value={agentId} onChange={e => setAgentId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Target UID</Label>
              <Input placeholder="Enter user UID" value={targetUid} onChange={e => setTargetUid(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Amount (Coins)</Label>
              <Input type="number" min={1} value={amount} onChange={e => setAmount(parseInt(e.target.value || "0"))} />
            </div>
            <Button
              onClick={() => {
                try {
                  EconomyService.transferCoinsToUser(agentId, targetUid, amount);
                  setLogs(EconomyService.getLogs().filter(l => l.type === "transfer").slice().reverse());
                  showSuccess(`Transferred ${amount} coins to ${targetUid}`);
                  setTargetUid("");
                } catch (e: any) {
                  showError(e.message || "Transfer failed");
                }
              }}
            >
              Transfer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Transfer Log</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>At</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Target UID</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 && (
                  <TableRow><TableCell colSpan={4}>No transfers yet.</TableCell></TableRow>
                )}
                {logs.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>{new Date(l.at).toLocaleString()}</TableCell>
                    <TableCell>{l.meta?.agentId}</TableCell>
                    <TableCell>{l.meta?.targetUid}</TableCell>
                    <TableCell>{l.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RechargeAgency;