"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocalChatService } from "@/services/LocalChatService";
import { showSuccess } from "@/utils/toast";

type ChatInputSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  senderId: string;
};

const ChatInputSheet: React.FC<ChatInputSheetProps> = ({ open, onOpenChange, roomId, senderId }) => {
  const [text, setText] = React.useState("");

  const send = () => {
    const content = text.trim();
    if (!content) return;
    LocalChatService.send(roomId, senderId, content, "text");
    setText("");
    onOpenChange(false);
    showSuccess("Message sent");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Send a message</SheetTitle>
        </SheetHeader>
        <div className="mt-3 flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message…"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />
          <Button onClick={send} disabled={!text.trim()}>
            Send
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatInputSheet;