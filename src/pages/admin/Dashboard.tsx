"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCards from "@/components/admin/StatsCards";
import { Button } from "@/components/ui/button";
import { showError } from "@/utils/toast";
import { ProfileService, type Profile } from "@/services/ProfileService";
import LiveStats from "@/components/admin/LiveStats";
import ActivityFeed from "@/components/admin/ActivityFeed";
import AdminMenu from "@/components/admin/AdminMenu";

const Dashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await ProfileService.listAll();
      setProfiles(list);
    } catch (e: any) {
      showError(e.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="mb-6">
        <AdminMenu />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Realtime Statistics</h2>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <StatsCards profiles={profiles} />
      <div className="mt-4">
        <LiveStats />
      </div>
      <div className="mt-4">
        <ActivityFeed />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;