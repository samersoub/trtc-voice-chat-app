import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/db/supabaseClient';
import { showSuccess, showError } from '@/utils/toast';

export function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase!.auth.getSession();
        
        if (error) {
          console.error('Google sign-in error:', error);
          showError('فشل تسجيل الدخول عبر Google');
          navigate('/auth/login?error=google_signin_failed');
          return;
        }

        if (session?.user) {
          // User signed in successfully
          const user = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
            avatarUrl: session.user.user_metadata.avatar_url,
            createdAt: session.user.created_at
          };
          
          localStorage.setItem('auth:user', JSON.stringify(user));
          
          showSuccess(`مرحباً ${user.name}!`);
          navigate('/');
        } else {
          console.warn('No session found after Google OAuth');
          navigate('/auth/login');
        }
      } catch (err) {
        console.error('Error handling Google callback:', err);
        showError('حدث خطأ أثناء تسجيل الدخول');
        navigate('/auth/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg text-foreground">جاري تسجيل الدخول...</p>
        <p className="mt-2 text-sm text-muted-foreground">يرجى الانتظار قليلاً</p>
      </div>
    </div>
  );
}
