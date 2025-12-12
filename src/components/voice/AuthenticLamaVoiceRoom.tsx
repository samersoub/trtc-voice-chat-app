import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Volume2, Gift, MessageCircle, Users, 
  MoreVertical, Crown, Send, X, ArrowLeft, 
  Lock, UserPlus, Share2, Settings, Star, Heart
} from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { showSuccess, showError } from '@/utils/toast';
import { useTrtc } from '@/hooks/useTrtc';
import { supabase, isSupabaseReady } from '@/services/db/supabaseClient';
import '@/styles/lama-voice-room.css';

// ===================================================================
// TypeScript Interfaces
// ===================================================================
interface SeatUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  vipLevel?: number;
  isHost?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
}

interface VoiceSeat {
  seatNumber: number;
  user: SeatUser | null;
  isLocked: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'gift' | 'system';
  giftIcon?: string;
}

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  price: number;
}

// ===================================================================
// Initial Seats - 20 Seats in 4x5 Grid
// ===================================================================
const initialSeats: VoiceSeat[] = [
  // Row 1 (Seats 1-5)
  {
    seatNumber: 1,
    user: {
      id: 'host',
      name: 'سلطان',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sultan',
      level: 99,
      vipLevel: 7,
      isHost: true,
      isSpeaking: true,
      isMuted: false
    },
    isLocked: false
  },
  {
    seatNumber: 2,
    user: {
      id: 'user2',
      name: 'نور',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noor',
      level: 45,
      vipLevel: 3,
      isSpeaking: false,
      isMuted: false
    },
    isLocked: false
  },
  {
    seatNumber: 3,
    user: {
      id: 'user3',
      name: 'أحمد',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
      level: 32,
      isSpeaking: true,
      isMuted: false
    },
    isLocked: false
  },
  {
    seatNumber: 4,
    user: null,
    isLocked: false
  },
  {
    seatNumber: 5,
    user: null,
    isLocked: true
  },
  // Row 2 (Seats 6-10)
  {
    seatNumber: 6,
    user: {
      id: 'user6',
      name: 'ليلى',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Layla',
      level: 28,
      isSpeaking: false,
      isMuted: false
    },
    isLocked: false
  },
  {
    seatNumber: 7,
    user: null,
    isLocked: false
  },
  {
    seatNumber: 8,
    user: null,
    isLocked: false
  },
  {
    seatNumber: 9,
    user: null,
    isLocked: true
  },
  {
    seatNumber: 10,
    user: null,
    isLocked: false
  },
  // Row 3 (Seats 11-15)
  {
    seatNumber: 11,
    user: null,
    isLocked: false
  },
  {
    seatNumber: 12,
    user: null,
    isLocked: false
  },
  {
    seatNumber: 13,
    user: null,
    isLocked: false
  },
  {
    seatNumber: 14,
    user: null,
    isLocked: false
  },
  {
    seatNumber: 15,
    user: null,
    isLocked: false
  },
  // Row 4 (Seats 16-20)
  {
    seatNumber: 16,
    user: null,
    isLocked: false
  },
  {
    seatNumber: 17,
    user: {
      id: 'user17',
      name: 'محمد',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammad',
      level: 18,
      vipLevel: 1,
      isSpeaking: false,
      isMuted: true
    },
    isLocked: false
  },
  {
    seatNumber: 18,
    user: {
      id: 'user18',
      name: 'فاطمة',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
      level: 52,
      vipLevel: 5,
      isSpeaking: false,
      isMuted: false
    },
    isLocked: false
  },
  {
    seatNumber: 19,
    user: {
      id: 'user19',
      name: 'خالد',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khaled',
      level: 24,
      isSpeaking: true,
      isMuted: false
    },
    isLocked: false
  },
  {
    seatNumber: 20,
    user: null,
    isLocked: false
  }
];

const gifts: GiftItem[] = [
  { id: '1', name: 'وردة', icon: '🌹', price: 10 },
  { id: '2', name: 'قلب', icon: '❤️', price: 50 },
  { id: '3', name: 'ألماس', icon: '💎', price: 100 },
  { id: '4', name: 'تاج', icon: '👑', price: 200 },
  { id: '5', name: 'سيارة', icon: '🏎️', price: 500 },
  { id: '6', name: 'قصر', icon: '🏰', price: 1000 }
];

// ===================================================================
// Authentic Lama Chat Voice Room Component (20 Seats)
// ===================================================================
const AuthenticLamaVoiceRoom: React.FC = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // TRTC Integration
  const { join, leave, localStream, remoteStreams } = useTrtc();
  const [isJoined, setIsJoined] = useState(false);
  const [currentSeatNumber, setCurrentSeatNumber] = useState<number | null>(null);

  // States
  const [seats, setSeats] = useState<VoiceSeat[]>(initialSeats);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      userName: 'النظام',
      userAvatar: '',
      message: 'مرحباً بكم في غرفة الأردن 🇯🇴',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [announcementText, setAnnouncementText] = useState('محمد أرسل Rose بقيمة 50000 إلى فاطمة');

  // Room Info
  const roomInfo = {
    id: roomId || '343645',
    name: 'غرفة الأردن',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    hostName: 'سلطان الأردن',
    listenerCount: onlineCount,
    category: 'ترفيه'
  };

  // Auto-join TRTC room on mount
  useEffect(() => {
    const joinRoom = async () => {
      try {
        const userId = currentUser?.id || `guest_${Date.now()}`;
        await join(userId);
        setIsJoined(true);
        showSuccess('تم الانضمام للغرفة الصوتية');
      } catch (error) {
        console.error('Failed to join TRTC room:', error);
        showError('فشل الانضمام للغرفة الصوتية');
      }
    };

    joinRoom();

    return () => {
      leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Supabase Real-time Subscriptions
  useEffect(() => {
    console.log('=== Supabase Check ===');
    console.log('isSupabaseReady:', isSupabaseReady);
    console.log('roomId:', roomId);
    console.log('supabase client:', supabase);
    
    if (!isSupabaseReady || !roomId || !supabase) {
      console.warn('⚠️ Supabase not ready or roomId missing');
      console.warn('isSupabaseReady:', isSupabaseReady);
      console.warn('roomId:', roomId);
      return;
    }

    console.log('✅ Setting up Realtime subscriptions for room:', roomId);
    
    // Clean up old seats (optional - removes seats older than 1 hour)
    const cleanupOldSeats = async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      await supabase
        .from('voice_room_seats')
        .delete()
        .eq('room_id', roomId)
        .lt('joined_at', oneHourAgo);
      console.log('🧹 Cleaned up old seats');
    };
    
    cleanupOldSeats().catch(err => console.error('Failed to cleanup:', err));

    // Subscribe to messages
    const messagesChannel = supabase!
      .channel(`room_${roomId}_messages`, {
        config: {
          broadcast: { self: true },
          presence: { key: '' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'voice_room_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload: { new: Record<string, unknown> }) => {
          console.log('New message received:', payload);
          const newMessage: ChatMessage = {
            id: String(payload.new.id),
            userId: String(payload.new.user_id),
            userName: String(payload.new.user_name),
            userAvatar: String(payload.new.user_avatar || ''),
            message: String(payload.new.message),
            timestamp: new Date(String(payload.new.created_at)),
            type: (payload.new.message_type as 'text' | 'gift' | 'system') || 'text',
            giftIcon: payload.new.gift_icon ? String(payload.new.gift_icon) : undefined
          };
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe((status) => {
        console.log('Messages channel status:', status);
      });

    // Subscribe to seat changes
    const seatsChannel = supabase!
      .channel(`room_${roomId}_seats`, {
        config: {
          broadcast: { self: true },
          presence: { key: '' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voice_room_seats',
          filter: `room_id=eq.${roomId}`
        },
        (payload: { eventType: string; new?: Record<string, unknown>; old?: Record<string, unknown> }) => {
          console.log('Seat change received:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const seatData = payload.new!;
            setSeats(prev => prev.map(seat => 
              seat.seatNumber === Number(seatData.seat_number)
                ? {
                    ...seat,
                    user: seatData.user_id ? {
                      id: String(seatData.user_id),
                      name: String(seatData.user_name),
                      avatar: String(seatData.user_avatar),
                      level: Number(seatData.user_level) || 1,
                      vipLevel: seatData.vip_level ? Number(seatData.vip_level) : undefined,
                      isSpeaking: Boolean(seatData.is_speaking),
                      isMuted: Boolean(seatData.is_muted)
                    } : null,
                    isLocked: Boolean(seatData.is_locked)
                  }
                : seat
            ));
          } else if (payload.eventType === 'DELETE') {
            const seatData = payload.old!;
            setSeats(prev => prev.map(seat =>
              seat.seatNumber === Number(seatData.seat_number)
                ? { ...seat, user: null }
                : seat
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to online count
    const presenceChannel = supabase!
      .channel(`room_${roomId}_presence`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: currentUser?.id || 'guest',
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      messagesChannel.unsubscribe();
      seatsChannel.unsubscribe();
      presenceChannel.unsubscribe();
    };
  }, [roomId, currentUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handlers
  const handleSeatClick = async (seatNumber: number) => {
    const seat = seats.find(s => s.seatNumber === seatNumber);
    if (!seat) return;

    if (seat.user) {
      showSuccess(`${seat.user.name} - المستوى ${seat.user.level}`);
      return;
    }
    
    if (seat.isLocked) {
      showError('مقعد مقفل');
      return;
    }

    // Join seat
    if (!currentUser) {
      showError('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      console.log('🪑 Joining seat:', seatNumber);
      console.log('Current user:', currentUser);
      console.log('isSupabaseReady:', isSupabaseReady);
      
      // Always update local state first for immediate feedback
      setSeats(prev => prev.map(s =>
        s.seatNumber === seatNumber
          ? {
              ...s,
              user: {
                id: currentUser.id,
                name: currentUser.name || 'مستخدم',
                avatar: currentUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.id,
                level: 1,
                isSpeaking: false,
                isMuted: true
              }
            }
          : s
      ));
      
      setCurrentSeatNumber(seatNumber);
      showSuccess(`تم الانضمام للمقعد ${seatNumber}`);
      
      // Update seat in Supabase (background - don't block on failure)
      if (isSupabaseReady && supabase) {
        const seatData = {
          room_id: roomId,
          seat_number: seatNumber,
          user_id: currentUser.id,
          user_name: currentUser.name || 'مستخدم',
          user_avatar: currentUser.avatarUrl || '',
          user_level: 1,
          is_speaking: false,
          is_muted: true
        };
        
        console.log('📤 Sending seat data to Supabase:', seatData);
        
        // Use async function for proper error handling
        (async () => {
          try {
            // First, delete any existing entry for this seat
            const { error: deleteError } = await supabase
              .from('voice_room_seats')
              .delete()
              .match({ room_id: roomId, seat_number: seatNumber });
            
            if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows found (ok)
              console.warn('Delete warning:', deleteError);
            }
            
            // Then insert the new seat data
            const { error: insertError } = await supabase
              .from('voice_room_seats')
              .insert(seatData);
            
            if (insertError) {
              console.error('❌ Supabase insert error:', insertError);
            } else {
              console.log('✅ Seat updated in Supabase');
            }
          } catch (err) {
            console.error('❌ Failed to update Supabase:', err);
          }
        })();
      } else {
        console.log('⚠️ Supabase not ready, working in demo mode');
      }
      
      // Add system message
      const joinMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'system',
        userName: 'النظام',
        userAvatar: '',
        message: `${currentUser.name || 'مستخدم'} انضم للمقعد ${seatNumber}`,
        timestamp: new Date(),
        type: 'system'
      };
      
      // Always add to local state
      setMessages(prev => [...prev, joinMessage]);
      
      // Also send to Supabase (background)
      if (isSupabaseReady && supabase) {
        (async () => {
          try {
            const { error } = await supabase.from('voice_room_messages').insert({
              room_id: roomId,
              user_id: 'system',
              user_name: 'النظام',
              message: joinMessage.message,
              message_type: 'system'
            });
            if (error) console.error('Failed to send join message:', error);
          } catch (err) {
            console.error('Failed to send join message:', err);
          }
        })();
      }
    } catch (error) {
      console.error('❌ Failed to join seat:', error);
      showError('حدث خطأ أثناء الانضمام للمقعد');
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'user',
      userName: currentUser?.name || 'أنت',
      userAvatar: currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      message: messageInput,
      timestamp: new Date(),
      type: 'text'
    };

    try {
      console.log('📤 Sending message...');
      console.log('Message:', newMsg);
      
      // Always add to local state first for immediate feedback
      setMessages(prev => [...prev, newMsg]);
      setMessageInput('');
      
      // Send to Supabase in background (don't block on failure)
      if (isSupabaseReady && supabase) {
        console.log('📤 Sending to Supabase...');
        (async () => {
          try {
            const { error } = await supabase.from('voice_room_messages').insert({
              room_id: roomId,
              user_id: newMsg.userId,
              user_name: newMsg.userName,
              user_avatar: newMsg.userAvatar,
              message: newMsg.message,
              message_type: 'text'
            });
            
            if (error) {
              console.error('❌ Supabase insert error:', error);
            } else {
              console.log('✅ Message sent to Supabase');
            }
          } catch (err) {
            console.error('❌ Failed to send to Supabase:', err);
          }
        })();
      } else {
        console.log('⚠️ Supabase not ready, message saved locally only');
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  };

  const handleSendGift = async (gift: GiftItem) => {
    const giftMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'user',
      userName: currentUser?.name || 'أنت',
      userAvatar: currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      message: `أرسل ${gift.name}`,
      timestamp: new Date(),
      type: 'gift',
      giftIcon: gift.icon
    };

    try {
      if (isSupabaseReady) {
        await supabase!.from('voice_room_messages').insert({
          room_id: roomId,
          user_id: giftMsg.userId,
          user_name: giftMsg.userName,
          user_avatar: giftMsg.userAvatar,
          message: giftMsg.message,
          message_type: 'gift',
          gift_icon: gift.icon
        });
      } else {
        setMessages(prev => [...prev, giftMsg]);
      }
      
      setShowGiftPanel(false);
      showSuccess(`تم إرسال ${gift.name}!`);
      
      // Update announcement banner for high-value gifts
      if (gift.price >= 100) {
        setAnnouncementText(`${currentUser?.name || 'مستخدم'} أرسل ${gift.name} بقيمة ${gift.price} 💎`);
      }
    } catch (error) {
      console.error('Failed to send gift:', error);
      showError('فشل إرسال الهدية');
    }
  };

  const toggleMic = async () => {
    if (!currentSeatNumber) {
      showError('يجب الجلوس على مقعد أولاً');
      return;
    }

    try {
      const newMicState = !isMicActive;
      setIsMicActive(newMicState);
      
      showSuccess(newMicState ? 'تم تشغيل المايكروفون' : 'تم كتم المايكروفون');

      // Update seat mic status in Supabase
      if (isSupabaseReady) {
        await supabase!.from('voice_room_seats')
          .update({ 
            is_muted: !newMicState,
            is_speaking: newMicState
          })
          .eq('room_id', roomId)
          .eq('seat_number', currentSeatNumber);
      } else {
        // Update local state in demo mode
        setSeats(prev => prev.map(seat =>
          seat.seatNumber === currentSeatNumber && seat.user
            ? {
                ...seat,
                user: {
                  ...seat.user,
                  isMuted: !newMicState,
                  isSpeaking: newMicState
                }
              }
            : seat
        ));
      }
    } catch (error) {
      console.error('Failed to toggle mic:', error);
      showError('فشل تبديل المايكروفون');
    }
  };

  // ===================================================================
  // Render: Authentic Lama Chat UI (Based on Screenshot)
  // ===================================================================
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900" dir="rtl">
      
      {/* Top Animated Banner - Gift/Prize Announcements */}
      <div className="bg-gradient-to-r from-yellow-500/95 via-orange-500/95 to-pink-500/95 backdrop-blur-sm overflow-hidden h-10 flex items-center">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-white font-bold text-sm">
          <span className="flex items-center gap-2">
            🎁 {announcementText}
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            💰 أحمد ربح 100,000 في لعبة الحظ!
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            🎁 {announcementText}
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            💰 أحمد ربح 100,000 في لعبة الحظ!
          </span>
        </div>
      </div>

      {/* Room Info - Left Top Corner */}
      <div className="absolute top-12 left-3 z-30 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-xl px-3 py-2">
        <img 
          src={roomInfo.coverImage} 
          alt={roomInfo.name}
          className="w-10 h-10 rounded-lg object-cover border border-white/30"
        />
        <div className="flex flex-col">
          <h2 className="text-xs font-bold text-white">{roomInfo.name}</h2>
          <p className="text-xs text-white/60">ID: {roomInfo.id}</p>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-3 py-2 bg-black/30 backdrop-blur-sm">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-white/80 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <Share2 className="w-3.5 h-3.5 text-white" />
          </button>
          <button className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <Settings className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </header>

      {/* Main Room Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-blue-800/50 to-blue-900/50" />

        {/* Content Over Background */}
        <div className="relative h-full flex flex-col px-3 py-2">
          
          {/* Seats Grid - 4 Rows x 5 Columns = 20 Seats */}
          <div className="mb-3">
            <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
              {seats.map((seat) => (
                <div
                  key={seat.seatNumber}
                  onClick={() => handleSeatClick(seat.seatNumber)}
                  className="relative flex flex-col items-center gap-0.5 cursor-pointer"
                >
                  {/* Seat Circle */}
                  <div className={`
                    relative w-14 h-14 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${seat.user 
                      ? 'border-2 border-blue-400 shadow-lg shadow-blue-400/30' 
                      : seat.isLocked
                        ? 'border-2 border-gray-600 bg-gray-700/50'
                        : 'border-2 border-white/30 bg-blue-800/30 hover:bg-blue-700/50'
                    }
                  `}>
                    {seat.user ? (
                      <>
                        {/* User Avatar */}
                        <img
                          src={seat.user.avatar}
                          alt={seat.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                        
                        {/* VIP Crown Badge */}
                        {seat.user.vipLevel && seat.user.vipLevel > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border border-white shadow-sm">
                            <Crown className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        
                        {/* Mic Status Badge */}
                        {seat.user.isSpeaking && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border border-white shadow-sm">
                            {seat.user.isMuted ? (
                              <MicOff className="w-2.5 h-2.5 text-white" />
                            ) : (
                              <Mic className="w-2.5 h-2.5 text-white animate-pulse" />
                            )}
                          </div>
                        )}
                      </>
                    ) : seat.isLocked ? (
                      <Lock className="w-6 h-6 text-gray-400" />
                    ) : (
                      <UserPlus className="w-6 h-6 text-white/40" />
                    )}
                  </div>
                  
                  {/* Seat Number */}
                  <span className="text-xs font-bold text-white">{seat.seatNumber}</span>
                  
                  {/* Username (only if occupied) */}
                  {seat.user && (
                    <span className="text-xs text-white/70 truncate max-w-[55px]">
                      {seat.user.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages Area - Below Seats */}
          <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-2xl overflow-hidden">
            <div className="h-full flex flex-col p-3">
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`
                      flex items-start gap-2 p-2 rounded-lg
                      ${msg.type === 'system' 
                        ? 'bg-blue-500/20 justify-center' 
                        : msg.type === 'gift'
                          ? 'bg-yellow-500/20'
                          : 'bg-white/5'
                      }
                    `}
                  >
                    {msg.type !== 'system' && msg.userAvatar && (
                      <img
                        src={msg.userAvatar}
                        alt={msg.userName}
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {msg.type !== 'system' && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-semibold text-xs text-blue-300">{msg.userName}</span>
                          <span className="text-xs text-white/40">
                            {new Date(msg.timestamp).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <p className="text-sm text-white/90 break-words">
                        {msg.giftIcon && <span className="mr-1">{msg.giftIcon}</span>}
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Control Bar */}
      <footer className="bg-black/50 backdrop-blur-md px-3 py-2.5 border-t border-white/10">
        <div className="flex items-center gap-2">
          {/* Mic Button */}
          <button
            onClick={toggleMic}
            className={`
              p-2.5 rounded-full transition-all flex-shrink-0
              ${isMicActive 
                ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30' 
                : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30'
              }
            `}
          >
            {isMicActive ? (
              <Mic className="w-5 h-5 text-white" />
            ) : (
              <MicOff className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب رسالة..."
              className="w-full px-3 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5 text-white" />
          </button>

          {/* Gift Button */}
          <button
            onClick={() => setShowGiftPanel(true)}
            className="p-2.5 rounded-full bg-yellow-600 hover:bg-yellow-700 transition-colors flex-shrink-0"
          >
            <Gift className="w-5 h-5 text-white" />
          </button>

          {/* Users Button */}
          <button className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors flex-shrink-0 relative">
            <Users className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {onlineCount > 99 ? '99+' : onlineCount}
            </span>
          </button>
        </div>
      </footer>

      {/* Gift Panel Modal */}
      {showGiftPanel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowGiftPanel(false)}>
          <div className="w-full bg-gradient-to-br from-purple-900 to-pink-900 rounded-t-3xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5" />
                إرسال هدية
              </h3>
              <button onClick={() => setShowGiftPanel(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {gifts.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift)}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-105"
                >
                  <span className="text-3xl">{gift.icon}</span>
                  <span className="text-sm font-semibold text-white">{gift.name}</span>
                  <span className="text-xs text-yellow-300">{gift.price} 💎</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticLamaVoiceRoom;
