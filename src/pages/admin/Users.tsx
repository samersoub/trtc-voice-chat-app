"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProfileService, type Profile } from "@/services/ProfileService";
import UsersToolbar from "@/components/admin/UsersToolbar";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { downloadCsv, toCsv } from "@/utils/csv";
import { ActivityLogService } from "@/services/ActivityLogService";

const Users: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const [balanceOpen, setBalanceOpen] = useState(false);
  const [coinsDelta, setCoinsDelta] = useState<string>("");
  const [targetUser, setTargetUser] = useState<Profile | null>(null);
  const [q, setQ] = useState<string>("");
  const [status, setStatus] = useState<"all" | "active" | "banned">("all");
  const [role, setRole] = useState<"all" | "user" | "host" | "admin" | "super_admin">("all");
  const [minCoins, setMinCoins] = useState<string>("");
  const [maxCoins, setMaxCoins] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [editOpen, setEditOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [editForm, setEditForm] = useState<Profile | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await ProfileService.listAll();
      setUsers(list);
    } catch (e: any) {
      showError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const text = `${u.username} ${u.email} ${u.phone}`.toLowerCase();
    const matchesQ = q ? text.includes(q.toLowerCase()) : true;
    const matchesStatus = status === "all" ? true : status === "active" ? u.is_active : !u.is_active;
    const matchesRole = role === "all" ? true : u.role === role;
    const matchesMin = minCoins ? (u.coins || 0) >= Number(minCoins) : true;
    const matchesMax = maxCoins ? (u.coins || 0) <= Number(maxCoins) : true;
    const created = u.created_at ? new Date(u.created_at).getTime() : 0;
    const matchesFrom = fromDate ? created >= new Date(fromDate).getTime() : true;
    const matchesTo = toDate ? created <= new Date(toDate).getTime() : true;
    return matchesQ && matchesStatus && matchesRole && matchesMin && matchesMax && matchesFrom && matchesTo;
  });

  const exportCSV = () => {
    const header = ["id","username","email","phone","coins","is_active","is_verified","created_at","last_login"];
    const rows = filteredUsers.map((u) => [
      u.id, u.username, u.email, u.phone, String(u.coins ?? 0), String(u.is_active), String(u.is_verified), u.created_at, u.last_login || ""
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess("Exported CSV");
  };

  return (
    <AdminLayout title="Users">
      <UsersToolbar
        search={q}
        onSearchChange={setQ}
        status={status}
        onStatusChange={setStatus}
        onRefresh={fetchUsers}
        onExport={exportCSV}
        total={filteredUsers.length}
      />

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Search name/email/phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
          <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="host">Host</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input type="number" placeholder="Min coins" value={minCoins} onChange={(e) => setMinCoins(e.target.value)} />
          <Input type="number" placeholder="Max coins" value={maxCoins} onChange={(e) => setMaxCoins(e.target.value)} />
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <Button
            variant="outline"
            onClick={() => {
              setQ(""); setStatus("all"); setRole("all"); setMinCoins(""); setMaxCoins(""); setFromDate(""); setToDate("");
            }}
          >
            Clear Filters
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const rows = filteredUsers.map((u) => ({
                id: u.id,
                username: u.username,
                email: u.email,
                phone: u.phone,
                role: u.role,
                coins: u.coins,
                is_active: u.is_active,
                is_verified: u.is_verified,
                created_at: u.created_at,
              }));
              downloadCsv("users_export", toCsv(rows));
            }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Coins</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">{u.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {u.username}
                    {u.is_verified && <span className="text-blue-500">✓</span>}
                    {!u.is_active && <span className="text-red-500 text-xs">(محظور)</span>}
                  </div>
                  {!u.is_active && u.ban_reason && (
                    <div className="text-xs text-muted-foreground mt-1">
                      السبب: {u.ban_reason}
                    </div>
                  )}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>{u.coins ?? 0}</TableCell>
                <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{u.last_login ? new Date(u.last_login).toLocaleDateString() : "-"}</TableCell>
                <TableCell>{u.is_active ? "active" : "banned"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    <Button
                      variant={u.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => {
                        setTargetUser(u);
                        if (u.is_active) {
                          setBanReason("");
                          setBanOpen(true);
                        } else {
                          // Unban directly
                          ProfileService.unbanUser(u.id).then((updated) => {
                            if (updated) {
                              setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                              showSuccess(`تم إلغاء حظر ${updated.username}`);
                              ActivityLogService.log("admin", "user_unban", u.id);
                            }
                          });
                        }
                      }}
                    >
                      {u.is_active ? "🚫 حظر" : "✅ إلغاء الحظر"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setTargetUser(u);
                        setCoinsDelta("");
                        setBalanceOpen(true);
                      }}
                    >
                      💰 عملات
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTargetUser(u);
                        setRoleOpen(true);
                      }}
                    >
                      👤 الدور
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditForm(u);
                        setEditOpen(true);
                      }}
                    >
                      ✏️ تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const updated = await ProfileService.verifyUser(u.id, !u.is_verified);
                        if (updated) {
                          setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                          showSuccess(`${updated.is_verified ? "تم التوثيق" : "تم إلغاء التوثيق"} ${updated.username}`);
                        }
                      }}
                    >
                      {u.is_verified ? "☑️ موثق" : "☐ توثيق"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setTargetUser(u);
                        setDeleteOpen(true);
                      }}
                    >
                      🗑️ حذف
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setTargetUser(u);
                        setLogsOpen(true);
                      }}
                    >
                      📊 السجل
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No users found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={balanceOpen} onOpenChange={setBalanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Coins {targetUser ? `• ${targetUser.username}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Coins delta (e.g., +50 or -10)"
              value={coinsDelta}
              onChange={(e) => setCoinsDelta(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-3">
            <Button
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
              onClick={async () => {
                const delta = parseInt(coinsDelta || "0", 10);
                if (!Number.isFinite(delta)) {
                  showError("Enter a valid number");
                  return;
                }
                const updated = await ProfileService.updateCoins(targetUser?.id || "", delta);
                if (updated) {
                  setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                  ActivityLogService.log("admin", "coins_adjust", targetUser?.id, { delta });
                  showSuccess(`Updated ${updated.username}: Coins=${updated.coins}`);
                }
                setCoinsDelta("");
                setBalanceOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Profile {editForm ? `• ${editForm.username}` : ""}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Username" value={editForm?.username || ""} onChange={(e) => setEditForm((p) => p ? { ...p, username: e.target.value } : p)} />
            <Input placeholder="Email" value={editForm?.email || ""} onChange={(e) => setEditForm((p) => p ? { ...p, email: e.target.value } : p)} />
            <Input placeholder="Phone" value={editForm?.phone || ""} onChange={(e) => setEditForm((p) => p ? { ...p, phone: e.target.value } : p)} />
            <Select value={editForm?.is_verified ? "verified" : "unverified"} onValueChange={(v) => setEditForm((p) => p ? { ...p, is_verified: v === "verified" } : p)}>
              <SelectTrigger><SelectValue placeholder="Verification" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-3">
            <Button onClick={async () => {
              if (!editForm) return;
              const updated = await ProfileService.upsertProfile(editForm);
              setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
              ActivityLogService.log("admin", "profile_edit", updated.id);
              showSuccess("Profile saved");
              setEditOpen(false);
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Role {targetUser ? `• ${targetUser.username}` : ""}</DialogTitle></DialogHeader>
          <Select value={targetUser?.role || "user"} onValueChange={(v) => setTargetUser((p) => p ? { ...p, role: v } as Profile : p)}>
            <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="host">Host</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter className="mt-3">
            <Button onClick={async () => {
              if (!targetUser) return;
              const updated = await ProfileService.updateRole(targetUser.id, targetUser.role);
              if (updated) {
                setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                ActivityLogService.log("admin", "role_change", updated.id, { role: updated.role });
                showSuccess(`تم تحديث الدور إلى ${updated.role}`);
                setRoleOpen(false);
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>User Activity {targetUser ? `• ${targetUser.username}` : ""}</DialogTitle></DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(targetUser ? ActivityLogService.listByUser(targetUser.id) : []).map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.id}</TableCell>
                  <TableCell>{l.action}</TableCell>
                  <TableCell>{new Date(l.at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {(!targetUser || ActivityLogService.listByUser(targetUser.id).length === 0) && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No activity</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حظر المستخدم {targetUser ? `• ${targetUser.username}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">سبب الحظر</label>
              <textarea
                className="w-full min-h-[100px] p-3 border rounded-md"
                placeholder="اكتب سبب حظر هذا المستخدم..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              ⚠️ سيتم منع المستخدم من تسجيل الدخول إلى التطبيق
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setBanOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!targetUser) return;
                if (!banReason.trim()) {
                  showError("يرجى إدخال سبب الحظر");
                  return;
                }
                const updated = await ProfileService.banUser(targetUser.id, banReason);
                if (updated) {
                  setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                  showSuccess(`تم حظر ${updated.username}`);
                  ActivityLogService.log("admin", "user_ban", updated.id, { reason: banReason });
                  setBanOpen(false);
                  setBanReason("");
                }
              }}
            >
              تأكيد الحظر
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">⚠️ حذف المستخدم نهائيًا</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              هل أنت متأكد من حذف المستخدم <strong>{targetUser?.username}</strong>؟
            </p>
            <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20">
              <p className="text-sm font-medium text-destructive">تحذير:</p>
              <ul className="text-sm text-destructive/90 list-disc list-inside mt-2 space-y-1">
                <li>لا يمكن التراجع عن هذا الإجراء</li>
                <li>سيتم حذف جميع بيانات المستخدم</li>
                <li>سيتم حذف سجل المعاملات والهدايا</li>
                <li>سيتم إزالة المستخدم من جميع الغرف</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!targetUser) return;
                const success = await ProfileService.deleteUser(targetUser.id);
                if (success) {
                  setUsers((prev) => prev.filter((x) => x.id !== targetUser.id));
                  showSuccess(`تم حذف ${targetUser.username} نهائيًا`);
                  ActivityLogService.log("admin", "user_delete", targetUser.id);
                  setDeleteOpen(false);
                }
              }}
            >
              حذف نهائي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Users;