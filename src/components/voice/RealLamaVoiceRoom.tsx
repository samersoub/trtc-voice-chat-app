import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Volume2, VolumeX, Gift, MessageCircle, Users, 
  MoreVertical, Crown, Send, X, ArrowLeft, Heart, 
  Lock, UserPlus, Share2, Phone, Settings, Star, Zap
} from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import '@/styles/lama-voice-room.css';

// ===================================================================
// TypeScript Interfaces - Real Lama Chat Style
// ===================================================================
interface SeatUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  vipLevel?: number;
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
  type: 'text' | 'gift' | 'system';
  giftIcon?: string;
}

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  price: number;
}

// ===================================================================
// Real Lama Chat Style - 6 Seats (Single Row)
// ===================================================================
const initialSeats: VoiceSeat[] = [
  {
    seatNumber: 1,
    user: {
      id: 'host',
      name: 'سلطان',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sultan',
      level: 99,
      vipLevel: 7,
      isHost: true,
      isSpeaking: true,
      isMuted: false
    },
    isLocked: false
  },
  {
    seatNumber: 2,
    user: {
      id: 'user2',
      name: 'نور',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noor',
      level: 45,
      vipLevel: 3,
      isSpeaking: false,
      isMuted: false
    },
    isLocked: false
  },
  {
    seatNumber: 3,
    user: {
      id: 'user3',
      name: 'أحمد',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
      level: 32,
      isSpeaking: true,
      isMuted: false
    },
    isLocked: false
  },
  {
    seatNumber: 4,
    user: null,
    isLocked: false
  },
  {
    seatNumber: 5,
    user: null,
    isLocked: false
  },
  {
    seatNumber: 6,
    user: null,
    isLocked: true
  }
];

const gifts: GiftItem[] = [
  { id: '1', name: 'وردة', icon: '🌹', price: 10 },
  { id: '2', name: 'قلب', icon: '❤️', price: 50 },
  { id: '3', name: 'ألماس', icon: '💎', price: 100 },
  { id: '4', name: 'تاج', icon: '👑', price: 200 },
  { id: '5', name: 'سيارة', icon: '🏎️', price: 500 },
  { id: '6', name: 'قصر', icon: '🏰', price: 1000 }
];

// ===================================================================
// Real Lama Chat Voice Room Component
// ===================================================================
const RealLamaVoiceRoom: React.FC = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // States
  const [seats, setSeats] = useState<VoiceSeat[]>(initialSeats);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [onlineCount, setOnlineCount] = useState(248);

  // Room Info
  const roomInfo = {
    id: roomId || '343645',
    name: 'غرفة الأردن',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    hostName: 'سلطان الأردن',
    listenerCount: 248,
    category: 'ترفيه'
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleSeatClick = (seatNumber: number) => {
    const seat = seats.find(s => s.seatNumber === seatNumber);
    if (!seat) return;

    if (seat.user) {
      showSuccess(`${seat.user.name} - المستوى ${seat.user.level}`);
    } else if (seat.isLocked) {
      showError('مقعد مقفل');
    } else {
      showSuccess(`انضممت للمقعد ${seatNumber}`);
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
      type: 'text'
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageInput('');
  };

  const handleSendGift = (gift: GiftItem) => {
    const giftMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'user',
      userName: currentUser?.name || 'أنت',
      message: `أرسل ${gift.name}`,
      timestamp: new Date(),
      type: 'gift',
      giftIcon: gift.icon
    };

    setMessages(prev => [...prev, giftMsg]);
    setShowGiftPanel(false);
    showSuccess(`تم إرسال ${gift.name}!`);
  };

  // ===================================================================
  // Render: Real Lama Chat UI
  // ===================================================================
  return (
    <div className="h-screen w-full flex flex-col bg-gray-900" dir="rtl">
      
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-black/50 backdrop-blur-sm">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">رجوع</span>
        </button>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-white" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <MoreVertical className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* Main Room Area - Real Lama Style */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background Cover Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${roomInfo.coverImage})`
          }}
        />

        {/* Content Over Background */}
        <div className="relative h-full flex flex-col">
          
          {/* Seats Row - Real Lama Style: Single Horizontal Row at Top */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              {seats.map((seat) => (
                <div
                  key={seat.seatNumber}
                  onClick={() => handleSeatClick(seat.seatNumber)}
                  className="relative w-14 h-14 sm:w-16 sm:h-16 cursor-pointer flex-shrink-0"
                >
                  {seat.user ? (
                    <div className="relative w-full h-full">
                      {/* Speaking Ring */}
                      {seat.user.isSpeaking && (
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping" />
                      )}
                      
                      {/* Avatar */}
                      <div className={cn(
                        "relative w-full h-full rounded-full overflow-hidden border-2",
                        seat.user.isSpeaking 
                          ? "border-yellow-400 shadow-lg shadow-yellow-400/50" 
                          : "border-white/30"
                      )}>
                        <img 
                          src={seat.user.avatar} 
                          alt={seat.user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Host Crown */}
                      {seat.user.isHost && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                          <Crown className="w-2.5 h-2.5 text-white" fill="currentColor" />
                        </div>
                      )}

                      {/* VIP Badge */}
                      {seat.user.vipLevel && seat.user.vipLevel > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 px-1 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-[7px] font-bold text-white leading-none">
                          {seat.user.vipLevel}
                        </div>
                      )}

                      {/* Mic Status */}
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-gray-900",
                        seat.user.isMuted ? "bg-red-500" : "bg-green-500"
                      )}>
                        {seat.user.isMuted ? (
                          <MicOff className="w-2 h-2 text-white" />
                        ) : (
                          <Mic className="w-2 h-2 text-white" />
                        )}
                      </div>
                    </div>
                  ) : (
                    // Empty Seat
                    <div className={cn(
                      "w-full h-full rounded-full flex items-center justify-center border-2",
                      seat.isLocked 
                        ? "bg-gray-800/50 border-gray-600/50" 
                        : "bg-gray-800/30 border-dashed border-gray-500/50"
                    )}>
                      {seat.isLocked ? (
                        <Lock className="w-5 h-5 text-gray-500" />
                      ) : (
                        <UserPlus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Room Info at Bottom */}
          <div className="mt-auto px-4 pb-4">
            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-start gap-3">
                {/* Room Avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>

                {/* Room Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-lg truncate">{roomInfo.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                    <span>{roomInfo.hostName}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{onlineCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                      LIVE
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs">
                      {roomInfo.category}
                    </span>
                  </div>
                </div>

                {/* Follow Button */}
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold whitespace-nowrap">
                  + متابعة
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Control Bar */}
      <footer className="bg-black/80 backdrop-blur-lg border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Mic & Speaker */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMicActive(!isMicActive)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                isMicActive
                  ? "bg-green-500 shadow-lg shadow-green-500/50"
                  : "bg-red-500 shadow-lg shadow-red-500/50"
              )}
            >
              {isMicActive ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </button>

            <button className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Center: Message & Gift */}
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setShowChatPanel(true)}
              className="flex-1 h-10 rounded-full bg-gray-700/50 text-gray-300 text-sm px-4 text-right"
            >
              اكتب رسالة...
            </button>

            <button
              onClick={() => setShowGiftPanel(true)}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50"
            >
              <Gift className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Right: More */}
          <button className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </footer>

      {/* Gift Panel Modal */}
      {showGiftPanel && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 flex items-end"
          onClick={() => setShowGiftPanel(false)}
        >
          <div 
            className="w-full bg-gradient-to-b from-gray-900 to-black rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">إرسال هدية</h3>
              <button
                onClick={() => setShowGiftPanel(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {gifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift)}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105"
                >
                  <div className="text-4xl mb-2">{gift.icon}</div>
                  <p className="text-white text-sm font-semibold mb-1">{gift.name}</p>
                  <div className="flex items-center justify-center gap-1 text-yellow-400 text-xs font-bold">
                    <Zap className="w-3 h-3" />
                    <span>{gift.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel Modal */}
      {showChatPanel && (
        <div 
          className="fixed inset-0 z-50 bg-black/70"
          onClick={() => setShowChatPanel(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-gray-900 to-black rounded-t-3xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">الدردشة</h3>
              <button
                onClick={() => setShowChatPanel(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اكتب رسالة..."
                  className="flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
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

export default RealLamaVoiceRoom;
