import React from 'react';
import { Armchair } from 'lucide-react';

interface SeatUser {
  id: number;
  name: string;
  avatar: string;
  isActive?: boolean;
  hasGoldenFrame?: boolean;
}

interface VoiceRoomGridProps {
  className?: string;
}

const VoiceRoomGrid: React.FC<VoiceRoomGridProps> = ({ className = '' }) => {
  // Top row: 5 users
  const topRowSeats: SeatUser[] = [
    { id: 1, name: 'Mason', avatar: 'https://i.pravatar.cc/150?img=12', isActive: true },
    { id: 2, name: 'Sophia', avatar: 'https://i.pravatar.cc/150?img=47', isActive: false },
    { id: 3, name: 'Charlotte', avatar: 'https://i.pravatar.cc/150?img=45', isActive: false },
    { id: 4, name: 'Ava', avatar: 'https://i.pravatar.cc/150?img=44', isActive: true, hasGoldenFrame: true },
    { id: 5, name: 'Ryan', avatar: 'https://i.pravatar.cc/150?img=13', isActive: false },
  ];

  // Bottom row: 1 user + 4 empty seats
  const bottomRowSeats: (SeatUser | null)[] = [
    { id: 6, name: 'Aby', avatar: 'https://i.pravatar.cc/150?img=48', isActive: true },
    null, // Empty seat 7
    null, // Empty seat 8
    null, // Empty seat 9
    null, // Empty seat 10
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 ${className}`}>
      <div className="grid grid-cols-5 gap-x-2 gap-y-6">
        {/* Top Row - 5 Users */}
        {topRowSeats.map((user) => (
          <OccupiedSeat key={user.id} user={user} />
        ))}

        {/* Bottom Row - 1 User + 4 Empty Seats */}
        {bottomRowSeats.map((user, index) => {
          if (user) {
            return <OccupiedSeat key={user.id} user={user} />;
          }
          return <EmptySeat key={`empty-${index + 7}`} seatNumber={index + 7} />;
        })}
      </div>
    </div>
  );
};

const OccupiedSeat: React.FC<{ user: SeatUser }> = ({ user }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Avatar Container */}
      <div className="relative w-full aspect-square mb-2">
        {/* Golden Frame Overlay (only for Ava) */}
        {user.hasGoldenFrame && (
          <div className="absolute inset-0 -m-1 rounded-full border-[3px] border-transparent bg-gradient-to-br from-yellow-400 via-yellow-200 to-yellow-600 animate-pulse" 
               style={{ 
                 padding: '3px',
                 WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                 WebkitMaskComposite: 'xor',
                 maskComposite: 'exclude'
               }}
          >
            <div className="absolute inset-0 rounded-full border-2 border-yellow-500/50"></div>
          </div>
        )}

        {/* Avatar Image */}
        <img
          src={user.avatar}
          alt={user.name}
          className={`w-full h-full rounded-full object-cover ${
            user.isActive ? 'border-2 border-pink-500' : 'border-2 border-white/20'
          }`}
        />

        {/* Active Speaker Ring Animation */}
        {user.isActive && (
          <div className="absolute inset-0 rounded-full border-2 border-pink-500 animate-ping opacity-75"></div>
        )}
      </div>

      {/* Name (Outside and Below) */}
      <p className="text-xs text-white font-medium text-center truncate w-full">
        {user.name}
      </p>
    </div>
  );
};

const EmptySeat: React.FC<{ seatNumber: number }> = ({ seatNumber }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Empty Seat Circle */}
      <div className="relative w-full aspect-square mb-2">
        <div className="w-full h-full rounded-full bg-slate-800/50 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center">
          {/* Sofa Icon - Top Half */}
          <div className="flex-1 flex items-end pb-1">
            <Armchair className="w-8 h-8 text-slate-500" strokeWidth={1.5} />
          </div>

          {/* Seat Number - Bottom Half (Inside Circle) */}
          <div className="flex-1 flex items-start pt-1">
            <span className="text-sm text-slate-400 font-medium">
              {seatNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRoomGrid;
