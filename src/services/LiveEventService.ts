import { supabase, isSupabaseReady } from './db/supabaseClient';
import {
  LiveEvent,
  EventType,
  EventStatus,
  EventParticipant,
  ParticipantStatus,
  EventLeaderboard,
  EventMatch,
  EventPrize,
  EventSchedule,
  EventAnalytics
} from '../models/LiveEvent';

const STORAGE_KEYS = {
  EVENTS: 'events:all',
  MY_EVENTS: 'events:my',
  PARTICIPANTS: 'events:participants',
  LEADERBOARD: 'events:leaderboard',
  MATCHES: 'events:matches',
  SCHEDULE: 'events:schedule',
  ANALYTICS: 'events:analytics'
};

class LiveEventService {
  // =====================================================
  // إنشاء وإدارة الفعاليات
  // =====================================================

  async createEvent(
    hostId: string,
    title: string,
    description: string,
    type: EventType,
    startTime: Date,
    duration: number,
    maxParticipants: number,
    prizes: EventPrize[]
  ): Promise<LiveEvent> {
    const event: LiveEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      titleAr: title,
      description,
      descriptionAr: description,
      type,
      status: 'upcoming',
      hostId,
      hostName: '',
      hostAvatar: '',
      thumbnail: '',
      bannerImage: '',
      startTime,
      endTime: new Date(startTime.getTime() + duration * 60000),
      duration,
      maxParticipants,
      currentParticipants: 0,
      registeredCount: 0,
      requirements: {
        minLevel: 1,
        isPremiumOnly: false
      },
      prizes,
      rules: [],
      rulesAr: [],
      tags: [],
      category: type,
      isPublic: true,
      isFeatured: false,
      viewerCount: 0,
      totalViews: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isSupabaseReady && supabase) {
      try {
        await supabase.from('live_events').insert([{
          id: event.id,
          host_id: hostId,
          title: title,
          description: description,
          type: type,
          start_time: startTime.toISOString(),
          end_time: event.endTime.toISOString(),
          max_participants: maxParticipants,
          prizes: prizes,
          created_at: event.createdAt.toISOString()
        }]);
      } catch (error) {
        console.error('Error creating event:', error);
      }
    }

    const events = this.getAllEvents();
    events.push(event);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

    return event;
  }

  async startEvent(eventId: string): Promise<LiveEvent> {
    const event = this.getEvent(eventId);
    if (!event) throw new Error('Event not found');

    event.status = 'live';
    event.updatedAt = new Date();

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('live_events')
          .update({ status: 'live', updated_at: event.updatedAt.toISOString() })
          .eq('id', eventId);
      } catch (error) {
        console.error('Error starting event:', error);
      }
    }

    this.updateEvent(event);
    return event;
  }

  async endEvent(eventId: string): Promise<LiveEvent> {
    const event = this.getEvent(eventId);
    if (!event) throw new Error('Event not found');

    event.status = 'ended';
    event.updatedAt = new Date();

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('live_events')
          .update({ status: 'ended', updated_at: event.updatedAt.toISOString() })
          .eq('id', eventId);
      } catch (error) {
        console.error('Error ending event:', error);
      }
    }

    this.updateEvent(event);
    
    // حساب الفائزين وتوزيع الجوائز
    await this.distributeRewards(eventId);
    
    return event;
  }

  // =====================================================
  // تسجيل المشاركين
  // =====================================================

  async registerParticipant(
    eventId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    userLevel: number
  ): Promise<EventParticipant> {
    const event = this.getEvent(eventId);
    if (!event) throw new Error('Event not found');

    if (event.registeredCount >= event.maxParticipants) {
      throw new Error('Event is full');
    }

    // التحقق من المتطلبات
    if (event.requirements.minLevel > userLevel) {
      throw new Error('Level requirement not met');
    }

    const participant: EventParticipant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      userId,
      userName,
      userAvatar,
      userLevel,
      status: 'registered',
      registeredAt: new Date(),
      score: 0,
      rank: 0,
      achievements: [],
      stats: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalScore: 0,
        bestScore: 0,
        averageScore: 0,
        timeSpent: 0,
        completedChallenges: 0
      }
    };

    const participants = this.getEventParticipants(eventId);
    participants.push(participant);
    localStorage.setItem(`${STORAGE_KEYS.PARTICIPANTS}:${eventId}`, JSON.stringify(participants));

    // تحديث عدد المشتركين
    event.registeredCount++;
    this.updateEvent(event);

    if (isSupabaseReady && supabase) {
      try {
        await supabase.from('event_participants').insert([{
          id: participant.id,
          event_id: eventId,
          user_id: userId,
          registered_at: participant.registeredAt.toISOString()
        }]);

        await supabase
          .from('live_events')
          .update({ registered_count: event.registeredCount })
          .eq('id', eventId);
      } catch (error) {
        console.error('Error registering participant:', error);
      }
    }

    return participant;
  }

  async unregisterParticipant(eventId: string, userId: string): Promise<void> {
    const participants = this.getEventParticipants(eventId);
    const index = participants.findIndex(p => p.userId === userId);
    
    if (index !== -1) {
      participants.splice(index, 1);
      localStorage.setItem(`${STORAGE_KEYS.PARTICIPANTS}:${eventId}`, JSON.stringify(participants));

      const event = this.getEvent(eventId);
      if (event) {
        event.registeredCount = Math.max(0, event.registeredCount - 1);
        this.updateEvent(event);
      }

      if (isSupabaseReady && supabase) {
        try {
          await supabase
            .from('event_participants')
            .delete()
            .eq('event_id', eventId)
            .eq('user_id', userId);
        } catch (error) {
          console.error('Error unregistering participant:', error);
        }
      }
    }
  }

  // =====================================================
  // تحديث النتائج والإحصائيات
  // =====================================================

  async updateParticipantScore(
    eventId: string,
    userId: string,
    scoreToAdd: number
  ): Promise<EventParticipant> {
    const participants = this.getEventParticipants(eventId);
    const participant = participants.find(p => p.userId === userId);
    
    if (!participant) throw new Error('Participant not found');

    participant.score += scoreToAdd;
    participant.stats.totalScore += scoreToAdd;
    participant.stats.gamesPlayed++;
    
    if (scoreToAdd > participant.stats.bestScore) {
      participant.stats.bestScore = scoreToAdd;
    }
    
    participant.stats.averageScore = participant.stats.totalScore / participant.stats.gamesPlayed;
    participant.status = 'participating';

    localStorage.setItem(`${STORAGE_KEYS.PARTICIPANTS}:${eventId}`, JSON.stringify(participants));

    // تحديث الترتيب
    await this.updateLeaderboard(eventId);

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('event_participants')
          .update({
            score: participant.score,
            stats: participant.stats,
            status: participant.status
          })
          .eq('id', participant.id);
      } catch (error) {
        console.error('Error updating participant score:', error);
      }
    }

    return participant;
  }

  async updateLeaderboard(eventId: string): Promise<EventLeaderboard> {
    const participants = this.getEventParticipants(eventId);
    const event = this.getEvent(eventId);
    
    // ترتيب حسب النقاط
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
    
    const leaderboard: EventLeaderboard = {
      eventId,
      updatedAt: new Date(),
      entries: sortedParticipants.map((p, index) => {
        const rank = index + 1;
        p.rank = rank;
        
        const prize = event?.prizes.find(prize => prize.rank === rank);
        
        return {
          rank,
          userId: p.userId,
          userName: p.userName,
          userAvatar: p.userAvatar,
          score: p.score,
          stats: p.stats,
          prize,
          isWinner: rank <= (event?.prizes.length || 0)
        };
      })
    };

    localStorage.setItem(`${STORAGE_KEYS.LEADERBOARD}:${eventId}`, JSON.stringify(leaderboard));
    localStorage.setItem(`${STORAGE_KEYS.PARTICIPANTS}:${eventId}`, JSON.stringify(participants));

    return leaderboard;
  }

  // =====================================================
  // توزيع الجوائز
  // =====================================================

  private async distributeRewards(eventId: string): Promise<void> {
    const leaderboard = this.getLeaderboard(eventId);
    const event = this.getEvent(eventId);
    
    if (!leaderboard || !event) return;

    for (const entry of leaderboard.entries) {
      if (entry.prize) {
        // TODO: إضافة الجوائز للمستخدمين
        console.log(`Awarding ${entry.userName}: ${entry.prize.coins} coins, ${entry.prize.diamonds} diamonds`);
        
        // تحديث حالة المشارك
        const participants = this.getEventParticipants(eventId);
        const participant = participants.find(p => p.userId === entry.userId);
        if (participant) {
          participant.status = 'winner';
          localStorage.setItem(`${STORAGE_KEYS.PARTICIPANTS}:${eventId}`, JSON.stringify(participants));
        }
      }
    }
  }

  // =====================================================
  // المباريات والجولات (للبطولات)
  // =====================================================

  async createMatch(
    eventId: string,
    round: number,
    matchNumber: number,
    participants: string[]
  ): Promise<EventMatch> {
    const match: EventMatch = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      round,
      matchNumber,
      participants,
      scores: {},
      startTime: new Date(),
      status: 'pending'
    };

    const matches = this.getEventMatches(eventId);
    matches.push(match);
    localStorage.setItem(`${STORAGE_KEYS.MATCHES}:${eventId}`, JSON.stringify(matches));

    return match;
  }

  async updateMatchScore(
    matchId: string,
    userId: string,
    score: number
  ): Promise<void> {
    const matches = this.getAllMatches();
    const match = matches.find(m => m.id === matchId);
    
    if (!match) return;

    match.scores[userId] = score;
    match.status = 'live';

    // حفظ التحديث
    const eventMatches = this.getEventMatches(match.eventId);
    const index = eventMatches.findIndex(m => m.id === matchId);
    if (index !== -1) {
      eventMatches[index] = match;
      localStorage.setItem(`${STORAGE_KEYS.MATCHES}:${match.eventId}`, JSON.stringify(eventMatches));
    }
  }

  async completeMatch(matchId: string): Promise<EventMatch> {
    const matches = this.getAllMatches();
    const match = matches.find(m => m.id === matchId);
    
    if (!match) throw new Error('Match not found');

    // تحديد الفائز
    let highestScore = -1;
    let winner = '';
    
    for (const [userId, score] of Object.entries(match.scores)) {
      if (score > highestScore) {
        highestScore = score;
        winner = userId;
      }
    }

    match.winner = winner;
    match.status = 'completed';
    match.endTime = new Date();

    // حفظ التحديث
    const eventMatches = this.getEventMatches(match.eventId);
    const index = eventMatches.findIndex(m => m.id === matchId);
    if (index !== -1) {
      eventMatches[index] = match;
      localStorage.setItem(`${STORAGE_KEYS.MATCHES}:${match.eventId}`, JSON.stringify(eventMatches));
    }

    return match;
  }

  // =====================================================
  // البحث والتصفية
  // =====================================================

  getUpcomingEvents(): LiveEvent[] {
    return this.getAllEvents().filter(e => e.status === 'upcoming');
  }

  getLiveEvents(): LiveEvent[] {
    return this.getAllEvents().filter(e => e.status === 'live');
  }

  getPastEvents(): LiveEvent[] {
    return this.getAllEvents().filter(e => e.status === 'ended');
  }

  getEventsByType(type: EventType): LiveEvent[] {
    return this.getAllEvents().filter(e => e.type === type);
  }

  getFeaturedEvents(): LiveEvent[] {
    return this.getAllEvents().filter(e => e.isFeatured && e.status !== 'ended');
  }

  searchEvents(query: string): LiveEvent[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllEvents().filter(e =>
      e.title.toLowerCase().includes(lowerQuery) ||
      e.titleAr.toLowerCase().includes(lowerQuery) ||
      e.description.toLowerCase().includes(lowerQuery)
    );
  }

  // =====================================================
  // Helper Functions
  // =====================================================

  getAllEvents(): LiveEvent[] {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return data ? JSON.parse(data) : this.getSeedEvents();
  }

  getEvent(eventId: string): LiveEvent | null {
    return this.getAllEvents().find(e => e.id === eventId) || null;
  }

  private updateEvent(event: LiveEvent): void {
    const events = this.getAllEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index !== -1) {
      events[index] = event;
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    }
  }

  getEventParticipants(eventId: string): EventParticipant[] {
    const key = `${STORAGE_KEYS.PARTICIPANTS}:${eventId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  getLeaderboard(eventId: string): EventLeaderboard | null {
    const key = `${STORAGE_KEYS.LEADERBOARD}:${eventId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  getEventMatches(eventId: string): EventMatch[] {
    const key = `${STORAGE_KEYS.MATCHES}:${eventId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private getAllMatches(): EventMatch[] {
    const allMatches: EventMatch[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.MATCHES)) {
        const data = localStorage.getItem(key);
        if (data) {
          allMatches.push(...JSON.parse(data));
        }
      }
    }
    
    return allMatches;
  }

  isUserRegistered(eventId: string, userId: string): boolean {
    const participants = this.getEventParticipants(eventId);
    return participants.some(p => p.userId === userId);
  }

  // =====================================================
  // بيانات تجريبية
  // =====================================================

  private getSeedEvents(): LiveEvent[] {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'event_1',
        title: 'Voice Battle Championship',
        titleAr: 'بطولة معركة الأصوات',
        description: 'Compete with your voice and win amazing prizes!',
        descriptionAr: 'تنافس بصوتك واربح جوائز مذهلة!',
        type: 'tournament',
        status: 'upcoming',
        hostId: 'admin',
        hostName: 'Event Manager',
        hostAvatar: '',
        thumbnail: '/images/event1.jpg',
        bannerImage: '/images/event1-banner.jpg',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 180 * 60000),
        duration: 180,
        maxParticipants: 100,
        currentParticipants: 0,
        registeredCount: 0,
        requirements: {
          minLevel: 5,
          isPremiumOnly: false
        },
        prizes: [
          {
            rank: 1,
            title: 'Champion',
            titleAr: 'البطل',
            coins: 50000,
            diamonds: 5000,
            title_reward: 'Voice Champion',
            titleRewardAr: 'بطل الأصوات'
          },
          {
            rank: 2,
            title: 'Runner-up',
            titleAr: 'الوصيف',
            coins: 30000,
            diamonds: 3000
          },
          {
            rank: 3,
            title: 'Third Place',
            titleAr: 'المركز الثالث',
            coins: 20000,
            diamonds: 2000
          }
        ],
        rules: ['Be respectful', 'No cheating', 'Follow guidelines'],
        rulesAr: ['كن محترماً', 'لا غش', 'اتبع الإرشادات'],
        tags: ['voice', 'competition', 'prizes'],
        category: 'tournament',
        isPublic: true,
        isFeatured: true,
        viewerCount: 0,
        totalViews: 0,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'event_2',
        title: 'Daily Gift Challenge',
        titleAr: 'تحدي الهدايا اليومية',
        description: 'Send the most gifts today and win exclusive rewards!',
        descriptionAr: 'أرسل أكبر عدد من الهدايا اليوم واربح مكافآت حصرية!',
        type: 'challenge',
        status: 'live',
        hostId: 'admin',
        hostName: 'Event Manager',
        hostAvatar: '',
        thumbnail: '/images/event2.jpg',
        bannerImage: '/images/event2-banner.jpg',
        startTime: now,
        endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        duration: 1440,
        maxParticipants: 1000,
        currentParticipants: 45,
        registeredCount: 45,
        requirements: {
          minLevel: 1,
          isPremiumOnly: false
        },
        prizes: [
          {
            rank: 1,
            title: 'Gift Master',
            titleAr: 'سيد الهدايا',
            coins: 10000,
            diamonds: 1000
          }
        ],
        rules: ['Send real gifts only', 'No fake accounts'],
        rulesAr: ['أرسل هدايا حقيقية فقط', 'لا حسابات وهمية'],
        tags: ['gifts', 'daily', 'easy'],
        category: 'challenge',
        isPublic: true,
        isFeatured: true,
        viewerCount: 123,
        totalViews: 456,
        createdAt: now,
        updatedAt: now
      }
    ];
  }
}

export default new LiveEventService();
