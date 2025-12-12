import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, ChevronRight, Crown, Diamond, Lock, Smile, Palette, 
  Shield, Frame, Gift, Sparkles, FileText, Eye, Users,
  Image, UserCog, Settings, Zap, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocale } from "@/contexts";
import { AuthService } from "@/services/AuthService";
import { showSuccess } from "@/utils/toast";

type TabType = "program" | "personal";

interface SVIPBenefit {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
  reward?: string;
  image?: string;
}

interface Privilege {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
}

export default function SVIP() {
  const { dir } = useLocale();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const [activeTab, setActiveTab] = useState<TabType>("program");

  // Progress data
  const currentPoints = 685;
  const requiredPoints = 1000;
  const progress = (currentPoints / requiredPoints) * 100;
  const expiryDate = "2026.01.28";
  const svipLevel = 1;

  // SVIP Benefits (First section)
  const benefits: SVIPBenefit[] = [
    { id: "1", title: "قناعات الدردشة الحصرية", icon: Smile, unlocked: true, image: "Hello" },
    { id: "2", title: "قناعة دردشة الغرفة", icon: Palette, unlocked: true, image: "Ludo" },
    { id: "3", title: "علامة مستوى الثروة", icon: Shield, unlocked: true },
    { id: "4", title: "إطار الصورة الرمزية المخصصة", icon: Frame, unlocked: false },
    { id: "5", title: "شاشة الهدايا الفاخرة", icon: Gift, unlocked: false },
    { id: "6", title: "الرسمة المتحركة للطابك", icon: Sparkles, unlocked: false },
    { id: "7", title: "بطاقة الملف الشخصي", icon: FileText, unlocked: false },
    { id: "8", title: "موضوع صفحة الملف الشخصي", icon: Palette, unlocked: false },
    { id: "9", title: "إخبار الهايلايتا على مستوى البرنامج", icon: Zap, unlocked: false }
  ];

  // Exclusive Privileges (Second section)
  const privileges: Privilege[] = [
    { id: "1", title: "حزمة رموز تعبيرية حصرية", icon: Smile, unlocked: true },
    { id: "2", title: "عملات الحظ", icon: Star, unlocked: true },
    { id: "3", title: "مكافأة الماس", icon: Diamond, unlocked: true },
    { id: "4", title: "عرض سجل الزوار", icon: Eye, unlocked: true },
    { id: "5", title: "خلفية الدردشة الخاصة", icon: Palette, unlocked: true },
    { id: "6", title: "أعلى القائمة", icon: FileText, unlocked: true },
    { id: "7", title: "إشعار ترقية SVIP للخادم بالكامل", icon: Crown, unlocked: true },
    { id: "8", title: "صورة رمزية ديناميكية", icon: Shield, unlocked: true },
    { id: "9", title: "مسؤول الفرقة", icon: UserCog, unlocked: true },
    { id: "10", title: "صورة شخصية gif", icon: Image, unlocked: true },
    { id: "11", title: "وايل الفرقة", icon: Users, unlocked: true },
    { id: "12", title: "أسلوب الطابك الحصري", icon: Settings, unlocked: true },
    { id: "13", title: "شخص غامض", icon: Eye, unlocked: true },
    { id: "14", title: "لا يمكن تتبعه", icon: Shield, unlocked: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-cyan-500 to-blue-700 pb-24" dir={dir}>
      {/* Header */}
      <div className="relative p-4 flex items-center justify-between">
        <div className="w-10" />

        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-white hover:bg-white/10"
        >
          <ChevronRight className={`w-6 h-6 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white border-2 border-white/30"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* SVIP Title */}
      <div className="text-center mb-4">
        <h1 className="text-white text-3xl font-bold tracking-widest">SVIP</h1>
        <p className="text-white/80 text-sm mt-1">دائرة جديدة: {expiryDate}</p>
      </div>

      {/* SVIP Badge */}
      <div className="flex justify-center mb-6 relative">
        <div className="relative">
          {/* Crown */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
            <Crown className="w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
          </div>
          
          {/* Shield Badge */}
          <div className="relative w-48 h-52 flex items-center justify-center">
            {/* Wings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-32 bg-gradient-to-r from-yellow-400/20 via-white/40 to-yellow-400/20 blur-xl rounded-full" />
            </div>
            
            {/* Main Shield */}
            <div className="relative bg-gradient-to-br from-cyan-400 via-teal-300 to-cyan-500 w-40 h-40 rounded-3xl rotate-45 shadow-2xl border-4 border-white/50">
              <div className="absolute inset-2 bg-gradient-to-br from-cyan-300 to-teal-400 rounded-2xl flex items-center justify-center -rotate-45">
                <Diamond className="w-16 h-16 text-white fill-white drop-shadow-lg" />
              </div>
            </div>
            
            {/* Ribbon */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-t-full shadow-lg flex items-center justify-center">
              <span className="text-gray-600 font-bold text-lg">SVIP{svipLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Display */}
      <div className="mx-4 mb-6">
        <div className="bg-gradient-to-b from-cyan-300/30 to-blue-400/30 rounded-full h-3 backdrop-blur-sm border border-white/20">
          <div className="flex justify-around py-2">
            <div className="w-3 h-3 bg-white/80 rounded-full" />
            <div className="w-3 h-3 bg-white/80 rounded-full" />
            <div className="w-3 h-3 bg-white/80 rounded-full" />
            <div className="w-3 h-3 bg-white/80 rounded-full" />
          </div>
        </div>
      </div>

      {/* SVIP Level Text */}
      <div className="text-center mb-6">
        <h2 className="text-yellow-300 text-4xl font-bold drop-shadow-lg" style={{ fontFamily: 'serif' }}>
          SVIP{svipLevel}
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="mx-4 mb-8">
        <div className="bg-gradient-to-r from-blue-800/60 to-cyan-700/60 rounded-2xl p-4 backdrop-blur-sm border-4 border-yellow-400/50 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">$</span>
              </div>
              <div className="text-white text-sm">
                <p>تمت ترقية <span className="font-bold">{currentPoints}</span> من النقاط إلى <span className="font-bold text-yellow-300">SVIP{svipLevel}</span></p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs px-4 py-2 rounded-full hover:from-gray-600 hover:to-gray-700">
              غير منجز
            </Button>
          </div>
        </div>
      </div>

      {/* SVIP Level Benefits Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 px-6">
          <div className="h-px bg-gradient-to-r from-transparent to-white/50 flex-1 w-24" />
          <h3 className="text-white text-xl font-bold">مكافآت مستوى SVIP</h3>
          <div className="h-px bg-gradient-to-l from-transparent to-white/50 flex-1 w-24" />
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="px-4 mb-8">
        <div className="grid grid-cols-3 gap-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.id}
                className={`relative bg-gradient-to-br from-blue-500/40 to-cyan-500/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 ${
                  benefit.unlocked ? '' : 'opacity-60'
                }`}
              >
                {/* Lock Icon */}
                {!benefit.unlocked && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <Lock className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                {/* Icon/Image */}
                <div className="flex items-center justify-center mb-3 h-20">
                  {benefit.image ? (
                    <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-xl p-3 shadow-lg">
                      <span className="text-white font-bold text-sm">{benefit.image}</span>
                    </div>
                  ) : benefit.id === "3" ? (
                    <div className="relative">
                      <Shield className="w-16 h-16 text-cyan-300 fill-cyan-300/20" />
                      <Crown className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 text-yellow-400 fill-yellow-400" />
                    </div>
                  ) : (
                    <Icon className="w-14 h-14 text-white/80" />
                  )}
                </div>

                {/* Title */}
                <p className="text-white text-[10px] text-center leading-tight">
                  {benefit.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab("program")}
          className={`px-8 py-2 rounded-full transition-all ${
            activeTab === "program"
              ? "bg-white/30 text-white font-bold"
              : "bg-white/10 text-white/60"
          }`}
        >
          مستوى البرنامج
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-8 py-2 rounded-full transition-all ${
            activeTab === "personal"
              ? "bg-white/30 text-white font-bold"
              : "bg-white/10 text-white/60"
          }`}
        >
          الشخصي
        </button>
      </div>

      {/* Exclusive Privileges Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 px-6">
          <div className="h-px bg-gradient-to-r from-transparent to-white/50 flex-1 w-24" />
          <h3 className="text-white text-xl font-bold">امتيازات حصرية</h3>
          <div className="h-px bg-gradient-to-l from-transparent to-white/50 flex-1 w-24" />
        </div>
      </div>

      {/* Privileges Grid */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          {privileges.map((privilege, index) => {
            const Icon = privilege.icon;
            const rewards = ["", "1000K", "400K", "", "", "", "", "", "", "", "", "", "", ""];
            const reward = rewards[index];

            return (
              <div
                key={privilege.id}
                className="relative bg-gradient-to-br from-blue-400/30 to-blue-600/30 backdrop-blur-md rounded-2xl p-4 border border-white/10"
              >
                {/* Reward Badge */}
                {reward && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                    {reward}
                  </div>
                )}

                {/* Icon */}
                <div className="flex items-center justify-center mb-3 h-16">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    privilege.unlocked ? 'bg-blue-500/40' : 'bg-blue-700/40'
                  }`}>
                    <Icon className="w-7 h-7 text-white/80" />
                  </div>
                </div>

                {/* Title */}
                <p className="text-white text-[10px] text-center leading-tight">
                  {privilege.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
