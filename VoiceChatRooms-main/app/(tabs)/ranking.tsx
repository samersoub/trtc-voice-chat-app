import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { 
  Trophy, 
  Crown, 
  Star, 
  Gift, 
  Zap,
  Medal,
  Award,
  TrendingUp
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  points: number;
  rank: number;
  isVip: boolean;
  change: 'up' | 'down' | 'same';
  country: string;
  achievements: string[];
}

const mockUsers: RankingUser[] = [
  {
    id: '1',
    name: 'Alex Champion',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 45,
    points: 125000,
    rank: 1,
    isVip: true,
    change: 'same',
    country: '🇺🇸',
    achievements: ['🏆', '👑', '⭐', '🎵'],
  },
  {
    id: '2',
    name: 'Sarah Star',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 42,
    points: 118000,
    rank: 2,
    isVip: true,
    change: 'up',
    country: '🇬🇧',
    achievements: ['🏅', '💎', '🌟', '🎭'],
  },
  {
    id: '3',
    name: 'Mike Legend',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 40,
    points: 112000,
    rank: 3,
    isVip: true,
    change: 'down',
    country: '🇨🇦',
    achievements: ['🏆', '🎮', '🚀', '🔥'],
  },
  {
    id: '4',
    name: 'Emma Grace',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 38,
    points: 95000,
    rank: 4,
    isVip: false,
    change: 'up',
    country: '🇩🇪',
    achievements: ['🌟', '💫', '🎪', '🎨'],
  },
  {
    id: '5',
    name: 'David Pro',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 36,
    points: 87000,
    rank: 5,
    isVip: true,
    change: 'same',
    country: '🇯🇵',
    achievements: ['🏅', '⚡', '🌈', '🎯'],
  },
  {
    id: '6',
    name: 'Lisa Bright',
    avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 35,
    points: 82000,
    rank: 6,
    isVip: false,
    change: 'up',
    country: '🇦🇺',
    achievements: ['💎', '🌟', '🎵', '🎭'],
  },
];

const categories = [
  { id: 'overall', name: 'Overall', icon: Trophy },
  { id: 'daily', name: 'Daily', icon: Star },
  { id: 'weekly', name: 'Weekly', icon: Award },
  { id: 'monthly', name: 'Monthly', icon: Medal },
  { id: 'gifts', name: 'Gifts', icon: Gift },
  { id: 'rooms', name: 'Rooms', icon: Crown },
];

export default function RankingScreen() {
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [selectedRegion, setSelectedRegion] = useState('global');

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#666';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const getChangeIndicator = (change: string) => {
    if (change === 'up') return { icon: '↗️', color: '#4CAF50' };
    if (change === 'down') return { icon: '↘️', color: '#F44336' };
    return { icon: '→', color: '#666' };
  };

  const topThree = mockUsers.slice(0, 3);
  const otherUsers = mockUsers.slice(3);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
          <TouchableOpacity style={styles.regionButton}>
            <Text style={styles.regionText}>🌍 Global</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.activeCategoryButton
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <IconComponent 
                  size={16} 
                  color={selectedCategory === category.id ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.activeCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Top 3 Podium */}
        <View style={styles.podiumContainer}>
          <View style={styles.podium}>
            {/* Second Place */}
            <View style={styles.podiumItem}>
              <View style={styles.podiumRank}>
                <Text style={styles.podiumRankText}>2nd</Text>
              </View>
              <View style={styles.podiumUser}>
                <Image source={{ uri: topThree[1].avatar }} style={styles.podiumAvatar} />
                {topThree[1].isVip && (
                  <View style={styles.vipBadge}>
                    <Crown size={12} color="#ffd700" />
                  </View>
                )}
                <Text style={styles.podiumName}>{topThree[1].name}</Text>
                <Text style={styles.podiumPoints}>{topThree[1].points.toLocaleString()}</Text>
              </View>
            </View>

            {/* First Place */}
            <View style={[styles.podiumItem, styles.firstPlace]}>
              <View style={styles.crownContainer}>
                <Crown size={24} color="#FFD700" />
              </View>
              <View style={styles.podiumRank}>
                <Text style={styles.podiumRankText}>1st</Text>
              </View>
              <View style={styles.podiumUser}>
                <Image source={{ uri: topThree[0].avatar }} style={[styles.podiumAvatar, styles.firstAvatar]} />
                {topThree[0].isVip && (
                  <View style={styles.vipBadge}>
                    <Crown size={12} color="#ffd700" />
                  </View>
                )}
                <Text style={styles.podiumName}>{topThree[0].name}</Text>
                <Text style={styles.podiumPoints}>{topThree[0].points.toLocaleString()}</Text>
              </View>
            </View>

            {/* Third Place */}
            <View style={styles.podiumItem}>
              <View style={styles.podiumRank}>
                <Text style={styles.podiumRankText}>3rd</Text>
              </View>
              <View style={styles.podiumUser}>
                <Image source={{ uri: topThree[2].avatar }} style={styles.podiumAvatar} />
                {topThree[2].isVip && (
                  <View style={styles.vipBadge}>
                    <Crown size={12} color="#ffd700" />
                  </View>
                )}
                <Text style={styles.podiumName}>{topThree[2].name}</Text>
                <Text style={styles.podiumPoints}>{topThree[2].points.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rankings List */}
        <ScrollView style={styles.rankingsList}>
          <Text style={styles.sectionTitle}>Top Players</Text>
          {mockUsers.map((user, index) => {
            const change = getChangeIndicator(user.change);
            return (
              <TouchableOpacity key={user.id} style={styles.rankingItem}>
                <LinearGradient
                  colors={user.rank <= 3 ? ['#e91e63', '#ff6b9d'] : ['#2a2a3e', '#1a1a2e']}
                  style={styles.rankingGradient}
                >
                  <View style={styles.rankingLeft}>
                    <View style={styles.rankContainer}>
                      <Text style={[styles.rankNumber, { color: getRankColor(user.rank) }]}>
                        {user.rank <= 3 ? getRankIcon(user.rank) : user.rank}
                      </Text>
                      <Text style={[styles.changeIndicator, { color: change.color }]}>
                        {change.icon}
                      </Text>
                    </View>
                    
                    <View style={styles.userInfo}>
                      <View style={styles.avatarContainer}>
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        {user.isVip && (
                          <View style={styles.vipBadge}>
                            <Crown size={12} color="#ffd700" />
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.userDetails}>
                        <View style={styles.nameContainer}>
                          <Text style={styles.userName}>{user.name}</Text>
                          <Text style={styles.userCountry}>{user.country}</Text>
                        </View>
                        <Text style={styles.userLevel}>Level {user.level}</Text>
                        <View style={styles.achievements}>
                          {user.achievements.map((achievement, i) => (
                            <Text key={i} style={styles.achievement}>{achievement}</Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.rankingRight}>
                    <Text style={styles.points}>{user.points.toLocaleString()}</Text>
                    <Text style={styles.pointsLabel}>points</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
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
  regionButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  regionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  activeCategoryButton: {
    backgroundColor: '#e91e63',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  activeCategoryText: {
    color: '#fff',
  },
  podiumContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    height: 160,
  },
  firstPlace: {
    height: 180,
    backgroundColor: '#e91e63',
  },
  crownContainer: {
    position: 'absolute',
    top: -12,
  },
  podiumRank: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  podiumRankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  podiumUser: {
    alignItems: 'center',
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  firstAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  podiumName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  podiumPoints: {
    color: '#ccc',
    fontSize: 10,
    textAlign: 'center',
  },
  rankingsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  rankingItem: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  rankingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 40,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  changeIndicator: {
    fontSize: 12,
    marginTop: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userDetails: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  userCountry: {
    fontSize: 16,
  },
  userLevel: {
    color: '#e91e63',
    fontSize: 12,
    marginBottom: 5,
  },
  achievements: {
    flexDirection: 'row',
  },
  achievement: {
    fontSize: 12,
    marginRight: 5,
  },
  rankingRight: {
    alignItems: 'flex-end',
  },
  points: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsLabel: {
    color: '#ccc',
    fontSize: 12,
  },
});