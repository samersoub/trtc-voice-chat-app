"use client";

import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { EconomyService } from "@/services/EconomyService";
import { ReportService, type ReportItem } from "@/services/ReportService";
import { MicService } from "@/services/MicService";
import { MusicService } from "@/services/MusicService";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Flame, VolumeX, UserMinus, Music2 } from "lucide-react";
import { downloadCsv, toCsv } from "@/utils/csv";

// ADDED: helpers to scan rooms with reports
function scanRoomsWithReports(): string[] {
  const rooms: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith("reports:")) {
      const roomId = key.split(":")[1];
      if (roomId && !rooms.includes(roomId)) rooms.push(roomId);
    }
  }
  return rooms;
}

// ADDED: Moderation tab state
const ModerationTab: React.FC = () => {
  const [roomOptions, setRoomOptions] = React.useState<string[]>([]);
  const [roomId, setRoomId] = React.useState<string>("");
  const [items, setItems] = React.useState<ReportItem[]>([]);

  const refreshRooms = () => {
    const rooms = scanRoomsWithReports();
    setRoomOptions(rooms);
    if (rooms.length > 0 && !roomId) setRoomId(rooms[0]);
  };

  const refreshReports = () => {
    if (!roomId) {
      setItems([]);
      return;
    }
    setItems(ReportService.list(roomId));
  };

  React.useEffect(() => {
    refreshRooms();
  }, []);

  React.useEffect(() => {
    refreshReports();
  }, [roomId]);

  const applyAction = (r: ReportItem) => {
    if (r.type === "voice-abuse" && r.targetUserId) {
      MicService.mute(r.roomId, r.targetUserId, true);
      showSuccess(`Muted user ${r.targetUserId}`);
    } else if (r.type === "harassment" && r.targetUserId) {
      MicService.kick(r.roomId, r.targetUserId);
      showSuccess(`Kicked user ${r.targetUserId}`);
    } else if (r.type === "music-spam") {
      MusicService.skip(r.roomId);
      showSuccess("Skipped current track");
    } else {
      showSuccess("Marked as reviewed");
    }
  };

  const iconForType = (t: ReportItem["type"]) =>
    t === "voice-abuse" ? <VolumeX className="h-4 w-4" /> :
    t === "harassment" ? <UserMinus className="h-4 w-4" /> :
    t === "music-spam" ? <Music2 className="h-4 w-4" /> :
    <Flame className="h-4 w-4" />;

  const colorForPriority = (p: ReportItem["priority"]) =>
    p === "critical" ? "bg-red-100 text-red-700" :
    p === "high" ? "bg-amber-100 text-amber-700" :
    p === "medium" ? "bg-blue-100 text-blue-700" :
    "bg-gray-100 text-gray-700";

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Moderation Reports</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={roomId} onValueChange={setRoomId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              {roomOptions.map((id) => (
                <SelectItem key={id} value={id}>
                  {id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => { refreshRooms(); refreshReports(); }}>
            Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!roomId) return;
              ReportService.clear(roomId);
              showSuccess(`Cleared reports for ${roomId}`);
              refreshReports();
            }}
          >
            Clear Room Reports
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {(!roomId || items.length === 0) ? (
          <div className="text-sm text-muted-foreground">No reports found{roomId ? " for this room." : "."}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Auto Action</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.roomId}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {iconForType(r.type)}
                    <span className="capitalize">{r.type.replace("-", " ")}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded ${colorForPriority(r.priority)}`}>
                      {r.priority}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.targetUserId || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{r.reporterId}</TableCell>
                  <TableCell className="text-xs">{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {r.autoActionApplied ? <Badge variant="secondary">Applied</Badge> : <Badge>Pending</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => applyAction(r)}>
                      Apply
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

const financial = [
  { day: "Mon", recharge: 120, gifts: 50 },
  { day: "Tue", recharge: 180, gifts: 70 },
  { day: "Wed", recharge: 160, gifts: 65 },
  { day: "Thu", recharge: 210, gifts: 90 },
  { day: "Fri", recharge: 260, gifts: 130 },
  { day: "Sat", recharge: 240, gifts: 120 },
  { day: "Sun", recharge: 220, gifts: 100 },
];

const hosts = [
  { id: "h1", name: "Host A", salary: 500, commission: 15, approved: true },
  { id: "h2", name: "Host B", salary: 450, commission: 12, approved: false },
  { id: "h3", name: "Host C", salary: 600, commission: 18, approved: true },
];

const Reports: React.FC = () => {
  return (
    <AdminLayout title="Reports">
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="financial">Financial Stats</TabsTrigger>
          <TabsTrigger value="agency">Agency / Agents</TabsTrigger>
          <TabsTrigger value="recharges">Recharge Reports</TabsTrigger>
          <TabsTrigger value="moderation">Moderation Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="financial">
          <Card>
            <CardHeader><CardTitle>Daily Coin Recharges & Gift Transactions</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financial}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="recharge" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="gifts" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const logs = EconomyService.getLogs().filter((l) => l.type === "gift");
                    const rows = logs.map((l) => ({
                      id: l.id,
                      amount: l.amount,
                      giftId: l.meta?.giftId,
                      senderUid: l.meta?.senderUid,
                      receiverUid: l.meta?.receiverUid,
                      at: new Date(l.at).toISOString(),
                    }));
                    downloadCsv("gift_stats", toCsv(rows));
                    showSuccess("Exported gift statistics");
                  }}
                >
                  Export Gift Stats (CSV)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const logs = EconomyService.getLogs().filter((l) => l.type === "recharge");
                    const rows = logs.map((l) => ({
                      id: l.id,
                      amount: l.amount,
                      channel: l.meta?.channel,
                      at: new Date(l.at).toISOString(),
                    }));
                    downloadCsv("recharges", toCsv(rows));
                    showSuccess("Exported recharge logs");
                  }}
                >
                  Export Recharges (CSV)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="agency">
          <div className="grid gap-3">
            {hosts.map((h) => (
              <Card key={h.id}>
                <CardHeader><CardTitle className="text-base">{h.name}</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Salary: ${h.salary} • Commission: {h.commission}%
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant={h.approved ? "outline" : "default"} onClick={() => showSuccess(`${h.approved ? "Unapproved" : "Approved"} ${h.name}`)}>
                      {h.approved ? "Unapprove" : "Approve"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => showSuccess(`Edit ${h.name}`)}>Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recharges">
          <Card>
            <CardHeader><CardTitle>Recent Coin Recharges</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TX</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EconomyService.getLogs()
                    .filter((l) => l.type === "recharge")
                    .slice(-50)
                    .reverse()
                    .map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-mono text-xs">{l.id}</TableCell>
                        <TableCell className="capitalize">{(l.meta?.channel as string) || "-"}</TableCell>
                        <TableCell>{l.amount}</TableCell>
                        <TableCell>{new Date(l.at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="moderation">
          <ModerationTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Reports;