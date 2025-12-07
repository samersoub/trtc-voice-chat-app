/**
 * GeminiService - خدمة التواصل مع Google Gemini API
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDpCcYPB6_oClVpNYhc0S6o9FJhJKQfKkE'; // ضع مفتاح API الخاص بك هنا
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
  }[];
}

class GeminiServiceClass {
  private conversationHistory: GeminiMessage[] = [];
  private systemContext = `أنت مساعد ذكي في تطبيق "دندنة" للتواصل الصوتي. 
  
تطبيق دندنة يوفر:
- غرف صوتية للتواصل والدردشة
- نظام هدايا (ورود، سيارات فاخرة، تنين ذهبي، قلاع)
- نظام عملات وألماس
- نظام مستويات الثروة (10 مستويات من مبتدئ إلى أسطورة)
- ملفات شخصية وعلاقات
- بيت الحب للأزواج
- نظام ميداليات ومكافآت
- متجر لشراء العملات
- مطابقة ذكية للشركاء

كن ودوداً ومفيداً، وأجب باللغة العربية بشكل أساسي إلا إذا طلب المستخدم الإنجليزية.
استخدم الإيموجي بشكل مناسب لجعل المحادثة أكثر حيوية.`;

  /**
   * إرسال رسالة إلى Gemini والحصول على رد
   */
  async sendMessage(userMessage: string, locale: string = 'ar'): Promise<string> {
    try {
      // إضافة رسالة المستخدم للتاريخ
      const userMsg: GeminiMessage = {
        role: 'user',
        parts: [{ text: userMessage }]
      };

      // إضافة السياق إذا كانت أول رسالة
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: this.systemContext }]
        });
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: locale === 'ar' ? 'مرحباً! أنا مساعدك الذكي في دندنة. كيف أستطيع مساعدتك اليوم؟ 😊' : 'Hello! I am your smart assistant in Dandana. How can I help you today? 😊' }]
        });
      }

      this.conversationHistory.push(userMsg);

      const requestBody: GeminiRequest = {
        contents: this.conversationHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini');
      }

      const botResponse = data.candidates[0].content.parts[0].text;

      // إضافة رد البوت للتاريخ
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: botResponse }]
      });

      // الاحتفاظ بآخر 20 رسالة فقط لتوفير الذاكرة
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return botResponse;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // رد احتياطي في حالة الخطأ
      return this.getFallbackResponse(userMessage, locale);
    }
  }

  /**
   * رد احتياطي إذا فشل الاتصال بـ Gemini
   */
  private getFallbackResponse(userMessage: string, locale: string): string {
    const input = userMessage.toLowerCase();
    
    const responses = locale === 'ar' ? {
      greeting: 'مرحباً! سعيد بالتحدث معك 😊',
      room: 'يمكنك إنشاء غرفة صوتية من القائمة الرئيسية، أو الانضمام للغرف المتاحة 🎤',
      gift: 'يمكنك إرسال الهدايا من المتجر. اختر من بين الورد والسيارات والتنين الذهبي! 🎁',
      coins: 'للحصول على عملات، اذهب إلى صفحة إعادة الشحن أو ادعُ أصدقائك لكسب الألماس 💎',
      wealth: 'يمكنك زيارة صفحة مستوى الثروة لمعرفة مستواك والمزايا المتاحة لك! 👑',
      profile: 'يمكنك تعديل ملفك الشخصي من قائمة الإعدادات 👤',
      help: 'أنا هنا للمساعدة! يمكنني مساعدتك في:\n• إنشاء الغرف الصوتية\n• إرسال الهدايا\n• شحن العملات\n• مستوى الثروة\n• تعديل الملف الشخصي\nفقط اسألني! 💡',
      default: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة لاحقاً أو اسألني عن: الغرف، الهدايا، العملات، أو الملف الشخصي 🤔',
    } : {
      greeting: 'Hello! Nice to talk to you 😊',
      room: 'You can create a voice room from the main menu, or join available rooms 🎤',
      gift: 'You can send gifts from the store. Choose from roses, cars, and golden dragons! 🎁',
      coins: 'To get coins, go to the recharge page or invite friends to earn diamonds 💎',
      wealth: 'You can visit the Wealth Level page to see your level and available benefits! 👑',
      profile: 'You can edit your profile from the settings menu 👤',
      help: 'I am here to help! I can assist you with:\n• Creating voice rooms\n• Sending gifts\n• Recharging coins\n• Wealth level\n• Editing profile\nJust ask me! 💡',
      default: 'Sorry, there was a connection error. Please try again later or ask me about: rooms, gifts, coins, or profile 🤔',
    };

    if (input.includes('مرحبا') || input.includes('hello') || input.includes('hi')) {
      return responses.greeting;
    } else if (input.includes('غرفة') || input.includes('room') || input.includes('صوت') || input.includes('voice')) {
      return responses.room;
    } else if (input.includes('هدية') || input.includes('gift') || input.includes('هدايا')) {
      return responses.gift;
    } else if (input.includes('عملة') || input.includes('coin') || input.includes('شحن') || input.includes('recharge')) {
      return responses.coins;
    } else if (input.includes('ثروة') || input.includes('wealth') || input.includes('مستوى')) {
      return responses.wealth;
    } else if (input.includes('ملف') || input.includes('profile') || input.includes('حساب')) {
      return responses.profile;
    } else if (input.includes('مساعدة') || input.includes('help')) {
      return responses.help;
    } else {
      return responses.default;
    }
  }

  /**
   * إعادة تعيين سجل المحادثة
   */
  resetConversation(): void {
    this.conversationHistory = [];
  }

  /**
   * الحصول على سجل المحادثة
   */
  getConversationHistory(): GeminiMessage[] {
    return [...this.conversationHistory];
  }
}

export const GeminiService = new GeminiServiceClass();
