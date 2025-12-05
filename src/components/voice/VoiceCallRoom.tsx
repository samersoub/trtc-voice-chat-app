import React, { useState, useEffect, CSSProperties } from 'react';
import { Mic, MicOff, Headphones, PhoneOff, Volume2, VolumeX } from 'lucide-react';

// ===================================================================
// TypeScript Interfaces
// ===================================================================
interface CallUser {
  id: number;
  name: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking: boolean;
}

// ===================================================================
// Mock Data - 6 Users
// ===================================================================
const callUsers: CallUser[] = [
  { id: 1, name: 'Mason', avatar: '/avatars/mason.jpg', isMuted: false, isSpeaking: true },
  { id: 2, name: 'Sophia', avatar: '/avatars/sophia.jpg', isMuted: false, isSpeaking: false },
  { id: 3, name: 'Charlotte', avatar: '/avatars/charlotte.jpg', isMuted: true, isSpeaking: false },
  { id: 4, name: 'Ava', avatar: '/avatars/ava.jpg', isMuted: false, isSpeaking: false },
  { id: 5, name: 'Ryan', avatar: '/avatars/ryan.jpg', isMuted: false, isSpeaking: true },
  { id: 6, name: 'Aby', avatar: '/avatars/aby.jpg', isMuted: true, isSpeaking: false },
];

// ===================================================================
// Main Voice Call Room Component
// ===================================================================
const VoiceCallRoom: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format call duration
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cross-browser blur styles
  const blurStyle: CSSProperties = {
    WebkitBackdropFilter: 'blur(15px)',
    backdropFilter: 'blur(15px)',
  };

  const nameBlurStyle: CSSProperties = {
    WebkitBackdropFilter: 'blur(10px)',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden font-sans"
      style={{
        background: 'linear-gradient(to bottom, #1E1E2E 0%, #161622 100%)',
      }}
    >
      {/* Main Content Container */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center px-4 py-8">
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-6 z-20">
          <h1 className="text-white text-2xl font-bold text-center">
            مكالمة جماعية
          </h1>
        </header>

        {/* Users Grid - 2 Rows × 3 Columns */}
        <div className="flex-1 flex items-center justify-center w-full max-w-5xl">
          <div className="grid grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            {/* First Row - 3 Users */}
            {callUsers.slice(0, 3).map((user) => (
              <UserCircle key={user.id} user={user} blurStyle={nameBlurStyle} />
            ))}

            {/* Timer Circle - Centered between rows */}
            <div className="col-span-3 flex justify-center -my-4">
              <TimerCircle time={formatTime(callDuration)} />
            </div>

            {/* Second Row - 3 Users */}
            {callUsers.slice(3, 6).map((user) => (
              <UserCircle key={user.id} user={user} blurStyle={nameBlurStyle} />
            ))}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <footer 
          className="fixed bottom-0 left-0 right-0 z-30 py-6 px-4"
          style={{
            background: 'rgba(30, 30, 46, 0.9)',
            ...blurStyle,
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="max-w-md mx-auto flex items-center justify-center gap-6">
            {/* Mic Toggle Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out"
              style={{
                background: isMuted ? '#ED4245' : '#43B581',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {/* End Call Button */}
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من إنهاء المكالمة؟')) {
                  // Handle end call logic
                  console.log('Call ended');
                }
              }}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out"
              style={{
                background: '#ED4245',
                boxShadow: '0 4px 20px rgba(237, 66, 69, 0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(237, 66, 69, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(237, 66, 69, 0.5)';
              }}
              aria-label="End Call"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>

            {/* Speaker Toggle Button */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out"
              style={{
                background: isSpeakerOn ? '#43B581' : '#747F8D',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

// ===================================================================
// User Circle Component
// ===================================================================
interface UserCircleProps {
  user: CallUser;
  blurStyle: CSSProperties;
}

const UserCircle: React.FC<UserCircleProps> = ({ user, blurStyle }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar Circle */}
      <div className="relative">
        {/* Speaking Animation Ring */}
        {user.isSpeaking && (
          <div 
            className="absolute -inset-2 rounded-full animate-pulse"
            style={{
              border: '3px solid #43B581',
              boxShadow: '0 0 20px rgba(67, 181, 129, 0.6)',
            }}
          ></div>
        )}

        {/* Avatar Container */}
        <div
          className="relative w-[120px] h-[120px] rounded-full overflow-hidden transition-all duration-300"
          style={{
            border: `4px solid ${user.isSpeaking ? '#43B581' : '#7289DA'}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Placeholder Avatar - Gradient Background */}
          <div 
            className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
            style={{
              background: `linear-gradient(135deg, #7289DA 0%, #5B6EAE 100%)`,
            }}
          >
            {user.name.charAt(0)}
          </div>

          {/* Muted Overlay */}
          {user.isMuted && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                WebkitBackdropFilter: 'blur(5px)',
                backdropFilter: 'blur(5px)',
              }}
            >
              <MicOff className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>
      </div>

      {/* Username Label */}
      <div 
        className="px-4 py-2 rounded-full"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          ...blurStyle,
        }}
      >
        <span 
          className="text-white text-sm font-medium"
          style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          {user.name}
        </span>
      </div>
    </div>
  );
};

// ===================================================================
// Timer Circle Component
// ===================================================================
interface TimerCircleProps {
  time: string;
}

const TimerCircle: React.FC<TimerCircleProps> = ({ time }) => {
  return (
    <div 
      className="w-24 h-24 rounded-full flex flex-col items-center justify-center relative"
      style={{
        border: '2px dashed #7289DA',
        background: 'rgba(30, 30, 46, 0.8)',
        WebkitBackdropFilter: 'blur(10px)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Animated Pulse Ring */}
      <div 
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{
          border: '2px solid #7289DA',
        }}
      ></div>

      {/* Timer Display */}
      <div className="text-white text-xl font-bold z-10">{time}</div>
      <div className="text-gray-400 text-xs z-10">مكالمة</div>
    </div>
  );
};

export default VoiceCallRoom;
