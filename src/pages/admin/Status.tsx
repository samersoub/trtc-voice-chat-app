"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CodeLine from "@/components/ui/CodeLine";
import { showSuccess } from "@/utils/toast";
import { supabase, isSupabaseReady } from "@/services/db/supabaseClient";
import { AuthService } from "@/services/AuthService";

const Status: React.FC = () => {
  const [ready, setReady] = useState<boolean>(isSupabaseReady);
  const [token, setToken] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<Date | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const refresh = async () => {
    setReady(isSupabaseReady);
    const t = await AuthService.getAccessToken();
    setToken(t);
    const exp = await AuthService.getTokenExpiry();
    setExpiry(exp);
    // UPDATED: Guard supabase before calling auth.getUser and avoid destructuring from undefined
    const userRes = supabase ? await supabase.auth.getUser() : undefined;
    setEmail(userRes?.data?.user?.email ?? null);
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <AdminLayout title="System Status & API Docs">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={ready ? "secondary" : "destructive"}>{ready ? "Ready" : "Not Configured"}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Current User:</span>
              <Badge variant="outline">{email || "anonymous"}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>JWT Token:</span>
              <Badge variant="outline">{token ? token.slice(0, 16) + "..." : "none"}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!token) return;
                  void navigator.clipboard.writeText(token);
                  showSuccess("Token copied");
                }}
              >
                Copy
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span>Expires:</span>
              <Badge variant="outline">{expiry ? expiry.toLocaleString() : "N/A"}</Badge>
            </div>
            <Button variant="outline" onClick={refresh}>Refresh</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoints (Docs)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CodeLine text={"POST /api/register — Create account with { username, email, password, phone } • returns ApiResponse<User>."} />
            <CodeLine text={"POST /api/login — Login with email or username • returns ApiResponse<User + token>."} />
            <CodeLine text={"POST /api/logout — Invalidate session • returns ApiResponse."} />
            <CodeLine text={"GET /api/me — Current user profile • returns ApiResponse<Profile>."} />
            <div className="border-t pt-2 space-y-3">
              <CodeLine text={"GET /admin/api/users — List users (admin) • returns ApiResponse<Profile[]>."} />
              <CodeLine text={"POST /admin/api/users/<id>/toggle-active — Toggle user active • returns ApiResponse<Profile>."} />
              <CodeLine text={"GET /admin/api/stats — Basic stats • returns ApiResponse<{{ total, active, banned, verified, coins }}>."} />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Note: In this client-only build, endpoints are backed by Supabase directly; configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable real JWT and database operations.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Live Dashboard route: /admin/dashboard • Users management: /admin/users • Auth pages: /auth/register, /auth/login
      </div>
    </AdminLayout>
  );
};

export default Status;