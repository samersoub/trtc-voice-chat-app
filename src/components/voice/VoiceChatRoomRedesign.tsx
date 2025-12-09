import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Mic, MicOff, Volume2, VolumeX, Gift, MessageCircle, Users, Settings, MoreVertical, Crown, Radio, Send, Smile, X } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { UserPresenceService } from '@/services/UserPresenceService';

// ===================================================================
// TypeScript Interfaces
// ===================================================================
interface SeatPosition {
  id: number;
  user?: {
    name: string;
    avatar?: string;
    isHost?: boolean;
    isSpeaking?: boolean;
    level?: number;
  };
  isEmpty: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  avatar?: string;
}

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  price: number;
}

// ===================================================================
// Mock Data - 8 Seats Premium Layout
// ===================================================================
const initialSeats: SeatPosition[] = [
  { id: 1, user: { name: 'Jordan Room', avatar: '', isHost: true, isSpeaking: true, level: 45 }, isEmpty: false },
  { id: 2, user: undefined, isEmpty: true },
  { id: 3, user: undefined, isEmpty: true },
  { id: 4, user: undefined, isEmpty: true },
  { id: 5, user: undefined, isEmpty: true },
  { id: 6, user: undefined, isEmpty: true },
  { id: 7, user: undefined, isEmpty: true },
  { id: 8, user: undefined, isEmpty: true },
];

const availableGifts: GiftItem[] = [
  { id: '1', name: 'Rose', icon: '🌹', price: 10 },
  { id: '2', name: 'Heart', icon: '❤️', price: 50 },
  { id: '3', name: 'Diamond', icon: '💎', price: 100 },
  { id: '4', name: 'Crown', icon: '👑', price: 200 },
  { id: '5', name: 'Cake', icon: '🎂', price: 30 },
  { id: '6', name: 'Car', icon: '🚗', price: 500 },
  { id: '7', name: 'Rocket', icon: '🚀', price: 1000 },
  { id: '8', name: 'Trophy', icon: '🏆', price: 150 },
];

const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🌟', '👏', '🎵', '🎤'];

// ===================================================================
// Main Voice Chat Room Component - Professional Premium Design
// ===================================================================
const VoiceChatRoomRedesign: React.FC = () => {
  const { id: roomId } = useParams();
  const currentUser = AuthService.getCurrentUser();
  const [seats, setSeats] = useState<SeatPosition[]>(initialSeats);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeakerActive, setIsSpeakerActive] = useState(true);
  const [callDuration, setCallDuration] = useState(1180);
  
  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', userId: '1', userName: 'Jordan Room', message: 'Welcome to the room! 🎉', timestamp: new Date(), avatar: '' }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Register user presence when joining room
  useEffect(() => {
    if (currentUser?.id && roomId) {
      UserPresenceService.setUserInRoom(currentUser.id, roomId, 'Jordan Room');
    }
    
    // Cleanup: remove user from room when leaving
    return () => {
      if (currentUser?.id) {
        UserPresenceService.removeUserFromRoom(currentUser.id);
      }
    };
  }, [currentUser?.id, roomId]);

  useEffect(() => {
    const interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'current-user',
        userName: 'You',
        message: messageInput,
        timestamp: new Date(),
        avatar: ''
      };
      setMessages([...messages, newMessage]);
      setMessageInput('');
      inputRef.current?.focus();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(messageInput + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleGiftSend = (gift: GiftItem) => {
    const giftMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      message: `Sent ${gift.icon} ${gift.name}`,
      timestamp: new Date(),
      avatar: ''
    };
    setMessages([...messages, giftMessage]);
    setShowGiftPanel(false);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>

      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse [animation-delay:2s]"></div>
      <div className="absolute -bottom-32 left-40 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse [animation-delay:4s]"></div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Room Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-semibold text-sm">Jordan Voice Room</h1>
                <p className="text-gray-400 text-xs">ID: 343645</p>
              </div>
            </div>

            {/* Center Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white text-sm font-medium">{formatDuration(callDuration)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 text-gray-300" />
              </button>
              <button 
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 pb-72 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Seats Section - Compact & Higher */}
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-3">
              {seats.slice(0, 4).map((seat) => (
                <SeatCircle key={seat.id} seat={seat} />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {seats.slice(4, 8).map((seat) => (
                <SeatCircle key={seat.id} seat={seat} />
              ))}
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="mt-8 backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl p-4 max-w-4xl mx-auto">
            <div className="h-64 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{msg.userName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-purple-300 text-sm font-medium">{msg.userName}</span>
                      <span className="text-gray-500 text-xs">{msg.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-white text-sm mt-0.5 break-words">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Fixed Panel - Chat Input, Gifts, Emoji, Controls */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 via-black/90 to-transparent backdrop-blur-2xl border-t border-white/10">
        {/* Gift Panel Popup */}
        {showGiftPanel && (
          <div className="absolute bottom-full left-0 right-0 mb-2 px-4">
            <div className="max-w-4xl mx-auto backdrop-blur-xl bg-black/90 border border-purple-500/30 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Send a Gift</h3>
                <button 
                  onClick={() => setShowGiftPanel(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                  aria-label="Close gift panel"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {availableGifts.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => handleGiftSend(gift)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 hover:border-purple-400 hover:scale-105 transition-all active:scale-95"
                  >
                    <span className="text-3xl">{gift.icon}</span>
                    <span className="text-white text-xs font-medium">{gift.name}</span>
                    <span className="text-yellow-400 text-xs font-bold">{gift.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 right-0 mb-2 px-4">
            <div className="max-w-md mx-auto backdrop-blur-xl bg-black/90 border border-purple-500/30 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">Pick an Emoji</h3>
                <button 
                  onClick={() => setShowEmojiPicker(false)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                  aria-label="Close emoji picker"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="text-2xl p-2 rounded-lg hover:bg-purple-500/20 transition-all active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Chat Input Row */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setShowGiftPanel(!showGiftPanel);
                setShowEmojiPicker(false);
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                showGiftPanel 
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Gift className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowGiftPanel(false);
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                showEmojiPicker 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Smile className="w-5 h-5 text-white" />
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Send message"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Voice Controls Row */}
          <div className="flex items-center justify-center gap-3">
            <button 
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              aria-label="Messages"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => setIsMicActive(!isMicActive)}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${
                isMicActive 
                  ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-green-500/40' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              {isMicActive ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={() => setIsSpeakerActive(!isSpeakerActive)}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${
                isSpeakerActive 
                  ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-green-500/40' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              {isSpeakerActive ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white" />
              )}
            </button>

            <button 
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ===================================================================
// Seat Circle Component - Compact Round Design
// ===================================================================
interface SeatCircleProps {
  seat: SeatPosition;
}

const SeatCircle: React.FC<SeatCircleProps> = ({ seat }) => {
  if (seat.isEmpty) {
    return (
      <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16">
          <div className="w-full h-full rounded-full bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center group-hover:scale-105">
            <span className="text-gray-400 text-xl">+</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/20 flex items-center justify-center shadow-lg">
            <span className="text-white text-[10px] font-bold">{seat.id}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-14 h-14 sm:w-16 sm:h-16">
        {/* Speaking Animation Ring */}
        {seat.user?.isSpeaking && (
          <div className="absolute -inset-1 rounded-full">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 opacity-50"></div>
          </div>
        )}

        {/* Avatar Container */}
        <div className={`relative w-full h-full rounded-full overflow-hidden ${
          seat.user?.isSpeaking 
            ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-slate-900' 
            : 'ring-2 ring-purple-500/30'
        } shadow-xl transition-all hover:scale-105 cursor-pointer`}>
          {seat.user?.avatar ? (
            <img 
              src={seat.user.avatar} 
              alt={seat.user.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {seat.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          )}

          {/* Host Crown Badge */}
          {seat.user?.isHost && (
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 border border-white flex items-center justify-center shadow-lg z-10">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          )}

          {/* Level Badge */}
          {seat.user?.level && (
            <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/70 backdrop-blur-sm">
              <span className="text-yellow-400 text-[9px] font-bold block text-center">LV{seat.user.level}</span>
            </div>
          )}
        </div>

        {/* Seat Number Badge */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border border-white/30 flex items-center justify-center shadow-lg z-10">
          <span className="text-white text-[10px] font-bold">{seat.id}</span>
        </div>
      </div>

      {/* Username */}
      <div className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 max-w-[70px]">
        <p className="text-white text-[10px] font-medium truncate text-center">
          {seat.user?.name || `User ${seat.id}`}
        </p>
      </div>
    </div>
  );
};

export default VoiceChatRoomRedesign;
