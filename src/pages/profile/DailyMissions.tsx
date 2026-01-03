import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DailyMissionsService, type DailyMission } from '@/services/DailyMissionsService';
import { AuthService } from '@/services/AuthService';
import { PremiumFeaturesService } from '@/services/PremiumFeaturesService';
import { Phase1AnalyticsService } from '@/services/Phase1AnalyticsService';
import { showSuccess, showError } from '@/utils/toast';
import { useLocale } from '@/contexts';
import {
  Target,
  MessageSquare,
  Gift,
  Users,
  UserPlus,
  Sparkles,
  Headphones,
  Heart,
  Trophy,
  Flame,
  ChevronRight
} from 'lucide-react';

const categoryIcons = {
  social: MessageSquare,
  voice: Headphones,
  economy: Gift,
  engagement: Heart
};

const MissionCard = ({ mission, onClaim }: { mission: DailyMission; onClaim: (id: string) => void }) => {
  const { t } = useLocale();
  const CategoryIcon = categoryIcons[mission.category];
  const progress = (mission.progress.current / mission.progress.target) * 100;
  const isCompleted = mission.completed;
  const isClaimed = mission.claimed;

  const difficultyColors = {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-red-500'
  };

  return (
    <Card className={`p-6 transition-all duration-300 ${
      isCompleted ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-purple-500/20'
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${
          isCompleted ? 'bg-green-500/20' : 'bg-purple-500/20'
        }`}>
          <CategoryIcon className={`w-6 h-6 ${
            isCompleted ? 'text-green-500' : 'text-purple-500'
          }`} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{mission.title}</h3>
              <p className="text-sm text-gray-400">{mission.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[mission.difficulty]}`}>
              {mission.difficulty === 'easy' ? 'سهل' : mission.difficulty === 'medium' ? 'متوسط' : 'صعب'}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">التقدم</span>
              <span className="text-white font-medium">
                {mission.progress.current} / {mission.progress.target}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">🪙</span>
              <span className="text-white font-medium">+{mission.reward.coins}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-500">⭐</span>
              <span className="text-white font-medium">+{mission.reward.exp}</span>
            </div>
            {(mission.reward.diamonds && mission.reward.diamonds > 0) && (
              <div className="flex items-center gap-1">
                <span className="text-purple-500">💎</span>
                <span className="text-white font-medium">+{mission.reward.diamonds}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          {isCompleted && !isClaimed && (
            <Button
              onClick={() => onClaim(mission.id)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Gift className="w-4 h-4 mr-2" />
              استلام المكافأة
            </Button>
          )}
          {isClaimed && (
            <div className="text-center py-2 text-green-500 font-medium">
              ✓ تم الاستلام
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const DailyMissions = () => {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const userId = AuthService.getCurrentUser()?.id || 'demo';

  const loadMissions = React.useCallback(() => {
    const allMissions = DailyMissionsService.getDailyMissions(userId);
    setMissions(allMissions);
  }, [userId]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const handleClaimReward = (missionId: string) => {
    // Get reward multiplier based on Premium tier
    const multiplier = PremiumFeaturesService.getRewardMultiplier(userId);
    
    const reward = DailyMissionsService.claimReward(userId, missionId);
    if (reward.coins > 0) {
      const finalCoins = Math.floor(reward.coins * multiplier);
      const finalExp = Math.floor(reward.exp * multiplier);
      
      showSuccess(
        `تم استلام المكافأة: ${finalCoins} عملة + ${finalExp} خبرة` +
        (multiplier > 1 ? ` (مضاعف ${multiplier}x 🌟)` : '')
      );
      
      // Log analytics
      Phase1AnalyticsService.logUsage({
        userId,
        feature: 'mission',
        featureId: missionId,
        claimed: true
      });
      
      loadMissions();
    } else {
      showError('فشل استلام المكافأة');
    }
  };

  const stats = DailyMissionsService.getStats(userId);
  const filteredMissions = selectedCategory === 'all' 
    ? missions 
    : missions.filter(m => m.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'الكل', icon: Target },
    { id: 'social', name: 'اجتماعي', icon: Users },
    { id: 'voice', name: 'صوتي', icon: Headphones },
    { id: 'economy', name: 'اقتصادي', icon: Gift },
    { id: 'engagement', name: 'تفاعل', icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">المهام اليومية</h1>
            <p className="text-purple-200">أكمل المهام واحصل على مكافآت رائعة</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white"
          >
            رجوع
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">المهام المكتملة</p>
                <p className="text-2xl font-bold text-white">{stats.totalCompleted}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-600 to-yellow-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">عملات مكتسبة</p>
                <p className="text-2xl font-bold text-white">{stats.totalCoinsEarned}</p>
              </div>
              <span className="text-3xl">🪙</span>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">خبرة مكتسبة</p>
                <p className="text-2xl font-bold text-white">{stats.totalExpEarned}</p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm">سلسلة الأيام</p>
                <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
              </div>
              <Flame className="w-8 h-8 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className={`flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Missions Grid */}
        <div className="space-y-4">
          {filteredMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onClaim={handleClaimReward}
            />
          ))}
        </div>

        {filteredMissions.length === 0 && (
          <Card className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
            <h3 className="text-xl font-bold text-white mb-2">لا توجد مهام</h3>
            <p className="text-gray-400">لا توجد مهام متاحة في هذه الفئة</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DailyMissions;
