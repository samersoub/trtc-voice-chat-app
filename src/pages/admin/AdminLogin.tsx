"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";

const AdminLogin: React.FC = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm border-amber-200">
        <CardHeader>
          <CardTitle className="text-center bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Admin Login • دندنة شات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPwd(e.target.value)} />
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
            onClick={() => {
              // Demo credentials: admin / admin123
              if (email.trim().toLowerCase() === "admin" && password === "admin123") {
                localStorage.setItem("admin:token", "demo-token");
                showSuccess("Welcome, Admin");
                nav("/admin");
              } else {
                showError("Invalid admin credentials");
              }
            }}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;