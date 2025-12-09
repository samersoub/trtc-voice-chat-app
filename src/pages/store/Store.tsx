import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  ShoppingBag, 
  Sparkles, 
  Crown, 
  Gift, 
  Zap,
  Frame,
  MessageCircle,
  Play
} from "lucide-react";
import { EconomyService } from "@/services/EconomyService";
import { GiftService } from "@/services/GiftService";
import GiftAnimation from "@/components/gifts/GiftAnimation";
import { showSuccess, showError } from "@/utils/toast";
import AvatarWithFrame from "@/components/profile/AvatarWithFrame";

const frames = [
  { id: "vip-gold", name: "إطار VIP ذهبي", nameEn: "VIP Gold Frame", price: 500, icon: "👑" },
  { id: "royal-purple", name: "إطار ملكي أرجواني", nameEn: "Royal Purple Frame", price: 400, icon: "💜" },
  { id: "diamond-elite", name: "إطار ألماس نخبة", nameEn: "Diamond Elite", price: 800, icon: "💎" },
  { id: "fire-border", name: "إطار ناري", nameEn: "Fire Border", price: 600, icon: "🔥" },
];

const bubbles = [
  { id: "bubble-neon", name: "فقاعة نيون", nameEn: "Neon Chat Bubble", price: 300, icon: "✨" },
  { id: "bubble-gold", name: "فقاعة ذهبية", nameEn: "Gold Chat Bubble", price: 350, icon: "🟡" },
  { id: "bubble-rainbow", name: "فقاعة قوس قزح", nameEn: "Rainbow Bubble", price: 450, icon: "🌈" },
  { id: "bubble-crystal", name: "فقاعة كريستال", nameEn: "Crystal Bubble", price: 500, icon: "💠" },
];

const entrances = [
  { id: "entrance-glow", name: "دخول متوهج", nameEn: "Glow Entrance", price: 600, icon: "⭐" },
  { id: "entrance-dragon", name: "دخول التنين", nameEn: "Dragon Entrance", price: 1200, icon: "🐉" },
  { id: "entrance-vip", name: "دخول VIP", nameEn: "VIP Entrance", price: 900, icon: "👑" },
  { id: "entrance-galaxy", name: "دخول المجرة", nameEn: "Galaxy Entrance", price: 1500, icon: "🌌" },
];

const Store: React.FC = () => {
  const nav = useNavigate();
  const [bal, setBal] = useState(EconomyService.getBalance());
  const inv = EconomyService.getInventory();
  const categories = GiftService.getCategories();
  const [activeTab, setActiveTab] = useState<"frames" | "bubbles" | "entrances" | "gifts">("frames");
  const [previewId, setPreviewId] = useState<"rose" | "car" | "dragon" | null>(null);

  const handlePurchase = (type: string, id: string, price: number, name: string) => {
    try {
      EconomyService.purchaseItem(type, id, price);
      setBal(EconomyService.getBalance());
      showSuccess(`تم شراء ${name}`);
    } catch (e: any) {
      showError(e.message || "فشلت عملية الشراء");
    }
  };

  const handleEquip = (id: string, name: string) => {
    if (!inv.frames.includes(id)) {
      showError("قم بشراء الإطار أولاً");
      return;
    }
    EconomyService.equipFrame(id);
    showSuccess(`تم تفعيل ${name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-indigo-600 to-purple-600 px-4 py-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => nav(-1)}
            className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10"
            aria-label="Back"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white" dir="rtl">المتجر</h1>
          </div>

          <div className="w-10"></div>
        </div>

        {/* Balance Card */}
        <div className="relative bg-gradient-to-br from-yellow-100 to-orange-200 rounded-3xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <Sparkles className="w-full h-full text-orange-500" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1" dir="rtl">رصيدك الحالي</p>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-gray-800">{bal.coins}</span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                  <span className="text-xl">🪙</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => nav("/recharge")}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              شحن +
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab("frames")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "frames"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Frame className="w-4 h-4" />
            <span dir="rtl">إطارات الصورة</span>
          </button>
          
          <button
            onClick={() => setActiveTab("bubbles")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "bubbles"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span dir="rtl">فقاعات الدردشة</span>
          </button>
          
          <button
            onClick={() => setActiveTab("entrances")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "entrances"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Play className="w-4 h-4" />
            <span dir="rtl">تأثيرات الدخول</span>
          </button>
          
          <button
            onClick={() => setActiveTab("gifts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "gifts"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span dir="rtl">الهدايا</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-6 space-y-4">
        {/* Avatar Frames */}
        {activeTab === "frames" && (
          <div className="grid grid-cols-2 gap-4">
            {frames.map((frame) => (
              <div
                key={frame.id}
                className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{frame.icon}</span>
                  {inv.frames.includes(frame.id) && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                      مملوك
                    </span>
                  )}
                </div>
                
                <h3 className="text-white font-semibold mb-1" dir="rtl">{frame.name}</h3>
                <p className="text-white/50 text-xs mb-3">{frame.nameEn}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 font-bold">{frame.price}</span>
                    <span className="text-xs">🪙</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!inv.frames.includes(frame.id) && (
                    <button
                      onClick={() => handlePurchase("frame", frame.id, frame.price, frame.name)}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                    >
                      شراء
                    </button>
                  )}
                  {inv.frames.includes(frame.id) && (
                    <button
                      onClick={() => handleEquip(frame.id, frame.name)}
                      className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                    >
                      تفعيل
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Bubbles */}
        {activeTab === "bubbles" && (
          <div className="grid grid-cols-2 gap-4">
            {bubbles.map((bubble) => (
              <div
                key={bubble.id}
                className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{bubble.icon}</span>
                  {inv.bubbles?.includes(bubble.id) && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                      مملوك
                    </span>
                  )}
                </div>
                
                <h3 className="text-white font-semibold mb-1" dir="rtl">{bubble.name}</h3>
                <p className="text-white/50 text-xs mb-3">{bubble.nameEn}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 font-bold">{bubble.price}</span>
                    <span className="text-xs">🪙</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase("bubble", bubble.id, bubble.price, bubble.name)}
                  className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  شراء
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Entrance Effects */}
        {activeTab === "entrances" && (
          <div className="grid grid-cols-2 gap-4">
            {entrances.map((entrance) => (
              <div
                key={entrance.id}
                className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{entrance.icon}</span>
                  {inv.entrances?.includes(entrance.id) && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                      مملوك
                    </span>
                  )}
                </div>
                
                <h3 className="text-white font-semibold mb-1" dir="rtl">{entrance.name}</h3>
                <p className="text-white/50 text-xs mb-3">{entrance.nameEn}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 font-bold">{entrance.price}</span>
                    <span className="text-xs">🪙</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase("entrance", entrance.id, entrance.price, entrance.name)}
                  className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  شراء
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Gifts */}
        {activeTab === "gifts" && (
          <div className="space-y-4">
            {previewId && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold" dir="rtl">معاينة الهدية</h3>
                  <button
                    onClick={() => setPreviewId(null)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm"
                  >
                    إغلاق
                  </button>
                </div>
                <div className="h-48 bg-black/20 rounded-xl flex items-center justify-center">
                  <GiftAnimation type={previewId} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {GiftService.getGiftsByCategory("popular").map((gift) => (
                <div
                  key={gift.id}
                  className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="text-center mb-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-2 border border-purple-500/30">
                      <span className="text-3xl">{gift.id === "rose" ? "🌹" : gift.id === "car" ? "🚗" : "🐉"}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-white font-semibold text-center mb-1" dir="rtl">{gift.name}</h3>
                  
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <span className="text-yellow-400 font-bold">{gift.price}</span>
                    <span className="text-xs">🪙</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewId(gift.id)}
                      className="flex-1 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-all border border-white/20"
                    >
                      معاينة
                    </button>
                    <button
                      onClick={() => showError("أرسل الهدايا من داخل الغرفة الصوتية")}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                    >
                      إرسال
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Store;