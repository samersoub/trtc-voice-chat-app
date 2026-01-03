"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ActivityLogService, type ActivityLog } from "@/services/ActivityLogService";

const ActivityFeed: React.FC = () => {
  const [items, setItems] = React.useState<ActivityLog[]>(ActivityLogService.listAll().slice(0, 10));

  React.useEffect(() => {
    const onLog = (e: Event) => {
      const entry = (e as CustomEvent<ActivityLog>).detail;
      setItems((prev) => [entry, ...prev].slice(0, 10));
    };
    window.addEventListener("activity:log", onLog);
    return () => window.removeEventListener("activity:log", onLog);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Live Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-mono text-xs">{l.id}</TableCell>
                <TableCell>{l.action}</TableCell>
                <TableCell className="font-mono text-xs">{l.userId || "-"}</TableCell>
                <TableCell className="text-xs">{new Date(l.at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No activity yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;