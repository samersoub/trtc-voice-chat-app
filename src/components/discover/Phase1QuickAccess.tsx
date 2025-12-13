import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  Target, 
  Users, 
  Palette, 
  Sparkles, 
  Mic,
  ChevronRight,
  Gift,
  Trophy,
  Crown,
  Video,
  Shield,
  UserPlus,
  Calendar
} from 'lucide-react';
import { DailyMissionsService } from '@/services/DailyMissionsService';
import { FriendRecommendationService } from '@/services/FriendRecommendationService';
import { LuckyWheelService } from '@/services/LuckyWheelService';
import { AuthService } from '@/services/AuthService';
import { PremiumFeaturesService } from '@/services/PremiumFeaturesService';

interface QuickAccessCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  gradient: string;
  path: string;
}

const Phase1QuickAccess: React.FC = () => {
  const navigate = useNavigate();
  const userId = AuthService.getCurrentUser()?.id || 'demo';
  
  // Get real-time data
  const missionStats = DailyMissionsService.getStats(userId);
  const wheelStats = LuckyWheelService.getSpinStats(userId);
  const friendSuggestions = FriendRecommendationService.getRecommendations(8);
  const userTier = PremiumFeaturesService.getUserTier(userId);
  
  const cards: QuickAccessCard[] = [
    {
      id: 'discover',
      title: 'اكتشف المزيد',
      description: 'استكشف جميع الميزات',
      icon: <Sparkles className="w-6 h-6" />,
      badge: 'HOT',
      badgeColor: 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse',
      gradient: 'from-orange-600 to-red-600',
      path: '/discover/enhanced'
    },
    {
      id: 'premium',
      title: 'الاشتراك المميز',
      description: 'احصل على مميزات حصرية',
      icon: <Crown className="w-6 h-6" />,
      badge: userTier === 'free' ? 'ترقية' : userTier.toUpperCase(),
      badgeColor: userTier === 'free' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-pink-500',
      gradient: 'from-yellow-600 to-orange-600',
      path: '/premium'
    },
    {
      id: 'missions',
      title: 'المهام اليومية',
      description: 'أكمل المهام واربح مكافآت',
      icon: <Target className="w-6 h-6" />,
      badge: missionStats.totalCompleted > 0 ? `${missionStats.currentStreak} 🔥` : 'جديد',
      badgeColor: 'bg-orange-500',
      gradient: 'from-purple-600 to-pink-600',
      path: '/profile/missions'
    },
    {
      id: 'friends',
      title: 'توصيات الأصدقاء',
      description: 'اكتشف أصدقاء جدد',
      icon: <Users className="w-6 h-6" />,
      badge: friendSuggestions.length,
      badgeColor: 'bg-blue-500',
      gradient: 'from-blue-600 to-cyan-600',
      path: '/profile/friends/recommendations'
    },
    {
      id: 'wheel',
      title: 'عجلة الحظ',
      description: 'العب واربح جوائز رائعة',
      icon: <Sparkles className="w-6 h-6" />,
      badge: wheelStats.remainingSpins > 0 ? `${wheelStats.remainingSpins} لفات` : 'انتهت',
      badgeColor: wheelStats.remainingSpins > 0 ? 'bg-yellow-500' : 'bg-gray-500',
      gradient: 'from-yellow-600 to-orange-600',
      path: '/games/lucky-wheel'
    },
    {
      id: 'themes',
      title: 'ثيمات الغرف',
      description: 'خصص غرفتك الصوتية',
      icon: <Palette className="w-6 h-6" />,
      gradient: 'from-green-600 to-teal-600',
      path: '/voice/themes'
    },
    {
      id: 'effects',
      title: 'المؤثرات الصوتية',
      description: 'حسّن صوتك',
      icon: <Mic className="w-6 h-6" />,
      gradient: 'from-indigo-600 to-purple-600',
      path: '/voice/effects'
    },
    {
      id: 'family',
      title: 'العائلات',
      description: 'انضم لعائلة وتنافس',
      icon: <Shield className="w-6 h-6" />,
      badge: 'جديد',
      badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      gradient: 'from-green-600 to-emerald-600',
      path: '/family'
    },
    {
      id: 'referral',
      title: 'دعوة الأصدقاء',
      description: 'اربح مكافآت ضخمة',
      icon: <UserPlus className="w-6 h-6" />,
      badge: '6 مستويات',
      badgeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      gradient: 'from-blue-600 to-cyan-600',
      path: '/referral'
    },
    {
      id: 'livestream',
      title: 'البث المباشر',
      description: 'ابدأ بثك الآن',
      icon: <Video className="w-6 h-6" />,
      badge: 'LIVE',
      badgeColor: 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse',
      gradient: 'from-red-600 to-pink-600',
      path: '/stream/create'
    },
    {
      id: 'events',
      title: 'الفعاليات',
      description: 'شارك في المسابقات',
      icon: <Calendar className="w-6 h-6" />,
      badge: 'قريباً',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      gradient: 'from-purple-600 to-indigo-600',
      path: '/events'
    },
    {
      id: 'creator',
      title: 'لوحة المنشئ',
      description: 'إدارة الاشتراكات والأرباح',
      icon: <Crown className="w-6 h-6" />,
      badge: 'VIP',
      badgeColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      gradient: 'from-yellow-600 to-orange-600',
      path: '/creator/dashboard'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-500" />
            ميزات جديدة
          </h2>
          <p className="text-sm text-gray-400">اكتشف المزيد من الإمكانيات</p>
        </div>
      </div>

      {/* Cards Grid - Compact 2-row layout */}
      <div className="grid grid-cols-6 gap-2">
        {cards.map((card) => (
          <Card
            key={card.id}
            onClick={() => navigate(card.path)}
            className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 border-purple-500/20 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm"
          >
            {/* Badge */}
            {card.badge && (
              <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${card.badgeColor} shadow-md z-10`}>
                {card.badge}
              </div>
            )}

            {/* Content */}
            <div className="p-2 space-y-1.5">
              {/* Icon with Gradient */}
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {React.cloneElement(card.icon as React.ReactElement, { className: 'w-4 h-4' })}
              </div>

              {/* Text */}
              <div>
                <h3 className="font-bold text-white text-xs mb-0.5 group-hover:text-purple-300 transition-colors line-clamp-1">
                  {card.title}
                </h3>
                <p className="text-[10px] text-gray-400 line-clamp-1">
                  {card.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center text-purple-400 text-[10px] font-medium group-hover:text-purple-300">
                <span>استكشف</span>
                <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />
          </Card>
        ))}
      </div>

      {/* Stats Summary Bar */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30 backdrop-blur-sm">
        <div className="p-4 flex items-center justify-around gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xl font-bold">{missionStats.totalCompleted}</span>
            </div>
            <p className="text-xs text-gray-400">مهام مكتملة</p>
          </div>
          
          <div className="h-8 w-px bg-purple-500/30" />
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xl font-bold">{friendSuggestions.length}</span>
            </div>
            <p className="text-xs text-gray-400">توصيات</p>
          </div>
          
          <div className="h-8 w-px bg-purple-500/30" />
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xl font-bold">{wheelStats.totalSpins}</span>
            </div>
            <p className="text-xs text-gray-400">لفات</p>
          </div>
          
          <div className="h-8 w-px bg-purple-500/30" />
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <span className="text-xl font-bold">🪙</span>
              <span className="text-xl font-bold">{missionStats.totalCoinsEarned}</span>
            </div>
            <p className="text-xs text-gray-400">عملات مكتسبة</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Phase1QuickAccess;
