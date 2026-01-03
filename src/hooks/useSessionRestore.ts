import { useEffect, useState } from 'react';
import { supabase, isSupabaseReady } from '@/services/db/supabaseClient';
import { AuthService } from '@/services/AuthService';
import { ProfileService } from '@/services/ProfileService';
import { User } from '@/models/User';

/**
 * Hook للتحقق من الجلسة المحفوظة وتسجيل الدخول التلقائي
 * Auto-login from saved session
 */
export function useSessionRestore() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // 1. تحقق من localStorage أولاً (للوضع المحلي)
        const localUser = AuthService.getCurrentUser();
        if (localUser) {
          setUser(localUser);
          setIsLoading(false);
          return;
        }

        // 2. إذا كان Supabase متاح، تحقق من الجلسة المحفوظة
        if (isSupabaseReady && supabase) {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('Session restore error:', error.message);
            setIsLoading(false);
            return;
          }

          if (session?.user) {
            // الجلسة موجودة - استرجع بيانات المستخدم
            const u = session.user;
            const prof = await ProfileService.getByUserId(u.id);
            
            const restoredUser: User = {
              id: u.id,
              email: u.email || '',
              name: prof?.username || u.user_metadata?.username || u.email?.split('@')[0] || 'User',
              phone: prof?.phone || u.user_metadata?.phone || '',
              avatarUrl: prof?.profile_image || u.user_metadata?.avatar_url || undefined,
              createdAt: prof?.created_at || u.created_at,
            };

            // حفظ في localStorage
            localStorage.setItem('auth:user', JSON.stringify(restoredUser));
            
            // تحديث last_login
            if (prof) {
              await ProfileService.upsertProfile({
                ...prof,
                last_login: new Date().toISOString()
              });
            }

            setUser(restoredUser);
            console.log('✅ Session restored successfully');
          }
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  return { isLoading, user };
}
