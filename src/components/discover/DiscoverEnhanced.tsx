import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/contexts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import LiveEventService from '@/services/LiveEventService';
import LiveStreamService from '@/services/LiveStreamService';
import { FamilyService } from '@/services/FamilyService';
import { 
  TrendingUp, 
  Users, 
  Video, 
  Calendar, 
  Shield, 
  Sparkles,
  ChevronRight,
  Flame,
  Crown,
  Trophy,
  Gift,
  Star,
  Zap,
  Target,
  UserPlus
} from 'lucide-react';

export default function DiscoverEnhanced() {
  const navigate = useNavigate();
  const { locale, dir } = useLocale();
  
  const [liveStreams, setLiveStreams] = useState(0);
  const [activeEvents, setActiveEvents] = useState(0);
  const [topFamilies, setTopFamilies] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    setLiveStreams(LiveStreamService.getActiveStreams().length);
    setActiveEvents(LiveEventService.getLiveEvents().length);
    setTopFamilies(FamilyService.getLeaderboard(10));
  }, []);

  const trendingFeatures = [
    {
      id: 'live-streams',
      title: locale === 'ar' ? 'البث المباشر' : 'Live Streams',
      description: locale === 'ar' ? `${liveStreams} بث نشط الآن` : `${liveStreams} active now`,
      icon: <Video className="w-6 h-6" />,
      gradient: 'from-red-600 to-pink-600',
      badge: 'LIVE',
      badgeColor: 'bg-red-600 animate-pulse',
      path: '/discover/streams',
      stats: liveStreams
    },
    {
      id: 'events',
      title: locale === 'ar' ? 'الفعاليات' : 'Events',
      description: locale === 'ar' ? `${activeEvents} فعالية نشطة` : `${activeEvents} active events`,
      icon: <Calendar className="w-6 h-6" />,
      gradient: 'from-purple-600 to-indigo-600',
      badge: locale === 'ar' ? 'جديد' : 'NEW',
      badgeColor: 'bg-purple-600',
      path: '/events',
      stats: activeEvents
    },
    {
      id: 'families',
      title: locale === 'ar' ? 'العائلات' : 'Families',
      description: locale === 'ar' ? 'انضم لعائلة قوية' : 'Join a powerful family',
      icon: <Shield className="w-6 h-6" />,
      gradient: 'from-green-600 to-emerald-600',
      badge: locale === 'ar' ? 'شائع' : 'POPULAR',
      badgeColor: 'bg-green-600',
      path: '/family',
      stats: topFamilies.length
    },
    {
      id: 'referral',
      title: locale === 'ar' ? 'دعوة الأصدقاء' : 'Invite Friends',
      description: locale === 'ar' ? 'اربح حتى 50,000 عملة' : 'Earn up to 50,000 coins',
      icon: <UserPlus className="w-6 h-6" />,
      gradient: 'from-blue-600 to-cyan-600',
      badge: '6X',
      badgeColor: 'bg-blue-600',
      path: '/referral',
      stats: 6
    }
  ];

  const quickActions = [
    {
      title: locale === 'ar' ? 'ابدأ بثك' : 'Start Streaming',
      icon: <Video className="w-5 h-5" />,
      path: '/stream/create',
      color: 'from-red-600 to-pink-600'
    },
    {
      title: locale === 'ar' ? 'إنشاء فعالية' : 'Create Event',
      icon: <Calendar className="w-5 h-5" />,
      path: '/event/create',
      color: 'from-purple-600 to-indigo-600'
    },
    {
      title: locale === 'ar' ? 'إنشاء عائلة' : 'Create Family',
      icon: <Shield className="w-5 h-5" />,
      path: '/family/create',
      color: 'from-green-600 to-emerald-600'
    },
    {
      title: locale === 'ar' ? 'لوحة المنشئ' : 'Creator Dashboard',
      icon: <Crown className="w-5 h-5" />,
      path: '/creator/dashboard',
      color: 'from-yellow-600 to-orange-600'
    }
  ];

  const categories = [
    { id: 'music', name: locale === 'ar' ? 'موسيقى' : 'Music', icon: '🎵', count: 45 },
    { id: 'gaming', name: locale === 'ar' ? 'ألعاب' : 'Gaming', icon: '🎮', count: 89 },
    { id: 'chat', name: locale === 'ar' ? 'دردشة' : 'Chat', icon: '💬', count: 234 },
    { id: 'karaoke', name: locale === 'ar' ? 'كاريوكي' : 'Karaoke', icon: '🎤', count: 67 },
    { id: 'party', name: locale === 'ar' ? 'حفلات' : 'Party', icon: '🎉', count: 123 },
    { id: 'learning', name: locale === 'ar' ? 'تعليم' : 'Learning', icon: '📚', count: 56 }
  ];

  return (
    <div className="space-y-6" dir={dir}>
      {/* Hero Section */}
      <Card className="relative overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-indigo-900/40 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10" />
        <CardContent className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-yellow-500" />
                {locale === 'ar' ? 'اكتشف المزيد' : 'Discover More'}
              </h1>
              <p className="text-lg text-gray-300">
                {locale === 'ar' 
                  ? 'استكشف الميزات الجديدة وانضم للمجتمع' 
                  : 'Explore new features and join the community'}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>{liveStreams + activeEvents} {locale === 'ar' ? 'نشط الآن' : 'Active Now'}</span>
                </div>
                <div className="w-px h-4 bg-gray-600" />
                <div className="flex items-center gap-2 text-blue-400">
                  <Users className="w-4 h-4" />
                  <span>2.5K+ {locale === 'ar' ? 'متصل' : 'Online'}</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-3xl opacity-50" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <TrendingUp className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            onClick={() => navigate(action.path)}
            className="group cursor-pointer overflow-hidden border-gray-800 hover:border-purple-500/50 bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-300 hover:scale-105"
          >
            <CardContent className="p-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">
                {action.title}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trending Features */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            {locale === 'ar' ? 'الأكثر شعبية' : 'Trending Now'}
          </h2>
          <Button variant="ghost" size="sm" className="text-purple-400">
            {locale === 'ar' ? 'عرض الكل' : 'View All'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingFeatures.map((feature) => (
            <Card
              key={feature.id}
              onClick={() => navigate(feature.path)}
              className="group cursor-pointer overflow-hidden border-purple-500/20 bg-gradient-to-br from-gray-900/90 to-gray-800/90 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <Badge className={feature.badgeColor}>
                    {feature.badge}
                  </Badge>
                </div>
                
                <h3 className="font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-purple-400 text-sm font-medium">
                  <span>{locale === 'ar' ? 'استكشف' : 'Explore'}</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-500" />
          {locale === 'ar' ? 'التصنيفات' : 'Categories'}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer border-gray-800 hover:border-purple-500/50 bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-4 text-center">
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-white text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-gray-400">{category.count} {locale === 'ar' ? 'غرفة' : 'rooms'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Families */}
      {topFamilies.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {locale === 'ar' ? 'أفضل العائلات' : 'Top Families'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {topFamilies.slice(0, 5).map((family, index) => (
                  <div
                    key={family.id}
                    onClick={() => navigate(`/family/${family.id}`)}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 font-bold text-white">
                      {index + 1}
                    </div>
                    
                    <img
                      src={family.logo || '/images/default-family.png'}
                      alt={family.name}
                      className="w-12 h-12 rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{family.name}</h4>
                      <p className="text-xs text-gray-400">
                        {family.memberCount} {locale === 'ar' ? 'عضو' : 'members'} · 
                        Level {family.level}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-500">{family.totalPoints.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{locale === 'ar' ? 'نقطة' : 'points'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Stats Footer */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-500/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-sm text-gray-400">{locale === 'ar' ? 'مستخدم نشط' : 'Active Users'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-gray-400">{locale === 'ar' ? 'غرفة صوتية' : 'Voice Rooms'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">1M+</div>
              <div className="text-sm text-gray-400">{locale === 'ar' ? 'رسالة يومياً' : 'Daily Messages'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-sm text-gray-400">{locale === 'ar' ? 'فعالية نشطة' : 'Active Events'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
