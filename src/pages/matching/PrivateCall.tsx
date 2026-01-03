"use client";

import React from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { showSuccess } from "@/utils/toast";

const PrivateCall: React.FC = () => {
  const { id } = useParams();
  const loc = useLocation();
  const nav = useNavigate();
  const callId = (loc.state as any)?.callId as string | undefined;
  const candidate = (loc.state as any)?.candidate as { id: string; name: string } | undefined;

  return (
    <ChatLayout title="Private Call">
      <div className="mx-auto max-w-xl p-4">
        <Card>
          <CardHeader><CardTitle>Call with {candidate?.name ?? id}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">Call ID: {callId ?? "N/A"}</div>
            <div className="text-sm">This is a simulated private call. To enable real audio/video, add a backend signaling service.</div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => nav("/matching")}>Back</Button>
            <Button
              onClick={() => {
                showSuccess("Call ended");
                nav(`/matching/rate/${id}`, { state: { candidate } });
              }}
            >
              End & Rate
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default PrivateCall;