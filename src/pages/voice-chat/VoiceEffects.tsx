import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { VoiceEffectsService, type VoiceEffect, type EqualizerPreset, type SpatialAudioSettings } from '@/services/VoiceEffectsService';
import { AuthService } from '@/services/AuthService';
import { PremiumFeaturesService } from '@/services/PremiumFeaturesService';
import { Phase1AnalyticsService } from '@/services/Phase1AnalyticsService';
import { showSuccess, showError } from '@/utils/toast';
import { useLocale } from '@/contexts';
import {
  Mic,
  Volume2,
  Sparkles,
  Settings,
  Crown,
  Lock,
  Check,
  Waves,
  Radio,
  Headphones
} from 'lucide-react';

const EffectCard = ({
  effect,
  isActive,
  isOwned,
  onPurchase,
  onActivate
}: {
  effect: VoiceEffect;
  isActive: boolean;
  isOwned: boolean;
  onPurchase: (effectId: string) => void;
  onActivate: (effectId: string) => void;
}) => {
  return (
    <Card className={`p-5 transition-all duration-300 hover:shadow-xl ${
      isActive
        ? 'border-2 border-green-500 shadow-lg shadow-green-500/30'
        : 'border border-purple-500/20 hover:border-purple-500/50'
    }`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-4xl p-3 rounded-lg ${
              isActive ? 'bg-green-500/20' : 'bg-purple-500/20'
            }`}>
              {effect.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{effect.name}</h3>
              <p className="text-sm text-gray-400">{effect.description}</p>
            </div>
          </div>
          {effect.isPremium && (
            <Crown className="w-5 h-5 text-yellow-500" />
          )}
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            effect.category === 'filter' ? 'bg-purple-500/20 text-purple-300' :
            effect.category === 'equalizer' ? 'bg-blue-500/20 text-blue-300' :
            'bg-green-500/20 text-green-300'
          }`}>
            {effect.category === 'filter' ? 'فلتر' : 
             effect.category === 'equalizer' ? 'إكولايزر' : 'صوت محيطي'}
          </span>
        </div>

        {/* Action Button */}
        {!isOwned && effect.price > 0 ? (
          <Button
            onClick={() => onPurchase(effect.id)}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            <Lock className="w-4 h-4 mr-2" />
            شراء - {effect.price} عملة
          </Button>
        ) : isActive ? (
          <Button
            disabled
            className="w-full bg-green-500 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            نشط الآن
          </Button>
        ) : (
          <Button
            onClick={() => onActivate(effect.id)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            تفعيل التأثير
          </Button>
        )}
      </div>
    </Card>
  );
};

const EqualizerPanel = ({ userId }: { userId: string }) => {
  const [activePreset, setActivePreset] = useState<EqualizerPreset | null>(null);
  const [presets, setPresets] = useState<EqualizerPreset[]>([]);

  useEffect(() => {
    const allPresets = VoiceEffectsService.getEqualizerPresets();
    const active = VoiceEffectsService.getActiveEqualizerPreset(userId);
    setPresets(allPresets);
    setActivePreset(active);
  }, [userId]);

  const handlePresetChange = (presetId: string) => {
    VoiceEffectsService.setEqualizerPreset(userId, presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setActivePreset(preset);
      showSuccess(`تم تطبيق ${preset.name}`);
    }
  };

  if (!activePreset) return null;

  const bands = Object.entries(activePreset.bands);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Waves className="w-5 h-5" />
        الإكولايزر
      </h3>

      {/* Preset Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            onClick={() => handlePresetChange(preset.id)}
            variant={activePreset.id === preset.id ? 'default' : 'outline'}
            size="sm"
            className={
              activePreset.id === preset.id
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }
          >
            {preset.name}
          </Button>
        ))}
      </div>

      {/* Frequency Bands */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {bands.map(([freq, value]) => (
          <div key={freq} className="space-y-2">
            <div className="text-center">
              <span className="text-sm text-gray-400">{freq}</span>
            </div>
            <div className="h-32 flex flex-col items-center justify-end">
              <div 
                className="w-8 rounded-t-lg transition-all duration-300"
                style={{
                  height: `${((value + 12) / 24) * 100}%`,
                  backgroundColor: value >= 0 ? '#10b981' : '#ef4444'
                }}
              />
            </div>
            <div className="text-center">
              <span className="text-xs text-white font-medium">{value > 0 ? '+' : ''}{value}dB</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const SpatialAudioPanel = ({ userId }: { userId: string }) => {
  const [settings, setSettings] = useState<SpatialAudioSettings | null>(null);

  useEffect(() => {
    const current = VoiceEffectsService.getSpatialAudioSettings(userId);
    setSettings(current);
  }, [userId]);

  const handleToggle = (enabled: boolean) => {
    VoiceEffectsService.updateSpatialAudioSettings(userId, { enabled });
    setSettings(prev => prev ? { ...prev, enabled } : null);
    showSuccess(enabled ? 'تم تفعيل الصوت المحيطي' : 'تم إيقاف الصوت المحيطي');
  };

  const handleModeChange = (mode: '3d' | 'surround' | 'stereo') => {
    VoiceEffectsService.updateSpatialAudioSettings(userId, { mode });
    setSettings(prev => prev ? { ...prev, mode } : null);
  };

  const handleRoomSizeChange = (roomSize: 'small' | 'medium' | 'large') => {
    VoiceEffectsService.updateSpatialAudioSettings(userId, { roomSize });
    setSettings(prev => prev ? { ...prev, roomSize } : null);
  };

  const handleDistanceChange = (distance: number[]) => {
    VoiceEffectsService.updateSpatialAudioSettings(userId, { distance: distance[0] });
    setSettings(prev => prev ? { ...prev, distance: distance[0] } : null);
  };

  if (!settings) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Headphones className="w-5 h-5" />
          الصوت المحيطي (3D Audio)
        </h3>
        <Switch
          checked={settings.enabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {settings.enabled && (
        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">وضع الصوت</label>
            <div className="flex gap-2">
              {(['stereo', 'surround', '3d'] as const).map((mode) => (
                <Button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  variant={settings.mode === mode ? 'default' : 'outline'}
                  className={
                    settings.mode === mode
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }
                >
                  {mode === 'stereo' ? 'ستيريو' : mode === 'surround' ? 'محيطي' : 'ثلاثي الأبعاد'}
                </Button>
              ))}
            </div>
          </div>

          {/* Room Size */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">حجم الغرفة</label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <Button
                  key={size}
                  onClick={() => handleRoomSizeChange(size)}
                  variant={settings.roomSize === size ? 'default' : 'outline'}
                  className={
                    settings.roomSize === size
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }
                >
                  {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}
                </Button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">
              المسافة: {settings.distance}%
            </label>
            <Slider
              value={[settings.distance]}
              onValueChange={handleDistanceChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

const VoiceEffects = () => {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const [effects, setEffects] = useState<VoiceEffect[]>([]);
  const [activeEffect, setActiveEffect] = useState<VoiceEffect | null>(null);
  const [ownedEffects, setOwnedEffects] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const userId = AuthService.getCurrentUser()?.id || 'demo';
  const userCoins = 5000; // Demo balance

  const loadEffects = useCallback(() => {
    const allEffects = VoiceEffectsService.getAllEffects();
    const active = VoiceEffectsService.getActiveEffect(userId);
    const owned = VoiceEffectsService.getPurchasedEffects(userId);

    setEffects(allEffects);
    setActiveEffect(active);
    setOwnedEffects(owned);
  }, [userId]);

  useEffect(() => {
    loadEffects();
  }, [loadEffects]);

  const handlePurchase = (effectId: string) => {
    const result = VoiceEffectsService.purchaseEffect(userId, effectId, userCoins);
    if (result.success) {
      showSuccess(result.message);
      loadEffects();
    } else {
      showError(result.message);
    }
  };

  const handleActivate = (effectId: string) => {
    const effect = effects.find(e => e.id === effectId);
    
    // Check Premium access for premium effects
    if (effect?.isPremium) {
      const effect = effects.find(e => e.id === effectId);
      const canUse = PremiumFeaturesService.canUseEffect(userId, effect?.isPremium || false);
      if (!canUse) {
        showError('يتطلب هذا المؤثر اشتراك Premium');
        navigate('/premium');
        return;
      }
    }
    
    VoiceEffectsService.activateEffect(userId, effectId);
    showSuccess('تم تفعيل التأثير الصوتي');
    
    // Log analytics
    Phase1AnalyticsService.logUsage({
      userId,
      feature: 'effect',
      featureId: effectId
    });
    
    loadEffects();
  };

  const filteredEffects = selectedCategory === 'all'
    ? effects
    : effects.filter(e => e.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'الكل', icon: Settings },
    { id: 'filter', name: 'فلاتر', icon: Mic },
    { id: 'equalizer', name: 'إكولايزر', icon: Waves },
    { id: 'spatial', name: 'صوت محيطي', icon: Radio }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">المؤثرات الصوتية</h1>
            <p className="text-purple-200">حسّن صوتك بمؤثرات احترافية</p>
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
                <p className="text-purple-200 text-sm">التأثيرات المتاحة</p>
                <p className="text-2xl font-bold text-white">{effects.length}</p>
              </div>
              <Volume2 className="w-8 h-8 text-purple-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-600 to-green-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">التأثيرات المملوكة</p>
                <p className="text-2xl font-bold text-white">{ownedEffects.length}</p>
              </div>
              <Check className="w-8 h-8 text-green-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">التأثير النشط</p>
                <p className="text-lg font-bold text-white">{activeEffect?.name}</p>
              </div>
              <Sparkles className="w-8 h-8 text-blue-200" />
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
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
                <Icon className="w-4 h-4" />
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Effects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredEffects.map((effect) => (
            <EffectCard
              key={effect.id}
              effect={effect}
              isActive={activeEffect?.id === effect.id}
              isOwned={ownedEffects.includes(effect.id)}
              onPurchase={handlePurchase}
              onActivate={handleActivate}
            />
          ))}
        </div>

        {/* Advanced Controls */}
        <div className="space-y-6">
          <EqualizerPanel userId={userId} />
          <SpatialAudioPanel userId={userId} />
        </div>
      </div>
    </div>
  );
};

export default VoiceEffects;
