"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, DocumentData, Unsubscribe } from "firebase/firestore";
import { db } from "@/firebase";
import { fetchProfilesByUserIds } from "@/services/ProfileService";

export interface RoomUser {
  id: string;
  userName: string;
  roomId: string;
  joinedAt: Date;
}

export function useRoomUsers(roomId: string) {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [profiles, setProfiles] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!roomId) {
      setUsers([]);
      setProfiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(collection(db, "users"), where("roomId", "==", roomId));
    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const nextUsers = snapshot.docs.map((d) => {
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

        setUsers(nextUsers);

        // Fetch profiles manually
        const userIds = nextUsers.map((user) => user.id);
        try {
          const fetchedProfiles = await fetchProfilesByUserIds(userIds);
          setProfiles(fetchedProfiles);
        } catch (error) {
          console.error("Failed to fetch profiles:", error);
          setProfiles([]);
        }

        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to fetch users:", error);
        setUsers([]);
        setProfiles([]);
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

  return { users, profiles, isLoading };
}
