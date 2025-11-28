"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatLayout from "@/components/chat/ChatLayout";
import { AuthService } from "@/services/AuthService";
import { showSuccess } from "@/utils/toast";

const Home: React.FC = () => {
  const nav = useNavigate();
  const user = AuthService.getCurrentUser();

  return (
    <ChatLayout title="Welcome" hideHeader>
      <div className="min-h-[60svh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Welcome to Dandana Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user ? (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Please login to continue.
                </p>
                <Button asChild className="w-full">
                  <Link to="/auth/login">Login</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  You are logged in as <span className="font-medium">{user.name || user.email}</span>.
                </p>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link to="/">Go to Index</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      AuthService.logout();
                      showSuccess("Logged out");
                      nav("/auth/login");
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default Home;