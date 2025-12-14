/**
 * Lucky Bag Service
 * Random reward bags where multiple users contribute and one wins
 */

import { EconomyService } from './EconomyService';
import { ActivityLogService } from './ActivityLogService';

export type LuckyBagStatus = 'open' | 'filling' | 'ready' | 'drawn' | 'expired';

export interface LuckyBag {
  id: string;
  roomId: string;
  creatorId: string;
  creatorName: string;
  
  // Bag configuration
  totalPrice: number; // Total cost to fill the bag
  minReward: number;  // Minimum reward winner gets
  maxReward: number;  // Maximum reward winner gets
  maxParticipants: number;
  
  // Current state
  currentFunds: number;
  participants: LuckyBagParticipant[];
  status: LuckyBagStatus;
  
  // Winner
  winnerId?: string;
  winnerName?: string;
  winnerAvatar?: string;
  actualReward?: number;
  
  // Timing
  createdAt: Date;
  expiresAt: Date;
  drawnAt?: Date;
}

export interface LuckyBagParticipant {
  userId: string;
  username: string;
  avatar: string;
  amount: number;
  joinedAt: Date;
  chance: number; // Win probability (0-100)
}

export interface LuckyBagTemplate {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  price: number;
  minReward: number;
  maxReward: number;
  maxParticipants: number;
  color: string;
}

class LuckyBagServiceClass {
  private readonly BAGS_KEY = 'lucky_bags';
  
  // Predefined bag templates
  private readonly TEMPLATES: LuckyBagTemplate[] = [
    {
      id: 'bronze_bag',
      name: 'Bronze Bag',
      nameAr: 'حقيبة برونزية',
      icon: '🎒',
      price: 100,
      minReward: 50,
      maxReward: 200,
      maxParticipants: 10,
      color: 'from-orange-600 to-amber-600'
    },
    {
      id: 'silver_bag',
      name: 'Silver Bag',
      nameAr: 'حقيبة فضية',
      icon: '💼',
      price: 500,
      minReward: 250,
      maxReward: 1000,
      maxParticipants: 15,
      color: 'from-gray-400 to-gray-600'
    },
    {
      id: 'gold_bag',
      name: 'Gold Bag',
      nameAr: 'حقيبة ذهبية',
      icon: '👜',
      price: 2000,
      minReward: 1000,
      maxReward: 5000,
      maxParticipants: 20,
      color: 'from-yellow-500 to-amber-600'
    },
    {
      id: 'diamond_bag',
      name: 'Diamond Bag',
      nameAr: 'حقيبة ماسية',
      icon: '💎',
      price: 10000,
      minReward: 5000,
      maxReward: 25000,
      maxParticipants: 30,
      color: 'from-cyan-400 to-blue-600'
    },
    {
      id: 'supreme_bag',
      name: 'Supreme Bag',
      nameAr: 'الحقيبة الملكية',
      icon: '👑',
      price: 50000,
      minReward: 30000,
      maxReward: 150000,
      maxParticipants: 50,
      color: 'from-purple-600 to-pink-600'
    }
  ];

  /**
   * Get all bag templates
   */
  getTemplates(): LuckyBagTemplate[] {
    return this.TEMPLATES;
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): LuckyBagTemplate | null {
    return this.TEMPLATES.find(t => t.id === templateId) || null;
  }

  /**
   * Create a new lucky bag
   */
  createBag(
    roomId: string,
    creatorId: string,
    creatorName: string,
    templateId: string,
    durationMinutes: number = 5
  ): LuckyBag | null {
    const template = this.getTemplate(templateId);
    
    if (!template) {
      return null;
    }

    // Check creator balance
    const balance = EconomyService.getBalance(creatorId);
    if (balance.coins < template.price) {
      throw new Error('Insufficient coins');
    }

    // Deduct coins from creator
    EconomyService.deductCoins(
      creatorId,
      template.price,
      `Created lucky bag: ${template.name}`
    );

    const bag: LuckyBag = {
      id: `bag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      creatorId,
      creatorName,
      totalPrice: template.price,
      minReward: template.minReward,
      maxReward: template.maxReward,
      maxParticipants: template.maxParticipants,
      currentFunds: template.price,
      participants: [],
      status: 'open',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000)
    };

    this.saveBag(bag);

    // Log activity
    ActivityLogService.logActivity({
      userId: creatorId,
      action: 'lucky_bag_create',
      category: 'game',
      details: `Created ${template.name} in room ${roomId}`,
      metadata: { bagId: bag.id, templateId, roomId }
    });

    // Schedule auto-draw
    setTimeout(() => {
      this.autoDraw(bag.id);
    }, durationMinutes * 60 * 1000);

    return bag;
  }

  /**
   * Join lucky bag
   */
  joinBag(
    bagId: string,
    userId: string,
    username: string,
    avatar: string,
    amount: number
  ): boolean {
    const bag = this.getBag(bagId);
    
    if (!bag) {
      return false;
    }

    // Validate
    if (bag.status !== 'open') {
      throw new Error('Bag is not accepting participants');
    }

    if (bag.participants.length >= bag.maxParticipants) {
      throw new Error('Bag is full');
    }

    if (bag.participants.find(p => p.userId === userId)) {
      throw new Error('Already joined this bag');
    }

    if (new Date() > bag.expiresAt) {
      bag.status = 'expired';
      this.saveBag(bag);
      throw new Error('Bag has expired');
    }

    // Check balance
    const balance = EconomyService.getBalance(userId);
    if (balance.coins < amount) {
      throw new Error('Insufficient coins');
    }

    // Deduct coins
    EconomyService.deductCoins(userId, amount, `Joined lucky bag: ${bagId}`);

    // Add participant
    const participant: LuckyBagParticipant = {
      userId,
      username,
      avatar,
      amount,
      joinedAt: new Date(),
      chance: 0 // Will be calculated
    };

    bag.participants.push(participant);
    bag.currentFunds += amount;

    // Calculate win chances
    this.calculateChances(bag);

    // Check if bag is full
    if (bag.participants.length >= bag.maxParticipants) {
      bag.status = 'ready';
      // Auto-draw after 5 seconds
      setTimeout(() => this.drawWinner(bagId), 5000);
    } else {
      bag.status = 'filling';
    }

    this.saveBag(bag);

    return true;
  }

  /**
   * Calculate win chances for all participants
   */
  private calculateChances(bag: LuckyBag) {
    const totalInvestment = bag.participants.reduce((sum, p) => sum + p.amount, 0);
    
    bag.participants.forEach(participant => {
      participant.chance = (participant.amount / totalInvestment) * 100;
    });
  }

  /**
   * Draw winner
   */
  drawWinner(bagId: string): boolean {
    const bag = this.getBag(bagId);
    
    if (!bag) {
      return false;
    }

    if (bag.status !== 'ready' && bag.status !== 'filling') {
      return false;
    }

    if (bag.participants.length === 0) {
      bag.status = 'expired';
      this.saveBag(bag);
      return false;
    }

    // Calculate weighted random winner
    const totalChance = bag.participants.reduce((sum, p) => sum + p.chance, 0);
    let random = Math.random() * totalChance;
    
    let winner = bag.participants[0];
    
    for (const participant of bag.participants) {
      random -= participant.chance;
      if (random <= 0) {
        winner = participant;
        break;
      }
    }

    // Calculate actual reward (random between min and max)
    const rewardRange = bag.maxReward - bag.minReward;
    const actualReward = bag.minReward + Math.floor(Math.random() * rewardRange);

    // Award coins to winner
    EconomyService.addCoins(
      winner.userId,
      actualReward,
      'lucky_bag_win',
      `Won lucky bag: ${bagId}`
    );

    // Update bag
    bag.winnerId = winner.userId;
    bag.winnerName = winner.username;
    bag.winnerAvatar = winner.avatar;
    bag.actualReward = actualReward;
    bag.status = 'drawn';
    bag.drawnAt = new Date();

    this.saveBag(bag);

    // Log activity
    ActivityLogService.logActivity({
      userId: winner.userId,
      action: 'lucky_bag_win',
      category: 'game',
      details: `Won ${actualReward} coins from lucky bag`,
      metadata: {
        bagId,
        reward: actualReward,
        participants: bag.participants.length
      }
    });

    return true;
  }

  /**
   * Auto-draw when time expires
   */
  private autoDraw(bagId: string) {
    const bag = this.getBag(bagId);
    
    if (!bag || bag.status === 'drawn' || bag.status === 'expired') {
      return;
    }

    if (bag.participants.length === 0) {
      // Refund creator if no one joined
      EconomyService.addCoins(
        bag.creatorId,
        bag.totalPrice,
        'lucky_bag_refund',
        `Lucky bag refund: ${bagId}`
      );
      
      bag.status = 'expired';
      this.saveBag(bag);
      return;
    }

    // Draw winner
    bag.status = 'ready';
    this.saveBag(bag);
    this.drawWinner(bagId);
  }

  /**
   * Get active bags in room
   */
  getRoomBags(roomId: string): LuckyBag[] {
    return this.getBags()
      .filter(bag => 
        bag.roomId === roomId && 
        (bag.status === 'open' || bag.status === 'filling' || bag.status === 'ready')
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get user's bag history
   */
  getUserHistory(userId: string): {
    created: number;
    participated: number;
    won: number;
    totalWinnings: number;
    totalSpent: number;
  } {
    const bags = this.getBags();

    const created = bags.filter(b => b.creatorId === userId).length;
    const participated = bags.filter(b => 
      b.participants.some(p => p.userId === userId)
    ).length;
    const won = bags.filter(b => b.winnerId === userId).length;
    
    const totalWinnings = bags
      .filter(b => b.winnerId === userId)
      .reduce((sum, b) => sum + (b.actualReward || 0), 0);
    
    const totalSpent = bags
      .filter(b => b.participants.some(p => p.userId === userId))
      .reduce((sum, b) => {
        const participant = b.participants.find(p => p.userId === userId);
        return sum + (participant?.amount || 0);
      }, 0);

    return {
      created,
      participated,
      won,
      totalWinnings,
      totalSpent
    };
  }

  /**
   * Get recent winners
   */
  getRecentWinners(limit: number = 10): Array<{
    bagId: string;
    winnerId: string;
    winnerName: string;
    winnerAvatar: string;
    reward: number;
    drawnAt: Date;
  }> {
    return this.getBags()
      .filter(bag => bag.status === 'drawn' && bag.winnerId)
      .sort((a, b) => 
        new Date(b.drawnAt!).getTime() - new Date(a.drawnAt!).getTime()
      )
      .slice(0, limit)
      .map(bag => ({
        bagId: bag.id,
        winnerId: bag.winnerId!,
        winnerName: bag.winnerName!,
        winnerAvatar: bag.winnerAvatar!,
        reward: bag.actualReward!,
        drawnAt: bag.drawnAt!
      }));
  }

  // ==================== Storage Methods ====================

  private saveBag(bag: LuckyBag) {
    const bags = this.getBags();
    const index = bags.findIndex(b => b.id === bag.id);
    
    if (index !== -1) {
      bags[index] = bag;
    } else {
      bags.push(bag);
    }
    
    localStorage.setItem(this.BAGS_KEY, JSON.stringify(bags));
  }

  getBags(): LuckyBag[] {
    try {
      const data = localStorage.getItem(this.BAGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getBag(bagId: string): LuckyBag | null {
    return this.getBags().find(b => b.id === bagId) || null;
  }
}

export const LuckyBagService = new LuckyBagServiceClass();
