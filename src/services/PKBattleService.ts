/**
 * PK Battle Service
 * Manages voice room battles (PK system like Lama/Yalla)
 */

import {
  PKBattle,
  PKBattleRoom,
  PKBattleInvite,
  PKBattleGift,
  PKBattleStats,
  PKBattleHistory,
  PKLeaderboardEntry,
  PKBattleStatus,
  PKBattleType
} from '@/models/PKBattle';
import { GiftService } from './GiftService';
import { EconomyService } from './EconomyService';
import { ActivityLogService } from './ActivityLogService';

class PKBattleServiceClass {
  private readonly BATTLES_KEY = 'pk_battles';
  private readonly INVITES_KEY = 'pk_invites';
  private readonly GIFTS_KEY = 'pk_gifts';
  private readonly HISTORY_KEY = 'pk_history';
  
  // Battle durations (in seconds)
  private readonly DURATIONS = {
    quick: 180,      // 3 minutes
    standard: 300,   // 5 minutes
    ranked: 600      // 10 minutes
  };

  // Countdown before battle starts
  private readonly COUNTDOWN_SECONDS = 10;

  /**
   * Create a new PK battle
   */
  createBattle(
    hostRoomId: string,
    hostRoomName: string,
    hostId: string,
    hostName: string,
    hostAvatar: string,
    hostLevel: number,
    type: PKBattleType = 'standard'
  ): PKBattle {
    const battle: PKBattle = {
      id: `pk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: 'waiting',
      room1: {
        roomId: hostRoomId,
        roomName: hostRoomName,
        hostId,
        hostName,
        hostAvatar,
        hostLevel,
        score: 0,
        supporters: 0
      },
      room2: {
        roomId: '',
        roomName: '',
        hostId: '',
        hostName: '',
        hostAvatar: '',
        hostLevel: 0,
        score: 0,
        supporters: 0
      },
      duration: this.DURATIONS[type],
      totalGiftsValue: 0,
      totalParticipants: 0,
      createdAt: new Date(),
      createdBy: hostId
    };

    this.saveBattle(battle);
    
    return battle;
  }

  /**
   * Send PK invite to another room
   */
  inviteRoom(
    battleId: string,
    toRoomId: string,
    toHostId: string
  ): PKBattleInvite {
    const battle = this.getBattle(battleId);
    
    if (!battle) {
      throw new Error('Battle not found');
    }

    if (battle.status !== 'waiting') {
      throw new Error('Battle already started or finished');
    }

    const invite: PKBattleInvite = {
      id: `invite_${Date.now()}`,
      battleId,
      fromRoomId: battle.room1.roomId,
      fromHostId: battle.room1.hostId,
      fromHostName: battle.room1.hostName,
      toRoomId,
      toHostId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 60000), // 1 minute to accept
      createdAt: new Date()
    };

    this.saveInvite(invite);
    
    return invite;
  }

  /**
   * Accept PK invite
   */
  acceptInvite(
    inviteId: string,
    roomName: string,
    hostName: string,
    hostAvatar: string,
    hostLevel: number
  ): PKBattle | null {
    const invite = this.getInvite(inviteId);
    
    if (!invite || invite.status !== 'pending') {
      return null;
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      invite.status = 'expired';
      this.saveInvite(invite);
      return null;
    }

    const battle = this.getBattle(invite.battleId);
    
    if (!battle || battle.status !== 'waiting') {
      return null;
    }

    // Update battle with room2 info
    battle.room2 = {
      roomId: invite.toRoomId,
      roomName,
      hostId: invite.toHostId,
      hostName,
      hostAvatar,
      hostLevel,
      score: 0,
      supporters: 0
    };
    
    battle.status = 'countdown';
    battle.countdownStartTime = new Date();
    battle.invitedBy = invite.toHostId;

    this.saveBattle(battle);

    // Update invite status
    invite.status = 'accepted';
    this.saveInvite(invite);

    // Start countdown timer
    setTimeout(() => {
      this.startBattle(battle.id);
    }, this.COUNTDOWN_SECONDS * 1000);

    return battle;
  }

  /**
   * Reject PK invite
   */
  rejectInvite(inviteId: string): boolean {
    const invite = this.getInvite(inviteId);
    
    if (!invite || invite.status !== 'pending') {
      return false;
    }

    invite.status = 'rejected';
    this.saveInvite(invite);

    return true;
  }

  /**
   * Start battle (after countdown)
   */
  private startBattle(battleId: string) {
    const battle = this.getBattle(battleId);
    
    if (!battle || battle.status !== 'countdown') {
      return;
    }

    battle.status = 'active';
    battle.startTime = new Date();
    battle.endTime = new Date(Date.now() + battle.duration * 1000);

    this.saveBattle(battle);

    // Schedule battle end
    setTimeout(() => {
      this.endBattle(battleId);
    }, battle.duration * 1000);
  }

  /**
   * Send gift during battle
   */
  sendGift(
    battleId: string,
    roomId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    giftId: string,
    quantity: number = 1
  ): boolean {
    const battle = this.getBattle(battleId);
    
    if (!battle || battle.status !== 'active') {
      return false;
    }

    // Check if room is participating
    if (roomId !== battle.room1.roomId && roomId !== battle.room2.roomId) {
      return false;
    }

    const gift = GiftService.getGiftById(giftId);
    
    if (!gift) {
      return false;
    }

    const totalValue = gift.price * quantity;

    // Check user balance
    const balance = EconomyService.getBalance(senderId);
    if (balance.coins < totalValue) {
      return false;
    }

    // Deduct coins
    EconomyService.deductCoins(senderId, totalValue, `PK Battle gift: ${gift.name}`);

    // Create gift record
    const battleGift: PKBattleGift = {
      id: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      battleId,
      roomId,
      senderId,
      senderName,
      senderAvatar,
      giftId: gift.id,
      giftName: gift.name,
      giftValue: gift.price,
      quantity,
      totalValue,
      timestamp: new Date()
    };

    this.saveGift(battleGift);

    // Update battle scores
    if (roomId === battle.room1.roomId) {
      battle.room1.score += totalValue;
      const gifts = this.getBattleGifts(battleId);
      const uniqueSenders = new Set(
        gifts
          .filter(g => g.roomId === battle.room1.roomId)
          .map(g => g.senderId)
      );
      battle.room1.supporters = uniqueSenders.size;
    } else {
      battle.room2.score += totalValue;
      const gifts = this.getBattleGifts(battleId);
      const uniqueSenders = new Set(
        gifts
          .filter(g => g.roomId === battle.room2.roomId)
          .map(g => g.senderId)
      );
      battle.room2.supporters = uniqueSenders.size;
    }

    battle.totalGiftsValue += totalValue;

    this.saveBattle(battle);

    return true;
  }

  /**
   * End battle and determine winner
   */
  private endBattle(battleId: string) {
    const battle = this.getBattle(battleId);
    
    if (!battle || battle.status !== 'active') {
      return;
    }

    battle.status = 'finished';
    battle.endTime = new Date();

    // Determine winner
    if (battle.room1.score > battle.room2.score) {
      battle.winnerId = battle.room1.hostId;
      battle.winnerRoomId = battle.room1.roomId;
    } else if (battle.room2.score > battle.room1.score) {
      battle.winnerId = battle.room2.hostId;
      battle.winnerRoomId = battle.room2.roomId;
    }
    // If scores are equal, it's a draw (no winner)

    // Calculate rewards based on battle type
    const baseReward = {
      quick: { winner: 500, loser: 100 },
      standard: { winner: 1000, loser: 300 },
      ranked: { winner: 2500, loser: 500 }
    };

    const reward = baseReward[battle.type];

    battle.rewards = {
      winner: {
        coins: reward.winner,
        diamonds: Math.floor(reward.winner / 10),
        badge: battle.type === 'ranked' ? 'pk_champion' : undefined
      },
      loser: {
        coins: reward.loser,
        diamonds: Math.floor(reward.loser / 10)
      }
    };

    // Award coins to winner
    if (battle.winnerId) {
      EconomyService.addCoins(
        battle.winnerId,
        battle.rewards.winner.coins,
        'pk_battle_win',
        `PK Battle victory: ${battle.id}`
      );

      EconomyService.addDiamonds(
        battle.winnerId,
        battle.rewards.winner.diamonds,
        'pk_battle_win'
      );

      // Award to loser
      const loserId = battle.winnerId === battle.room1.hostId 
        ? battle.room2.hostId 
        : battle.room1.hostId;

      EconomyService.addCoins(
        loserId,
        battle.rewards.loser.coins,
        'pk_battle_participation',
        `PK Battle participation: ${battle.id}`
      );

      EconomyService.addDiamonds(
        loserId,
        battle.rewards.loser.diamonds,
        'pk_battle_participation'
      );
    }

    this.saveBattle(battle);

    // Update history for both hosts
    this.updateHistory(battle.room1.hostId, battle);
    this.updateHistory(battle.room2.hostId, battle);

    // Log activity
    ActivityLogService.logActivity({
      userId: battle.winnerId || battle.room1.hostId,
      action: 'pk_battle_complete',
      category: 'battle',
      details: `PK Battle completed: ${battle.room1.roomName} vs ${battle.room2.roomName}`,
      metadata: {
        battleId,
        winner: battle.winnerId,
        score1: battle.room1.score,
        score2: battle.room2.score
      }
    });
  }

  /**
   * Cancel battle
   */
  cancelBattle(battleId: string, userId: string): boolean {
    const battle = this.getBattle(battleId);
    
    if (!battle) {
      return false;
    }

    // Only hosts can cancel
    if (userId !== battle.room1.hostId && userId !== battle.room2.hostId) {
      return false;
    }

    // Can only cancel before it starts
    if (battle.status !== 'waiting' && battle.status !== 'countdown') {
      return false;
    }

    battle.status = 'cancelled';
    this.saveBattle(battle);

    return true;
  }

  /**
   * Get battle statistics
   */
  getBattleStats(battleId: string): PKBattleStats | null {
    const battle = this.getBattle(battleId);
    
    if (!battle) {
      return null;
    }

    const gifts = this.getBattleGifts(battleId);

    const room1Gifts = gifts.filter(g => g.roomId === battle.room1.roomId);
    const room2Gifts = gifts.filter(g => g.roomId === battle.room2.roomId);

    // Calculate top gifters
    const calculateTopGifters = (roomGifts: PKBattleGift[]) => {
      const gifterMap = new Map<string, {
        userId: string;
        username: string;
        avatar: string;
        totalValue: number;
      }>();

      roomGifts.forEach(gift => {
        const existing = gifterMap.get(gift.senderId);
        if (existing) {
          existing.totalValue += gift.totalValue;
        } else {
          gifterMap.set(gift.senderId, {
            userId: gift.senderId,
            username: gift.senderName,
            avatar: gift.senderAvatar,
            totalValue: gift.totalValue
          });
        }
      });

      return Array.from(gifterMap.values())
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);
    };

    // Calculate gift breakdown
    const calculateGiftBreakdown = (roomGifts: PKBattleGift[]) => {
      const breakdown: Record<string, number> = {};
      
      roomGifts.forEach(gift => {
        breakdown[gift.giftId] = (breakdown[gift.giftId] || 0) + gift.quantity;
      });

      return breakdown;
    };

    return {
      battleId,
      room1Stats: {
        totalGifts: room1Gifts.reduce((sum, g) => sum + g.quantity, 0),
        totalValue: battle.room1.score,
        topGifters: calculateTopGifters(room1Gifts),
        giftBreakdown: calculateGiftBreakdown(room1Gifts)
      },
      room2Stats: {
        totalGifts: room2Gifts.reduce((sum, g) => sum + g.quantity, 0),
        totalValue: battle.room2.score,
        topGifters: calculateTopGifters(room2Gifts),
        giftBreakdown: calculateGiftBreakdown(room2Gifts)
      }
    };
  }

  /**
   * Get user's battle history
   */
  getUserHistory(userId: string): PKBattleHistory {
    const stored = localStorage.getItem(`${this.HISTORY_KEY}_${userId}`);
    
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      userId,
      totalBattles: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      totalGiftsReceived: 0,
      totalGiftsSent: 0,
      highestScore: 0,
      winStreak: 0,
      currentStreak: 0,
      rank: 0
    };
  }

  /**
   * Update user's battle history
   */
  private updateHistory(userId: string, battle: PKBattle) {
    const history = this.getUserHistory(userId);

    history.totalBattles++;

    const isWinner = battle.winnerId === userId;
    const isDraw = !battle.winnerId;

    if (isWinner) {
      history.wins++;
      history.currentStreak++;
      history.winStreak = Math.max(history.winStreak, history.currentStreak);
    } else if (isDraw) {
      history.draws++;
      history.currentStreak = 0;
    } else {
      history.losses++;
      history.currentStreak = 0;
    }

    // Update gift totals
    const userRoom = battle.room1.hostId === userId ? battle.room1 : battle.room2;
    history.totalGiftsReceived += userRoom.score;
    history.highestScore = Math.max(history.highestScore, userRoom.score);

    localStorage.setItem(`${this.HISTORY_KEY}_${userId}`, JSON.stringify(history));
  }

  /**
   * Get PK leaderboard
   */
  getLeaderboard(limit: number = 100): PKLeaderboardEntry[] {
    const battles = this.getBattles();
    const userStats = new Map<string, {
      wins: number;
      losses: number;
      totalScore: number;
    }>();

    battles
      .filter(b => b.status === 'finished')
      .forEach(battle => {
        [battle.room1.hostId, battle.room2.hostId].forEach(userId => {
          if (!userStats.has(userId)) {
            userStats.set(userId, { wins: 0, losses: 0, totalScore: 0 });
          }
          
          const stats = userStats.get(userId)!;
          
          if (battle.winnerId === userId) {
            stats.wins++;
          } else if (battle.winnerId) {
            stats.losses++;
          }

          const userRoom = battle.room1.hostId === userId ? battle.room1 : battle.room2;
          stats.totalScore += userRoom.score;
        });
      });

    // Convert to leaderboard entries
    const entries: PKLeaderboardEntry[] = Array.from(userStats.entries())
      .map(([userId, stats]) => {
        const totalGames = stats.wins + stats.losses;
        return {
          rank: 0,
          userId,
          username: '', // Would need to fetch from user service
          avatar: '',
          level: 0,
          wins: stats.wins,
          losses: stats.losses,
          winRate: totalGames > 0 ? (stats.wins / totalGames) * 100 : 0,
          totalScore: stats.totalScore
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  /**
   * Get active battles
   */
  getActiveBattles(): PKBattle[] {
    return this.getBattles().filter(
      b => b.status === 'active' || b.status === 'countdown'
    );
  }

  /**
   * Get user's active battle
   */
  getUserActiveBattle(userId: string): PKBattle | null {
    const battles = this.getActiveBattles();
    
    return battles.find(
      b => b.room1.hostId === userId || b.room2.hostId === userId
    ) || null;
  }

  // ==================== Storage Methods ====================

  private saveBattle(battle: PKBattle) {
    const battles = this.getBattles();
    const index = battles.findIndex(b => b.id === battle.id);
    
    if (index !== -1) {
      battles[index] = battle;
    } else {
      battles.push(battle);
    }
    
    localStorage.setItem(this.BATTLES_KEY, JSON.stringify(battles));
  }

  getBattles(): PKBattle[] {
    try {
      const data = localStorage.getItem(this.BATTLES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getBattle(battleId: string): PKBattle | null {
    return this.getBattles().find(b => b.id === battleId) || null;
  }

  private saveInvite(invite: PKBattleInvite) {
    const invites = this.getInvites();
    const index = invites.findIndex(i => i.id === invite.id);
    
    if (index !== -1) {
      invites[index] = invite;
    } else {
      invites.push(invite);
    }
    
    localStorage.setItem(this.INVITES_KEY, JSON.stringify(invites));
  }

  getInvites(): PKBattleInvite[] {
    try {
      const data = localStorage.getItem(this.INVITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getInvite(inviteId: string): PKBattleInvite | null {
    return this.getInvites().find(i => i.id === inviteId) || null;
  }

  private saveGift(gift: PKBattleGift) {
    const gifts = this.getBattleGifts(gift.battleId);
    gifts.push(gift);
    
    const allGifts = this.getAllGifts();
    const filtered = allGifts.filter(g => g.battleId !== gift.battleId);
    filtered.push(...gifts);
    
    localStorage.setItem(this.GIFTS_KEY, JSON.stringify(filtered));
  }

  getBattleGifts(battleId: string): PKBattleGift[] {
    return this.getAllGifts().filter(g => g.battleId === battleId);
  }

  private getAllGifts(): PKBattleGift[] {
    try {
      const data = localStorage.getItem(this.GIFTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export const PKBattleService = new PKBattleServiceClass();
