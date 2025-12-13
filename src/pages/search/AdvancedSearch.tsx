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

  const sortOptions: { value: SearchFilters['sortBy']; label: string; icon: any }[] = [
    { value: 'relevance', label: 'الأكثر صلة', icon: Star },
    { value: 'popularity', label: 'الأكثر شعبية', icon: TrendingUp },
    { value: 'distance', label: 'الأقرب', icon: MapPin },
    { value: 'recent', label: 'الأحدث', icon: Clock },
  ];

  return (
    <ChatLayout title="البحث المتقدم" hideHeader>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-4 pb-24" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Search Bar */}
          <Card className="bg-gray-800/50 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ابحث عن أشخاص..."
                    value={filters.query || ''}
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pr-10 bg-gray-900/50 border-purple-500/30 text-white"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? 'جارٍ البحث...' : 'بحث'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-purple-500/30"
                >
                  <Filter className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>فلاتر البحث</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sort By */}
                <div>
                  <Label className="text-gray-300 mb-2 block">ترتيب حسب</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {sortOptions.map(option => (
                      <Button
                        key={option.value}
                        variant={filters.sortBy === option.value ? 'default' : 'outline'}
                        className={filters.sortBy === option.value 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'border-purple-500/30'}
                        onClick={() => setFilters({ ...filters, sortBy: option.value })}
                      >
                        <option.icon className="w-4 h-4 ml-2" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <Label className="text-gray-300 mb-2 block">الاهتمامات</Label>
                  <div className="flex flex-wrap gap-2">
                    {popularInterests.map(interest => (
                      <Badge
                        key={interest}
                        variant={filters.interests?.includes(interest) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all ${
                          filters.interests?.includes(interest)
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'border-purple-500/30 hover:border-purple-500'
                        }`}
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

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.online ? 'default' : 'outline'}
                    size="sm"
                    className={filters.online ? 'bg-green-600 hover:bg-green-700' : 'border-purple-500/30'}
                    onClick={() => setFilters({ ...filters, online: !filters.online })}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 ml-2" />
                    متصل الآن
                  </Button>
                  <Button
                    variant={filters.verified ? 'default' : 'outline'}
                    size="sm"
                    className={filters.verified ? 'bg-blue-600 hover:bg-blue-700' : 'border-purple-500/30'}
                    onClick={() => setFilters({ ...filters, verified: !filters.verified })}
                  >
                    ✓ موثق
                  </Button>
                  <Button
                    variant={filters.premium ? 'default' : 'outline'}
                    size="sm"
                    className={filters.premium ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-purple-500/30'}
                    onClick={() => setFilters({ ...filters, premium: !filters.premium })}
                  >
                    ⭐ مميز
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                النتائج ({results.length})
              </h2>
              
              {results.map((result) => (
                <Card 
                  key={result.user.id}
                  className="bg-gray-800/50 border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/profile/${result.user.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <img
                        src={result.user.avatarUrl}
                        alt={result.user.name}
                        className="w-16 h-16 rounded-full border-2 border-purple-500"
                      />

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">
                            {result.user.name}
                          </h3>
                          {result.user.verified && (
                            <Badge className="bg-blue-600">✓</Badge>
                          )}
                          {result.user.isPremium && (
                            <Badge className="bg-yellow-600">⭐</Badge>
                          )}
                          {result.user.isOnline && (
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          )}
                        </div>

                        <p className="text-sm text-gray-400 mb-2">
                          {result.user.bio}
                        </p>

                        {/* Match Score */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-purple-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span>نقاط التطابق: {result.score}</span>
                          </div>
                          {result.distance && (
                            <div className="flex items-center gap-1 text-blue-400">
                              <MapPin className="w-4 h-4" />
                              <span>{result.distance.toFixed(1)} كم</span>
                            </div>
                          )}
                        </div>

                        {/* Match Reasons */}
                        {result.matchReasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
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
                        {result.user.interests && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.user.interests.slice(0, 3).map((interest, i) => (
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

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${result.user.id}`);
                          }}
                        >
                          عرض الملف
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-purple-500/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: إرسال رسالة
                          }}
                        >
                          <Users className="w-4 h-4 ml-1" />
                          متابعة
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && filters.query && (
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  لم يتم العثور على نتائج
                </h3>
                <p className="text-gray-400">
                  جرب البحث بكلمات أخرى أو تعديل الفلاتر
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ChatLayout>
  );
};

export default AdvancedSearch;
