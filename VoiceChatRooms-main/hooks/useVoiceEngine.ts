import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

// Mock Agora implementation for web compatibility
interface VoiceEngineConfig {
  appId: string;
  channelName: string;
  userId: string;
  token?: string;
}

interface VoiceEngineState {
  isConnected: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  participants: string[];
}

export function useVoiceEngine() {
  const [state, setState] = useState<VoiceEngineState>({
    isConnected: false,
    isMuted: true,
    isSpeaking: false,
    participants: [],
  });

  const joinChannel = useCallback(async (config: VoiceEngineConfig) => {
    try {
      if (Platform.OS === 'web') {
        // Mock implementation for web
        console.log('Joining voice channel:', config.channelName);
        setState(prev => ({ ...prev, isConnected: true }));
        return true;
      }

      // Real Agora implementation would go here for mobile
      // const engine = await RtcEngine.create(config.appId);
      // await engine.joinChannel(config.token, config.channelName, null, config.userId);
      
      setState(prev => ({ ...prev, isConnected: true }));
      return true;
    } catch (error) {
      console.error('Failed to join voice channel:', error);
      return false;
    }
  }, []);

  const leaveChannel = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        console.log('Leaving voice channel');
        setState({
          isConnected: false,
          isMuted: true,
          isSpeaking: false,
          participants: [],
        });
        return;
      }

      // Real Agora implementation
      // await engine.leaveChannel();
      
      setState({
        isConnected: false,
        isMuted: true,
        isSpeaking: false,
        participants: [],
      });
    } catch (error) {
      console.error('Failed to leave voice channel:', error);
    }
  }, []);

  const toggleMute = useCallback(async () => {
    try {
      const newMutedState = !state.isMuted;
      
      if (Platform.OS === 'web') {
        console.log('Toggle mute:', newMutedState);
        setState(prev => ({ ...prev, isMuted: newMutedState }));
        return;
      }

      // Real Agora implementation
      // await engine.muteLocalAudioStream(newMutedState);
      
      setState(prev => ({ ...prev, isMuted: newMutedState }));
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }, [state.isMuted]);

  const enableMicrophone = useCallback(async (enabled: boolean) => {
    try {
      if (Platform.OS === 'web') {
        console.log('Enable microphone:', enabled);
        setState(prev => ({ ...prev, isMuted: !enabled }));
        return;
      }

      // Real Agora implementation
      // await engine.enableLocalAudio(enabled);
      
      setState(prev => ({ ...prev, isMuted: !enabled }));
    } catch (error) {
      console.error('Failed to enable microphone:', error);
    }
  }, []);

  return {
    ...state,
    joinChannel,
    leaveChannel,
    toggleMute,
    enableMicrophone,
  };
}