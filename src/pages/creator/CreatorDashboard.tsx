import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/contexts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import CreatorService from '@/services/CreatorService';
import { SubscriptionTierData, CreatorEarnings, CreatorSubscription } from '@/models/CreatorSubscription';
import {
  Crown,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Gift,
  Star,
  Award,
  BarChart3,
  Settings,
  Download,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const { t, locale, dir } = useLocale();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [tiers, setTiers] = useState<SubscriptionTierData[]>([]);
  const [subscriptions, setSubscriptions] = useState<CreatorSubscription[]>([]);
  const [earnings, setEarnings] = useState<CreatorEarnings | null>(null);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTierData | null>(null);

  // بيانات المستخدم
  const currentUser = JSON.parse(localStorage.getItem('auth:user') || '{}');
  const userId = currentUser.id || 'guest';
  const isCreator = true; // TODO: Check if user is a creator

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadData = () => {
    setTiers(CreatorService.getSubscriptionTiers(userId));
    setSubscriptions(CreatorService.getCreatorSubscriptions(userId));
    setEarnings(CreatorService.getEarnings(userId));
  };

  const handleSubscribe = async (tier: SubscriptionTierData) => {
    try {
      await CreatorService.subscribe(
        'creator_id', // TODO: Get from selected creator
        userId,
        currentUser.username || 'User',
        currentUser.avatar || '',
        tier.tier
      );
      
      loadData();
      showSuccess(locale === 'ar' ? 'تم الاشتراك بنجاح!' : 'Subscribed successfully!');
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : 'Failed to subscribe');
    }
  };

  const handleRequestPayout = async () => {
    if (!earnings || earnings.pendingPayout < 50) {
      showError(locale === 'ar' ? 'الحد الأدنى للسحب $50' : 'Minimum payout is $50');
      return;
    }

    try {
      await CreatorService.requestPayout(userId, earnings.pendingPayout, 'paypal');
      loadData();
      showSuccess(locale === 'ar' ? 'تم طلب السحب بنجاح' : 'Payout requested successfully');
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : 'Failed to request payout');
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '⭐';
    }
  };

  const renderOverview = () => {
    const subscribersByTier = CreatorService.getSubscribersByTier(userId);
    const totalSubscribers = Object.values(subscribersByTier).reduce((a, b) => a + b, 0);

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-purple-400" />
                <Badge className="bg-purple-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{totalSubscribers}</div>
              <div className="text-sm text-gray-400">
                {locale === 'ar' ? 'إجمالي المشتركين' : 'Total Subscribers'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
                <Badge className="bg-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +25%
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${earnings?.totalRevenue.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-400">
                {locale === 'ar' ? 'إجمالي الأرباح' : 'Total Revenue'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-yellow-400" />
                <Badge className="bg-yellow-600">
                  {locale === 'ar' ? 'متاح' : 'Available'}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${earnings?.pendingPayout.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-400">
                {locale === 'ar' ? 'رصيد قابل للسحب' : 'Pending Payout'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-400" />
                <Badge className="bg-blue-600">
                  {locale === 'ar' ? 'هذا الشهر' : 'This Month'}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${earnings?.subscriptionRevenue.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-400">
                {locale === 'ar' ? 'أرباح الاشتراكات' : 'Subscription Revenue'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              {locale === 'ar' ? 'تفصيل الأرباح' : 'Revenue Breakdown'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{locale === 'ar' ? 'الاشتراكات' : 'Subscriptions'}</span>
                  <span className="text-white font-semibold">
                    ${earnings?.subscriptionRevenue.toFixed(2) || '0.00'}
                  </span>
                </div>
                <Progress 
                  value={(earnings?.subscriptionRevenue || 0) / (earnings?.totalRevenue || 1) * 100} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{locale === 'ar' ? 'الهدايا' : 'Gifts'}</span>
                  <span className="text-white font-semibold">
                    ${earnings?.giftRevenue.toFixed(2) || '0.00'}
                  </span>
                </div>
                <Progress 
                  value={(earnings?.giftRevenue || 0) / (earnings?.totalRevenue || 1) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{locale === 'ar' ? 'البث المباشر' : 'Streams'}</span>
                  <span className="text-white font-semibold">
                    ${earnings?.streamRevenue.toFixed(2) || '0.00'}
                  </span>
                </div>
                <Progress 
                  value={(earnings?.streamRevenue || 0) / (earnings?.totalRevenue || 1) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payout Section */}
        <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {locale === 'ar' ? 'طلب سحب' : 'Request Payout'}
                </h3>
                <p className="text-sm text-gray-400">
                  {locale === 'ar' 
                    ? `الرصيد المتاح: $${earnings?.pendingPayout.toFixed(2) || '0.00'} (الحد الأدنى: $50)`
                    : `Available: $${earnings?.pendingPayout.toFixed(2) || '0.00'} (Minimum: $50)`}
                </p>
              </div>
              <Button
                onClick={handleRequestPayout}
                disabled={!earnings || earnings.pendingPayout < 50}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {locale === 'ar' ? 'سحب الأرباح' : 'Withdraw'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscribers by Tier */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-purple-400" />
              {locale === 'ar' ? 'المشتركون حسب المستوى' : 'Subscribers by Tier'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(subscribersByTier).map(([tier, count]) => {
                if (tier === 'free' || count === 0) return null;
                const tierData = tiers.find(t => t.tier === tier);
                
                return (
                  <div key={tier} className="text-center p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="text-3xl mb-2">{getTierIcon(tier)}</div>
                    <div className="text-2xl font-bold text-white mb-1">{count}</div>
                    <div className="text-xs text-gray-400">
                      {locale === 'ar' ? tierData?.nameAr : tierData?.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSubscribers = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          {locale === 'ar' ? 'المشتركون' : 'Subscribers'} ({subscriptions.length})
        </h3>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          {locale === 'ar' ? 'تصدير' : 'Export'}
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={sub.subscriberAvatar || '/images/default-avatar.png'}
                    alt={sub.subscriberName}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{sub.subscriberName}</span>
                      <Badge style={{ backgroundColor: tiers.find(t => t.tier === sub.tier)?.color }}>
                        {getTierIcon(sub.tier)} {sub.tier.toUpperCase()}
                      </Badge>
                      {sub.status === 'active' && (
                        <Badge className="bg-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {locale === 'ar' ? 'نشط' : 'Active'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(sub.startDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                      <span>
                        <DollarSign className="w-3 h-3 inline mr-1" />
                        ${sub.totalPaid.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderTiers = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {locale === 'ar' ? 'باقات الاشتراك' : 'Subscription Tiers'}
        </h2>
        <p className="text-gray-400">
          {locale === 'ar' ? 'اختر الباقة المناسبة لك' : 'Choose the right tier for you'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.filter(t => t.tier !== 'free').map((tier) => (
          <Card
            key={tier.tier}
            className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
              tier.popular 
                ? 'border-2 border-yellow-500 shadow-2xl shadow-yellow-500/30' 
                : 'border-gray-800 hover:border-purple-500/50'
            } bg-gradient-to-br from-gray-900/90 to-gray-800/90`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-bold text-center py-2">
                <Star className="w-3 h-3 inline mr-1" />
                {locale === 'ar' ? 'الأكثر شعبية' : 'MOST POPULAR'}
              </div>
            )}

            <CardContent className={`p-6 ${tier.popular ? 'pt-12' : ''}`}>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">{tier.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {locale === 'ar' ? tier.nameAr : tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">${tier.price}</span>
                  <span className="text-gray-400">/{locale === 'ar' ? 'شهر' : 'month'}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {tier.benefits.map((benefit) => (
                  <div key={benefit.id} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      {locale === 'ar' ? benefit.nameAr : benefit.name}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(tier)}
                className="w-full"
                style={{ 
                  background: `linear-gradient(135deg, ${tier.color}, ${tier.color}dd)` 
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                {locale === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6" dir={dir}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Crown className="w-10 h-10 text-yellow-500" />
              {locale === 'ar' ? 'لوحة المنشئ' : 'Creator Dashboard'}
            </h1>
            <p className="text-gray-400">
              {locale === 'ar' 
                ? 'إدارة مشتركيك وأرباحك' 
                : 'Manage your subscribers and earnings'}
            </p>
          </div>

          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Gift className="w-4 h-4 mr-2" />
            {locale === 'ar' ? 'مكافأة المشتركين' : 'Reward Subscribers'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-gray-900/50 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              {locale === 'ar' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="gap-2">
              <Users className="w-4 h-4" />
              {locale === 'ar' ? 'المشتركون' : 'Subscribers'}
            </TabsTrigger>
            <TabsTrigger value="tiers" className="gap-2">
              <Crown className="w-4 h-4" />
              {locale === 'ar' ? 'الباقات' : 'Tiers'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{renderOverview()}</TabsContent>
          <TabsContent value="subscribers">{renderSubscribers()}</TabsContent>
          <TabsContent value="tiers">{renderTiers()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
