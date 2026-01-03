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

      {/* Icon Grid - Two Rows with Enhanced Animations */}
      <div className="grid grid-cols-6 gap-4 justify-items-center">
        {cards.map((card, index) => (
          <div
            key={card.id}
            onClick={() => navigate(card.path)}
            className="group relative cursor-pointer flex flex-col items-center gap-2.5 animate-scale-in hover-lift"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Badge with Animation */}
            {card.badge && (
              <div className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${card.badgeColor} shadow-xl z-10 animate-bounce-subtle`}>
                {card.badge}
              </div>
            )}

            {/* Glow Effect Behind Icon */}
            <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} blur-xl`} />
            </div>

            {/* Icon with Enhanced Gradient and 3D Effect */}
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 overflow-hidden`}>
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              
              {/* Icon */}
              <div className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(card.icon as React.ReactElement, { className: 'w-8 h-8' })}
              </div>
            </div>

            {/* Title with Enhanced Shadow and Glow */}
            <span className="text-sm font-bold text-white text-center max-w-[100px] line-clamp-2 group-hover:text-purple-300 group-hover:scale-105 transition-all duration-300" 
                  style={{ 
                    textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,1), 0 4px 8px rgba(168,85,247,0.3)' 
                  }}>
              {card.title}
            </span>

            {/* Hover Ring Effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-purple-500 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Phase1QuickAccess;
