import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Volume2, VolumeX, Gift, MessageCircle, Users, Settings, 
  MoreVertical, Crown, Radio, Send, Smile, X, ArrowLeft, Heart, Star,
  Trophy, Zap, Lock, UserPlus, Share2, Flag, Phone, PhoneOff
} from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { UserPresenceService } from '@/services/UserPresenceService';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

// ===================================================================
// TypeScript Interfaces
// ===================================================================
interface SeatUser {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  vipLevel?: number;
  badge?: string;
  isHost?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
}

interface VoiceSeat {
  seatNumber: number;
  user: SeatUser | null;
  isLocked: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  avatar?: string;
  type: 'text' | 'gift' | 'join' | 'leave' | 'system';
  giftIcon?: string;
}

interface GiftItem {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  price: number;
  animation?: string;
}

// ===================================================================
// Enhanced Mock Data - Premium Voice Chat
// ===================================================================
const initialSeats: VoiceSeat[] = Array.from({ length: 9 }, (_, i) => ({
  seatNumber: i + 1,
  user: i === 0 ? {
    id: 'host-1',
    name: 'Jordan King',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    level: 99,
    vipLevel: 7,
    badge: '👑',
    isHost: true,
    isSpeaking: true,
    isMuted: false
  } : null,
  isLocked: false
}));

const premiumGifts: GiftItem[] = [
  { id: '1', name: 'Rose', nameAr: 'وردة', icon: '🌹', price: 10 },
  { id: '2', name: 'Heart', nameAr: 'قلب', icon: '❤️', price: 50 },
  { id: '3', name: 'Diamond', nameAr: 'ألماس', icon: '💎', price: 100 },
  { id: '4', name: 'Crown', nameAr: 'تاج', icon: '👑', price: 200 },
  { id: '5', name: 'Cake', nameAr: 'كعكة', icon: '🎂', price: 30 },
  { id: '6', name: 'Car', nameAr: 'سيارة', icon: '🏎️', price: 500 },
  { id: '7', name: 'Rocket', nameAr: 'صاروخ', icon: '🚀', price: 1000 },
  { id: '8', name: 'Trophy', nameAr: 'كأس', icon: '🏆', price: 150 },
  { id: '9', name: 'Planet', nameAr: 'كوكب', icon: '🪐', price: 2000 },
  { id: '10', name: 'Castle', nameAr: 'قصر', icon: '🏰', price: 5000 },
];

const quickEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🌟', '👏', '🎵', '🎤'];

// ===================================================================
// Premium Voice Chat Room - Lama Chat Style
// ===================================================================
const PremiumVoiceRoom: React.FC = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  
  // States
  const [seats, setSeats] = useState<VoiceSeat[]>(initialSeats);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeakerActive, setIsSpeakerActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [onlineCount, setOnlineCount] = useState(156);
  
  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      userId: 'system', 
      userName: 'النظام', 
      message: 'مرحباً بك في غرفة Jordan Voice! 🎉', 
      timestamp: new Date(), 
      type: 'system' 
    }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Room info
  const [roomInfo] = useState({
    name: 'Jordan Voice Room',
    id: '343645',
    description: 'غرفة صوتية للدردشة والتسلية',
    category: 'ترفيه',
    password: false
  });

  // Effects
  useEffect(() => {
    if (currentUser?.id && roomId) {
      UserPresenceService.setUserInRoom(currentUser.id, roomId, roomInfo.name);
    }
    
    return () => {
      if (currentUser?.id) {
        UserPresenceService.removeUserFromRoom(currentUser.id);
      }
    };
  }, [currentUser?.id, roomId, roomInfo.name]);

  useEffect(() => {
    const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper functions
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'ضيف',
      message: messageInput,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    inputRef.current?.focus();
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleGiftSend = (gift: GiftItem) => {
    const giftMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'ضيف',
      message: `أرسل ${gift.nameAr}`,
      timestamp: new Date(),
      type: 'gift',
      giftIcon: gift.icon
    };
    setMessages(prev => [...prev, giftMessage]);
    setShowGiftPanel(false);
    showSuccess(`تم إرسال ${gift.nameAr} بنجاح!`);
  };

  const handleSeatClick = (seatNumber: number) => {
    const seat = seats.find(s => s.seatNumber === seatNumber);
    if (!seat) return;

    if (seat.user) {
      // Show user profile or actions
      showSuccess(`المقعد ${seatNumber}: ${seat.user.name}`);
    } else if (!seat.isLocked) {
      // Join seat
      showSuccess(`الانضمام للمقعد ${seatNumber}`);
    } else {
      showError('هذا المقعد مقفل');
    }
  };

  const handleMicToggle = () => {
    setIsMicActive(!isMicActive);
    showSuccess(isMicActive ? 'تم كتم الميكروفون' : 'تم تشغيل الميكروفون');
  };

  const handleLeaveRoom = () => {
    navigate('/voice/rooms');
  };

  // ===================================================================
  // Render: Premium Room UI
  // ===================================================================
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900" dir="rtl">
      {/* Animated Premium Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.4),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.3),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Floating Premium Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>

      {/* Premium Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Right: Back Button */}
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
              <span className="hidden sm:inline text-white text-sm font-medium">خروج</span>
            </button>

            {/* Center: Room Info */}
            <div className="flex-1 flex items-center justify-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50 animate-pulse">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block text-center">
                <h1 className="text-white font-bold text-base flex items-center gap-2">
                  {roomInfo.name}
                  {roomInfo.password && <Lock className="w-3.5 h-3.5 text-yellow-400" />}
                </h1>
                <p className="text-gray-300 text-xs">ID: {roomInfo.id} • {roomInfo.category}</p>
              </div>
            </div>

            {/* Left: Stats & Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10">
                <Users className="w-4 h-4 text-purple-300" />
                <span className="text-white text-sm font-bold">{onlineCount}</span>
              </div>
              
              <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:scale-105">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Secondary Info Bar */}
          <div className="mt-2 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span>مباشر {formatDuration(callDuration)}</span>
            </div>
            <div className="text-gray-400">•</div>
            <div className="text-purple-300">{roomInfo.description}</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative h-screen pt-24 pb-32 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-4">
          
          {/* Left: Voice Seats Section */}
          <div className="flex-1 flex flex-col">
            {/* Seats Grid - Premium 3x3 Layout */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <div className="grid grid-cols-3 gap-4 sm:gap-6 p-4">
                  {seats.map((seat) => (
                    <div
                      key={seat.seatNumber}
                      onClick={() => handleSeatClick(seat.seatNumber)}
                      className={cn(
                        "relative aspect-square cursor-pointer transition-all duration-300",
                        seat.user ? "hover:scale-105" : "hover:scale-102"
                      )}
                    >
                      {/* Seat Container */}
                      <div className={cn(
                        "w-full h-full rounded-3xl p-0.5 transition-all",
                        seat.user?.isSpeaking 
                          ? "bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 shadow-2xl shadow-purple-500/50 animate-pulse" 
                          : seat.user
                          ? "bg-gradient-to-br from-purple-600 to-pink-600"
                          : "bg-gradient-to-br from-gray-700 to-gray-800"
                      )}>
                        <div className={cn(
                          "w-full h-full rounded-3xl flex flex-col items-center justify-center relative overflow-hidden",
                          seat.user 
                            ? "bg-gradient-to-br from-purple-900/90 via-pink-900/90 to-purple-900/90" 
                            : "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-dashed border-gray-600"
                        )}>
                          
                          {seat.user ? (
                            <>
                              {/* Avatar */}
                              <div className="relative">
                                <div className={cn(
                                  "w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4",
                                  seat.user.isSpeaking ? "border-white shadow-lg" : "border-purple-500/50"
                                )}>
                                  {seat.user.avatar ? (
                                    <img src={seat.user.avatar} alt={seat.user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                      <span className="text-white font-bold text-2xl">{seat.user.name.charAt(0)}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Host Crown */}
                                {seat.user.isHost && (
                                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-bounce">
                                    <Crown className="w-4 h-4 text-white" fill="currentColor" />
                                  </div>
                                )}
                                
                                {/* Mic Status */}
                                <div className={cn(
                                  "absolute -bottom-1 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-lg",
                                  seat.user.isMuted ? "bg-red-500" : "bg-green-500"
                                )}>
                                  {seat.user.isMuted ? (
                                    <MicOff className="w-4 h-4 text-white" />
                                  ) : (
                                    <Mic className="w-4 h-4 text-white" />
                                  )}
                                </div>

                                {/* VIP Badge */}
                                {seat.user.vipLevel && seat.user.vipLevel > 0 && (
                                  <div className="absolute -top-1 -left-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-bold text-white shadow-lg">
                                    VIP{seat.user.vipLevel}
                                  </div>
                                )}
                              </div>

                              {/* Name & Level */}
                              <div className="mt-2 text-center">
                                <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-full px-2 drop-shadow-lg">
                                  {seat.user.badge} {seat.user.name}
                                </p>
                                <div className="mt-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/50 to-pink-500/50 inline-block">
                                  <span className="text-[10px] text-yellow-300 font-bold">LV.{seat.user.level}</span>
                                </div>
                              </div>

                              {/* Speaking Wave Animation */}
                              {seat.user.isSpeaking && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
                              )}
                            </>
                          ) : seat.isLocked ? (
                            <>
                              <Lock className="w-8 h-8 text-gray-500 mb-2" />
                              <p className="text-gray-500 text-xs">مقفل</p>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-8 h-8 text-gray-500 mb-2" />
                              <p className="text-gray-500 text-xs">انضم</p>
                            </>
                          )}

                          {/* Seat Number */}
                          <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">{seat.seatNumber}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Chat Section - Desktop Only */}
          <div className="hidden lg:block w-96">
            <div className="h-full flex flex-col bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-300" />
                    <span className="text-white font-semibold">الدردشة</span>
                  </div>
                  <span className="text-gray-400 text-sm">{messages.length} رسالة</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm",
                      msg.type === 'system' 
                        ? "bg-blue-500/20 text-blue-200 text-center" 
                        : msg.type === 'gift'
                        ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-200"
                        : "bg-white/5 text-white"
                    )}
                  >
                    {msg.type === 'text' && (
                      <>
                        <span className="font-semibold text-purple-300">{msg.userName}: </span>
                        <span>{msg.message}</span>
                      </>
                    )}
                    {msg.type === 'gift' && (
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">{msg.userName}</span>
                        <span>{msg.message}</span>
                        <span className="text-2xl">{msg.giftIcon}</span>
                      </span>
                    )}
                    {msg.type === 'system' && <span>{msg.message}</span>}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-white/10 bg-black/20">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                  >
                    <Smile className="w-5 h-5 text-gray-300" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب رسالة..."
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all hover:scale-105"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="grid grid-cols-6 gap-2">
                      {quickEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="w-10 h-10 text-2xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Control Bar - Premium Style */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/50 border-t border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            {/* Mic Control */}
            <button
              onClick={handleMicToggle}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95",
                isMicActive 
                  ? "bg-gradient-to-r from-red-500 to-pink-500 shadow-red-500/50" 
                  : "bg-gradient-to-r from-gray-600 to-gray-700"
              )}
            >
              {isMicActive ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Speaker Control */}
            <button
              onClick={() => setIsSpeakerActive(!isSpeakerActive)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                isSpeakerActive ? "bg-white/10 hover:bg-white/20" : "bg-red-500/20"
              )}
            >
              {isSpeakerActive ? (
                <Volume2 className="w-5 h-5 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 text-red-400" />
              )}
            </button>

            {/* Gift Button */}
            <button
              onClick={() => setShowGiftPanel(!showGiftPanel)}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 flex items-center justify-center transition-all shadow-lg shadow-yellow-500/30 hover:scale-110"
            >
              <Gift className="w-5 h-5 text-white" />
            </button>

            {/* Chat Button - Mobile */}
            <button
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="lg:hidden w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>

            {/* Leave Button */}
            <button
              onClick={handleLeaveRoom}
              className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all"
            >
              <PhoneOff className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </footer>

      {/* Gift Panel Modal */}
      {showGiftPanel && (
        <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-4" onClick={() => setShowGiftPanel(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Gift className="w-7 h-7 text-yellow-400" />
                إرسال هدية
              </h2>
              <button
                onClick={() => setShowGiftPanel(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {premiumGifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleGiftSend(gift)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400 transition-all hover:scale-105 active:scale-95"
                >
                  <span className="text-5xl">{gift.icon}</span>
                  <span className="text-white text-sm font-medium text-center">{gift.nameAr}</span>
                  <span className="text-yellow-400 text-xs font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {gift.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Chat Panel */}
      {showSidePanel && (
        <div className="lg:hidden fixed inset-0 z-[60]" onClick={() => setShowSidePanel(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-purple-900/95 to-black/95 backdrop-blur-xl rounded-t-3xl border-t border-white/20 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Chat Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-300" />
                <span className="text-white font-semibold">الدردشة</span>
              </div>
              <button onClick={() => setShowSidePanel(false)}>
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm",
                    msg.type === 'system' 
                      ? "bg-blue-500/20 text-blue-200 text-center" 
                      : msg.type === 'gift'
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-200"
                      : "bg-white/5 text-white"
                  )}
                >
                  {msg.type === 'text' && (
                    <>
                      <span className="font-semibold text-purple-300">{msg.userName}: </span>
                      <span>{msg.message}</span>
                    </>
                  )}
                  {msg.type === 'gift' && (
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{msg.userName}</span>
                      <span>{msg.message}</span>
                      <span className="text-2xl">{msg.giftIcon}</span>
                    </span>
                  )}
                  {msg.type === 'system' && <span>{msg.message}</span>}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-white/10 bg-black/20">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                >
                  <Smile className="w-5 h-5 text-gray-300" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اكتب رسالة..."
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all hover:scale-105"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>

              {showEmojiPicker && (
                <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="grid grid-cols-6 gap-2">
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-10 h-10 text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default PremiumVoiceRoom;
