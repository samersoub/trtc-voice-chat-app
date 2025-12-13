import { supabase, isSupabaseReady } from './db/supabaseClient';
import { 
  LiveStream, 
  StreamViewer, 
  StreamMessage, 
  StreamGift, 
  StreamHighlight,
  StreamSchedule,
  StreamRecording,
  StreamAnalytics,
  StreamSettings,
  StreamStatus,
  StreamType
} from '../models/LiveStream';

const STORAGE_KEYS = {
  STREAMS: 'livestreams:active',
  MY_STREAMS: 'livestreams:my',
  VIEWERS: 'livestreams:viewers',
  MESSAGES: 'livestreams:messages',
  GIFTS: 'livestreams:gifts',
  SCHEDULES: 'livestreams:schedules',
  RECORDINGS: 'livestreams:recordings',
  ANALYTICS: 'livestreams:analytics'
};

class LiveStreamService {
  // =====================================================
  // إنشاء وإدارة البث
  // =====================================================

  async createStream(
    hostId: string,
    title: string,
    description: string,
    category: string,
    type: StreamType = 'video',
    settings?: Partial<StreamSettings>
  ): Promise<LiveStream> {
    const stream: LiveStream = {
      id: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      hostId,
      hostName: '', // سيتم ملؤه من بيانات المستخدم
      hostAvatar: '',
      title,
      description,
      thumbnail: '',
      category,
      tags: [],
      status: 'preparing',
      type,
      startTime: new Date(),
      viewerCount: 0,
      peakViewerCount: 0,
      totalViews: 0,
      duration: 0,
      settings: {
        isPublic: true,
        allowComments: true,
        allowGifts: true,
        requireFollowToComment: false,
        requireSubscriptionToView: false,
        chatMode: 'open',
        quality: 'auto',
        bitrate: 2500,
        frameRate: 30,
        enableRecording: false,
        enableAutoTranscription: false,
        ...settings
      },
      monetization: {
        coinsEarned: 0,
        diamondsEarned: 0,
        giftsReceived: 0,
        subscriptionRevenue: 0,
        donationRevenue: 0,
        totalRevenue: 0
      },
      stats: {
        totalMessages: 0,
        totalGifts: 0,
        totalShares: 0,
        totalLikes: 0,
        engagementRate: 0,
        averageWatchTime: 0,
        topGifters: [],
        viewersByCountry: {},
        viewersByDevice: {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('live_streams')
          .insert([{
            id: stream.id,
            host_id: stream.hostId,
            title: stream.title,
            description: stream.description,
            category: stream.category,
            type: stream.type,
            status: stream.status,
            settings: stream.settings,
            created_at: stream.createdAt.toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
      } catch (error) {
        console.error('Error creating stream in Supabase:', error);
      }
    }

    // حفظ محلي
    const streams = this.getLocalStreams();
    streams.push(stream);
    localStorage.setItem(STORAGE_KEYS.STREAMS, JSON.stringify(streams));

    // حفظ في قائمة بثوثي
    const myStreams = this.getMyStreams(hostId);
    myStreams.push(stream);
    localStorage.setItem(`${STORAGE_KEYS.MY_STREAMS}:${hostId}`, JSON.stringify(myStreams));

    return stream;
  }

  async startStream(streamId: string): Promise<LiveStream> {
    const stream = await this.getStream(streamId);
    if (!stream) throw new Error('Stream not found');

    stream.status = 'live';
    stream.startTime = new Date();
    stream.updatedAt = new Date();

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('live_streams')
          .update({
            status: 'live',
            start_time: stream.startTime.toISOString(),
            updated_at: stream.updatedAt.toISOString()
          })
          .eq('id', streamId);
      } catch (error) {
        console.error('Error starting stream:', error);
      }
    }

    this.updateLocalStream(stream);
    return stream;
  }

  async endStream(streamId: string): Promise<LiveStream> {
    const stream = await this.getStream(streamId);
    if (!stream) throw new Error('Stream not found');

    stream.status = 'ended';
    stream.endTime = new Date();
    stream.duration = Math.floor((stream.endTime.getTime() - stream.startTime.getTime()) / 1000);
    stream.updatedAt = new Date();

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('live_streams')
          .update({
            status: 'ended',
            end_time: stream.endTime.toISOString(),
            duration: stream.duration,
            updated_at: stream.updatedAt.toISOString()
          })
          .eq('id', streamId);
      } catch (error) {
        console.error('Error ending stream:', error);
      }
    }

    this.updateLocalStream(stream);
    
    // إنشاء تسجيل إذا كان مفعل
    if (stream.settings.enableRecording) {
      await this.createRecording(stream);
    }

    // حساب التحليلات النهائية
    await this.calculateFinalAnalytics(streamId);

    return stream;
  }

  async pauseStream(streamId: string): Promise<LiveStream> {
    const stream = await this.getStream(streamId);
    if (!stream) throw new Error('Stream not found');

    stream.status = 'paused';
    stream.updatedAt = new Date();

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('live_streams')
          .update({
            status: 'paused',
            updated_at: stream.updatedAt.toISOString()
          })
          .eq('id', streamId);
      } catch (error) {
        console.error('Error pausing stream:', error);
      }
    }

    this.updateLocalStream(stream);
    return stream;
  }

  // =====================================================
  // إدارة المشاهدين
  // =====================================================

  async joinStream(streamId: string, userId: string, userName: string, avatar: string): Promise<StreamViewer> {
    const viewer: StreamViewer = {
      userId,
      userName,
      avatar,
      role: 'viewer',
      joinedAt: new Date(),
      watchTime: 0,
      messagesSent: 0,
      giftsSent: 0,
      isMuted: false,
      isBanned: false
    };

    // تحديث عدد المشاهدين
    const stream = await this.getStream(streamId);
    if (stream) {
      stream.viewerCount++;
      stream.totalViews++;
      if (stream.viewerCount > stream.peakViewerCount) {
        stream.peakViewerCount = stream.viewerCount;
      }
      this.updateLocalStream(stream);
    }

    // حفظ المشاهد
    const viewers = this.getStreamViewers(streamId);
    viewers.push(viewer);
    localStorage.setItem(`${STORAGE_KEYS.VIEWERS}:${streamId}`, JSON.stringify(viewers));

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('stream_viewers')
          .insert([{
            stream_id: streamId,
            user_id: userId,
            joined_at: viewer.joinedAt.toISOString()
          }]);

        await supabase
          .from('live_streams')
          .update({
            viewer_count: stream?.viewerCount,
            peak_viewer_count: stream?.peakViewerCount,
            total_views: stream?.totalViews
          })
          .eq('id', streamId);
      } catch (error) {
        console.error('Error joining stream:', error);
      }
    }

    // إرسال رسالة دخول
    await this.sendSystemMessage(streamId, `${userName} انضم للبث`);

    return viewer;
  }

  async leaveStream(streamId: string, userId: string): Promise<void> {
    const viewers = this.getStreamViewers(streamId);
    const viewerIndex = viewers.findIndex(v => v.userId === userId);
    
    if (viewerIndex !== -1) {
      const viewer = viewers[viewerIndex];
      viewer.leftAt = new Date();
      viewer.watchTime = Math.floor((viewer.leftAt.getTime() - viewer.joinedAt.getTime()) / 1000);
      
      // تحديث عدد المشاهدين
      const stream = await this.getStream(streamId);
      if (stream) {
        stream.viewerCount = Math.max(0, stream.viewerCount - 1);
        this.updateLocalStream(stream);
      }

      if (isSupabaseReady && supabase) {
        try {
          await supabase
            .from('stream_viewers')
            .update({
              left_at: viewer.leftAt.toISOString(),
              watch_time: viewer.watchTime
            })
            .eq('stream_id', streamId)
            .eq('user_id', userId);

          await supabase
            .from('live_streams')
            .update({ viewer_count: stream?.viewerCount })
            .eq('id', streamId);
        } catch (error) {
          console.error('Error leaving stream:', error);
        }
      }

      // إرسال رسالة مغادرة
      await this.sendSystemMessage(streamId, `${viewer.userName} غادر البث`);
    }

    viewers.splice(viewerIndex, 1);
    localStorage.setItem(`${STORAGE_KEYS.VIEWERS}:${streamId}`, JSON.stringify(viewers));
  }

  // =====================================================
  // الرسائل والدردشة
  // =====================================================

  async sendMessage(
    streamId: string,
    userId: string,
    userName: string,
    avatar: string,
    content: string
  ): Promise<StreamMessage> {
    const message: StreamMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streamId,
      userId,
      userName,
      avatar,
      content,
      type: 'text',
      timestamp: new Date(),
      isDeleted: false
    };

    // حفظ محلي
    const messages = this.getStreamMessages(streamId);
    messages.push(message);
    localStorage.setItem(`${STORAGE_KEYS.MESSAGES}:${streamId}`, JSON.stringify(messages));

    // تحديث إحصائيات المشاهد
    const viewers = this.getStreamViewers(streamId);
    const viewer = viewers.find(v => v.userId === userId);
    if (viewer) {
      viewer.messagesSent++;
      localStorage.setItem(`${STORAGE_KEYS.VIEWERS}:${streamId}`, JSON.stringify(viewers));
    }

    // تحديث إحصائيات البث
    const stream = await this.getStream(streamId);
    if (stream) {
      stream.stats.totalMessages++;
      this.updateLocalStream(stream);
    }

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('stream_messages')
          .insert([{
            id: message.id,
            stream_id: streamId,
            user_id: userId,
            content: content,
            type: 'text',
            timestamp: message.timestamp.toISOString()
          }]);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }

    return message;
  }

  async sendGift(
    streamId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    giftId: string,
    giftName: string,
    giftAnimation: string,
    value: number,
    quantity: number = 1
  ): Promise<StreamGift> {
    const gift: StreamGift = {
      id: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streamId,
      senderId,
      senderName,
      senderAvatar,
      giftId,
      giftName,
      giftAnimation,
      value,
      quantity,
      timestamp: new Date()
    };

    // حفظ محلي
    const gifts = this.getStreamGifts(streamId);
    gifts.push(gift);
    localStorage.setItem(`${STORAGE_KEYS.GIFTS}:${streamId}`, JSON.stringify(gifts));

    // تحديث monetization
    const stream = await this.getStream(streamId);
    if (stream) {
      stream.monetization.giftsReceived++;
      stream.monetization.diamondsEarned += value * quantity;
      stream.monetization.totalRevenue += value * quantity;
      stream.stats.totalGifts++;
      this.updateLocalStream(stream);
    }

    // تحديث المشاهد
    const viewers = this.getStreamViewers(streamId);
    const viewer = viewers.find(v => v.userId === senderId);
    if (viewer) {
      viewer.giftsSent += quantity;
      localStorage.setItem(`${STORAGE_KEYS.VIEWERS}:${streamId}`, JSON.stringify(viewers));
    }

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('stream_gifts')
          .insert([{
            id: gift.id,
            stream_id: streamId,
            sender_id: senderId,
            gift_id: giftId,
            value: value,
            quantity: quantity,
            timestamp: gift.timestamp.toISOString()
          }]);
      } catch (error) {
        console.error('Error sending gift:', error);
      }
    }

    // إرسال رسالة هدية
    const giftMessage: StreamMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streamId,
      userId: senderId,
      userName: senderName,
      avatar: senderAvatar,
      content: `أرسل ${giftName}`,
      type: 'gift',
      giftId,
      giftName,
      giftValue: value * quantity,
      timestamp: new Date(),
      isDeleted: false
    };

    const messages = this.getStreamMessages(streamId);
    messages.push(giftMessage);
    localStorage.setItem(`${STORAGE_KEYS.MESSAGES}:${streamId}`, JSON.stringify(messages));

    return gift;
  }

  private async sendSystemMessage(streamId: string, content: string): Promise<void> {
    const message: StreamMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streamId,
      userId: 'system',
      userName: 'النظام',
      avatar: '',
      content,
      type: 'system',
      timestamp: new Date(),
      isDeleted: false
    };

    const messages = this.getStreamMessages(streamId);
    messages.push(message);
    localStorage.setItem(`${STORAGE_KEYS.MESSAGES}:${streamId}`, JSON.stringify(messages));
  }

  // =====================================================
  // التسجيل والمقاطع المميزة
  // =====================================================

  private async createRecording(stream: LiveStream): Promise<StreamRecording> {
    const recording: StreamRecording = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      streamId: stream.id,
      hostId: stream.hostId,
      title: stream.title,
      thumbnail: stream.thumbnail,
      duration: stream.duration,
      size: 0,
      quality: stream.settings.quality,
      url: '',
      views: 0,
      likes: 0,
      isPublic: stream.settings.isPublic,
      createdAt: new Date()
    };

    const recordings = this.getRecordings(stream.hostId);
    recordings.push(recording);
    localStorage.setItem(`${STORAGE_KEYS.RECORDINGS}:${stream.hostId}`, JSON.stringify(recordings));

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('stream_recordings')
          .insert([{
            id: recording.id,
            stream_id: recording.streamId,
            host_id: recording.hostId,
            title: recording.title,
            duration: recording.duration,
            quality: recording.quality,
            is_public: recording.isPublic,
            created_at: recording.createdAt.toISOString()
          }]);
      } catch (error) {
        console.error('Error creating recording:', error);
      }
    }

    return recording;
  }

  // =====================================================
  // التحليلات والإحصائيات
  // =====================================================

  private async calculateFinalAnalytics(streamId: string): Promise<StreamAnalytics> {
    const stream = await this.getStream(streamId);
    const viewers = this.getStreamViewers(streamId);
    
    if (!stream) throw new Error('Stream not found');

    const totalWatchTime = viewers.reduce((sum, v) => sum + v.watchTime, 0);
    const averageWatchTime = viewers.length > 0 ? totalWatchTime / viewers.length : 0;

    const analytics: StreamAnalytics = {
      streamId,
      totalViews: stream.totalViews,
      uniqueViewers: viewers.length,
      peakViewers: stream.peakViewerCount,
      averageViewers: stream.totalViews / Math.max(1, stream.duration / 60),
      totalWatchTime,
      averageWatchTime,
      engagementRate: stream.totalViews > 0 ? 
        (stream.stats.totalMessages + stream.stats.totalGifts) / stream.totalViews * 100 : 0,
      chatActivity: stream.stats.totalMessages,
      giftsReceived: stream.stats.totalGifts,
      revenue: stream.monetization.totalRevenue,
      newFollowers: 0,
      newSubscribers: 0,
      viewerRetention: [],
      viewerDemographics: {
        ageGroups: {},
        genders: {},
        countries: {},
        devices: {}
      },
      trafficSources: {}
    };

    localStorage.setItem(`${STORAGE_KEYS.ANALYTICS}:${streamId}`, JSON.stringify(analytics));

    if (isSupabaseReady && supabase) {
      try {
        await supabase
          .from('stream_analytics')
          .insert([{
            stream_id: streamId,
            total_views: analytics.totalViews,
            unique_viewers: analytics.uniqueViewers,
            peak_viewers: analytics.peakViewers,
            total_watch_time: analytics.totalWatchTime,
            engagement_rate: analytics.engagementRate,
            revenue: analytics.revenue
          }]);
      } catch (error) {
        console.error('Error saving analytics:', error);
      }
    }

    return analytics;
  }

  // =====================================================
  // Helper Functions
  // =====================================================

  async getStream(streamId: string): Promise<LiveStream | null> {
    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('live_streams')
          .select('*')
          .eq('id', streamId)
          .single();

        if (!error && data) {
          return this.mapSupabaseStream(data);
        }
      } catch (error) {
        console.error('Error fetching stream:', error);
      }
    }

    const streams = this.getLocalStreams();
    return streams.find(s => s.id === streamId) || null;
  }

  getActiveStreams(): LiveStream[] {
    const streams = this.getLocalStreams();
    return streams.filter(s => s.status === 'live');
  }

  getMyStreams(hostId: string): LiveStream[] {
    const key = `${STORAGE_KEYS.MY_STREAMS}:${hostId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  getStreamViewers(streamId: string): StreamViewer[] {
    const key = `${STORAGE_KEYS.VIEWERS}:${streamId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  getStreamMessages(streamId: string): StreamMessage[] {
    const key = `${STORAGE_KEYS.MESSAGES}:${streamId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  getStreamGifts(streamId: string): StreamGift[] {
    const key = `${STORAGE_KEYS.GIFTS}:${streamId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  getRecordings(hostId: string): StreamRecording[] {
    const key = `${STORAGE_KEYS.RECORDINGS}:${hostId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private getLocalStreams(): LiveStream[] {
    const data = localStorage.getItem(STORAGE_KEYS.STREAMS);
    return data ? JSON.parse(data) : [];
  }

  private updateLocalStream(stream: LiveStream): void {
    const streams = this.getLocalStreams();
    const index = streams.findIndex(s => s.id === stream.id);
    if (index !== -1) {
      streams[index] = stream;
      localStorage.setItem(STORAGE_KEYS.STREAMS, JSON.stringify(streams));
    }
  }

  private mapSupabaseStream(data: Record<string, unknown>): LiveStream {
    return {
      id: data.id,
      hostId: data.host_id,
      hostName: data.host_name || '',
      hostAvatar: data.host_avatar || '',
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail || '',
      category: data.category,
      tags: data.tags || [],
      status: data.status,
      type: data.type,
      startTime: new Date(data.start_time),
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      viewerCount: data.viewer_count || 0,
      peakViewerCount: data.peak_viewer_count || 0,
      totalViews: data.total_views || 0,
      duration: data.duration || 0,
      settings: data.settings,
      monetization: data.monetization || {
        coinsEarned: 0,
        diamondsEarned: 0,
        giftsReceived: 0,
        subscriptionRevenue: 0,
        donationRevenue: 0,
        totalRevenue: 0
      },
      stats: data.stats || {
        totalMessages: 0,
        totalGifts: 0,
        totalShares: 0,
        totalLikes: 0,
        engagementRate: 0,
        averageWatchTime: 0,
        topGifters: [],
        viewersByCountry: {},
        viewersByDevice: {}
      },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

export default new LiveStreamService();
