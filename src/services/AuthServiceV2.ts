import { User } from "@/models/User";
import { supabase, isSupabaseReady } from "@/services/db/supabaseClient";
import { ProfileService, type Profile } from "@/services/ProfileService";
import { NotificationHelper } from "@/utils/NotificationHelper";
import { UserStatusService } from "./UserStatusService";

const KEY = "auth:user";

// Simple in-memory rate limiter
const rate = {
  attempts: new Map<string, { count: number; resetAt: number }>(),
  isLimited(key: string, limit = 5, windowMs = 30_000) {
    const now = Date.now();
    const entry = this.attempts.get(key);
    if (!entry || now > entry.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  },
  reset(key: string) {
    this.attempts.delete(key);
  },
};

export const AuthService = {
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  async getAccessToken(): Promise<string | null> {
    if (!(isSupabaseReady && supabase)) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  },

  async getTokenExpiry(): Promise<Date | null> {
    if (!(isSupabaseReady && supabase)) return null;
    const { data } = await supabase.auth.getSession();
    const exp = data.session?.expires_at;
    return exp ? new Date(exp * 1000) : null;
  },

  /**
   * Register with Supabase Auth + create user profile in DB
   */
  async register(email: string, password: string, name?: string, phone?: string): Promise<User> {
    if (rate.isLimited(`register:${email}`)) {
      throw new Error("Too many attempts. Please wait and try again.");
    }

    // If Supabase not ready, fallback to demo mode
    if (!isSupabaseReady || !supabase) {
      return this.registerDemo(email, password, name);
    }

    try {
      // 1. Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || email.split("@")[0],
            phone: phone || "",
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed - no user returned");

      // 2. Create user record in database
      const { error: dbError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email,
          username: (name || email.split("@")[0]).toLowerCase().replace(/\s/g, "_"),
          full_name: name || email.split("@")[0],
          phone: phone || null,
          coins: 1000, // Welcome bonus
          diamonds: 0,
          wealth_level: 1,
          is_online: true,
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error("Failed to create user profile:", dbError);
        // Don't fail registration if profile creation fails
      }

      // 3. Create User object for app
      const user: User = {
        id: authData.user.id,
        email: email,
        name: name || email.split("@")[0],
        phone: phone,
        createdAt: authData.user.created_at,
      };

      // 4. Store in localStorage for quick access
      localStorage.setItem(KEY, JSON.stringify(user));

      // 5. Send welcome notification
      await NotificationHelper.notify(
        "مرحباً بك! 🎉",
        "تم منحك 1000 عملة كهدية ترحيبية",
        { meta: { kind: "welcome" } }
      );

      rate.reset(`register:${email}`);
      UserStatusService.setOnline(user.id);

      return user;
    } catch (error) {
      rate.reset(`register:${email}`);
      throw error instanceof Error ? error : new Error("Registration failed");
    }
  },

  /**
   * Demo registration (fallback when Supabase not available)
   */
  registerDemo(email: string, password: string, name?: string): User {
    const user: User = {
      id: crypto.randomUUID(),
      email,
      name: name || email.split("@")[0],
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(KEY, JSON.stringify(user));
    localStorage.setItem(`demo:password:${email}`, password);

    const p: Profile = {
      id: user.id,
      username: (name || email.split("@")[0]).toLowerCase(),
      email,
      phone: "",
      profile_image: null,
      coins: 1000,
      is_active: true,
      is_verified: false,
      role: "user",
      created_at: new Date().toISOString(),
      last_login: null,
    };

    void ProfileService.upsertProfile(p);
    void NotificationHelper.notify("Welcome", "Thanks for registering! You received 1000 coins.", {
      meta: { kind: "welcome" },
    });

    return user;
  },

  /**
   * Login with Supabase Auth or fallback to demo
   */
  async loginUnified(login: string, password: string): Promise<User> {
    if (rate.isLimited(`login:${login}`)) {
      throw new Error("Too many login attempts. Please wait and try again.");
    }

    // Admin shortcut (demo mode)
    if (login.trim().toLowerCase() === "admin" && password === "admin123") {
      const user: User = {
        id: "admin-demo",
        email: "admin@demo.local",
        name: "Admin",
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(KEY, JSON.stringify(user));
      localStorage.setItem("admin:token", "demo-token");
      UserStatusService.setOnline(user.id);
      rate.reset(`login:${login}`);
      return user;
    }

    // If Supabase ready, use real auth
    if (isSupabaseReady && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: login,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error("Login failed - no user returned");

        // Fetch user data from DB
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (userError) {
          console.error("Failed to fetch user data:", userError);
        }

        // Update last_seen
        await supabase
          .from("users")
          .update({ is_online: true, last_seen: new Date().toISOString() })
          .eq("id", data.user.id);

        const user: User = {
          id: data.user.id,
          email: data.user.email || login,
          name: userData?.full_name || data.user.user_metadata?.full_name || login.split("@")[0],
          phone: userData?.phone || data.user.user_metadata?.phone,
          avatarUrl: userData?.avatar_url,
          createdAt: data.user.created_at,
        };

        localStorage.setItem(KEY, JSON.stringify(user));
        UserStatusService.setOnline(user.id);
        rate.reset(`login:${login}`);

        return user;
      } catch (error) {
        rate.reset(`login:${login}`);
        throw error instanceof Error ? error : new Error("Login failed");
      }
    }

    // Fallback to demo mode
    return this.loginDemo(login, password);
  },

  /**
   * Demo login (fallback)
   */
  loginDemo(login: string, password: string): User {
    const storedPassword = localStorage.getItem(`demo:password:${login}`);
    
    if (!storedPassword || storedPassword !== password) {
      throw new Error("Invalid credentials");
    }

    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("User not found");

    const user = JSON.parse(raw) as User;
    UserStatusService.setOnline(user.id);
    return user;
  },

  /**
   * Phone login with OTP (Supabase only)
   */
  async loginWithPhone(phone: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseReady || !supabase) {
      return { success: false, message: "Phone authentication requires Supabase setup" };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;

      return {
        success: true,
        message: "OTP sent to your phone. Please check your messages.",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send OTP",
      };
    }
  },

  /**
   * Verify phone OTP
   */
  async verifyPhoneOTP(phone: string, otp: string): Promise<User> {
    if (!isSupabaseReady || !supabase) {
      throw new Error("Phone authentication requires Supabase setup");
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error) throw error;
    if (!data.user) throw new Error("Verification failed");

    // Get or create user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

    let finalUserData = userData;

    // Create profile if doesn't exist
    if (userError && userError.code === "PGRST116") {
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        phone,
        username: `user_${phone.slice(-4)}`,
        coins: 1000,
        is_online: true,
      });

      if (!insertError) {
        const result = await supabase.from("users").select("*").eq("id", data.user.id).single();
        finalUserData = result.data;
      }
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email,
      phone: data.user.phone,
      name: finalUserData?.full_name || `User ${phone.slice(-4)}`,
      avatarUrl: finalUserData?.avatar_url,
      createdAt: data.user.created_at,
    };

    localStorage.setItem(KEY, JSON.stringify(user));
    UserStatusService.setOnline(user.id);

    return user;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    const currentUser = this.getCurrentUser();
    
    if (currentUser) {
      UserStatusService.setOffline(currentUser.id);
    }

    // Logout from Supabase if available
    if (isSupabaseReady && supabase) {
      await supabase.auth.signOut();
    }

    // Clear local storage
    localStorage.removeItem(KEY);
    localStorage.removeItem("admin:token");
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const localUser = this.getCurrentUser();
    
    // Check Supabase session if available
    if (isSupabaseReady && supabase) {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    }

    // Fallback to localStorage
    return !!localUser;
  },

  /**
   * Get current session
   */
  async getSession() {
    if (!isSupabaseReady || !supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Password reset
   */
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseReady || !supabase) {
      return { success: false, message: "Password reset requires Supabase setup" };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return {
        success: true,
        message: "Password reset email sent. Please check your inbox.",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send reset email",
      };
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseReady || !supabase) {
      return { success: false, message: "Password update requires Supabase setup" };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update password",
      };
    }
  },
};
