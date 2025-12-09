import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Crown, Trophy, Star, TrendingUp, Award, Flame } from 'lucide-react';
import { useLocale } from '@/contexts';

interface RankingUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  country: string;
  countryFlag: string;
  coins: number;
  level: number;
  badge?: string;
}

type RankingPeriod = 'daily' | 'weekly' | 'monthly';

const Rankings: React.FC = () => {
  const navigate = useNavigate();
  const { locale, dir } = useLocale();
  const isRTL = locale === 'ar';

  const [activePeriod, setActivePeriod] = useState<RankingPeriod>('daily');
  const [countdown, setCountdown] = useState('');

  // بيانات المستخدمين الوهمية
  const getDailyRankings = (): RankingUser[] => [
    {
      id: '1',
      rank: 1,
      name: 'ذو الفقار AHR',
      avatar: '👑',
      country: 'مصر',
      countryFlag: '🇪🇬',
      coins: 14922167,
      level: 85,
      badge: 'روائع الفقار'
    },
    {
      id: '2',
      name: 'kamal',
      rank: 2,
      avatar: '🐰',
      country: 'السعودية',
      countryFlag: '🇸🇦',
      coins: 3500400,
      level: 72
    },
    {
      id: '3',
      name: 'وكـ شمؤخ ـب',
      rank: 3,
      avatar: '💎',
      country: 'الإمارات',
      countryFlag: '🇦🇪',
      coins: 6358210,
      level: 78
    },
    {
      id: '4',
      name: 'ملككه سبأ',
      rank: 4,
      avatar: '👸',
      country: 'مصر',
      countryFlag: '🇪🇬',
      coins: 3287430,
      level: 65
    },
    {
      id: '5',
      name: 'amolaaa',
      rank: 5,
      avatar: '🦅',
      country: 'ألمانيا',
      countryFlag: '🇩🇪',
      coins: 3000000,
      level: 68
    },
    {
      id: '6',
      name: 'وكيـل الصقر',
      rank: 6,
      avatar: '🦁',
      country: 'تركيا',
      countryFlag: '🇹🇷',
      coins: 2209160,
      level: 61
    },
    {
      id: '7',
      name: 'VIP',
      rank: 7,
      avatar: '🌟',
      country: 'الكويت',
      countryFlag: '🇰🇼',
      coins: 2205440,
      level: 60
    },
    {
      id: '8',
      name: 'شاوالي‌الباشا',
      rank: 8,
      avatar: '⚡',
      country: 'ألمانيا',
      countryFlag: '🇩🇪',
      coins: 2080400,
      level: 59
    },
    {
      id: '9',
      name: 'همـــس',
      rank: 9,
      avatar: '🌸',
      country: 'فلسطين',
      countryFlag: '🇵🇸',
      coins: 1950000,
      level: 57
    },
    {
      id: '10',
      name: 'الأسطورة',
      rank: 10,
      avatar: '🔥',
      country: 'الأردن',
      countryFlag: '🇯🇴',
      coins: 1820000,
      level: 55
    }
  ];

  const getWeeklyRankings = (): RankingUser[] => [
    {
      id: '1',
      rank: 1,
      name: 'ملك التحدي',
      avatar: '👑',
      country: 'مصر',
      countryFlag: '🇪🇬',
      coins: 45000000,
      level: 92,
      badge: 'بطل الأسبوع'
    },
    {
      id: '2',
      name: 'نجمة الليل',
      rank: 2,
      avatar: '⭐',
      country: 'السعودية',
      countryFlag: '🇸🇦',
      coins: 38500000,
      level: 88
    },
    {
      id: '3',
      name: 'الفارس الذهبي',
      rank: 3,
      avatar: '🏇',
      country: 'الإمارات',
      countryFlag: '🇦🇪',
      coins: 32000000,
      level: 85
    }
  ];

  const getMonthlyRankings = (): RankingUser[] => [
    {
      id: '1',
      rank: 1,
      name: 'إمبراطور الشهر',
      avatar: '👑',
      country: 'مصر',
      countryFlag: '🇪🇬',
      coins: 150000000,
      level: 99,
      badge: 'أسطورة الشهر'
    },
    {
      id: '2',
      name: 'سلطان الهدايا',
      rank: 2,
      avatar: '💰',
      country: 'السعودية',
      countryFlag: '🇸🇦',
      coins: 125000000,
      level: 97
    },
    {
      id: '3',
      name: 'ملكة القلوب',
      rank: 3,
      avatar: '👸',
      country: 'الإمارات',
      countryFlag: '🇦🇪',
      coins: 98000000,
      level: 95
    }
  ];

  const [rankings, setRankings] = useState<RankingUser[]>(getDailyRankings());

  useEffect(() => {
    switch (activePeriod) {
      case 'daily':
        setRankings(getDailyRankings());
        break;
      case 'weekly':
        setRankings(getWeeklyRankings());
        break;
      case 'monthly':
        setRankings(getMonthlyRankings());
        break;
    }
  }, [activePeriod]);

  // العد التنازلي لانتهاء الفترة
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      let targetDate = new Date();

      if (activePeriod === 'daily') {
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(0, 0, 0, 0);
      } else if (activePeriod === 'weekly') {
        const daysUntilMonday = (8 - now.getDay()) % 7;
        targetDate.setDate(targetDate.getDate() + daysUntilMonday);
        targetDate.setHours(0, 0, 0, 0);
      } else {
        targetDate.setMonth(targetDate.getMonth() + 1);
        targetDate.setDate(1);
        targetDate.setHours(0, 0, 0, 0);
      }

      const diff = targetDate.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activePeriod]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 via-yellow-300 to-yellow-500';
    if (rank === 2) return 'from-gray-300 via-gray-200 to-gray-400';
    if (rank === 3) return 'from-amber-600 via-amber-500 to-amber-700';
    return 'from-slate-600 to-slate-700';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />;
    if (rank === 2) return <Award className="w-6 h-6 text-gray-300 fill-gray-300" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-amber-600 fill-amber-600" />;
    return null;
  };

  const formatCoins = (coins: number) => {
    return coins.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 relative overflow-hidden">
      {/* خلفية مزخرفة محسنة */}
      <div className="absolute inset-0">
        {/* شبكة متوهجة */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* دوائر متوهجة متحركة */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* خطوط متوهجة */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-500/20 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-gradient-to-b from-emerald-900/95 via-emerald-800/90 to-transparent backdrop-blur-xl px-4 py-6 border-b border-yellow-500/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Back"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-xl shadow-yellow-500/30 animate-pulse">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-white font-bold text-3xl mb-1 tracking-wide" dir="rtl">🏆 القوائم العالمية</h1>
                <p className="text-yellow-300 text-sm font-medium" dir="rtl">✨ تصنيف أفضل المستخدمين</p>
              </div>
            </div>

            <div className="w-12 h-12"></div>
          </div>

          {/* Period Tabs */}
          <div className="flex gap-3 bg-black/40 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
            <button
              onClick={() => setActivePeriod('daily')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activePeriod === 'daily'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl shadow-yellow-500/40 scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Flame className={`w-5 h-5 ${activePeriod === 'daily' ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-bold" dir="rtl">يومي</span>
              </div>
            </button>
            <button
              onClick={() => setActivePeriod('weekly')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activePeriod === 'weekly'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl shadow-yellow-500/40 scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Star className={`w-5 h-5 ${activePeriod === 'weekly' ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-bold" dir="rtl">أسبوعي</span>
              </div>
            </button>
            <button
              onClick={() => setActivePeriod('monthly')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activePeriod === 'monthly'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl shadow-yellow-500/40 scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Crown className={`w-5 h-5 ${activePeriod === 'monthly' ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-bold" dir="rtl">شهري</span>
              </div>
            </button>
          </div>

          {/* العد التنازلي */}
          <div className="mt-6 text-center">
            <p className="text-white/80 text-sm mb-2 font-medium" dir="rtl">⏰ وقت الانتهاء</p>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-md px-8 py-3 rounded-2xl border border-yellow-500/40 shadow-xl shadow-yellow-500/20">
              <div className="flex flex-col items-center">
                <span className="text-yellow-400 font-mono text-2xl font-bold tracking-wider">{countdown}</span>
                <span className="text-white/50 text-xs mt-1">ساعة:دقيقة:ثانية</span>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="flex flex-col items-center">
                <span className="text-white/70 text-sm font-medium">2025.12.09</span>
                <span className="text-white/50 text-xs mt-1">التاريخ</span>
              </div>
            </div>
          </div>
        </header>

        {/* Top 3 المراكز الأولى */}
        <div className="px-4 py-8">
          <div className="flex items-end justify-center gap-6 mb-10">
            {/* المركز الثاني */}
            {rankings[1] && (
              <div className="flex flex-col items-center flex-1 animate-fade-in-up animate-delay-150">
                <div className="relative mb-4 group">
                  <div className="absolute -inset-3 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 animate-pulse transition-opacity"></div>
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-500 border-4 border-white shadow-2xl flex items-center justify-center text-4xl hover:scale-110 transition-transform duration-300">
                    {rankings[1].avatar}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-600 rounded-full border-4 border-white flex items-center justify-center font-bold text-white shadow-xl">
                    <span className="text-lg">2</span>
                  </div>
                  {/* شعاع فضي */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                    <Award className="w-8 h-8 text-gray-300 fill-gray-300 drop-shadow-lg" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-5 border-2 border-gray-400/40 shadow-2xl shadow-gray-500/30 w-full hover:scale-105 transition-transform duration-300">
                  <h3 className="text-white font-bold text-center text-lg mb-1.5 truncate">{rankings[1].name}</h3>
                  <p className="text-gray-300 text-sm text-center mb-3 flex items-center justify-center gap-2">
                    <span className="text-xl">{rankings[1].countryFlag}</span>
                    <span>{rankings[1].country}</span>
                  </p>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center gap-2 text-yellow-400">
                      <span className="text-3xl drop-shadow-lg">🪙</span>
                      <span className="font-bold text-2xl">{formatCoins(rankings[1].coins)}</span>
                    </div>
                    <div className="text-xs text-white/60">المستوى {rankings[1].level}</div>
                  </div>
                </div>
              </div>
            )}

            {/* المركز الأول */}
            {rankings[0] && (
              <div className="flex flex-col items-center flex-1 animate-fade-in-up -mt-8">
                <div className="relative mb-4 group">
                  <div className="absolute -inset-4 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full blur-2xl opacity-75 group-hover:opacity-100 animate-pulse transition-opacity"></div>
                  <div className="relative">
                    {/* التاج المحسن */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <Crown className="w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-2xl animate-bounce relative z-10" />
                      </div>
                    </div>
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-600 border-[6px] border-white shadow-2xl shadow-yellow-500/50 flex items-center justify-center text-6xl relative hover:scale-110 transition-transform duration-300">
                      {rankings[0].avatar}
                      {/* شعاع ذهبي متوهج */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200/30 to-transparent animate-pulse"></div>
                      {/* أجنحة ذهبية */}
                      <div className="absolute -left-10 top-1/2 transform -translate-y-1/2">
                        <div className="w-20 h-28 bg-gradient-to-r from-yellow-400/60 via-yellow-500/40 to-transparent rounded-l-full blur-sm"></div>
                      </div>
                      <div className="absolute -right-10 top-1/2 transform -translate-y-1/2">
                        <div className="w-20 h-28 bg-gradient-to-l from-yellow-400/60 via-yellow-500/40 to-transparent rounded-r-full blur-sm"></div>
                      </div>
                    </div>
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 rounded-full border-[5px] border-white flex items-center justify-center font-bold text-white text-xl shadow-2xl shadow-yellow-500/50">
                      1
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-900/90 via-yellow-800/80 to-emerald-900/80 backdrop-blur-xl rounded-3xl p-6 border-[3px] border-yellow-400/60 shadow-2xl shadow-yellow-500/40 w-full hover:scale-105 transition-transform duration-300">
                  {rankings[0].badge && (
                    <div className="bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 rounded-xl px-4 py-2 mb-3 border border-yellow-400/40">
                      <p className="text-yellow-200 text-sm text-center font-bold flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-200" />
                        {rankings[0].badge}
                      </p>
                    </div>
                  )}
                  <h3 className="text-white font-bold text-center text-xl mb-2 truncate drop-shadow-lg">{rankings[0].name}</h3>
                  <p className="text-yellow-300 text-base text-center mb-4 flex items-center justify-center gap-2">
                    <span className="text-2xl">{rankings[0].countryFlag}</span>
                    <span className="font-semibold">{rankings[0].country}</span>
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-3 text-yellow-300">
                      <span className="text-4xl drop-shadow-2xl animate-pulse">🪙</span>
                      <span className="font-bold text-3xl drop-shadow-lg">{formatCoins(rankings[0].coins)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-1.5 rounded-full border border-yellow-400/30">
                      <TrendingUp className="w-4 h-4 text-yellow-300" />
                      <span className="text-sm text-yellow-200 font-semibold">المستوى {rankings[0].level}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* المركز الثالث */}
            {rankings[2] && (
              <div className="flex flex-col items-center flex-1 animate-fade-in-up animate-delay-300">
                <div className="relative mb-4 group">
                  <div className="absolute -inset-3 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 rounded-full blur-xl opacity-75 group-hover:opacity-100 animate-pulse transition-opacity"></div>
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 border-4 border-white shadow-2xl flex items-center justify-center text-4xl hover:scale-110 transition-transform duration-300">
                    {rankings[2].avatar}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-900 rounded-full border-4 border-white flex items-center justify-center font-bold text-white shadow-xl">
                    <span className="text-lg">3</span>
                  </div>
                  {/* كأس برونزي */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                    <Trophy className="w-8 h-8 text-amber-600 fill-amber-600 drop-shadow-lg" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-900/80 to-amber-950/80 backdrop-blur-xl rounded-2xl p-5 border-2 border-amber-600/40 shadow-2xl shadow-amber-600/30 w-full hover:scale-105 transition-transform duration-300">
                  <h3 className="text-white font-bold text-center text-lg mb-1.5 truncate">{rankings[2].name}</h3>
                  <p className="text-amber-300 text-sm text-center mb-3 flex items-center justify-center gap-2">
                    <span className="text-xl">{rankings[2].countryFlag}</span>
                    <span>{rankings[2].country}</span>
                  </p>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center gap-2 text-yellow-400">
                      <span className="text-3xl drop-shadow-lg">🪙</span>
                      <span className="font-bold text-2xl">{formatCoins(rankings[2].coins)}</span>
                    </div>
                    <div className="text-xs text-white/60">المستوى {rankings[2].level}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* باقي الترتيب */}
          <div className="space-y-4">
            {rankings.slice(3).map((user, index) => (
              <div
                key={user.id}
                className="group bg-gradient-to-br from-emerald-900/60 via-emerald-800/50 to-teal-900/60 backdrop-blur-xl rounded-2xl p-5 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 animate-fade-in-up hover:scale-[1.02] cursor-pointer"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="flex items-center gap-5">
                  {/* الترتيب */}
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-xl">{user.rank}</span>
                    </div>
                  </div>

                  {/* الصورة الرمزية */}
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-teal-700 border-3 border-white/30 flex items-center justify-center text-4xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                      {user.avatar}
                    </div>
                  </div>

                  {/* المعلومات */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-lg truncate mb-1.5 group-hover:text-yellow-300 transition-colors">{user.name}</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
                        <span className="text-lg">{user.countryFlag}</span>
                        <span className="text-white/80 text-sm font-medium">{user.country}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                        <span className="text-emerald-300 text-xs font-semibold">Lv.{user.level}</span>
                      </div>
                    </div>
                  </div>

                  {/* العملات */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-2 bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 px-4 py-2 rounded-xl border border-yellow-500/30 group-hover:border-yellow-400/50 transition-colors">
                      <span className="text-2xl drop-shadow-lg">🪙</span>
                      <span className="text-yellow-400 font-bold text-xl">{formatCoins(user.coins)}</span>
                    </div>
                    {user.badge && (
                      <div className="bg-yellow-500/20 px-3 py-1 rounded-lg border border-yellow-400/30">
                        <span className="text-yellow-300 text-xs font-semibold">{user.badge}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* رسالة للمستخدم خارج القائمة */}
          <div className="mt-8 bg-gradient-to-br from-red-900/60 via-red-800/50 to-red-950/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-red-500/40 shadow-2xl shadow-red-500/20 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl blur opacity-75"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-800 border-3 border-white/30 flex items-center justify-center text-3xl shadow-xl">
                  😔
                </div>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg mb-1.5" dir="rtl">🚫 ليس في القائمة</p>
                <p className="text-red-200 text-sm leading-relaxed" dir="rtl">اجمع المزيد من العملات للظهور في التصنيف العالمي!</p>
              </div>
              <div className="text-right bg-black/40 px-5 py-3 rounded-xl border border-red-400/30">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  <span className="text-yellow-400 font-mono text-2xl font-bold">0</span>
                </div>
                <p className="text-red-300 text-xs mt-1" dir="rtl">عملاتك الحالية</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rankings;
