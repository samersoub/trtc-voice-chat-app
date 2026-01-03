import React from 'react';
import { useVoiceRoom } from '@/contexts/VoiceRoomContext';
import { X, Maximize2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MiniPlayer: React.FC = () => {
    const {
        isJoined,
        isMinimized,
        currentRoomId,
        leaveRoom,
        maximize,
        // toggleMic // TODO: Expose mic state from context to show correct icon
    } = useVoiceRoom();

    // Only show if joined and minimized (not on the room page)
    if (!isJoined || !isMinimized || !currentRoomId) {
        return null;
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center justify-between">

                {/* Info Section */}
                <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={maximize}
                >
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
                            <span className="text-white text-xs">LIVE</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    </div>

                    <div className="flex flex-col">
                        <h3 className="text-white text-sm font-bold truncate max-w-[150px]">
                            Room #{currentRoomId}
                        </h3>
                        <p className="text-white/60 text-xs">Click to return</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    {/* Mic Toggle (Placeholder) */}
                    {/* <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-white/80 hover:bg-white/10">
            <Mic className="h-4 w-4" />
          </Button> */}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-white/80 hover:bg-white/10"
                        onClick={maximize}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-red-500/80 hover:bg-red-500/10 hover:text-red-500"
                        onClick={leaveRoom}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MiniPlayer;
