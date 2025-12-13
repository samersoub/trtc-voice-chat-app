/**
 * TranslationService - الترجمة الآلية للرسائل
 * دعم ترجمة فورية بين اللغات المختلفة
 */

export type SupportedLanguage = 'ar' | 'en' | 'fr' | 'es' | 'de' | 'tr' | 'ur' | 'hi';

export interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  provider: 'google' | 'microsoft' | 'local';
  timestamp: Date;
  cached: boolean;
}

export interface TranslationSettings {
  userId: string;
  autoTranslate: boolean;
  targetLanguage: SupportedLanguage;
  showOriginal: boolean; // عرض النص الأصلي أيضاً
  translateAllMessages: boolean; // ترجمة جميع الرسائل أم فقط عند الطلب
}

class TranslationServiceClass {
  private cache: Map<string, Translation> = new Map();
  private settings: Map<string, TranslationSettings> = new Map();
  private detectedLanguages: Map<string, SupportedLanguage> = new Map();

  // قاموس بسيط للكلمات الشائعة (fallback)
  private readonly dictionary: Record<string, Record<string, string>> = {
    ar: {
      hello: 'مرحبا',
      goodbye: 'وداعا',
      thanks: 'شكرا',
      yes: 'نعم',
      no: 'لا',
      please: 'من فضلك',
      welcome: 'أهلا وسهلا',
    },
    en: {
      مرحبا: 'hello',
      وداعا: 'goodbye',
      شكرا: 'thanks',
      نعم: 'yes',
      لا: 'no',
      'من فضلك': 'please',
      'أهلا وسهلا': 'welcome',
    },
  };

  constructor() {
    this.loadSettings();
    this.loadCache();
  }

  /**
   * ترجمة نص
   */
  async translate(
    text: string,
    targetLang: SupportedLanguage,
    sourceLang?: SupportedLanguage
  ): Promise<Translation> {
    if (!text.trim()) {
      throw new Error('النص فارغ');
    }

    // التحقق من الكاش
    const cacheKey = this.getCacheKey(text, sourceLang || 'auto', targetLang);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // اكتشاف اللغة إذا لم تحدد
    if (!sourceLang) {
      sourceLang = this.detectLanguage(text);
    }

    // إذا كانت نفس اللغة، لا حاجة للترجمة
    if (sourceLang === targetLang) {
      return {
        id: crypto.randomUUID(),
        originalText: text,
        translatedText: text,
        sourceLang,
        targetLang,
        provider: 'local',
        timestamp: new Date(),
        cached: false,
      };
    }

    try {
      // محاولة الترجمة عبر APIs
      const translation = await this.translateViaAPI(text, sourceLang, targetLang);
      
      // حفظ في الكاش
      this.cache.set(cacheKey, translation);
      this.saveCache();

      return translation;
    } catch (error) {
      console.error('فشلت الترجمة عبر API، استخدام القاموس المحلي:', error);
      
      // Fallback: استخدام القاموس المحلي
      const translatedText = this.translateLocal(text, sourceLang, targetLang);
      
      const translation: Translation = {
        id: crypto.randomUUID(),
        originalText: text,
        translatedText,
        sourceLang,
        targetLang,
        provider: 'local',
        timestamp: new Date(),
        cached: false,
      };

      return translation;
    }
  }

  /**
   * ترجمة عبر API (Google Translate أو Microsoft)
   */
  private async translateViaAPI(
    text: string,
    sourceLang: SupportedLanguage,
    targetLang: SupportedLanguage
  ): Promise<Translation> {
    // TODO: استخدام API حقيقي
    // في الوقت الحالي، محاكاة الترجمة
    
    // يمكن استخدام:
    // 1. Google Cloud Translation API
    // 2. Microsoft Translator API
    // 3. MyMemory Translation API (مجاني)
    
    // مثال لاستدعاء MyMemory API (مجاني):
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      
      if (!response.ok) {
        throw new Error('فشل الاتصال بخدمة الترجمة');
      }

      const data = await response.json();
      
      if (data.responseStatus !== 200) {
        throw new Error('خطأ في الترجمة');
      }

      return {
        id: crypto.randomUUID(),
        originalText: text,
        translatedText: data.responseData.translatedText,
        sourceLang,
        targetLang,
        provider: 'google',
        timestamp: new Date(),
        cached: false,
      };
    } catch (error) {
      throw new Error('فشلت الترجمة عبر API');
    }
  }

  /**
   * ترجمة محلية (fallback)
   */
  private translateLocal(
    text: string,
    sourceLang: SupportedLanguage,
    targetLang: SupportedLanguage
  ): string {
    const dict = this.dictionary[sourceLang];
    if (!dict) {
      return text; // لا يوجد قاموس
    }

    // البحث عن ترجمة في القاموس
    const lowerText = text.toLowerCase().trim();
    const translation = dict[lowerText];
    
    if (translation) {
      return translation;
    }

    // محاولة ترجمة كلمة بكلمة
    const words = text.split(' ');
    const translatedWords = words.map(word => {
      const lowerWord = word.toLowerCase();
      return dict[lowerWord] || word;
    });

    return translatedWords.join(' ');
  }

  /**
   * اكتشاف لغة النص
   */
  detectLanguage(text: string): SupportedLanguage {
    // التحقق من الكاش
    const cached = this.detectedLanguages.get(text);
    if (cached) {
      return cached;
    }

    // اكتشاف بسيط بناءً على الأحرف
    const arabicChars = text.match(/[\u0600-\u06FF]/g)?.length || 0;
    const latinChars = text.match(/[a-zA-Z]/g)?.length || 0;
    const totalChars = text.replace(/\s/g, '').length;

    let detected: SupportedLanguage;

    if (arabicChars > totalChars * 0.3) {
      detected = 'ar';
    } else if (latinChars > totalChars * 0.3) {
      detected = 'en';
    } else {
      detected = 'en'; // افتراضي
    }

    // حفظ في الكاش
    this.detectedLanguages.set(text, detected);

    return detected;
  }

  /**
   * ترجمة تلقائية للرسائل
   */
  async autoTranslateMessage(
    userId: string,
    messageText: string,
    messageLang?: SupportedLanguage
  ): Promise<Translation | null> {
    const settings = this.getUserSettings(userId);

    if (!settings.autoTranslate || !settings.translateAllMessages) {
      return null;
    }

    try {
      const sourceLang = messageLang || this.detectLanguage(messageText);
      
      // لا حاجة للترجمة إذا كانت نفس اللغة
      if (sourceLang === settings.targetLanguage) {
        return null;
      }

      return await this.translate(messageText, settings.targetLanguage, sourceLang);
    } catch (error) {
      console.error('فشلت الترجمة التلقائية:', error);
      return null;
    }
  }

  /**
   * الحصول على اللغات المدعومة
   */
  getSupportedLanguages(): Array<{
    code: SupportedLanguage;
    name: string;
    nativeName: string;
  }> {
    return [
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    ];
  }

  /**
   * إعدادات المستخدم
   */
  getUserSettings(userId: string): TranslationSettings {
    return (
      this.settings.get(userId) || {
        userId,
        autoTranslate: false,
        targetLanguage: 'ar',
        showOriginal: true,
        translateAllMessages: false,
      }
    );
  }

  /**
   * تحديث الإعدادات
   */
  updateSettings(userId: string, settings: Partial<TranslationSettings>): void {
    const current = this.getUserSettings(userId);
    this.settings.set(userId, { ...current, ...settings });
    this.saveSettings();
  }

  /**
   * مسح الكاش
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem('translationCache');
  }

  /**
   * إحصائيات الترجمة
   */
  getStats(): {
    totalTranslations: number;
    cacheSize: number;
    cacheHitRate: number;
  } {
    const totalTranslations = this.cache.size;
    const cachedTranslations = Array.from(this.cache.values()).filter(t => t.cached).length;

    return {
      totalTranslations,
      cacheSize: this.cache.size,
      cacheHitRate: totalTranslations > 0 ? cachedTranslations / totalTranslations : 0,
    };
  }

  /**
   * مفتاح الكاش
   */
  private getCacheKey(text: string, sourceLang: string, targetLang: string): string {
    return `${sourceLang}:${targetLang}:${text.toLowerCase().trim()}`;
  }

  /**
   * حفظ الكاش
   */
  private saveCache(): void {
    try {
      // حفظ آخر 500 ترجمة فقط
      const entries = Array.from(this.cache.entries()).slice(-500);
      localStorage.setItem('translationCache', JSON.stringify(entries));
    } catch (error) {
      console.error('فشل حفظ كاش الترجمة:', error);
    }
  }

  /**
   * تحميل الكاش
   */
  private loadCache(): void {
    try {
      const data = localStorage.getItem('translationCache');
      if (data) {
        const entries: [string, any][] = JSON.parse(data);
        entries.forEach(([key, value]) => {
          this.cache.set(key, {
            ...value,
            timestamp: new Date(value.timestamp),
            cached: true,
          });
        });
      }
    } catch (error) {
      console.error('فشل تحميل كاش الترجمة:', error);
    }
  }

  /**
   * حفظ الإعدادات
   */
  private saveSettings(): void {
    try {
      const entries = Array.from(this.settings.entries());
      localStorage.setItem('translationSettings', JSON.stringify(entries));
    } catch (error) {
      console.error('فشل حفظ إعدادات الترجمة:', error);
    }
  }

  /**
   * تحميل الإعدادات
   */
  private loadSettings(): void {
    try {
      const data = localStorage.getItem('translationSettings');
      if (data) {
        const entries: [string, TranslationSettings][] = JSON.parse(data);
        this.settings = new Map(entries);
      }
    } catch (error) {
      console.error('فشل تحميل إعدادات الترجمة:', error);
    }
  }
}

export const TranslationService = new TranslationServiceClass();
