/**
 * AI Matchmaking System Models
 * Smart pairing algorithm based on user preferences, behavior, and compatibility
 */

export interface UserProfile {
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  interests: string[];
  languages: string[];
  voicePreferences: VoicePreferences;
  personality: PersonalityTraits;
  activity: ActivityPattern;
  preferences: MatchingPreferences;
}

export interface VoicePreferences {
  preferredRoomTypes: string[]; // music, gaming, chat, karaoke, etc.
  preferredRoomSize: 'small' | 'medium' | 'large'; // 2-10, 10-50, 50+
  voiceChatFrequency: number; // minutes per day
  favoriteTimeSlots: string[]; // morning, afternoon, evening, night
  micUsageRate: number; // percentage 0-100
}

export interface PersonalityTraits {
  extroversion: number; // 0-100 (introvert to extrovert)
  openness: number; // 0-100 (conservative to adventurous)
  agreeableness: number; // 0-100 (competitive to cooperative)
  emotionalTone: 'serious' | 'casual' | 'humorous' | 'mixed';
  communicationStyle: 'listener' | 'speaker' | 'balanced';
}

export interface ActivityPattern {
  averageSessionDuration: number; // minutes
  sessionsPerWeek: number;
  peakActivityHours: number[]; // [0-23]
  favoriteFeatures: string[]; // missions, games, events, streaming, etc.
  socialEngagement: number; // 0-100 (solo to highly social)
}

export interface MatchingPreferences {
  genderPreference?: 'male' | 'female' | 'any';
  ageRange?: { min: number; max: number };
  levelRange?: { min: number; max: number };
  languageMatch: 'strict' | 'flexible' | 'any';
  personalityMatch: 'similar' | 'complementary' | 'any';
  distancePreference?: 'local' | 'regional' | 'global'; // based on timezone
  premiumOnly?: boolean;
}

export interface MatchResult {
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  compatibilityScore: number; // 0-100
  matchReasons: string[]; // ["Similar interests: Music, Gaming", "Compatible personality", etc.]
  commonInterests: string[];
  complementaryTraits: string[];
  suggestedActivity?: string; // "Join a voice room", "Start a family together", etc.
  estimatedChemistry: 'low' | 'medium' | 'high' | 'excellent';
}

export interface MatchingSession {
  id: string;
  userId: string;
  timestamp: number;
  criteria: MatchingPreferences;
  results: MatchResult[];
  acceptedMatches: string[]; // userIds
  rejectedMatches: string[]; // userIds
  status: 'searching' | 'completed' | 'expired';
  expiresAt: number;
}

export interface MatchingAlgorithmConfig {
  interestWeight: number; // 0-1
  personalityWeight: number; // 0-1
  activityWeight: number; // 0-1
  languageWeight: number; // 0-1
  levelWeight: number; // 0-1
  premiumBoost: number; // 0-1 (boost for premium users)
  minCompatibilityScore: number; // 0-100
  maxResultsCount: number; // max matches to return
}

export interface MatchFeedback {
  sessionId: string;
  userId: string;
  matchedUserId: string;
  rating: number; // 1-5 stars
  feedback?: string;
  successfulInteraction: boolean; // did they actually chat/join room together
  timestamp: number;
}

export interface AIInsight {
  userId: string;
  insightType: 'personality' | 'activity' | 'compatibility' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-100
  timestamp: number;
}

export interface SmartRecommendation {
  type: 'user' | 'room' | 'event' | 'family' | 'content';
  targetId: string;
  reason: string;
  score: number; // 0-100
  category: string;
}

export interface MatchingStatistics {
  totalMatches: number;
  successfulMatches: number;
  averageCompatibility: number;
  averageResponseTime: number; // seconds
  topMatchCategories: { category: string; count: number }[];
  peakMatchingHours: number[];
  userSatisfaction: number; // 0-100
}

// ML Model data structures
export interface TrainingData {
  userId: string;
  interactions: UserInteraction[];
  preferences: UserProfile;
  outcomes: MatchOutcome[];
}

export interface UserInteraction {
  type: 'message' | 'voice_call' | 'room_join' | 'gift_sent' | 'friend_add';
  targetUserId: string;
  timestamp: number;
  duration?: number; // for calls/rooms
  rating?: number; // user satisfaction
}

export interface MatchOutcome {
  matchedUserId: string;
  compatibilityScore: number;
  actualInteraction: boolean;
  interactionQuality: number; // 0-100
  duration: number; // seconds
  followUpInteractions: number; // did they interact again?
}

export const DEFAULT_ALGORITHM_CONFIG: MatchingAlgorithmConfig = {
  interestWeight: 0.25,
  personalityWeight: 0.20,
  activityWeight: 0.15,
  languageWeight: 0.15,
  levelWeight: 0.10,
  premiumBoost: 0.15,
  minCompatibilityScore: 60,
  maxResultsCount: 20,
};

export const PERSONALITY_TRAITS_QUESTIONS = [
  {
    trait: 'extroversion',
    question: 'I enjoy meeting new people in voice rooms',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    trait: 'openness',
    question: 'I like trying new features and activities',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    trait: 'agreeableness',
    question: 'I prefer cooperative activities over competitive ones',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
];

export const INTEREST_CATEGORIES = [
  'Music',
  'Gaming',
  'Technology',
  'Sports',
  'Movies',
  'Books',
  'Travel',
  'Food',
  'Fashion',
  'Art',
  'Science',
  'Education',
  'Business',
  'Fitness',
  'Photography',
  'Comedy',
  'Anime',
  'Politics',
  'Nature',
  'Pets',
];
