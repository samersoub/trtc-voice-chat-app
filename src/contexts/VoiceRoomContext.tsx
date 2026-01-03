import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { useTrtc, RemoteStreamItem } from '@/hooks/useTrtc';
import { useLocation, useNavigate } from 'react-router-dom';

interface VoiceRoomContextType {
    // State
    currentRoomId: string | null;
    isJoined: boolean;
    isMinimized: boolean;
    localStream: any;
    remoteStreams: RemoteStreamItem[];

    // Actions
    joinRoom: (roomId: string, userId?: string) => Promise<void>;
    leaveRoom: () => Promise<void>;
    minimize: () => void;
    maximize: () => void;
    toggleMic: () => void;
    isMicOn: boolean;
}

const VoiceRoomContext = createContext<VoiceRoomContextType | undefined>(undefined);

export const VoiceRoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const trtc = useTrtc();
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Automatically minimize if navigating away from the room page while connected
    useEffect(() => {
        if (trtc.joined && currentRoomId) {
            const isRoomPage = location.pathname.startsWith(`/voice/rooms/${currentRoomId}`);
            if (!isRoomPage) {
                setIsMinimized(true);
            } else {
                setIsMinimized(false);
            }
        }
    }, [location.pathname, trtc.joined, currentRoomId]);

    const joinRoom = async (roomId: string, userId?: string) => {
        if (trtc.joined && currentRoomId === roomId) {
            // Already in this room, just ensure we are maximized/navigated
            setIsMinimized(false);
            return;
        }

        if (trtc.joined && currentRoomId !== roomId) {
            // In another room, leave first
            await trtc.leave();
        }

        try {
            await trtc.join(userId, roomId);
            setCurrentRoomId(roomId);
            setIsMinimized(false);
        } catch (error) {
            console.error("Failed to join room via context:", error);
        }
    };

    const leaveRoom = async () => {
        await trtc.leave();
        setCurrentRoomId(null);
        setIsMinimized(false);
    };

    const minimize = () => {
        setIsMinimized(true);
        // You might want to navigate home or back, but typically minimize 
        // just changes the UI state while the user navigates themselves.
        // For now, let's assume the user clicked "back" to trigger this, 
        // or we provide a button that navigates them away.
        if (location.pathname.includes('/voice/rooms/')) {
            navigate('/home');
        }
    };

    const maximize = () => {
        if (currentRoomId) {
            setIsMinimized(false);
            navigate(`/voice/rooms/${currentRoomId}/join`);
        }
    };

    const toggleMic = () => {
        trtc.toggleAudio();
    };

    return (
        <VoiceRoomContext.Provider
            value={{
                currentRoomId,
                isJoined: trtc.joined,
                isMinimized,
                localStream: trtc.localStream,
                remoteStreams: trtc.remoteStreams,
                joinRoom,
                leaveRoom,
                minimize,
                maximize,
                toggleMic,
                isMicOn: trtc.isAudioEnabled
            }}
        >
            {children}
        </VoiceRoomContext.Provider>
    );
};

export const useVoiceRoom = () => {
    const context = useContext(VoiceRoomContext);
    if (!context) {
        throw new Error('useVoiceRoom must be used within a VoiceRoomProvider');
    }
    return context;
};
