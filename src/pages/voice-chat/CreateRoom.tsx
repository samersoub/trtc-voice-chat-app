import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoiceChatService } from "@/services/VoiceChatService";
import { AuthService } from "@/services/AuthService";
import { showError, showSuccess } from "@/utils/toast";
import ChatLayout from "@/components/chat/ChatLayout";
import ProfileService from "@/services/ProfileService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CreateRoom = () => {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [country, setCountry] = useState<string>("");

  // Load existing profile image
  useEffect(() => {
    const u = AuthService.getCurrentUser();
    if (!u) return;
    (async () => {
      const prof = await ProfileService.getByUserId(u.id);
      setExistingImageUrl(prof?.profile_image || null);
    })();
  }, []);

  return (
    <ChatLayout title="Create Room">
      <div className="p-6 max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader><CardTitle>Create room</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Room name" value={name} onChange={e => setName(e.target.value)} />
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Profile Picture</div>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              {existingImageUrl && (
                <div className="text-xs text-muted-foreground">Current image is set.</div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Country Name</div>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Saudi Arabia",
                    "United Arab Emirates",
                    "Egypt",
                    "Morocco",
                    "Jordan",
                    "Lebanon",
                    "Algeria",
                    "Tunisia",
                    "Iraq",
                    "Kuwait",
                    "Qatar",
                    "Bahrain",
                    "Oman",
                    "Yemen",
                    "Turkey",
                    "India",
                    "Pakistan",
                    "Indonesia",
                    "United States",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  if (!country.trim()) { showError("Please select a country"); return; }

                  // Require a profile picture: either existing or upload now
                  if (!existingImageUrl && !imageFile) {
                    showError("Please add a profile picture before creating a room");
                    return;
                  }
                  if (imageFile) {
                    await ProfileService.uploadProfileImage(user.id, imageFile);
                    showSuccess("Profile image updated");
                  }

                  const room = VoiceChatService.createRoom(name.trim(), isPrivate, user.id, country);
                  showSuccess("Room created. Connecting...");
                  // Navigate directly to join route with autoJoin flag
                  nav(`/voice/rooms/${room.id}/join?autoJoin=1`);
                } catch (e: any) {
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