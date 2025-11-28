"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Keyboard, Mic, MicOff, Gift, Smile } from "lucide-react";

type ControlBarProps = {
  micOn: boolean;
  onToggleMic: () => void;
  onOpenChat: () => void;
  onSendGift: () => void;
  onEmoji: () => void;
};

const ControlBar: React.FC<ControlBarProps> = ({ micOn, onToggleMic, onOpenChat, onSendGift, onEmoji }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-4xl px-4 pb-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}>
        <div className="flex items-center justify-center gap-4 bg-transparent rounded-full p-2 flex-wrap">
          <Button
            variant="outline"
            className="h-12 w-12 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
            onClick={onOpenChat}
            title="Chat"
          >
            <Keyboard className="h-6 w-6" />
          </Button>

          <Button
            variant={micOn ? "default" : "destructive"}
            className={`h-12 w-12 rounded-full p-0 text-white border-white/30 ${micOn ? "bg-purple-600 hover:bg-purple-700" : "bg-rose-600 hover:bg-rose-700"}`}
            onClick={onToggleMic}
            title={micOn ? "Mic On" : "Mic Off"}
          >
            {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          <Button
            className="h-12 w-12 rounded-full p-0 bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 shadow-lg"
            onClick={onSendGift}
            title="Send Gift"
          >
            <Gift className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            className="h-12 w-12 rounded-full bg-white/15 text-white border-white/30 hover:bg-white/25 p-0"
            onClick={onEmoji}
            title="Emoji"
          >
            <Smile className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;