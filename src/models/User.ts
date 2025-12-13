export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  
  // Profile Information
  username?: string;
  bio?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  
  // Social & Gaming
  level?: number;
  followers?: string[];
  following?: string[];
  interests?: string[];
  
  // Status
  isOnline?: boolean;
  lastSeen?: Date;
  verified?: boolean;
  isPremium?: boolean;
  
  // Location
  location?: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
}