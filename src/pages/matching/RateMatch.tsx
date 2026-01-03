"use client";

import React, { useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SmartMatchingService } from "@/services/SmartMatchingService";
import { showSuccess } from "@/utils/toast";

const RateMatch: React.FC = () => {
  const { id } = useParams();
  const loc = useLocation();
  const nav = useNavigate();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const candidate = (loc.state as any)?.candidate as { id: string; name: string } | undefined;

  return (
    <ChatLayout title="Rate Match">
      <div className="mx-auto max-w-xl p-4">
        <Card>
          <CardHeader><CardTitle>Rate {candidate?.name ?? id}</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <Label>Rating (1-5)</Label>
              <Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(parseInt(e.target.value || "1"))} />
            </div>
            <div className="grid gap-2">
              <Label>Feedback</Label>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share your experience..." />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => nav("/matching")}>Skip</Button>
            <Button
              onClick={() => {
                SmartMatchingService.rate(id || candidate?.id || "unknown", rating, feedback);
                showSuccess("Thanks for your feedback");
                nav("/messages");
              }}
            >
              Submit
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default RateMatch;