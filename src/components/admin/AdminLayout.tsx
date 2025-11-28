"use client";

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3, Home, Users, Mic, FileChartColumn, Settings } from "lucide-react";
import { Image as ImageIcon, Building2 } from "lucide-react";
import { Gift, Coins } from "lucide-react";
import { AuthService } from "@/services/AuthService";
import { ProfileService } from "@/services/ProfileService";
import { showError } from "@/utils/toast";

const AdminLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title = "Admin" }) => {
  const loc = useLocation();
  const is = (path: string) => loc.pathname === path;
  const nav = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem("admin:token");
    if (!token) {
      nav("/admin/login");
      return;
    }
    // Bypass RBAC when using the demo token
    if (token === "demo-token") {
      return;
    }

    // RBAC: allow admin or super_admin
    const u = AuthService.getCurrentUser();
    if (!u) return;
    (async () => {
      const prof = await ProfileService.getByUserId(u.id);
      const role = prof?.role || "user";
      if (!["admin", "super_admin"].includes(role)) {
        showError("Access denied: admin only");
        nav("/");
      }
    })();
  }, [nav]);

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r">
        <SidebarHeader className="px-3 py-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Admin Panel</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={is("/admin")}>
                    <Link to="/admin"><Home /> Dashboard</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={is("/admin/status")}>
                    <Link to="/admin/status"><Activity /> Status</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={is("/admin/users")}>
                    <Link to="/admin/users"><Users /> Users</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={is("/admin/rooms")}>
                    <Link to="/admin/rooms"><Mic /> Rooms</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={is("/admin/reports")}>
                    <Link to="/admin/reports"><FileChartColumn /> Reports</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={is("/admin/agencies")}>
                    <Link to="/admin/agencies"><Building2 /> Agencies</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={is("/admin/banners")}>
                    <Link to="/admin/banners"><ImageIcon /> Banners</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={is("/admin/settings")}>
                    <Link to="/admin/settings"><Settings /> Settings</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={is("/admin/gifts")}>
                    <Link to="/admin/gifts"><Gift /> Gifts</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={is("/admin/coins")}>
                    <Link to="/admin/coins"><Coins /> Coins</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-3 py-2">
          <Button asChild variant="outline" className="w-full">
            <Link to="/">Back to App</Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="flex items-center h-12 px-3 gap-2">
            <SidebarTrigger />
            <h1 className="text-sm font-semibold">{title}</h1>
          </div>
        </header>
        <div className="flex-1 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;