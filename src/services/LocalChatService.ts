"use client";

import { Message } from "@/models/Message";

type Listener = (messages: Message[]) => void;

const listeners = new Map<string, Set<Listener>>();

function key(roomId: string) {
  return `chat.messages.${roomId}`;
}

function read(roomId: string): Message[] {
  try {
    const raw = localStorage.getItem(key(roomId));
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch {
    return [];
  }
}

function write(roomId: string, messages: Message[]) {
  localStorage.setItem(key(roomId), JSON.stringify(messages));
}

function notify(roomId: string) {
  const msgs = read(roomId);
  const set = listeners.get(roomId);
  if (!set) return;
  set.forEach((fn) => fn(msgs));
}

export const LocalChatService = {
  list(roomId: string): Message[] {
    return read(roomId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  send(roomId: string, senderId: string, content: string, type: Message["type"] = "text"): Message {
    const now = new Date().toISOString();
    const msg: Message = {
      id: `msg_${Math.random().toString(36).slice(2, 10)}`,
      roomId,
      senderId,
      content,
      createdAt: now,
      type,
    };
    const msgs = read(roomId);
    msgs.push(msg);
    write(roomId, msgs);
    notify(roomId);
    return msg;
  },

  clear(roomId: string) {
    write(roomId, []);
    notify(roomId);
  },

  on(roomId: string, listener: Listener): () => void {
    const set = listeners.get(roomId) || new Set<Listener>();
    set.add(listener);
    listeners.set(roomId, set);
    // Emit current list immediately
    listener(read(roomId));
    return () => {
      const s = listeners.get(roomId);
      if (!s) return;
      s.delete(listener);
      if (s.size === 0) listeners.delete(roomId);
    };
  },
};