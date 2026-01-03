"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MusicService } from "@/services/MusicService";
import { VoiceChatService } from "@/services/VoiceChatService";
import { MusicPermissionsService } from "@/services/MusicPermissionsService";
import { MicService } from "@/services/MicService";
import { showSuccess, showError } from "@/utils/toast";

type Props = { roomId: string; userId: string };

const ModeratorTools: React.FC<Props> = ({ roomId, userId }) => {
  const role = MusicPermissionsService.getRole(roomId, userId);
  const canControl = MusicPermissionsService.canControl(roomId, userId);

  const room = VoiceChatService.getRoom(roomId);
  const participants = room?.participants ?? [];
  const [modId, setModId] = useState("");

  const st = MusicService.getRoomMusic(roomId);

  const assignModerator = () => {
    if (role !== "owner") {
      showError("Only owner can assign moderators");
      return;
    }
    if (!modId) {
      showError("Enter user ID");
      return;
    }
    const current = MusicPermissionsService.listModerators(roomId);
    const limit = MusicPermissionsService.getModeratorLimit(roomId);
    if (current.length >= limit) {
      showError(`Moderator limit reached (${limit})`);
      return;
    }
    MusicPermissionsService.addModerator(roomId, modId);
    setModId("");
    showSuccess("Moderator assigned");
  };

  const removeModerator = () => {
    if (role !== "owner") {
      showError("Only owner can remove moderators");
      return;
    }
    if (!modId) {
      showError("Enter user ID");
      return;
    }
    MusicPermissionsService.removeModerator(roomId, modId);
    setModId("");
    showSuccess("Moderator removed");
  };

  return (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Moderator Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 items-end">
          <Input
            className="col-span-2"
            placeholder="User ID to (un)assign"
            value={modId}
            onChange={(e) => setModId(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={assignModerator}>Assign</Button>
            <Button variant="outline" onClick={removeModerator}>Remove</Button>
          </div>
        </div>

        <div className="rounded border p-2">
          <div className="text-xs text-muted-foreground">Music Controls</div>
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!canControl) {
                  showError("No permission");
                  return;
                }
                const next = st.isPlaying
                  ? MusicService.pause(roomId)
                  : st.currentTrack
                  ? MusicService.play(roomId, st.currentTrack)
                  : st;
                showSuccess(st.isPlaying ? "Paused" : "Playing");
              }}
            >
              {st.isPlaying ? "Pause" : "Play"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!canControl) {
                  showError("No permission");
                  return;
                }
                MusicService.skip(roomId);
                showSuccess("Skipped");
              }}
            >
              Skip
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!canControl) {
                  showError("No permission");
                  return;
                }
                MusicService.clearQueue(roomId);
                showSuccess("Queue cleared");
              }}
            >
              Clear Queue
            </Button>
          </div>
        </div>

        <div className="rounded border">
          <div className="text-xs text-muted-foreground p-2">Participants</div>
          <div className="grid gap-2 p-2">
            {participants.length === 0 ? (
              <div className="text-xs text-muted-foreground">No participants</div>
            ) : (
              participants.map((uid) => (
                <div key={uid} className="flex items-center justify-between">
                  <div className="text-sm">{uid}</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!canControl) {
                          showError("No permission");
                          return;
                        }
                        MicService.mute(roomId, uid, true);
                        showSuccess(`Muted ${uid}`);
                      }}
                    >
                      Mute
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!canControl) {
                          showError("No permission");
                          return;
                        }
                        MicService.kick(roomId, uid);
                        showSuccess(`Kicked ${uid}`);
                      }}
                    >
                      Kick
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">Role: {role}</div>
        <div className="text-xs text-muted-foreground">
          Moderators: {MusicPermissionsService.listModerators(roomId).length}/{MusicPermissionsService.getModeratorLimit(roomId)}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModeratorTools;