import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocale } from '@/contexts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import LiveStreamService from '@/services/LiveStreamService';
import { LiveStream, StreamMessage, StreamViewer } from '@/models/LiveStream';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Users, 
  MessageCircle, 
  Gift, 
  Share2,
  Heart,
  X,
  Settings,
  MoreVertical,
  Play,
  Pause,
  PhoneOff
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useTrtc } from '@/hooks/useTrtc';

export default function LiveStreamPage() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const { t, locale, dir } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // الحالة
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [viewers, setViewers] = useState<StreamViewer[]>([]);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // TRTC Hook
  const { joined, join, leave, localStream, remoteStreams } = useTrtc();

  // بيانات المستخدم (من localStorage أو Context)
  const currentUser = JSON.parse(localStorage.getItem('auth:user') || '{}');
  const userId = currentUser.id || 'guest';
  const userName = currentUser.username || 'مستخدم';
  const userAvatar = currentUser.avatar || '';

  // تحميل البث
  useEffect(() => {
    if (streamId) {
      loadStream();
      
      // تحديث كل 5 ثواني
      const interval = setInterval(() => {
        loadStream();
        loadViewers();
        loadMessages();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [streamId]);

  // الانضمام للبث
  useEffect(() => {
    if (stream && joined) {
      handleJoinStream();
    }

    return () => {
      if (isJoined) {
        handleLeaveStream();
      }
    };
  }, [stream, joined, handleJoinStream, handleLeaveStream]);

  // =====================================================
  // تحميل البيانات
  // =====================================================

  const loadStream = async () => {
    if (!streamId) return;
    
    try {
      const data = await LiveStreamService.getStream(streamId);
      if (data) {
        setStream(data);
        setIsHost(data.hostId === userId);
        setLikesCount(data.stats.totalLikes);
      }
    } catch (error) {
      console.error('Error loading stream:', error);
      showError(t('failedToLoadStream'));
    }
  };

  const loadViewers = () => {
    if (!streamId) return;
    const data = LiveStreamService.getStreamViewers(streamId);
    setViewers(data);
  };

  const loadMessages = () => {
    if (!streamId) return;
    const data = LiveStreamService.getStreamMessages(streamId);
    setMessages(data);
  };

  // =====================================================
  // إدارة البث
  // =====================================================

  const handleJoinStream = async () => {
    if (!streamId) return;

    try {
      // الانضمام إلى البث
      await LiveStreamService.joinStream(streamId, userId, userName, userAvatar);
      
      // الانضمام إلى TRTC
      await join(userId);
      
      loadViewers();
      showSuccess(t('joinedStream'));
    } catch (error) {
      console.error('Error joining stream:', error);
      showError(t('failedToJoinStream'));
    }
  };

  const handleLeaveStream = async () => {
    if (!streamId) return;

    try {
      await LiveStreamService.leaveStream(streamId, userId);
      leave();
      loadViewers();
    } catch (error) {
      console.error('Error leaving stream:', error);
    }
  };

  const handleStartStream = async () => {
    if (!streamId) return;

    try {
      const updatedStream = await LiveStreamService.startStream(streamId);
      setStream(updatedStream);
      showSuccess(t('streamStarted'));
    } catch (error) {
      console.error('Error starting stream:', error);
      showError(t('failedToStartStream'));
    }
  };

  const handleEndStream = async () => {
    if (!streamId) return;

    try {
      await LiveStreamService.endStream(streamId);
      leave();
      showSuccess(t('streamEnded'));
      navigate('/discover');
    } catch (error) {
      console.error('Error ending stream:', error);
      showError(t('failedToEndStream'));
    }
  };

  const handlePauseStream = async () => {
    if (!streamId) return;

    try {
      const updatedStream = await LiveStreamService.pauseStream(streamId);
      setStream(updatedStream);
      showSuccess(t('streamPaused'));
    } catch (error) {
      console.error('Error pausing stream:', error);
      showError(t('failedToPauseStream'));
    }
  };

  // =====================================================
  // الرسائل والهدايا
  // =====================================================

  const handleSendMessage = async () => {
    if (!message.trim() || !streamId) return;

    try {
      await LiveStreamService.sendMessage(
        streamId,
        userId,
        userName,
        userAvatar,
        message
      );
      
      setMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      showError(t('failedToSendMessage'));
    }
  };

  const handleSendGift = async (giftId: string, giftName: string, giftValue: number) => {
    if (!streamId) return;

    try {
      await LiveStreamService.sendGift(
        streamId,
        userId,
        userName,
        userAvatar,
        giftId,
        giftName,
        '',
        giftValue,
        1
      );
      
      loadMessages();
      showSuccess(`${t('giftSent')}: ${giftName}`);
    } catch (error) {
      console.error('Error sending gift:', error);
      showError(t('failedToSendGift'));
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  // =====================================================
  // التحكم بالوسائط
  // =====================================================

  const toggleMic = async () => {
    if (localStream && localStream.getAudioTracks().length > 0) {
      localStream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = async () => {
    if (localStream && localStream.getVideoTracks().length > 0) {
      localStream.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  if (!stream) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="text-white text-2xl">{t('loadingStream')}...</div>
      </div>
    );
  }

  const quickGifts = [
    { id: 'rose', name: locale === 'ar' ? 'وردة' : 'Rose', value: 10 },
    { id: 'heart', name: locale === 'ar' ? 'قلب' : 'Heart', value: 50 },
    { id: 'car', name: locale === 'ar' ? 'سيارة' : 'Car', value: 500 },
    { id: 'dragon', name: locale === 'ar' ? 'تنين' : 'Dragon', value: 5000 }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-950" dir={dir}>
      {/* شريط العلوي */}
      <div className="bg-gray-900/90 backdrop-blur-sm p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <img
              src={stream.hostAvatar || '/images/default-avatar.png'}
              alt={stream.hostName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold text-white">{stream.hostName}</div>
              <div className="text-sm text-gray-400">{stream.category}</div>
            </div>
          </div>

          {stream.status === 'live' && (
            <Badge className="bg-red-600 hover:bg-red-700 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
              {locale === 'ar' ? 'مباشر' : 'LIVE'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="font-semibold">{stream.viewerCount}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <Share2 className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* محتوى البث */}
      <div className="flex-1 flex overflow-hidden">
        {/* منطقة الفيديو */}
        <div className="flex-1 relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />

          {/* معلومات البث */}
          <div className="absolute top-4 left-4 right-4">
            <Card className="bg-gray-900/70 backdrop-blur-sm border-gray-800">
              <CardContent className="p-4">
                <h2 className="text-xl font-bold text-white mb-1">{stream.title}</h2>
                <p className="text-sm text-gray-300">{stream.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* أزرار التحكم (للمضيف) */}
          {isHost && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              {stream.status === 'preparing' && (
                <Button
                  onClick={handleStartStream}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {locale === 'ar' ? 'بدء البث' : 'Start Stream'}
                </Button>
              )}

              {stream.status === 'live' && (
                <>
                  <Button
                    variant={isMicOn ? 'default' : 'destructive'}
                    size="icon"
                    onClick={toggleMic}
                    className="rounded-full w-12 h-12"
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>

                  <Button
                    variant={isVideoOn ? 'default' : 'destructive'}
                    size="icon"
                    onClick={toggleVideo}
                    className="rounded-full w-12 h-12"
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>

                  <Button
                    onClick={handlePauseStream}
                    variant="secondary"
                    className="rounded-full w-12 h-12"
                  >
                    <Pause className="w-5 h-5" />
                  </Button>

                  <Button
                    onClick={handleEndStream}
                    variant="destructive"
                    className="rounded-full w-12 h-12"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* زر الإعجاب */}
          <div className="absolute bottom-20 right-4 flex flex-col gap-4">
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1 transition-transform active:scale-90"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isLiked ? 'bg-red-600' : 'bg-gray-900/70 backdrop-blur-sm'
              }`}>
                <Heart className={`w-7 h-7 ${isLiked ? 'text-white fill-current' : 'text-gray-300'}`} />
              </div>
              <span className="text-white text-sm font-semibold">{likesCount}</span>
            </button>
          </div>
        </div>

        {/* الشريط الجانبي */}
        <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 bg-gray-800/50 m-4 mb-0">
              <TabsTrigger value="chat" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                {locale === 'ar' ? 'الدردشة' : 'Chat'}
              </TabsTrigger>
              <TabsTrigger value="viewers" className="gap-2">
                <Users className="w-4 h-4" />
                {locale === 'ar' ? 'المشاهدون' : 'Viewers'} ({viewers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-0 p-4 pt-2">
              {/* الرسائل */}
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-2">
                      <img
                        src={msg.avatar || '/images/default-avatar.png'}
                        alt={msg.userName}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-white truncate">
                            {msg.userName}
                          </span>
                          {msg.type === 'gift' && (
                            <Badge variant="secondary" className="text-xs">
                              <Gift className="w-3 h-3 mr-1" />
                              {msg.giftName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 break-words">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* الهدايا السريعة */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {quickGifts.map((gift) => (
                  <Button
                    key={gift.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendGift(gift.id, gift.name, gift.value)}
                    className="flex flex-col gap-1 h-auto py-2 border-purple-500/30 hover:border-purple-500"
                  >
                    <Gift className="w-4 h-4 text-purple-400" />
                    <span className="text-xs">{gift.value}</span>
                  </Button>
                ))}
              </div>

              {/* إدخال الرسالة */}
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={locale === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">
                  {locale === 'ar' ? 'إرسال' : 'Send'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="viewers" className="flex-1 mt-0 p-4 pt-2">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {viewers.map((viewer) => (
                    <div key={viewer.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800">
                      <img
                        src={viewer.avatar || '/images/default-avatar.png'}
                        alt={viewer.userName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{viewer.userName}</div>
                        <div className="text-sm text-gray-400">
                          {viewer.messagesSent} {locale === 'ar' ? 'رسالة' : 'messages'} · 
                          {viewer.giftsSent} {locale === 'ar' ? 'هدية' : 'gifts'}
                        </div>
                      </div>
                      {viewer.role === 'moderator' && (
                        <Badge variant="secondary">MOD</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
