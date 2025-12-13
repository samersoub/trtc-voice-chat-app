/**
 * Voice Effects Service
 * Manages voice filters and audio effects
 */

export interface VoiceEffect {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  isPremium: boolean;
  price: number;
  category: 'filter' | 'equalizer' | 'spatial';
  settings: {
    pitch?: number;
    reverb?: number;
    echo?: number;
    speed?: number;
  };
}

export interface EqualizerPreset {
  id: string;
  name: string;
  nameEn: string;
  bands: {
    '60Hz': number;
    '170Hz': number;
    '310Hz': number;
    '600Hz': number;
    '1kHz': number;
    '3kHz': number;
    '6kHz': number;
    '12kHz': number;
    '14kHz': number;
    '16kHz': number;
  };
}

export interface SpatialAudioSettings {
  enabled: boolean;
  mode: '3d' | 'surround' | 'stereo';
  roomSize: 'small' | 'medium' | 'large';
  distance: number; // 0-100
}

class VoiceEffectsServiceClass {
  private readonly STORAGE_KEY = 'voice_effects';
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  /**
   * Get all available voice effects
   */
  getAllEffects(): VoiceEffect[] {
    return [
      {
        id: 'normal',
        name: 'عادي',
        nameEn: 'Normal',
        icon: '🎙️',
        description: 'الصوت الطبيعي بدون تأثيرات',
        isPremium: false,
        price: 0,
        category: 'filter',
        settings: {}
      },
      {
        id: 'echo',
        name: 'صدى',
        nameEn: 'Echo',
        icon: '🔊',
        description: 'إضافة صدى للصوت',
        isPremium: false,
        price: 200,
        category: 'filter',
        settings: {
          echo: 0.5,
          reverb: 0.3
        }
      },
      {
        id: 'robot',
        name: 'روبوت',
        nameEn: 'Robot',
        icon: '🤖',
        description: 'صوت آلي مستقبلي',
        isPremium: true,
        price: 500,
        category: 'filter',
        settings: {
          pitch: -0.3,
          speed: 0.9
        }
      },
      {
        id: 'alien',
        name: 'فضائي',
        nameEn: 'Alien',
        icon: '👽',
        description: 'صوت غريب من الفضاء',
        isPremium: true,
        price: 500,
        category: 'filter',
        settings: {
          pitch: 0.5,
          reverb: 0.7
        }
      },
      {
        id: 'deep',
        name: 'عميق',
        nameEn: 'Deep',
        icon: '🎵',
        description: 'صوت عميق وقوي',
        isPremium: false,
        price: 300,
        category: 'filter',
        settings: {
          pitch: -0.2
        }
      },
      {
        id: 'chipmunk',
        name: 'سنجاب',
        nameEn: 'Chipmunk',
        icon: '🐿️',
        description: 'صوت عالي ومضحك',
        isPremium: false,
        price: 200,
        category: 'filter',
        settings: {
          pitch: 0.4,
          speed: 1.2
        }
      },
      {
        id: 'radio',
        name: 'راديو',
        nameEn: 'Radio',
        icon: '📻',
        description: 'صوت راديو قديم',
        isPremium: true,
        price: 400,
        category: 'filter',
        settings: {
          reverb: 0.2
        }
      },
      {
        id: 'concert_hall',
        name: 'قاعة حفلات',
        nameEn: 'Concert Hall',
        icon: '🎭',
        description: 'صدى قاعة كبيرة',
        isPremium: true,
        price: 600,
        category: 'spatial',
        settings: {
          reverb: 0.8,
          echo: 0.6
        }
      }
    ];
  }

  /**
   * Get equalizer presets
   */
  getEqualizerPresets(): EqualizerPreset[] {
    return [
      {
        id: 'flat',
        name: 'مسطح',
        nameEn: 'Flat',
        bands: {
          '60Hz': 0,
          '170Hz': 0,
          '310Hz': 0,
          '600Hz': 0,
          '1kHz': 0,
          '3kHz': 0,
          '6kHz': 0,
          '12kHz': 0,
          '14kHz': 0,
          '16kHz': 0
        }
      },
      {
        id: 'bass_boost',
        name: 'تعزيز الجهير',
        nameEn: 'Bass Boost',
        bands: {
          '60Hz': 8,
          '170Hz': 6,
          '310Hz': 4,
          '600Hz': 2,
          '1kHz': 0,
          '3kHz': 0,
          '6kHz': 0,
          '12kHz': 0,
          '14kHz': 0,
          '16kHz': 0
        }
      },
      {
        id: 'treble_boost',
        name: 'تعزيز الحاد',
        nameEn: 'Treble Boost',
        bands: {
          '60Hz': 0,
          '170Hz': 0,
          '310Hz': 0,
          '600Hz': 0,
          '1kHz': 2,
          '3kHz': 4,
          '6kHz': 6,
          '12kHz': 8,
          '14kHz': 8,
          '16kHz': 8
        }
      },
      {
        id: 'voice_enhance',
        name: 'تحسين الصوت',
        nameEn: 'Voice Enhance',
        bands: {
          '60Hz': -2,
          '170Hz': 0,
          '310Hz': 2,
          '600Hz': 4,
          '1kHz': 6,
          '3kHz': 4,
          '6kHz': 2,
          '12kHz': 0,
          '14kHz': -2,
          '16kHz': -2
        }
      },
      {
        id: 'rock',
        name: 'روك',
        nameEn: 'Rock',
        bands: {
          '60Hz': 6,
          '170Hz': 4,
          '310Hz': 2,
          '600Hz': 0,
          '1kHz': -2,
          '3kHz': 0,
          '6kHz': 4,
          '12kHz': 6,
          '14kHz': 6,
          '16kHz': 6
        }
      },
      {
        id: 'classical',
        name: 'كلاسيكي',
        nameEn: 'Classical',
        bands: {
          '60Hz': 0,
          '170Hz': 0,
          '310Hz': 0,
          '600Hz': 2,
          '1kHz': 4,
          '3kHz': 4,
          '6kHz': 2,
          '12kHz': 0,
          '14kHz': 0,
          '16kHz': 0
        }
      }
    ];
  }

  /**
   * Get active effect
   */
  getActiveEffect(userId: string): VoiceEffect {
    const saved = localStorage.getItem(`${this.STORAGE_KEY}_active_${userId}`);
    if (saved) {
      const effectId = JSON.parse(saved);
      const effect = this.getAllEffects().find(e => e.id === effectId);
      if (effect) return effect;
    }
    return this.getAllEffects()[0]; // Default normal
  }

  /**
   * Purchase effect
   */
  purchaseEffect(userId: string, effectId: string, userCoins: number): { success: boolean; message: string } {
    const effect = this.getAllEffects().find(e => e.id === effectId);
    if (!effect) {
      return { success: false, message: 'التأثير غير موجود' };
    }

    if (effect.price === 0) {
      this.activateEffect(userId, effectId);
      return { success: true, message: 'تم تفعيل التأثير' };
    }

    if (userCoins < effect.price) {
      return { success: false, message: 'عملات غير كافية' };
    }

    // Save purchase
    const purchased = this.getPurchasedEffects(userId);
    if (!purchased.includes(effectId)) {
      purchased.push(effectId);
      localStorage.setItem(`purchased_effects_${userId}`, JSON.stringify(purchased));
    }

    this.activateEffect(userId, effectId);
    return { success: true, message: `تم شراء وتفعيل ${effect.name}` };
  }

  /**
   * Activate effect (with Supabase sync)
   */
  async activateEffect(userId: string, effectId: string): Promise<void> {
    // Save to localStorage first (for immediate feedback)
    localStorage.setItem(`${this.STORAGE_KEY}_active_${userId}`, JSON.stringify(effectId));

    // Sync to Supabase if available
    try {
      const { supabase, isSupabaseReady } = await import('@/services/db/supabaseClient');
      
      if (isSupabaseReady && supabase) {
        // Upsert user voice effect preference
        const { error } = await supabase
          .from('user_voice_effects')
          .upsert({
            user_id: userId,
            effect_id: effectId,
            is_active: true,
            activated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('Failed to sync voice effect to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing voice effect:', error);
      // Continue with localStorage only (graceful degradation)
    }
  }

  /**
   * Get active effect (from Supabase or localStorage)
   */
  async getActiveEffectAsync(userId: string): Promise<VoiceEffect | null> {
    try {
      const { supabase, isSupabaseReady } = await import('@/services/db/supabaseClient');
      
      if (isSupabaseReady && supabase) {
        const { data, error } = await supabase
          .from('user_voice_effects')
          .select('effect_id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (!error && data) {
          const effect = this.getAllEffects().find(e => e.id === data.effect_id);
          if (effect) return effect;
        }
      }
    } catch (error) {
      console.error('Error fetching voice effect from Supabase:', error);
    }

    // Fallback to localStorage
    return this.getActiveEffect(userId);
  }

  /**
   * Get purchased effects
   */
  getPurchasedEffects(userId: string): string[] {
    const data = localStorage.getItem(`purchased_effects_${userId}`);
    return data ? JSON.parse(data) : ['normal']; // Normal is always owned
  }

  /**
   * Check if user owns effect
   */
  ownsEffect(userId: string, effectId: string): boolean {
    const effect = this.getAllEffects().find(e => e.id === effectId);
    if (!effect) return false;
    if (effect.price === 0) return true;
    return this.getPurchasedEffects(userId).includes(effectId);
  }

  /**
   * Get active equalizer preset
   */
  getActiveEqualizerPreset(userId: string): EqualizerPreset {
    const saved = localStorage.getItem(`${this.STORAGE_KEY}_equalizer_${userId}`);
    if (saved) {
      const presetId = JSON.parse(saved);
      const preset = this.getEqualizerPresets().find(p => p.id === presetId);
      if (preset) return preset;
    }
    return this.getEqualizerPresets()[0]; // Default flat
  }

  /**
   * Set equalizer preset
   */
  setEqualizerPreset(userId: string, presetId: string): void {
    localStorage.setItem(`${this.STORAGE_KEY}_equalizer_${userId}`, JSON.stringify(presetId));
  }

  /**
   * Get spatial audio settings
   */
  getSpatialAudioSettings(userId: string): SpatialAudioSettings {
    const saved = localStorage.getItem(`${this.STORAGE_KEY}_spatial_${userId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      enabled: false,
      mode: 'stereo',
      roomSize: 'medium',
      distance: 50
    };
  }

  /**
   * Update spatial audio settings
   */
  updateSpatialAudioSettings(userId: string, settings: Partial<SpatialAudioSettings>): void {
    const current = this.getSpatialAudioSettings(userId);
    const updated = { ...current, ...settings };
    localStorage.setItem(`${this.STORAGE_KEY}_spatial_${userId}`, JSON.stringify(updated));
  }

  /**
   * Apply effect to audio stream (Web Audio API)
   */
  applyEffect(stream: MediaStream, effect: VoiceEffect): MediaStream {
    try {
      // Initialize audio context
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      // Create source from stream
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);

      // Create destination
      const destination = this.audioContext.createMediaStreamDestination();

      // Create processing chain
      let currentNode: AudioNode = this.sourceNode;

      // 1. Apply Pitch/Speed (using playback rate)
      if (effect.settings.pitch && effect.settings.pitch !== 0) {
        const biquadFilter = this.audioContext.createBiquadFilter();
        biquadFilter.type = 'allpass';
        
        // Simulate pitch shift with frequency adjustment
        const pitchFactor = Math.pow(2, effect.settings.pitch);
        biquadFilter.frequency.value = 1000 * pitchFactor;
        
        currentNode.connect(biquadFilter);
        currentNode = biquadFilter;
      }

      // 2. Apply Reverb
      if (effect.settings.reverb && effect.settings.reverb > 0) {
        const convolver = this.audioContext.createConvolver();
        const reverbGain = this.audioContext.createGain();
        reverbGain.gain.value = effect.settings.reverb;
        
        // Create impulse response for reverb
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 seconds reverb
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
          const channelData = impulse.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
          }
        }
        
        convolver.buffer = impulse;
        
        // Connect reverb path
        currentNode.connect(convolver);
        convolver.connect(reverbGain);
        reverbGain.connect(destination);
        
        // Also connect dry signal
        const dryGain = this.audioContext.createGain();
        dryGain.gain.value = 1 - effect.settings.reverb;
        currentNode.connect(dryGain);
        dryGain.connect(destination);
      } else {
        // 3. Apply Echo
        if (effect.settings.echo && effect.settings.echo > 0) {
          const delay = this.audioContext.createDelay(1.0);
          const feedback = this.audioContext.createGain();
          const echoGain = this.audioContext.createGain();
          
          delay.delayTime.value = 0.3; // 300ms delay
          feedback.gain.value = effect.settings.echo;
          echoGain.gain.value = 0.5;
          
          // Connect echo chain
          currentNode.connect(delay);
          delay.connect(feedback);
          feedback.connect(delay);
          delay.connect(echoGain);
          echoGain.connect(destination);
          
          // Connect dry signal
          currentNode.connect(destination);
        } else {
          // No special effects, just connect
          currentNode.connect(destination);
        }
      }

      // Apply EQ/Filter based on effect category
      if (effect.category === 'filter') {
        const filter = this.audioContext.createBiquadFilter();
        
        switch (effect.id) {
          case 'robot':
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            break;
          case 'radio':
            filter.type = 'bandpass';
            filter.frequency.value = 2000;
            filter.Q.value = 1;
            break;
          case 'phone':
            filter.type = 'bandpass';
            filter.frequency.value = 1500;
            filter.Q.value = 2;
            break;
        }
        
        // Insert filter in chain (if not already processed)
        if (currentNode === this.sourceNode) {
          currentNode.connect(filter);
          filter.connect(destination);
        }
      }

      return destination.stream;
    } catch (error) {
      console.error('Error applying voice effect:', error);
      return stream; // Return original stream on error
    }
  }

  /**
   * Cleanup audio nodes
   */
  cleanup(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const VoiceEffectsService = new VoiceEffectsServiceClass();
