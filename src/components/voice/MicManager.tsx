"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MicOff, Lock, MoveHorizontal, UserPlus, XCircle } from "lucide-react";
import { MicService, SeatInfo } from "@/services/MicService";
import { showError, showSuccess } from "@/utils/toast";

type Props = {
  roomId: string;
  seats: SeatInfo[];
  onSeatsChange: (seats: SeatInfo[]) => void;
};

const MicManager: React.FC<Props> = ({ roomId, seats, onSeatsChange }) => {
  const [targetSeat, setTargetSeat] = useState<string>("0");
  const [inviteName, setInviteName] = useState("");
  const seatIndices = useMemo(() => Array.from({ length: 8 }, (_, i) => i.toString()), []);

  const handleLockToggle = (i: number) => {
    try {
      const updated = MicService.lockSeat(roomId, i, !seats[i].locked);
      onSeatsChange([...updated]);
      showSuccess(updated[i].locked ? `Seat ${i + 1} locked` : `Seat ${i + 1} unlocked`);
    } catch (e: any) {
      showError(e.message || "Action failed");
    }
  };

  const handleMuteToggle = (i: number) => {
    const s = seats[i];
    if (!s.userId) return;
    try {
      const updated = MicService.mute(roomId, s.userId, !s.muted);
      onSeatsChange([...updated]);
      showSuccess(updated[i].muted ? `Muted ${s.name}` : `Unmuted ${s.name}`);
    } catch (e: any) {
      showError(e.message || "Action failed");
    }
  };

  const handleKick = (i: number) => {
    const s = seats[i];
    if (!s.userId) return;
    try {
      const updated = MicService.kick(roomId, s.userId);
      onSeatsChange([...updated]);
      showSuccess(`Kicked ${s.name} from seat ${i + 1}`);
    } catch (e: any) {
      showError(e.message || "Action failed");
    }
  };

  const handleMove = (i: number) => {
    const s = seats[i];
    const to = parseInt(targetSeat, 10);
    if (!s.userId) return;
    try {
      const updated = MicService.move(roomId, s.userId, to);
      onSeatsChange([...updated]);
      showSuccess(`Moved ${s.name} to seat ${to + 1}`);
    } catch (e: any) {
      showError(e.message || "Move failed");
    }
  };

  const handleHoldOnMic = () => {
    const to = parseInt(targetSeat, 10);
    try {
      const uid = `guest_${Math.random().toString(36).slice(2, 9)}`;
      const updated = MicService.putOnMic(roomId, uid, inviteName.trim() || "Guest", to);
      onSeatsChange([...updated]);
      setInviteName("");
      showSuccess(`Put ${inviteName || "Guest"} on seat ${to + 1}`);
    } catch (e: any) {
      showError(e.message || "Failed to put on mic");
    }
  };

  return (
    <Card className="bg-black/30 backdrop-blur border-white/10 text-white w-[92vw] sm:w-[420px]">
      <CardHeader>
        <CardTitle className="text-base">Microphone Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {seats.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-sm bg-white/5 rounded-md px-2 py-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Seat {i + 1}</span>
                {s.locked && <Lock className="h-4 w-4 text-gray-300" />}
                {s.userId ? <span className="text-white/80">{s.name}</span> : <span className="text-white/50">Empty</span>}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="border-white/20 text-white" onClick={() => handleLockToggle(i)}>
                  {s.locked ? "Unlock" : "Lock"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white"
                  disabled={!s.userId}
                  onClick={() => handleMuteToggle(i)}
                >
                  <MicOff className="h-4 w-4 mr-1" />
                  {s.muted ? "Unmute" : "Mute"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white"
                  disabled={!s.userId}
                  onClick={() => handleKick(i)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Kick
                </Button>
                <Select value={targetSeat} onValueChange={setTargetSeat}>
                  <SelectTrigger className="w-20 h-8 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seatIndices.map((v) => (
                      <SelectItem key={v} value={v}>#{parseInt(v) + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white"
                  disabled={!s.userId}
                  onClick={() => handleMove(i)}
                >
                  <MoveHorizontal className="h-4 w-4 mr-1" />
                  Move
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 items-end">
          <div className="col-span-2">
            <Label className="text-xs">Invite name</Label>
            <Input
              placeholder="Guest name"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleHoldOnMic}>
            <UserPlus className="h-4 w-4 mr-1" />
            Put on Mic
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MicManager;