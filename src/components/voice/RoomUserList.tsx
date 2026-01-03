"use client";

import React from "react";
import type { RoomUser } from "@/hooks/useRoomUsers";

type Props = {
  users: RoomUser[];
};

const RoomUserList: React.FC<Props> = ({ users }) => {
  return (
    <div className="w-48 max-h-[60vh] overflow-auto rounded-lg bg-white/5 p-2 text-sm text-white/90 shadow-md">
      <div className="mb-2 font-semibold">Room Users ({users.length})</div>
      <ul className="space-y-1">
        {users.map((u) => (
          <li key={u.id} className="truncate">
            {u.userName || u.id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomUserList;
