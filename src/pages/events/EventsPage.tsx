import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/contexts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import LiveEventService from '@/services/LiveEventService';
import { LiveEvent } from '@/models/LiveEvent';
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  Gift,
  Target,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Star,
  Crown,
  Zap
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

export default function EventsPage() {
  const navigate = useNavigate();
  const { t, locale, dir } = useLocale();
  
  const [upcomingEvents, setUpcomingEvents] = useState<LiveEvent[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<LiveEvent[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  // بيانات المستخدم
  const currentUser = JSON.parse(localStorage.getItem('auth:user') || '{}');
  const userId = currentUser.id || 'guest';

  useEffect(() => {
    loadEvents();
    
    // تحديث كل 10 ثواني
    const interval = setInterval(loadEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadEvents = () => {
    setUpcomingEvents(LiveEventService.getUpcomingEvents());
    setLiveEvents(LiveEventService.getLiveEvents());
    setPastEvents(LiveEventService.getPastEvents());
  };

  const handleRegister = async (eventId: string) => {
    try {
      await LiveEventService.registerParticipant(
        eventId,
        userId,
        currentUser.username || 'مستخدم',
        currentUser.avatar || '',
        currentUser.level || 1
      );
      
      loadEvents();
      showSuccess(locale === 'ar' ? 'تم التسجيل بنجاح!' : 'Registered successfully!');
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : 'Failed to register');
    }
  };

  const handleUnregister = async (eventId: string) => {
    try {
      await LiveEventService.unregisterParticipant(eventId, userId);
      loadEvents();
      showSuccess(locale === 'ar' ? 'تم إلغاء التسجيل' : 'Unregistered');
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : 'Failed to unregister');
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'tournament': return <Trophy className="w-5 h-5" />;
      case 'challenge': return <Target className="w-5 h-5" />;
      case 'contest': return <Star className="w-5 h-5" />;
      case 'party': return <Sparkles className="w-5 h-5" />;
      case 'giveaway': return <Gift className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tournament': return 'from-yellow-600 to-orange-600';
      case 'challenge': return 'from-purple-600 to-pink-600';
      case 'contest': return 'from-blue-600 to-cyan-600';
      case 'party': return 'from-green-600 to-teal-600';
      case 'giveaway': return 'from-red-600 to-pink-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    
    if (diff < 0) return locale === 'ar' ? 'بدأ' : 'Started';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return locale === 'ar' ? `خلال ${days} يوم` : `In ${days} days`;
    }
    
    return locale === 'ar' ? `خلال ${hours}س ${minutes}د` : `In ${hours}h ${minutes}m`;
  };

  const renderEventCard = (event: LiveEvent) => {
    const isRegistered = LiveEventService.isUserRegistered(event.id, userId);
    const isFull = event.registeredCount >= event.maxParticipants;
    
    return (
      <Card
        key={event.id}
        className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-purple-500/20 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm"
      >
        {/* Banner Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900">
          {event.thumbnail && (
            <img
              src={event.thumbnail}
              alt={locale === 'ar' ? event.titleAr : event.title}
              className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-500"
            />
          )}
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-2">
              {event.isFeatured && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                  <Star className="w-3 h-3 mr-1" />
                  {locale === 'ar' ? 'مميز' : 'Featured'}
                </Badge>
              )}
              
              {event.status === 'live' && (
                <Badge className="bg-red-600 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  {locale === 'ar' ? 'مباشر' : 'LIVE'}
                </Badge>
              )}
            </div>
            
            <Badge className={`bg-gradient-to-r ${getEventTypeColor(event.type)}`}>
              {getEventIcon(event.type)}
              <span className="mr-1">
                {locale === 'ar' ? 
                  (event.type === 'tournament' ? 'بطولة' : 
                   event.type === 'challenge' ? 'تحدي' :
                   event.type === 'contest' ? 'مسابقة' :
                   event.type === 'party' ? 'حفلة' :
                   event.type === 'giveaway' ? 'هدايا' : 'فعالية')
                  : event.type.toUpperCase()}
              </span>
            </Badge>
          </div>

          {/* Event Icon */}
          <div className="absolute bottom-3 left-3">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getEventTypeColor(event.type)} flex items-center justify-center text-white shadow-lg`}>
              {getEventIcon(event.type)}
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Title & Description */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
              {locale === 'ar' ? event.titleAr : event.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {locale === 'ar' ? event.descriptionAr : event.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-400" />
              <div className="text-gray-300">
                {formatTimeUntil(event.startTime)}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              <div className="text-gray-300">
                {event.registeredCount}/{event.maxParticipants}
              </div>
            </div>
          </div>

          {/* Prizes */}
          {event.prizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-500">
                <Trophy className="w-4 h-4" />
                {locale === 'ar' ? 'الجوائز' : 'Prizes'}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                  <span>🪙</span>
                  <span className="font-bold">{event.prizes[0].coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-400">
                  <span>💎</span>
                  <span className="font-bold">{event.prizes[0].diamonds.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {event.status === 'upcoming' && (
              <>
                {isRegistered ? (
                  <Button
                    onClick={() => handleUnregister(event.id)}
                    variant="outline"
                    className="flex-1 border-green-500/50 text-green-400"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {locale === 'ar' ? 'مسجل' : 'Registered'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleRegister(event.id)}
                    disabled={isFull}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isFull ? (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {locale === 'ar' ? 'ممتلئ' : 'Full'}
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {locale === 'ar' ? 'سجل الآن' : 'Register Now'}
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
            
            {event.status === 'live' && (
              <Button
                onClick={() => navigate(`/event/${event.id}`)}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                <Play className="w-4 h-4 mr-2" />
                {locale === 'ar' ? 'شارك الآن' : 'Join Now'}
              </Button>
            )}
            
            <Button
              onClick={() => navigate(`/event/${event.id}`)}
              variant="outline"
              className="border-purple-500/50"
            >
              {locale === 'ar' ? 'التفاصيل' : 'Details'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6" dir={dir}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Calendar className="w-10 h-10 text-purple-500" />
              {locale === 'ar' ? 'الفعاليات الحية' : 'Live Events'}
            </h1>
            <p className="text-gray-400">
              {locale === 'ar' 
                ? 'شارك في المسابقات والتحديات واربح جوائز مذهلة' 
                : 'Participate in competitions and challenges to win amazing prizes'}
            </p>
          </div>

          <Button
            onClick={() => navigate('/event/create')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {locale === 'ar' ? 'إنشاء فعالية' : 'Create Event'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-red-900/50 to-pink-900/50 border-red-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-600/30 flex items-center justify-center">
                <Play className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{liveEvents.length}</div>
                <div className="text-sm text-gray-400">{locale === 'ar' ? 'فعاليات مباشرة' : 'Live Now'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-600/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{upcomingEvents.length}</div>
                <div className="text-sm text-gray-400">{locale === 'ar' ? 'قادمة' : 'Upcoming'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-600/30 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {upcomingEvents.reduce((sum, e) => sum + e.prizes.length, 0)}
                </div>
                <div className="text-sm text-gray-400">{locale === 'ar' ? 'جوائز' : 'Prizes'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {upcomingEvents.reduce((sum, e) => sum + e.registeredCount, 0)}
                </div>
                <div className="text-sm text-gray-400">{locale === 'ar' ? 'مشاركين' : 'Participants'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Events Tabs */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-gray-900/50 mb-6">
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="w-4 h-4" />
              {locale === 'ar' ? 'قادمة' : 'Upcoming'}
              <Badge variant="secondary" className="ml-2">{upcomingEvents.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2">
              <Play className="w-4 h-4" />
              {locale === 'ar' ? 'مباشر' : 'Live'}
              <Badge variant="secondary" className="ml-2">{liveEvents.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {locale === 'ar' ? 'منتهية' : 'Past'}
              <Badge variant="secondary" className="ml-2">{pastEvents.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(renderEventCard)}
              </div>
            ) : (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {locale === 'ar' ? 'لا توجد فعاليات قادمة' : 'No upcoming events'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="live">
            {liveEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveEvents.map(renderEventCard)}
              </div>
            ) : (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-12 text-center">
                  <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {locale === 'ar' ? 'لا توجد فعاليات مباشرة' : 'No live events'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map(renderEventCard)}
              </div>
            ) : (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {locale === 'ar' ? 'لا توجد فعاليات منتهية' : 'No past events'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
