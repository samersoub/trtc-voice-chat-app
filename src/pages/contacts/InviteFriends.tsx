import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";
import ChatLayout from "@/components/chat/ChatLayout";

const InviteFriends = () => {
  const [email, setEmail] = useState("");
  return (
    <ChatLayout title="Invite Friends">
      <div className="p-6 max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader><CardTitle>Invite a friend</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Friend's email" value={email} onChange={e => setEmail(e.target.value)} />
            <Button className="w-full" onClick={() => { setEmail(""); showSuccess("Invitation sent"); }}>
              Send invite
            </Button>
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default InviteFriends;