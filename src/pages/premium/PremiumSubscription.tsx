import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PremiumFeaturesService, type PremiumTierInfo, type PremiumTier } from '@/services/PremiumFeaturesService';
import { EconomyService } from '@/services/EconomyService';
import { AuthService } from '@/services/AuthService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Crown, Check, Sparkles, ArrowLeft, 
  Shield, Zap, Gift, Star
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const PremiumSubscription: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const [tiers, setTiers] = useState<PremiumTierInfo[]>([]);
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [balance, setBalance] = useState({ coins: 0, diamonds: 0 });
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    const allTiers = PremiumFeaturesService.getAllTiers();
    setTiers(allTiers);

    if (currentUser?.id) {
      const tier = PremiumFeaturesService.getUserTier(currentUser.id);
      setCurrentTier(tier);

      const bal = EconomyService.getBalance();
      setBalance(bal);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubscribe = async (tier: string, duration: number) => {
    if (!currentUser?.id) {
      showError('يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      const result = await PremiumFeaturesService.subscribe(
        currentUser.id,
        tier as PremiumTier,
        duration
      );

      if (result.success) {
        showSuccess(result.message);
        await loadData(); // Refresh data
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError('فشل الاشتراك');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-orange-600';
      case 'platinum': return 'from-purple-400 to-pink-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '🆓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                الاشتراكات المميزة
              </h1>
              <p className="text-sm text-gray-400">
                اختر الباقة المناسبة لك واستمتع بمميزات حصرية
              </p>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-400">رصيدك</p>
              <p className="text-xl font-bold text-yellow-400">{balance.coins.toLocaleString('ar')} 💰</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Current Subscription Status */}
        {currentTier !== 'free' && (
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{getTierIcon(currentTier)}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      اشتراك {tiers.find(t => t.tier === currentTier)?.name}
                    </h3>
                    <p className="text-gray-300">
                      {PremiumFeaturesService.getDaysRemaining(currentUser?.id || '')} يوم متبقي
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => PremiumFeaturesService.cancelSubscription(currentUser?.id || '')}
                  >
                    إلغاء التجديد التلقائي
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier, index) => {
            const isCurrentTier = tier.tier === currentTier;
            const canUpgrade = index > tiers.findIndex(t => t.tier === currentTier);

            return (
              <Card 
                key={tier.tier}
                className={`
                  bg-white/5 border-white/10 overflow-hidden relative
                  ${isCurrentTier ? 'ring-2 ring-yellow-400' : ''}
                  ${tier.tier === 'platinum' ? 'lg:col-span-2' : ''}
                `}
              >
                {/* Tier Badge */}
                <div className={`h-2 bg-gradient-to-r ${getTierColor(tier.tier)}`} />
                
                {isCurrentTier && (
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                    الباقة الحالية
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="text-6xl mb-3">{tier.badge}</div>
                  <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                  <div className="mt-4">
                    {tier.price === 0 ? (
                      <p className="text-3xl font-bold text-white">مجاني</p>
                    ) : (
                      <>
                        <p className="text-4xl font-bold text-white">{tier.price.toLocaleString('ar')}</p>
                        <p className="text-sm text-gray-400">عملة/شهر</p>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Benefits List */}
                  <div className="space-y-2">
                    {tier.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Subscribe Button */}
                  {tier.tier !== 'free' && (
                    <div className="space-y-2 pt-4">
                      {isCurrentTier ? (
                        <Button
                          className="w-full bg-gray-600 hover:bg-gray-700"
                          disabled
                        >
                          الباقة الحالية
                        </Button>
                      ) : canUpgrade || currentTier === 'free' ? (
                        <>
                          <Button
                            className={`w-full bg-gradient-to-r ${getTierColor(tier.tier)}`}
                            onClick={() => handleSubscribe(tier.tier, 30)}
                            disabled={loading}
                          >
                            <Crown className="w-4 h-4 ml-2" />
                            اشترك لمدة شهر
                          </Button>
                          <Button
                            className={`w-full bg-gradient-to-r ${getTierColor(tier.tier)} opacity-80`}
                            variant="outline"
                            onClick={() => handleSubscribe(tier.tier, 90)}
                            disabled={loading}
                          >
                            اشترك 3 أشهر (وفر 10%)
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full"
                          variant="outline"
                          disabled
                        >
                          يتطلب إلغاء الاشتراك الحالي
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              مقارنة المميزات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-right py-3 px-4 text-gray-400">الميزة</th>
                    {tiers.map(tier => (
                      <th key={tier.tier} className="text-center py-3 px-4 text-white">
                        {tier.badge} {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-gray-300">الثيمات الأساسية</td>
                    <td className="text-center py-3"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-gray-300">ثيمات VIP</td>
                    <td className="text-center py-3 text-gray-600">-</td>
                    <td className="text-center py-3 text-yellow-400">5</td>
                    <td className="text-center py-3"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-gray-300">دورات عجلة الحظ اليومية</td>
                    <td className="text-center py-3 text-yellow-400">3</td>
                    <td className="text-center py-3 text-yellow-400">5</td>
                    <td className="text-center py-3 text-yellow-400">10</td>
                    <td className="text-center py-3 text-green-400 font-bold">∞</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-gray-300">مضاعف المكافآت</td>
                    <td className="text-center py-3 text-yellow-400">1x</td>
                    <td className="text-center py-3 text-yellow-400">1.5x</td>
                    <td className="text-center py-3 text-yellow-400">2x</td>
                    <td className="text-center py-3 text-yellow-400 font-bold">3x</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-gray-300">شارة VIP</td>
                    <td className="text-center py-3 text-gray-600">-</td>
                    <td className="text-center py-3"><Shield className="w-5 h-5 text-gray-400 mx-auto" /></td>
                    <td className="text-center py-3"><Shield className="w-5 h-5 text-yellow-400 mx-auto" /></td>
                    <td className="text-center py-3"><Star className="w-5 h-5 text-purple-400 mx-auto animate-pulse" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-300">أولوية الدعم</td>
                    <td className="text-center py-3 text-gray-600">-</td>
                    <td className="text-center py-3"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center py-3"><Zap className="w-5 h-5 text-yellow-400 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Gift className="w-6 h-6" />
            الأسئلة الشائعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">كيف أشترك؟</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm">
                اختر الباقة المناسبة واضغط على زر الاشتراك. سيتم خصم المبلغ من رصيدك تلقائياً.
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">هل يمكن إلغاء الاشتراك؟</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm">
                نعم، يمكنك إلغاء التجديد التلقائي في أي وقت. ستبقى مميزات الاشتراك حتى نهاية المدة المدفوعة.
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">هل يمكن الترقية للباقة الأعلى؟</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm">
                نعم، يمكنك الترقية في أي وقت. سيتم احتساب الفرق في السعر فقط.
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">كيف أحصل على عملات؟</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm">
                يمكنك الحصول على العملات من خلال إكمال المهام اليومية، عجلة الحظ، أو شرائها من المتجر.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSubscription;
