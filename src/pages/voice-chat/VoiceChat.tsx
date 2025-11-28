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
import SongRequestPanel from "@/components/music/SongRequestPanel";
import { MusicPermissionsService } from "@/services/MusicPermissionsService";
import ModeratorTools from "@/components/moderation/ModeratorTools";
import ReportPanel from "@/components/moderation/ReportPanel";
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

const VoiceChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [wallpaper, setWallpaper] = useState<"royal" | "nebula" | "galaxy">("royal");
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
  const room = id ? VoiceChatService.getRoom(id) : undefined;
  const roomTitle = room?.name || "Room";
  const hostId = room?.hostId;
  const hostName = hostId === user?.id ? user?.name || "You" : "Host";
  const isHost = !!(id && user && hostId === user.id);
  const participantsCount = room?.participants?.length ?? 0;

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
      // Ensure TRTC cleanup on unmount too
      trtcLeave();
    };
  }, [id, user?.id, trtcLeave]);

  // Hook: mic control (handles mic preview & ghost mic)
  const { micOn: micOnHook, toggleMic, stopMic } = useMicControl(id, user?.id, audioRef, seatsState, (s) => setSeatsState([...s]));

  // Map seats into 8 guest seats via utility
  const guestSeats = React.useMemo(() => mapSeatsToGuests(seatsState), [seatsState]);

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

  const handleExitRoom = () => {
    if (id && user?.id) {
      try {
        const updatedRoom = VoiceChatService.leaveRoom(id, user.id);
        if (updatedRoom.participants.length === 0) {
          VoiceChatService.deleteRoom(id);
        }
      } catch {}
    }
    // Use hook cleanup for mic
    stopMic();
    trtcLeave();
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

      {/* TRTC debug players */}
      <TrtcDebugPlayers localStream={localStream} remoteStreams={remoteStreams} />

      {/* Background wallpapers */}
      <div className="absolute inset-0 -z-10">
        {wallpaper === "royal" && (
          <>
            {/* Background image from attachment */}
            <img
              src="/wallpapers/arabic-voice-room.jpeg"
              alt="Voice room wallpaper"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Soft purple overlay to enhance readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-700/50 via-fuchsia-600/40 to-purple-700/40 mix-blend-multiply" />
            {/* Gentle glow accents */}
            <div className="absolute -top-20 -left-20 h-64 w-64 bg-fuchsia-400/20 blur-3xl rounded-full animate-pulse" />
            <div className="absolute bottom-0 right-0 h-80 w-80 bg-indigo-400/20 blur-3xl rounded-full animate-pulse" />
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

      {/* Centered title pill */}
      <RoomTitlePill title={roomTitle} count={participantsCount} />

      {/* Header: title + actions */}
      <VoiceHeader
        roomTitle={roomTitle}
        roomId={id}
        onExit={handleExitRoom}
        onTakeMic={() => {
          try {
            if (!id) return;
            const updated = MicService.putOnMic(id, user?.id || "you", user?.name || "You");
            setSeatsState([...updated]);
            showSuccess("You took a mic");
          } catch (e: any) {
            showSuccess(e.message || "Unable to take mic");
          }
        }}
        onLeaveMic={() => {
          try {
            if (!id) return;
            const updated = MicService.leaveMic(id, user?.id || "you");
            setSeatsState([...updated]);
            stopMic();
            showSuccess("Left mic");
          } catch (e: any) {
            showSuccess(e.message || "Unable to leave mic");
          }
        }}
      />

      {/* Wallpaper + recording controls */}
      <WallpaperControls
        wallpaper={wallpaper}
        onToggleWallpaper={() =>
          setWallpaper((w) => (w === "royal" ? "nebula" : w === "nebula" ? "galaxy" : "royal"))
        }
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
      />

      {/* Center seating: Host + 8 guests inside a glass stage frame */}
      <div className="flex items-center justify-center pt-20 pb-32 px-6">
        <div className="w-full max-w-4xl">
          <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl p-6 sm:p-8">
            <SeatingNine
              hostName={hostName}
              hostFlagCode={room?.name ? undefined : undefined}
              guests={guestSeats}
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
      <div className="absolute left-4" style={{ bottom: "calc(env(safe-area-inset-bottom) + 120px)" }}>
        <ChatOverlay messages={messages} currentUserId={user?.id} />
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