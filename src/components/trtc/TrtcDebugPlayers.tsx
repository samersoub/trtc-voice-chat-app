"use client";

import React from "react";
import type { RemoteStreamItem } from "@/hooks/useTrtc";

type Props = {
  localStream: any | null;
  remoteStreams: RemoteStreamItem[];
};

const TrtcDebugPlayers: React.FC<Props> = ({ localStream, remoteStreams }) => {
  React.useEffect(() => {
    if (!localStream) return;
    try {
      localStream.play("trtc-local-player");
      console.log("TRTC: Local preview playing.");
    } catch (err) {
      console.error("TRTC: Local preview play failed:", err);
    }
  }, [localStream]);

  React.useEffect(() => {
    remoteStreams.forEach(({ id, stream }) => {
      const containerId = `trtc-remote-${id}`;
      // Defer until container exists
      setTimeout(() => {
        try {
          stream.play(containerId);
          console.log("TRTC: Remote playing:", containerId);
        } catch (err) {
          console.error("TRTC: Remote play failed:", containerId, err);
        }
      }, 0);
    });
  }, [remoteStreams]);

  return (
    <div className="absolute top-24 left-4 z-30 space-y-2">
      <div
        id="trtc-local-player"
        className="w-56 h-32 bg-black/40 rounded-md overflow-hidden flex items-center justify-center text-[10px] text-white/70"
      >
        Local Preview
      </div>
      {remoteStreams.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {remoteStreams.map(({ id }) => (
            <div
              key={String(id)}
              id={`trtc-remote-${id}`}
              className="w-56 h-32 bg-black/30 rounded-md overflow-hidden flex items-center justify-center text-[10px] text-white/70"
            >
              Remote {String(id)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrtcDebugPlayers;