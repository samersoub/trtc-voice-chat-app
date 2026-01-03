export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  admin_id: string;
  room_code: string;
  is_active: boolean;
  created_at: string;
  admin?: User;
}

export interface RoomParticipant {
  id: string;
  user_id: string;
  room_id: string;
  mic_status: 'none' | 'requested' | 'granted';
  joined_at: string;
  user?: User;
}

export interface MicRequest {
  id: string;
  user_id: string;
  room_id: string;
  status: 'pending' | 'approved' | 'denied';
  requested_at: string;
  user?: User;
}

export interface VoiceSession {
  roomId: string;
  userId: string;
  hasMic: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
}