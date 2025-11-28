"use client";

import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoomSettingsService } from "@/services/RoomSettingsService";
import { Message } from "@/models/Message";

type Props = {
  messages: Message[];
  currentUserId?: string;
  roomId?: string;
};

const ChatOverlay: React.FC<Props> = ({ messages, currentUserId }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);

  const settings = roomId ? RoomSettingsService.getSettings(roomId) : undefined;
  const formatted = settings?.chatFormatting === "formatted";

  return (
    <div className="pointer-events-none">
      <div
        ref={ref}
        className={formatted ? "w-[92vw] sm:w-[420px] max-h-[36vh] overflow-y-auto bg-gradient-to-br from-black/30 to-violet-700/30 backdrop-blur-md rounded-xl p-3 border border-violet-200/20 shadow-lg" : "w-[92vw] sm:w-[380px] max-h-[30vh] overflow-y-auto bg-violet-700/30 backdrop-blur-md rounded-xl p-3 border border-violet-200/30 shadow-lg"}
      >
        <ScrollArea className="h-full">
          <div className={formatted ? "space-y-3" : "space-y-2"}>
            {messages.map((m) => (
              <div key={m.id} className={formatted ? "text-sm text-white" : "text-xs sm:text-sm text-white"}>
                <div className={formatted ? "flex items-center gap-2" : ""}>
                  <span className={formatted ? "inline-block text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded" : "font-semibold"}>
                    {m.type === "system" ? "System" : m.senderId === currentUserId ? "You" : "User"}
                  </span>
                  <span className={formatted ? "text-white/90 ml-2" : "text-white/90"}>{m.content}</span>
                  {formatted && (
                    <span className="ml-auto text-[10px] text-white/60">{new Date(m.createdAt).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatOverlay;