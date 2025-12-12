import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, Crown, Shield, Star, Sparkles, Gift, TrendingUp, 
  Eye, Users, Zap, Image as ImageIcon, DollarSign,
  Award, Coins, Percent, Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts";

type AristocracyLevel = "leader" | "minister" | "prince" | "noble" | "governor" | "president";

interface AristocracyTier {
  id: AristocracyLevel;
  name: string;
  nameAr: string;
  bgGradient: string;
  glowColor: string;
  badgeIcon: string;
  price: string;
  duration: string;
  coins: string;
  benefits: {
    entranceEffect: boolean;
    avatarFrame: boolean;
    nameTag: boolean;
    exclusiveEntry: boolean;
    onlineCard: boolean;
    profileCard: boolean;
    specialGift: boolean;
  };
  privileges: {
    dailyCoins: string;
    expBoost: string;
    freeRename: boolean;
    storeDiscount: string;
    topList: boolean;
    fastUpgrade: string;
    superMic: boolean;
    invisibility: boolean;
    kickProtection: boolean;
  };
}

export default function Aristocracy() {
  const { dir } = useLocale();
  const navigate = useNavigate();
  
  const [activeLevel, setActiveLevel] = useState<AristocracyLevel>("leader");

  const tiers: AristocracyTier[] = [
    {
      id: "leader",
      name: "Leader",
      nameAr: "القائد",
      bgGradient: "from-emerald-600 via-green-700 to-teal-800",
      glowColor: "emerald",
      badgeIcon: "🐲",
      price: "10",
      duration: "30",
      coins: "900",
      benefits: {
        entranceEffect: true,
        avatarFrame: true,
        nameTag: false,
        exclusiveEntry: false,
        onlineCard: false,
        profileCard: false,
        specialGift: false
      },
      privileges: {
        dailyCoins: "900",
        expBoost: "",
        freeRename: false,
        storeDiscount: "20%",
        topList: false,
        fastUpgrade: "110%",
        superMic: false,
        invisibility: false,
        kickProtection: false
      }
    },
    {
      id: "minister",
      name: "Minister",
      nameAr: "الوزير",
      bgGradient: "from-red-800 via-orange-900 to-amber-950",
      glowColor: "orange",
      badgeIcon: "🔥",
      price: "200",
      duration: "30",
      coins: "2400",
      benefits: {
        entranceEffect: true,
        avatarFrame: true,
        nameTag: false,
        exclusiveEntry: true,
        onlineCard: true,
        profileCard: true,
        specialGift: false
      },
      privileges: {
        dailyCoins: "2400",
        expBoost: "",
        freeRename: false,
        storeDiscount: "20%",
        topList: false,
        fastUpgrade: "110%",
        superMic: false,
        invisibility: false,
        kickProtection: false
      }
    },
    {
      id: "prince",
      name: "Prince",
      nameAr: "الأمير",
      bgGradient: "from-purple-800 via-purple-900 to-indigo-950",
      glowColor: "purple",
      badgeIcon: "💎",
      price: "980000 عملة",
      duration: "30",
      coins: "10500",
      benefits: {
        entranceEffect: true,
        avatarFrame: false,
        nameTag: false,
        exclusiveEntry: false,
        onlineCard: false,
        profileCard: false,
        specialGift: false
      },
      privileges: {
        dailyCoins: "10500",
        expBoost: "",
        freeRename: false,
        storeDiscount: "20%",
        topList: false,
        fastUpgrade: "120%",
        superMic: false,
        invisibility: false,
        kickProtection: false
      }
    },
    {
      id: "noble",
      name: "Noble",
      nameAr: "النبيل",
      bgGradient: "from-yellow-700 via-orange-800 to-amber-900",
      glowColor: "yellow",
      badgeIcon: "🦁",
      price: "2940000 عملة",
      duration: "30",
      coins: "31500",
      benefits: {
        entranceEffect: true,
        avatarFrame: true,
        nameTag: true,
        exclusiveEntry: true,
        onlineCard: true,
        profileCard: true,
        specialGift: true
      },
      privileges: {
        dailyCoins: "31500",
        expBoost: "",
        freeRename: true,
        storeDiscount: "20%",
        topList: true,
        fastUpgrade: "130%",
        superMic: true,
        invisibility: false,
        kickProtection: true
      }
    },
    {
      id: "governor",
      name: "Governor",
      nameAr: "الحاكم",
      bgGradient: "from-blue-900 via-indigo-900 to-blue-950",
      glowColor: "blue",
      badgeIcon: "👑",
      price: "100",
      duration: "30",
      coins: "1500",
      benefits: {
        entranceEffect: true,
        avatarFrame: false,
        nameTag: false,
        exclusiveEntry: false,
        onlineCard: false,
        profileCard: true,
        specialGift: false
      },
      privileges: {
        dailyCoins: "1500",
        expBoost: "",
        freeRename: false,
        storeDiscount: "20%",
        topList: false,
        fastUpgrade: "110%",
        superMic: false,
        invisibility: false,
        kickProtection: false
      }
    },
    {
      id: "president",
      name: "President",
      nameAr: "الرئيس",
      bgGradient: "from-cyan-800 via-blue-900 to-indigo-950",
      glowColor: "cyan",
      badgeIcon: "⚡",
      price: "100",
      duration: "30",
      coins: "1500",
      benefits: {
        entranceEffect: true,
        avatarFrame: true,
        nameTag: true,
        exclusiveEntry: true,
        onlineCard: true,
        profileCard: true,
        specialGift: false
      },
      privileges: {
        dailyCoins: "1500",
        expBoost: "",
        freeRename: false,
        storeDiscount: "20%",
        topList: false,
        fastUpgrade: "110%",
        superMic: false,
        invisibility: false,
        kickProtection: false
      }
    }
  ];

  const currentTier = tiers.find(t => t.id === activeLevel) || tiers[0];

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentTier.bgGradient} pb-24 relative overflow-hidden`} dir={dir}>
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="w-10" />
        <h1 className="text-2xl font-bold text-white">الأرستقراطية</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Level Tabs */}
      <div className="relative z-10 flex justify-around px-2 py-4 overflow-x-auto scrollbar-hide">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setActiveLevel(tier.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px] ${
              activeLevel === tier.id
                ? "bg-white/20 scale-110 shadow-lg"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <span className="text-2xl">{tier.badgeIcon}</span>
            <span className={`text-xs font-bold whitespace-nowrap ${
              activeLevel === tier.id ? "text-white" : "text-white/60"
            }`}>
              {tier.nameAr}
            </span>
          </button>
        ))}
      </div>

      {/* Main Badge Display */}
      <div className="relative z-10 flex justify-center py-8 mb-6">
        <div className="relative">
          {/* Glow Effect */}
          <div className={`absolute inset-0 bg-gradient-to-br from-${currentTier.glowColor}-400 to-${currentTier.glowColor}-600 blur-3xl opacity-50 animate-pulse scale-150`} />
          
          {/* Badge */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <div className="text-9xl drop-shadow-2xl animate-bounce-slow">
              {currentTier.badgeIcon}
            </div>
            
            {/* Rotating Ring */}
            <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-spin-slow" />
            <div className="absolute inset-4 border-2 border-white/10 rounded-full animate-spin-reverse" />
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 px-4 space-y-4">
        {/* Profile Card Section */}
        <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent flex-1" />
            <h3 className="text-white text-lg font-bold">بطاقة التعريف</h3>
            <div className="h-px bg-gradient-to-l from-transparent via-white/50 to-transparent flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {currentTier.benefits.nameTag && (
              <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">Lama Team</span>
                </div>
                <p className="text-white text-[10px] text-center">امتياز اسم ملون</p>
              </div>
            )}

            {currentTier.benefits.entranceEffect && (
              <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg overflow-hidden">
                  <div className="w-full h-1/2 bg-gradient-to-r from-yellow-300 to-orange-400" />
                  <div className="w-full h-1/2 bg-gradient-to-r from-orange-400 to-red-500" />
                </div>
                <p className="text-white text-[10px] text-center">تأثير الدخول</p>
              </div>
            )}

            {currentTier.benefits.avatarFrame && (
              <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                <div className="w-16 h-16 mx-auto mb-2 relative">
                  <Crown className="w-full h-full text-yellow-400" />
                </div>
                <p className="text-white text-[10px] text-center">إطار الصورة الرمزية</p>
              </div>
            )}

            {currentTier.benefits.specialGift && (
              <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-[10px] text-center">هدية خاصة</p>
              </div>
            )}

            {currentTier.benefits.exclusiveEntry && (
              <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-[10px] text-center">دخولية حصرية</p>
              </div>
            )}

            {currentTier.benefits.onlineCard && (
              <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-lg p-2">
                  <div className="text-[8px] text-gray-800">User Card</div>
                </div>
                <p className="text-white text-[10px] text-center">بطاقة مستخدم عبر الإنترنت حصرية</p>
              </div>
            )}

            {currentTier.benefits.profileCard && (
              <div className="bg-black/30 rounded-xl p-3 border border-white/10">
                <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-[10px] text-center">بطاقة الملف الشخصي للأرستقراطية</p>
              </div>
            )}
          </div>
        </div>

        {/* Privileges Section */}
        <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent flex-1" />
            <h3 className="text-white text-lg font-bold">الامتيازات الخاصة</h3>
            <div className="h-px bg-gradient-to-l from-transparent via-white/50 to-transparent flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-xs text-center font-bold">{currentTier.privileges.dailyCoins} عملات / يوم</p>
            </div>

            {currentTier.privileges.expBoost && (
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs text-center">زيادة الخبرة</p>
              </div>
            )}

            {currentTier.privileges.freeRename && (
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs text-center">أشخاء علامة مجانا</p>
              </div>
            )}

            {currentTier.privileges.storeDiscount && (
              <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl p-4 border border-green-500/30">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                  <Percent className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs text-center">خصم {currentTier.privileges.storeDiscount} في المتجر</p>
              </div>
            )}

            {currentTier.privileges.topList && (
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs text-center">قمة الموجودين</p>
              </div>
            )}

            {currentTier.privileges.fastUpgrade && (
              <div className="bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-xl p-4 border border-pink-500/30">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs text-center">مستوى المستخدم *{currentTier.privileges.fastUpgrade} ترقية سريعة</p>
              </div>
            )}

            {currentTier.privileges.superMic && (
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs text-center">الميكروفون الفائق</p>
              </div>
            )}

            {currentTier.privileges.invisibility && (
              <div className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-xl p-4 border border-gray-500/30">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs text-center">الاختفاء</p>
              </div>
            )}

            {currentTier.privileges.kickProtection && (
              <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl p-4 border border-red-500/30">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs text-center">مكافح الطرد</p>
              </div>
            )}
          </div>
        </div>

        {/* More Benefits */}
        <div className="text-center py-4">
          <p className="text-white/60 text-sm">المزيد من الامتيازات لفتحها ...</p>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <p className="text-white text-xl font-bold text-center mb-2">
            {currentTier.price.includes('عملة') ? currentTier.price : `${currentTier.price} دولار أمريكي`} / {currentTier.duration} يوماً
          </p>
          {currentTier.price.includes('عملة') ? (
            <p className="text-white/80 text-sm text-center">
              إهداء {(parseInt(currentTier.price) * 0.3).toFixed(0)} عملات ذهبية ، خصم 15% للتجديد
            </p>
          ) : (
            <p className="text-white/80 text-sm text-center">
              إهداء {parseInt(currentTier.coins) * 3} عملات ذهبية ، خصم 15% للتجديد
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-8">
          <Button
            className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 hover:from-yellow-500 hover:via-orange-600 hover:to-yellow-500 text-black font-bold py-6 rounded-2xl shadow-lg hover:shadow-yellow-500/50 transition-all"
          >
            فتح الأرستقراطية
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-transparent border-2 border-white/30 hover:bg-white/10 text-white font-bold py-6 rounded-2xl"
          >
            إهداء للأصدقاء
          </Button>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
