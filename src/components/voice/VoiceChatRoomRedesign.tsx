import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Volume2, VolumeX, Gift, MessageCircle, Users,
  Settings, MoreVertical, Crown, Radio, Send, Smile, X, LogOut,
  Trophy, Flame, Music, Star, Share2, Wallet, ShoppingBag,
  Bell, Heart, Gem, ArrowDownCircle, UserCircle, ShieldAlert,
  Check, ChevronDown, Backpack, Image as ImageIcon
} from 'lucide-react';
import { BackpackModal } from "@/components/profile/BackpackModal";
import { AuthService } from '@/services/AuthService';
import { RoomParticipantService, RoomParticipant } from '@/services/RoomParticipantService';
import { useVoiceRoom } from '@/contexts/VoiceRoomContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

// ===================================================================
// Design Constants & Types
// ===================================================================

const THEME = {
  bg: "bg-[#F3F6FF]", // Soft Cloud White
  wrapper: "bg-gradient-to-b from-[#E6EEFF] to-[#F5F7FA]",
  accent: "from-[#FFD700] via-[#FDB931] to-[#FDB931]",
  glass: "bg-white/40 backdrop-blur-md border border-white/40 shadow-sm",
  glassDark: "bg-black/5 backdrop-blur-md border border-black/5",
  text: {
    primary: "text-slate-800",
    secondary: "text-slate-500",
    gold: "text-[#D4AF37]"
  }
};

interface SeatPosition {
  id: number;
  isHost?: boolean;
  user?: {
    id: string;
    name: string;
    avatar?: string;
    isSpeaking?: boolean;
    level?: number;
    vip?: number;
  };
  isEmpty: boolean;
  isLocked?: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  avatar?: string;
  isGift?: boolean;
  level?: number;
}

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  price: number;
}

const GIFTS: GiftItem[] = [
  { id: '1', name: 'Rose', icon: '🌹', price: 10 },
  { id: '2', name: 'Heart', icon: '💖', price: 99 },
  { id: '4', name: 'Ring', icon: '💍', price: 500 },
  { id: '5', name: 'Crown', icon: '👑', price: 999 },
  { id: '3', name: 'Sports Car', icon: '🏎️', price: 5000 },
  { id: '6', name: 'Castle', icon: '🏰', price: 10000 },
  { id: '7', name: 'Rocket', icon: '🚀', price: 30000 },
  { id: '8', name: 'Dragon', icon: '🐉', price: 50000 },
];

const VoiceChatRoomRedesign: React.FC = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const { joinRoom, toggleMic, isMicOn } = useVoiceRoom();

  // --- Real-Time State ---
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);

  // Initialize seats (Seat 0 is Host, others empty)
  const [seats, setSeats] = useState<SeatPosition[]>([
    { id: 0, isHost: true, isEmpty: true, user: undefined }, // Host seat initially empty until loaded
    ...Array(8).fill(null).map((_, i) => ({ id: i + 1, isEmpty: true }))
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');

  // Interaction State
  const [selectedSeat, setSelectedSeat] = useState<SeatPosition | null>(null);
  const [showSeatMenu, setShowSeatMenu] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBackpack, setShowBackpack] = useState(false);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [playingGift, setPlayingGift] = useState<{ item: GiftItem, from: string, to: string } | null>(null);

  // Gifting Recipients state
  const [giftRecipients, setGiftRecipients] = useState<string[]>(['all']); // 'all' or list of userIds
  const [isRecipientSelectorOpen, setIsRecipientSelectorOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Real-Time Sync Logic ---
  const syncSeats = (currentParticipants: RoomParticipant[]) => {
    // defaults
    const newSeats: SeatPosition[] = [
      { id: 0, isHost: true, isEmpty: true },
      ...Array(8).fill(null).map((_, i) => ({ id: i + 1, isEmpty: true }))
    ];

    currentParticipants.forEach(p => {
      // If host, put in seat 0
      if (p.role === 'owner' || p.role === 'admin') { // Assuming admin/owner goes to seat 0 or dedicated logic? 
        // Actually, typically Seat 0 is strictly OWNER. 
        // Let's rely on 'role' or specific seat mapping.
        // If the service doesn't assign seat numbers strictly, we might need logic.
        // Assuming mic_seat 0 is host, 1-8 are guests.
      }

      const seatIndex = p.mic_seat;
      if (seatIndex !== undefined && seatIndex !== null && newSeats[seatIndex]) {
        newSeats[seatIndex] = {
          id: seatIndex,
          isHost: seatIndex === 0,
          isEmpty: false,
          user: {
            id: p.users?.id || p.user_id,
            name: p.users?.full_name || p.users?.username || 'User',
            avatar: p.users?.avatar_url || p.users?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`,
            isSpeaking: false, // We need to hook this to audio level later
            level: 1, // Need to fetch level? p.users doesn't have it in current select?
            vip: 0
          }
        };
      }
    });

    // Special case: Ensure we can always see the "Host" seat even if empty? 
    // The previous design showed "Royal Host" by default. 
    // Now it will show Empty if the host isn't in the room. This is correct for "Real System".

    setSeats(newSeats);
  };

  // --- Effects ---

  // 1. Join Room on Mount & Subscribe
  useEffect(() => {
    if (!roomId || !currentUser) return;

    const initRoom = async () => {
      // 1. Join Audio/Signaling
      await joinRoom(roomId, currentUser.id);

      // 2. Fetch Initial Participants (Database)
      // Attempt to auto-join as listener first if not already
      await RoomParticipantService.joinRoom(roomId, currentUser.id, 'listener');

      const parts = await RoomParticipantService.getRoomParticipants(roomId);
      setParticipants(parts);
      syncSeats(parts);
    };

    initRoom();

    // 3. Subscribe to Changes
    const unsubscribe = RoomParticipantService.subscribeToRoomParticipants(roomId, (updatedParticipants) => {
      setParticipants(updatedParticipants);
      syncSeats(updatedParticipants);
    });

    return () => {
      // Cleanup
      if (unsubscribe) unsubscribe();
      // leaveRoom(); // Should we leave audio on unmount? Context handles minimize usually, but if component unmounts fully...
    };
  }, [roomId, currentUser]);

  // Autoscroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Actions ---
  const handleSeatClick = (seat: SeatPosition) => {
    setSelectedSeat(seat);
    setShowSeatMenu(true);
  };

  const handleTakeMic = async () => {
    if (!selectedSeat || !roomId || !currentUser) return;

    // Call Service
    const success = await RoomParticipantService.joinSeat(roomId, currentUser.id, selectedSeat.id);
    if (success) {
      // UI update happens via Subscription callback `syncSeats`
      // But we can optimistically update? Better wait for real confirmation to avoid sync issues.
      // Also ensure mic is on
      if (!isMicOn) toggleMic();
    }
    setShowSeatMenu(false);
  };

  const handleLeaveMic = async () => {
    if (!roomId || !currentUser) return;
    const success = await RoomParticipantService.leaveSeat(roomId, currentUser.id);
    setShowSeatMenu(false);
  };

  const handleSendGift = (gift: GiftItem) => {
    const myName = currentUser?.name || 'Me';
    let recipientName = "Everyone";

    if (giftRecipients.includes('all')) {
      recipientName = "Everyone";
    } else if (giftRecipients.length === 1) {
      const target = seats.find(s => s.user?.id === giftRecipients[0])?.user;
      recipientName = target?.name || "Someone";
    } else {
      recipientName = `${giftRecipients.length} people`;
    }

    setPlayingGift({ item: gift, from: myName, to: recipientName });
    setShowGiftPanel(false);

    // TODO: Send Gift API call here
    // await GiftService.send(...)

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      userId: currentUser?.id || 'me',
      userName: myName,
      message: `Sent ${gift.name} x1 to ${recipientName}`,
      timestamp: new Date(),
      level: currentUser?.level || 1,
      isGift: true
    }]);

    setTimeout(() => setPlayingGift(null), 3000);
  };

  // Helper to get active users for gift selection
  const getActiveUsers = () => {
    return seats.filter(s => !s.isEmpty && s.user).map(s => s.user!);
  };

  return (

    <div className={`min-h-screen w-full relative overflow-hidden ${customBg ? 'bg-black' : THEME.wrapper} text-slate-800 font-sans touch-none select-none`}>
      {/* GLOBAL STYLES FOR SCROLLBAR HIDING */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-linear-fade { mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent); }
      `}</style>

      {/* 0. Background Ambience / Custom BG */}
      {customBg ? (
        <div className="absolute inset-0 z-0">
          <img src={customBg} alt="Room Background" className="w-full h-full object-cover opacity-100" />
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-[100px]"></div>
        </div>
      )}

      {/* 1. Full Screen Gift Overlay */}
      {playingGift && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="flex flex-col items-center animate-bounce-custom">
            <div className="text-[150px] filter drop-shadow-[0_0_60px_rgba(255,215,0,0.8)] animate-spin-slow-reverse">
              {playingGift.item.icon}
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 uppercase tracking-widest italic">
                {playingGift.item.name}
              </h2>
              <p className="text-white/80 font-mono text-sm mt-1">
                From <span className="text-yellow-400 font-bold">{playingGift.from}</span> to <span className="text-pink-400 font-bold">{playingGift.to}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content Container */}
      <div className="relative z-10 flex flex-col h-full max-w-lg mx-auto sm:border-x sm:border-white/5 sm:shadow-2xl h-screen">

        {/* HEADER */}
        <header className="px-4 py-3 flex items-center justify-between">
          <div onClick={() => navigate(-1)} className="flex items-center gap-3 cursor-pointer group">
            <button className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center group-hover:bg-white/80 transition shadow-sm">
              <ArrowDownCircle size={18} className="rotate-90 text-slate-600" />
            </button>
            <div>
              <h1 className="text-base font-bold flex items-center gap-1.5 text-slate-800">
                {seats[0].user ? `${seats[0].user.name}'s Room` : "Loading..."}
                <Crown size={14} className="text-yellow-500 fill-yellow-500" />
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="bg-white/50 px-1.5 py-0.5 rounded font-mono border border-slate-100">ID: 882910</span>
                <span className="flex items-center gap-1"><Users size={10} /> 1.2k</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {seats[0].user?.id === (currentUser?.id || 'me') && (
              <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 bg-white/40 hover:bg-white/60 text-slate-700" onClick={() => setShowSettings(true)}>
                <Settings size={16} />
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 bg-white/40 hover:bg-white/60 text-slate-700">
              <MoreVertical size={16} />
            </Button>
            <Button size="sm" className="h-8 rounded-full bg-white/60 hover:bg-white border border-slate-200 text-slate-700 text-xs px-3 font-medium shadow-sm">
              <Share2 size={12} className="mr-1.5" /> Share
            </Button>
          </div>
        </header>

        {/* MARQUEE REMOVED */}


        {/* SEAT GRID */}
        <div className="flex-1 mt-4 overflow-y-auto scrollbar-hide px-3 pb-20">

          {/* Host Stage */}
          <div className="flex justify-center mb-8 relative">
            <Seat
              data={seats[0]}
              onClick={() => handleSeatClick(seats[0])}
              isHost={true}
            />
          </div>

          {/* Guest Grid (2x4) */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-6 px-1">
            {seats.slice(1).map(seat => (
              <div key={seat.id} className="flex justify-center">
                <Seat
                  data={seat}
                  onClick={() => handleSeatClick(seat)}
                  isCurrentUser={seat.user?.id === (currentUser?.id || 'me')}
                />
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-auto bg-gradient-to-t from-white via-white/80 to-transparent pt-10 pb-4 px-3 relative">

          {/* Chat Messages Area - SCROLLBAR HIDDEN */}
          <div className="h-40 mb-3 overflow-y-auto mask-linear-fade space-y-2 pr-2 scrollbar-hide">
            {messages.map(msg => (
              <div key={msg.id} className="flex items-start gap-2 animate-slide-in-left">
                <div className={`px-1.5 py-[1px] rounded-[4px] text-[9px] font-black tracking-wider ${msg.level! > 30 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' : 'bg-blue-500/80 text-white'
                  }`}>
                  LV.{msg.level}
                </div>
                <div className="text-xs leading-5 break-words">
                  <span className="font-bold text-slate-600 mr-1.5 cursor-pointer hover:text-slate-900 transition-colors">
                    {msg.userName}:
                  </span>
                  <span className={`${msg.isGift ? 'text-pink-600 font-bold' : 'text-slate-800'}`}>
                    {msg.message}
                  </span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-10 bg-white shadow-sm rounded-full flex items-center px-4 border border-slate-200 focus-within:border-blue-400 transition-colors">
              <MessageCircle size={16} className="text-slate-400 mr-2" />
              <input
                className="bg-transparent border-none outline-none text-xs text-slate-800 w-full placeholder:text-slate-400"
                placeholder="Say something..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setMessageInput('')}
              />
            </div>

            <div className="flex items-center gap-2">
              <ActionBtn icon={<Mic size={18} />} active={isMicOn} activeClass="bg-green-500 text-white border-green-400 shadow-md shadow-green-200" onClick={toggleMic} className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm" />
              <ActionBtn icon={<Backpack size={18} />} onClick={() => setShowBackpack(true)} className="bg-orange-500/10 text-orange-500 border-orange-200 shadow-sm" />
              <ActionBtn icon={<Gift size={18} />} onClick={() => setShowGiftPanel(true)} className="bg-gradient-to-br from-pink-500 to-purple-600 border-none text-white shadow-md shadow-pink-200" />
              <ActionBtn icon={<UserCircle size={18} />} className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SHEET: Seat Menu --- */}
      {showSeatMenu && selectedSeat && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div
            className="bg-[#1e1e24] rounded-t-[30px] border-t border-white/10 p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14 border-2 border-white/10">
                  <AvatarImage src={selectedSeat.user?.avatar} />
                  <AvatarFallback className="bg-white/5 text-xs">
                    {selectedSeat.user?.name?.[0] || selectedSeat.id}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {selectedSeat.user ? selectedSeat.user.name : `Seat ${selectedSeat.id}`}
                  </h3>
                  <p className="text-xs text-white/40 flex items-center gap-1.5">
                    {selectedSeat.user ? (
                      <>
                        <span className="text-yellow-500">Gold VIP</span> • ID: 882190
                      </>
                    ) : "Empty Seat"}
                  </p>
                </div>
              </div>
              {/* Close */}
              <button onClick={() => setShowSeatMenu(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X size={18} className="text-white/60" />
              </button>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-4 gap-4">
              {/* Scenario A: My Seat -> Leave Mic */}
              {selectedSeat.user?.id === (currentUser?.id || 'me') ? (
                <>
                  <MenuAction
                    icon={<LogOut size={24} />}
                    label="Leave Mic"
                    danger
                    onClick={handleLeaveMic}
                  />
                  <MenuAction icon={<MicOff size={24} />} label="Mute" />
                  <MenuAction icon={<Settings size={24} />} label="Audio" />
                </>
              ) : selectedSeat.isEmpty && !selectedSeat.isHost ? (
                /* Scenario B: Empty Seat -> Take Mic (Guests only on non-host seats) */
                <div className="col-span-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold rounded-xl shadow-lg shadow-blue-600/20" onClick={handleTakeMic}>
                    Take Seat {selectedSeat.id}
                  </Button>
                </div>
              ) : (
                /* Scenario C: Other User -> Interact */
                <>
                  <MenuAction icon={<Gift size={24} />} label="Gift" color="text-pink-400" onClick={() => { setShowSeatMenu(false); setShowGiftPanel(true); }} />
                  <MenuAction icon={<UserCircle size={24} />} label="Profile" />
                  <MenuAction icon={<MessageCircle size={24} />} label="Mention" />
                  <MenuAction icon={<ShieldAlert size={24} />} label="Report" danger />
                </>
              )}
            </div>
          </div>
          {/* Tap outside to close */}
          <div className="flex-1" onClick={() => setShowSeatMenu(false)} />
        </div>
      )}

      {/* --- GIFT PANEL --- */}
      {showGiftPanel && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-[1px]">
          <div className="bg-[#15161c] h-[60vh] rounded-t-[24px] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-300">

            {/* Recipient Selector (Collapsed) */}
            <div className="px-4 py-2 border-b border-white/5 bg-black/20 flex items-center justify-between">
              <span className="text-xs text-white/50">Send to:</span>
              <Popover open={isRecipientSelectorOpen} onOpenChange={setIsRecipientSelectorOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full text-xs font-medium hover:bg-white/10 transition">
                    {giftRecipients.includes('all') ? 'Everyone (All)' :
                      giftRecipients.length === 1 ? (seats.find(s => s.user?.id === giftRecipients[0])?.user?.name || 'Selected') :
                        `${giftRecipients.length} Selected`}
                    <ChevronDown size={12} className="opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0 bg-[#25262c] border-white/10 text-white">
                  <div className="p-2">
                    <div
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white/5 ${giftRecipients.includes('all') ? 'bg-white/10' : ''}`}
                      onClick={() => { setGiftRecipients(['all']); setIsRecipientSelectorOpen(false); }}
                    >
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center"><Users size={14} className="text-yellow-400" /></div>
                      <span className="text-sm">Everyone</span>
                      {giftRecipients.includes('all') && <Check size={14} className="ml-auto text-green-400" />}
                    </div>
                    <div className="h-[1px] bg-white/5 my-1" />
                    <ScrollArea className="h-48">
                      {getActiveUsers().map(u => (
                        <div
                          key={u.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-white/5 ${giftRecipients.includes(u.id) ? 'bg-white/10' : ''}`}
                          onClick={() => {
                            if (giftRecipients.includes('all')) {
                              setGiftRecipients([u.id]);
                            } else {
                              setGiftRecipients(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]);
                            }
                          }}
                        >
                          <Avatar className="w-8 h-8"><AvatarImage src={u.avatar} /></Avatar>
                          <span className="text-sm truncate">{u.name}</span>
                          {giftRecipients.includes(u.id) && <Check size={14} className="ml-auto text-green-400" />}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-white/5 gap-6">
              <Tab active>Popular</Tab>
              <Tab>Luxury</Tab>
              <Tab>Exclusive</Tab>
              <Tab>Event</Tab>
            </div>

            {/* Gift Grid */}
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-4 gap-3">
                {GIFTS.map(gift => (
                  <button
                    key={gift.id}
                    onClick={() => handleSendGift(gift)}
                    className="group relative flex flex-col items-center p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-yellow-500/40 transition-all active:scale-95"
                  >
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">
                      {gift.icon}
                    </div>
                    <div className="text-[10px] font-bold text-white/80 w-full truncate text-center">
                      {gift.name}
                    </div>
                    <div className="flex items-center gap-1 mt-1 bg-black/40 px-2 py-0.5 rounded-full">
                      <Gem size={8} className="text-yellow-400" />
                      <span className="text-[9px] font-mono font-medium text-yellow-100">{gift.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* Wallet Footer */}
            <div className="p-4 border-t border-white/5 bg-[#0f1014] pb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Wallet size={16} className="text-yellow-400" />
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Balance</div>
                  <div className="text-sm font-bold text-white font-mono flex items-center gap-1">
                    12,450 <Gem size={10} className="text-yellow-500" />
                  </div>
                </div>
              </div>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full px-6">
                Top Up
              </Button>
            </div>

            {/* Close */}
            <button onClick={() => setShowGiftPanel(false)} className="absolute top-3 right-4 p-2 bg-black/20 rounded-full"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* --- SETTINGS DIALOG (HOST ONLY) --- */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings size={20} className="text-slate-400" /> Room Settings
              </h3>
              <button onClick={() => setShowSettings(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Background Image</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => {
                    // Mock file upload trigger
                    const url = prompt("Enter Image URL (PNG/GIF/WebP):", "https://i.pinimg.com/originals/a0/6d/20/a06d2036c2e3650275da95583b28b74a.gif");
                    if (url) setCustomBg(url);
                  }}
                >
                  {customBg ? (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden">
                      <img src={customBg} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <ImageIcon className="text-white" size={24} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <ImageIcon className="text-blue-500" size={20} />
                      </div>
                      <span className="text-xs text-slate-400 font-medium text-center">Tap to upload PNG or GIF (20s max)</span>
                    </>
                  )}
                </div>
                {customBg && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-red-500 hover:text-red-600 border-red-100 hover:bg-red-50"
                    onClick={() => setCustomBg(null)}
                  >
                    Reset to Default Theme
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowSettings(false)} className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-6">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Backpack Modal */}
      <BackpackModal isOpen={showBackpack} onClose={() => setShowBackpack(false)} />

    </div>
  );
};

// ===================================================================
// Sub-Components
// ===================================================================

const Seat: React.FC<{
  data: SeatPosition,
  onClick: () => void,
  isHost?: boolean,
  isCurrentUser?: boolean
}> = ({ data, onClick, isHost, isCurrentUser }) => {

  // Scale for Host vs Guest
  const sizeClasses = isHost
    ? "w-20 h-20 sm:w-24 sm:h-24"
    : "w-[58px] h-[58px] sm:w-[68px] sm:h-[68px]";

  return (
    <div className="flex flex-col items-center gap-1.5 group relative" onClick={onClick}>

      {/* Crown for Host */}
      {isHost && (
        <div className="absolute -top-6 text-2xl animate-bounce-custom z-20 filter drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          👑
        </div>
      )}

      {/* Avatar Container */}
      <div className={`
                ${sizeClasses} rounded-[24px] relative flex items-center justify-center 
                transition-transform duration-200 active:scale-95 cursor-pointer
            ${data.isEmpty
          ? "bg-white/40 border-2 border-slate-200 border-dashed hover:bg-white/60 hover:border-slate-300"
          : isHost
            ? "bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-400 p-[2px] shadow-[0_4px_15px_rgba(253,186,49,0.3)]"
            : "bg-gradient-to-br from-blue-300 to-purple-400 p-[1.5px] shadow-sm"
        }
            `}>
        <div className="w-full h-full rounded-[22px] overflow-hidden bg-white/80 relative">
          {data.isEmpty ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
              <span className="text-xl font-thin">+</span>
              <span className="text-[9px] font-mono opacity-70">{data.id}</span>
            </div>
          ) : (
            <>
              <img src={data.user?.avatar} alt={data.user?.name} className="w-full h-full object-cover" />
              {/* Speaking Indicator Layer */}
              {data.user?.isSpeaking && (
                <div className="absolute inset-0 bg-green-500/20 animate-pulse border-2 border-green-400 rounded-[22px]" />
              )}
              {/* Mute Icon */}
              {!data.user?.isSpeaking && !data.isEmpty && (
                <div className="absolute bottom-0 right-0 p-1 bg-white/90 backdrop-blur rounded-tl-lg shadow-sm">
                  <MicOff size={10} className="text-slate-500" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Name Label */}
      <div className="flex flex-col items-center max-w-[70px]">
        {data.user ? (
          <>
            <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center leading-tight shadow-sm bg-white/50 px-1 rounded">
              {data.user.name}
            </span>
            {/* VIP Badge */}
            {data.user.vip && (
              <div className="mt-0.5 h-[10px] px-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center shadow-sm">
                <span className="text-[6px] font-black text-white uppercase tracking-wider">VIP{data.user.vip}</span>
              </div>
            )}
            {/* Current User Marker */}
            {isCurrentUser && (
              <div className="w-1 h-1 bg-green-500 rounded-full mt-1 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
            )}
          </>
        ) : (
          <span className="text-[10px] text-slate-300 font-mono">Empty</span>
        )}
      </div>
    </div>
  );
};

const ActionBtn: React.FC<{
  icon: React.ReactNode,
  onClick?: () => void,
  className?: string,
  active?: boolean,
  activeClass?: string
}> = ({ icon, onClick, className, active, activeClass }) => (
  <button
    onClick={onClick}
    className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
            ${active
        ? activeClass
        : className || "bg-white/10 hover:bg-white/20 text-white/90 border border-white/5"}
        `}
  >
    {icon}
  </button>
);

const MenuAction: React.FC<{
  icon: React.ReactNode,
  label: string,
  onClick?: () => void,
  danger?: boolean,
  color?: string
}> = ({ icon, label, onClick, danger, color }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-white/5 active:scale-95 transition-all"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-colors ${danger
      ? "bg-red-500/10 text-red-400 group-hover:bg-red-500/20"
      : "bg-white/5 text-white/80 group-hover:bg-white/10"
      } ${color || ''}`}>
      {icon}
    </div>
    <span className={`text-xs font-medium ${danger ? 'text-red-400' : 'text-white/60'}`}>
      {label}
    </span>
  </button>
);

const Tab: React.FC<{ active?: boolean, children: React.ReactNode }> = ({ active, children }) => (
  <button className={`
        relative pb-2 text-sm font-medium transition-colors
        ${active ? 'text-yellow-400' : 'text-white/40 hover:text-white/60'}
    `}>
    {children}
    {active && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]" />}
  </button>
);

export default VoiceChatRoomRedesign;
