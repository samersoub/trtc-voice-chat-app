import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import AuthScreen from '@/components/AuthScreen';
import HomeScreen from '@/components/HomeScreen';
import RoomScreen from '@/components/RoomScreen';
import { Room } from '@/types/room';

export default function MainScreen() {
  const { user, loading } = useSupabaseAuth();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  if (loading) {
    return <View style={styles.container} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (currentRoom) {
    return (
      <RoomScreen
        room={currentRoom}
        onLeaveRoom={() => setCurrentRoom(null)}
      />
    );
  }

  return (
    <HomeScreen
      onJoinRoom={(room) => setCurrentRoom(room)}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
});