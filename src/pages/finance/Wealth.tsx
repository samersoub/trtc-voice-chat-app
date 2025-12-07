import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/contexts';
import { WealthLevelService, WealthLevel, UserWealth } from '@/services/WealthLevelService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Crown, 
  Gift, 
  CreditCard, 
  Trophy, 
  Sparkles,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Zap,
  Star,
  Award
} from 'lucide-react';

export default function Wealth() {
  const { t, locale, dir } = useLocale();
  const navigate = useNavigate();
  const isRTL = dir === 'rtl';
  
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'levels' | 'leaderboard'>('overview');
  const [userWealth, setUserWealth] = useState<UserWealth | null>(null);
  const [currentLevel, setCurrentLevel] = useState<WealthLevel | null>(null);
  const [nextLevel, setNextLevel] = useState<WealthLevel | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [allLevels, setAllLevels] = useState<WealthLevel[]>([]);
  const [leaderboard, setLeaderboard] = useState<Array<{ userId: string; wealth: number; level: number }>>([]);

  const userId = 'demo-user-123'; // في الإنتاج، استخدم AuthService

  useEffect(() => {
    // تحميل البيانات
    loadWealthData();
  }, []);

  const loadWealthData = () => {
    // الحصول على بيانات الثروة
    let wealth = WealthLevelService.getUserWealth(userId);
    
    if (!wealth) {
      // إنشاء بيانات تجريبية إذا لم توجد
      WealthLevelService.initializeDemoData(userId);
      wealth = WealthLevelService.getUserWealth(userId);
    }

    setUserWealth(wealth);
    
    // الحصول على معلومات المستويات
    const current = WealthLevelService.getCurrentLevel(userId);
    const next = WealthLevelService.getNextLevel(userId);
    const progressPercent = WealthLevelService.getProgressToNextLevel(userId);
    const levels = WealthLevelService.getAllLevels();
    const topUsers = WealthLevelService.getLeaderboard(10);

    setCurrentLevel(current);
    setNextLevel(next);
    setProgress(progressPercent);
    setAllLevels(levels);
    setLeaderboard(topUsers);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return num.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US');
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* البطاقة الرئيسية - المستوى الحالي */}
      <Card className={`p-6 bg-gradient-to-br ${currentLevel?.gradient} text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-6xl">{currentLevel?.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isRTL ? currentLevel?.name : currentLevel?.nameEn}
                </h2>
                <p className="text-white/80">{isRTL ? 'المستوى' : 'Level'} {currentLevel?.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">{isRTL ? 'إجمالي الثروة' : 'Total Wealth'}</p>
              <p className="text-3xl font-bold">{formatCurrency(userWealth?.currentWealth || 0)}</p>
              <p className="text-sm text-white/80">{isRTL ? 'عملة' : 'Coins'}</p>
            </div>
          </div>

          {/* التقدم إلى المستوى التالي */}
          {nextLevel && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{isRTL ? 'التقدم إلى' : 'Progress to'} {isRTL ? nextLevel.name : nextLevel.nameEn}</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-white/20" />
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>{formatCurrency(currentLevel?.minWealth || 0)}</span>
                <span>{isRTL ? 'متبقي' : 'Remaining'}: {formatCurrency((nextLevel.minWealth - (userWealth?.currentWealth || 0)))}</span>
                <span>{formatCurrency(nextLevel.minWealth)}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/70">{isRTL ? 'إجمالي الشحن' : 'Total Recharge'}</p>
              <p className="text-xl font-bold">{formatNumber(userWealth?.totalRecharge || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/80">
            <ArrowUp className="w-3 h-3" />
            <span>{isRTL ? 'هذا الشهر:' : 'This month:'} {formatNumber(userWealth?.monthlyRecharge || 0)}</span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-white/70">{isRTL ? 'إجمالي الهدايا' : 'Total Gifts'}</p>
              <p className="text-xl font-bold">{formatNumber(userWealth?.totalGiftsSent || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/80">
            <ArrowUp className="w-3 h-3" />
            <span>{isRTL ? 'هذا الشهر:' : 'This month:'} {formatNumber(userWealth?.monthlyGiftsSent || 0)}</span>
          </div>
        </Card>
      </div>

      {/* مزايا المستوى الحالي */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          {isRTL ? 'مزايا مستواك الحالي' : 'Your Current Level Benefits'}
        </h3>
        <div className="space-y-2">
          {currentLevel?.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
        
        {/* المكافأة الحالية */}
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">{isRTL ? 'مكافأة الشحن الحالية' : 'Current Recharge Bonus'}</span>
            </div>
            <span className="text-2xl font-bold">+{WealthLevelService.getCurrentBonus(userId)}%</span>
          </div>
        </div>
      </Card>

      {/* أزرار سريعة */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          onClick={() => navigate('/store')}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {isRTL ? 'شحن الآن' : 'Recharge Now'}
        </Button>
        <Button 
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white"
          onClick={() => navigate('/gifts')}
        >
          <Gift className="w-4 h-4 mr-2" />
          {isRTL ? 'إرسال هدية' : 'Send Gift'}
        </Button>
      </div>
    </div>
  );

  const renderHistoryTab = () => {
    const rechargeHistory = WealthLevelService.getRechargeHistory(userId, 20);
    const giftHistory = WealthLevelService.getGiftHistory(userId, 20);

    return (
      <div className="space-y-6">
        {/* سجل الشحن */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            {isRTL ? 'سجل الشحن' : 'Recharge History'}
          </h3>
          <div className="space-y-3">
            {rechargeHistory.length > 0 ? rechargeHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{record.method}</p>
                    <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{formatCurrency(record.amount)}</p>
                  <p className="text-xs text-gray-500">{isRTL ? 'عملة' : 'coins'}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-8">{isRTL ? 'لا يوجد سجل شحن' : 'No recharge history'}</p>
            )}
          </div>
        </Card>

        {/* سجل الهدايا */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            {isRTL ? 'سجل الهدايا المرسلة' : 'Sent Gifts History'}
          </h3>
          <div className="space-y-3">
            {giftHistory.length > 0 ? giftHistory.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                    <Gift className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{record.giftName}</p>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'إلى' : 'To'} {record.recipientName} • {new Date(record.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{formatCurrency(record.value)}</p>
                  <p className="text-xs text-gray-500">{isRTL ? 'عملة' : 'coins'}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 py-8">{isRTL ? 'لا يوجد سجل هدايا' : 'No gift history'}</p>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderLevelsTab = () => (
    <div className="space-y-4">
      {allLevels.map((level, index) => {
        const isCurrentLevel = level.level === currentLevel?.level;
        const isUnlocked = (userWealth?.currentWealth || 0) >= level.minWealth;
        
        return (
          <Card 
            key={level.level} 
            className={`p-6 relative overflow-hidden transition-all ${
              isCurrentLevel 
                ? `bg-gradient-to-br ${level.gradient} text-white shadow-lg scale-105` 
                : isUnlocked
                ? 'bg-white dark:bg-gray-800'
                : 'bg-gray-100 dark:bg-gray-900 opacity-60'
            }`}
          >
            {isCurrentLevel && (
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  {isRTL ? 'المستوى الحالي' : 'Current Level'}
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <div className="text-5xl">{level.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xl font-bold ${!isCurrentLevel && !isUnlocked ? 'text-gray-400' : ''}`}>
                    {isRTL ? level.name : level.nameEn}
                  </h3>
                  <span className={`text-sm ${isCurrentLevel ? 'text-white/80' : 'text-gray-500'}`}>
                    {isRTL ? 'المستوى' : 'Level'} {level.level}
                  </span>
                </div>
                
                <div className={`text-sm mb-3 ${isCurrentLevel ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                  {formatCurrency(level.minWealth)} - {level.maxWealth === Infinity ? '∞' : formatCurrency(level.maxWealth)} {isRTL ? 'عملة' : 'coins'}
                </div>

                <div className="space-y-2">
                  {(isRTL ? level.benefits : level.benefitsEn).map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full ${isCurrentLevel ? 'bg-white' : isUnlocked ? 'bg-purple-500' : 'bg-gray-400'}`} />
                      <span className={isCurrentLevel ? 'text-white/90' : isUnlocked ? '' : 'text-gray-400'}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <div className="text-center">
                  <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-300">
                    {isRTL ? 'غير مفتوح' : 'Locked'}
                  </p>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold">{isRTL ? 'لوحة المتصدرين' : 'Leaderboard'}</h3>
            <p className="text-sm text-white/80">{isRTL ? 'أعلى 10 مستخدمين ثراءً' : 'Top 10 Wealthiest Users'}</p>
          </div>
        </div>
      </Card>

      {leaderboard.map((user, index) => {
        const level = allLevels.find(l => l.level === user.level);
        const isCurrentUser = user.userId === userId;
        const rankColors = [
          'from-yellow-400 to-amber-500', // Gold
          'from-gray-300 to-gray-400',    // Silver
          'from-orange-400 to-orange-500'  // Bronze
        ];

        return (
          <Card 
            key={user.userId} 
            className={`p-4 ${isCurrentUser ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}
          >
            <div className="flex items-center gap-4">
              {/* الترتيب */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                index < 3 
                  ? `bg-gradient-to-br ${rankColors[index]} text-white` 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {index < 3 ? (
                  index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'
                ) : (
                  index + 1
                )}
              </div>

              {/* معلومات المستخدم */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold">
                    {isCurrentUser ? (isRTL ? 'أنت' : 'You') : `${isRTL ? 'مستخدم' : 'User'} ${user.userId.slice(-4)}`}
                  </p>
                  {isCurrentUser && (
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs rounded-full">
                      {isRTL ? 'أنت' : 'You'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{level?.icon}</span>
                  <span>{isRTL ? level?.name : level?.nameEn}</span>
                  <span>•</span>
                  <span>{isRTL ? 'المستوى' : 'Level'} {user.level}</span>
                </div>
              </div>

              {/* الثروة */}
              <div className="text-right">
                <p className="font-bold text-lg">{formatNumber(user.wealth)}</p>
                <p className="text-xs text-gray-500">{isRTL ? 'عملة' : 'coins'}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={dir}>
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 text-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{isRTL ? 'مستوى الثروة' : 'Wealth Level'}</h1>
            <p className="text-white/80 text-sm">{isRTL ? 'تتبع ثروتك ومستواك' : 'Track your wealth and level'}</p>
          </div>
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
            <Crown className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview', icon: TrendingUp },
            { id: 'history', label: isRTL ? 'السجل' : 'History', icon: CreditCard },
            { id: 'levels', label: isRTL ? 'المستويات' : 'Levels', icon: Crown },
            { id: 'leaderboard', label: isRTL ? 'المتصدرين' : 'Leaderboard', icon: Trophy }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'history' | 'levels' | 'leaderboard')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'levels' && renderLevelsTab()}
        {activeTab === 'leaderboard' && renderLeaderboardTab()}
      </div>
    </div>
  );
}
