import { useState, useEffect } from 'react';
import { VoiceRoom, RoomParticipant } from '../types';

export function useVoiceChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<VoiceRoom | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const joinRoom = async (room: VoiceRoom) => {
    try {
      // In a real app, this would initialize WebRTC/Agora connection
      setCurrentRoom(room);
      setIsConnected(true);
      
      // Mock participants
      const mockParticipants: RoomParticipant[] = [
        {
          id: '1',
          userId: '1',
          userName: 'Room Owner',
          userAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          userLevel: 25,
          isVip: true,
          isMuted: false,
          isSpeaking: true,
          joinTime: new Date().toISOString(),
          role: 'owner',
          permissions: {
            canSpeak: true,
            canInvite: true,
            canKick: true,
            canBan: true,
          },
        },
        {
          id: '2',
          userId: '2',
          userName: 'Emma',
          userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          userLevel: 12,
          isVip: false,
          isMuted: false,
          isSpeaking: false,
          joinTime: new Date().toISOString(),
          role: 'member',
          permissions: {
            canSpeak: true,
            canInvite: false,
            canKick: false,
            canBan: false,
          },
        },
      ];
      
      setParticipants(mockParticipants);
      
      // Simulate audio level monitoring
      const audioInterval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      
      return () => clearInterval(audioInterval);
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  };

  const leaveRoom = async () => {
    try {
      setCurrentRoom(null);
      setIsConnected(false);
      setParticipants([]);
      setIsMuted(false);
      setIsSpeaking(false);
      setAudioLevel(0);
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  };

  const toggleMute = async () => {
    try {
      // In a real app, this would control the microphone
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      throw error;
    }
  };

  const toggleSpeaker = async () => {
    try {
      // In a real app, this would control the speaker
      // For now, we'll just simulate the action
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to toggle speaker:', error);
      throw error;
    }
  };

  const kickParticipant = async (participantId: string) => {
    try {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    } catch (error) {
      console.error('Failed to kick participant:', error);
      throw error;
    }
  };

  const muteParticipant = async (participantId: string) => {
    try {
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, isMuted: true }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to mute participant:', error);
      throw error;
    }
  };

  return {
    isConnected,
    isMuted,
    isSpeaking,
    currentRoom,
    participants,
    audioLevel,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleSpeaker,
    kickParticipant,
    muteParticipant,
  };
}