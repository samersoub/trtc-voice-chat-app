/**
 * Video Chat Models
 * 1-on-1 and group video calling system
 */

export interface VideoCall {
  id: string;
  type: '1-on-1' | 'group';
  roomId: string;
  hostId: string;
  participants: VideoCallParticipant[];
  status: 'waiting' | 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  startedAt: number;
  endedAt?: number;
  duration?: number; // seconds
  settings: VideoCallSettings;
  recording?: VideoCallRecording;
  quality: VideoQuality;
}

export interface VideoCallParticipant {
  userId: string;
  username: string;
  avatar?: string;
  role: 'host' | 'participant';
  status: 'joining' | 'connected' | 'disconnected' | 'muted' | 'video_off';
  joinedAt: number;
  leftAt?: number;
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenSharing: boolean;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
  networkStats: NetworkStats;
}

export interface VideoCallSettings {
  maxParticipants: number;
  allowScreenSharing: boolean;
  allowRecording: boolean;
  requireApproval: boolean; // host must approve joins
  muteOnJoin: boolean;
  cameraOffOnJoin: boolean;
  allowChat: boolean;
  backgroundBlurEnabled: boolean;
  noiseCancellation: boolean;
  echoCancellation: boolean;
}

export interface VideoQuality {
  resolution: '360p' | '480p' | '720p' | '1080p';
  fps: 15 | 24 | 30 | 60;
  bitrate: number; // kbps
  codec: 'H264' | 'VP8' | 'VP9';
}

export interface NetworkStats {
  latency: number; // ms
  jitter: number; // ms
  packetLoss: number; // percentage
  bandwidth: number; // kbps
  lastUpdated: number;
}

export interface VideoCallRecording {
  id: string;
  startedAt: number;
  endedAt?: number;
  duration: number;
  size: number; // bytes
  url?: string;
  format: 'mp4' | 'webm';
  quality: VideoQuality;
  downloadable: boolean;
}

export interface CallInvitation {
  id: string;
  callId: string;
  fromUserId: string;
  fromUsername: string;
  fromAvatar?: string;
  toUserId: string;
  type: '1-on-1' | 'group';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  sentAt: number;
  expiresAt: number;
  respondedAt?: number;
}

export interface CallHistory {
  id: string;
  callId: string;
  type: '1-on-1' | 'group';
  participants: {
    userId: string;
    username: string;
    avatar?: string;
  }[];
  duration: number;
  status: 'completed' | 'missed' | 'declined';
  timestamp: number;
  recording?: string; // URL
}

export interface VideoEffect {
  id: string;
  name: string;
  type: 'background' | 'filter' | 'sticker' | 'avatar';
  thumbnail: string;
  premium: boolean;
  category: string;
}

export interface BackgroundEffect {
  id: string;
  type: 'blur' | 'image' | 'video' | 'virtual';
  name: string;
  url?: string; // for image/video backgrounds
  thumbnail: string;
  premium: boolean;
}

export interface VideoFilter {
  id: string;
  name: string;
  intensity: number; // 0-100
  settings: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    blur?: number;
  };
  premium: boolean;
}

export interface ScreenShareOptions {
  screenId?: string;
  audio: boolean; // share system audio
  cursor: 'always' | 'motion' | 'never';
  resolution: '720p' | '1080p' | '4K';
  fps: 15 | 30 | 60;
}

export interface VideoLayout {
  type: 'grid' | 'speaker' | 'sidebar' | 'picture-in-picture';
  speakerId?: string; // for speaker layout
  sidebarPosition?: 'left' | 'right'; // for sidebar layout
  gridColumns?: number;
  pipPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface VideoCallStats {
  totalCalls: number;
  totalDuration: number; // seconds
  averageDuration: number; // seconds
  missedCalls: number;
  completedCalls: number;
  oneOnOneCalls: number;
  groupCalls: number;
  totalParticipants: number;
  averageParticipants: number;
  recordedCalls: number;
  totalRecordingSize: number; // bytes
}

export interface VideoCallControls {
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenSharing: boolean;
  recording: boolean;
  chatVisible: boolean;
  participantsVisible: boolean;
  settingsVisible: boolean;
  fullscreen: boolean;
  pinned?: string; // userId of pinned participant
}

export interface VideoMessage {
  id: string;
  callId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'text' | 'emoji' | 'reaction';
}

export const DEFAULT_VIDEO_SETTINGS: VideoCallSettings = {
  maxParticipants: 8,
  allowScreenSharing: true,
  allowRecording: false,
  requireApproval: false,
  muteOnJoin: false,
  cameraOffOnJoin: false,
  allowChat: true,
  backgroundBlurEnabled: false,
  noiseCancellation: true,
  echoCancellation: true,
};

export const VIDEO_QUALITY_PRESETS = {
  low: {
    resolution: '360p' as const,
    fps: 15 as const,
    bitrate: 300,
    codec: 'H264' as const,
  },
  medium: {
    resolution: '480p' as const,
    fps: 24 as const,
    bitrate: 500,
    codec: 'H264' as const,
  },
  high: {
    resolution: '720p' as const,
    fps: 30 as const,
    bitrate: 1200,
    codec: 'H264' as const,
  },
  ultra: {
    resolution: '1080p' as const,
    fps: 30 as const,
    bitrate: 2500,
    codec: 'H264' as const,
  },
};

export const BACKGROUND_EFFECTS: BackgroundEffect[] = [
  {
    id: 'blur',
    type: 'blur',
    name: 'Blur Background',
    thumbnail: '/effects/blur.png',
    premium: false,
  },
  {
    id: 'office',
    type: 'image',
    name: 'Modern Office',
    url: '/backgrounds/office.jpg',
    thumbnail: '/backgrounds/office-thumb.jpg',
    premium: false,
  },
  {
    id: 'beach',
    type: 'image',
    name: 'Tropical Beach',
    url: '/backgrounds/beach.jpg',
    thumbnail: '/backgrounds/beach-thumb.jpg',
    premium: true,
  },
  {
    id: 'space',
    type: 'video',
    name: 'Space Station',
    url: '/backgrounds/space.mp4',
    thumbnail: '/backgrounds/space-thumb.jpg',
    premium: true,
  },
];

export const VIDEO_FILTERS: VideoFilter[] = [
  {
    id: 'natural',
    name: 'Natural',
    intensity: 50,
    settings: { brightness: 10, contrast: 5 },
    premium: false,
  },
  {
    id: 'warm',
    name: 'Warm',
    intensity: 60,
    settings: { brightness: 15, saturation: 10, hue: 5 },
    premium: false,
  },
  {
    id: 'cool',
    name: 'Cool',
    intensity: 60,
    settings: { brightness: 5, saturation: -5, hue: -10 },
    premium: false,
  },
  {
    id: 'vintage',
    name: 'Vintage',
    intensity: 70,
    settings: { contrast: 15, saturation: -20, brightness: -5 },
    premium: true,
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    intensity: 80,
    settings: { contrast: 20, saturation: 15, brightness: -10 },
    premium: true,
  },
];
