import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LuckyWheelService, type WheelPrize, type SpinResult, type SpinStats } from '@/services/LuckyWheelService';
import { AuthService } from '@/services/AuthService';
import { PremiumFeaturesService } from '@/services/PremiumFeaturesService';
import { Phase1AnalyticsService } from '@/services/Phase1AnalyticsService';
import { showSuccess, showError } from '@/utils/toast';
import { useLocale } from '@/contexts';
import {
  CircleDot,
  Trophy,
  Sparkles,
  RefreshCw,
  Clock,
  TrendingUp,
  History,
  Gift,
  Coins
} from 'lucide-react';

const WheelComponent = ({ prizes, onSpin, isSpinning }: { 
  prizes: WheelPrize[]; 
  onSpin: () => void;
  isSpinning: boolean;
}) => {
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (isSpinning) return;
    
    // Random rotation (multiple spins + random angle)
    const randomAngle = Math.floor(Math.random() * 360);
    const spins = 5; // Number of full rotations
    const totalRotation = rotation + (360 * spins) + randomAngle;
    
    setRotation(totalRotation);
    onSpin();
  };

  const segmentAngle = 360 / prizes.length;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Wheel Container */}
      <div className="relative aspect-square">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-yellow-500 drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <div 
          className={`relative w-full h-full rounded-full overflow-hidden shadow-2xl border-8 border-yellow-500 transition-transform ${
            isSpinning ? 'duration-[4000ms]' : 'duration-0'
          }`}
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)'
          }}
        >
          {prizes.map((prize, index) => {
            const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
            const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
            
            return (
              <div
                key={prize.id}
                className="absolute inset-0"
                style={{
                  transform: `rotate(${index * segmentAngle}deg)`,
                  transformOrigin: 'center'
                }}
              >
                <div 
                  className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left flex items-start justify-center pt-8"
                  style={{
                    backgroundColor: prize.color,
                    clipPath: `polygon(0 0, 100% 0, 100% 100%)`
                  }}
                >
                  <div className="text-2xl">{prize.icon}</div>
                </div>
              </div>
            );
          })}

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-white shadow-lg flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full blur-2xl bg-yellow-500/30 -z-10" />
      </div>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning}
        className="w-full mt-6 h-14 text-lg font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 disabled:opacity-50"
      >
        {isSpinning ? (
          <>
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            جاري اللف...
          </>
        ) : (
          <>
            <CircleDot className="w-5 h-5 mr-2" />
            اضغط للف العجلة
          </>
        )}
      </Button>
    </div>
  );
};

const LuckyWheel = () => {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [stats, setStats] = useState<SpinStats | null>(null);
  const [history, setHistory] = useState<SpinResult[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastPrize, setLastPrize] = useState<WheelPrize | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const userId = AuthService.getCurrentUser()?.id || 'demo';
  const userCoins = 5000; // Demo balance

  const loadData = React.useCallback(() => {
    const allPrizes = LuckyWheelService.getAllPrizes();
    const spinStats = LuckyWheelService.getSpinStats(userId);
    const spinHistory = LuckyWheelService.getHistory(userId, 10);
    
    setPrizes(allPrizes);
    setStats(spinStats);
    setHistory(spinHistory);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSpin = async () => {
    // Check Premium limit
    const dailyLimit = PremiumFeaturesService.getWheelSpinsLimit(userId);
    const userTier = PremiumFeaturesService.getUserTier(userId);
    
    if (stats.remainingSpins <= 0) {
      if (dailyLimit < 999) {
        showError(`وصلت إلى الحد الأقصى (${dailyLimit} دورات يومياً)`);
        showSuccess('ترقية إلى Premium للحصول على المزيد من الدورات! 👑');
        setTimeout(() => navigate('/premium'), 2000);
      } else {
        showError(`لا توجد لفات متبقية. يمكنك شراء لفة بـ ${LuckyWheelService.getSpinCost()} عملة`);
      }
      return;
    }

    setIsSpinning(true);
    setLastPrize(null);

    // Wait for animation
    setTimeout(() => {
      const result = LuckyWheelService.spin(userId, false);
      
      if (result.success && result.prize) {
        setLastPrize(result.prize);
        showSuccess(result.message);
        
        // Log analytics
        Phase1AnalyticsService.logUsage({
          userId,
          feature: 'wheel',
          featureId: 'lucky_wheel',
          prize: { 
            id: result.prize.id,
            name: result.prize.name, 
            value: result.prize.value
          }
        });
        
        loadData();
      } else {
        showError(result.message);
      }
      
      setIsSpinning(false);
    }, 4000);
  };

  const handlePurchaseSpin = () => {
    const result = LuckyWheelService.purchaseSpin(userId, userCoins);
    if (result.success) {
      showSuccess(result.message);
      // Then allow extra spin
      handleExtraSpin();
    } else {
      showError(result.message);
    }
  };

  const handleExtraSpin = async () => {
    setIsSpinning(true);
    setLastPrize(null);

    setTimeout(() => {
      const result = LuckyWheelService.spin(userId, true);
      
      if (result.success && result.prize) {
        setLastPrize(result.prize);
        showSuccess(result.message);
        loadData();
      }
      
      setIsSpinning(false);
    }, 4000);
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">عجلة الحظ</h1>
            <p className="text-purple-200">لف العجلة واربح جوائز رائعة</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              className="border-purple-500/30 text-purple-400"
            >
              <History className="w-4 h-4 mr-2" />
              السجل
            </Button>
            <div className="px-4 py-2 bg-white/10 rounded-lg">
              <span className="text-yellow-500 font-bold">🪙 {userCoins}</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white"
            >
              رجوع
            </Button>
          </div>
        </div>

        {/* Premium Upgrade Banner */}
        {PremiumFeaturesService.getUserTier(userId) === 'free' && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold">احصل على المزيد من الدورات!</p>
                  <p className="text-yellow-200 text-sm">ترقية إلى Premium للحصول على دورات غير محدودة 👑</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/premium')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                ترقية الآن
              </Button>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">
                  لفات متبقية اليوم
                  {PremiumFeaturesService.getWheelSpinsLimit(userId) < 999 && (
                    <span className="text-xs ml-1">
                      (من {PremiumFeaturesService.getWheelSpinsLimit(userId)})
                    </span>
                  )}
                </p>
                <p className="text-3xl font-bold text-white">{stats.remainingSpins}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">إجمالي اللفات</p>
                <p className="text-3xl font-bold text-white">{stats.totalSpins}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-600 to-yellow-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">عملات مكتسبة</p>
                <p className="text-3xl font-bold text-white">{stats.totalCoinsWon}</p>
              </div>
              <Coins className="w-8 h-8 text-yellow-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-pink-600 to-pink-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-200 text-sm">ماسات مكتسبة</p>
                <p className="text-3xl font-bold text-white">{stats.totalDiamondsWon}</p>
              </div>
              <span className="text-3xl">💎</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wheel */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <WheelComponent 
                prizes={prizes} 
                onSpin={handleSpin}
                isSpinning={isSpinning}
              />

              {/* Last Prize */}
              {lastPrize && !isSpinning && (
                <Card className="mt-6 p-6 bg-gradient-to-br from-green-600 to-emerald-600 border-0 text-center animate-bounce-slow">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
                  <h3 className="text-2xl font-bold text-white mb-2">تهانينا!</h3>
                  <p className="text-xl text-white">لقد ربحت {lastPrize.name}</p>
                  <p className="text-4xl my-4">{lastPrize.icon}</p>
                  <p className="text-sm text-white/80">+{lastPrize.value} {lastPrize.type === 'coins' ? 'عملة' : lastPrize.type === 'diamonds' ? 'ماسة' : ''}</p>
                </Card>
              )}

              {/* Purchase Extra Spin */}
              {stats.remainingSpins === 0 && (
                <Card className="mt-6 p-6 bg-purple-900/50 border-purple-500/30">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                    <h3 className="text-xl font-bold text-white mb-2">نفدت لفاتك اليومية!</h3>
                    <p className="text-gray-300 mb-4">يمكنك شراء لفة إضافية</p>
                    <Button
                      onClick={handlePurchaseSpin}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      شراء لفة - {LuckyWheelService.getSpinCost()} عملة
                    </Button>
                  </div>
                </Card>
              )}
            </Card>
          </div>

          {/* Prizes List & History */}
          <div className="space-y-6">
            {/* Available Prizes */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                الجوائز المتاحة
              </h3>
              <div className="space-y-3">
                {prizes.map((prize) => (
                  <div 
                    key={prize.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{prize.icon}</span>
                      <div>
                        <p className="text-white font-medium">{prize.name}</p>
                        <p className={`text-xs ${getRarityColor(prize.rarity)}`}>
                          {prize.rarity === 'common' ? 'شائع' : 
                           prize.rarity === 'rare' ? 'نادر' :
                           prize.rarity === 'epic' ? 'ملحمي' : 'أسطوري'}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{prize.probability}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* History */}
            {showHistory && history.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  آخر الجوائز
                </h3>
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 rounded bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.prize.icon}</span>
                        <span className="text-sm text-white">{item.prize.name}</span>
                      </div>
                      <span className={`text-xs ${getRarityColor(item.prize.rarity)}`}>
                        +{item.prize.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuckyWheel;
