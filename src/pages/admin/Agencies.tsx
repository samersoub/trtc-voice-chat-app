"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AgencyService, type HostAgency, type RechargeAgency } from "@/services/AgencyService";
import { showSuccess, showError } from "@/utils/toast";
import { Input } from "@/components/ui/input";
import { HostService, type HostProfile } from "@/services/HostService";
import { HostScheduleService, type HostSchedule } from "@/services/HostScheduleService";
import { ActivityLogService } from "@/services/ActivityLogService";
import { downloadCsv, toCsv } from "@/utils/csv";

const AgenciesAdmin: React.FC = () => {
  const [hosts, setHosts] = useState<HostAgency[]>([]);
  const [recharges, setRecharges] = useState<RechargeAgency[]>([]);
  const [open, setOpen] = useState(false);
  const [statement, setStatement] = useState<{ title: string; lines: Record<string, any> } | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [newAgency, setNewAgency] = useState<HostAgency>({ id: "", name: "", ownerName: "", commission: 10, approved: false });

  const [editOpen, setEditOpen] = useState(false);
  const [editAgency, setEditAgency] = useState<HostAgency | null>(null);

  const [hostMgmtOpen, setHostMgmtOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState<HostProfile | null>(null);
  const [rateInput, setRateInput] = useState<string>("");
  const [schedule, setSchedule] = useState<HostSchedule | null>(null);

  const refresh = () => {
    setHosts(AgencyService.listHostAgencies());
    setRecharges(AgencyService.listRechargeAgencies());
  };

  useEffect(() => {
    refresh();
  }, []);

  const hostList = HostService.list();

  return (
    <AdminLayout title="Agencies">
      <div className="flex items-center justify-between mb-3">
        <Button variant="outline" onClick={refresh}>Refresh</Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const rows = hosts.map((h) => ({
                id: h.id,
                name: h.name,
                ownerName: h.ownerName,
                commission: h.commission,
                approved: h.approved,
              }));
              downloadCsv("host_agencies", toCsv(rows));
              showSuccess("Exported host agencies");
            }}
          >
            Export Host Agencies
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const rows = recharges.map((r) => ({
                id: r.id,
                name: r.name,
                channel: r.channel,
                commission: r.commission,
                approved: r.approved,
              }));
              downloadCsv("recharge_agencies", toCsv(rows));
              showSuccess("Exported recharge agencies");
            }}
          >
            Export Recharge Agencies
          </Button>
          <Button onClick={() => { setAddOpen(true); setNewAgency({ id: "", name: "", ownerName: "", commission: 10, approved: false }); }}>New Host Agency</Button>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle>Host Agencies</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hosts.map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-xs">{h.id}</TableCell>
                    <TableCell>{h.name}</TableCell>
                    <TableCell>{h.ownerName}</TableCell>
                    <TableCell>{h.commission}%</TableCell>
                    <TableCell>{h.approved ? "Approved" : "Pending"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant={h.approved ? "outline" : "default"}
                          onClick={() => {
                            AgencyService.approveHostAgency(h.id, !h.approved);
                            showSuccess(`${!h.approved ? "Approved" : "Unapproved"} ${h.name}`);
                            refresh();
                          }}
                        >
                          {h.approved ? "Unapprove" : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditAgency(h);
                            setEditOpen(true);
                          }}
                        >
                          Edit Commission
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            AgencyService.removeHostAgency(h.id);
                            showSuccess(`Removed ${h.name}`);
                            refresh();
                          }}
                        >
                          Remove
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const st = AgencyService.hostCommissionStatement(h.id);
                            setStatement({ title: `Statement • ${h.name}`, lines: st });
                            setOpen(true);
                          }}
                        >
                          Statement
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {hosts.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No host agencies</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recharge Agencies</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recharges.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="uppercase">{r.channel}</TableCell>
                    <TableCell>{r.commission}%</TableCell>
                    <TableCell>{r.approved ? "Approved" : "Pending"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant={r.approved ? "outline" : "default"}
                          onClick={() => {
                            AgencyService.approveRechargeAgency(r.id, !r.approved);
                            showSuccess(`${!r.approved ? "Approved" : "Unapproved"} ${r.name}`);
                            refresh();
                          }}
                        >
                          {r.approved ? "Unapprove" : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const st = AgencyService.rechargeStatement(r.id);
                            setStatement({ title: `Statement • ${r.name}`, lines: st });
                            setOpen(true);
                          }}
                        >
                          Statement
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {recharges.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No recharge agencies</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Host Roster & Performance</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hostList.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-xs">{h.id}</TableCell>
                    <TableCell>{h.name}</TableCell>
                    <TableCell>{h.rating}</TableCell>
                    <TableCell>{h.hourlyRateCoins} coins/hr</TableCell>
                    <TableCell>{h.reviews}</TableCell>
                    <TableCell>{h.verified ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          HostService.setVerified(h.id, !h.verified);
                          showSuccess(`${!h.verified ? "Verified" : "Unverified"} ${h.name}`);
                          setHostMgmtOpen(false);
                        }}>
                          {h.verified ? "Unverify" : "Verify"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedHost(h);
                          setRateInput(String(h.hourlyRateCoins));
                          setSchedule(HostScheduleService.get(h.id));
                          setHostMgmtOpen(true);
                        }}>
                          Manage
                        </Button>
                        <Button size="sm" onClick={() => {
                          ActivityLogService.log("admin", "host_settlement", h.id, { amount: h.hourlyRateCoins });
                          showSuccess(`Settled payment for ${h.name}`);
                        }}>
                          Settle Payment
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {hostList.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No hosts</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Statement dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{statement?.title || "Statement"}</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            {statement &&
              Object.entries(statement.lines).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{String(v)}</span>
                </div>
              ))}
          </div>
          <DialogFooter className="mt-2">
            <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Agency dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Host Agency</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="ID" value={newAgency.id} onChange={(e) => setNewAgency({ ...newAgency, id: e.target.value })} />
            <Input placeholder="Name" value={newAgency.name} onChange={(e) => setNewAgency({ ...newAgency, name: e.target.value })} />
            <Input placeholder="Owner Name" value={newAgency.ownerName} onChange={(e) => setNewAgency({ ...newAgency, ownerName: e.target.value })} />
            <Input type="number" placeholder="Commission (%)" value={newAgency.commission} onChange={(e) => setNewAgency({ ...newAgency, commission: Math.max(0, Number(e.target.value) || 0) })} />
          </div>
          <DialogFooter className="mt-3">
            <Button onClick={() => {
              try {
                if (!newAgency.id || !newAgency.name || !newAgency.ownerName) {
                  showError("Fill all fields");
                  return;
                }
                const created = AgencyService.addHostAgency(newAgency);
                showSuccess(`Added ${created.name}`);
                setAddOpen(false);
                refresh();
              } catch (e: any) {
                showError(e.message || "Failed to add agency");
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Commission dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Commission {editAgency ? `• ${editAgency.name}` : ""}</DialogTitle></DialogHeader>
          <Input type="number" value={editAgency?.commission ?? 0} onChange={(e) => setEditAgency((a) => a ? { ...a, commission: Math.max(0, Number(e.target.value) || 0) } : a)} />
          <DialogFooter className="mt-3">
            <Button onClick={() => {
              if (!editAgency) return;
              try {
                const updated = AgencyService.updateHostAgency(editAgency.id, { commission: editAgency.commission });
                showSuccess("Commission updated");
                setEditOpen(false);
                setHosts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
              } catch (e: any) {
                showError(e.message || "Failed to update");
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Host management dialog */}
      <Dialog open={hostMgmtOpen} onOpenChange={setHostMgmtOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Host {selectedHost ? `• ${selectedHost.name}` : ""}</DialogTitle></DialogHeader>
          {selectedHost && schedule && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Hourly Rate (coins)</div>
                <Input type="number" value={rateInput} onChange={(e) => setRateInput(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="text-xs text-muted-foreground">Availability (days)</div>
                <div className="flex flex-wrap gap-2">
                  {(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const).map((d) => (
                    <Button
                      key={d}
                      variant={schedule.daysOfWeek.includes(d) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => {
                        const nextDays = schedule.daysOfWeek.includes(d)
                          ? schedule.daysOfWeek.filter((x) => x !== d)
                          : [...schedule.daysOfWeek, d];
                        setSchedule({ ...schedule, daysOfWeek: nextDays });
                      }}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="text-xs text-muted-foreground">Note</div>
                <Input value={schedule.note || ""} onChange={(e) => setSchedule({ ...schedule, note: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter className="mt-3">
            <Button onClick={() => {
              if (!selectedHost || !schedule) return;
              HostService.setHourlyRate(selectedHost.id, Math.max(0, Number(rateInput) || 0));
              HostScheduleService.set(selectedHost.id, schedule);
              showSuccess("Host updated");
              setHostMgmtOpen(false);
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AgenciesAdmin;