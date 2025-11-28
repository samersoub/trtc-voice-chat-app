"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/utils/toast";
import { LocalChatService } from "@/services/LocalChatService";
import { Send } from "lucide-react";

type VoiceChatInputBarProps = {
  roomId: string;
  senderId: string;
  inputRef?: React.RefObject<HTMLInputElement>;
};

const VoiceChatInputBar: React.FC<VoiceChatInputBarProps> = ({ roomId, senderId, inputRef }) => {
  const [text, setText] = React.useState("");

  const handleSend = () => {
    const msg = text.trim();
    if (!msg) return;
    try {
      LocalChatService.send(roomId, senderId, msg, "text");
      setText("");
      showSuccess("Message sent");
    } catch (e: any) {
      showError(e?.message || "Could not send message");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed left-0 right-0 z-30"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 76px)" }}
      aria-live="polite"
    >
      <div className="mx-auto max-w-4xl px-4">
        <div className="bg-violet-700/30 backdrop-blur-md border border-violet-200/30 rounded-full shadow-lg p-2 flex items-center gap-2">
          <Input
            ref={inputRef as any}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="اكتب رسالة..."
            aria-label="Voice room message input"
            className="flex-1 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            onClick={handleSend}
            className="rounded-full px-4 h-10 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white"
            aria-label="Send message"
            title="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatInputBar;