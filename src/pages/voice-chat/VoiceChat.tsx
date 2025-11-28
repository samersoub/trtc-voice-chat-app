import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
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
import { MusicPermissionsService } from "@/services/MusicPermissionsService";
import ModeratorTools from "@/components/moderation/ModeratorTools";
import MusicQueue from "@/components/music/MusicQueue";
import EmojiPicker from "@/components/voice/EmojiPicker";
import VoiceChatInputBar from "@/components/voice/VoiceChatInputBar";
import { LocalChatService } from "@/services/LocalChatService";
import { Message } from "@/models/Message";
import VoiceHeader from "@/components/voice/VoiceHeader";
import WallpaperControls from "@/components/voice/WallpaperControls";
import TrtcDebugPlayers from "@/components/trtc/TrtcDebugPlayers";
import { useTrtc } from "@/hooks/useTrtc";
import { useMicControl } from "@/hooks/useMicControl";
import { mapSeatsToGuests } from "@/utils/voiceSeats";
import RoomTitlePill from "@/components/voice/RoomTitlePill";
import { ChatRoom } from "@/models/ChatRoom";
import MobileActionsSheet from "@/components/voice/MobileActionsSheet";
import { RoomSettingsService } from "@/services/RoomSettingsService";
import { db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

const VoiceChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [wallpaper, setWallpaper] = useState<"royal" | "nebula" | "galaxy">("royal");
  // ADD: show/hide reports state driven by room settings
  const [showReports, setShowReports] = useState<boolean>(true);
  const [giftOpen, setGiftOpen] = useState(false);
  const [activeGift, setActiveGift] = useState<GiftItem | null>(null);
  const [subscribeMode, setSubscribeMode] = useState<"auto" | "manual">("auto");
  const [emojiOpen, setEmojiOpen] = useState(false);

  // ADDED: detect autoJoin query param
  const autoJoin = searchParams.get("autoJoin") === "1";

  // ADDED: Messages state for ChatOverlay
  const [messages, setMessages] = useState<Message[]>([]);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // TRTC hook for join/publish/subscribe/leave
  const { localStream, remoteStreams, join: trtcJoin, leave: trtcLeave } = useTrtc();

  const user = AuthService.getCurrentUser();
  const roomSeats = React.useMemo(() => (id ? MicService.getSeats(id) : []), [id]);
  const [seatsState, setSeatsState] = useState(roomSeats);
  const [roomState, setRoomState] = useState<ChatRoom | undefined>(id ? VoiceChatService.getRoom(id) : undefined);
  const roomTitle = roomState?.name || "Room";
  const hostId = roomState?.hostId;
  const hostName = hostId === user?.id ? user?.name || "You" : "Host";
  const isHost = !!(id && user && hostId === user.id);
  const isOwner = isHost;
  const participantsCount = roomState?.participants?.length ?? 0;

  // Sync wallpaper and reports from room settings and react to storage changes
  React.useEffect(() => {
    if (!id) return;
    const s = RoomSettingsService.getSettings(id);
    setWallpaper(s.wallpaper);
    setShowReports(s.showReports);
    const key = `room:settings:${id}`;
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        const ns = RoomSettingsService.getSettings(id);
        setWallpaper(ns.wallpaper);
        setShowReports(ns.showReports);
      }
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(() => {
      const ns = RoomSettingsService.getSettings(id);
      setWallpaper(ns.wallpaper);
      setShowReports(ns.showReports);
    }, 1500);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [id]);

  // Join on mount, leave on unmount, destroy when empty
  React.useEffect(() => {
    if (!id || !user?.id) return;

    // Perform Firestore save of user join data before local join
    (async () => {
      try {
        const userName = user?.name || user?.id;
        // Save into 'users' collection using userName as document ID
        await setDoc(doc(db, "users", String(userName)), {
          userName,
          roomId: id,
          joinedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Failed to save join to Firestore:", e);
      }

      try {
        VoiceChatService.joinRoom(id, user.id);
      } catch {}
    })();

    return () => {
      try {
        const updatedRoom = VoiceChatService.leaveRoom(id, user.id);
        if (updatedRoom.participants.length === 0) {
          VoiceChatService.deleteRoom(id);
        }
      } catch {}
      // Ensure TRTC cleanup on unmount too
      trtcLeave();
    };
  }, [id, user?.id, trtcLeave]);

  // Hook: mic control (handles mic preview & ghost mic)
  const { micOn: micOnHook, toggleMic, stopMic } = useMicControl(id, user?.id, audioRef, seatsState, (s) => setSeatsState([...s]));

  // Map seats into 8 guest seats via utility
  const guestSeats = React.useMemo(() => mapSeatsToGuests(seatsState), [seatsState]);

  // ADDED: reactive updates for roomState (participants, etc.)
  React.useEffect(() => {
    if (!id) return;
    const update = () => setRoomState(VoiceChatService.getRoom(id));
    update();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "voice:rooms") update();
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(update, 1000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [id]);

  // ADDED: announce join and leave as system messages to the chat overlay
  const joinAnnouncedRef = React.useRef(false);
  React.useEffect(() => {
    if (!id || !user?.id || joinAnnouncedRef.current) return;
    const settings = RoomSettingsService.getSettings(id);
    if (settings.entryNotifications !== false) {
      LocalChatService.send(id, user.id, `${user?.name || "User"} entered the room`, "system");
    }
    joinAnnouncedRef.current = true;
  }, [id, user?.id]);

  React.useEffect(() => {
    return () => {
      if (id && user?.id) {
        const settings = RoomSettingsService.getSettings(id);
        if (settings.entryNotifications !== false) {
          LocalChatService.send(id, user.id, `${user?.name || "User"} left the room`, "system");
        }
      }
    };
  }, [id, user?.id]);

  React.useEffect(() => {
    // ADDED: Subscribe to local chat messages for this room
    if (!id) return;
    const unsubscribe = LocalChatService.on(id, (msgs) => setMessages(msgs));
    return () => unsubscribe();
  }, [id]);

  // ADDED: automatically join TRTC if autoJoin flag is present
  React.useEffect(() => {
    if (!id || !user?.id || !autoJoin) return;
    const connect = async () => {
      try {
        await trtcJoin(user.id);
        showSuccess("Connected to voice room");
      } catch (e: any) {
        showError(e?.message || "Failed to connect to voice engine");
      }
    };
    void connect();
  }, [id, user?.id, autoJoin, trtcJoin]);

  React.useEffect(() => {
    const t = autoJoin ? null : setTimeout(() => setLoading(false), 3000);
    // If autoJoin, skip the artificial delay for smoother entry
    if (autoJoin) setLoading(false);
    return () => { if (t) clearTimeout(t); };
  }, [autoJoin]);

  // If the room has a preset background configured, apply it to local wallpaper state
  React.useEffect(() => {
    if (!roomState || !roomState.background) return;
    const preset = roomState.background;
    if (preset === "royal" || preset === "nebula" || preset === "galaxy") {
      setWallpaper(preset as any);
    }
  }, [roomState]);

  const handleExitRoom = () => {
    if (id && user?.id) {
      try {
        const updatedRoom = VoiceChatService.leaveRoom(id, user.id);
        if (updatedRoom.participants.length === 0) {
          VoiceChatService.deleteRoom(id);
        }
      } catch {}
    }
    stopMic();
    trtcLeave();
    navigate("/");
  };

  // Shared mic handlers for header and mobile actions
  const handleTakeMic = () => {
    try {
      if (!id) return;
      const updated = MicService.putOnMic(id, user?.id || "you", user?.name || "You");
      setSeatsState([...updated]);
      showSuccess("You took a mic");
    } catch (e: any) {
      showError(e.message || "Unable to take mic");
    }
  };

  const handleLeaveMic = () => {
    try {
      if (!id) return;
      const updated = MicService.leaveMic(id, user?.id || "you");
      setSeatsState([...updated]);
      stopMic();
      showSuccess("Left mic");
    } catch (e: any) {
      showError(e.message || "Unable to leave mic");
    }
  };

  // Toast when participants join/leave (fix visibility of visitors entering)
  const prevParticipantsRef = React.useRef<string[] | null>(null);
  React.useEffect(() => {
    if (!roomState) return;
    const curr = roomState.participants ?? [];
    const prev = prevParticipantsRef.current;
    if (prev === null) {
      prevParticipantsRef.current = curr;
      return; // skip to avoid spamming on first render
    }
    const joined = curr.filter((uid) => !prev.includes(uid));
    const left = prev.filter((uid) => !curr.includes(uid));
    const settings = id ? RoomSettingsService.getSettings(id) : undefined;
    if (!settings || settings.entryNotifications !== false) {
      joined.forEach((uid) => showSuccess(`${uid} joined the room`));
      left.forEach((uid) => showSuccess(`${uid} left the room`));
    }
    prevParticipantsRef.current = curr;
  }, [roomState]);

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

      {/* TRTC debug players */}
      <TrtcDebugPlayers localStream={localStream} remoteStreams={remoteStreams} />

      {/* Background: solid dark color */}
      <div className="absolute inset-0 -z-10 bg-[#1a1a1a]"></div>

      {/* Centered title pill */}
      <RoomTitlePill title={roomTitle} count={participantsCount} />

      {/* Header: title + actions */}
      <VoiceHeader
        roomTitle={roomTitle}
        roomId={id}
        onExit={handleExitRoom}
        onTakeMic={handleTakeMic}
        onLeaveMic={handleLeaveMic}
      />

      {/* Wallpaper + recording controls */}
      <WallpaperControls
        wallpaper={wallpaper}
        onToggleWallpaper={() => {
          // Owner-only: cycle wallpaper and persist
          if (!id || !isOwner) return;
          const next = wallpaper === "royal" ? "nebula" : wallpaper === "nebula" ? "galaxy" : "royal";
          RoomSettingsService.setWallpaper(id, next);
          setWallpaper(next);
          showSuccess(`Wallpaper set to ${next}`);
        }}
        onToggleRecording={() => {
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
        onSubmitReview={() => {
          if (!id) return;
          RecordingService.submitForReview(id);
          showSuccess("Submitted for review");
        }}
        subscribeMode={subscribeMode}
        onToggleSubscribeMode={() => {
          setSubscribeMode((m) => (m === "auto" ? "manual" : "auto"));
          showSuccess(`Subscription mode: ${subscribeMode === "auto" ? "manual" : "auto"}`);
        }}
        onJoinTRTC={() => trtcJoin(user?.id)}
        isOwner={isOwner}
        showReports={showReports}
        onToggleReports={() => {
          if (!id || !isOwner) return;
          RoomSettingsService.setShowReports(id, !showReports);
          setShowReports((v) => !v);
          showSuccess(`${!showReports ? "Reports visible" : "Reports hidden"}`);
        }}
      />

      {/* Mobile actions (sm:hidden) */}
      <MobileActionsSheet
        micOn={micOnHook}
        onTakeMic={handleTakeMic}
        onLeaveMic={handleLeaveMic}
        wallpaper={wallpaper}
        subscribeMode={subscribeMode}
        onToggleWallpaper={() => {
          if (!id || !isOwner) return;
          const next = wallpaper === "royal" ? "nebula" : wallpaper === "nebula" ? "galaxy" : "royal";
          RoomSettingsService.setWallpaper(id, next);
          setWallpaper(next);
          showSuccess(`Wallpaper set to ${next}`);
        }}
        onToggleRecording={() => {
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
        onSubmitReview={() => {
          if (!id) return;
          RecordingService.submitForReview(id);
          showSuccess("Submitted for review");
        }}
        onToggleSubscribeMode={() => {
          setSubscribeMode((m) => (m === "auto" ? "manual" : "auto"));
          showSuccess(`Subscription mode: ${subscribeMode === "auto" ? "manual" : "auto"}`);
        }}
        onJoinTRTC={() => trtcJoin(user?.id)}
        isOwner={isOwner}
        showReports={showReports}
        onToggleReports={() => {
          if (!id || !isOwner) return;
          RoomSettingsService.setShowReports(id, !showReports);
          setShowReports((v) => !v);
          showSuccess(`${!showReports ? "Reports visible" : "Reports hidden"}`);
        }}
      />

      {/* Center seating: Host + 8 guests inside a glass stage frame */}
      <div className="flex items-center justify-center pt-16 sm:pt-20 pb-28 sm:pb-32 px-3 sm:px-6">
        <div className="w-full max-w-4xl">
          <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl p-4 sm:p-8">
            <SeatingNine
              hostName={hostName}
              hostFlagCode={roomState?.name ? undefined : undefined}
              guests={guestSeats}
              showFrame={roomState ? RoomSettingsService.getSettings(id || "").showSeatFrames ?? true : true}
              onClickGuest={(displayIndex, seat) => {
                if (!id) return;
                const targetIndex = displayIndex - 1;
                if (!seat.userId) {
                  try {
                    const updated = MicService.putOnMic(id, user?.id || "you", user?.name || "You", targetIndex);
                    setSeatsState([...updated]);
                    showSuccess(`Took seat ${displayIndex}`);
                  } catch (e: any) {
                    showError(e.message || "Unable to take seat");
                  }
                } else {
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
      </div>

      {/* Bottom-left chat overlay */}
      <div className="absolute left-4 vc-chat-overlay-bottom">
        <ChatOverlay messages={messages} currentUserId={user?.id} roomId={id} />
      </div>

      {/* Bottom control bar */}
      <ControlBar
        micOn={micOnHook}
        onToggleMic={async () => {
          await toggleMic();
        }}
        onOpenChat={() => {
          inputRef.current?.focus();
        }}
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
        <div className="absolute right-4 top-24 space-y-3 hidden sm:block">
          {(MusicPermissionsService.getRole(id, user.id) === "owner" ||
            MusicPermissionsService.getRole(id, user.id) === "moderator") && (
            <ModeratorTools roomId={id} userId={user.id} />
          )}
          {/* Reports UI removed per design; no reports component rendered */}
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

      {/* Fixed message input bar above ControlBar */}
      {id && user?.id && (
        <VoiceChatInputBar roomId={id} senderId={user.id} inputRef={inputRef} />
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