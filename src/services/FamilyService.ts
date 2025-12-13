import type { 
  Family, 
  FamilyMember, 
  FamilyRole,
  FamilyPrivacy,
  FamilyInvite,
  FamilyJoinRequest,
  FamilyLeaderboard,
  FamilyEvent,
  FamilyMission,
  FamilyRoom
} from '@/models/Family';

class FamilyServiceClass {
  private readonly STORAGE_KEY = 'families';
  private readonly USER_FAMILY_KEY = 'user_families';
  private readonly INVITES_KEY = 'family_invites';
  private readonly REQUESTS_KEY = 'family_requests';

  // ============== Family CRUD ==============

  createFamily(
    userId: string,
    name: string,
    tagline: string,
    description: string,
    privacy: FamilyPrivacy = 'public'
  ): { success: boolean; message: string; family?: Family } {
    // Check if user already in a family
    if (this.getUserFamily(userId)) {
      return { success: false, message: 'أنت بالفعل في عائلة. يجب المغادرة أولاً' };
    }

    const families = this.getAllFamilies();
    
    // Check if name is taken
    if (families.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      return { success: false, message: 'اسم العائلة مستخدم بالفعل' };
    }

    const newFamily: Family = {
      id: `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      tagline,
      description,
      logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
      banner: `https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop`,
      colors: {
        primary: '#8B5CF6',
        secondary: '#EC4899'
      },
      privacy,
      createdAt: Date.now(),
      createdBy: userId,
      members: [{
        userId,
        userName: 'Leader',
        userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        role: 'leader',
        joinedAt: Date.now(),
        contributionPoints: 0,
        level: 1,
        isOnline: true
      }],
      stats: {
        totalMembers: 1,
        activeMembers: 1,
        totalPoints: 0,
        weeklyPoints: 0,
        rank: families.length + 1,
        level: 1,
        nextLevelPoints: 1000,
        roomsCreated: 0,
        eventsHosted: 0
      },
      rooms: [],
      events: [],
      missions: this.generateDailyMissions(),
      badges: [],
      rules: [
        'احترام جميع الأعضاء',
        'المشاركة الفعالة',
        'عدم نشر محتوى غير لائق'
      ],
      requirements: {
        minLevel: 1,
        minAge: 13,
        requiresApproval: privacy !== 'public'
      }
    };

    families.push(newFamily);
    this.saveFamilies(families);
    this.setUserFamily(userId, newFamily.id);

    return { success: true, message: 'تم إنشاء العائلة بنجاح! 🎉', family: newFamily };
  }

  getFamily(familyId: string): Family | null {
    const families = this.getAllFamilies();
    return families.find(f => f.id === familyId) || null;
  }

  getAllFamilies(): Family[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  updateFamily(familyId: string, updates: Partial<Family>): boolean {
    const families = this.getAllFamilies();
    const index = families.findIndex(f => f.id === familyId);
    
    if (index === -1) return false;

    families[index] = { ...families[index], ...updates };
    this.saveFamilies(families);
    return true;
  }

  deleteFamily(familyId: string): boolean {
    const families = this.getAllFamilies();
    const filtered = families.filter(f => f.id !== familyId);
    
    if (filtered.length === families.length) return false;

    this.saveFamilies(filtered);
    
    // Remove from all users
    const userFamilies = this.getAllUserFamilies();
    Object.keys(userFamilies).forEach(userId => {
      if (userFamilies[userId] === familyId) {
        delete userFamilies[userId];
      }
    });
    localStorage.setItem(this.USER_FAMILY_KEY, JSON.stringify(userFamilies));
    
    return true;
  }

  // ============== Member Management ==============

  addMember(
    familyId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    role: FamilyRole = 'member'
  ): boolean {
    const family = this.getFamily(familyId);
    if (!family) return false;

    // Check if already a member
    if (family.members.some(m => m.userId === userId)) return false;

    const newMember: FamilyMember = {
      userId,
      userName,
      userAvatar,
      role,
      joinedAt: Date.now(),
      contributionPoints: 0,
      level: 1,
      isOnline: false
    };

    family.members.push(newMember);
    family.stats.totalMembers = family.members.length;
    
    this.updateFamily(familyId, family);
    this.setUserFamily(userId, familyId);
    
    return true;
  }

  removeMember(familyId: string, userId: string): boolean {
    const family = this.getFamily(familyId);
    if (!family) return false;

    // Can't remove leader
    const member = family.members.find(m => m.userId === userId);
    if (member?.role === 'leader') return false;

    family.members = family.members.filter(m => m.userId !== userId);
    family.stats.totalMembers = family.members.length;
    
    this.updateFamily(familyId, family);
    this.removeUserFamily(userId);
    
    return true;
  }

  updateMemberRole(familyId: string, userId: string, newRole: FamilyRole): boolean {
    const family = this.getFamily(familyId);
    if (!family) return false;

    const member = family.members.find(m => m.userId === userId);
    if (!member) return false;

    member.role = newRole;
    this.updateFamily(familyId, family);
    
    return true;
  }

  getMembersByFamily(familyId: string): FamilyMember[] {
    const family = this.getFamily(familyId);
    return family?.members || [];
  }

  addContributionPoints(familyId: string, userId: string, points: number): void {
    const family = this.getFamily(familyId);
    if (!family) return;

    const member = family.members.find(m => m.userId === userId);
    if (!member) return;

    member.contributionPoints += points;
    family.stats.totalPoints += points;
    family.stats.weeklyPoints += points;

    // Check level up
    while (family.stats.totalPoints >= family.stats.nextLevelPoints) {
      family.stats.level++;
      family.stats.nextLevelPoints = family.stats.level * 1000;
    }

    this.updateFamily(familyId, family);
  }

  // ============== User-Family Mapping ==============

  getUserFamily(userId: string): string | null {
    const userFamilies = this.getAllUserFamilies();
    return userFamilies[userId] || null;
  }

  setUserFamily(userId: string, familyId: string): void {
    const userFamilies = this.getAllUserFamilies();
    userFamilies[userId] = familyId;
    localStorage.setItem(this.USER_FAMILY_KEY, JSON.stringify(userFamilies));
  }

  removeUserFamily(userId: string): void {
    const userFamilies = this.getAllUserFamilies();
    delete userFamilies[userId];
    localStorage.setItem(this.USER_FAMILY_KEY, JSON.stringify(userFamilies));
  }

  private getAllUserFamilies(): Record<string, string> {
    const stored = localStorage.getItem(this.USER_FAMILY_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  // ============== Invites & Requests ==============

  sendInvite(familyId: string, invitedBy: string, invitedByName: string, invitedUser: string): string {
    const family = this.getFamily(familyId);
    if (!family) return '';

    const invite: FamilyInvite = {
      id: `invite_${Date.now()}`,
      familyId,
      familyName: family.name,
      invitedBy,
      invitedByName,
      invitedUser,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending'
    };

    const invites = this.getAllInvites();
    invites.push(invite);
    localStorage.setItem(this.INVITES_KEY, JSON.stringify(invites));

    return invite.id;
  }

  getInvitesForUser(userId: string): FamilyInvite[] {
    const invites = this.getAllInvites();
    return invites.filter(i => i.invitedUser === userId && i.status === 'pending');
  }

  acceptInvite(inviteId: string, userId: string, userName: string, userAvatar: string): boolean {
    const invites = this.getAllInvites();
    const invite = invites.find(i => i.id === inviteId);
    
    if (!invite || invite.status !== 'pending') return false;

    invite.status = 'accepted';
    localStorage.setItem(this.INVITES_KEY, JSON.stringify(invites));

    return this.addMember(invite.familyId, userId, userName, userAvatar);
  }

  rejectInvite(inviteId: string): boolean {
    const invites = this.getAllInvites();
    const invite = invites.find(i => i.id === inviteId);
    
    if (!invite) return false;

    invite.status = 'rejected';
    localStorage.setItem(this.INVITES_KEY, JSON.stringify(invites));
    
    return true;
  }

  private getAllInvites(): FamilyInvite[] {
    const stored = localStorage.getItem(this.INVITES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  submitJoinRequest(
    familyId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    userLevel: number,
    message: string
  ): string {
    const request: FamilyJoinRequest = {
      id: `request_${Date.now()}`,
      familyId,
      userId,
      userName,
      userAvatar,
      userLevel,
      message,
      createdAt: Date.now(),
      status: 'pending'
    };

    const requests = this.getAllRequests();
    requests.push(request);
    localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));

    return request.id;
  }

  getRequestsForFamily(familyId: string): FamilyJoinRequest[] {
    const requests = this.getAllRequests();
    return requests.filter(r => r.familyId === familyId && r.status === 'pending');
  }

  approveRequest(requestId: string): boolean {
    const requests = this.getAllRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request || request.status !== 'pending') return false;

    request.status = 'approved';
    localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));

    return this.addMember(
      request.familyId,
      request.userId,
      request.userName,
      request.userAvatar
    );
  }

  rejectRequest(requestId: string): boolean {
    const requests = this.getAllRequests();
    const request = requests.find(r => r.id === requestId);
    
    if (!request) return false;

    request.status = 'rejected';
    localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    
    return true;
  }

  private getAllRequests(): FamilyJoinRequest[] {
    const stored = localStorage.getItem(this.REQUESTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // ============== Leaderboard ==============

  getLeaderboard(limit: number = 100): FamilyLeaderboard[] {
    const families = this.getAllFamilies();
    
    const sorted = families
      .map((family, index) => ({
        rank: index + 1,
        familyId: family.id,
        familyName: family.name,
        familyLogo: family.logo,
        points: family.stats.totalPoints,
        members: family.stats.totalMembers,
        level: family.stats.level,
        change: 0 // Would need historical data
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    // Update ranks
    sorted.forEach((item, index) => {
      item.rank = index + 1;
    });

    return sorted;
  }

  // ============== Missions ==============

  private generateDailyMissions(): FamilyMission[] {
    return [
      {
        id: 'daily_1',
        title: 'المشاركة الجماعية',
        description: 'اجمع 10 أعضاء في غرفة صوتية',
        type: 'daily',
        target: 10,
        current: 0,
        reward: { coins: 500, exp: 100, familyPoints: 50 },
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        completed: false
      },
      {
        id: 'daily_2',
        title: 'هدايا العائلة',
        description: 'أرسل 5 هدايا لأعضاء العائلة',
        type: 'daily',
        target: 5,
        current: 0,
        reward: { coins: 300, exp: 50, familyPoints: 30 },
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        completed: false
      }
    ];
  }

  // ============== Rooms ==============

  createFamilyRoom(familyId: string, name: string, isPrivate: boolean, createdBy: string): string {
    const family = this.getFamily(familyId);
    if (!family) return '';

    const room: FamilyRoom = {
      id: `room_${Date.now()}`,
      name,
      type: 'voice',
      isPrivate,
      currentUsers: 0,
      maxUsers: 20,
      createdBy,
      createdAt: Date.now()
    };

    family.rooms.push(room);
    family.stats.roomsCreated++;
    this.updateFamily(familyId, family);

    return room.id;
  }

  // ============== Utility ==============

  private saveFamilies(families: Family[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(families));
  }

  searchFamilies(query: string): Family[] {
    const families = this.getAllFamilies();
    const lowerQuery = query.toLowerCase();
    
    return families.filter(f => 
      f.name.toLowerCase().includes(lowerQuery) ||
      f.tagline.toLowerCase().includes(lowerQuery)
    );
  }

  canUserJoin(userId: string, familyId: string): { canJoin: boolean; reason?: string } {
    const family = this.getFamily(familyId);
    if (!family) return { canJoin: false, reason: 'العائلة غير موجودة' };

    if (this.getUserFamily(userId)) {
      return { canJoin: false, reason: 'أنت بالفعل في عائلة' };
    }

    if (family.privacy === 'private') {
      return { canJoin: false, reason: 'عائلة خاصة - تحتاج دعوة' };
    }

    return { canJoin: true };
  }
}

export const FamilyService = new FamilyServiceClass();
