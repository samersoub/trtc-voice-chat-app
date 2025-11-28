import { User } from "@/models/User";
import { supabase, isSupabaseReady, safe } from "@/services/db/supabaseClient";
import { ProfileService, type Profile } from "@/services/ProfileService";
import { NotificationHelper } from "@/utils/NotificationHelper";
import { hashSync, compareSync } from "bcryptjs";

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

  // Existing demo register (local only) remains for fallback
  register(email: string, password: string, name?: string): User {
    if (rate.isLimited(`register:${email}`)) {
      throw new Error("Too many attempts. Please wait and try again.");
    }
    const user: User = {
      id: crypto.randomUUID(),
      email,
      name,
      createdAt: new Date().toISOString(),
    };
    // Store hashed password in local demo
    const password_hash = hashSync(password, 10);
    localStorage.setItem(KEY, JSON.stringify({ ...user, password_hash }));
    const p: Profile = {
      id: user.id,
      username: (name || email.split("@")[0]).toLowerCase(),
      email,
      phone: "",
      profile_image: null,
      coins: 100,
      is_active: true,
      is_verified: false,
      role: "user",
      created_at: new Date().toISOString(),
      last_login: null,
    };
    void ProfileService.upsertProfile(p);
    void NotificationHelper.notify("Welcome", "Thanks for registering! You received 100 coins.", { meta: { kind: "welcome" } });
    rate.reset(`register:${email}`);
    return user;
  },

  async loginUnified(login: string, password: string): Promise<User> {
    if (rate.isLimited(`login:${login}`)) {
      throw new Error("Too many login attempts. Please wait and try again.");
    }

    // Demo admin shortcut: allow 'admin' / 'admin123' to login and gain admin access locally
    if (login.trim().toLowerCase() === "admin" && password === "admin123") {
      const user: User = {
        id: "admin-demo",
        email: "admin@demo.local",
        name: "admin",
        phone: "",
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(KEY, JSON.stringify(user));
      localStorage.setItem("admin:token", "demo-token");

      const profile: Profile = {
        id: user.id,
        username: "admin",
        email: user.email,
        phone: "",
        profile_image: null,
        coins: 9999,
        is_active: true,
        is_verified: true,
        role: "super_admin",
        created_at: user.createdAt,
        last_login: new Date().toISOString(),
      };
      await ProfileService.upsertProfile(profile);

      void NotificationHelper.notify("Login Successful", "Welcome, Admin!", { meta: { kind: "security" } });
      rate.reset(`login:${login}`);
      return user;
    }

    if (isSupabaseReady && supabase) {
      const email = login.includes("@")
        ? login
        : (await ProfileService.getByUsername(login))?.email || login;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) throw new Error(error?.message || "Invalid credentials");
      const u = data.user;
      const prof = (await ProfileService.getByUserId(u.id)) || {
        id: u.id,
        username: (u.user_metadata?.username as string) || email.split("@")[0],
        email,
        phone: (u.user_metadata?.phone as string) || "",
        profile_image: null,
        coins: 100,
        is_active: true,
        is_verified: !!u.email_confirmed_at,
        role: "user",
        created_at: new Date().toISOString(),
        last_login: null,
      };
      await ProfileService.upsertProfile({ ...prof, last_login: new Date().toISOString() });
      const user: User = {
        id: u.id,
        email,
        name: prof.username,
        phone: prof.phone,
        avatarUrl: prof.profile_image || undefined,
        createdAt: prof.created_at,
      };
      localStorage.setItem(KEY, JSON.stringify(user));
      void NotificationHelper.notify("Login Successful", `Welcome back, ${prof.username}!`, { meta: { kind: "security" } });
      rate.reset(`login:${login}`);
      return user;
    }
    // Local fallback
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("No account found. Please register first.");
    const stored = JSON.parse(raw) as User & { password_hash?: string; password?: string };
    const ok = stored.password_hash ? compareSync(password, stored.password_hash) : stored.password === password;
    if (!(stored.email === login || stored.name === login) || !ok) {
      throw new Error("Invalid credentials");
    }
    localStorage.setItem(KEY, JSON.stringify(stored));
    void NotificationHelper.notify("Login Successful", `Welcome back, ${stored.name || "user"}!`, { meta: { kind: "security" } });
    rate.reset(`login:${login}`);
    return stored as User;
  },

  async registerExtended(username: string, email: string, password: string, phone: string, imageFile?: File): Promise<User> {
    username = username.trim().toLowerCase();
    if (rate.isLimited(`register:${email}`) || rate.isLimited(`register:${username}`)) {
      throw new Error("Too many attempts. Please wait and try again.");
    }
    if (isSupabaseReady && supabase) {
      const existingUser = await ProfileService.getByUsername(username);
      if (existingUser) throw new Error("Username already exists");
      const { data: byEmail } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle?.() as any;
      if (byEmail) throw new Error("Email already exists");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, phone } },
      });
      if (error || !data.user) throw new Error(error?.message || "Failed to register");
      const u = data.user;
      const created: Profile = {
        id: u.id,
        username,
        email,
        phone,
        profile_image: null,
        coins: 100,
        is_active: true,
        is_verified: !!u.email_confirmed_at,
        role: "user",
        created_at: new Date().toISOString(),
        last_login: null,
      };
      await ProfileService.upsertProfile(created);
      if (imageFile) {
        await ProfileService.uploadProfileImage(u.id, imageFile);
      }
      const user: User = {
        id: u.id,
        email,
        name: username,
        phone,
        avatarUrl: undefined,
        createdAt: created.created_at,
      };
      localStorage.setItem(KEY, JSON.stringify(user));
      void NotificationHelper.notify("Welcome", "Registration successful! Please verify your email.", { meta: { kind: "welcome" } });
      rate.reset(`register:${email}`);
      rate.reset(`register:${username}`);
      return user;
    }
    // Local fallback
    const user: User = {
      id: crypto.randomUUID(),
      email,
      name: username,
      phone,
      createdAt: new Date().toISOString(),
    };
    const password_hash = hashSync(password, 10);
    localStorage.setItem(KEY, JSON.stringify({ ...user, password_hash }));
    const p: Profile = {
      id: user.id,
      username,
      email,
      phone,
      profile_image: null,
      coins: 100,
      is_active: true,
      is_verified: false,
      role: "user",
      created_at: user.createdAt,
      last_login: null,
    };
    await ProfileService.upsertProfile(p);
    void NotificationHelper.notify("Welcome", "Thanks for registering! You received 100 coins.", { meta: { kind: "welcome" } });
    rate.reset(`register:${email}`);
    rate.reset(`register:${username}`);
    return user;
  },

  login(email: string, password: string): User {
    if (rate.isLimited(`login:${email}`)) {
      throw new Error("Too many login attempts. Please wait and try again.");
    }
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("No account found. Please register first.");
    const stored = JSON.parse(raw) as User & { password_hash?: string; password?: string };
    const ok = stored.password_hash ? compareSync(password, stored.password_hash) : stored.password === password;
    if (stored.email !== email || !ok) {
      throw new Error("Invalid credentials");
    }
    localStorage.setItem(KEY, JSON.stringify(stored));
    void NotificationHelper.notify("Login Successful", `Welcome back, ${stored.name || "user"}!`, { meta: { kind: "security" } });
    rate.reset(`login:${email}`);
    return stored as User;
  },

  logout() {
    localStorage.removeItem(KEY);
    if (isSupabaseReady && supabase) {
      void safe(supabase.auth.signOut());
    }
    void NotificationHelper.notify("Logged Out", "You have been signed out.", { meta: { kind: "security" } });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!(isSupabaseReady && supabase)) {
      throw new Error("Password change requires server auth");
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) throw new Error(userErr?.message || "Not authenticated");
    const email = userData.user.email!;
    const reauth = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (reauth.error) throw new Error("Current password is incorrect");
    const upd = await supabase.auth.updateUser({ password: newPassword });
    if (upd.error) throw new Error(upd.error.message);
    void NotificationHelper.notify("Password Changed", "Your password has been updated.", { meta: { kind: "security" } });
  },

  verifyPhone(code: string): boolean {
    // demo code
    return code === "123456";
  },
};