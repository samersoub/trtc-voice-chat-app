import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, MicOff, Users, Crown, Gift, Heart, Settings, UserPlus, Volume2, VolumeX, MessageCircle, Share, Hand, X, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface VoiceRoomModalProps {
  visible: boolean;
  onClose: () => void;
  room: any;
}

interface RoomUser {
  id: string;
  name: string;
  avatar: string;
  isVip: boolean;
  level: number;
  isMuted: boolean;
  isSpeaking: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  hasHandRaised: boolean;
  seatNumber?: number;
}

export default function VoiceRoomModal({ visible, onClose, room }: VoiceRoomModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [hasHandRaised, setHasHandRaised] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RoomUser | null>(null);

  const mockUsers: RoomUser[] = [
    {
      id: '1',
      name: 'وقت',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isVip: true,
      level: 88885,
      isMuted: false,
      isSpeaking: true,
      isOwner: true,
      isAdmin: true,
      hasHandRaised: false,
      seatNumber: 1,
    },
    {
      id: '2',
      name: 'مجيد',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isVip: false,
      level: 1234,
      isMuted: false,
      isSpeaking: false,
      isOwner: false,
      isAdmin: false,
      hasHandRaised: false,
      seatNumber: 2,
    },
    {
      id: '3',
      name: 'Jawaheer',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isVip: true,
      level: 5678,
      isMuted: true,
      isSpeaking: false,
      isOwner: false,
      isAdmin: false,
      hasHandRaised: false,
      seatNumber: 3,
    },
    {
      id: '4',
      name: 'Areej',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isVip: false,
      level: 2345,
      isMuted: false,
      isSpeaking: false,
      isOwner: false,
      isAdmin: false,
      hasHandRaised: false,
      seatNumber: 4,
    },
    {
      id: '5',
      name: 'هيما',
      avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isVip: true,
      level: 3456,
      isMuted: false,
      isSpeaking: false,
      isOwner: false,
      isAdmin: false,
      hasHandRaised: false,
      seatNumber: 5,
    },
    // Audience members (no seats)
    {
      id: '6',
      name: 'السيل',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isVip: false,
      level: 1111,
      isMuted: true,
      isSpeaking: false,
      isOwner: false,
      isAdmin: false,
      hasHandRaised: true,
    },
    {
      id: '7',
      name: 'SOLE',
      avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isVip: false,
      level: 2222,
      isMuted: true,
      isSpeaking: false,
      isOwner: false,
      isAdmin: false,
      hasHandRaised: false,
    },
  ];

  const speakerUsers = mockUsers.filter(user => user.seatNumber);
  const audienceUsers = mockUsers.filter(user => !user.seatNumber);

  const handleUserPress = (user: RoomUser) => {
    setSelectedUser(user);
  };

  const handleRaiseHand = () => {
    setHasHandRaised(!hasHandRaised);
    Alert.alert(
      hasHandRaised ? 'Hand Lowered' : 'Hand Raised',
      hasHandRaised ? 'You lowered your hand' : 'You raised your hand to speak. Wait for admin approval.'
    );
  };

  const sendGift = (user: RoomUser) => {
    Alert.alert('Send Gift', `Send a gift to ${user.name}?`);
  };

  const inviteFriend = () => {
    Alert.alert('Invite Friends', 'Invite friends to this room');
  };

  const shareRoom = () => {
    Alert.alert('Share Room', 'Share this room with others');
  };

  if (!room) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <LinearGradient
        colors={['#2C1810', '#1A0F08']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.roomInfo}>
            <Text style={styles.roomTitle}>{room.name}</Text>
            <View style={styles.roomStats}>
              <Text style={styles.goldAmount}>💰 34.39M</Text>
              <View style={styles.participantCount}>
                <Users size={16} color="#fff" />
                <Text style={styles.participantText}>18</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Speaker Seats */}
        <View style={styles.speakerSection}>
          <View style={styles.speakerGrid}>
            {/* Top row speakers */}
            <View style={styles.speakerRow}>
              {speakerUsers.slice(0, 7).map((user, index) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.speakerSeat,
                    user.isSpeaking && styles.speakingSeat,
                    user.isOwner && styles.ownerSeat,
                  ]}
                  onPress={() => handleUserPress(user)}
                >
                  <View style={styles.speakerAvatarContainer}>
                    <Image source={{ uri: user.avatar }} style={styles.speakerAvatar} />
                    {user.isOwner && (
                      <View style={styles.crownBadge}>
                        <Crown size={12} color="#FFD700" />
                      </View>
                    )}
                    {user.isVip && !user.isOwner && (
                      <View style={styles.vipBadge}>
                        <Crown size={10} color="#FFD700" />
                      </View>
                    )}
                    {user.isMuted && (
                      <View style={styles.mutedIndicator}>
                        <MicOff size={10} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.speakerName}>{user.name}</Text>
                  <Text style={styles.speakerLevel}>{user.level}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Center special seat */}
            <View style={styles.centerSeatContainer}>
              <View style={styles.centerSeat}>
                <View style={styles.centerSeatDecoration}>
                  <Crown size={24} color="#FFD700" />
                </View>
                <Image 
                  source={{ uri: speakerUsers[0]?.avatar }} 
                  style={styles.centerAvatar} 
                />
                <Text style={styles.centerName}>{speakerUsers[0]?.name}</Text>
              </View>
            </View>

            {/* Bottom row speakers */}
            <View style={styles.speakerRow}>
              {Array.from({ length: 7 }, (_, index) => {
                const user = speakerUsers[index + 1];
                const seatNumber = index + 8;
                
                if (user) {
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.speakerSeat,
                        user.isSpeaking && styles.speakingSeat,
                      ]}
                      onPress={() => handleUserPress(user)}
                    >
                      <View style={styles.speakerAvatarContainer}>
                        <Image source={{ uri: user.avatar }} style={styles.speakerAvatar} />
                        {user.isVip && (
                          <View style={styles.vipBadge}>
                            <Crown size={10} color="#FFD700" />
                          </View>
                        )}
                        {user.isMuted && (
                          <View style={styles.mutedIndicator}>
                            <MicOff size={10} color="#fff" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.speakerName}>{user.name}</Text>
                      <Text style={styles.speakerLevel}>{user.level}</Text>
                    </TouchableOpacity>
                  );
                }
                
                return (
                  <TouchableOpacity
                    key={`empty-${seatNumber}`}
                    style={styles.emptySeat}
                    onPress={inviteFriend}
                  >
                    <View style={styles.emptySeatIcon}>
                      <Mic size={20} color="#666" />
                    </View>
                    <Text style={styles.seatNumber}>No.{seatNumber}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Audience Section */}
        <View style={styles.audienceSection}>
          <View style={styles.audienceHeader}>
            <Text style={styles.audienceTitle}>All</Text>
            <Text style={styles.chatTitle}>Chat</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.audienceScroll}>
            {audienceUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.audienceUser}
                onPress={() => handleUserPress(user)}
              >
                <View style={styles.audienceAvatarContainer}>
                  <Image source={{ uri: user.avatar }} style={styles.audienceAvatar} />
                  {user.hasHandRaised && (
                    <View style={styles.handRaisedBadge}>
                      <Hand size={12} color="#FFD700" />
                    </View>
                  )}
                  {user.isVip && (
                    <View style={styles.audienceVipBadge}>
                      <Crown size={8} color="#FFD700" />
                    </View>
                  )}
                </View>
                <Text style={styles.audienceName}>{user.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chat Message */}
        <View style={styles.chatMessage}>
          <Text style={styles.chatText}>Room owner has turned off the car effect</Text>
        </View>

        {/* User Info Bar */}
        <View style={styles.userInfoBar}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop' }}
              style={styles.userAvatar}
            />
            <View style={styles.userBadges}>
              <View style={styles.userBadge}>
                <Crown size={12} color="#FFD700" />
                <Text style={styles.badgeText}>VIP</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>59</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>29</Text>
              </View>
            </View>
          </View>
          <Text style={styles.userMessage}>
            @Jalal JJ أهلاً ومرحباً بعين غنا وعين فراش ❤️
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlButton}>
              <MessageCircle size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Users size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Gift size={20} color="#00C851" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.raiseHandButton, hasHandRaised && styles.handRaisedButton]}
              onPress={handleRaiseHand}
            >
              <Hand size={24} color={hasHandRaised ? "#FFD700" : "#fff"} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.micButton, isMuted && styles.micButtonMuted]}
              onPress={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <MicOff size={24} color="#fff" />
              ) : (
                <Mic size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Modal>
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
    paddingBottom: 15,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: {
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  goldAmount: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  participantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  participantText: {
    color: '#fff',
    fontSize: 14,
  },
  moreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  speakerGrid: {
    flex: 1,
    justifyContent: 'space-between',
  },
  speakerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  speakerSeat: {
    alignItems: 'center',
    width: 45,
  },
  speakingSeat: {
    transform: [{ scale: 1.1 }],
  },
  ownerSeat: {
    transform: [{ scale: 1.2 }],
  },
  speakerAvatarContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  speakerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#666',
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -6 }],
    backgroundColor: '#FFD700',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vipBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedIndicator: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerName: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  speakerLevel: {
    fontSize: 8,
    color: '#ccc',
    textAlign: 'center',
  },
  centerSeatContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  centerSeat: {
    alignItems: 'center',
    position: 'relative',
  },
  centerSeatDecoration: {
    position: 'absolute',
    top: -15,
    zIndex: 1,
  },
  centerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  centerName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  emptySeat: {
    alignItems: 'center',
    width: 45,
  },
  emptySeatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  seatNumber: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  audienceSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 15,
  },
  audienceHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  audienceTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 20,
  },
  chatTitle: {
    color: '#666',
    fontSize: 16,
  },
  audienceScroll: {
    paddingLeft: 20,
  },
  audienceUser: {
    alignItems: 'center',
    marginRight: 15,
    width: 50,
  },
  audienceAvatarContainer: {
    position: 'relative',
    marginBottom: 5,
  },
  audienceAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  handRaisedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audienceVipBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audienceName: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
  },
  chatMessage: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  chatText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  userInfoBar: {
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  userBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  userBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  levelBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pointsBadge: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pointsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userMessage: {
    color: '#000',
    fontSize: 12,
    flex: 1,
  },
  bottomControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  raiseHandButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handRaisedButton: {
    backgroundColor: '#FFD700',
  },
  micButton: {
    backgroundColor: '#00C851',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonMuted: {
    backgroundColor: '#ff4444',
  },
});