"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RoomSettingsService, type RoomType } from "@/services/RoomSettingsService";
import { VoiceChatService } from "@/services/VoiceChatService";
import { showSuccess } from "@/utils/toast";

const Settings: React.FC = () => {
  const rooms = useMemo(() => VoiceChatService.listRooms(), []);
  const [roomId, setRoomId] = useState<string>(rooms[0]?.id ?? "");
  const [type, setType] = useState<RoomType>("social");
  const [maxSpeakers, setMaxSpeakers] = useState<number>(10);
  const [maxListeners, setMaxListeners] = useState<number>(100);
  const [moderatorsLimit, setModeratorsLimit] = useState<number>(2);

  // Load settings when room changes
  useEffect(() => {
    if (!roomId) return;
    const s = RoomSettingsService.getSettings(roomId);
    setType(s.type);
    setMaxSpeakers(s.maxSpeakers);
    setMaxListeners(s.maxListeners);
    setModeratorsLimit(s.moderatorsLimit);
  }, [roomId]);

  const save = () => {
    if (!roomId) return;
    RoomSettingsService.setRoomType(roomId, type);
    RoomSettingsService.configure(roomId, {
      maxSpeakers,
      maxListeners,
      moderatorsLimit,
    });
    showSuccess("Settings saved");
  };

  const disabled = !roomId;

  return (
    <AdminLayout title="Settings">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Target Room</div>
              <Select value={roomId} onValueChange={(v) => setRoomId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No rooms</div>
                  ) : (
                    rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Room Type</div>
              <Select value={type} onValueChange={(v) => setType(v as RoomType)} disabled={disabled}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social (mods: 2)</SelectItem>
                  <SelectItem value="party">Party (mods: 3)</SelectItem>
                  <SelectItem value="vip-exclusive">VIP Exclusive (mods: 5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Max Speakers</div>
              <Input
                type="number"
                value={maxSpeakers}
                onChange={(e) => setMaxSpeakers(Math.max(1, Math.min(64, Number(e.target.value) || 1)))}
                disabled={disabled}
              />
              <div className="text-[11px] text-muted-foreground">1–64</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Max Listeners</div>
              <Input
                type="number"
                value={maxListeners}
                onChange={(e) => setMaxListeners(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
                disabled={disabled}
              />
              <div className="text-[11px] text-muted-foreground">1–10000</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Moderators Limit</div>
              <Input
                type="number"
                value={moderatorsLimit}
                onChange={(e) => setModeratorsLimit(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                disabled={disabled}
              />
              <div className="text-[11px] text-muted-foreground">Room type applies a default; you can override here.</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={disabled} className="w-full sm:w-auto">
              Save Settings
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Changes affect local storage for the selected room. Moderator limits are enforced in Moderator Tools.
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Settings;