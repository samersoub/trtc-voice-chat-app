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

const ChatOverlay: React.FC<Props> = ({ messages, currentUserId, roomId }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);

  const settings = roomId ? RoomSettingsService.getSettings(roomId) : undefined;
  const formatted = settings?.chatFormatting === "formatted";

  return (
    <div className="pointer-events-none h-full w-full relative z-50">
      <div ref={ref} className="h-full w-full overflow-y-auto hide-scrollbar">
        <ScrollArea className="h-full">
          <div className="space-y-1.5 sm:space-y-2 px-0 py-2">
            {messages.map((m) => {
              const isSystem = m.type === "system";
              const isSelf = !isSystem && m.senderId === currentUserId;
              return (
                <div
                  key={m.id}
                  className={`flex ${isSystem ? "justify-center" : isSelf ? "justify-end" : "justify-start"}`}
                >
                  {isSystem ? (
                    <span className="italic text-white/80 text-xs sm:text-sm pointer-events-auto">System: {m.content}</span>
                  ) : (
                    <div className={["max-w-[85%] text-xs sm:text-sm text-white/90", "pointer-events-auto"].join(" ")}>
                      <>
                        <span className="font-semibold">{isSelf ? "You" : "User"}: </span>
                        <span className="text-white/90">{m.content}</span>
                      </>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatOverlay;