import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Gift, MessageCircle, Users, Settings, MoreVertical, Crown, Radio } from 'lucide-react';

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

// ===================================================================
// Main Voice Chat Room Component - Professional Premium Design
// ===================================================================
const VoiceChatRoomRedesign: React.FC = () => {
  const [seats, setSeats] = useState<SeatPosition[]>(initialSeats);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeakerActive, setIsSpeakerActive] = useState(true);
  const [callDuration, setCallDuration] = useState(1180);

  useEffect(() => {
    const interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
      <div className="absolute top-40 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-32 left-40 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

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
      <main className="flex items-center justify-center min-h-screen px-4 pt-20 pb-32">
        <div className="w-full max-w-4xl">
          {/* Seats Grid - Professional 2x4 Layout */}
          <div className="space-y-8">
            {/* Top Row */}
            <div className="grid grid-cols-4 gap-4 sm:gap-6">
              {seats.slice(0, 4).map((seat) => (
                <SeatCircle key={seat.id} seat={seat} />
              ))}
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-4 gap-4 sm:gap-6">
              {seats.slice(4, 8).map((seat) => (
                <SeatCircle key={seat.id} seat={seat} />
              ))}
            </div>
          </div>

          {/* Room Description */}
          <div className="mt-8 text-center">
            <div className="inline-block px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-gray-300 text-sm">Welcome! Please respect each other and chat politely.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Control Panel */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/40 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Mobile Timer Display */}
          <div className="flex md:hidden justify-center mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-white text-sm font-medium tabular-nums">{formatDuration(callDuration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            {/* Gift Button */}
            <button 
              className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/25 transition-all hover:scale-110 active:scale-95"
              aria-label="Send gift"
            >
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">3</span>
              </div>
            </button>

            {/* Message Button */}
            <button 
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Messages"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">5</span>
              </div>
            </button>

            {/* Microphone Button */}
            <button
              onClick={() => setIsMicActive(!isMicActive)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl ${
                isMicActive 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-500/30' 
                  : 'bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20'
              }`}
              aria-label="Toggle microphone"
            >
              {isMicActive ? (
                <>
                  <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 rounded-2xl bg-green-400/20 animate-ping"></div>
                </>
              ) : (
                <MicOff className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300" />
              )}
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setIsSpeakerActive(!isSpeakerActive)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl ${
                isSpeakerActive 
                  ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/30' 
                  : 'bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20'
              }`}
              aria-label="Toggle speaker"
            >
              {isSpeakerActive ? (
                <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
              ) : (
                <VolumeX className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300" />
              )}
            </button>

            {/* More Actions */}
            <button 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="More actions"
            >
              <div className="grid grid-cols-2 gap-1">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ===================================================================
// Seat Circle Component - Premium Professional Design
// ===================================================================
interface SeatCircleProps {
  seat: SeatPosition;
}

const SeatCircle: React.FC<SeatCircleProps> = ({ seat }) => {
  if (seat.isEmpty) {
    return (
      <div className="flex flex-col items-center gap-2 group cursor-pointer">
        {/* Empty Seat */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
          {/* Seat Circle */}
          <div className="w-full h-full rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center group-hover:scale-105">
            <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                <span className="text-lg sm:text-xl">+</span>
              </div>
            </div>
          </div>
          
          {/* Seat Number Badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 border border-white/20 flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">{seat.id}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Occupied Seat */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
        {/* Speaking Animation Ring */}
        {seat.user?.isSpeaking && (
          <div className="absolute inset-0 rounded-2xl">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 opacity-50"></div>
          </div>
        )}

        {/* Avatar Container */}
        <div className={`relative w-full h-full rounded-2xl overflow-hidden ${
          seat.user?.isSpeaking 
            ? 'ring-4 ring-green-400 ring-offset-2 ring-offset-slate-900' 
            : 'ring-2 ring-purple-500/30'
        } shadow-2xl transition-all hover:scale-105 cursor-pointer`}>
          {/* Avatar Image or Gradient */}
          {seat.user?.avatar ? (
            <img 
              src={seat.user.avatar} 
              alt={seat.user.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-2xl sm:text-3xl font-bold">
                {seat.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          )}

          {/* Host Crown Badge */}
          {seat.user?.isHost && (
            <div className="absolute -top-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white flex items-center justify-center shadow-lg z-10">
              <Crown className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Level Badge */}
          {seat.user?.level && (
            <div className="absolute top-1 left-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/20">
              <span className="text-yellow-400 text-[10px] font-bold">LV {seat.user.level}</span>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        {/* Seat Number Badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 border border-white/30 flex items-center justify-center shadow-lg z-10">
          <span className="text-white text-xs font-bold">{seat.id}</span>
        </div>
      </div>

      {/* Username */}
      <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 max-w-[90px] sm:max-w-[110px]">
        <p className="text-white text-xs font-medium truncate text-center">
          {seat.user?.name || `User ${seat.id}`}
        </p>
      </div>
    </div>
  );
};

export default VoiceChatRoomRedesign;
