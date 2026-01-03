/**
 * InviteRewardsService - Manages user invitations and diamond rewards
 */

export interface InviteReward {
  inviteCount: number;
  diamondsAwarded: number;
  claimedAt: Date;
}

export interface UserInviteStats {
  userId: string;
  totalInvites: number;
  pendingInvites: number;
  successfulInvites: number;
  totalDiamondsEarned: number;
  rewards: InviteReward[];
  nextRewardAt: number;
  nextRewardAmount: number;
}

interface InviteCode {
  code: string;
  userId: string;
  createdAt: Date;
  usedBy: string[];
}

class InviteRewardsServiceClass {
  private userStats: Map<string, UserInviteStats> = new Map();
  private inviteCodes: Map<string, InviteCode> = new Map();

  // Reward tiers
  private readonly REWARD_TIERS = [
    { requiredInvites: 10, diamonds: 1000 },
    { requiredInvites: 20, diamonds: 2500 },
    { requiredInvites: 50, diamonds: 5000 },
    { requiredInvites: 100, diamonds: 10000 },
  ];

  /**
   * Get or create user invite stats
   */
  getUserStats(userId: string): UserInviteStats {
    if (!this.userStats.has(userId)) {
      this.userStats.set(userId, {
        userId,
        totalInvites: 0,
        pendingInvites: 0,
        successfulInvites: 0,
        totalDiamondsEarned: 0,
        rewards: [],
        nextRewardAt: 10,
        nextRewardAmount: 1000,
      });
    }
    return this.userStats.get(userId)!;
  }

  /**
   * Generate unique invite code for user
   */
  generateInviteCode(userId: string): string {
    const code = `DAND${userId.slice(0, 4).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
    this.inviteCodes.set(code, {
      code,
      userId,
      createdAt: new Date(),
      usedBy: [],
    });
    return code;
  }

  /**
   * Get user's invite code
   */
  getUserInviteCode(userId: string): string {
    // Find existing code
    for (const [code, data] of this.inviteCodes.entries()) {
      if (data.userId === userId) {
        return code;
      }
    }
    // Generate new one
    return this.generateInviteCode(userId);
  }

  /**
   * Send invitation (increment pending invites)
   */
  sendInvitation(userId: string, method: 'whatsapp' | 'facebook' | 'twitter' | 'instagram' | 'copy'): void {
    const stats = this.getUserStats(userId);
    stats.pendingInvites += 1;
    stats.totalInvites += 1;
  }

  /**
   * Mark invitation as successful (when friend joins)
   */
  invitationAccepted(userId: string, inviteCode: string, friendUserId: string): boolean {
    const codeData = this.inviteCodes.get(inviteCode);
    if (!codeData || codeData.userId !== userId) {
      return false;
    }

    // Add friend to used list
    if (!codeData.usedBy.includes(friendUserId)) {
      codeData.usedBy.push(friendUserId);

      const stats = this.getUserStats(userId);
      stats.successfulInvites += 1;
      if (stats.pendingInvites > 0) {
        stats.pendingInvites -= 1;
      }

      // Check for rewards
      this.checkAndAwardRewards(userId);
      return true;
    }
    return false;
  }

  /**
   * Check if user qualifies for rewards and award them
   */
  private checkAndAwardRewards(userId: string): void {
    const stats = this.getUserStats(userId);
    const successfulInvites = stats.successfulInvites;

    for (const tier of this.REWARD_TIERS) {
      // Check if user reached this tier and hasn't claimed it yet
      const alreadyClaimed = stats.rewards.some(r => r.inviteCount === tier.requiredInvites);
      
      if (successfulInvites >= tier.requiredInvites && !alreadyClaimed) {
        // Award diamonds
        const reward: InviteReward = {
          inviteCount: tier.requiredInvites,
          diamondsAwarded: tier.diamonds,
          claimedAt: new Date(),
        };
        stats.rewards.push(reward);
        stats.totalDiamondsEarned += tier.diamonds;

        // Update next reward info
        this.updateNextReward(stats);
      }
    }
  }

  /**
   * Update next reward information
   */
  private updateNextReward(stats: UserInviteStats): void {
    const nextTier = this.REWARD_TIERS.find(
      tier => tier.requiredInvites > stats.successfulInvites
    );
    
    if (nextTier) {
      stats.nextRewardAt = nextTier.requiredInvites;
      stats.nextRewardAmount = nextTier.diamonds;
    } else {
      stats.nextRewardAt = -1; // All rewards claimed
      stats.nextRewardAmount = 0;
    }
  }

  /**
   * Get all reward tiers
   */
  getRewardTiers() {
    return this.REWARD_TIERS;
  }

  /**
   * Check if reward is claimable
   */
  canClaimReward(userId: string, requiredInvites: number): boolean {
    const stats = this.getUserStats(userId);
    const alreadyClaimed = stats.rewards.some(r => r.inviteCount === requiredInvites);
    return stats.successfulInvites >= requiredInvites && !alreadyClaimed;
  }

  /**
   * Manually claim reward (if auto-claim failed)
   */
  claimReward(userId: string, requiredInvites: number): number {
    if (!this.canClaimReward(userId, requiredInvites)) {
      return 0;
    }

    const tier = this.REWARD_TIERS.find(t => t.requiredInvites === requiredInvites);
    if (!tier) return 0;

    const stats = this.getUserStats(userId);
    const reward: InviteReward = {
      inviteCount: tier.requiredInvites,
      diamondsAwarded: tier.diamonds,
      claimedAt: new Date(),
    };
    
    stats.rewards.push(reward);
    stats.totalDiamondsEarned += tier.diamonds;
    this.updateNextReward(stats);

    return tier.diamonds;
  }

  /**
   * Get progress to next reward (0-100%)
   */
  getProgressToNextReward(userId: string): number {
    const stats = this.getUserStats(userId);
    if (stats.nextRewardAt === -1) return 100;

    const previousTier = this.REWARD_TIERS
      .filter(t => t.requiredInvites < stats.nextRewardAt)
      .pop();
    
    const previousCount = previousTier?.requiredInvites || 0;
    const range = stats.nextRewardAt - previousCount;
    const progress = stats.successfulInvites - previousCount;

    return Math.min(100, (progress / range) * 100);
  }

  /**
   * Initialize demo data
   */
  initializeDemoData(userId: string): void {
    const stats = this.getUserStats(userId);
    stats.totalInvites = 5;
    stats.pendingInvites = 2;
    stats.successfulInvites = 3;
  }
}

export const InviteRewardsService = new InviteRewardsServiceClass();
