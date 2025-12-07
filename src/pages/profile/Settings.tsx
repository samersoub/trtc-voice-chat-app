import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight,
  Battery,
  Zap,
  Store,
  Crown,
  DollarSign,
  Shield,
  Home,
  Award,
  Globe
} from "lucide-react";
import { AuthService } from "@/services/AuthService";
import { showSuccess } from "@/utils/toast";
import { useLocale } from "@/contexts";

const Settings = () => {
  const nav = useNavigate();
  const { locale, setLocale, dir } = useLocale();
  const currentUser = AuthService.getCurrentUser();
  const userName = currentUser?.name || "أردني~يبحث عنك~!";
  const userId = "ID:101089646";
  const followers = 688;
  const following = 1200;

  const handleLanguageToggle = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    setLocale(newLocale);
    showSuccess(
      locale === 'ar' 
        ? 'Language changed to English' 
        : 'تم تغيير اللغة إلى العربية'
    );
  };

  const settingsOptions = [
    {
      id: 0,
      title: locale === 'ar' ? "اللغة" : "Language",
      icon: <Globe className="w-6 h-6 text-purple-500" />,
      bgColor: "bg-purple-100",
      badge: locale === 'ar' ? "العربية" : "English",
      badgeColor: "bg-gradient-to-r from-purple-500 to-indigo-600",
      action: handleLanguageToggle
    },
    {
      id: 1,
      title: "إعادة الشحن والدخل",
      icon: <Battery className="w-6 h-6 text-orange-500" />,
      bgColor: "bg-orange-100",
      route: "/recharge"
    },
    {
      id: 2,
      title: "دعم دندنة الخارق",
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      bgColor: "bg-yellow-100",
      badge: "ادعو أصدقاء",
      badgeColor: "bg-pink-500",
      route: "/support"
    },
    {
      id: 3,
      title: "المتجر",
      icon: <Store className="w-6 h-6 text-blue-500" />,
      bgColor: "bg-blue-100",
      route: "/store"
    },
    {
      id: 4,
      title: "حقيبة الظهر",
      icon: <Shield className="w-6 h-6 text-green-500" />,
      bgColor: "bg-green-100",
      route: "/backpack"
    },
    {
      id: 5,
      title: "الميداليات",
      icon: <Award className="w-6 h-6 text-yellow-600" />,
      bgColor: "bg-yellow-100",
      route: "/medals"
    },
    {
      id: 6,
      title: "مستوى",
      icon: <Crown className="w-6 h-6 text-pink-500" />,
      bgColor: "bg-pink-100",
      badge: "new",
      badgeColor: "bg-red-500",
      subBadge: "LV.28",
      route: "/level"
    },
    {
      id: 7,
      title: "SVIP",
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      bgColor: "bg-yellow-100",
      route: "/svip"
    },
    {
      id: 8,
      title: "مستوى الثروة",
      icon: <DollarSign className="w-6 h-6 text-yellow-600" />,
      bgColor: "bg-yellow-100",
      badge: "new",
      badgeColor: "bg-red-500",
      subBadge: "💰",
      route: "/wealth"
    },
    {
      id: 9,
      title: "الأرستقراطية",
      icon: <Crown className="w-6 h-6 text-orange-600" />,
      bgColor: "bg-orange-100",
      route: "/aristocracy"
    },
    {
      id: 10,
      title: "بيت الحب",
      icon: <Home className="w-6 h-6 text-purple-500" />,
      bgColor: "bg-purple-100",
      route: "/love-house"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir={dir}>
      {/* Header with Profile Info */}
      <div className="relative bg-gradient-to-b from-indigo-600 to-purple-600 px-4 py-6">
        {/* Back Button */}
        <button 
          onClick={() => nav("/profile")}
          className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} w-10 h-10 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10`}
        >
          {dir === 'rtl' ? <ChevronRight className="w-5 h-5 text-white" /> : <ChevronLeft className="w-5 h-5 text-white" />}
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-4 mt-12">
          <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden shadow-xl">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || 'user'}`}
              alt={userName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white font-bold text-lg" dir="rtl">🇯🇴{userName}</h2>
            </div>
            <p className="text-white/80 text-sm mb-2">{userId}</p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-white font-bold">{followers}</div>
                <div className="text-white/70 text-xs">{locale === 'ar' ? 'متابعة' : 'Following'}</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-white font-bold">{following}</div>
                <div className="text-white/70 text-xs">{locale === 'ar' ? 'المعجبون' : 'Followers'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Crown Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-white/30 shadow-lg">
            <Crown className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="px-4 py-6 space-y-3 pb-24">
        {settingsOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => {
              if (option.action) {
                option.action();
              } else if (option.route) {
                nav(option.route);
              }
            }}
            className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-12 h-12 ${option.bgColor} rounded-xl flex items-center justify-center`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium" dir="rtl">{option.title}</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {option.subBadge && (
                <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold">
                  {option.subBadge}
                </div>
              )}
              {option.badge && (
                <div className={`px-3 py-1 rounded-full ${option.badgeColor} text-white text-xs font-medium`}>
                  {option.badge}
                </div>
              )}
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={() => {
            AuthService.logout();
            showSuccess(locale === 'ar' ? "تم تسجيل الخروج بنجاح" : "Logged out successfully");
            nav("/auth/login");
          }}
          className="w-full mt-6 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold shadow-lg transition-all"
        >
          {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Settings;