import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Hand, 
  Users, 
  Crown,
  Volume2,
  VolumeX,
  Copy
} from 'lucide-react-native';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import { RoomService } from '@/services/roomService';
import { Room, RoomParticipant, MicRequest } from '@/types/room';
import * as Clipboard from 'expo-clipboard';

interface RoomScreenProps {
  room: Room;
  onLeaveRoom: () => void;
}

export default function RoomScreen({ room, onLeaveRoom }: RoomScreenProps) {
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [micRequests, setMicRequests] = useState<MicRequest[]>([]);
  const [userMicStatus, setUserMicStatus] = useState<'none' | 'requested' | 'granted'>('none');
  const [loading, setLoading] = useState(false);

  const { user } = useSupabaseAuth();
  const voiceEngine = useVoiceEngine();

  const isAdmin = user?.id === room.admin_id;
  const currentUser = participants.find(p => p.user_id === user?.id);

  useEffect(() => {
    loadRoomData();
    
    // Subscribe to real-time updates
    const subscription = RoomService.subscribeToRoomUpdates(room.id, () => {
      loadRoomData();
    });

    // Join voice channel if user has mic access
    if (currentUser?.mic_status === 'granted') {
      voiceEngine.joinChannel({
        appId: 'your-agora-app-id',
        channelName: room.id,
        userId: user!.id,
      });
    }

    return () => {
      subscription.unsubscribe();
      voiceEngine.leaveChannel();
    };
  }, [room.id, currentUser?.mic_status]);

  const loadRoomData = async () => {
    try {
      const [participantsData, requestsData] = await Promise.all([
        RoomService.getRoomParticipants(room.id),
        isAdmin ? RoomService.getPendingMicRequests(room.id) : Promise.resolve([]),
      ]);

      setParticipants(participantsData);
      setMicRequests(requestsData);

      const currentUserData = participantsData.find(p => p.user_id === user?.id);
      if (currentUserData) {
        setUserMicStatus(currentUserData.mic_status);
      }
    } catch (error) {
      console.error('Failed to load room data:', error);
    }
  };

  const handleRaiseHand = async () => {
    if (userMicStatus !== 'none') return;

    setLoading(true);
    try {
      await RoomService.raiseHand(user!.id, room.id);
      setUserMicStatus('requested');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantMic = async (userId: string) => {
    setLoading(true);
    try {
      await RoomService.grantMic(user!.id, userId, room.id);
      loadRoomData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeMic = async (userId: string) => {
    Alert.alert(
      'Revoke Mic Access',
      'Are you sure you want to revoke mic access?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await RoomService.revokeMic(user!.id, userId, room.id);
              loadRoomData();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleLeaveRoom = async () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave this room?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await RoomService.leaveRoom(room.id, user!.id);
              voiceEngine.leaveChannel();
              onLeaveRoom();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const copyRoomCode = async () => {
    await Clipboard.setStringAsync(room.room_code);
    Alert.alert('Copied!', 'Room code copied to clipboard');
  };

  const micHolders = participants.filter(p => p.mic_status === 'granted');

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleLeaveRoom}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{room.name}</Text>
          <TouchableOpacity style={styles.roomCodeContainer} onPress={copyRoomCode}>
            <Text style={styles.roomCode}>Code: {room.room_code}</Text>
            <Copy size={14} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        <View style={styles.participantCount}>
          <Users size={20} color="#fff" />
          <Text style={styles.participantCountText}>{participants.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Mic Holders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Speaking ({micHolders.length}/2)</Text>
          <View style={styles.micHoldersContainer}>
            {micHolders.map((participant) => (
              <View key={participant.id} style={styles.micHolder}>
                <LinearGradient
                  colors={['#ff6b6b', '#ee5a52']}
                  style={styles.micHolderGradient}
                >
                  <View style={styles.micHolderInfo}>
                    <Text style={styles.micHolderName}>
                      {participant.user?.name || 'Unknown'}
                    </Text>
                    {participant.user_id === room.admin_id && (
                      <Crown size={16} color="#ffd700" />
                    )}
                  </View>
                  <View style={styles.micHolderControls}>
                    <Mic size={20} color="#fff" />
                    {isAdmin && participant.user_id !== user?.id && (
                      <TouchableOpacity
                        style={styles.revokeButton}
                        onPress={() => handleRevokeMic(participant.user_id)}
                      >
                        <MicOff size={16} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                </LinearGradient>
              </View>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 2 - micHolders.length }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.emptySlot}>
                <Text style={styles.emptySlotText}>Available</Text>
                <MicOff size={20} color="rgba(255,255,255,0.5)" />
              </View>
            ))}
          </View>
        </View>

        {/* Admin Panel */}
        {isAdmin && micRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mic Requests ({micRequests.length})</Text>
            {micRequests.map((request) => (
              <View key={request.id} style={styles.micRequest}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>
                    {request.user?.name || 'Unknown'}
                  </Text>
                  <Text style={styles.requestTime}>
                    {new Date(request.requested_at).toLocaleTimeString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.grantButton}
                  onPress={() => handleGrantMic(request.user_id)}
                  disabled={micHolders.length >= 2}
                >
                  <Text style={styles.grantButtonText}>
                    {micHolders.length >= 2 ? 'Full' : 'Grant'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* All Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Participants</Text>
          {participants.map((participant) => (
            <View key={participant.id} style={styles.participant}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>
                  {participant.user?.name || 'Unknown'}
                </Text>
                <View style={styles.participantStatus}>
                  {participant.user_id === room.admin_id && (
                    <Crown size={14} color="#ffd700" />
                  )}
                  {participant.mic_status === 'granted' && (
                    <Mic size={14} color="#4CAF50" />
                  )}
                  {participant.mic_status === 'requested' && (
                    <Hand size={14} color="#ff9800" />
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {userMicStatus === 'granted' && (
          <TouchableOpacity
            style={[styles.controlButton, voiceEngine.isMuted && styles.mutedButton]}
            onPress={voiceEngine.toggleMute}
          >
            {voiceEngine.isMuted ? (
              <MicOff size={24} color="#fff" />
            ) : (
              <Mic size={24} color="#fff" />
            )}
          </TouchableOpacity>
        )}

        {userMicStatus === 'none' && (
          <TouchableOpacity
            style={[styles.raiseHandButton, loading && styles.raiseHandButtonDisabled]}
            onPress={handleRaiseHand}
            disabled={loading}
          >
            <Hand size={24} color="#fff" />
            <Text style={styles.raiseHandText}>
              {loading ? 'Requesting...' : 'Raise Hand'}
            </Text>
          </TouchableOpacity>
        )}

        {userMicStatus === 'requested' && (
          <View style={styles.waitingIndicator}>
            <Hand size={24} color="#ff9800" />
            <Text style={styles.waitingText}>Waiting for approval...</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomCode: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginRight: 5,
  },
  participantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  participantCountText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  micHoldersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  micHolder: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  micHolderGradient: {
    padding: 15,
    alignItems: 'center',
  },
  micHolderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  micHolderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 5,
  },
  micHolderControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revokeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  emptySlot: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  emptySlotText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
  },
  micRequest: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  requestTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  grantButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  grantButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  participant: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantName: {
    fontSize: 16,
    color: '#fff',
  },
  participantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedButton: {
    backgroundColor: '#f44336',
  },
  raiseHandButton: {
    backgroundColor: '#ff9800',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  raiseHandButtonDisabled: {
    opacity: 0.7,
  },
  raiseHandText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  waitingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,152,0,0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  waitingText: {
    color: '#ff9800',
    fontSize: 16,
    marginLeft: 10,
  },
});