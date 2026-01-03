"use client";

import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

const members = [
  { id: "H1001", name: "Layla", liveHours: 42, giftIncome: 3200 },
  { id: "H1002", name: "Omar", liveHours: 55, giftIncome: 4100 },
  { id: "H1003", name: "Sara", liveHours: 30, giftIncome: 1800 },
  { id: "H1004", name: "Nadia", liveHours: 68, giftIncome: 5200 },
];

const HostAgency: React.FC = () => {
  const totalHours = members.reduce((a, b) => a + b.liveHours, 0);
  const totalGifts = members.reduce((a, b) => a + b.giftIncome, 0);

  return (
    <AdminLayout title="Host Agency">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Total Live Hours</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{totalHours}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Gift Income</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{totalGifts}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Members</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>UID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Live Hours</TableHead>
                  <TableHead>Gift Income</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>{m.id}</TableCell>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>{m.liveHours}</TableCell>
                    <TableCell>{m.giftIncome}</TableCell>
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

export default HostAgency;