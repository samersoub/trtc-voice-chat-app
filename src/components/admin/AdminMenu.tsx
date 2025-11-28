"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, Mic, FileChartColumn, Settings, Gift, Coins, Building2, Image as ImageIcon } from "lucide-react";

type AdminItem = {
  title: string;
  to: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const items: AdminItem[] = [
  { title: "Status", to: "/admin/status", description: "Service health and realtime metrics", icon: Activity },
  { title: "Users", to: "/admin/users", description: "Manage user accounts and roles", icon: Users },
  { title: "Rooms", to: "/admin/rooms", description: "Moderate and configure voice rooms", icon: Mic },
  { title: "Reports", to: "/admin/reports", description: "Review and resolve user reports", icon: FileChartColumn },
  { title: "Agencies", to: "/admin/agencies", description: "Manage host agencies and schedules", icon: Building2 },
  { title: "Banners", to: "/admin/banners", description: "Configure promotional banners", icon: ImageIcon },
  { title: "Gifts", to: "/admin/gifts", description: "Administer virtual gifts and pricing", icon: Gift },
  { title: "Coins", to: "/admin/coins", description: "Set coin packs and economy rules", icon: Coins },
  { title: "Settings", to: "/admin/settings", description: "Platform configuration and preferences", icon: Settings },
];

const AdminMenu: React.FC = () => {
  return (
    <section aria-label="Admin dashboard menu" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard Menu</h2>
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Admin Home
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(({ title, to, description, icon: Icon }) => (
          <Card key={to} className="transition hover:shadow-sm hover:border-primary/30">
            <CardHeader className="flex flex-row items-center gap-3">
              <Icon className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="mt-0.5">{description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Go to {title} to manage related settings and data.
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="default" className="w-full">
                <Link to={to}>Open {title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AdminMenu;