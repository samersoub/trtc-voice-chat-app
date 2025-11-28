"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, DocumentData, Unsubscribe } from "firebase/firestore";
import { db } from "@/firebase";

export interface RoomUser {
  id: string;
  userName: string;
  roomId: string;
  joinedAt: Date;
}

export function useRoomUsers(roomId: string) {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!roomId) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(collection(db, "users"), where("roomId", "==", roomId));
    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((d) => {
          const data = d.data() as DocumentData;
          const joinedRaw = (data.joinedAt as string) ?? "";
          const joinedAt = joinedRaw ? new Date(joinedRaw) : new Date(0);
          const user: RoomUser = {
            id: d.id,
            userName: (data.userName as string) ?? "",
            roomId: (data.roomId as string) ?? "",
            joinedAt,
          };
          return user;
        });
        setUsers(next);
        setIsLoading(false);
      },
      (err) => {
        console.error("useRoomUsers:onSnapshot error:", err);
        setUsers([]);
        setIsLoading(false);
      }
    );

    // cleanup: unsubscribe from snapshot listener when roomId changes or component unmounts
    return () => {
      try {
        unsubscribe();
      } catch (e) {
        console.warn("useRoomUsers: unsubscribe failed", e);
      }
    };
  }, [roomId]);

  return { users, isLoading };
}
