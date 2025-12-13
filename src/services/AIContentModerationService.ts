/**
 * AI Content Moderation Service
 * يوفر فلترة تلقائية للمحتوى غير اللائق
 * يدعم فحص النصوص، الصور، والروابط
 */

export interface ModerationResult {
  allowed: boolean;
  confidence: number; // 0-1
  reasons: string[];
  categories: ContentCategory[];
  action: ModerationAction;
  filteredContent?: string;
}

export enum ContentCategory {
  PROFANITY = 'profanity',
  HATE_SPEECH = 'hate_speech',
  SEXUAL_CONTENT = 'sexual_content',
  VIOLENCE = 'violence',
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  PERSONAL_INFO = 'personal_info',
  ILLEGAL_CONTENT = 'illegal_content',
  SAFE = 'safe',
}

export enum ModerationAction {
  ALLOW = 'allow',
  FILTER = 'filter', // استبدال الكلمات
  FLAG = 'flag', // تعليم للمراجعة
  BLOCK = 'block', // حظر كامل
  AUTO_BAN = 'auto_ban', // حظر المستخدم تلقائياً
}

export interface ContentPatterns {
  profanity: RegExp[];
  hateSpeech: RegExp[];
  sexualContent: RegExp[];
  violence: RegExp[];
  spam: RegExp[];
  personalInfo: RegExp[];
}

class AIContentModerationService {
  private static instance: AIContentModerationService;
  private patterns: ContentPatterns;
  private whitelist: Set<string> = new Set();
  private blacklist: Set<string> = new Set();
  private suspiciousPatterns: Map<ContentCategory, RegExp[]> = new Map();

  private constructor() {
    this.patterns = this.initializePatterns();
    this.initializeSuspiciousPatterns();
    this.loadCustomLists();
  }

  public static getInstance(): AIContentModerationService {
    if (!AIContentModerationService.instance) {
      AIContentModerationService.instance = new AIContentModerationService();
    }
    return AIContentModerationService.instance;
  }

  /**
   * تهيئة الأنماط
   */
  private initializePatterns(): ContentPatterns {
    return {
      // كلمات بذيئة (عربي + إنجليزي)
      profanity: [
        /\b(كلب|حمار|غبي|احمق|لعنة|تبا)\b/gi,
        /\b(fuck|shit|damn|ass|bitch|bastard)\b/gi,
        /\b(f[*\-_]ck|sh[*\-_]t|b[*\-_]tch)\b/gi,
      ],

      // خطاب الكراهية
      hateSpeech: [
        /\b(عنصري|كراهية|تمييز|احتقار)\b/gi,
        /\b(racist|hate|discrimination|supremacy)\b/gi,
        /\b(kill all|death to|die [a-z]+)\b/gi,
      ],

      // محتوى جنسي
      sexualContent: [
        /\b(جنس|عاري|عارية|ساخن|مثير)\b/gi,
        /\b(sex|nude|naked|porn|xxx|nsfw)\b/gi,
        /\b(dick|pussy|cock|boobs|ass)\b/gi,
        /\b(س[ي|ی]کس|نیک|سکسی)\b/gi, // فارسي
      ],

      // عنف
      violence: [
        /\b(قتل|اقتل|اضرب|اعتدي|سلاح|انفجار|دماء)\b/gi,
        /\b(kill|murder|attack|weapon|bomb|blood|violence)\b/gi,
        /\b(shoot|stab|hurt|harm|destroy)\b/gi,
      ],

      // سبام
      spam: [
        /(.)\1{5,}/g, // تكرار حرف 5 مرات أو أكثر
        /\b(اربح الان|مجانا|مال سريع|انقر هنا)\b/gi,
        /\b(win now|free money|click here|buy now)\b/gi,
        /(https?:\/\/[^\s]+){3,}/g, // 3 روابط أو أكثر
        /\b(\d{10,})\b/g, // أرقام طويلة (محتمل رقم هاتف)
      ],

      // معلومات شخصية
      personalInfo: [
        /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // أرقام هواتف
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // إيميلات
        /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, // بطاقات ائتمان
        /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      ],
    };
  }

  /**
   * تهيئة الأنماط المشبوهة
   */
  private initializeSuspiciousPatterns(): void {
    // محاولات التحايل على الفلتر
    this.suspiciousPatterns.set(ContentCategory.PROFANITY, [
      /[a@][s$][s$]/gi, // a$$, @ss
      /f[u*]ck/gi,
      /b[i!]tch/gi,
      /sh[i!]t/gi,
    ]);

    this.suspiciousPatterns.set(ContentCategory.SPAM, [
      /\b[A-Z]{5,}\b/g, // كلمات بأحرف كبيرة فقط
      /!{3,}/g, // علامات تعجب متعددة
      /(.+)\1{2,}/g, // تكرار نفس النص
    ]);
  }

  /**
   * تحميل القوائم المخصصة
   */
  private loadCustomLists(): void {
    try {
      const whitelistData = localStorage.getItem('moderation_whitelist');
      const blacklistData = localStorage.getItem('moderation_blacklist');

      if (whitelistData) {
        const list = JSON.parse(whitelistData);
        this.whitelist = new Set(list);
      }

      if (blacklistData) {
        const list = JSON.parse(blacklistData);
        this.blacklist = new Set(list);
      }
    } catch (error) {
      console.error('Failed to load custom lists:', error);
    }
  }

  /**
   * فحص محتوى نصي
   */
  public async moderateText(
    text: string,
    userId?: string,
    strictMode: boolean = false
  ): Promise<ModerationResult> {
    const normalizedText = text.toLowerCase().trim();
    const categories: ContentCategory[] = [];
    const reasons: string[] = [];
    let confidence = 0;
    let action = ModerationAction.ALLOW;

    // فحص القائمة السوداء أولاً
    if (this.isBlacklisted(normalizedText)) {
      return {
        allowed: false,
        confidence: 1.0,
        reasons: ['محتوى محظور في القائمة السوداء'],
        categories: [ContentCategory.ILLEGAL_CONTENT],
        action: ModerationAction.BLOCK,
      };
    }

    // فحص القائمة البيضاء
    if (this.isWhitelisted(normalizedText)) {
      return {
        allowed: true,
        confidence: 1.0,
        reasons: ['محتوى موثوق في القائمة البيضاء'],
        categories: [ContentCategory.SAFE],
        action: ModerationAction.ALLOW,
      };
    }

    // فحص الأنماط
    let filteredText = text;

    // 1. كلمات بذيئة
    if (this.detectProfanity(normalizedText)) {
      categories.push(ContentCategory.PROFANITY);
      reasons.push('يحتوي على كلمات بذيئة');
      confidence += 0.3;
      filteredText = this.filterProfanity(filteredText);
      action = strictMode ? ModerationAction.BLOCK : ModerationAction.FILTER;
    }

    // 2. خطاب كراهية
    if (this.detectHateSpeech(normalizedText)) {
      categories.push(ContentCategory.HATE_SPEECH);
      reasons.push('خطاب كراهية');
      confidence += 0.4;
      action = ModerationAction.BLOCK;
    }

    // 3. محتوى جنسي
    if (this.detectSexualContent(normalizedText)) {
      categories.push(ContentCategory.SEXUAL_CONTENT);
      reasons.push('محتوى جنسي غير لائق');
      confidence += 0.35;
      action = strictMode ? ModerationAction.BLOCK : ModerationAction.FLAG;
    }

    // 4. عنف
    if (this.detectViolence(normalizedText)) {
      categories.push(ContentCategory.VIOLENCE);
      reasons.push('محتوى عنيف');
      confidence += 0.35;
      action = ModerationAction.FLAG;
    }

    // 5. سبام
    if (this.detectSpam(normalizedText)) {
      categories.push(ContentCategory.SPAM);
      reasons.push('محتمل سبام');
      confidence += 0.2;
      action = action === ModerationAction.ALLOW ? ModerationAction.FLAG : action;
    }

    // 6. معلومات شخصية
    if (this.detectPersonalInfo(normalizedText)) {
      categories.push(ContentCategory.PERSONAL_INFO);
      reasons.push('يحتوي على معلومات شخصية');
      confidence += 0.25;
      filteredText = this.filterPersonalInfo(filteredText);
      action = action === ModerationAction.ALLOW ? ModerationAction.FILTER : action;
    }

    // حساب الثقة النهائية
    confidence = Math.min(1.0, confidence);

    // تحديد الإجراء النهائي
    if (categories.length === 0) {
      categories.push(ContentCategory.SAFE);
      action = ModerationAction.ALLOW;
    }

    // حظر تلقائي للمحتوى الخطير
    if (
      categories.includes(ContentCategory.HATE_SPEECH) ||
      (categories.includes(ContentCategory.VIOLENCE) && confidence > 0.7)
    ) {
      action = ModerationAction.AUTO_BAN;
    }

    return {
      allowed: action === ModerationAction.ALLOW || action === ModerationAction.FILTER,
      confidence,
      reasons,
      categories,
      action,
      filteredContent: action === ModerationAction.FILTER ? filteredText : undefined,
    };
  }

  /**
   * كشف الكلمات البذيئة
   */
  private detectProfanity(text: string): boolean {
    return this.patterns.profanity.some(pattern => pattern.test(text));
  }

  /**
   * كشف خطاب الكراهية
   */
  private detectHateSpeech(text: string): boolean {
    return this.patterns.hateSpeech.some(pattern => pattern.test(text));
  }

  /**
   * كشف المحتوى الجنسي
   */
  private detectSexualContent(text: string): boolean {
    return this.patterns.sexualContent.some(pattern => pattern.test(text));
  }

  /**
   * كشف العنف
   */
  private detectViolence(text: string): boolean {
    return this.patterns.violence.some(pattern => pattern.test(text));
  }

  /**
   * كشف السبام
   */
  private detectSpam(text: string): boolean {
    return this.patterns.spam.some(pattern => pattern.test(text));
  }

  /**
   * كشف المعلومات الشخصية
   */
  private detectPersonalInfo(text: string): boolean {
    return this.patterns.personalInfo.some(pattern => pattern.test(text));
  }

  /**
   * فلترة الكلمات البذيئة
   */
  private filterProfanity(text: string): string {
    let filtered = text;
    this.patterns.profanity.forEach(pattern => {
      filtered = filtered.replace(pattern, match => '*'.repeat(match.length));
    });
    return filtered;
  }

  /**
   * فلترة المعلومات الشخصية
   */
  private filterPersonalInfo(text: string): string {
    let filtered = text;
    
    // إخفاء أرقام الهواتف
    filtered = filtered.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[رقم هاتف محذوف]');
    
    // إخفاء الإيميلات
    filtered = filtered.replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      '[بريد إلكتروني محذوف]'
    );
    
    // إخفاء بطاقات الائتمان
    filtered = filtered.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, '[رقم بطاقة محذوف]');
    
    return filtered;
  }

  /**
   * التحقق من القائمة البيضاء
   */
  private isWhitelisted(text: string): boolean {
    return this.whitelist.has(text);
  }

  /**
   * التحقق من القائمة السوداء
   */
  private isBlacklisted(text: string): boolean {
    return this.blacklist.has(text);
  }

  /**
   * إضافة إلى القائمة البيضاء
   */
  public addToWhitelist(text: string): void {
    this.whitelist.add(text.toLowerCase());
    this.saveWhitelist();
  }

  /**
   * إضافة إلى القائمة السوداء
   */
  public addToBlacklist(text: string): void {
    this.blacklist.add(text.toLowerCase());
    this.saveBlacklist();
  }

  /**
   * حفظ القائمة البيضاء
   */
  private saveWhitelist(): void {
    try {
      localStorage.setItem('moderation_whitelist', JSON.stringify([...this.whitelist]));
    } catch (error) {
      console.error('Failed to save whitelist:', error);
    }
  }

  /**
   * حفظ القائمة السوداء
   */
  private saveBlacklist(): void {
    try {
      localStorage.setItem('moderation_blacklist', JSON.stringify([...this.blacklist]));
    } catch (error) {
      console.error('Failed to save blacklist:', error);
    }
  }

  /**
   * فحص URL
   */
  public async moderateURL(url: string): Promise<ModerationResult> {
    const suspiciousDomains = [
      'bit.ly', 'tinyurl.com', 't.co', // مختصرات روابط
      'xxx', '.adult', '.porn', // نطاقات للكبار
    ];

    const lowerURL = url.toLowerCase();
    
    if (suspiciousDomains.some(domain => lowerURL.includes(domain))) {
      return {
        allowed: false,
        confidence: 0.8,
        reasons: ['رابط مشبوه'],
        categories: [ContentCategory.SPAM],
        action: ModerationAction.FLAG,
      };
    }

    return {
      allowed: true,
      confidence: 1.0,
      reasons: [],
      categories: [ContentCategory.SAFE],
      action: ModerationAction.ALLOW,
    };
  }

  /**
   * فحص صورة (يتطلب ML API)
   */
  public async moderateImage(imageUrl: string): Promise<ModerationResult> {
    // هذا يتطلب API خارجي مثل Google Cloud Vision أو AWS Rekognition
    // للتوضيح فقط - يجب تطبيقه مع Backend
    
    console.warn('Image moderation requires external API - returning safe for now');
    
    return {
      allowed: true,
      confidence: 0.5,
      reasons: ['فحص الصور غير متاح حالياً'],
      categories: [ContentCategory.SAFE],
      action: ModerationAction.FLAG,
    };
  }

  /**
   * الحصول على إحصائيات
   */
  public getStats(): {
    whitelistSize: number;
    blacklistSize: number;
    patternsCount: number;
  } {
    return {
      whitelistSize: this.whitelist.size,
      blacklistSize: this.blacklist.size,
      patternsCount: Object.values(this.patterns).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
    };
  }

  /**
   * مسح القوائم المخصصة
   */
  public clearCustomLists(): void {
    this.whitelist.clear();
    this.blacklist.clear();
    localStorage.removeItem('moderation_whitelist');
    localStorage.removeItem('moderation_blacklist');
  }
}

export default AIContentModerationService.getInstance();
