import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FamilyService } from '@/services/FamilyService';
import { AuthService } from '@/services/AuthService';
import type { Family, FamilyLeaderboard } from '@/models/Family';
import { showSuccess, showError } from '@/utils/toast';
import { useLocale } from '@/contexts';
import {
  Users,
  Crown,
  Plus,
  Search,
  TrendingUp,
  Award,
  Shield,
  Sparkles,
  ArrowLeft,
  Settings,
  UserPlus,
  Trophy,
  Star,
  Target
} from 'lucide-react';

const FamilyDashboard: React.FC = () => {
  const { dir } = useLocale();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const userId = currentUser?.id || '';
  
  const [myFamily, setMyFamily] = useState<Family | null>(null);
  const [allFamilies, setAllFamilies] = useState<Family[]>([]);
  const [leaderboard, setLeaderboard] = useState<FamilyLeaderboard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my-family' | 'explore' | 'leaderboard'>('my-family');

  useEffect(() => {
    loadData();
  }, [userId, loadData]);

  const loadData = () => {
    const userFamilyId = FamilyService.getUserFamily(userId);
    if (userFamilyId) {
      const family = FamilyService.getFamily(userFamilyId);
      setMyFamily(family);
    }

    const families = FamilyService.getAllFamilies();
    setAllFamilies(families);

    const rankings = FamilyService.getLeaderboard(50);
    setLeaderboard(rankings);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = FamilyService.searchFamilies(searchQuery);
      setAllFamilies(results);
    } else {
      setAllFamilies(FamilyService.getAllFamilies());
    }
  };

  const handleJoinRequest = (familyId: string) => {
    const check = FamilyService.canUserJoin(userId, familyId);
    if (!check.canJoin) {
      showError(check.reason || 'لا يمكنك الانضمام');
      return;
    }

    const requestId = FamilyService.submitJoinRequest(
      familyId,
      userId,
      currentUser?.name || 'User',
      currentUser?.avatarUrl || '',
      1,
      'أود الانضمام إلى عائلتكم'
    );

    if (requestId) {
      showSuccess('تم إرسال طلب الانضمام بنجاح!');
    } else {
      showError('فشل إرسال الطلب');
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'text-yellow-500' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-400' };
    if (rank === 3) return { icon: '🥉', color: 'text-orange-600' };
    return { icon: `#${rank}`, color: 'text-purple-400' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white" dir={dir}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-purple-400" />
                  العائلات
                </h1>
                <p className="text-sm text-gray-400">انضم لعائلة أو أنشئ واحدة خاصة بك</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {myFamily && (
                <Button
                  onClick={() => navigate(`/family/${myFamily.id}`)}
                  variant="outline"
                  className="border-purple-500/30 hover:bg-purple-500/20"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  إدارة عائلتي
                </Button>
              )}
              {!myFamily && (
                <Button
                  onClick={() => navigate('/family/create')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء عائلة
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('my-family')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'my-family'
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            عائلتي
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'explore'
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            استكشاف
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'leaderboard'
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            التصنيفات
          </button>
        </div>

        {/* My Family Tab */}
        {activeTab === 'my-family' && (
          <div>
            {myFamily ? (
              <div className="space-y-6">
                {/* Family Header */}
                <Card className="bg-white/5 border-white/10 overflow-hidden">
                  <div 
                    className="h-48 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${myFamily.banner})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-end gap-4">
                      <img
                        src={myFamily.logo}
                        alt={myFamily.name}
                        className="w-24 h-24 rounded-xl border-4 border-white/20 bg-white/10"
                      />
                      <div>
                        <h2 className="text-3xl font-bold">{myFamily.name}</h2>
                        <p className="text-purple-300">{myFamily.tagline}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{myFamily.stats.totalMembers}</div>
                        <div className="text-sm text-gray-400">الأعضاء</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{myFamily.stats.level}</div>
                        <div className="text-sm text-gray-400">المستوى</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{myFamily.stats.totalPoints}</div>
                        <div className="text-sm text-gray-400">النقاط</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-400">#{myFamily.stats.rank}</div>
                        <div className="text-sm text-gray-400">الترتيب</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button
                        onClick={() => navigate(`/family/${myFamily.id}/members`)}
                        variant="outline"
                        className="border-purple-500/30 hover:bg-purple-500/20"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        الأعضاء
                      </Button>
                      <Button
                        onClick={() => navigate(`/family/${myFamily.id}/rooms`)}
                        variant="outline"
                        className="border-blue-500/30 hover:bg-blue-500/20"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        الغرف
                      </Button>
                      <Button
                        onClick={() => navigate(`/family/${myFamily.id}/events`)}
                        variant="outline"
                        className="border-green-500/30 hover:bg-green-500/20"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        الأحداث
                      </Button>
                      <Button
                        onClick={() => navigate(`/family/${myFamily.id}/missions`)}
                        variant="outline"
                        className="border-orange-500/30 hover:bg-orange-500/20"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        المهام
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-white/5 border-white/10 p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    النشاط الأخير
                  </h3>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white">عضو جديد انضم للعائلة</p>
                          <p className="text-sm text-gray-400">منذ {i + 1} ساعة</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">لست في عائلة بعد</h3>
                <p className="text-gray-400 mb-6">انضم لعائلة موجودة أو أنشئ واحدة جديدة</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setActiveTab('explore')}
                    variant="outline"
                    className="border-purple-500/30"
                  >
                    استكشاف العائلات
                  </Button>
                  <Button
                    onClick={() => navigate('/family/create')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إنشاء عائلة
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Explore Tab */}
        {activeTab === 'explore' && (
          <div>
            {/* Search */}
            <div className="mb-6 flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث عن عائلة..."
                className="flex-1 bg-white/5 border-white/10 text-white"
              />
              <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Families Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allFamilies.map((family) => (
                <Card key={family.id} className="bg-white/5 border-white/10 overflow-hidden hover:border-purple-500/50 transition-all">
                  <div 
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${family.banner})` }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={family.logo}
                        alt={family.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div>
                        <h3 className="font-bold">{family.name}</h3>
                        <p className="text-sm text-gray-400">{family.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users className="w-4 h-4" />
                        {family.stats.totalMembers}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Award className="w-4 h-4" />
                        Lv.{family.stats.level}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Trophy className="w-4 h-4" />
                        #{family.stats.rank}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleJoinRequest(family.id)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={!!myFamily}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {myFamily ? 'في عائلة بالفعل' : 'طلب انضمام'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            <Card className="bg-white/5 border-white/10">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  أفضل العائلات
                </h3>

                <div className="space-y-2">
                  {leaderboard.map((entry) => {
                    const badge = getRankBadge(entry.rank);
                    return (
                      <div
                        key={entry.familyId}
                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <div className={`text-2xl font-bold ${badge.color} w-12 text-center`}>
                          {badge.icon}
                        </div>
                        <img
                          src={entry.familyLogo}
                          alt={entry.familyName}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold">{entry.familyName}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{entry.members} عضو</span>
                            <span>Lv.{entry.level}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-yellow-400">{entry.points.toLocaleString('ar')}</div>
                          <div className="text-sm text-gray-400">نقطة</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyDashboard;
