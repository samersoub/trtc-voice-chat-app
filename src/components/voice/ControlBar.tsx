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
        <div className="flex items-center justify-center gap-4 bg-black/30 backdrop-blur rounded-full p-2 border border-white/10 flex-wrap">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onOpenChat}
            title="Chat"
          >
            <Keyboard className="h-5 w-5" />
          </Button>

          <Button
            variant={micOn ? "default" : "destructive"}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={onToggleMic}
            title={micOn ? "Mic On" : "Mic Off"}
          >
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            className="bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 shadow-lg px-6"
            onClick={onSendGift}
            title="Send Gift"
          >
            <Gift className="h-5 w-5 mr-2" />
            Gift
          </Button>

          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onEmoji}
            title="Emoji"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;