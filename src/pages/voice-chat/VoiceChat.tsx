import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SeatingNine from "@/components/voice/SeatingNine";
import ChatOverlay from "@/components/voice/ChatOverlay";
import ControlBar from "@/components/voice/ControlBar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GiftTray, { GiftItem } from "@/components/gifts/GiftTray";
import GiftAnimation from "@/components/gifts/GiftAnimation";
import { showError, showSuccess } from "@/utils/toast";
import { WebRTCService } from "@/services/WebRTCService";
import { AudioManager } from "@/utils/AudioManager";
import { MicService } from "@/services/MicService";
import { RecordingService } from "@/services/RecordingService";
import { AuthService } from "@/services/AuthService";
import { VoiceChatService } from "@/services/VoiceChatService";
import MicManager from "@/components/voice/MicManager";
import MusicControlBar from "@/components/music/MusicControlBar";
import SongRequestPanel from "@/components/music/SongRequestPanel";
import { MusicPermissionsService } from "@/services/MusicPermissionsService";
import ModeratorTools from "@/components/moderation/ModeratorTools";
import ReportPanel from "@/components/moderation/ReportPanel";
import MusicQueue from "@/components/music/MusicQueue";
import EmojiPicker from "@/components/voice/EmojiPicker";
import ChatInputSheet from "@/components/voice/ChatInputSheet";
import { LocalChatService } from "@/services/LocalChatService";
import { Message } from "@/models/Message";
import TRTC from "trtc-js-sdk";
import { TRTC_SDK_APP_ID, TRTC_TEST_ROOM_ID } from "@/config/trtcConfig";
import { fetchUserSig } from "@/utils/trtcAuth";

const VoiceChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [wallpaper, setWallpaper] = useState<"royal" | "nebula" | "galaxy">("royal");
  const [giftOpen, setGiftOpen] = useState(false);
  const [activeGift, setActiveGift] = useState<GiftItem | null>(null);
  const [subscribeMode, setSubscribeMode] = useState<"auto" | "manual">("auto");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const rtcRef = React.useRef<WebRTCService | null>(null);
  const trtcClientRef = React.useRef<any>(null);
  const trtcLocalStreamRef = React.useRef<any>(null);
  const trtcJoinedRef = React.useRef<boolean>(false);
  // Track remote streams (IDs) so we can render containers and play video/audio
  const [trtcRemoteIds, setTrtcRemoteIds] = useState<(string | number)[]>([]);

  const user = AuthService.getCurrentUser();
  const roomSeats = React.useMemo(() => (id ? MicService.getSeats(id) : []), [id]);
  const [seatsState, setSeatsState] = useState(roomSeats);
  const room = id ? VoiceChatService.getRoom(id) : undefined;
  const roomTitle = room?.name || "Room";
  const hostId = room?.hostId;
  const hostName = hostId === user?.id ? user?.name || "You" : "Host";

  const isHost = !!(id && user && hostId === user.id);

  // Join on mount, leave on unmount, destroy when empty
  React.useEffect(() => {
    if (!id || !user?.id) return;
    try {
      VoiceChatService.joinRoom(id, user.id);
    } catch {}
    return () => {
      try {
        const updatedRoom = VoiceChatService.leaveRoom(id, user.id);
        if (updatedRoom.participants.length === 0) {
          VoiceChatService.deleteRoom(id);
        }
      } catch {}
    };
  }, [id, user?.id]);

  // Ghost mic detection
  React.useEffect(() => {
    if (!id || !user?.id) return;
    const onSeat = seatsState.some((s) => s.userId === user.id);
    if (micOn && !onSeat) {
      const rtc = (rtcRef.current ||= new WebRTCService());
      rtc.stopMic();
      if (audioRef.current) {
        AudioManager.detach(audioRef.current);
      }
      setMicOn(false);
      try {
        const updated = MicService.setSpeaking(id, user.id, false);
        setSeatsState([...updated]);
      } catch {}
      showError("Detected ghost mic. Mic muted until you take a seat.");
    }
  }, [micOn, seatsState, id, user?.id]);

  // Load and subscribe to room messages
  React.useEffect(() => {
    if (!id) return;
    const unsub = LocalChatService.on(id, (msgs) => setMessages(msgs));
    return () => {
      unsub?.();
    };
  }, [id]);

  // Map seats into 8 guest seats (1..8). Seat index 0..7 map to guest 1..8.
  const guestSeats = React.useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const s = seatsState[i];
        return {
          index: i + 1,
          userId: s?.userId,
          name: s?.userId ? s.name || "User" : undefined,
          muted: !!s?.muted,
          locked: !!s?.locked,
          speaking: !!s?.speaking,
        };
      }),
    [seatsState]
  );

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Join TRTC test room and publish local audio
  const handleJoinTRTC = async () => {
    if (trtcJoinedRef.current) {
      console.log("TRTC: Already joined; skipping duplicate join.");
      return;
    }

    // Use the authenticated user's ID if available; otherwise generate a unique anon ID to avoid collisions.
    const currentUserID =
      user?.id ||
      (() => {
        const key = "trtcAnonId";
        const existing = localStorage.getItem(key);
        if (existing) return existing;
        const generated = `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;
        localStorage.setItem(key, generated);
        return generated;
      })();

    console.log("TRTC: Starting join flow for user:", currentUserID, "room:", TRTC_TEST_ROOM_ID);
    try {
      const userSig = await fetchUserSig(currentUserID);
      console.log("TRTC: Fetched UserSig OK");

      const client = TRTC.createClient({
        mode: "rtc",
        sdkAppId: TRTC_SDK_APP_ID,
        userId: currentUserID,
        userSig,
      });
      trtcClientRef.current = client;

      // Detailed event logging for connection/media diagnostics
      client.on("error", (err: any) => {
        console.error("TRTC: Client error event:", err);
        showError(err?.message || "TRTC client error");
      });
      client.on("connection-state-changed", (payload: any) => {
        console.log("TRTC: Connection state changed:", payload);
      });
      client.on("network-quality", (event: any) => {
        console.log("TRTC: Network quality:", event);
      });
      client.on("peer-join", (event: any) => {
        console.log("TRTC: Peer joined:", event?.userId ?? event);
      });
      client.on("peer-leave", (event: any) => {
        console.log("TRTC: Peer left:", event?.userId ?? event);
      });
      client.on("mute-audio", (event: any) => {
        console.log("TRTC: Peer muted audio:", event?.userId ?? event);
      });
      client.on("unmute-audio", (event: any) => {
        console.log("TRTC: Peer unmuted audio:", event?.userId ?? event);
      });
      client.on("mute-video", (event: any) => {
        console.log("TRTC: Peer muted video:", event?.userId ?? event);
      });
      client.on("unmute-video", (event: any) => {
        console.log("TRTC: Peer unmuted video:", event?.userId ?? event);
      });

      // Subscribe and play remote audio/video when others publish
      client.on("stream-added", async (event: any) => {
        const remoteStream = event.stream;
        const id = remoteStream?.getId?.() ?? "unknown";
        console.log("TRTC: Remote stream added:", id, {
          hasAudio: remoteStream?.hasAudio?.(),
          hasVideo: remoteStream?.hasVideo?.(),
          stream: remoteStream,
        });

        try {
          await client.subscribe(remoteStream, { audio: true, video: true });
          console.log("TRTC: Subscribe requested for remote stream:", id);
        } catch (err) {
          console.error("TRTC: Failed to subscribe to remote stream:", id, err);
          showError("Failed to subscribe remote stream");
        }
      });

      client.on("stream-subscribed", (event: any) => {
        const remoteStream = event.stream;
        const id = remoteStream?.getId?.() ?? "unknown";
        console.log("TRTC: Remote stream subscribed:", id, {
          hasAudio: remoteStream?.hasAudio?.(),
          hasVideo: remoteStream?.hasVideo?.(),
        });

        // Ensure we render a container for playing video
        setTrtcRemoteIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

        // Play after container renders
        setTimeout(() => {
          try {
            remoteStream.play(`trtc-remote-${id}`);
            console.log("TRTC: Playing remote stream in container:", `trtc-remote-${id}`);
          } catch (err) {
            console.error("TRTC: Failed to play remote stream:", id, err);
            showError("Failed to play remote stream");
          }
        }, 0);
      });

      client.on("stream-removed", (event: any) => {
        const remoteStream = event.stream;
        const id = remoteStream?.getId?.() ?? "unknown";
        console.log("TRTC: Remote stream removed:", id);

        try {
          remoteStream.stop?.();
        } catch {}
        setTrtcRemoteIds((prev) => prev.filter((x) => x !== id));
      });

      await client.join({ roomId: TRTC_TEST_ROOM_ID });
      trtcJoinedRef.current = true;
      console.log("TRTC: Join Success, room:", TRTC_TEST_ROOM_ID);
      showSuccess(`Joined TRTC room ${TRTC_TEST_ROOM_ID}`);

      // Create and publish local audio+video for better visibility during testing
      const localStream = TRTC.createStream({ audio: true, video: true });
      trtcLocalStreamRef.current = localStream;

      console.log("TRTC: Initializing local stream (audio+video)...");
      await localStream.initialize();
      console.log("TRTC: Local stream initialized; capabilities:", {
        audio: localStream.hasAudio?.(),
        video: localStream.hasVideo?.(),
      });

      // Show local preview (muted by SDK; safe to render)
      try {
        localStream.play("trtc-local-player");
        console.log("TRTC: Local stream preview playing in container: trtc-local-player");
      } catch (err) {
        console.error("TRTC: Failed to play local preview", err);
      }

      await client.publish(localStream);
      console.log("TRTC: Publish Success");
      showSuccess("Published local audio/video");
    } catch (err: any) {
      console.error("TRTC: Join/Publish failed", err);
      showError(err?.message || "Failed to join/publish TRTC");
    }
  };

  const handleExitRoom = () => {
    if (id && user?.id) {
      try {
        const updatedRoom = VoiceChatService.leaveRoom(id, user.id);
        if (updatedRoom.participants.length === 0) {
          VoiceChatService.deleteRoom(id);
        }
      } catch {}
    }
    const rtc = (rtcRef.current ||= new WebRTCService());
    rtc.stopMic();
    if (audioRef.current) {
      AudioManager.detach(audioRef.current);
    }
    setMicOn(false);

    // TRTC cleanup: stop local & leave
    const c = trtcClientRef.current;
    if (c) {
      try {
        const ls = trtcLocalStreamRef.current;
        if (ls) {
          try {
            // Unpublish before closing local stream for clean leave
            c.unpublish?.(ls);
          } catch {}
          try {
            ls.stop?.();
            ls.close?.();
          } catch {}
          trtcLocalStreamRef.current = null;
        }
        // leave without awaiting (non-async handler)
        void c.leave?.();
      } catch {}
      trtcClientRef.current = null;
    }
    trtcJoinedRef.current = false;

    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading Room...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Hidden audio element for local mic preview */}
      <audio ref={audioRef} className="hidden" />

      {/* TRTC debug players: local preview + remote grid */}
      <div className="absolute top-24 left-4 z-30 space-y-2">
        <div
          id="trtc-local-player"
          className="w-56 h-32 bg-black/40 rounded-md overflow-hidden flex items-center justify-center text-[10px] text-white/70"
        >
          Local Preview
        </div>
        {trtcRemoteIds.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {trtcRemoteIds.map((id) => (
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

      {/* Background: keep mystical gradients for now */}
      <div className="absolute inset-0 -z-10">
        {wallpaper === "royal" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#2E0249] via-[#570A57] to-[#9333ea]" />
            <div className="absolute -top-20 -left-20 h-64 w-64 bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="absolute bottom-0 right-0 h-80 w-80 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
          </>
        )}
        {wallpaper === "nebula" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#3b0764] via-[#6d28d9] to-[#db2777]" />
            <div className="absolute -top-16 left-1/3 h-72 w-72 bg-pink-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="absolute -bottom-16 right-1/4 h-64 w-64 bg-purple-500/20 blur-2xl rounded-full animate-pulse" />
          </>
        )}
        {wallpaper === "galaxy" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#7c3aed]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.05),transparent_50%)]" />
          </>
        )}
      </div>

      {/* Header with dynamic title and ID */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <div className="text-white">
          <div className="text-sm font-semibold">{roomTitle}</div>
          <div className="text-xs text-white/80">ID: {id ?? "—"}</div>
        </div>
        <Button
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={handleExitRoom}
        >
          Exit Room
        </Button>
        <Button
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => {
            try {
              if (!id) return;
              const updated = MicService.putOnMic(id, user?.id || "you", user?.name || "You");
              setSeatsState([...updated]);
              showSuccess("You took a mic");
            } catch (e: any) {
              showSuccess(e.message || "Unable to take mic");
            }
          }}
        >
          Take Mic
        </Button>
        <Button
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => {
            try {
              if (!id) return;
              const updated = MicService.leaveMic(id, user?.id || "you");
              setSeatsState([...updated]);
              setMicOn(false);
              showSuccess("Left mic");
            } catch (e: any) {
              showSuccess(e.message || "Unable to leave mic");
            }
          }}
        >
          Leave Mic
        </Button>
      </div>

      {/* Wallpaper + recording controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => setWallpaper(wallpaper === "royal" ? "nebula" : wallpaper === "nebula" ? "galaxy" : "royal")}
        >
          Wallpaper
        </Button>
        <Button
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => {
            if (!id) return;
            const status = RecordingService.status(id);
            if (!status.active) {
              RecordingService.start(id, "companion");
              showSuccess("Recording started (companion)");
            } else {
              RecordingService.stop(id);
              showSuccess("Recording stopped");
            }
          }}
        >
          Toggle Recording
        </Button>
        <Button
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => {
            if (!id) return;
            RecordingService.submitForReview(id);
            showSuccess("Submitted for review");
          }}
        >
          Submit Review
        </Button>
        <Button
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => {
            setSubscribeMode((m) => (m === "auto" ? "manual" : "auto"));
            showSuccess(`Subscription mode: ${subscribeMode === "auto" ? "manual" : "auto"}`);
          }}
        >
          Subscribe: {subscribeMode === "auto" ? "Auto" : "Manual"}
        </Button>
        <Button
          variant="outline"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={handleJoinTRTC}
        >
          Join TRTC Test Room
        </Button>
      </div>

      {/* Center seating: Host + 8 guests */}
      <div className="flex items-center justify-center pt-20 pb-32 px-6">
        <div className="w-full max-w-4xl">
          <SeatingNine
            hostName={hostName}
            hostFlagCode={room?.name ? undefined : undefined}
            guests={guestSeats}
            onClickGuest={(displayIndex, seat) => {
              if (!id) return;
              // displayIndex 1..8 maps to MicService seat index 0..7
              const targetIndex = displayIndex - 1;
              if (!seat.userId) {
                // Take seat at target index
                try {
                  const updated = MicService.putOnMic(id, user?.id || "you", user?.name || "You", targetIndex);
                  setSeatsState([...updated]);
                  showSuccess(`Took seat ${displayIndex}`);
                } catch (e: any) {
                  showError(e.message || "Unable to take seat");
                }
              } else {
                // Toggle mute for occupied seat
                try {
                  const updated = MicService.mute(id, seat.userId, !seat.muted);
                  setSeatsState([...updated]);
                  showSuccess(`${!seat.muted ? "Muted" : "Unmuted"} ${seat.name || "Guest"}`);
                } catch (e: any) {
                  showError(e.message || "Unable to toggle mute");
                }
              }
            }}
          />
        </div>
      </div>

      {/* Bottom-left chat overlay */}
      <div className="absolute left-4 bottom-24">
        <ChatOverlay messages={messages} currentUserId={user?.id} />
      </div>

      {/* Bottom control bar */}
      <ControlBar
        micOn={micOn}
        onToggleMic={async () => {
          const rtc = (rtcRef.current ||= new WebRTCService());
          if (!micOn) {
            const onSeat = seatsState.some((s) => s.userId === (user?.id || "you"));
            if (!onSeat) {
              showSuccess("Take a mic first");
              return;
            }
            const stream = await rtc.getMicStream();
            if (audioRef.current) {
              AudioManager.attachStream(audioRef.current, stream);
            }
            setMicOn(true);
            if (id) {
              const updated = MicService.setSpeaking(id, user?.id || "you", true);
              setSeatsState([...updated]);
            }
            showSuccess("Microphone On");
          } else {
            rtc.stopMic();
            if (audioRef.current) {
              AudioManager.detach(audioRef.current);
            }
            setMicOn(false);
            if (id) {
              const updated = MicService.setSpeaking(id, user?.id || "you", false);
              setSeatsState([...updated]);
            }
            showSuccess("Microphone Off");
          }
        }}
        onOpenChat={() => setChatOpen(true)}
        onSendGift={() => setGiftOpen(true)}
        onEmoji={() => setEmojiOpen(true)}
      />

      {/* Host microphone management panel */}
      <div className="absolute right-4 bottom-24">
        {isHost && (
          <MicManager
            roomId={id || "demo"}
            seats={seatsState}
            onSeatsChange={(s) => setSeatsState([...s])}
          />
        )}
      </div>

      {/* Music controls and requests */}
      {id && user?.id && (
        <div className="absolute right-4 top-24 space-y-3">
          <MusicControlBar roomId={id} userId={user.id} />
          <SongRequestPanel roomId={id} userId={user.id} />
          <MusicQueue roomId={id} userId={user.id} />
          {(MusicPermissionsService.getRole(id, user.id) === "owner" ||
            MusicPermissionsService.getRole(id, user.id) === "moderator") && (
            <ModeratorTools roomId={id} userId={user.id} />
          )}
          <ReportPanel roomId={id} userId={user.id} />
        </div>
      )}

      {/* Gift dialog */}
      <Dialog open={giftOpen} onOpenChange={setGiftOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Send a Gift</DialogTitle></DialogHeader>
          <GiftTray
            senderUid="you"
            receiverUid={id || "host"}
            onSent={(g) => {
              setActiveGift(g);
              setGiftOpen(false);
              setTimeout(() => setActiveGift(null), 3000);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Gift overlay animation */}
      {activeGift && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
          <GiftAnimation type={activeGift.id} />
        </div>
      )}

      {/* Chat input sheet */}
      {id && user?.id && (
        <ChatInputSheet
          open={chatOpen}
          onOpenChange={setChatOpen}
          roomId={id}
          senderId={user.id}
        />
      )}

      <EmojiPicker
        open={emojiOpen}
        onOpenChange={setEmojiOpen}
        onPick={(emoji) => {
          showSuccess(`Sent ${emoji}`);
          if (id && user?.id) {
            LocalChatService.send(id, user.id, emoji, "text");
          }
          setEmojiOpen(false);
        }}
      />
    </div>
  );
};

export default VoiceChat;