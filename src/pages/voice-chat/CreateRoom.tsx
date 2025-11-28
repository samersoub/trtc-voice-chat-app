import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoiceChatService } from "@/services/VoiceChatService";
import { AuthService } from "@/services/AuthService";
import { showError, showSuccess } from "@/utils/toast";
import ChatLayout from "@/components/chat/ChatLayout";

const CreateRoom = () => {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  return (
    <ChatLayout title="Create Room">
      <div className="p-6 max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader><CardTitle>Create room</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Room name" value={name} onChange={e => setName(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
              Private room
            </label>
            <Button
              className="w-full"
              disabled={creating}
              onClick={async () => {
                if (creating) return;
                setCreating(true);
                try {
                  const user = AuthService.getCurrentUser();
                  if (!user) { showError("Please login first"); return; }
                  if (!name.trim()) { showError("Room name is required"); return; }
                  const room = VoiceChatService.createRoom(name.trim(), isPrivate, user.id);
                  showSuccess("Room created. Connecting...");
                  // Navigate with autoJoin flag for automatic voice engine login
                  nav(`/voice/rooms/${room.id}?autoJoin=1`);
                } catch (e: any) {
                  // Emergency handling: surface any unexpected errors
                  showError(e?.message || "Failed to create room. Please try again.");
                } finally {
                  setCreating(false);
                }
              }}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default CreateRoom;