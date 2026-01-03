import React, { useState } from 'react';
import { X, Share2, Settings, Gift, MessageCircle, Mic, MicOff, Smile } from 'lucide-react';
import VoiceRoomGrid from '@/components/voice/VoiceRoomGrid';

interface ChatMessage {
  id: number;
  badge: string;
  badgeColor: string;
  username: string;
  usernameColor: string;
  message: string;
  isSystem?: boolean;
}

const VoiceRoomPage: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);

  const chatMessages: ChatMessage[] = [
    {
      id: 1,
      badge: 'Level 16',
      badgeColor: 'bg-purple-600',
      username: 'Alex',
      usernameColor: 'text-yellow-400',
      message: 'Welcome everyone!',
    },
    {
      id: 2,
      badge: '⚓',
      badgeColor: 'bg-blue-600',
      username: 'Captain',
      usernameColor: 'text-cyan-400',
      message: 'Great vibes here',
    },
    {
      id: 3,
      badge: 'System',
      badgeColor: 'bg-gray-700',
      username: '',
      usernameColor: '',
      message: 'Mason entered the room',
      isSystem: true,
    },
    {
      id: 4,
      badge: 'Level 5',
      badgeColor: 'bg-pink-600',
      username: 'Sarah',
      usernameColor: 'text-pink-400',
      message: "Let's chat!",
    },
    {
      id: 5,
      badge: 'VIP',
      badgeColor: 'bg-yellow-600',
      username: 'Mike',
      usernameColor: 'text-orange-400',
      message: 'Amazing room design',
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
          <h1 className="text-white font-semibold text-base">mason chat</h1>
          <button className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full font-medium transition-colors">
            Follow
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Overlapping Avatars */}
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-[#1a1a2e]"></div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border-2 border-[#1a1a2e]"></div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-[#1a1a2e]"></div>
          </div>
          <span className="text-white text-sm font-medium">320 &gt;</span>
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 pt-8 pb-32">
        <VoiceRoomGrid />
      </main>

      {/* Chat Overlay - Bottom Left */}
      <div className="absolute bottom-20 left-4 z-20 w-72 h-48">
        <div className="relative h-full rounded-xl bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden">
          {/* Gradient Fade at Top */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none"></div>

          {/* Chat Messages */}
          <div className="h-full overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {chatMessages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 bg-[#1a1a2e]/95 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          {/* Input Field */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-[#2a2a3e] rounded-full">
            <input
              type="text"
              placeholder="Let's talk"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
            />
            <button className="hover:opacity-80 transition-opacity" aria-label="Add emoji">
              <Smile className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Microphone Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full transition-all ${
              isMuted ? 'bg-pink-500 hover:bg-pink-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Action Icons */}
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Settings">
              <Settings className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Send gift">
              <Gift className="w-5 h-5 text-orange-500" />
            </button>
            <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
              <MessageCircle className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                23
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  if (message.isSystem) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="px-2 py-0.5 bg-white/10 rounded text-gray-400">{message.badge}</span>
        <span className="text-gray-400">{message.message}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-1.5 text-xs">
      <span className={`px-2 py-0.5 ${message.badgeColor} rounded text-white font-semibold shrink-0`}>
        {message.badge}
      </span>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className={`${message.usernameColor} font-bold`}>{message.username}:</span>
        <span className="text-white">{message.message}</span>
      </div>
    </div>
  );
};

export default VoiceRoomPage;
