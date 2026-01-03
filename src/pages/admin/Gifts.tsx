"use client";

import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { GiftAdminService, type AdminGift, type GiftCategory } from "@/services/GiftAdminService";
import { EconomyService } from "@/services/EconomyService";
import { showError, showSuccess } from "@/utils/toast";
import { downloadCsv, toCsv } from "@/utils/csv";

const categories: GiftCategory[] = ["basic", "premium", "vip"];

const GiftsAdmin: React.FC = () => {
  const [items, setItems] = useState<AdminGift[]>(GiftAdminService.list());
  const [filter, setFilter] = useState<GiftCategory | "all">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminGift | null>(null);
  const [form, setForm] = useState<AdminGift>({
    id: "",
    name: "",
    price: 0,
    category: "basic",
    is_active: true,
    limitation: { perUserPerDay: undefined },
    created_at: new Date().toISOString(),
  });

  const filtered = useMemo(
    () => items.filter((g) => (filter === "all" ? true : g.category === filter)),
    [items, filter],
  );

  const stats = useMemo(() => {
    const logs = EconomyService.getLogs().filter((l) => l.type === "gift");
    const acc = new Map<string, { count: number; volume: number }>();
    for (const l of logs) {
      const giftId = (l.meta?.giftId as string) || "unknown";
      const prev = acc.get(giftId) || { count: 0, volume: 0 };
      prev.count += 1;
      prev.volume += l.amount;
      acc.set(giftId, prev);
    }
    return acc;
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({
      id: "",
      name: "",
      price: 0,
      category: "basic",
      is_active: true,
      limitation: { perUserPerDay: undefined },
      created_at: new Date().toISOString(),
    });
    setOpen(true);
  };

  const startEdit = (g: AdminGift) => {
    setEditing(g);
    setForm({ ...g });
    setOpen(true);
  };

  const save = () => {
    try {
      if (!form.id || !form.name || form.price < 0) {
        showError("Fill required fields (ID, name, price)");
        return;
      }
      if (editing) {
        const updated = GiftAdminService.update(editing.id, { ...form });
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        showSuccess(`Updated ${updated.name}`);
      } else {
        const { created_at: _ignore, ...payload } = form;
        const created = GiftAdminService.add(payload);
        setItems((prev) => [created, ...prev]);
        showSuccess(`Added ${created.name}`);
      }
      setOpen(false);
    } catch (e: any) {
      showError(e.message || "Failed to save gift");
    }
  };

  const uploadFile = async (file: File, kind: "image" | "animation") => {
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, ...(kind === "image" ? { image_url: url } : { animation_url: url }) }));
    showSuccess(kind === "image" ? "Image uploaded" : "Animation uploaded");
  };

  return (
    <AdminLayout title="Gifts">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as GiftCategory | "all")}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setItems(GiftAdminService.list())}>Refresh</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const rows = items.map((g) => ({
                id: g.id,
                name: g.name,
                price: g.price,
                category: g.category,
                is_active: g.is_active,
                image_url: g.image_url ?? "",
                animation_url: g.animation_url ?? "",
                limit_perUserPerDay: g.limitation?.perUserPerDay ?? "",
              }));
              downloadCsv("gifts", toCsv(rows));
              showSuccess("Exported gifts to CSV");
            }}
          >
            Export CSV
          </Button>
          <Button onClick={startCreate}>New Gift</Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader><CardTitle>Batch Import Gifts (CSV)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs text-muted-foreground">Columns: id,name,price,category,image_url,animation_url,is_active,limit_perUserPerDay</div>
          <Input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const text = String(reader.result || "");
                  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
                  const headers = headerLine.split(",").map((h) => h.trim());
                  const get = (row: Record<string, string>, k: string) => row[k] || "";
                  const created: AdminGift[] = [];
                  lines.forEach((line) => {
                    const cols = line.split(",").map((c) => c.trim());
                    const row: Record<string, string> = {};
                    headers.forEach((h, i) => (row[h] = cols[i] ?? ""));
                    const g: Omit<AdminGift, "created_at"> = {
                      id: get(row, "id"),
                      name: get(row, "name"),
                      price: Number(get(row, "price") || "0"),
                      category: (get(row, "category") || "basic") as GiftCategory,
                      is_active: String(get(row, "is_active") || "true").toLowerCase() === "true",
                      image_url: get(row, "image_url") || undefined,
                      animation_url: get(row, "animation_url") || undefined,
                      limitation: { perUserPerDay: get(row, "limit_perUserPerDay") ? Number(get(row, "limit_perUserPerDay")) : undefined },
                    };
                    if (!g.id || !g.name) return;
                    try {
                      const added = GiftAdminService.add(g);
                      created.push(added);
                    } catch {
                      // skip duplicates
                    }
                  });
                  if (created.length > 0) {
                    setItems(GiftAdminService.list());
                    showSuccess(`Imported ${created.length} gifts`);
                  } else {
                    showError("No gifts imported");
                  }
                } catch {
                  showError("Failed to parse CSV");
                }
              };
              reader.readAsText(file);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Gift Shop Administration</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Limit/Day</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Animation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-mono text-xs">{g.id}</TableCell>
                  <TableCell>{g.name}</TableCell>
                  <TableCell className="uppercase">{g.category}</TableCell>
                  <TableCell>{g.price}</TableCell>
                  <TableCell>
                    <Switch checked={g.is_active} onCheckedChange={(v) => {
                      const updated = GiftAdminService.update(g.id, { is_active: v });
                      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                    }} />
                  </TableCell>
                  <TableCell>{g.limitation?.perUserPerDay ?? "-"}</TableCell>
                  <TableCell>{g.image_url ? "Yes" : "No"}</TableCell>
                  <TableCell>{g.animation_url ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(g)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => {
                        GiftAdminService.remove(g.id);
                        setItems((prev) => prev.filter((x) => x.id !== g.id));
                        showSuccess(`Deleted ${g.name}`);
                      }}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No gifts found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>Gift Sending Statistics</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gift</TableHead>
                <TableHead>Sent Count</TableHead>
                <TableHead>Total Coins</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((g) => {
                const st = stats.get(g.id) || { count: 0, volume: 0 };
                return (
                  <TableRow key={g.id}>
                    <TableCell>{g.name}</TableCell>
                    <TableCell>{st.count}</TableCell>
                    <TableCell>{st.volume}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Gift" : "New Gift"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">ID</div>
              <Input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={!!editing} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Name</div>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Price (coins)</div>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Math.max(0, Number(e.target.value) || 0) })} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Category</div>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as GiftCategory })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Limit per user/day</div>
              <Input type="number" value={form.limitation?.perUserPerDay ?? ""} onChange={(e) => setForm({ ...form, limitation: { perUserPerDay: Math.max(0, Number(e.target.value) || 0) } })} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Active</div>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Image</div>
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "image")} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Animation (Lottie or video)</div>
              <Input type="file" accept=".json,video/*" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "animation")} />
            </div>
          </div>
          <DialogFooter className="mt-3">
            <Button onClick={save} className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default GiftsAdmin;