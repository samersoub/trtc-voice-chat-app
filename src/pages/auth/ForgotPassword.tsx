"use client";

import React, { useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { supabase, isSupabaseReady } from "@/services/db/supabaseClient";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");

  return (
    <ChatLayout title="دندنة شات • Forgot Password">
      <div className="p-6 max-w-sm mx-auto">
        <Card className="w-full border-amber-200">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">Forgot Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
              onClick={async () => {
                if (isSupabaseReady && supabase) {
                  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/auth/login" });
                  if (error) {
                    showError(error.message);
                    return;
                  }
                }
                showSuccess("Reset link sent");
              }}
            >
              Send Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default ForgotPassword;