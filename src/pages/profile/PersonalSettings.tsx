import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight,
  User,
  MessageSquare,
  Gamepad2,
  Trash2,
  UserX,
  Database
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { useLocale } from "@/contexts";
import { AuthService } from "@/services/AuthService";

const PersonalSettings = () => {
  const nav = useNavigate();
  const { locale, dir } = useLocale();

  const handleClearCache = () => {
    try {
      // Clear localStorage except essential items
      const essentialKeys = ['auth:user', 'app:locale', 'trtcAnonId'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!essentialKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      showSuccess(locale === 'ar' ? 'تم مسح ذاكرة التخزين المؤقت بنجاح' : 'Cache cleared successfully');
    } catch (error) {
      showError(locale === 'ar' ? 'فشل مسح ذاكرة التخزين' : 'Failed to clear cache');
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      locale === 'ar' 
        ? 'هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه!' 
        : 'Are you sure you want to delete your account? This action cannot be undone!'
    );
    if (confirmed) {
      // Here you would call the actual delete account API
      showSuccess(locale === 'ar' ? 'تم إرسال طلب حذف الحساب' : 'Account deletion request sent');
      setTimeout(() => {
        AuthService.logout();
        nav("/auth/login");
      }, 2000);
    }
  };

  const personalSettings = [
    {
      id: 'account',
      title: locale === 'ar' ? "إعدادات الحساب" : "Account Settings",
      subtitle: locale === 'ar' ? "تعديل المعلومات الشخصية وكلمة المرور" : "Edit profile info and password",
      icon: <User className="w-6 h-6 text-blue-500" />,
      bgColor: "bg-blue-100",
      route: "/settings/account"
    },
    {
      id: 'messages',
      title: locale === 'ar' ? "إعدادات الرسائل" : "Message Settings",
      subtitle: locale === 'ar' ? "التحكم في إشعارات الرسائل والخصوصية" : "Control message notifications and privacy",
      icon: <MessageSquare className="w-6 h-6 text-green-500" />,
      bgColor: "bg-green-100",
      route: "/settings/messages"
    },
    {
      id: 'games',
      title: locale === 'ar' ? "إعدادات الألعاب" : "Game Settings",
      subtitle: locale === 'ar' ? "تفضيلات الألعاب والصوت" : "Game preferences and sound",
      icon: <Gamepad2 className="w-6 h-6 text-purple-500" />,
      bgColor: "bg-purple-100",
      route: "/settings/games"
    },
    {
      id: 'blocklist',
      title: locale === 'ar' ? "القائمة السوداء" : "Blocklist",
      subtitle: locale === 'ar' ? "إدارة المستخدمين المحظورين" : "Manage blocked users",
      icon: <UserX className="w-6 h-6 text-red-500" />,
      bgColor: "bg-red-100",
      badge: "0",
      badgeColor: "bg-red-500",
      route: "/settings/blocklist"
    },
    {
      id: 'cache',
      title: locale === 'ar' ? "مسح ذاكرة التخزين المؤقت" : "Clear Cache",
      subtitle: locale === 'ar' ? "حذف البيانات المخزنة محلياً" : "Delete locally stored data",
      icon: <Database className="w-6 h-6 text-cyan-500" />,
      bgColor: "bg-cyan-100",
      action: handleClearCache
    },
    {
      id: 'delete',
      title: locale === 'ar' ? "حذف الحساب" : "Delete Account",
      subtitle: locale === 'ar' ? "حذف الحساب نهائياً (لا يمكن التراجع)" : "Permanently delete account (irreversible)",
      icon: <Trash2 className="w-6 h-6 text-red-600" />,
      bgColor: "bg-red-100",
      badge: locale === 'ar' ? "خطر" : "Danger",
      badgeColor: "bg-red-600",
      action: handleDeleteAccount
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir={dir}>
      {/* Header */}
      <div className="bg-gradient-to-b from-indigo-600 to-purple-600 px-4 py-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => nav("/settings")}
            className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10"
          >
            {dir === 'rtl' ? <ChevronRight className="w-5 h-5 text-white" /> : <ChevronLeft className="w-5 h-5 text-white" />}
          </button>
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">
              {locale === 'ar' ? 'الإعدادات الشخصية' : 'Personal Settings'}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {locale === 'ar' ? 'إدارة حسابك وتفضيلاتك' : 'Manage your account and preferences'}
            </p>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="px-4 py-6 space-y-3 pb-24">
        {personalSettings.map((option) => (
          <div
            key={option.id}
            onClick={() => {
              if (option.action) {
                option.action();
              } else if (option.route) {
                nav(option.route);
              }
            }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`w-14 h-14 ${option.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {option.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-base" dir="rtl">
                    {option.title}
                  </h3>
                  {option.badge && (
                    <span className={`px-2 py-0.5 rounded-full ${option.badgeColor} text-white text-xs font-medium`}>
                      {option.badge}
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm" dir="rtl">
                  {option.subtitle}
                </p>
              </div>

              {/* Arrow */}
              <ChevronLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="fixed bottom-20 left-4 right-4 bg-blue-500/10 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30" dir={dir}>
        <p className="text-blue-200 text-sm text-center">
          {locale === 'ar' 
            ? '💡 نصيحة: احفظ بياناتك المهمة قبل حذف الحساب أو مسح التخزين' 
            : '💡 Tip: Save your important data before deleting account or clearing cache'}
        </p>
      </div>
    </div>
  );
};

export default PersonalSettings;
