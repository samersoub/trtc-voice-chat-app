import { useState, useEffect } from 'react';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Simulate checking for stored user session
    const checkAuthState = async () => {
      try {
        // Simulate a brief loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Only update state if component is still mounted
        if (isMounted) {
          // For demo purposes, start with no user (show login)
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuthState();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Mock login - in real app, this would make API call
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        username: '@johndoe',
        email,
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        bio: 'Voice chat enthusiast',
        level: 25,
        points: 15000,
        rank: 150,
        isVip: false,
        joinDate: 'January 2024',
        location: 'New York, USA',
        isOnline: true,
        lastSeen: 'now',
        coins: {
          gold: 1250,
          silver: 750,
          diamonds: 25,
        },
        stats: {
          friends: 156,
          giftsReceived: 890,
          giftsSent: 456,
          roomsCreated: 12,
          timeInVoiceChat: 450,
          achievements: 18,
        },
      };
      
      setUser(mockUser);
      return mockUser;
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      // Mock registration - in real app, this would make API call
      const mockUser: User = {
        id: '1',
        name,
        username: `@${name.toLowerCase().replace(' ', '')}`,
        email,
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
        bio: 'New to voice chat',
        level: 1,
        points: 0,
        rank: 0,
        isVip: false,
        joinDate: 'Today',
        location: 'Unknown',
        isOnline: true,
        lastSeen: 'now',
        coins: {
          gold: 100,
          silver: 50,
          diamonds: 1,
        },
        stats: {
          friends: 0,
          giftsReceived: 0,
          giftsSent: 0,
          roomsCreated: 0,
          timeInVoiceChat: 0,
          achievements: 0,
        },
      };
      
      setUser(mockUser);
      return mockUser;
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    setUser(null);
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}