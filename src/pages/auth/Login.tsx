import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthService } from "@/services/AuthService";
import { showError, showSuccess } from "@/utils/toast";
import { useLocale } from "@/contexts";
import { Music2, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, KeyRound, Phone, Facebook } from "lucide-react";

const Login = () => {
  const nav = useNavigate();
  const { locale, dir } = useLocale();
  const [login, setLogin] = useState("");
  const [password, setPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!login || !password) {
      showError(locale === 'ar' ? "الرجاء إدخال البريد الإلكتروني وكلمة المرور" : "Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.loginUnified(login, password);
      showSuccess(locale === 'ar' ? "تم تسجيل الدخول بنجاح" : "Logged in successfully");
      nav("/");
    } catch (e: any) {
      showError(e.message || (locale === 'ar' ? "فشل تسجيل الدخول" : "Login failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await AuthService.signInWithGoogle();
      // Will redirect to Google OAuth, then back to /auth/callback
    } catch (error: any) {
      console.error('Google login error:', error);
      showError(error.message || (locale === 'ar' ? 'فشل تسجيل الدخول عبر Google' : 'Google login failed'));
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    showSuccess(locale === 'ar' ? "جاري تسجيل الدخول عبر Facebook..." : "Logging in with Facebook...");
    // TODO: Implement Facebook OAuth
  };

  const handlePhoneLogin = () => {
    nav("/auth/phone");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden" dir={dir}>
      {/* Animated Background Pattern with Logo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Multiple logo watermarks */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-[0.03] animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          >
            <Music2 
              className="text-white" 
              size={80 + Math.random() * 120}
              style={{ transform: `rotate(${Math.random() * 360}deg)` }}
            />
          </div>
        ))}
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* App Logo & Title */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-4 shadow-2xl shadow-purple-500/50 animate-pulse">
              <Music2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {locale === 'ar' ? 'دندنة' : 'Dandana'}
            </h1>
            <p className="text-gray-400">
              {locale === 'ar' ? 'مرحباً بك مرة أخرى' : 'Welcome Back'}
            </p>
          </div>

          {/* Login Card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 animate-slideUp">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </h2>

            {/* Email/Username Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {locale === 'ar' ? 'البريد الإلكتروني أو اسم المستخدم' : 'Email or Username'}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  className={`w-full ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {locale === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPwd(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder={locale === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                  className={`w-full ${dir === 'rtl' ? 'pr-10 pl-12' : 'pl-10 pr-12'} py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'left-3' : 'right-3'} text-gray-400 hover:text-white transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end mb-6">
              <Link
                to="/auth/forgot"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-4 h-4" />
                {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </Link>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-400">
                  {locale === 'ar' ? 'أو تسجيل الدخول عبر' : 'or continue with'}
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                className="py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                title={locale === 'ar' ? 'تسجيل الدخول عبر Google' : 'Login with Google'}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-white text-sm font-medium hidden sm:inline">Google</span>
              </button>

              {/* Facebook Login */}
              <button
                onClick={handleFacebookLogin}
                className="py-3 px-4 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                title={locale === 'ar' ? 'تسجيل الدخول عبر Facebook' : 'Login with Facebook'}
              >
                <Facebook className="w-5 h-5 text-[#1877F2] fill-[#1877F2]" />
                <span className="text-white text-sm font-medium hidden sm:inline">Facebook</span>
              </button>

              {/* Phone Login */}
              <button
                onClick={handlePhoneLogin}
                className="py-3 px-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                title={locale === 'ar' ? 'تسجيل الدخول برقم الهاتف' : 'Login with Phone'}
              >
                <Phone className="w-5 h-5 text-green-400" />
                <span className="text-white text-sm font-medium hidden sm:inline">{locale === 'ar' ? 'هاتف' : 'Phone'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-400">
                  {locale === 'ar' ? 'أو' : 'or'}
                </span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              to="/auth/register"
              className="w-full py-4 border-2 border-white/20 hover:border-purple-400 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <UserPlus className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
              {locale === 'ar' ? 'إنشاء حساب جديد' : 'Create new account'}
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-gray-400 text-sm">
            <p>
              {locale === 'ar' 
                ? 'بالمتابعة، أنت توافق على الشروط والأحكام' 
                : 'By continuing, you agree to our Terms & Conditions'}
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;