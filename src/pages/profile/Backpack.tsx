import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Frame, Sparkles, ImageIcon, Check, Star, Backpack as BackpackIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts";
import { showSuccess } from "@/utils/toast";

type ItemType = "frames" | "entrances" | "backgrounds";

interface BackpackItem {
  id: string;
  name: string;
  image: string;
  type: ItemType;
  rarity: "common" | "rare" | "epic" | "legendary";
  isActive?: boolean;
  duration?: string;
}

export default function Backpack() {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ItemType>("frames");
  
  // Demo data - replace with actual API call
  const [items, setItems] = useState<BackpackItem[]>([
    // Frames
    {
      id: "f1",
      name: "إطار ذهبي",
      image: "/images/frames/gold-frame.png",
      type: "frames",
      rarity: "legendary",
      isActive: true
    },
    {
      id: "f2",
      name: "إطار الماس",
      image: "/images/frames/diamond-frame.png",
      type: "frames",
      rarity: "epic"
    },
    {
      id: "f3",
      name: "إطار فضي",
      image: "/images/frames/silver-frame.png",
      type: "frames",
      rarity: "rare"
    },
    {
      id: "f4",
      name: "إطار برونزي",
      image: "/images/frames/bronze-frame.png",
      type: "frames",
      rarity: "common"
    },
    // Entrances
    {
      id: "e1",
      name: "دخولية VIP",
      image: "/images/entrances/vip-entrance.gif",
      type: "entrances",
      rarity: "legendary",
      duration: "30 يوم",
      isActive: true
    },
    {
      id: "e2",
      name: "دخولية ملكية",
      image: "/images/entrances/royal-entrance.gif",
      type: "entrances",
      rarity: "epic",
      duration: "15 يوم"
    },
    {
      id: "e3",
      name: "دخولية الشعلة",
      image: "/images/entrances/fire-entrance.gif",
      type: "entrances",
      rarity: "rare",
      duration: "7 أيام"
    },
    // Backgrounds
    {
      id: "b1",
      name: "خلفية المجرة",
      image: "/wallpapers/1.jpg",
      type: "backgrounds",
      rarity: "legendary"
    },
    {
      id: "b2",
      name: "خلفية الوردة",
      image: "/wallpapers/2.jpg",
      type: "backgrounds",
      rarity: "epic"
    },
    {
      id: "b3",
      name: "خلفية البحر",
      image: "/wallpapers/3.jpg",
      type: "backgrounds",
      rarity: "rare"
    },
    {
      id: "b4",
      name: "خلفية الغابة",
      image: "/wallpapers/4.jpg",
      type: "backgrounds",
      rarity: "common"
    }
  ]);

  const tabs = [
    { id: "frames" as ItemType, label: "إطارات الصورة", icon: Frame, count: items.filter(i => i.type === "frames").length },
    { id: "entrances" as ItemType, label: "الدخوليات", icon: Sparkles, count: items.filter(i => i.type === "entrances").length },
    { id: "backgrounds" as ItemType, label: "خلفيات الغرف", icon: ImageIcon, count: items.filter(i => i.type === "backgrounds").length }
  ];

  const rarityColors = {
    common: "from-gray-500 to-gray-600",
    rare: "from-blue-500 to-blue-600",
    epic: "from-purple-500 to-purple-600",
    legendary: "from-yellow-500 to-orange-600"
  };

  const rarityLabels = {
    common: "عادي",
    rare: "نادر",
    epic: "أسطوري",
    legendary: "خرافي"
  };

  const filteredItems = items.filter(item => item.type === activeTab);

  const handleActivateItem = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item => ({
        ...item,
        isActive: item.type === activeTab && item.id === itemId ? true : (item.type === activeTab ? false : item.isActive)
      }))
    );
    
    const item = items.find(i => i.id === itemId);
    showSuccess(`تم تفعيل ${item?.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 pb-24" dir={dir}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-rose-900/80 border-b border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10 hover:scale-110 transition-all"
          >
            <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? '' : 'rotate-180'}`} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <BackpackIcon className="w-7 h-7 text-white drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white">حقيبة الظهر</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Tabs */}
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/50 scale-105"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:scale-105"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce' : ''}`} />
                <span className="text-sm font-bold relative z-10">{tab.label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold relative z-10 ${
                  isActive ? 'bg-white/30' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 relative z-10">
        {filteredItems.length === 0 ? (
          <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 text-center mt-6 border border-white/10 shadow-2xl">
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-ping" />
              {activeTab === "frames" && <Frame className="w-14 h-14 text-white/60 relative z-10" />}
              {activeTab === "entrances" && <Sparkles className="w-14 h-14 text-white/60 relative z-10" />}
              {activeTab === "backgrounds" && <ImageIcon className="w-14 h-14 text-white/60 relative z-10" />}
            </div>
            <p className="text-white text-xl font-bold mb-3">لا توجد عناصر</p>
            <p className="text-white/50 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              يمكنك الحصول على المزيد من المتجر واستمتع بمظهر مميز
            </p>
            <Button
              onClick={() => navigate("/store")}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold px-8 py-6 rounded-2xl shadow-xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                🛒 زيارة المتجر
              </span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-9 gap-1.5">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="group bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-lg rounded-lg overflow-hidden relative border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                }}
                onClick={() => handleActivateItem(item.id)}
              >
                {/* Active Badge */}
                {item.isActive && (
                  <div className="absolute -top-1 -right-1 z-10 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}

                {/* Rarity Corner */}
                <div className={`absolute top-0 left-0 w-6 h-6 bg-gradient-to-br ${rarityColors[item.rarity]} opacity-60 rounded-br-lg`} />

                {/* Item Image */}
                <div className="relative aspect-square bg-gradient-to-br from-black/20 via-transparent to-black/20 p-1.5 flex items-center justify-center overflow-hidden">
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[item.rarity]} opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300`} />
                  
                  {activeTab === "frames" ? (
                    <div className="relative w-full h-full">
                      <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[item.rarity]} opacity-20 rounded`} />
                      <Frame className="w-full h-full text-white/60 relative z-10" />
                    </div>
                  ) : activeTab === "entrances" ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-yellow-300 animate-spin-slow relative z-10" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full rounded overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/wallpapers/1.jpg";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
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
