"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { showError, showSuccess } from "@/utils/toast";
import { EconomyService } from "@/services/EconomyService";
import { CoinPackageService, type CoinPackage } from "@/services/CoinPackageService";
import { ProfileService, type Profile } from "@/services/ProfileService";
import { ActivityLogService, type ActivityLog } from "@/services/ActivityLogService";

const CoinsAdmin: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [targetId, setTargetId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [bulkIds, setBulkIds] = useState<string>("");
  const [bulkAmount, setBulkAmount] = useState<string>("");

  const [packages, setPackages] = useState<CoinPackage[]>(CoinPackageService.list());
  const [rate, setRate] = useState(CoinPackageService.getRate());
  const [pkgOpen, setPkgOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<CoinPackage | null>(null);
  const [pkgForm, setPkgForm] = useState<CoinPackage>({ id: "", name: "", coins: 0, price: 0, active: true, created_at: new Date().toISOString() });

  const logs = useMemo(() => EconomyService.getLogs().slice(-100).reverse(), []);
  const acts = useMemo<ActivityLog[]>(() => ActivityLogService.listAll().slice(-100).reverse(), []);

  useEffect(() => {
    void (async () => {
      const list = await ProfileService.listAll();
      setUsers(list);
    })();
  }, []);

  const platformCoins = useMemo(() => users.reduce((acc, u) => acc + (u.coins || 0), 0), [users]);

  const sendCoins = async (sign: 1 | -1) => {
    const delta = parseInt(amount || "0", 10) * sign;
    if (!targetId || !Number.isFinite(delta) || delta === 0) {
      showError("Enter target user ID and valid amount");
      return;
    }
    const updated = await ProfileService.updateCoins(targetId, delta);
    if (updated) {
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      ActivityLogService.log("admin", sign === 1 ? "coins_send" : "coins_deduct", targetId, { amount: Math.abs(delta) });
      showSuccess(`${sign === 1 ? "Sent" : "Deducted"} ${Math.abs(delta)} to ${updated.username}`);
    } else {
      showError("User not found");
    }
  };

  const distributeCoins = async () => {
    const ids = bulkIds.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
    const amt = parseInt(bulkAmount || "0", 10);
    if (ids.length === 0 || !Number.isFinite(amt) || amt <= 0) {
      showError("Provide at least one user ID and a positive amount");
      return;
    }
    let success = 0;
    for (const id of ids) {
      const updated = await ProfileService.updateCoins(id, amt);
      if (updated) {
        success++;
        ActivityLogService.log("admin", "coins_mass_send", id, { amount: amt });
        setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      }
    }
    showSuccess(`Distributed ${amt} coins to ${success}/${ids.length} users`);
    setBulkIds("");
    setBulkAmount("");
  };

  const savePackage = () => {
    try {
      if (!pkgForm.id || !pkgForm.name || pkgForm.coins <= 0 || pkgForm.price < 0) {
        showError("Fill all package fields");
        return;
      }
      if (editingPkg) {
        const updated = CoinPackageService.update(editingPkg.id, { ...pkgForm });
        setPackages((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        showSuccess("Package updated");
      } else {
        const created = CoinPackageService.add({ ...pkgForm });
        setPackages((prev) => [created, ...prev]);
        showSuccess("Package added");
      }
      setPkgOpen(false);
    } catch (e: any) {
      showError(e.message || "Failed to save package");
    }
  };

  return (
    <AdminLayout title="Coins">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Send / Deduct Coins</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="Target User ID" value={targetId} onChange={(e) => setTargetId(e.target.value)} />
            <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => void sendCoins(1)}>Send Coins</Button>
              <Button variant="destructive" onClick={() => void sendCoins(-1)}>Deduct Coins</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Platform total coins: {platformCoins}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recharge Rate</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input type="number" step="0.1" value={rate.rateMultiplier} onChange={(e) => setRate({ rateMultiplier: Math.max(0, Number(e.target.value) || 0) })} />
            <Button variant="outline" onClick={() => { CoinPackageService.setRate(rate); showSuccess("Rate saved"); }}>Save Rate</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Mass Coin Distribution</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Textarea placeholder="Enter user IDs separated by commas or whitespace" value={bulkIds} onChange={(e) => setBulkIds(e.target.value)} />
          <Input type="number" placeholder="Coins per user" value={bulkAmount} onChange={(e) => setBulkAmount(e.target.value)} />
          <Button onClick={() => void distributeCoins()}>Distribute Coins</Button>
          <div className="text-xs text-muted-foreground">
            Tip: Paste a list like "u1, u2, u3" or multiline IDs.
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Coin Packages</CardTitle>
          <Button onClick={() => { setEditingPkg(null); setPkgForm({ id: "", name: "", coins: 0, price: 0, active: true, created_at: new Date().toISOString() }); setPkgOpen(true); }}>
            New Package
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.coins}</TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell>{p.active ? "Active" : "Inactive"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingPkg(p); setPkgForm({ ...p }); setPkgOpen(true); }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => { CoinPackageService.remove(p.id); setPackages((prev) => prev.filter((x) => x.id !== p.id)); showSuccess("Package removed"); }}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {packages.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No packages</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <Card>
          <CardHeader><CardTitle>Coin Transactions</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TX</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{l.id}</TableCell>
                    <TableCell>{l.type}</TableCell>
                    <TableCell>{l.amount}</TableCell>
                    <TableCell className="text-xs">{l.meta ? JSON.stringify(l.meta) : "-"}</TableCell>
                    <TableCell>{new Date(l.at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No transactions</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Admin Activity</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.id}</TableCell>
                    <TableCell>{a.action}</TableCell>
                    <TableCell className="font-mono text-xs">{a.userId || "-"}</TableCell>
                    <TableCell>{new Date(a.at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {acts.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No activity</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={pkgOpen} onOpenChange={setPkgOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingPkg ? "Edit Package" : "New Package"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><div className="text-xs text-muted-foreground">ID</div><Input value={pkgForm.id} onChange={(e) => setPkgForm({ ...pkgForm, id: e.target.value })} disabled={!!editingPkg} /></div>
            <div className="space-y-2"><div className="text-xs text-muted-foreground">Name</div><Input value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} /></div>
            <div className="space-y-2"><div className="text-xs text-muted-foreground">Coins</div><Input type="number" value={pkgForm.coins} onChange={(e) => setPkgForm({ ...pkgForm, coins: Math.max(0, Number(e.target.value) || 0) })} /></div>
            <div className="space-y-2"><div className="text-xs text-muted-foreground">Price</div><Input type="number" step="0.01" value={pkgForm.price} onChange={(e) => setPkgForm({ ...pkgForm, price: Math.max(0, Number(e.target.value) || 0) })} /></div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Status</div>
              <Select value={pkgForm.active ? "active" : "inactive"} onValueChange={(v) => setPkgForm({ ...pkgForm, active: v === "active" })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-3">
            <Button onClick={savePackage} className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CoinsAdmin;