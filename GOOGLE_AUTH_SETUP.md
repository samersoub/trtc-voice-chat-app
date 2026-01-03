# تفعيل تسجيل الدخول عبر Google
**Enable Google OAuth Sign-In**

## الخطوة 1: تفعيل Google Provider في Supabase

1. **افتح Supabase Dashboard**: https://vdpfjkmqggteaijvlule.supabase.co
2. اذهب إلى **Authentication** → **Providers**
3. ابحث عن **Google** وانقر عليه
4. فعّل **Enable Sign in with Google**

## الخطوة 2: إنشاء Google OAuth Client

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. اذهب إلى **APIs & Services** → **Credentials**
4. انقر **Create Credentials** → **OAuth client ID**
5. اختر **Application type**: **Web application**
6. أضف **Authorized redirect URIs**:
   ```
   https://vdpfjkmqggteaijvlule.supabase.co/auth/v1/callback
   ```
7. احفظ **Client ID** و **Client Secret**

## الخطوة 3: تكوين Supabase

1. ارجع إلى **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. الصق **Client ID** في الحقل المخصص
3. الصق **Client Secret** في الحقل المخصص
4. احفظ التغييرات

## الخطوة 4: تحديث التطبيق

أضف الكود التالي في `src/services/AuthService.ts`:

```typescript
/**
 * Sign in with Google OAuth
 */
async signInWithGoogle(): Promise<User> {
  if (!isSupabaseReady || !supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });

  if (error) throw error;
  
  // OAuth will redirect to callback URL
  // User will be available after redirect
  return data as unknown as User;
}
```

## الخطوة 5: إنشاء صفحة Callback

أنشئ ملف `src/pages/auth/GoogleCallback.tsx`:

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/db/supabaseClient';

export function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Google sign-in error:', error);
        navigate('/auth/login?error=google_signin_failed');
        return;
      }

      if (session?.user) {
        // User signed in successfully
        localStorage.setItem('auth:user', JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
          avatarUrl: session.user.user_metadata.avatar_url,
          createdAt: session.user.created_at
        }));
        
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}
```

## الخطوة 6: تحديث صفحة Login

أضف زر Google في `src/pages/auth/Login.tsx`:

```typescript
import { AuthService } from '@/services/AuthService';
import { Button } from '@/components/ui/button';

// في المكون:
const handleGoogleSignIn = async () => {
  try {
    await AuthService.signInWithGoogle();
  } catch (error) {
    console.error('Google sign-in error:', error);
    showError('فشل تسجيل الدخول عبر Google');
  }
};

// في JSX:
<div className="space-y-3">
  <Button
    type="button"
    variant="outline"
    className="w-full"
    onClick={handleGoogleSignIn}
  >
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    تسجيل الدخول عبر Google
  </Button>

  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-background px-2 text-muted-foreground">أو</span>
    </div>
  </div>
</div>
```

## الخطوة 7: إضافة Route للـ Callback

في `src/App.tsx`:

```typescript
import { GoogleCallback } from '@/pages/auth/GoogleCallback';

// في Routes:
<Route path="/auth/callback" element={<GoogleCallback />} />
```

## اختبار التكامل

1. افتح التطبيق: http://localhost:8080/auth/login
2. انقر على "تسجيل الدخول عبر Google"
3. اختر حساب Google
4. سيتم توجيهك للتطبيق مع تسجيل دخول تلقائي

## استكشاف الأخطاء

### المشكلة: "redirect_uri_mismatch"
**الحل**: تأكد من أن Authorized redirect URI في Google Console مطابق تماماً:
```
https://vdpfjkmqggteaijvlule.supabase.co/auth/v1/callback
```

### المشكلة: "OAuth client not found"
**الحل**: تأكد من نسخ Client ID و Client Secret بشكل صحيح

### المشكلة: المستخدم لم يُنشأ في جدول users
**الحل**: تأكد من تنفيذ `fix_authentication.sql` الذي يحتوي على `handle_new_user()` trigger

## ملاحظات مهمة

1. **Google OAuth يتطلب HTTPS في production**
2. **في localhost**، استخدم: `http://localhost:8080/auth/callback`
3. **الـ Trigger** `handle_new_user()` يُنشئ تلقائياً سجل في جدول `users` عند التسجيل
4. **avatar_url** من Google يُحفظ تلقائياً

---

**بعد تطبيق هذه الخطوات، ستتمكن من:**
- ✅ تسجيل حسابات جديدة بالإيميل
- ✅ تسجيل الدخول بالإيميل والباسورد
- ✅ تسجيل الدخول عبر Google
- ✅ صور البروفايل من Google تُحمّل تلقائياً
