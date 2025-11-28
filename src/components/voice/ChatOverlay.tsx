"use client";

import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/models/Message";

type Props = {
  messages: Message[];
  currentUserId?: string;
};

const ChatOverlay: React.FC<Props> = ({ messages, currentUserId }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="pointer-events-none">
      <div
        ref={ref}
        className="w-[92vw] sm:w-[380px] max-h-[30vh] overflow-y-auto bg-violet-700/30 backdrop-blur-md rounded-xl p-3 border border-violet-200/30 shadow-lg"
      >
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m.id} className="text-xs sm:text-sm text-white">
                <span className="font-semibold">
                  {m.type === "system"
                    ? "System"
                    : m.senderId === currentUserId
                    ? "You"
                    : "User"}
                  :{" "}
                </span>
                <span className="text-white/90">{m.content}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatOverlay;