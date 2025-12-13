import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RoomThemesService, type RoomTheme } from '@/services/RoomThemesService';
import { AuthService } from '@/services/AuthService';
import { PremiumFeaturesService } from '@/services/PremiumFeaturesService';
import { Phase1AnalyticsService } from '@/services/Phase1AnalyticsService';
import { showSuccess, showError } from '@/utils/toast';
import { useLocale } from '@/contexts';
import {
  Check,
  Crown,
  Sparkles,
  Music,
  Palette,
  Lock,
  ChevronRight
} from 'lucide-react';

const ThemeCard = ({ 
  theme, 
  isActive, 
  isOwned, 
  onPurchase, 
  onActivate 
}: { 
  theme: RoomTheme; 
  isActive: boolean; 
  isOwned: boolean;
  onPurchase: (themeId: string) => void;
  onActivate: (themeId: string) => void;
}) => {
  const getCategoryBadge = (category: string) => {
    const badges = {
      classic: { text: 'كلاسيكي', color: 'bg-blue-500' },
      modern: { text: 'عصري', color: 'bg-purple-500' },
      luxury: { text: 'فاخر', color: 'bg-yellow-500' },
      seasonal: { text: 'موسمي', color: 'bg-green-500' }
    };
    return badges[category as keyof typeof badges] || badges.classic;
  };

  const badge = getCategoryBadge(theme.category);

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-2xl ${
      isActive 
        ? 'border-2 border-green-500 shadow-lg shadow-green-500/30' 
        : 'border border-purple-500/20 hover:border-purple-500/50'
    }`}>
      {/* Preview Image */}
      <div className={`relative h-48 ${
        theme.background.type === 'gradient' 
          ? `bg-gradient-to-br ${theme.background.value}` 
          : 'bg-cover bg-center'
      }`}
      style={theme.background.type === 'image' ? { backgroundImage: `url(${theme.background.value})` } : undefined}
      >
        {/* Overlay */}
        {theme.background.overlay && (
          <div className={`absolute inset-0 ${theme.background.overlay}`} />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${badge.color}`}>
            {badge.text}
          </span>
          {theme.isPremium && (
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              مميز
            </span>
          )}
        </div>

        {/* Active Badge */}
        {isActive && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-green-500 flex items-center gap-1">
            <Check className="w-3 h-3" />
            نشط
          </div>
        )}

        {/* Lock Overlay */}
        {!isOwned && theme.price > 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-12 h-12 text-white mx-auto mb-2" />
              <p className="text-white font-bold text-lg">{theme.price} عملة</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{theme.name}</h3>
          <p className="text-sm text-gray-400">{theme.description}</p>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>نمط المقاعد: {theme.seatLayout}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>تأثير الدخول: {
              theme.effects.entranceEffect === 'fireworks' ? 'ألعاب نارية' :
              theme.effects.entranceEffect === 'confetti' ? 'كونفيتي' :
              theme.effects.entranceEffect === 'sparkles' ? 'بريق' : 'بدون'
            }</span>
          </div>
          {theme.musicBackground?.enabled && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Music className="w-4 h-4 text-blue-400" />
              <span>موسيقى خلفية متضمنة</span>
            </div>
          )}
        </div>

        {/* Color Preview */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">الألوان:</span>
          <div className="flex gap-1">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white/20"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <div 
              className="w-6 h-6 rounded-full border-2 border-white/20"
              style={{ backgroundColor: theme.colors.secondary }}
            />
            <div 
              className="w-6 h-6 rounded-full border-2 border-white/20"
              style={{ backgroundColor: theme.colors.accent }}
            />
          </div>
        </div>

        {/* Action Button */}
        {isActive ? (
          <Button
            disabled
            className="w-full bg-green-500 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            الثيم النشط
          </Button>
        ) : isOwned ? (
          <Button
            onClick={() => onActivate(theme.id)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            تفعيل الثيم
          </Button>
        ) : (
          <Button
            onClick={() => onPurchase(theme.id)}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            شراء - {theme.price} عملة
          </Button>
        )}
      </div>
    </Card>
  );
};

const RoomThemes = () => {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const [themes, setThemes] = useState<RoomTheme[]>([]);
  const [activeTheme, setActiveTheme] = useState<RoomTheme | null>(null);
  const [ownedThemes, setOwnedThemes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const userId = AuthService.getCurrentUser()?.id || 'demo';
  const userCoins = 5000; // Demo balance

  const loadThemes = useCallback(() => {
    const allThemes = RoomThemesService.getAllThemes();
    const active = RoomThemesService.getActiveTheme(userId);
    const owned = RoomThemesService.getPurchasedThemes(userId);
    
    setThemes(allThemes);
    setActiveTheme(active);
    setOwnedThemes(owned);
  }, [userId]);

  useEffect(() => {
    loadThemes();
  }, [loadThemes]);

  const handlePurchase = (themeId: string) => {
    const result = RoomThemesService.purchaseTheme(userId, themeId, userCoins);
    if (result.success) {
      showSuccess(result.message);
      loadThemes();
    } else {
      showError(result.message);
    }
  };

  const handleActivate = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    
    // Check Premium access for premium themes
    if (theme?.isPremium) {
      const canUse = PremiumFeaturesService.canUseTheme(userId, theme.price || 0, true);
      if (!canUse) {
        showError('يتطلب هذا الثيم اشتراك Premium');
        navigate('/premium');
        return;
      }
    }
    
    RoomThemesService.activateTheme(userId, themeId);
    showSuccess('تم تفعيل الثيم بنجاح');
    
    // Log analytics
    Phase1AnalyticsService.logUsage({
      userId,
      feature: 'theme',
      featureId: themeId
    });
    
    loadThemes();
  };

  const filteredThemes = selectedCategory === 'all'
    ? themes
    : themes.filter(t => t.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'الكل', count: themes.length },
    { id: 'classic', name: 'كلاسيكي', count: themes.filter(t => t.category === 'classic').length },
    { id: 'modern', name: 'عصري', count: themes.filter(t => t.category === 'modern').length },
    { id: 'luxury', name: 'فاخر', count: themes.filter(t => t.category === 'luxury').length },
    { id: 'seasonal', name: 'موسمي', count: themes.filter(t => t.category === 'seasonal').length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">ثيمات الغرف</h1>
            <p className="text-purple-200">خصص غرفتك الصوتية بثيمات رائعة</p>
          </div>
          <div className="flex items-center gap-3">
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">الثيمات المتاحة</p>
                <p className="text-2xl font-bold text-white">{themes.length}</p>
              </div>
              <Palette className="w-8 h-8 text-purple-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-600 to-green-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">الثيمات المملوكة</p>
                <p className="text-2xl font-bold text-white">{ownedThemes.length}</p>
              </div>
              <Check className="w-8 h-8 text-green-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-600 to-yellow-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">الثيم النشط</p>
                <p className="text-lg font-bold text-white">{activeTheme?.name}</p>
              </div>
              <Sparkles className="w-8 h-8 text-yellow-200" />
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className={`flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cat.name}
              <span className="text-xs opacity-70">({cat.count})</span>
            </Button>
          ))}
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={activeTheme?.id === theme.id}
              isOwned={ownedThemes.includes(theme.id)}
              onPurchase={handlePurchase}
              onActivate={handleActivate}
            />
          ))}
        </div>

        {filteredThemes.length === 0 && (
          <Card className="p-12 text-center">
            <Palette className="w-16 h-16 mx-auto mb-4 text-purple-500" />
            <h3 className="text-xl font-bold text-white mb-2">لا توجد ثيمات</h3>
            <p className="text-gray-400">لا توجد ثيمات في هذه الفئة</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RoomThemes;
