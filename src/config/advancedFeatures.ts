/**
 * Advanced Features Configuration
 * تكوين الميزات المتقدمة
 */

export const AdvancedFeaturesConfig = {
  // 1. الإشعارات
  notifications: {
    enabled: true,
    pushEnabled: true, // Push Notifications
    soundEnabled: true,
    maxStoredNotifications: 100,
    autoMarkReadAfter: 5000, // ms
  },

  // 2. البحث المتقدم
  search: {
    enabled: true,
    maxResults: 100,
    cacheResults: true,
    cacheDuration: 300000, // 5 دقائق
    minQueryLength: 2,
    showHistory: true,
    maxHistoryItems: 20,
  },

  // 3. الحظر والكتم
  moderation: {
    enabled: true,
    allowBlock: true,
    allowMute: true,
    allowReport: true,
    maxBlockedUsers: 1000,
    maxMutedUsers: 100,
    defaultMuteDuration: 60, // دقيقة
    autoUnmuteExpired: true,
  },

  // 4. سجل المحادثات
  chatHistory: {
    enabled: true,
    maxMessagesPerRoom: 10000,
    defaultPageSize: 50,
    enableSearch: true,
    enableExport: true,
    autoCleanupDays: 30,
  },

  // 5. التسجيل
  recording: {
    enabled: true,
    vipOnly: true, // فقط للـ VIP
    defaultQuality: 'medium' as const,
    defaultFormat: 'webm' as const,
    maxDuration: 120, // دقيقة
    autoRecord: false,
    saveToCloud: false,
  },

  // 6. الترجمة
  translation: {
    enabled: true,
    defaultTargetLanguage: 'ar' as const,
    autoTranslate: false,
    showOriginal: true,
    cacheTranslations: true,
    maxCacheSize: 500,
    useFallback: true, // استخدام القاموس المحلي عند فشل API
  },

  // إعدادات عامة
  general: {
    enableAllFeatures: true,
    enableDemoData: false, // PRODUCTION MODE - No demo data
    debugMode: false,
    logErrors: true,
  },
};

/**
 * التحقق من تفعيل ميزة
 */
export function isFeatureEnabled(feature: keyof typeof AdvancedFeaturesConfig): boolean {
  if (!AdvancedFeaturesConfig.general.enableAllFeatures) {
    return false;
  }
  return AdvancedFeaturesConfig[feature]?.enabled ?? false;
}

/**
 * الحصول على تكوين ميزة
 */
export function getFeatureConfig<K extends keyof typeof AdvancedFeaturesConfig>(
  feature: K
): typeof AdvancedFeaturesConfig[K] {
  return AdvancedFeaturesConfig[feature];
}

/**
 * تحديث تكوين ميزة
 */
export function updateFeatureConfig<K extends keyof typeof AdvancedFeaturesConfig>(
  feature: K,
  config: Partial<typeof AdvancedFeaturesConfig[K]>
): void {
  Object.assign(AdvancedFeaturesConfig[feature], config);
  
  // حفظ في localStorage
  try {
    localStorage.setItem(
      `feature_config_${feature}`,
      JSON.stringify(AdvancedFeaturesConfig[feature])
    );
  } catch (error) {
    console.error('فشل حفظ تكوين الميزة:', error);
  }
}

/**
 * تحميل التكوين من localStorage
 */
export function loadFeaturesConfig(): void {
  Object.keys(AdvancedFeaturesConfig).forEach((feature) => {
    try {
      const saved = localStorage.getItem(`feature_config_${feature}`);
      if (saved) {
        Object.assign(
          AdvancedFeaturesConfig[feature as keyof typeof AdvancedFeaturesConfig],
          JSON.parse(saved)
        );
      }
    } catch (error) {
      console.error(`فشل تحميل تكوين ${feature}:`, error);
    }
  });
}

/**
 * إعادة تعيين جميع التكوينات
 */
export function resetFeaturesConfig(): void {
  Object.keys(AdvancedFeaturesConfig).forEach((feature) => {
    localStorage.removeItem(`feature_config_${feature}`);
  });
  
  // إعادة التحميل
  window.location.reload();
}

// تحميل التكوين عند الاستيراد
if (typeof window !== 'undefined') {
  loadFeaturesConfig();
}
