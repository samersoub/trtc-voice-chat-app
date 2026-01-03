import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts";
import { showSuccess, showError } from "@/utils/toast";
import { AuthService } from "@/services/AuthService";

export default function AccountSettings() {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  
  const currentUser = AuthService.getCurrentUser();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || ""
  });
  
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const handleProfileUpdate = async () => {
    try {
      // TODO: Implement actual API call
      showSuccess(t("profile_updated"));
    } catch (error) {
      showError(t("update_failed"));
    }
  };
  
  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      showError("كلمات المرور غير متطابقة");
      return;
    }
    
    if (passwords.new.length < 6) {
      showError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    
    try {
      // TODO: Implement actual API call
      showSuccess("تم تغيير كلمة المرور بنجاح");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      showError("فشل تغيير كلمة المرور");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 pb-20" dir={dir}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-black/30 border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? '' : 'rotate-180'}`} />
          </Button>
          <h1 className="text-xl font-bold text-white">إعدادات الحساب</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Information Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">المعلومات الشخصية</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block flex items-center gap-2">
                <User className="w-4 h-4" />
                اسم المستخدم
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/20 text-white"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block flex items-center gap-2">
                <Mail className="w-4 h-4" />
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/20 text-white"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white/5 border-white/20 text-white"
                placeholder="+966 xxx xxx xxx"
              />
            </div>
          </div>

          <Button
            onClick={handleProfileUpdate}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            حفظ التغييرات
          </Button>
        </div>

        {/* Password Change Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">تغيير كلمة المرور</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">كلمة المرور الحالية</label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="bg-white/5 border-white/20 text-white pr-10"
                  placeholder="أدخل كلمة المرور الحالية"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">كلمة المرور الجديدة</label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="bg-white/5 border-white/20 text-white pr-10"
                  placeholder="أدخل كلمة المرور الجديدة"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">تأكيد كلمة المرور</label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="bg-white/5 border-white/20 text-white pr-10"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePasswordChange}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          >
            تغيير كلمة المرور
          </Button>
        </div>
      </div>
    </div>
  );
}
