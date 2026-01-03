"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: "all" | "active" | "banned";
  onStatusChange: (v: "all" | "active" | "banned") => void;
  onRefresh: () => void;
  onExport: () => void;
  total: number;
};

const UsersToolbar: React.FC<Props> = ({ search, onSearchChange, status, onStatusChange, onRefresh, onExport, total }) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
        <Select value={status} onValueChange={(v) => onStatusChange(v as "all" | "active" | "banned")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh}>Refresh</Button>
        <Button onClick={onExport}>Export CSV ({total})</Button>
      </div>
    </div>
  );
};

export default UsersToolbar;