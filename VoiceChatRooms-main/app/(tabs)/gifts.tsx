import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { 
  Gift, 
  Crown, 
  Heart, 
  Star, 
  Zap, 
  Sparkles,
  Coins,
  ShoppingCart,
  Package
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

interface GiftItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  effect?: string;
}

interface UserCoins {
  gold: number;
  silver: number;
  diamonds: number;
}

const mockGifts: GiftItem[] = [
  {
    id: '1',
    name: 'Rose',
    price: 10,
    icon: '🌹',
    rarity: 'common',
    description: 'A beautiful red rose',
    effect: 'Small sparkle effect',
  },
  {
    id: '2',
    name: 'Golden Crown',
    price: 500,
    icon: '👑',
    rarity: 'legendary',
    description: 'Show your royal status',
    effect: 'Crown animation with golden particles',
  },
  {
    id: '3',
    name: 'Diamond Ring',
    price: 1000,
    icon: '💎',
    rarity: 'legendary',
    description: 'The ultimate gift of luxury',
    effect: 'Diamond shower animation',
  },
  {
    id: '4',
    name: 'Sports Car',
    price: 2000,
    icon: '🏎️',
    rarity: 'legendary',
    description: 'Speed and luxury combined',
    effect: 'Car racing animation',
  },
  {
    id: '5',
    name: 'Teddy Bear',
    price: 50,
    icon: '🧸',
    rarity: 'common',
    description: 'Cute and cuddly',
    effect: 'Floating hearts',
  },
  {
    id: '6',
    name: 'Fireworks',
    price: 200,
    icon: '🎆',
    rarity: 'epic',
    description: 'Celebrate in style',
    effect: 'Explosive fireworks animation',
  },
  {
    id: '7',
    name: 'Love Letter',
    price: 25,
    icon: '💌',
    rarity: 'common',
    description: 'Express your feelings',
    effect: 'Letter opening animation',
  },
  {
    id: '8',
    name: 'Shooting Star',
    price: 800,
    icon: '⭐',
    rarity: 'epic',
    description: 'Make a wish',
    effect: 'Star trail animation',
  },
];

const coinPackages = [
  {
    id: '1',
    name: 'Starter Pack',
    gold: 1000,
    silver: 500,
    diamonds: 10,
    price: '$0.99',
    popular: false,
  },
  {
    id: '2',
    name: 'Popular Pack',
    gold: 5000,
    silver: 2500,
    diamonds: 50,
    price: '$4.99',
    popular: true,
  },
  {
    id: '3',
    name: 'Premium Pack',
    gold: 15000,
    silver: 7500,
    diamonds: 150,
    price: '$14.99',
    popular: false,
  },
  {
    id: '4',
    name: 'VIP Pack',
    gold: 50000,
    silver: 25000,
    diamonds: 500,
    price: '$49.99',
    popular: false,
  },
];

export default function GiftsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'gifts' | 'coins'>('gifts');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [userCoins, setUserCoins] = useState<UserCoins>({
    gold: 1250,
    silver: 750,
    diamonds: 25,
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#4CAF50';
      case 'rare':
        return '#2196F3';
      case 'epic':
        return '#9C27B0';
      case 'legendary':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const filteredGifts = selectedRarity === 'all' 
    ? mockGifts 
    : mockGifts.filter(gift => gift.rarity === selectedRarity);

  const buyGift = (gift: GiftItem) => {
    if (userCoins.gold >= gift.price) {
      setUserCoins(prev => ({ ...prev, gold: prev.gold - gift.price }));
      Alert.alert('Gift Purchased!', `You bought ${gift.name} for ${gift.price} gold coins.`);
    } else {
      Alert.alert('Insufficient Coins', 'You don\'t have enough gold coins to buy this gift.');
    }
  };

  const buyCoins = (pack: any) => {
    Alert.alert('Purchase Coins', `Buy ${pack.name} for ${pack.price}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Buy',
        onPress: () => {
          setUserCoins(prev => ({
            gold: prev.gold + pack.gold,
            silver: prev.silver + pack.silver,
            diamonds: prev.diamonds + pack.diamonds,
          }));
          Alert.alert('Success!', `You purchased ${pack.name}!`);
        },
      },
    ]);
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
          <Text style={styles.title}>Gift Shop</Text>
          <View style={styles.coinsContainer}>
            <View style={styles.coinItem}>
              <Text style={styles.coinText}>💰 {userCoins.gold}</Text>
            </View>
            <View style={styles.coinItem}>
              <Text style={styles.coinText}>🥈 {userCoins.silver}</Text>
            </View>
            <View style={styles.coinItem}>
              <Text style={styles.coinText}>💎 {userCoins.diamonds}</Text>
            </View>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedCategory === 'gifts' && styles.activeTab]}
            onPress={() => setSelectedCategory('gifts')}
          >
            <Gift size={20} color={selectedCategory === 'gifts' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, selectedCategory === 'gifts' && styles.activeTabText]}>
              Gifts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedCategory === 'coins' && styles.activeTab]}
            onPress={() => setSelectedCategory('coins')}
          >
            <Coins size={20} color={selectedCategory === 'coins' ? '#fff' : '#666'} />
            <Text style={[styles.tabText, selectedCategory === 'coins' && styles.activeTabText]}>
              Coins
            </Text>
          </TouchableOpacity>
        </View>

        {selectedCategory === 'gifts' ? (
          <>
            {/* Rarity Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
            >
              {['all', 'common', 'rare', 'epic', 'legendary'].map((rarity) => (
                <TouchableOpacity
                  key={rarity}
                  style={[
                    styles.filterButton,
                    selectedRarity === rarity && styles.activeFilter,
                    { borderColor: getRarityColor(rarity) }
                  ]}
                  onPress={() => setSelectedRarity(rarity)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedRarity === rarity && styles.activeFilterText
                  ]}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Gifts Grid */}
            <ScrollView style={styles.giftsContainer}>
              <View style={styles.giftsGrid}>
                {filteredGifts.map((gift) => (
                  <TouchableOpacity
                    key={gift.id}
                    style={[
                      styles.giftCard,
                      { borderColor: getRarityColor(gift.rarity) }
                    ]}
                    onPress={() => buyGift(gift)}
                  >
                    <LinearGradient
                      colors={['#2a2a3e', '#1a1a2e']}
                      style={styles.giftGradient}
                    >
                      <View style={styles.giftIcon}>
                        <Text style={styles.giftEmoji}>{gift.icon}</Text>
                      </View>
                      <Text style={styles.giftName}>{gift.name}</Text>
                      <Text style={styles.giftDescription}>{gift.description}</Text>
                      {gift.effect && (
                        <Text style={styles.giftEffect}>{gift.effect}</Text>
                      )}
                      <View style={styles.giftPrice}>
                        <Text style={styles.priceText}>💰 {gift.price}</Text>
                      </View>
                      <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(gift.rarity) }]}>
                        <Text style={styles.rarityText}>{gift.rarity}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </>
        ) : (
          /* Coins Section */
          <ScrollView style={styles.coinsSection}>
            <Text style={styles.sectionTitle}>Coin Packages</Text>
            {coinPackages.map((pack) => (
              <TouchableOpacity
                key={pack.id}
                style={[styles.coinPackage, pack.popular && styles.popularPackage]}
                onPress={() => buyCoins(pack)}
              >
                <LinearGradient
                  colors={pack.popular ? ['#e91e63', '#ff6b9d'] : ['#2a2a3e', '#1a1a2e']}
                  style={styles.packageGradient}
                >
                  {pack.popular && (
                    <View style={styles.popularBadge}>
                      <Star size={16} color="#fff" />
                      <Text style={styles.popularText}>POPULAR</Text>
                    </View>
                  )}
                  <View style={styles.packageHeader}>
                    <Text style={styles.packageName}>{pack.name}</Text>
                    <Text style={styles.packagePrice}>{pack.price}</Text>
                  </View>
                  <View style={styles.packageContents}>
                    <View style={styles.coinReward}>
                      <Text style={styles.coinEmoji}>💰</Text>
                      <Text style={styles.coinAmount}>{pack.gold.toLocaleString()}</Text>
                    </View>
                    <View style={styles.coinReward}>
                      <Text style={styles.coinEmoji}>🥈</Text>
                      <Text style={styles.coinAmount}>{pack.silver.toLocaleString()}</Text>
                    </View>
                    <View style={styles.coinReward}>
                      <Text style={styles.coinEmoji}>💎</Text>
                      <Text style={styles.coinAmount}>{pack.diamonds}</Text>
                    </View>
                  </View>
                  <View style={styles.buyButton}>
                    <ShoppingCart size={16} color="#fff" />
                    <Text style={styles.buyButtonText}>Purchase</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinItem: {
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
  },
  coinText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
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
    marginLeft: 8,
  },
  activeTabText: {
    color: '#fff',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a3e',
    marginRight: 10,
    borderWidth: 1,
  },
  activeFilter: {
    backgroundColor: '#e91e63',
  },
  filterText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  giftsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  giftCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    borderWidth: 2,
    overflow: 'hidden',
  },
  giftGradient: {
    padding: 15,
    alignItems: 'center',
    position: 'relative',
  },
  giftIcon: {
    marginBottom: 10,
  },
  giftEmoji: {
    fontSize: 30,
  },
  giftName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  giftDescription: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 5,
  },
  giftEffect: {
    fontSize: 10,
    color: '#e91e63',
    textAlign: 'center',
    marginBottom: 10,
  },
  giftPrice: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  rarityBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rarityText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  coinsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  coinPackage: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  popularPackage: {
    borderWidth: 2,
    borderColor: '#e91e63',
  },
  packageGradient: {
    padding: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff6b9d',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  packageContents: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  coinReward: {
    alignItems: 'center',
  },
  coinEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  coinAmount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});