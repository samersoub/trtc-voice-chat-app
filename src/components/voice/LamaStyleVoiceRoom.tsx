import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Volume2, VolumeX, Gift, MessageCircle, Users, Settings, 
  MoreVertical, Crown, Radio, Send, Smile, X, ArrowLeft, Heart, Star,
  Trophy, Zap, Lock, UserPlus, Share2, Flag, Phone, PhoneOff, Camera,
  Music, Home, Shield, Award, Sparkles
} from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { UserPresenceService } from '@/services/UserPresenceService';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import '@/styles/lama-voice-room.css';

// ===================================================================
// TypeScript Interfaces - Lama Chat Style
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
  charm?: number; // Charm points like Lama Chat
  gifts?: number; // Total gifts received
  gender?: 'male' | 'female';
  country?: string; // Country flag emoji
}

interface VoiceSeat {
  seatNumber: number;
  user: SeatUser | null;
  isLocked: boolean;
  isPremium?: boolean; // VIP only seats
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  avatar?: string;
  type: 'text' | 'gift' | 'join' | 'leave' | 'system' | 'animation';
  giftIcon?: string;
  giftName?: string;
  animation?: string; // Lottie animation path
}

interface GiftItem {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  price: number;
  animation?: string;
  category: 'normal' | 'premium' | 'luxury';
}

interface RoomTheme {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
}

// ===================================================================
// Lama Chat Style Mock Data - Realistic Room
// ===================================================================
const lamaSeats: VoiceSeat[] = [
  // Seat 1: Host (Top Center - Like Lama Chat)
  {
    seatNumber: 1,
    user: {
      id: 'host-lama',
      name: 'سلطان الأردن',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sultan',
      level: 99,
      vipLevel: 8,
      badge: '👑',
      isHost: true,
      isSpeaking: true,
      isMuted: false,
      charm: 125000,
      gifts: 980000,
      gender: 'male',
      country: '🇯🇴'
    },
    isLocked: false,
    isPremium: false
  },
  // Seat 2: Co-Host (Top Right)
  {
    seatNumber: 2,
    user: {
      id: 'user-2',
      name: 'نور السورية',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noor',
      level: 85,
      vipLevel: 6,
      badge: '💎',
      isHost: false,
      isSpeaking: false,
      isMuted: false,
      charm: 85000,
      gifts: 520000,
      gender: 'female',
      country: '🇸🇾'
    },
    isLocked: false,
    isPremium: true
  },
  // Seat 3: VIP Guest
  {
    seatNumber: 3,
    user: {
      id: 'user-3',
      name: 'أحمد المصري',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
      level: 72,
      vipLevel: 5,
      badge: '⭐',
      isHost: false,
      isSpeaking: true,
      isMuted: false,
      charm: 62000,
      gifts: 380000,
      gender: 'male',
      country: '🇪🇬'
    },
    isLocked: false,
    isPremium: false
  },
  // Seat 4: Active User
  {
    seatNumber: 4,
    user: {
      id: 'user-4',
      name: 'ليلى العراقية',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laila',
      level: 55,
      vipLevel: 3,
      badge: '🌟',
      isHost: false,
      isSpeaking: false,
      isMuted: true,
      charm: 38000,
      gifts: 210000,
      gender: 'female',
      country: '🇮🇶'
    },
    isLocked: false,
    isPremium: false
  },
  // Seats 5-6: Empty
  {
    seatNumber: 5,
    user: null,
    isLocked: false,
    isPremium: false
  },
  {
    seatNumber: 6,
    user: null,
    isLocked: false,
    isPremium: true
  },
  // Seats 7-8: Locked/Premium
  {
    seatNumber: 7,
    user: null,
    isLocked: true,
    isPremium: true
  },
  {
    seatNumber: 8,
    user: null,
    isLocked: false,
    isPremium: false
  },
  // Seat 9: Empty
  {
    seatNumber: 9,
    user: null,
    isLocked: false,
    isPremium: false
  }
];

const lamaGifts: GiftItem[] = [
  // Normal Gifts
  { id: '1', name: 'Rose', nameAr: 'وردة', icon: '🌹', price: 5, category: 'normal' },
  { id: '2', name: 'Coffee', nameAr: 'قهوة', icon: '☕', price: 10, category: 'normal' },
  { id: '3', name: 'Heart', nameAr: 'قلب', icon: '❤️', price: 20, category: 'normal' },
  { id: '4', name: 'Cake', nameAr: 'كعكة', icon: '🎂', price: 30, category: 'normal' },
  
  // Premium Gifts
  { id: '5', name: 'Diamond', nameAr: 'ألماس', icon: '💎', price: 100, category: 'premium', animation: '/lottie/diamond.json' },
  { id: '6', name: 'Crown', nameAr: 'تاج', icon: '👑', price: 200, category: 'premium', animation: '/lottie/crown.json' },
  { id: '7', name: 'Trophy', nameAr: 'كأس', icon: '🏆', price: 300, category: 'premium' },
  
  // Luxury Gifts
  { id: '8', name: 'Car', nameAr: 'سيارة فارهة', icon: '🏎️', price: 999, category: 'luxury', animation: '/lottie/car.json' },
  { id: '9', name: 'Rocket', nameAr: 'صاروخ', icon: '🚀', price: 1500, category: 'luxury' },
  { id: '10', name: 'Castle', nameAr: 'قصر', icon: '🏰', price: 5000, category: 'luxury', animation: '/lottie/castle.json' },
  { id: '11', name: 'Dragon', nameAr: 'تنين ذهبي', icon: '🐉', price: 9999, category: 'luxury', animation: '/lottie/dragon.json' },
];

const quickEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🌟', '👏', '🎵', '💃'];

// ===================================================================
// Lama Chat Style Voice Room - Main Component
// ===================================================================
const LamaStyleVoiceRoom: React.FC = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // ===================================================================
  // State Management
  // ===================================================================
  const [seats, setSeats] = useState<VoiceSeat[]>(lamaSeats);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeakerActive, setIsSpeakerActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [onlineCount, setOnlineCount] = useState(156);
  
  // UI States
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  // Room Info
  const [roomInfo] = useState({
    id: roomId || '343645',
    name: 'غرفة الأردن الملكية',
    description: 'أجواء راقية ومحترمة',
    category: 'ترفيه',
    background: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920',
    theme: 'purple' as const,
    password: false,
    isOfficial: true,
    tags: ['ترفيه', 'موسيقى', 'دردشة']
  });

  // ===================================================================
  // Effects & Timers
  // ===================================================================
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
      setOnlineCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Demo messages on mount
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      userId: 'system',
      userName: 'النظام',
      message: '🎉 مرحباً بكم في غرفة الأردن الملكية!',
      timestamp: new Date(),
      type: 'system'
    };
    setMessages([welcomeMsg]);

    // Simulate user joining
    setTimeout(() => {
      addSystemMessage('انضم محمد السعودي 🇸🇦 إلى الغرفة');
    }, 2000);
  }, []);

  // ===================================================================
  // Helper Functions
  // ===================================================================
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const addSystemMessage = (text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'النظام',
      message: text,
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, msg]);
  };

  // ===================================================================
  // Event Handlers
  // ===================================================================
  const handleSeatClick = (seatNumber: number) => {
    const seat = seats.find(s => s.seatNumber === seatNumber);
    if (!seat) return;

    setSelectedSeat(seatNumber);

    if (seat.user) {
      // Show user profile
      showSuccess(`${seat.user.badge} ${seat.user.name} - LV.${seat.user.level}`);
    } else if (seat.isLocked) {
      showError('🔒 هذا المقعد مقفل للأعضاء المميزين');
    } else if (seat.isPremium) {
      showSuccess('💎 مقعد VIP - يتطلب اشتراك مميز');
    } else {
      // Join seat
      showSuccess(`انضممت للمقعد ${seatNumber}`);
      addSystemMessage(`${currentUser?.name || 'أنت'} انضم للمقعد ${seatNumber}`);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'user',
      userName: currentUser?.name || 'أنت',
      message: messageInput,
      timestamp: new Date(),
      avatar: (currentUser?.avatarUrl || undefined) as string | undefined,
      type: 'text'
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageInput('');
    messageInputRef.current?.focus();
  };

  const handleSendGift = (gift: GiftItem) => {
    const giftMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'user',
      userName: currentUser?.name || 'أنت',
      message: `أرسل ${gift.nameAr}`,
      timestamp: new Date(),
      type: 'gift',
      giftIcon: gift.icon,
      giftName: gift.nameAr,
      animation: gift.animation
    };

    setMessages(prev => [...prev, giftMsg]);
    setShowGiftPanel(false);
    showSuccess(`تم إرسال ${gift.nameAr} بنجاح! 💝`);
  };

  const handleMicToggle = () => {
    setIsMicActive(!isMicActive);
    showSuccess(isMicActive ? '🔇 تم كتم الميكروفون' : '🎤 تم تشغيل الميكروفون');
  };

  const handleLeaveRoom = () => {
    navigate('/');
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  // ===================================================================
  // Render: Lama Chat Style UI
  // ===================================================================
  return (
    <div className="min-h-screen w-full relative overflow-hidden" dir="rtl">
      {/* Background - Lama Style Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(88, 28, 135, 0.95) 0%, rgba(109, 40, 217, 0.92) 25%, rgba(139, 92, 246, 0.9) 50%, rgba(192, 132, 252, 0.88) 75%, rgba(233, 213, 255, 0.85) 100%), url(${roomInfo.background})`
        }}
      >
        {/* Animated Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Top Navigation Bar - Lama Style */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-gradient-to-b from-black/60 via-black/40 to-transparent border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 py-2.5">
          {/* Main Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Right: Back Button */}
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 backdrop-blur-xl border border-red-400/30 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 text-red-300" />
              <span className="text-red-200 text-sm font-semibold hidden sm:inline">خروج</span>
            </button>

            {/* Center: Room Info */}
            <div className="flex-1 flex items-center justify-center gap-2">
              {/* Room Icon */}
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-yellow-500/50 animate-pulse">
                  <Radio className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                {roomInfo.isOfficial && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Room Name & Stats */}
              <div className="hidden sm:flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <h1 className="text-white font-bold text-base drop-shadow-lg">{roomInfo.name}</h1>
                  {roomInfo.password && <Lock className="w-3.5 h-3.5 text-yellow-400" />}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-purple-200">ID: {roomInfo.id}</span>
                  <span className="text-purple-300">•</span>
                  <span className="text-purple-200">{roomInfo.category}</span>
                </div>
              </div>
            </div>

            {/* Left: Online Count & Menu */}
            <div className="flex items-center gap-2">
              {/* Online Users */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 backdrop-blur-xl border border-emerald-400/30 shadow-lg">
                <div className="relative">
                  <Users className="w-4 h-4 text-emerald-300" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
                </div>
                <span className="text-white text-sm font-bold">{onlineCount}</span>
              </div>

              {/* Room Menu */}
              <button 
                onClick={() => setShowRoomMenu(!showRoomMenu)}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Secondary Info Row */}
          <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
            {/* Live Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span className="text-white text-xs font-bold">LIVE {formatDuration(callDuration)}</span>
            </div>

            {/* Room Tags */}
            {roomInfo.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-purple-200 text-xs">
                {tag}
              </span>
            ))}

            {/* Description */}
            <span className="text-purple-200 text-xs hidden md:inline">{roomInfo.description}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen pt-28 pb-24 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-3">
          
          {/* Left: Voice Seats - Lama Chat 3x3 Grid */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-3xl">
              {/* Seats Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 p-2 sm:p-4">
                {seats.map((seat) => {
                  const isTopCenter = seat.seatNumber === 1; // Host position
                  
                  return (
                    <div
                      key={seat.seatNumber}
                      onClick={() => handleSeatClick(seat.seatNumber)}
                      className={cn(
                        "relative cursor-pointer transition-all duration-300",
                        seat.user ? "hover:scale-105" : "hover:scale-102",
                        isTopCenter && "col-span-3 sm:col-span-1 sm:col-start-2" // Center the host on mobile
                      )}
                    >
                      {/* Seat Frame */}
                      <div className={cn(
                        "relative rounded-3xl p-0.5 transition-all",
                        seat.user?.isSpeaking 
                          ? "bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 shadow-2xl shadow-pink-500/60 animate-pulse-glow" 
                          : seat.user
                          ? "bg-gradient-to-br from-purple-500/60 to-pink-500/60"
                          : seat.isPremium
                          ? "bg-gradient-to-br from-yellow-500/40 to-orange-500/40"
                          : "bg-gradient-to-br from-gray-600/50 to-gray-700/50"
                      )}>
                        <div className={cn(
                          "rounded-3xl overflow-hidden backdrop-blur-xl transition-all",
                          seat.user 
                            ? "bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-purple-900/80" 
                            : "bg-gradient-to-br from-gray-800/60 to-gray-900/70 border-2 border-dashed border-gray-500/50"
                        )}>
                          
                          {/* Seat Content */}
                          <div className={cn(
                            "relative p-3 sm:p-4 flex flex-col items-center justify-center",
                            isTopCenter ? "py-4 sm:py-6" : "py-3 sm:py-4"
                          )}>
                            
                            {seat.user ? (
                              <>
                                {/* Avatar Container */}
                                <div className="relative mb-2">
                                  {/* Speaking Wave Ring */}
                                  {seat.user.isSpeaking && (
                                    <div className="absolute inset-0 -m-3 rounded-full border-4 border-yellow-400/50 animate-ping"></div>
                                  )}
                                  
                                  {/* Avatar */}
                                  <div className={cn(
                                    "relative rounded-full overflow-hidden border-4 shadow-2xl transition-all",
                                    seat.user.isSpeaking 
                                      ? "border-yellow-400 shadow-yellow-400/50 scale-110" 
                                      : "border-purple-400/50",
                                    isTopCenter ? "w-20 h-20 sm:w-24 sm:h-24" : "w-16 h-16 sm:w-20 sm:h-20"
                                  )}>
                                    {seat.user.avatar ? (
                                      <img 
                                        src={seat.user.avatar} 
                                        alt={seat.user.name} 
                                        className="w-full h-full object-cover" 
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                        <span className="text-white font-bold text-2xl sm:text-3xl">
                                          {seat.user.name.charAt(0)}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Host Crown */}
                                  {seat.user.isHost && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/60 animate-bounce border-2 border-white">
                                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" />
                                      </div>
                                    </div>
                                  )}

                                  {/* VIP Badge */}
                                  {seat.user.vipLevel && seat.user.vipLevel > 0 && (
                                    <div className="absolute -top-1 -left-1">
                                      <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-xs font-bold text-white shadow-xl border border-white/30">
                                        VIP{seat.user.vipLevel}
                                      </div>
                                    </div>
                                  )}

                                  {/* Mic Status Badge */}
                                  <div className={cn(
                                    "absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xl border-2 border-white",
                                    seat.user.isMuted 
                                      ? "bg-gradient-to-br from-red-500 to-red-600" 
                                      : "bg-gradient-to-br from-green-400 to-emerald-500"
                                  )}>
                                    {seat.user.isMuted ? (
                                      <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    ) : (
                                      <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    )}
                                  </div>

                                  {/* Country Flag */}
                                  {seat.user.country && (
                                    <div className="absolute -bottom-1 -left-1 text-lg sm:text-xl drop-shadow-lg">
                                      {seat.user.country}
                                    </div>
                                  )}
                                </div>

                                {/* User Info */}
                                <div className="w-full text-center space-y-1">
                                  {/* Name */}
                                  <p className={cn(
                                    "text-white font-bold truncate px-2 drop-shadow-lg",
                                    isTopCenter ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                                  )}>
                                    {seat.user.badge} {seat.user.name}
                                  </p>

                                  {/* Level Badge */}
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/50 to-pink-500/50 backdrop-blur-sm">
                                    <Sparkles className="w-3 h-3 text-yellow-300" />
                                    <span className="text-[10px] sm:text-xs text-yellow-200 font-bold">
                                      LV.{seat.user.level}
                                    </span>
                                  </div>

                                  {/* Charm & Gifts (Only for host or VIP) */}
                                  {(seat.user.isHost || (seat.user.vipLevel && seat.user.vipLevel > 3)) && (
                                    <div className="flex items-center justify-center gap-2 text-[10px]">
                                      <div className="flex items-center gap-0.5 text-pink-300">
                                        <Heart className="w-3 h-3" />
                                        <span>{formatNumber(seat.user.charm || 0)}</span>
                                      </div>
                                      <div className="flex items-center gap-0.5 text-yellow-300">
                                        <Gift className="w-3 h-3" />
                                        <span>{formatNumber(seat.user.gifts || 0)}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Speaking Animation */}
                                {seat.user.isSpeaking && (
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
                                )}
                              </>
                            ) : seat.isLocked ? (
                              // Locked Seat
                              <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center mb-2 shadow-xl">
                                  <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" />
                                </div>
                                <p className="text-gray-400 text-xs font-semibold">مقعد مقفل</p>
                                {seat.isPremium && (
                                  <p className="text-yellow-500 text-[10px] mt-1">VIP فقط</p>
                                )}
                              </div>
                            ) : (
                              // Empty Seat
                              <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                                <div className={cn(
                                  "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2 shadow-xl transition-all",
                                  seat.isPremium
                                    ? "bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500/50"
                                    : "bg-gradient-to-br from-gray-600/50 to-gray-700/50 border-2 border-dashed border-gray-500/50"
                                )}>
                                  <UserPlus className={cn(
                                    "w-6 h-6 sm:w-7 sm:h-7",
                                    seat.isPremium ? "text-yellow-400" : "text-gray-400"
                                  )} />
                                </div>
                                <p className={cn(
                                  "text-xs font-semibold",
                                  seat.isPremium ? "text-yellow-400" : "text-gray-400"
                                )}>
                                  {seat.isPremium ? 'مقعد VIP' : 'انضم'}
                                </p>
                              </div>
                            )}

                            {/* Seat Number Badge */}
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
                              <span className="text-white text-[10px] font-bold">{seat.seatNumber}</span>
                            </div>

                            {/* Premium Badge */}
                            {seat.isPremium && !seat.user && (
                              <div className="absolute top-2 left-2">
                                <Award className="w-4 h-4 text-yellow-400 drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Chat Panel - Desktop Only */}
          <div className="hidden lg:block w-96 xl:w-[420px]">
            <div className="h-full flex flex-col rounded-3xl overflow-hidden backdrop-blur-2xl bg-black/40 border border-white/10 shadow-2xl">
              {/* Chat Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold">الدردشة</span>
                  </div>
                  <span className="text-purple-300 text-sm">{messages.length}</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "rounded-2xl p-3 text-sm transition-all hover:scale-[1.02]",
                      msg.type === 'system' 
                        ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 text-center backdrop-blur-sm" 
                        : msg.type === 'gift'
                        ? "bg-gradient-to-r from-yellow-500/25 to-orange-500/25 text-white backdrop-blur-sm border border-yellow-500/30"
                        : "bg-white/10 text-white backdrop-blur-sm"
                    )}
                  >
                    {msg.type === 'text' && (
                      <div className="flex items-start gap-2">
                        {msg.avatar && (
                          <img src={msg.avatar} className="w-8 h-8 rounded-full border-2 border-purple-400/50" />
                        )}
                        <div className="flex-1">
                          <span className="font-bold text-purple-300">{msg.userName}: </span>
                          <span className="text-white">{msg.message}</span>
                        </div>
                      </div>
                    )}
                    {msg.type === 'gift' && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-yellow-200">{msg.userName}</span>
                          <span className="text-white">{msg.message}</span>
                        </div>
                        <span className="text-3xl drop-shadow-lg animate-bounce">{msg.giftIcon}</span>
                      </div>
                    )}
                    {msg.type === 'system' && (
                      <span className="font-semibold">{msg.message}</span>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-white/10 bg-black/20">
                <div className="flex items-center gap-2">
                  {/* Emoji Button */}
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105"
                  >
                    <Smile className="w-5 h-5 text-purple-300" />
                  </button>

                  {/* Input */}
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب رسالة..."
                    className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all"
                  />

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-105 shadow-lg"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Quick Emojis */}
                {showEmojiPicker && (
                  <div className="mt-2 p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="flex flex-wrap gap-2">
                      {quickEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiClick(emoji)}
                          className="text-2xl hover:scale-125 transition-transform"
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

      {/* Bottom Control Bar - Lama Chat Style */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl bg-gradient-to-t from-black/70 via-black/50 to-transparent border-t border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {/* Mic Button */}
            <button
              onClick={handleMicToggle}
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl",
                isMicActive
                  ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-500/50"
                  : "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/50"
              )}
            >
              {isMicActive ? (
                <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
              ) : (
                <MicOff className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
              )}
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setIsSpeakerActive(!isSpeakerActive)}
              className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl",
                isSpeakerActive
                  ? "bg-gradient-to-br from-purple-500 to-purple-600"
                  : "bg-gradient-to-br from-gray-600 to-gray-700"
              )}
            >
              {isSpeakerActive ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Gift Button */}
            <button
              onClick={() => setShowGiftPanel(true)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-yellow-500/50 animate-pulse-slow"
            >
              <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
            </button>

            {/* Chat Button (Mobile) */}
            <button
              onClick={() => setShowChatMobile(true)}
              className="lg:hidden w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>

            {/* Leave Button */}
            <button
              onClick={handleLeaveRoom}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl shadow-red-500/50"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </footer>

      {/* Gift Panel Modal */}
      {showGiftPanel && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowGiftPanel(false)}
        >
          <div 
            className="w-full sm:w-auto sm:min-w-[500px] bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 rounded-t-3xl sm:rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-yellow-400" />
                إرسال هدية
              </h3>
              <button
                onClick={() => setShowGiftPanel(false)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Gift Categories */}
            <div className="space-y-4">
              {['normal', 'premium', 'luxury'].map((category) => (
                <div key={category}>
                  <h4 className="text-purple-300 text-sm font-semibold mb-2 capitalize">
                    {category === 'normal' ? 'هدايا عادية' : category === 'premium' ? 'هدايا مميزة' : 'هدايا فاخرة'}
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {lamaGifts.filter(g => g.category === category).map((gift) => (
                      <button
                        key={gift.id}
                        onClick={() => handleSendGift(gift)}
                        className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 transition-all hover:scale-105 active:scale-95"
                      >
                        <div className="text-4xl mb-2 group-hover:animate-bounce">{gift.icon}</div>
                        <p className="text-white text-xs font-semibold mb-1">{gift.nameAr}</p>
                        <div className="flex items-center justify-center gap-1 text-yellow-400 text-xs font-bold">
                          <Zap className="w-3 h-3" />
                          <span>{gift.price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Chat Modal */}
      {showChatMobile && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowChatMobile(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 h-[70vh] bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 rounded-t-3xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                الدردشة
              </h3>
              <button
                onClick={() => setShowChatMobile(false)}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "rounded-2xl p-3 text-sm",
                    msg.type === 'system' 
                      ? "bg-blue-500/20 text-blue-200 text-center" 
                      : msg.type === 'gift'
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-white"
                      : "bg-white/10 text-white"
                  )}
                >
                  {msg.type === 'text' && (
                    <>
                      <span className="font-bold text-purple-300">{msg.userName}: </span>
                      <span>{msg.message}</span>
                    </>
                  )}
                  {msg.type === 'gift' && (
                    <div className="flex items-center justify-between">
                      <span><span className="font-bold">{msg.userName}</span> {msg.message}</span>
                      <span className="text-2xl">{msg.giftIcon}</span>
                    </div>
                  )}
                  {msg.type === 'system' && <span>{msg.message}</span>}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
                >
                  <Smile className="w-5 h-5 text-purple-300" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اكتب رسالة..."
                  className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LamaStyleVoiceRoom;
