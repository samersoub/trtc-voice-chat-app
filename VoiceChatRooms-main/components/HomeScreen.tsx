import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Users, LogOut, Search } from 'lucide-react-native';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { RoomService } from '@/services/roomService';
import { Room } from '@/types/room';

interface HomeScreenProps {
  onJoinRoom: (room: Room) => void;
}

export default function HomeScreen({ onJoinRoom }: HomeScreenProps) {
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  const { user, signOut } = useSupabaseAuth();

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    setLoading(true);
    try {
      const room = await RoomService.createRoom(roomName, user!.id);
      await RoomService.joinRoom(room.id, user!.id);
      onJoinRoom(room);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }

    setLoading(true);
    try {
      const room = await RoomService.getRoomByCode(roomCode.toUpperCase());
      if (!room) {
        Alert.alert('Error', 'Room not found or inactive');
        return;
      }

      await RoomService.joinRoom(room.id, user!.id);
      onJoinRoom(room);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.user_metadata?.name || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCreateRoom(!showCreateRoom)}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ee5a52']}
              style={styles.actionGradient}
            >
              <Plus size={24} color="#fff" />
              <Text style={styles.actionText}>Create Room</Text>
            </LinearGradient>
          </TouchableOpacity>

          {showCreateRoom && (
            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter room name"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={roomName}
                onChangeText={setRoomName}
              />
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleCreateRoom}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowJoinRoom(!showJoinRoom)}
          >
            <LinearGradient
              colors={['#4ecdc4', '#44a08d']}
              style={styles.actionGradient}
            >
              <Users size={24} color="#fff" />
              <Text style={styles.actionText}>Join Room</Text>
            </LinearGradient>
          </TouchableOpacity>

          {showJoinRoom && (
            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter room code"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={roomCode}
                onChangeText={setRoomCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleJoinRoom}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Joining...' : 'Join'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>1</Text>
            <Text style={styles.infoText}>Create a room or join with a code</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>2</Text>
            <Text style={styles.infoText}>Raise your hand to request mic access</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>3</Text>
            <Text style={styles.infoText}>Only 2 people can speak at once (perfect for couples!)</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  signOutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  inputSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoNumber: {
    backgroundColor: '#fff',
    color: '#667eea',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
});