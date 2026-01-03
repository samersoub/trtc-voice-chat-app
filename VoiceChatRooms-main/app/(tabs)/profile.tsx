import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Settings, CreditCard as Edit, Crown, Star, Gift, Users, Trophy, Heart, MessageCircle, Share, Bell, Lock, CircleHelp as HelpCircle, LogOut, Camera, User, Mail, Calendar, MapPin, Shield } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  level: number;
  points: number;
  rank: number;
  isVip: boolean;
  joinDate: string;
  location: string;
  email: string;
  stats: {
    friends: number;
    giftsReceived: number;
    giftsSent: number;
    roomsCreated: number;
    timeInVoiceChat: number;
    achievements: number;
  };
  achievements: string[];
}

const userProfile: UserProfile = {
  id: '1',
  name: 'Alex Johnson',
  username: '@alexjohnson',
  avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  bio: 'Music lover, gamer, and voice chat enthusiast. Always up for good conversations!',
  level: 32,
  points: 87500,
  rank: 156,
  isVip: true,
  joinDate: 'March 2023',
  location: 'New York, USA',
  email: 'alex@example.com',
  stats: {
    friends: 245,
    giftsReceived: 1890,
    giftsSent: 1256,
    roomsCreated: 23,
    timeInVoiceChat: 1250,
    achievements: 28,
  },
  achievements: ['🏆', '👑', '⭐', '🎵', '🎮', '🔥', '💎', '🌟'],
};

const settingsOptions = [
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Push notifications and alerts' },
  { id: 'privacy', title: 'Privacy', icon: Shield, description: 'Profile and activity privacy' },
  { id: 'security', title: 'Security', icon: Lock, description: 'Password and account security' },
  { id: 'help', title: 'Help & Support', icon: HelpCircle, description: 'Get help and contact support' },
  { id: 'logout', title: 'Logout', icon: LogOut, description: 'Sign out of your account' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    setIsEditModalVisible(false);
    Alert.alert('Profile Updated', 'Your profile has been updated successfully!');
  };

  const handleSettingsPress = (option: any) => {
    if (option.id === 'logout') {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: logout },
        ]
      );
    } else {
      Alert.alert(option.title, `${option.title} settings coming soon!`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleEditProfile}>
              <Edit size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => setIsSettingsVisible(true)}>
              <Settings size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={['#e91e63', '#ff6b9d']}
              style={styles.profileGradient}
            >
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
                  {userProfile.isVip && (
                    <View style={styles.vipBadge}>
                      <Crown size={16} color="#ffd700" />
                    </View>
                  )}
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>Lv.{userProfile.level}</Text>
                  </View>
                </View>
                
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{userProfile.name}</Text>
                  <Text style={styles.profileUsername}>{userProfile.username}</Text>
                  <Text style={styles.profileBio}>{userProfile.bio}</Text>
                  
                  <View style={styles.profileMeta}>
                    <View style={styles.metaItem}>
                      <MapPin size={14} color="#fff" />
                      <Text style={styles.metaText}>{userProfile.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color="#fff" />
                      <Text style={styles.metaText}>Joined {userProfile.joinDate}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.rankInfo}>
                <View style={styles.rankItem}>
                  <Text style={styles.rankNumber}>#{userProfile.rank}</Text>
                  <Text style={styles.rankLabel}>Global Rank</Text>
                </View>
                <View style={styles.rankItem}>
                  <Text style={styles.rankNumber}>{userProfile.points.toLocaleString()}</Text>
                  <Text style={styles.rankLabel}>Points</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Users size={24} color="#e91e63" />
                <Text style={styles.statNumber}>{userProfile.stats.friends}</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>
              <View style={styles.statCard}>
                <Gift size={24} color="#ff6b9d" />
                <Text style={styles.statNumber}>{userProfile.stats.giftsReceived}</Text>
                <Text style={styles.statLabel}>Gifts</Text>
              </View>
              <View style={styles.statCard}>
                <Heart size={24} color="#f44336" />
                <Text style={styles.statNumber}>{userProfile.stats.giftsSent}</Text>
                <Text style={styles.statLabel}>Sent</Text>
              </View>
              <View style={styles.statCard}>
                <Trophy size={24} color="#ffd700" />
                <Text style={styles.statNumber}>{userProfile.stats.achievements}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {userProfile.achievements.map((achievement, index) => (
                <TouchableOpacity key={index} style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>{achievement}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Activity Stats */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <MessageCircle size={20} color="#e91e63" />
                <Text style={styles.activityText}>Rooms Created</Text>
                <Text style={styles.activityValue}>{userProfile.stats.roomsCreated}</Text>
              </View>
              <View style={styles.activityItem}>
                <Star size={20} color="#ff6b9d" />
                <Text style={styles.activityText}>Voice Chat Hours</Text>
                <Text style={styles.activityValue}>{userProfile.stats.timeInVoiceChat}h</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Edit Profile Modal */}
        <Modal
          visible={isEditModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1a1a2e', '#16213e']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSaveProfile}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                <View style={styles.editAvatarContainer}>
                  <Image source={{ uri: editedProfile.avatar }} style={styles.editAvatar} />
                  <TouchableOpacity style={styles.editAvatarButton}>
                    <Camera size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Name</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editedProfile.name}
                    onChangeText={(text) => setEditedProfile({...editedProfile, name: text})}
                    placeholder="Enter your name"
                    placeholderTextColor="#666"
                  />
                </View>
                
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Bio</Text>
                  <TextInput
                    style={[styles.editInput, styles.editTextArea]}
                    value={editedProfile.bio}
                    onChangeText={(text) => setEditedProfile({...editedProfile, bio: text})}
                    placeholder="Tell us about yourself"
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={4}
                  />
                </View>
                
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Location</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editedProfile.location}
                    onChangeText={(text) => setEditedProfile({...editedProfile, location: text})}
                    placeholder="Enter your location"
                    placeholderTextColor="#666"
                  />
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>

        {/* Settings Modal */}
        <Modal
          visible={isSettingsVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1a1a2e', '#16213e']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Settings</Text>
                <View style={styles.modalPlaceholder} />
              </View>
              
              <ScrollView style={styles.modalContent}>
                {settingsOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.settingsOption}
                      onPress={() => handleSettingsPress(option)}
                    >
                      <View style={styles.settingsOptionLeft}>
                        <IconComponent size={20} color="#e91e63" />
                        <View style={styles.settingsOptionText}>
                          <Text style={styles.settingsOptionTitle}>{option.title}</Text>
                          <Text style={styles.settingsOptionDescription}>{option.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  profileHeader: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  vipBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ffd700',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    left: -5,
    backgroundColor: '#e91e63',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  profileUsername: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 10,
  },
  profileBio: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
  },
  profileMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  metaText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
    opacity: 0.8,
  },
  rankInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  rankItem: {
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  rankLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  achievementsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementBadge: {
    backgroundColor: '#2a2a3e',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  achievementIcon: {
    fontSize: 24,
  },
  activitySection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  activityList: {
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#e91e63',
    fontWeight: 'bold',
  },
  modalPlaceholder: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  editAvatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  editAvatarButton: {
    backgroundColor: '#e91e63',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editField: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  editInput: {
    backgroundColor: '#2a2a3e',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#fff',
  },
  editTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  settingsOption: {
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  settingsOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsOptionText: {
    marginLeft: 15,
    flex: 1,
  },
  settingsOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  settingsOptionDescription: {
    fontSize: 14,
    color: '#ccc',
  },
});