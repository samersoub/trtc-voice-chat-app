"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ReportService, type ReportType } from "@/services/ReportService";
import { showSuccess, showError } from "@/utils/toast";
import { RoomSettingsService } from "@/services/RoomSettingsService";

type Props = { roomId: string; userId: string };

const ReportPanel: React.FC<Props> = ({ roomId, userId }) => {
  const settings = RoomSettingsService.getSettings(roomId);
  if (settings.hideReports) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded border p-3 text-xs text-muted-foreground">Reports are disabled for this room.</div>
      </div>
    );
  }
  const [type, setType] = useState<ReportType>("voice-abuse");
  const [targetUserId, setTargetUserId] = useState("");
  const [description, setDescription] = useState("");
  const [reports, setReports] = useState(ReportService.list(roomId));

  const submit = () => {
    if (!roomId || !userId) return;
    const next = ReportService.submit(roomId, userId, type, {
      description: description || undefined,
      targetUserId: targetUserId || undefined,
    });
    setReports(next);
    setDescription("");
    setTargetUserId("");
    showSuccess("Report submitted");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="voice-abuse">Voice Abuse</SelectItem>
              <SelectItem value="music-spam">Music Spam</SelectItem>
              <SelectItem value="harassment">Harassment</SelectItem>
              <SelectItem value="technical">Technical Issue</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Target user ID (optional for music-spam/technical)"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={submit}>Submit Report</Button>
        </div>

        <div className="rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Auto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-xs text-muted-foreground">
                    No reports yet.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="capitalize">{r.type.replace("-", " ")}</TableCell>
                    <TableCell>{r.targetUserId ?? "—"}</TableCell>
                    <TableCell>{r.priority}</TableCell>
                    <TableCell>{r.autoActionApplied ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              ReportService.clear(roomId);
              setReports([]);
              showSuccess("Reports cleared");
            }}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportPanel;