/**
 * useRealtimeSync Hook
 * React hook for real-time synchronization with Supabase
 */

import { useEffect, useCallback } from 'react';
import { RealtimeSyncService } from '@/services/RealtimeSyncService';
import { AuthService } from '@/services/AuthService';

interface UseRealtimeSyncOptions {
  enabled?: boolean;
  onThemeChange?: (data: Record<string, unknown>) => void;
  onEffectChange?: (data: Record<string, unknown>) => void;
  onMissionUpdate?: (data: Record<string, unknown>) => void;
  onWheelSpin?: (data: Record<string, unknown>) => void;
}

/**
 * Hook for real-time sync with Supabase
 * 
 * @example
 * ```tsx
 * const { isConnected, channelsCount } = useRealtimeSync({
 *   enabled: true,
 *   onThemeChange: (data) => {
 *     console.log('Theme changed:', data);
 *     // Update UI
 *   },
 *   onMissionUpdate: (data) => {
 *     console.log('Mission updated:', data);
 *     // Refresh missions list
 *   }
 * });
 * ```
 */
export const useRealtimeSync = (options: UseRealtimeSyncOptions = {}) => {
  const { 
    enabled = true,
    onThemeChange,
    onEffectChange,
    onMissionUpdate,
    onWheelSpin
  } = options;

  const currentUser = AuthService.getCurrentUser();

  // Memoize callbacks to prevent unnecessary re-subscriptions
  const handleThemeChange = useCallback((event: string, payload: Record<string, unknown>) => {
    if (onThemeChange) {
      onThemeChange(payload);
    }
  }, [onThemeChange]);

  const handleEffectChange = useCallback((event: string, payload: Record<string, unknown>) => {
    if (onEffectChange) {
      onEffectChange(payload);
    }
  }, [onEffectChange]);

  const handleMissionUpdate = useCallback((event: string, payload: Record<string, unknown>) => {
    if (onMissionUpdate) {
      onMissionUpdate(payload);
    }
  }, [onMissionUpdate]);

  const handleWheelSpin = useCallback((event: string, payload: Record<string, unknown>) => {
    if (onWheelSpin) {
      onWheelSpin(payload);
    }
  }, [onWheelSpin]);

  useEffect(() => {
    if (!enabled || !currentUser?.id) {
      return;
    }

    // Initialize real-time sync
    const initSync = async () => {
      try {
        await RealtimeSyncService.initialize({
          userId: currentUser.id,
          onThemeChange: onThemeChange ? handleThemeChange : undefined,
          onEffectChange: onEffectChange ? handleEffectChange : undefined,
          onMissionUpdate: onMissionUpdate ? handleMissionUpdate : undefined,
          onWheelSpin: onWheelSpin ? handleWheelSpin : undefined
        });

        console.log('Real-time sync initialized for user:', currentUser.id);
      } catch (error) {
        console.error('Failed to initialize real-time sync:', error);
      }
    };

    initSync();

    // Cleanup on unmount
    return () => {
      RealtimeSyncService.cleanup();
    };
  }, [
    enabled,
    currentUser?.id,
    handleThemeChange,
    handleEffectChange,
    handleMissionUpdate,
    handleWheelSpin,
    onThemeChange,
    onEffectChange,
    onMissionUpdate,
    onWheelSpin
  ]);

  return {
    isConnected: enabled && !!currentUser?.id,
    channelsCount: RealtimeSyncService.getActiveChannelsCount(),
    cleanup: () => RealtimeSyncService.cleanup()
  };
};

/**
 * Hook for room presence tracking
 * 
 * @example
 * ```tsx
 * const { presences, broadcastPresence } = useRoomPresence(roomId);
 * 
 * useEffect(() => {
 *   broadcastPresence({ status: 'active', theme: 'luxury' });
 * }, []);
 * ```
 */
export const useRoomPresence = (roomId: string) => {
  const currentUser = AuthService.getCurrentUser();

  const broadcastPresence = useCallback(async (userData: Record<string, unknown>) => {
    if (!currentUser?.id || !roomId) return;

    try {
      await RealtimeSyncService.broadcastPresence(roomId, currentUser.id, userData);
    } catch (error) {
      console.error('Failed to broadcast presence:', error);
    }
  }, [roomId, currentUser?.id]);

  useEffect(() => {
    if (!roomId || !currentUser?.id) return;

    // Cleanup on unmount
    return () => {
      RealtimeSyncService.unsubscribe(`room:${roomId}`);
    };
  }, [roomId, currentUser?.id]);

  return {
    broadcastPresence
  };
};
