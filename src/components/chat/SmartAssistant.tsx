import { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/contexts';
import { X, Send, MessageCircle, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const SmartAssistant = () => {
  const { locale, dir } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lottieContainer = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: locale === 'ar' 
          ? 'مرحباً! 👋 أنا مساعدك الذكي في دندنة. كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! 👋 I am your smart assistant in Dandana. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, locale, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load Lottie animation
  useEffect(() => {
    if (!lottieContainer.current) return;

    const loadLottie = async () => {
      try {
        // @ts-ignore
        const lottie = (await import('lottie-web')).default;
        
        const animation = lottie.loadAnimation({
          container: lottieContainer.current!,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: '/lottie/chatbot.json'
        });

        return () => animation.destroy();
      } catch (error) {
        console.log('Lottie animation not loaded, using fallback');
      }
    };

    loadLottie();
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot typing
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = getBotResponse(inputText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    const responses = locale === 'ar' ? {
      greeting: 'مرحباً! سعيد بالتحدث معك 😊',
      room: 'يمكنك إنشاء غرفة صوتية من القائمة الرئيسية، أو الانضمام للغرف المتاحة 🎤',
      gift: 'يمكنك إرسال الهدايا من المتجر. اختر من بين الورد والسيارات والتنين الذهبي! 🎁',
      coins: 'للحصول على عملات، اذهب إلى صفحة إعادة الشحن أو ادعُ أصدقائك لكسب الألماس 💎',
      profile: 'يمكنك تعديل ملفك الشخصي من قائمة الإعدادات 👤',
      help: 'أنا هنا للمساعدة! يمكنني مساعدتك في:\n• إنشاء الغرف الصوتية\n• إرسال الهدايا\n• شحن العملات\n• تعديل الملف الشخصي\nفقط اسألني! 💡',
      default: 'عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟ أو اكتب "مساعدة" لرؤية ما يمكنني فعله 🤔',
    } : {
      greeting: 'Hello! Nice to talk to you 😊',
      room: 'You can create a voice room from the main menu, or join available rooms 🎤',
      gift: 'You can send gifts from the store. Choose from roses, cars, and golden dragons! 🎁',
      coins: 'To get coins, go to the recharge page or invite friends to earn diamonds 💎',
      profile: 'You can edit your profile from the settings menu 👤',
      help: 'I am here to help! I can assist you with:\n• Creating voice rooms\n• Sending gifts\n• Recharging coins\n• Editing profile\nJust ask me! 💡',
      default: 'Sorry, I didn\'t understand your question. Can you rephrase it? Or type "help" to see what I can do 🤔',
    };

    if (input.includes('مرحبا') || input.includes('hello') || input.includes('hi')) {
      return responses.greeting;
    } else if (input.includes('غرفة') || input.includes('room') || input.includes('صوت') || input.includes('voice')) {
      return responses.room;
    } else if (input.includes('هدية') || input.includes('gift') || input.includes('هدايا')) {
      return responses.gift;
    } else if (input.includes('عملة') || input.includes('coin') || input.includes('شحن') || input.includes('recharge')) {
      return responses.coins;
    } else if (input.includes('ملف') || input.includes('profile') || input.includes('حساب')) {
      return responses.profile;
    } else if (input.includes('مساعدة') || input.includes('help')) {
      return responses.help;
    } else {
      return responses.default;
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 group"
          style={{ animation: 'bounce 2s infinite' }}
        >
          <div className="relative">
            {/* Animation Container */}
            <div 
              ref={lottieContainer}
              className="w-20 h-20"
            />
            
            {/* Fallback Icon */}
            {!lottieContainer.current && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
            )}

            {/* Notification Badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">
                  {locale === 'ar' ? 'المساعد الذكي' : 'Smart Assistant'}
                </h3>
                <p className="text-white/80 text-xs">
                  {locale === 'ar' ? 'متصل الآن' : 'Online now'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" dir={dir}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                      : 'bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white border border-white/10 rounded-2xl p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-black/20 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={locale === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                dir={dir}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default SmartAssistant;
