import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FriendRecommendationService, type FriendSuggestion } from '@/services/FriendRecommendationService';
import { AuthService } from '@/services/AuthService';
import { showSuccess, showError } from '@/utils/toast';
import { useLocale } from '@/contexts';
import {
  UserPlus,
  MapPin,
  Heart,
  MessageCircle,
  Star,
  Users,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const RecommendationCard = ({ user, onAddFriend }: { user: FriendSuggestion; onAddFriend: (userId: string) => void }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    await onAddFriend(user.user.id);
    setIsAdding(false);
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <Card className="p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 border-purple-500/20">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl text-white">
            {user.user.name[0]}
          </div>
          {/* Match Score Badge */}
          <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-bold bg-black/80 ${getMatchColor(user.matchScore)}`}>
            {user.matchScore}%
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-white">{user.user.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <MapPin className="w-3 h-3" />
                {user.user.location || 'غير محدد'}
              </div>
              <div className="flex items-center gap-1 text-sm text-purple-400">
                <Star className="w-3 h-3" />
                المستوى {user.user.level}
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="flex flex-wrap gap-2">
            {(user.user.interests || []).map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300"
              >
                {interest}
              </span>
            ))}
          </div>

          {/* Common Interests */}
          {user.commonInterests.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-gray-400">
                اهتمامات مشتركة: {user.commonInterests.join(', ')}
              </span>
            </div>
          )}

          {/* Match Reason */}
          <div className="flex items-center gap-2 text-sm text-green-400">
            <Sparkles className="w-4 h-4" />
            <span>{user.reason}</span>
          </div>

          {/* Mutual Friends */}
          {user.mutualFriends > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Users className="w-4 h-4" />
              <span>{user.mutualFriends} أصدقاء مشتركين</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleAdd}
              disabled={isAdding}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isAdding ? 'جاري الإضافة...' : 'إضافة صديق'}
            </Button>
            <Button
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              مراسلة
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const FriendRecommendations = () => {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<FriendSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const userId = AuthService.getCurrentUser()?.id || 'demo';

  const loadRecommendations = React.useCallback(() => {
    setIsLoading(true);
    const recs = FriendRecommendationService.getRecommendations(10);
    setRecommendations(recs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleAddFriend = async (friendId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    showSuccess('تم إضافة الصديق بنجاح');
    // Refresh recommendations
    loadRecommendations();
  };

  const handleRefresh = () => {
    loadRecommendations();
    showSuccess('تم تحديث التوصيات');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">توصيات الأصدقاء</h1>
            <p className="text-purple-200">اكتشف أشخاص يشاركونك نفس الاهتمامات</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white"
            >
              رجوع
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">توصيات متاحة</p>
                <p className="text-2xl font-bold text-white">{recommendations.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-pink-600 to-pink-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-200 text-sm">تطابق عالي</p>
                <p className="text-2xl font-bold text-white">
                  {recommendations.filter(r => r.matchScore >= 80).length}
                </p>
              </div>
              <Heart className="w-8 h-8 text-pink-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">أصدقاء مشتركين</p>
                <p className="text-2xl font-bold text-white">
                  {recommendations.reduce((sum, r) => sum + r.mutualFriends, 0)}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-200" />
            </div>
          </Card>
        </div>

        {/* Recommendations Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-12 text-center">
              <RefreshCw className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-spin" />
              <h3 className="text-xl font-bold text-white mb-2">جاري التحميل...</h3>
              <p className="text-gray-400">نبحث عن أفضل التوصيات لك</p>
            </Card>
          ) : recommendations.length > 0 ? (
            recommendations.map((user) => (
              <RecommendationCard
                key={user.user.id}
                user={user}
                onAddFriend={handleAddFriend}
              />
            ))
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <h3 className="text-xl font-bold text-white mb-2">لا توجد توصيات</h3>
              <p className="text-gray-400">جرب تحديث الصفحة أو أكمل ملفك الشخصي</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRecommendations;
