import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phase1AnalyticsService, type Phase1Analytics } from '@/services/Phase1AnalyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, Users, Award, Gift, 
  Palette, Music2, Target, Sparkles,
  ArrowLeft, RefreshCw, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Phase1Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Phase1Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await Phase1AnalyticsService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phase1-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">لا توجد بيانات</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">إحصائيات المرحلة الأولى</h1>
              <p className="text-sm text-gray-400">
                آخر تحديث: {analytics.overview.generatedAt.toLocaleString('ar')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={loadAnalytics}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </Button>
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              تصدير
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                إجمالي الاستخدام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {analytics.overview.totalFeatureUsage.toLocaleString('ar')}
              </div>
              <p className="text-sm text-gray-300 mt-1">عملية استخدام</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                الميزة الأكثر شعبية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white capitalize">
                {analytics.overview.mostPopularFeature === 'themes' && 'الثيمات'}
                {analytics.overview.mostPopularFeature === 'effects' && 'المؤثرات'}
                {analytics.overview.mostPopularFeature === 'missions' && 'المهام'}
                {analytics.overview.mostPopularFeature === 'wheel' && 'عجلة الحظ'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                معدل التفاعل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {analytics.overview.engagementRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-300 mt-1">من المستخدمين النشطين</p>
            </CardContent>
          </Card>
        </div>

        {/* Themes Analytics */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5" />
              تحليل الثيمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.themes.slice(0, 5).map((theme, index) => (
                <div key={theme.themeId} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{theme.themeName}</span>
                      <span className="text-gray-400 text-sm">{theme.usageCount} استخدام</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${theme.popularity}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                      <span>{theme.activeUsers} مستخدم</span>
                      <span>{theme.revenue.toLocaleString('ar')} عملة</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voice Effects Analytics */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music2 className="w-5 h-5" />
              تحليل المؤثرات الصوتية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.effects.slice(0, 6).map((effect) => (
                <div 
                  key={effect.effectId}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{effect.effectName}</span>
                    <span className="text-sm text-gray-400">{effect.popularity}%</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>الاستخدام:</span>
                      <span className="text-white">{effect.usageCount}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>المستخدمون:</span>
                      <span className="text-white">{effect.activeUsers}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>متوسط المدة:</span>
                      <span className="text-white">{effect.averageDuration.toFixed(1)} د</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Missions Analytics */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              تحليل المهام اليومية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.missions.map((mission) => (
                <div 
                  key={mission.missionType}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium capitalize">
                      {mission.missionType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-green-400 font-bold">
                      {mission.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">المحاولات</p>
                      <p className="text-white font-medium">{mission.totalAttempts}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">الوقت المتوسط</p>
                      <p className="text-white font-medium">{mission.averageCompletionTime.toFixed(0)} د</p>
                    </div>
                    <div>
                      <p className="text-gray-400">المطالبات</p>
                      <p className="text-white font-medium">{mission.rewardsClaimed}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lucky Wheel Analytics */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="w-5 h-5" />
              تحليل عجلة الحظ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                  <p className="text-yellow-300 text-sm mb-1">إجمالي الدورات</p>
                  <p className="text-3xl font-bold text-white">{analytics.wheel.totalSpins}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <p className="text-blue-300 text-sm mb-1">المستخدمون الفريدون</p>
                  <p className="text-3xl font-bold text-white">{analytics.wheel.uniqueUsers}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <p className="text-purple-300 text-sm mb-1">متوسط الدورات/مستخدم</p>
                  <p className="text-3xl font-bold text-white">{analytics.wheel.averageSpinsPerUser.toFixed(1)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-3">أكثر الجوائز فوزاً</h3>
                <div className="space-y-2">
                  {analytics.wheel.topPrizes.map((prize, index) => (
                    <div 
                      key={prize.prizeId}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{prize.prizeName}</p>
                        <p className="text-xs text-gray-400">{prize.wonCount} مرة • {prize.totalValue.toLocaleString('ar')} قيمة</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Phase1Analytics;
