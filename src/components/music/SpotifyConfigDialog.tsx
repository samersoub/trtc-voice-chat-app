"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: { clientId: string; clientSecret: string } | null;
  onSave: (cfg: { clientId: string; clientSecret: string }) => void;
};

const SpotifyConfigDialog: React.FC<Props> = ({ open, onOpenChange, initial, onSave }) => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    setClientId(initial?.clientId ?? "");
    setClientSecret(initial?.clientSecret ?? "");
  }, [initial, open]);

  const canSave = clientId.trim().length > 0 && clientSecret.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Spotify Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Client ID</div>
            <Input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter Client ID"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Client Secret</div>
            <Input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter Client Secret"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={() => onSave({ clientId, clientSecret })}
              disabled={!canSave}
            >
              Save
            </Button>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Credentials are stored locally on this device.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpotifyConfigDialog;