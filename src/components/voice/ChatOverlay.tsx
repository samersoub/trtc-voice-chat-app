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
    <div className="pointer-events-none">
      <div
        ref={ref}
        className={formatted ? "w-[92vw] sm:w-[420px] max-h-[36vh] overflow-y-auto bg-gradient-to-br from-black/30 to-violet-700/30 backdrop-blur-md rounded-xl p-3 border border-violet-200/20 shadow-lg" : "w-[92vw] sm:w-[380px] max-h-[30vh] overflow-y-auto bg-violet-700/30 backdrop-blur-md rounded-xl p-3 border border-violet-200/30 shadow-lg"}
      >
        <ScrollArea className="h-full">
          <div className="space-y-2">
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
                        <div
                          className={[
                            "max-w-[85%] px-3 py-2 rounded-2xl text-xs sm:text-sm",
                            isSelf
                              ? "bg-fuchsia-600/70 text-white border border-white/10"
                              : "bg-white/15 text-white border border-white/20",
                            "pointer-events-auto",
                          ].join(" ")}
                        >
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