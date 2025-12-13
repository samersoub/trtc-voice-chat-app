import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIMatchmakingService from '@/services/AIMatchmakingService';
import type { MatchResult, AIInsight, SmartRecommendation, MatchingStatistics } from '@/models/AIMatchmaking';
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Star,
  Zap,
  Brain,
  Target,
  Activity
} from 'lucide-react';

export default function AIMatchingPage() {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [statistics, setStatistics] = useState<MatchingStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      
      // Load matches
      const matchResults = await AIMatchmakingService.findMatches(userId);
      setMatches(matchResults);

      // Load insights
      const userInsights = AIMatchmakingService.getAIInsights(userId);
      setInsights(userInsights);

      // Load recommendations
      const smartRecs = AIMatchmakingService.getSmartRecommendations(userId);
      setRecommendations(smartRecs);

      // Load statistics
      const stats = AIMatchmakingService.getMatchingStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading matching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    const authUser = localStorage.getItem('auth:user');
    return authUser ? JSON.parse(authUser).id : 'guest';
  };

  const handleFindMatches = async () => {
    setLoading(true);
    const userId = getCurrentUserId();
    const results = await AIMatchmakingService.findMatches(userId);
    setMatches(results);
    setLoading(false);
  };

  const handleConnect = (userId: string) => {
    // Navigate to user profile or send connection request
    navigate(`/profile/${userId}`);
  };

  const getChemistryColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-purple-500';
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getChemistryLabel = (level: string) => {
    switch (level) {
      case 'excellent': return '🔥 Excellent';
      case 'high': return '⭐ High';
      case 'medium': return '👍 Medium';
      default: return '💫 Low';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {dir === 'rtl' ? 'المطابقة الذكية AI' : 'AI Smart Matching'}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {dir === 'rtl' 
              ? 'اكتشف أشخاصاً متوافقين معك باستخدام الذكاء الاصطناعي' 
              : 'Discover compatible people using artificial intelligence'}
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">{dir === 'rtl' ? 'إجمالي المطابقات' : 'Total Matches'}</p>
                  <p className="text-2xl font-bold">{statistics.totalMatches}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">{dir === 'rtl' ? 'مطابقات ناجحة' : 'Successful'}</p>
                  <p className="text-2xl font-bold">{statistics.successfulMatches}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">{dir === 'rtl' ? 'متوسط التوافق' : 'Avg Compatibility'}</p>
                  <p className="text-2xl font-bold">{statistics.averageCompatibility}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">{dir === 'rtl' ? 'رضا المستخدمين' : 'User Satisfaction'}</p>
                  <p className="text-2xl font-bold">{statistics.userSatisfaction}%</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-bold">{dir === 'rtl' ? 'رؤى ذكية لك' : 'AI Insights for You'}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400">{insight.title}</h4>
                    <Badge variant="secondary" className="text-xs">{insight.confidence}%</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="matches" className="text-base">
              <Users className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'المطابقات' : 'Matches'} ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-base">
              <Target className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'توصيات ذكية' : 'Smart Recommendations'}
            </TabsTrigger>
          </TabsList>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{dir === 'rtl' ? 'أشخاص متوافقون معك' : 'Compatible People'}</h2>
              <Button 
                onClick={handleFindMatches} 
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                {loading ? (dir === 'rtl' ? 'جاري البحث...' : 'Searching...') : (dir === 'rtl' ? 'ابحث عن مطابقات' : 'Find Matches')}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
                <p className="text-gray-600 dark:text-gray-400">
                  {dir === 'rtl' ? 'جاري تحليل الملفات الشخصية...' : 'Analyzing profiles...'}
                </p>
              </div>
            ) : matches.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {dir === 'rtl' ? 'لم يتم العثور على مطابقات بعد' : 'No matches found yet'}
                </p>
                <Button onClick={handleFindMatches} variant="outline">
                  {dir === 'rtl' ? 'ابحث الآن' : 'Find Now'}
                </Button>
              </Card>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matches.map((match) => (
                    <Card key={match.userId} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="flex flex-col items-center text-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold mb-3">
                          {match.username.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-lg font-bold mb-1">{match.username}</h3>
                        <Badge variant="outline" className="mb-2">
                          {dir === 'rtl' ? 'مستوى' : 'Level'} {match.level}
                        </Badge>
                        
                        {/* Compatibility Score */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                            style={{ width: `${match.compatibilityScore}%` }}
                          />
                        </div>
                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                          {match.compatibilityScore}% {dir === 'rtl' ? 'توافق' : 'Compatible'}
                        </p>
                        
                        {/* Chemistry Level */}
                        <p className={`text-sm font-medium mt-2 ${getChemistryColor(match.estimatedChemistry)}`}>
                          {getChemistryLabel(match.estimatedChemistry)}
                        </p>
                      </div>

                      {/* Match Reasons */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                          {dir === 'rtl' ? 'لماذا هذه المطابقة؟' : 'Why this match?'}
                        </p>
                        {match.matchReasons.slice(0, 2).map((reason, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs mr-1 mb-1">
                            {reason}
                          </Badge>
                        ))}
                      </div>

                      {/* Common Interests */}
                      {match.commonInterests.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {dir === 'rtl' ? 'اهتمامات مشتركة:' : 'Common interests:'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {match.commonInterests.slice(0, 4).map((interest, idx) => (
                              <Badge key={idx} className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Activity */}
                      {match.suggestedActivity && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-4">
                          💡 {match.suggestedActivity}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleConnect(match.userId)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {dir === 'rtl' ? 'تواصل' : 'Connect'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/profile/${match.userId}`)}
                          className="flex-1"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {dir === 'rtl' ? 'الملف' : 'Profile'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <h2 className="text-2xl font-bold mb-6">{dir === 'rtl' ? 'توصيات مخصصة لك' : 'Personalized for You'}</h2>
            
            {recommendations.length === 0 ? (
              <Card className="p-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  {dir === 'rtl' ? 'لا توجد توصيات حالياً' : 'No recommendations available'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.slice(0, 12).map((rec, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                        {rec.type}
                      </Badge>
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {rec.score}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {rec.reason}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (rec.type === 'user') navigate(`/profile/${rec.targetId}`);
                        else if (rec.type === 'room') navigate(`/room/${rec.targetId}`);
                        else if (rec.type === 'event') navigate(`/event/${rec.targetId}`);
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {dir === 'rtl' ? 'استكشف' : 'Explore'}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
