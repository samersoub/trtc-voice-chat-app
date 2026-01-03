import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatLayout from '@/components/chat/ChatLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  AdvancedSearchService, 
  SearchFilters, 
  SearchResult 
} from '@/services/AdvancedSearchService';
import { 
  Search, 
  MapPin, 
  Users, 
  Heart, 
  Star, 
  TrendingUp, 
  Clock,
  Filter,
  X
} from 'lucide-react';
import { useLocale } from '@/contexts';
import type { User } from '@/models/User';

// Extended User type for search results with additional properties
interface ExtendedUser extends User {
  isOnline?: boolean;
  verified?: boolean;
  isPremium?: boolean;
  interests?: string[];
}

const AdvancedSearch: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'relevance',
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async () => {
    if (!filters.query?.trim() && !filters.interests?.length) {
      return;
    }

    setLoading(true);
    try {
      const searchResults = await AdvancedSearchService.search(filters, 50, 0);
      setResults(searchResults);
      
      // حفظ في السجل
      if (filters.query) {
        AdvancedSearchService.addToHistory('current-user', filters.query);
      }
    } catch (error) {
      console.error('فشل البحث:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    const current = filters.interests || [];
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    setFilters({ ...filters, interests: updated });
  };

  const popularInterests = [
    'غناء', 'موسيقى', 'ألعاب', 'رياضة', 'طبخ', 
    'سفر', 'فن', 'تصوير', 'قراءة', 'أفلام'
  ];

  const sortOptions: { value: SearchFilters['sortBy']; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'relevance', label: 'الأكثر صلة', icon: Star },
    { value: 'popularity', label: 'الأكثر شعبية', icon: TrendingUp },
    { value: 'distance', label: 'الأقرب', icon: MapPin },
    { value: 'recent', label: 'الأحدث', icon: Clock },
  ];

  return (
    <ChatLayout title="البحث المتقدم" hideHeader>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 via-pink-900/20 to-gray-900 p-4 pb-24 relative overflow-hidden" dir="rtl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* Header with Animation */}
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              اكتشف أصدقاء جدد
            </h1>
            <p className="text-gray-400 text-lg">ابحث بذكاء، اعثر على التطابق المثالي</p>
          </div>

          {/* Search Bar with Glass Effect */}
          <Card className="bg-gray-800/30 backdrop-blur-xl border-purple-500/30 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 animate-slide-up">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <div className="flex-1 relative group">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 group-hover:text-pink-400 transition-colors duration-300 group-hover:scale-110" />
                  <Input
                    type="text"
                    placeholder="ابحث عن أشخاص، اهتمامات، أو مواهب..."
                    value={filters.query || ''}
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pr-12 pl-4 h-14 bg-gray-900/50 backdrop-blur-sm border-purple-500/30 text-white placeholder:text-gray-500 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="h-14 px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 rounded-xl font-bold text-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جارٍ البحث...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      بحث
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-14 px-6 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500 transition-all duration-300 rounded-xl ${
                    showFilters ? 'bg-purple-500/20 border-purple-500' : ''
                  }`}
                >
                  <Filter className={`w-5 h-5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters Panel with Smooth Animation */}
          {showFilters && (
            <Card className="bg-gray-800/30 backdrop-blur-xl border-purple-500/30 shadow-2xl shadow-purple-500/10 animate-slide-down overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-pink-900/30">
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xl">
                    <Filter className="w-6 h-6 text-purple-400" />
                    فلاتر البحث المتقدم
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="hover:bg-red-500/20 hover:text-red-400 transition-colors duration-300 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {/* Sort Options with Icons */}
                <div className="space-y-3">
                  <Label className="text-gray-200 mb-2 block text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    ترتيب النتائج
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {sortOptions.map((option, index) => (
                      <Button
                        key={option.value}
                        variant={filters.sortBy === option.value ? 'default' : 'outline'}
                        className={`h-12 transition-all duration-300 hover:scale-105 rounded-xl ${
                          filters.sortBy === option.value 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30 border-0' 
                            : 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => setFilters({ ...filters, sortBy: option.value })}
                      >
                        <option.icon className="w-5 h-5 ml-2" />
                        <span className="font-medium">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Interests with Animation */}
                <div className="space-y-3">
                  <Label className="text-gray-200 mb-2 block text-lg font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    الاهتمامات المفضلة
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {popularInterests.map((interest, index) => (
                      <Badge
                        key={interest}
                        variant={filters.interests?.includes(interest) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all duration-300 hover:scale-110 px-4 py-2 text-sm rounded-full ${
                          filters.interests?.includes(interest)
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 shadow-lg shadow-pink-500/30 animate-bounce-subtle'
                            : 'border-purple-500/30 hover:border-pink-500 hover:bg-pink-500/10'
                        }`}
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 mb-2 block">العمر من</Label>
                    <Input
                      type="number"
                      min="18"
                      max="99"
                      value={filters.ageRange?.min || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        ageRange: { ...filters.ageRange, min: parseInt(e.target.value) || undefined }
                      })}
                      className="bg-gray-900/50 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-2 block">إلى</Label>
                    <Input
                      type="number"
                      min="18"
                      max="99"
                      value={filters.ageRange?.max || ''}
                      onChange={(e) => setFilters({
                        ...filters,
                        ageRange: { ...filters.ageRange, max: parseInt(e.target.value) || undefined }
                      })}
                      className="bg-gray-900/50 border-purple-500/30 text-white"
                    />
                  </div>
                </div>

                {/* Quick Filters with Glow Effects */}
                <div className="space-y-3">
                  <Label className="text-gray-200 block text-lg font-semibold">فلاتر سريعة</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant={filters.online ? 'default' : 'outline'}
                      size="sm"
                      className={`h-11 px-5 rounded-xl transition-all duration-300 hover:scale-105 ${
                        filters.online 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/40 animate-pulse-subtle' 
                          : 'border-purple-500/30 hover:border-green-500 hover:bg-green-500/10'
                      }`}
                      onClick={() => setFilters({ ...filters, online: !filters.online })}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400 ml-2 animate-ping absolute" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 ml-2 relative" />
                      <span className="font-medium">متصل الآن</span>
                    </Button>
                    <Button
                      variant={filters.verified ? 'default' : 'outline'}
                      size="sm"
                      className={`h-11 px-5 rounded-xl transition-all duration-300 hover:scale-105 ${
                        filters.verified 
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/40' 
                          : 'border-purple-500/30 hover:border-blue-500 hover:bg-blue-500/10'
                      }`}
                      onClick={() => setFilters({ ...filters, verified: !filters.verified })}
                    >
                      <span className="text-lg ml-1">✓</span>
                      <span className="font-medium">موثق</span>
                    </Button>
                    <Button
                      variant={filters.premium ? 'default' : 'outline'}
                      size="sm"
                      className={`h-11 px-5 rounded-xl transition-all duration-300 hover:scale-105 ${
                        filters.premium 
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 shadow-lg shadow-yellow-500/40' 
                          : 'border-purple-500/30 hover:border-yellow-500 hover:bg-yellow-500/10'
                      }`}
                      onClick={() => setFilters({ ...filters, premium: !filters.premium })}
                    >
                      <span className="text-lg ml-1">⭐</span>
                      <span className="font-medium">مميز</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results with Stagger Animation */}
          {results.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  النتائج ({results.length})
                </h2>
                <span className="text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-full">
                  عُثر على {results.length} تطابق
                </span>
              </div>
              
              {results.map((result, index) => (
                <Card 
                  key={result.user.id}
                  className="bg-gray-800/30 backdrop-blur-xl border-purple-500/30 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer hover:scale-[1.02] group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/profile/${result.user.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-5">
                      {/* Avatar with Ring */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                        <img
                          src={result.user.avatarUrl}
                          alt={result.user.name}
                          className="relative w-20 h-20 rounded-full border-3 border-purple-500 shadow-xl group-hover:scale-110 transition-transform duration-300"
                        />
                        {(result.user as ExtendedUser).isOnline && (
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-3 border-gray-800 animate-pulse" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                            {result.user.name}
                          </h3>
                          {(result.user as ExtendedUser).verified && (
                            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30 animate-pulse-subtle">
                              <span className="text-sm">✓</span>
                            </Badge>
                          )}
                          {(result.user as ExtendedUser).isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 shadow-lg shadow-yellow-500/30">
                              <span className="animate-bounce-subtle">⭐</span>
                            </Badge>
                          )}
                        </div>

                        {/* Match Score with Gradient */}
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1.5 rounded-full border border-purple-500/30">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 animate-pulse" />
                            <span className="font-semibold text-purple-300">تطابق: {result.score}%</span>
                          </div>
                          {result.distance && (
                            <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/30">
                              <MapPin className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-300">{result.distance.toFixed(1)} كم</span>
                            </div>
                          )}
                        </div>

                        {/* Match Reasons */}
                        {result.matchReasons.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {result.matchReasons.map((reason, i) => (
                              <Badge 
                                key={i} 
                                variant="outline" 
                                className="text-xs border-purple-500/30"
                              >
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Interests */}
                        {(result.user as ExtendedUser).interests && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {((result.user as ExtendedUser).interests || []).slice(0, 3).map((interest, i) => (
                              <Badge 
                                key={i} 
                                className="text-xs bg-purple-600/50"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons with Hover Effects */}
                      <div className="flex flex-col gap-2.5">
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${result.user.id}`);
                          }}
                        >
                          <span className="font-medium">عرض الملف</span>
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500 hover:scale-110 transition-all duration-300 rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: إرسال رسالة
                          }}
                        >
                          <Users className="w-4 h-4 ml-1" />
                          <span>متابعة</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State with Animation */}
          {!loading && results.length === 0 && filters.query && (
            <Card className="bg-gray-800/30 backdrop-blur-xl border-purple-500/30 animate-fade-in">
              <CardContent className="p-16 text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
                  <Search className="relative w-20 h-20 text-purple-400 mx-auto animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                  لم يتم العثور على نتائج
                </h3>
                <p className="text-gray-400 text-lg mb-6">
                  جرب البحث بكلمات أخرى أو تعديل الفلاتر
                </p>
                <Button
                  variant="outline"
                  className="border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500 transition-all duration-300"
                  onClick={() => setFilters({ query: '', sortBy: 'relevance' })}
                >
                  إعادة تعيين الفلاتر
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ChatLayout>
  );
};

export default AdvancedSearch;
