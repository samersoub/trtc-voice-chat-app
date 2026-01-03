/**
 * Room Themes Service
 * Manages room customization themes
 */

export interface RoomTheme {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  price: number;
  isPremium: boolean;
  isActive: boolean;
  category: 'classic' | 'modern' | 'luxury' | 'seasonal';
  background: {
    type: 'gradient' | 'image' | 'video';
    value: string;
    overlay?: string;
  };
  seatLayout: '4x5' | '3x6' | '2x10' | 'circle';
  effects: {
    entranceEffect: 'fireworks' | 'confetti' | 'sparkles' | 'none';
    giftAnimation: 'float' | 'explosion' | 'cascade' | 'spin';
    messageStyle: 'bubble' | 'flat' | 'neon';
  };
  musicBackground?: {
    enabled: boolean;
    volume: number;
    url?: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
}

class RoomThemesServiceClass {
  private readonly STORAGE_KEY = 'room_themes';
  private readonly ACTIVE_THEME_KEY = 'active_room_theme';

  /**
   * Get all available themes
   */
  getAllThemes(): RoomTheme[] {
    return [
      {
        id: 'classic',
        name: 'كلاسيكي',
        nameEn: 'Classic',
        description: 'التصميم الافتراضي الأنيق',
        price: 0,
        isPremium: false,
        isActive: true,
        category: 'classic',
        background: {
          type: 'gradient',
          value: 'from-purple-900 via-purple-800 to-indigo-900'
        },
        seatLayout: '4x5',
        effects: {
          entranceEffect: 'none',
          giftAnimation: 'float',
          messageStyle: 'bubble'
        },
        colors: {
          primary: '#8b5cf6',
          secondary: '#6366f1',
          accent: '#ec4899',
          text: '#ffffff'
        }
      },
      {
        id: 'coffee_shop',
        name: 'مقهى عربي',
        nameEn: 'Coffee Shop',
        description: 'أجواء دافئة وهادئة',
        price: 500,
        isPremium: false,
        isActive: false,
        category: 'modern',
        background: {
          type: 'image',
          value: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
          overlay: 'bg-black/50'
        },
        seatLayout: '3x6',
        effects: {
          entranceEffect: 'sparkles',
          giftAnimation: 'float',
          messageStyle: 'flat'
        },
        musicBackground: {
          enabled: true,
          volume: 30,
          url: 'coffee_ambient.mp3'
        },
        colors: {
          primary: '#92400e',
          secondary: '#78350f',
          accent: '#f59e0b',
          text: '#fef3c7'
        }
      },
      {
        id: 'neon_party',
        name: 'حفلة نيون',
        nameEn: 'Neon Party',
        description: 'أضواء ملونة وطاقة عالية',
        price: 1000,
        isPremium: true,
        isActive: false,
        category: 'modern',
        background: {
          type: 'gradient',
          value: 'from-pink-500 via-purple-500 to-blue-500',
          overlay: 'bg-black/30'
        },
        seatLayout: 'circle',
        effects: {
          entranceEffect: 'fireworks',
          giftAnimation: 'explosion',
          messageStyle: 'neon'
        },
        musicBackground: {
          enabled: true,
          volume: 50,
          url: 'party_music.mp3'
        },
        colors: {
          primary: '#ec4899',
          secondary: '#8b5cf6',
          accent: '#3b82f6',
          text: '#ffffff'
        }
      },
      {
        id: 'flower_garden',
        name: 'حديقة زهور',
        nameEn: 'Flower Garden',
        description: 'طبيعة خلابة وهادئة',
        price: 750,
        isPremium: false,
        isActive: false,
        category: 'classic',
        background: {
          type: 'image',
          value: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200',
          overlay: 'bg-black/40'
        },
        seatLayout: '4x5',
        effects: {
          entranceEffect: 'sparkles',
          giftAnimation: 'cascade',
          messageStyle: 'bubble'
        },
        colors: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#f472b6',
          text: '#ffffff'
        }
      },
      {
        id: 'luxury_gold',
        name: 'الذهبي الفاخر',
        nameEn: 'Luxury Gold',
        description: 'فخامة لا مثيل لها',
        price: 2000,
        isPremium: true,
        isActive: false,
        category: 'luxury',
        background: {
          type: 'gradient',
          value: 'from-yellow-600 via-amber-600 to-orange-600',
          overlay: 'bg-black/20'
        },
        seatLayout: '3x6',
        effects: {
          entranceEffect: 'fireworks',
          giftAnimation: 'explosion',
          messageStyle: 'neon'
        },
        colors: {
          primary: '#f59e0b',
          secondary: '#d97706',
          accent: '#fbbf24',
          text: '#ffffff'
        }
      },
      {
        id: 'ocean_breeze',
        name: 'نسيم البحر',
        nameEn: 'Ocean Breeze',
        description: 'هدوء الأمواج ونقاء البحر',
        price: 800,
        isPremium: false,
        isActive: false,
        category: 'classic',
        background: {
          type: 'image',
          value: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200',
          overlay: 'bg-black/30'
        },
        seatLayout: '4x5',
        effects: {
          entranceEffect: 'sparkles',
          giftAnimation: 'cascade',
          messageStyle: 'bubble'
        },
        musicBackground: {
          enabled: true,
          volume: 25,
          url: 'ocean_waves.mp3'
        },
        colors: {
          primary: '#0ea5e9',
          secondary: '#0284c7',
          accent: '#06b6d4',
          text: '#ffffff'
        }
      },
      {
        id: 'starry_night',
        name: 'ليلة نجمية',
        nameEn: 'Starry Night',
        description: 'سماء مليئة بالنجوم',
        price: 1500,
        isPremium: true,
        isActive: false,
        category: 'luxury',
        background: {
          type: 'gradient',
          value: 'from-indigo-950 via-purple-950 to-black'
        },
        seatLayout: '2x10',
        effects: {
          entranceEffect: 'sparkles',
          giftAnimation: 'float',
          messageStyle: 'neon'
        },
        colors: {
          primary: '#6366f1',
          secondary: '#4f46e5',
          accent: '#818cf8',
          text: '#ffffff'
        }
      },
      {
        id: 'cherry_blossom',
        name: 'زهر الكرز',
        nameEn: 'Cherry Blossom',
        description: 'ربيع ياباني ساحر',
        price: 900,
        isPremium: false,
        isActive: false,
        category: 'seasonal',
        background: {
          type: 'image',
          value: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200',
          overlay: 'bg-pink-900/40'
        },
        seatLayout: '4x5',
        effects: {
          entranceEffect: 'confetti',
          giftAnimation: 'cascade',
          messageStyle: 'bubble'
        },
        colors: {
          primary: '#f472b6',
          secondary: '#ec4899',
          accent: '#fbbf24',
          text: '#ffffff'
        }
      }
    ];
  }

  /**
   * Purchase and activate theme
   */
  purchaseTheme(userId: string, themeId: string, userCoins: number): { success: boolean; message: string } {
    const theme = this.getAllThemes().find(t => t.id === themeId);
    if (!theme) {
      return { success: false, message: 'الثيم غير موجود' };
    }

    if (theme.price === 0) {
      // Free theme
      this.activateTheme(userId, themeId);
      return { success: true, message: 'تم تفعيل الثيم بنجاح' };
    }

    if (userCoins < theme.price) {
      return { success: false, message: 'عملات غير كافية' };
    }

    // Save purchase
    const purchased = this.getPurchasedThemes(userId);
    if (!purchased.includes(themeId)) {
      purchased.push(themeId);
      localStorage.setItem(`purchased_themes_${userId}`, JSON.stringify(purchased));
    }

    this.activateTheme(userId, themeId);
    return { success: true, message: `تم شراء وتفعيل ${theme.name} بنجاح` };
  }

  /**
   * Activate theme (with Supabase sync)
   */
  async activateTheme(userId: string, themeId: string, roomId?: string): Promise<void> {
    // Save to localStorage first (for immediate feedback)
    const storageKey = roomId 
      ? `${this.ACTIVE_THEME_KEY}_${userId}_${roomId}`
      : `${this.ACTIVE_THEME_KEY}_${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(themeId));

    // Sync to Supabase if available
    try {
      const { supabase, isSupabaseReady } = await import('@/services/db/supabaseClient');
      
      if (isSupabaseReady && supabase) {
        // Upsert user theme preference
        const { error } = await supabase
          .from('user_room_themes')
          .upsert({
            user_id: userId,
            theme_id: themeId,
            room_id: roomId || null,
            is_active: true,
            activated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,room_id'
          });

        if (error) {
          console.error('Failed to sync theme to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing theme:', error);
      // Continue with localStorage only (graceful degradation)
    }
  }

  /**
   * Get active theme (from Supabase or localStorage)
   */
  async getActiveThemeAsync(userId: string, roomId?: string): Promise<RoomTheme> {
    try {
      const { supabase, isSupabaseReady } = await import('@/services/db/supabaseClient');
      
      if (isSupabaseReady && supabase) {
        const { data, error } = await supabase
          .from('user_room_themes')
          .select('theme_id')
          .eq('user_id', userId)
          .eq('room_id', roomId || null)
          .eq('is_active', true)
          .single();

        if (!error && data) {
          const theme = this.getAllThemes().find(t => t.id === data.theme_id);
          if (theme) return theme;
        }
      }
    } catch (error) {
      console.error('Error fetching theme from Supabase:', error);
    }

    // Fallback to localStorage
    return this.getActiveTheme(userId, roomId);
  }

  /**
   * Get active theme (localStorage only - sync method)
   */
  getActiveTheme(userId: string, roomId?: string): RoomTheme {
    const storageKey = roomId 
      ? `${this.ACTIVE_THEME_KEY}_${userId}_${roomId}`
      : `${this.ACTIVE_THEME_KEY}_${userId}`;
    
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const themeId = JSON.parse(saved);
      const theme = this.getAllThemes().find(t => t.id === themeId);
      if (theme) return theme;
    }
    return this.getAllThemes()[0]; // Default classic theme
  }

  /**
   * Get purchased themes
   */
  getPurchasedThemes(userId: string): string[] {
    const data = localStorage.getItem(`purchased_themes_${userId}`);
    return data ? JSON.parse(data) : ['classic']; // Classic is always owned
  }

  /**
   * Check if user owns theme
   */
  ownsTheme(userId: string, themeId: string): boolean {
    const theme = this.getAllThemes().find(t => t.id === themeId);
    if (!theme) return false;
    if (theme.price === 0) return true; // Free theme
    return this.getPurchasedThemes(userId).includes(themeId);
  }
}

export const RoomThemesService = new RoomThemesServiceClass();
