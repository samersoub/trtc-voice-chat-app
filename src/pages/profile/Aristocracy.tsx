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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Decorative Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-white rounded-full animate-spin-slow" />
          <div className="absolute top-40 right-20 w-24 h-24 border-4 border-white rounded-full animate-spin-reverse" />
          <div className="absolute bottom-32 left-1/4 w-40 h-40 border-4 border-white rounded-full animate-spin-slow" />
        </div>
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
      <div className="relative z-10 px-3 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setActiveLevel(tier.id)}
              className={`relative flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-500 min-w-[75px] ${
                activeLevel === tier.id
                  ? "bg-gradient-to-br from-white/30 to-white/10 scale-110 shadow-2xl border-2 border-white/50"
                  : "bg-white/5 hover:bg-white/10 border border-white/20"
              }`}
            >
              {/* Glow Effect for Active */}
              {activeLevel === tier.id && (
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl animate-pulse" />
              )}
              
              <span className="text-3xl relative z-10 drop-shadow-lg transform hover:scale-110 transition-transform">
                {tier.badgeIcon}
              </span>
              <span className={`text-xs font-bold whitespace-nowrap relative z-10 ${
                activeLevel === tier.id ? "text-white drop-shadow-lg" : "text-white/70"
              }`}>
                {tier.nameAr}
              </span>
              
              {/* Active Indicator */}
              {activeLevel === tier.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-lg" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Badge Display */}
      <div className="relative z-10 flex justify-center py-12 mb-8">
        <div className="relative">
          {/* Multi-layer Glow Effect */}
          <div className="absolute inset-0 scale-150">
            <div className={`absolute inset-0 bg-gradient-to-br from-white via-white/50 to-transparent blur-3xl opacity-30 animate-pulse`} />
            <div className={`absolute inset-0 bg-gradient-to-tl from-white via-white/30 to-transparent blur-2xl opacity-40 animate-pulse`} style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* Outer Decorative Circles */}
          <div className="absolute inset-0 scale-125">
            <div className="absolute inset-0 border-2 border-white/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          </div>
          
          {/* Badge Container */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Multiple Rotating Rings */}
            <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-spin-slow shadow-2xl" />
            <div className="absolute inset-4 border-4 border-white/20 rounded-full animate-spin-reverse shadow-xl" />
            <div className="absolute inset-8 border-2 border-white/10 rounded-full animate-spin-slow" style={{ animationDuration: '12s' }} />
            
            {/* Inner Glow Circle */}
            <div className="absolute inset-16 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl" />
            
            {/* Main Badge Icon */}
            <div className="relative z-10 text-[120px] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-float">
              {currentTier.badgeIcon}
            </div>
            
            {/* Sparkle Effects */}
            <div className="absolute top-8 right-8 w-4 h-4 bg-white rounded-full animate-ping opacity-75" />
            <div className="absolute bottom-12 left-12 w-3 h-3 bg-white rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-16 left-8 w-2 h-2 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }} />
          </div>
          
          {/* Level Name Badge */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-white/20 via-white/30 to-white/20 backdrop-blur-xl px-8 py-3 rounded-full border-2 border-white/40 shadow-2xl">
            <p className="text-white text-xl font-bold tracking-wider drop-shadow-lg">{currentTier.nameAr}</p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 px-4 space-y-4">
        {/* Profile Card Section */}
        <div className="relative bg-gradient-to-br from-black/50 via-black/30 to-black/50 backdrop-blur-2xl rounded-3xl p-6 border-2 border-white/20 shadow-2xl overflow-hidden">
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-white/30 flex-1" />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-white/80" />
                <h3 className="text-white text-xl font-bold tracking-wide drop-shadow-lg">بطاقة التعريف</h3>
              </div>
              <div className="h-px bg-gradient-to-l from-transparent via-white/60 to-white/30 flex-1" />
            </div>

          <div className="grid grid-cols-3 gap-4">
            {currentTier.benefits.nameTag && (
              <div className="group relative bg-gradient-to-br from-black/50 via-black/30 to-black/50 rounded-2xl p-4 border-2 border-white/20 hover:border-purple-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 group-hover:rotate-3 transition-all">
                  <span className="text-white font-bold text-xs drop-shadow-lg">Lama Team</span>
                </div>
                <p className="relative text-white text-xs text-center font-semibold drop-shadow">امتياز اسم ملون</p>
              </div>
            )}

            {currentTier.benefits.entranceEffect && (
              <div className="group relative bg-gradient-to-br from-black/50 via-black/30 to-black/50 rounded-2xl p-4 border-2 border-white/20 hover:border-orange-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-500 via-orange-500 to-orange-600 rounded-xl overflow-hidden shadow-lg shadow-orange-500/50 group-hover:shadow-orange-500/70 group-hover:rotate-3 transition-all">
                  <div className="w-full h-1/2 bg-gradient-to-r from-yellow-300 to-orange-400" />
                  <div className="w-full h-1/2 bg-gradient-to-r from-orange-400 to-red-500" />
                </div>
                <p className="relative text-white text-xs text-center font-semibold drop-shadow">تأثير الدخول</p>
              </div>
            )}

            {currentTier.benefits.avatarFrame && (
              <div className="group relative bg-gradient-to-br from-black/50 via-black/30 to-black/50 rounded-2xl p-4 border-2 border-white/20 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <Crown className="w-full h-full text-yellow-400 drop-shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all" />
                </div>
                <p className="relative text-white text-xs text-center font-semibold drop-shadow">إطار الصورة الرمزية</p>
              </div>
            )}

            {currentTier.benefits.specialGift && (
              <div className="group relative bg-gradient-to-br from-black/50 via-black/30 to-black/50 rounded-2xl p-4 border-2 border-white/20 hover:border-orange-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50 group-hover:shadow-orange-500/70 group-hover:rotate-3 transition-all">
                  <Gift className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-xs text-center font-semibold drop-shadow">هدية خاصة</p>
              </div>
            )}

            {currentTier.benefits.exclusiveEntry && (
              <div className="group relative bg-gradient-to-br from-black/50 via-black/30 to-black/50 rounded-2xl p-4 border-2 border-white/20 hover:border-pink-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-red-500 via-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/50 group-hover:shadow-pink-500/70 group-hover:rotate-3 transition-all">
                  <Sparkles className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-xs text-center font-semibold drop-shadow">دخولية حصرية</p>
              </div>
            )}

            {currentTier.benefits.onlineCard && (
              <div className="group relative bg-gradient-to-br from-black/50 via-black/30 to-black/50 rounded-2xl p-4 border-2 border-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-gray-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 mx-auto mb-3 bg-white rounded-xl p-2 shadow-lg group-hover:shadow-white/50 group-hover:rotate-3 transition-all">
                  <div className="text-[8px] text-gray-800 font-bold">User Card</div>
                </div>
                <p className="relative text-white text-xs text-center font-semibold drop-shadow">بطاقة مستخدم عبر الإنترنت حصرية</p>
              </div>
            )}

            {currentTier.benefits.profileCard && (
              <div className="group relative bg-gradient-to-br from-black/50 via-black/30 to-black/50 rounded-2xl p-4 border-2 border-white/20 hover:border-blue-400/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 group-hover:rotate-3 transition-all">
                  <Award className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-xs text-center font-semibold drop-shadow">بطاقة الملف الشخصي للأرستقراطية</p>
              </div>
            )}
          </div>
        </div>

        </div>
        
        {/* Privileges Section */}
        <div className="relative bg-gradient-to-br from-black/50 via-black/30 to-black/50 backdrop-blur-2xl rounded-3xl p-6 border-2 border-white/20 shadow-2xl overflow-hidden">
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-white/30 flex-1" />
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-white/80" />
                <h3 className="text-white text-xl font-bold tracking-wide drop-shadow-lg">الامتيازات الخاصة</h3>
              </div>
              <div className="h-px bg-gradient-to-l from-transparent via-white/60 to-white/30 flex-1" />
            </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="group relative bg-gradient-to-br from-yellow-500/30 via-orange-500/20 to-orange-500/30 rounded-2xl p-5 border-2 border-yellow-400/50 hover:border-yellow-300/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/40">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/60 group-hover:shadow-yellow-400/80 group-hover:scale-110 transition-all">
                <Coins className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <p className="relative text-white text-sm text-center font-bold drop-shadow-lg">{currentTier.privileges.dailyCoins} عملات / يوم</p>
            </div>

            {currentTier.privileges.expBoost && (
              <div className="group relative bg-gradient-to-br from-orange-500/30 via-red-500/20 to-red-500/30 rounded-2xl p-5 border-2 border-orange-400/50 hover:border-orange-300/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/40">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/60 group-hover:shadow-orange-400/80 group-hover:scale-110 transition-all">
                  <TrendingUp className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-sm text-center font-bold drop-shadow">زيادة الخبرة</p>
              </div>
            )}

            {currentTier.privileges.freeRename && (
              <div className="group relative bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-pink-500/30 rounded-2xl p-5 border-2 border-purple-400/50 hover:border-purple-300/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/60 group-hover:shadow-purple-400/80 group-hover:scale-110 transition-all">
                  <Star className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-sm text-center font-bold drop-shadow">أشخاء علامة مجانا</p>
              </div>
            )}

            {currentTier.privileges.storeDiscount && (
              <div className="group relative bg-gradient-to-br from-green-500/30 via-teal-500/20 to-teal-500/30 rounded-2xl p-5 border-2 border-green-400/50 hover:border-green-300/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/40">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-teal-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-400 via-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/60 group-hover:shadow-green-400/80 group-hover:scale-110 transition-all">
                  <Percent className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-sm text-center font-bold drop-shadow">خصم {currentTier.privileges.storeDiscount} في المتجر</p>
              </div>
            )}

            {currentTier.privileges.topList && (
              <div className="group relative bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-cyan-500/30 rounded-2xl p-5 border-2 border-blue-400/50 hover:border-blue-300/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/60 group-hover:shadow-blue-400/80 group-hover:scale-110 transition-all">
                  <Award className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-sm text-center font-bold drop-shadow">قمة الموجودين</p>
              </div>
            )}

            {currentTier.privileges.fastUpgrade && (
              <div className="group relative bg-gradient-to-br from-pink-500/30 via-red-500/20 to-red-500/30 rounded-2xl p-5 border-2 border-pink-400/50 hover:border-pink-300/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/40">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-red-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-pink-400 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/60 group-hover:shadow-pink-400/80 group-hover:scale-110 transition-all">
                  <Zap className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-sm text-center font-bold drop-shadow">مستوى المستخدم *{currentTier.privileges.fastUpgrade} ترقية سريعة</p>
              </div>
            )}

            {currentTier.privileges.superMic && (
              <div className="group relative bg-gradient-to-br from-yellow-500/30 via-orange-500/20 to-orange-500/30 rounded-2xl p-5 border-2 border-yellow-400/50 hover:border-yellow-300/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/40">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/60 group-hover:shadow-yellow-400/80 group-hover:scale-110 transition-all">
                  <Mic className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-sm text-center font-bold drop-shadow">الميكروفون الفائق</p>
              </div>
            )}

            {currentTier.privileges.invisibility && (
              <div className="group relative bg-gradient-to-br from-gray-500/30 via-slate-500/20 to-slate-500/30 rounded-2xl p-5 border-2 border-gray-400/50 hover:border-gray-300/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/40">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-slate-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-gray-400 via-gray-500 to-slate-500 rounded-full flex items-center justify-center shadow-lg shadow-gray-500/60 group-hover:shadow-gray-400/80 group-hover:scale-110 transition-all">
                  <Eye className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-sm text-center font-bold drop-shadow">الاختفاء</p>
              </div>
            )}

            {currentTier.privileges.kickProtection && (
              <div className="group relative bg-gradient-to-br from-red-500/30 via-rose-500/20 to-rose-500/30 rounded-2xl p-5 border-2 border-red-400/50 hover:border-red-300/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40">
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-rose-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-red-400 via-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/60 group-hover:shadow-red-400/80 group-hover:scale-110 transition-all">
                  <Shield className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <p className="relative text-white text-sm text-center font-bold drop-shadow">مكافح الطرد</p>
              </div>
            )}
          </div>
        </div>

        {/* More Benefits */}
        <div className="text-center py-4">
          <p className="text-white/60 text-sm">المزيد من الامتيازات لفتحها ...</p>
        </div>

        {/* Pricing */}
        <div className="relative bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-2xl rounded-3xl p-8 border-2 border-white/30 shadow-2xl overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-orange-500/10" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              <p className="text-white text-2xl font-bold text-center drop-shadow-lg">
                {currentTier.price.includes('عملة') ? currentTier.price : `${currentTier.price} دولار أمريكي`}
              </p>
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-white/70 text-sm text-center mb-3">
              الصلاحية: {currentTier.duration} يوماً
            </p>
            {currentTier.price.includes('عملة') ? (
              <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 rounded-full px-6 py-2 border border-yellow-400/30">
                <Gift className="w-4 h-4 text-yellow-400" />
                <p className="text-yellow-300 text-sm font-semibold">
                  إهداء {(parseInt(currentTier.price) * 0.3).toFixed(0)} عملات ذهبية + خصم 15% للتجديد
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 rounded-full px-6 py-2 border border-yellow-400/30">
                <Gift className="w-4 h-4 text-yellow-400" />
                <p className="text-yellow-300 text-sm font-semibold">
                  إهداء {parseInt(currentTier.coins) * 3} عملات ذهبية + خصم 15% للتجديد
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pb-8">
          <Button className="group relative flex-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 hover:from-yellow-400 hover:via-orange-400 hover:to-yellow-400 text-white font-bold py-7 rounded-2xl shadow-2xl hover:shadow-yellow-500/60 transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-yellow-400/50">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="relative flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 drop-shadow-lg" />
              <span className="text-lg drop-shadow-lg">فتح الأرستقراطية</span>
            </div>
          </Button>
          <Button variant="outline" className="group relative flex-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 hover:from-purple-500/40 hover:via-pink-500/40 hover:to-purple-500/40 border-2 border-purple-400/50 hover:border-purple-300/70 text-white font-bold py-7 rounded-2xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 backdrop-blur-xl">
            <div className="relative flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 drop-shadow-lg" />
              <span className="text-lg drop-shadow-lg">إهداء للأصدقاء</span>
            </div>
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
