import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { 
  Search, 
  UserPlus, 
  MessageCircle, 
  Gift, 
  Crown,
  Users,
  Heart,
  Star
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  level: number;
  isVip: boolean;
  mutualFriends: number;
  status: string;
}

const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true,
    lastSeen: 'Online',
    level: 28,
    isVip: true,
    mutualFriends: 5,
    status: 'Singing in Music Room 🎵',
  },
  {
    id: '2',
    name: 'Alex Chen',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true,
    lastSeen: 'Online',
    level: 32,
    isVip: false,
    mutualFriends: 3,
    status: 'Available for chat',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false,
    lastSeen: '2 hours ago',
    level: 15,
    isVip: false,
    mutualFriends: 8,
    status: 'Gaming enthusiast',
  },
  {
    id: '4',
    name: 'Michael Brown',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true,
    lastSeen: 'Online',
    level: 22,
    isVip: true,
    mutualFriends: 12,
    status: 'In Gaming Squad Room',
  },
];

const mockSuggestions: Friend[] = [
  {
    id: '5',
    name: 'Jessica Davis',
    avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: true,
    lastSeen: 'Online',
    level: 18,
    isVip: false,
    mutualFriends: 2,
    status: 'New to voice chat',
  },
  {
    id: '6',
    name: 'David Lee',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isOnline: false,
    lastSeen: '1 hour ago',
    level: 25,
    isVip: true,
    mutualFriends: 7,
    status: 'Music lover',
  },
];

export default function FriendsScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState<'friends' | 'suggestions'>('friends');
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [suggestions, setSuggestions] = useState<Friend[]>(mockSuggestions);

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredSuggestions = suggestions.filter(friend =>
    friend.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const sendMessage = (friend: Friend) => {
    Alert.alert('Message', `Send message to ${friend.name}`);
  };

  const sendGift = (friend: Friend) => {
    Alert.alert('Gift', `Send gift to ${friend.name}`);
  };

  const addFriend = (friend: Friend) => {
    Alert.alert('Friend Request', `Send friend request to ${friend.name}`);
  };

  const removeFriend = (friendId: string) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFriends(friends.filter(f => f.id !== friendId));
          },
        },
      ]
    );
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
          <Text style={styles.title}>Friends</Text>
          <TouchableOpacity style={styles.addButton}>
            <UserPlus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'friends' && styles.activeTab]}
            onPress={() => setSelectedTab('friends')}
          >
            <Text style={[styles.tabText, selectedTab === 'friends' && styles.activeTabText]}>
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'suggestions' && styles.activeTab]}
            onPress={() => setSelectedTab('suggestions')}
          >
            <Text style={[styles.tabText, selectedTab === 'suggestions' && styles.activeTabText]}>
              Suggestions ({suggestions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Friends List */}
        <ScrollView style={styles.friendsList}>
          {selectedTab === 'friends' ? (
            <>
              {/* Online Friends */}
              {filteredFriends.filter(f => f.isOnline).length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Online</Text>
                  {filteredFriends
                    .filter(f => f.isOnline)
                    .map((friend) => (
                      <TouchableOpacity
                        key={friend.id}
                        style={styles.friendCard}
                        onLongPress={() => removeFriend(friend.id)}
                      >
                        <View style={styles.friendInfo}>
                          <View style={styles.avatarContainer}>
                            <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                            <View style={[styles.onlineIndicator, { backgroundColor: friend.isOnline ? '#4CAF50' : '#666' }]} />
                            {friend.isVip && (
                              <View style={styles.vipBadge}>
                                <Crown size={12} color="#ffd700" />
                              </View>
                            )}
                          </View>
                          <View style={styles.friendDetails}>
                            <Text style={styles.friendName}>{friend.name}</Text>
                            <Text style={styles.friendStatus}>{friend.status}</Text>
                            <View style={styles.friendMeta}>
                              <Text style={styles.friendLevel}>Lv.{friend.level}</Text>
                              <Text style={styles.mutualFriends}>
                                {friend.mutualFriends} mutual friends
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.friendActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => sendMessage(friend)}
                          >
                            <MessageCircle size={20} color="#e91e63" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => sendGift(friend)}
                          >
                            <Gift size={20} color="#ff6b9d" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                </>
              )}

              {/* Offline Friends */}
              {filteredFriends.filter(f => !f.isOnline).length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Offline</Text>
                  {filteredFriends
                    .filter(f => !f.isOnline)
                    .map((friend) => (
                      <TouchableOpacity
                        key={friend.id}
                        style={[styles.friendCard, styles.offlineFriend]}
                        onLongPress={() => removeFriend(friend.id)}
                      >
                        <View style={styles.friendInfo}>
                          <View style={styles.avatarContainer}>
                            <Image source={{ uri: friend.avatar }} style={[styles.avatar, styles.offlineAvatar]} />
                            <View style={[styles.onlineIndicator, { backgroundColor: '#666' }]} />
                            {friend.isVip && (
                              <View style={styles.vipBadge}>
                                <Crown size={12} color="#ffd700" />
                              </View>
                            )}
                          </View>
                          <View style={styles.friendDetails}>
                            <Text style={styles.friendName}>{friend.name}</Text>
                            <Text style={styles.friendLastSeen}>Last seen {friend.lastSeen}</Text>
                            <View style={styles.friendMeta}>
                              <Text style={styles.friendLevel}>Lv.{friend.level}</Text>
                              <Text style={styles.mutualFriends}>
                                {friend.mutualFriends} mutual friends
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.friendActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => sendMessage(friend)}
                          >
                            <MessageCircle size={20} color="#666" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => sendGift(friend)}
                          >
                            <Gift size={20} color="#666" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                </>
              )}
            </>
          ) : (
            /* Suggestions */
            <>
              <Text style={styles.sectionTitle}>People You May Know</Text>
              {filteredSuggestions.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendCard}
                >
                  <View style={styles.friendInfo}>
                    <View style={styles.avatarContainer}>
                      <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                      <View style={[styles.onlineIndicator, { backgroundColor: friend.isOnline ? '#4CAF50' : '#666' }]} />
                      {friend.isVip && (
                        <View style={styles.vipBadge}>
                          <Crown size={12} color="#ffd700" />
                        </View>
                      )}
                    </View>
                    <View style={styles.friendDetails}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendStatus}>{friend.status}</Text>
                      <View style={styles.friendMeta}>
                        <Text style={styles.friendLevel}>Lv.{friend.level}</Text>
                        <Text style={styles.mutualFriends}>
                          {friend.mutualFriends} mutual friends
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.friendActions}>
                    <TouchableOpacity
                      style={styles.addFriendButton}
                      onPress={() => addFriend(friend)}
                    >
                      <UserPlus size={16} color="#fff" />
                      <Text style={styles.addFriendText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
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
  addButton: {
    backgroundColor: '#e91e63',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#e91e63',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  friendsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    marginTop: 10,
  },
  friendCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offlineFriend: {
    opacity: 0.7,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  offlineAvatar: {
    opacity: 0.6,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#2a2a3e',
  },
  vipBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ffd700',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  friendStatus: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
  friendLastSeen: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  friendMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendLevel: {
    fontSize: 12,
    color: '#e91e63',
    marginRight: 10,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#666',
  },
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addFriendButton: {
    backgroundColor: '#e91e63',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFriendText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
});