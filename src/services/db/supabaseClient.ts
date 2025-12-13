"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta as any).env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validate URL format before creating client
const isValidUrl = (urlString: string | undefined): boolean => {
  if (!urlString) return false;
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Only create client if BOTH url and key are valid
const hasValidCredentials = isValidUrl(url) && key && key.length > 20;

// Export a nullable client so callers can check readiness.
export const supabase: SupabaseClient | null = hasValidCredentials 
  ? createClient(url!, key!, {
      auth: {
        persistSession: true, // ✅ حفظ الجلسة في localStorage
        autoRefreshToken: true, // ✅ تجديد التوكن تلقائياً
        detectSessionInUrl: true, // ✅ كشف الجلسة من URL (مهم للـ OAuth)
        storage: window.localStorage, // ✅ استخدام localStorage للحفظ
        storageKey: 'supabase.auth.token', // مفتاح التخزين
      }
    })
  : null;

/**
 * Returns true if Supabase env vars are set and the client is available.
 */
export const isSupabaseReady = !!supabase;

// Log status for debugging
if (!isSupabaseReady) {
  console.warn(
    '⚠️ Supabase not configured - Running in Demo Mode\n' +
    'To enable backend features:\n' +
    '1. Create Supabase project at https://app.supabase.com\n' +
    '2. Update .env with your credentials\n' +
    '3. See SUPABASE_SETUP.md for details'
  );
} else {
  console.log('✅ Supabase connected successfully');
}

/**
 * Convenience: safe call wrapper to avoid exception propagation in fire-and-forget sync.
 */
export async function safe<T>(p: PromiseLike<T> | { then: (...args: any[]) => any } | T): Promise<T | null> {
  try {
    // Resolve both real Promises and Supabase Postgrest builders (thenables)
    return await Promise.resolve(p as any);
  } catch {
    return null;
  }
}