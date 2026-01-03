"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MusicService } from "@/services/MusicService";
import { MusicPermissionsService } from "@/services/MusicPermissionsService";
import { showSuccess, showError } from "@/utils/toast";

type Props = { roomId: string; userId: string };

const MusicQueue: React.FC<Props> = ({ roomId, userId }) => {
  const [queue, setQueue] = React.useState(MusicService.getQueue(roomId));
  const role = MusicPermissionsService.getRole(roomId, userId);
  const canApprove = MusicPermissionsService.canApprove(roomId, userId);
  const canControl = MusicPermissionsService.canControl(roomId, userId);

  React.useEffect(() => {
    setQueue(MusicService.getQueue(roomId));
  }, [roomId]);

  const onVote = (reqId: string) => {
    const next = MusicService.vote(roomId, reqId, userId);
    setQueue(next);
    showSuccess("Voted");
  };

  const onApprove = (reqId: string) => {
    if (!canApprove) {
      showError("No permission");
      return;
    }
    const next = MusicService.approve(roomId, reqId);
    setQueue(next);
    showSuccess("Approved");
  };

  const onRefresh = () => {
    setQueue(MusicService.getQueue(roomId));
    showSuccess("Queue refreshed");
  };

  const onClear = () => {
    if (!canControl) {
      showError("No permission");
      return;
    }
    const next = MusicService.clearQueue(roomId);
    setQueue(next);
    showSuccess("Queue cleared");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Music Queue</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>Refresh</Button>
            <Button variant="outline" size="sm" onClick={onClear}>Clear</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <div className="text-xs text-muted-foreground">No requests</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track</TableHead>
                <TableHead className="hidden sm:table-cell">Votes</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">{r.track.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">{r.votes}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1">
                      {r.approved ? <Badge variant="default">Approved</Badge> : <Badge variant="outline">Pending</Badge>}
                      {r.played && <Badge variant="secondary">Played</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => onVote(r.id)}>Vote</Button>
                      {canApprove && !r.approved && (
                        <Button size="sm" onClick={() => onApprove(r.id)}>Approve</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="mt-2 text-[11px] text-muted-foreground">Role: {role}</div>
      </CardContent>
    </Card>
  );
};

export default MusicQueue;