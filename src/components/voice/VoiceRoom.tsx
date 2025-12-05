import React, { useState, CSSProperties } from 'react';
import { X, Settings, Gift, MessageCircle, Mic, MicOff, Smile, Armchair } from 'lucide-react';

// ===================================================================
// واجهات البيانات (TypeScript Interfaces)
// ===================================================================
interface SeatUser {
  id: number;
  name: string;
  avatar?: string;
  avatarColor?: string;
  hasDecorativeFrame?: boolean;
  frameColors?: string[];
  role?: 'host' | 'speaker' | 'listener';
}

interface ChatMessage {
  id: number;
  user: string;
  text: string;
  badge?: string;
  level?: number;
  color: string;
  badgeColor?: string;
  isSystemMessage?: boolean;
}

// ===================================================================
// بيانات وهمية (Mock Data)
// ===================================================================
const speakers: SeatUser[] = [
  { id: 1, name: 'Mason', avatarColor: 'from-purple-500 to-purple-700', role: 'host' },
  { id: 2, name: 'Sophia', avatarColor: 'from-blue-500 to-blue-700' },
  { id: 3, name: 'Charlotte', avatarColor: 'from-pink-500 to-pink-700' },
  { 
    id: 4, 
    name: 'Ava', 
    avatarColor: 'from-green-500 to-green-700',
    hasDecorativeFrame: true,
    frameColors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB']
  },
  { id: 5, name: 'Ryan', avatarColor: 'from-yellow-500 to-yellow-700' },
];

const bottomSeats: (SeatUser | null)[] = [
  { 
    id: 6, 
    name: 'Aby', 
    avatarColor: 'from-pink-400 to-purple-600',
    hasDecorativeFrame: true,
    frameColors: ['#FF1493', '#9370DB', '#4169E1']
  },
  null, // مقعد فارغ 7
  null, // مقعد فارغ 8
  null, // مقعد فارغ 9
  null, // مقعد فارغ 10
];

const chatMessages: ChatMessage[] = [
  { id: 1, user: 'Rya', text: 'change playercard', level: 32, color: 'text-blue-400' },
  { id: 2, user: 'Mason', text: 'modCheck', badge: 'ANCHOR', level: 65, color: 'text-purple-400' },
  { id: 3, user: 'Aby', text: 'Enter the room', level: 16, color: 'text-green-400' },
  { id: 4, user: 'Sophia', text: 'EbilDoggies cast their line into the water and caught a cod!', level: 99, color: 'text-red-400' },
  { id: 5, user: 'Ava', text: 'Amazing vibes here!', color: 'text-yellow-400' },
];

// ===================================================================
// المكون الرئيسي (VoiceRoom Component)
// ===================================================================
const VoiceRoom: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);

  // خاصية مخصصة للـ Glassmorphism (تأثير الضبابية) مع دعم المتصفحات
  const blurStyle: CSSProperties = {
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)', // دعم Safari
  };

  return (
    // OUTER WRAPPER: Dark background for desktop - centers mobile view
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-0">
      
      {/* MOBILE CONTAINER: Fixed width wrapper (max-w-[400px]) */}
      <div className="w-full max-w-[400px] mx-auto shadow-2xl h-screen">
        
        {/* MOBILE UI CONTENT - Everything inside fixed-width container */}
        <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f1e]">
          
          {/* Concert Stage Light Effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-80 bg-gradient-radial from-purple-900/30 via-blue-900/20 to-transparent blur-3xl"></div>
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-radial from-blue-800/20 via-purple-800/10 to-transparent blur-3xl"></div>
          </div>

          {/* Content Layer */}
          <div className="relative z-10 h-full flex flex-col">
            
            {/* TOP HEADER - Strictly Horizontal Layout */}
            <header 
              className="flex items-center justify-between px-3 py-2.5 bg-black/20 shrink-0"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              } as CSSProperties}
            >
              {/* Left Side - Host Info */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white/20 shadow-lg shrink-0"></div>
                <span className="text-white font-semibold text-sm truncate">mason chat</span>
                <button className="px-2.5 py-0.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-colors shadow-lg shrink-0">
                  Follow
                </button>
              </div>

              {/* Right Side - Audience/Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 border-2 border-[#1a1a2e] shadow-md"></div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-[#1a1a2e] shadow-md"></div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-600 border-2 border-[#1a1a2e] shadow-md"></div>
                </div>
                <span className="text-white text-xs font-medium">320 &gt;</span>
                <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>
              </div>
            </header>

            {/* شبكة المقاعد المركزية - تخطيط 5x2 */}
            <div className="flex-1 flex items-center justify-center px-3 py-4 overflow-hidden">
              <div className="w-full">
                <div className="grid grid-cols-5 gap-x-2 gap-y-5">
                  {/* الصف الأول - 5 متحدثين */}
                  {speakers.map((user) => (
                    <SpeakerSeat key={user.id} user={user} />
                  ))}

                  {/* الصف الثاني - 1 مستخدم + 4 مقاعد فارغة */}
                  {bottomSeats.map((user, index) => {
                    if (user) {
                      return <SpeakerSeat key={user.id} user={user} />;
                    }
                    return <EmptySeat key={`empty-${index + 7}`} seatNumber={index + 7} />;
                  })}
                </div>
              </div>
            </div>

            {/* Bottom spacing */}
            <div className="h-36 shrink-0"></div>
          </div>

          {/* LIVE CHAT OVERLAY - Bottom Left */}
          <div className="absolute bottom-16 left-3 z-20 w-64 h-36">
            <div className="relative h-full">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent via-black/30 to-transparent z-10 pointer-events-none"></div>
              <div 
                className="h-full bg-black/40 rounded-xl border border-white/5 overflow-hidden"
                style={{
                  backdropFilter: 'blur(15px)',
                  WebkitBackdropFilter: 'blur(15px)'
                } as CSSProperties}
              >
                <div className="h-full overflow-y-auto px-2.5 py-2.5 space-y-1.5 scrollbar-hide">
                  {chatMessages.map((msg) => (
                    <ChatMessageItem key={msg.id} message={msg} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ACTION BAR - Fixed Footer */}
          <footer 
            className="absolute bottom-0 left-0 right-0 z-30 bg-[#1a1a2e]/95 border-t border-white/10"
            style={{
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)'
            } as CSSProperties}
          >
            <div className="flex items-center gap-1.5 px-2.5 py-2.5">
              {/* Text Input Field */}
              <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800/60 rounded-full border border-white/10 min-w-0">
                <input
                  type="text"
                  placeholder="Let's talk"
                  className="flex-1 bg-transparent text-xs text-white placeholder-gray-400 outline-none min-w-0"
                />
                <button className="hover:opacity-80 transition-opacity shrink-0">
                  <Smile className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-full transition-all shadow-lg ${
                    isMuted ? 'bg-pink-600 hover:bg-pink-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isMuted ? <MicOff className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5 text-white" />}
                </button>

                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Settings className="w-3.5 h-3.5 text-white" />
                </button>

                <button className="p-2 hover:bg-orange-600/20 rounded-full transition-colors">
                  <Gift className="w-3.5 h-3.5 text-orange-500" />
                </button>

                <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold border border-[#1a1a2e]">
                    23
                  </span>
                </button>
              </div>
            </div>
          </footer>
          
        </div>
      </div>
    </div>
  );
};

// Speaker/User Seat Component
const SpeakerSeat: React.FC<{ user: SeatUser }> = ({ user }) => {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-full aspect-square">
        {user.hasDecorativeFrame && user.frameColors && (
          <div className="absolute -inset-0.5 rounded-full animate-spin-slow">
            <div 
              className="w-full h-full rounded-full blur-[2px]"
              style={{
                background: `conic-gradient(from 0deg, ${user.frameColors.join(', ')})`
              }}
            ></div>
          </div>
        )}
        
        <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${user.avatarColor} border border-white/30 shadow-lg`}>
          <div className="absolute inset-0 rounded-full bg-white/10"></div>
        </div>
      </div>

      <span className="text-white text-[10px] font-medium text-center truncate w-full">
        {user.name}
      </span>
    </div>
  );
};

// Empty Seat Component
const EmptySeat: React.FC<{ seatNumber: number }> = ({ seatNumber }) => {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div 
        className="w-full aspect-square rounded-full bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-0.5 shadow-lg"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        } as CSSProperties}
      >
        <Armchair className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
        <span className="text-[10px] text-gray-400 font-medium">{seatNumber}</span>
      </div>
    </div>
  );
};

// ===================================================================
// مكون رسالة الدردشة (Chat Message Item Component)
// ===================================================================
const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  if (message.isSystemMessage) {
    return (
      <div className="flex items-center gap-1">
        <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-gray-400 font-medium shrink-0">
          نظام
        </span>
        <span className="text-[9px] text-gray-300 truncate">{message.text}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-1 flex-wrap">
      {message.level && (
        <span className="px-1.5 py-0.5 bg-red-500 rounded text-[9px] text-white font-bold shrink-0">
          {message.level}
        </span>
      )}
      {message.badge && (
        <span className="px-1.5 py-0.5 bg-purple-600 rounded text-[9px] text-white font-bold shrink-0">
          {message.badge}
        </span>
      )}
      <div className="flex items-baseline gap-0.5 flex-1 min-w-0">
        <span className={`${message.color} text-[9px] font-bold shrink-0`}>
          {message.user}:
        </span>
        <span className="text-white text-[9px] truncate">
          {message.text}
        </span>
      </div>
    </div>
  );
};

export default VoiceRoom;
