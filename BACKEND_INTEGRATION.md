# Backend Integration Guide - دليل ربط Backend

## 📋 نظرة عامة

تم إنشاء بنية Backend كاملة باستخدام **Supabase** (PostgreSQL + Auth + Storage + Realtime). هذا الدليل يشرح:
1. ✅ ما تم إنجازه
2. 🔧 كيفية الإعداد
3. 📝 كيفية الاستخدام في الكود
4. ⚡ الميزات الجديدة

---

## ✅ ما تم إنجازه

### 1. قاعدة البيانات (Database Schema)
تم إنشاء 9 جداول رئيسية:

| الجدول | الوصف | الحقول الرئيسية |
|--------|--------|-----------------|
| `users` | بيانات المستخدمين | email, username, coins, diamonds, wealth_level |
| `gifts` | كتالوج الهدايا | name, price, reward_diamonds, categories |
| `gift_transactions` | سجل إرسال الهدايا | sender_id, receiver_id, gift_id, total_cost |
| `voice_rooms` | الغرف الصوتية | name, owner_id, room_type, current_participants |
| `room_participants` | المشاركون في الغرف | room_id, user_id, role, mic_seat |
| `coin_transactions` | معاملات العملات | user_id, transaction_type, amount, balance_after |
| `wealth_history` | تاريخ مستويات الثروة | user_id, old_level, new_level, total_wealth |
| `notifications` | الإشعارات | user_id, title, message, type, is_read |
| `activity_logs` | سجل الأنشطة | user_id, activity_type, metadata |

### 2. الملفات الجديدة

```
wandering-narwhal-twirl/
├── .env                              # متغيرات البيئة (Supabase credentials)
├── SUPABASE_SETUP.md                 # دليل إعداد Supabase خطوة بخطوة
├── BACKEND_INTEGRATION.md            # هذا الملف
├── supabase/
│   └── schema.sql                    # SQL Schema الكامل
├── src/
│   ├── types/
│   │   └── database.types.ts         # TypeScript types من DB
│   └── services/
│       └── AuthServiceV2.ts          # خدمة Authentication محدّثة
```

### 3. الميزات المضافة

#### Authentication:
- ✅ تسجيل بالـ Email + Password
- ✅ تسجيل دخول Email/Password
- ✅ تسجيل دخول بالهاتف + OTP
- ✅ إعادة تعيين كلمة المرور
- ✅ Session management
- ✅ Fallback إلى Demo mode (إذا Supabase غير متاح)

#### Database Features:
- ✅ Row Level Security (RLS) policies
- ✅ Auto-update timestamps
- ✅ Auto-calculate wealth levels (Trigger)
- ✅ Indexes للأداء
- ✅ Foreign key constraints
- ✅ Data validation

#### Realtime:
- ✅ Realtime subscriptions جاهزة لـ:
  - Voice rooms updates
  - Gift transactions
  - Notifications
  - Room participants

---

## 🔧 الإعداد - Setup

### الخطوة 1: إعداد Supabase

اتبع **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** خطوة بخطوة:
1. إنشاء مشروع في Supabase
2. تشغيل `schema.sql`
3. نسخ API credentials
4. تحديث `.env`

### الخطوة 2: تحديث ملف .env

```env
# Gemini AI (موجود مسبقاً)
VITE_GEMINI_API_KEY=AIzaSyDSMMNujc-Lh6bUrSWAZg0kqFvYXBB68Gc

# Supabase (جديد - استبدل بقيمك)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### الخطوة 3: إعادة تشغيل Dev Server

```bash
# أوقف السيرفر (Ctrl+C)
# ثم شغله من جديد
pnpm dev
```

---

## 📝 كيفية الاستخدام في الكود

### 1. Authentication

#### تسجيل مستخدم جديد:

```typescript
import { AuthService } from "@/services/AuthServiceV2";

async function handleRegister() {
  try {
    const user = await AuthService.register(
      "user@example.com",
      "SecurePassword123",
      "اسم المستخدم",
      "+966512345678" // اختياري
    );
    
    console.log("User registered:", user);
    // User object: { id, email, name, phone, createdAt }
  } catch (error) {
    console.error("Registration failed:", error.message);
  }
}
```

#### تسجيل الدخول:

```typescript
async function handleLogin() {
  try {
    const user = await AuthService.loginUnified(
      "user@example.com",
      "SecurePassword123"
    );
    
    console.log("Logged in:", user);
  } catch (error) {
    console.error("Login failed:", error.message);
  }
}
```

#### تسجيل دخول بالهاتف:

```typescript
// الخطوة 1: إرسال OTP
async function sendOTP() {
  const result = await AuthService.loginWithPhone("+966512345678");
  if (result.success) {
    console.log(result.message); // "OTP sent to your phone..."
  }
}

// الخطوة 2: التحقق من OTP
async function verifyOTP(otp: string) {
  try {
    const user = await AuthService.verifyPhoneOTP("+966512345678", otp);
    console.log("Logged in:", user);
  } catch (error) {
    console.error("OTP verification failed:", error);
  }
}
```

### 2. قراءة البيانات من Database

```typescript
import { supabase } from "@/services/db/supabaseClient";

// قراءة كل الهدايا
async function getAllGifts() {
  const { data, error } = await supabase
    .from("gifts")
    .select("*")
    .eq("is_active", true);
  
  if (error) {
    console.error("Error:", error);
    return [];
  }
  
  return data; // DbGift[]
}

// قراءة معلومات مستخدم
async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) {
    console.error("Error:", error);
    return null;
  }
  
  return data; // DbUser
}
```

### 3. كتابة البيانات (Insert/Update)

```typescript
// إضافة معاملة عملات
async function addCoinTransaction(userId: string, amount: number) {
  // 1. احصل على الرصيد الحالي
  const { data: user } = await supabase
    .from("users")
    .select("coins")
    .eq("id", userId)
    .single();
  
  const currentBalance = user?.coins || 0;
  const newBalance = currentBalance + amount;
  
  // 2. أضف المعاملة
  const { error: txError } = await supabase
    .from("coin_transactions")
    .insert({
      user_id: userId,
      transaction_type: "reward",
      amount: amount,
      balance_after: newBalance,
      description: "مكافأة يومية",
    });
  
  if (txError) {
    console.error("Transaction failed:", txError);
    return false;
  }
  
  // 3. حدّث رصيد المستخدم
  const { error: updateError } = await supabase
    .from("users")
    .update({ coins: newBalance })
    .eq("id", userId);
  
  if (updateError) {
    console.error("Update failed:", updateError);
    return false;
  }
  
  return true;
}
```

### 4. إرسال هدية (Gift Transaction)

```typescript
async function sendGift(
  senderId: string,
  receiverId: string,
  giftId: string,
  roomId?: string
) {
  // 1. احصل على معلومات الهدية
  const { data: gift } = await supabase
    .from("gifts")
    .select("*")
    .eq("id", giftId)
    .single();
  
  if (!gift) throw new Error("Gift not found");
  
  // 2. تحقق من رصيد المرسل
  const { data: sender } = await supabase
    .from("users")
    .select("coins")
    .eq("id", senderId)
    .single();
  
  if (!sender || sender.coins < gift.price) {
    throw new Error("Insufficient coins");
  }
  
  // 3. أنشئ معاملة الهدية
  const { error: giftError } = await supabase
    .from("gift_transactions")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      gift_id: giftId,
      quantity: 1,
      total_cost: gift.price,
      room_id: roomId || null,
    });
  
  if (giftError) throw giftError;
  
  // 4. اخصم من رصيد المرسل
  await supabase
    .from("users")
    .update({ 
      coins: sender.coins - gift.price,
      total_gifts_sent: sender.total_gifts_sent + gift.price 
    })
    .eq("id", senderId);
  
  // 5. أضف للمستقبل
  const { data: receiver } = await supabase
    .from("users")
    .select("diamonds")
    .eq("id", receiverId)
    .single();
  
  await supabase
    .from("users")
    .update({ 
      diamonds: (receiver?.diamonds || 0) + gift.reward_diamonds 
    })
    .eq("id", receiverId);
  
  return true;
}
```

### 5. Realtime Subscriptions

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/services/db/supabaseClient";
import type { DbNotification } from "@/types/database.types";

function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  
  useEffect(() => {
    if (!userId) return;
    
    // الاشتراك في الإشعارات الجديدة
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New notification:", payload.new);
          setNotifications((prev) => [payload.new as DbNotification, ...prev]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  return notifications;
}
```

---

## ⚡ الميزات الجديدة المُفعَّلة

### 1. نظام الثروة التلقائي
عندما يشحن المستخدم أو يرسل هدية، يتم:
- ✅ حساب إجمالي الثروة تلقائياً
- ✅ تحديث مستوى الثروة (1-10)
- ✅ حفظ السجل في `wealth_history`

```typescript
// مثال: شحن رصيد
async function rechargeCoins(userId: string, amount: number) {
  const { data: user } = await supabase
    .from("users")
    .select("total_recharge, coins")
    .eq("id", userId)
    .single();
  
  // التحديث - الـ Trigger سيحسب المستوى تلقائياً
  await supabase
    .from("users")
    .update({
      total_recharge: (user?.total_recharge || 0) + amount,
      coins: (user?.coins || 0) + amount,
    })
    .eq("id", userId);
  
  // لا حاجة لحساب المستوى يدوياً - يتم تلقائياً!
}
```

### 2. إشعارات فورية
استقبال إشعارات في الوقت الفعلي:

```typescript
// في أي Component
const notifications = useRealtimeNotifications(currentUser.id);

// عرض الإشعارات
{notifications.map((notif) => (
  <div key={notif.id}>
    {notif.icon} {notif.title}
    <p>{notif.message}</p>
  </div>
))}
```

### 3. سجل النشاط التلقائي
كل عملية يتم تسجيلها:

```typescript
async function logActivity(
  userId: string,
  activityType: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  await supabase.from("activity_logs").insert({
    user_id: userId,
    activity_type: activityType,
    description: description,
    metadata: metadata || {},
    ip_address: await getClientIP(), // اختياري
    user_agent: navigator.userAgent,
  });
}

// مثال استخدام
await logActivity(
  userId,
  "gift_sent",
  "أرسل هدية 🌹",
  { giftId: "rose", receiverId: "user123", cost: 10 }
);
```

---

## 🔄 التحويل من localStorage إلى Supabase

### قبل (Demo Mode):
```typescript
// AuthService.ts (القديم)
register(email: string, password: string) {
  const user = { id: crypto.randomUUID(), email };
  localStorage.setItem("auth:user", JSON.stringify(user));
  return user;
}
```

### بعد (Supabase):
```typescript
// AuthServiceV2.ts (الجديد)
async register(email: string, password: string) {
  // 1. Supabase Auth
  const { data } = await supabase.auth.signUp({ email, password });
  
  // 2. Database record
  await supabase.from("users").insert({ id: data.user.id, email });
  
  // 3. Local cache (optional)
  localStorage.setItem("auth:user", JSON.stringify(user));
  
  return user;
}
```

---

## 📊 قاعدة البيانات - ER Diagram

```
users (المستخدمون)
  ├── id (PK)
  ├── email, username, phone
  ├── coins, diamonds, wealth_level
  └── total_recharge, total_gifts_sent

gifts (الهدايا)
  ├── id (PK)
  ├── name, name_ar, price
  └── reward_diamonds, categories

gift_transactions (معاملات الهدايا)
  ├── id (PK)
  ├── sender_id (FK → users)
  ├── receiver_id (FK → users)
  ├── gift_id (FK → gifts)
  └── total_cost, room_id

voice_rooms (الغرف الصوتية)
  ├── id (PK)
  ├── owner_id (FK → users)
  ├── name, room_type, password
  └── current_participants, max_participants

room_participants (المشاركون)
  ├── id (PK)
  ├── room_id (FK → voice_rooms)
  ├── user_id (FK → users)
  └── role, mic_seat, joined_at

coin_transactions (معاملات العملات)
  ├── id (PK)
  ├── user_id (FK → users)
  ├── transaction_type, amount
  └── balance_after, description

wealth_history (تاريخ الثروة)
  ├── id (PK)
  ├── user_id (FK → users)
  └── old_level, new_level, total_wealth

notifications (الإشعارات)
  ├── id (PK)
  ├── user_id (FK → users)
  └── title, message, type, is_read
```

---

## 🎯 الخطوات التالية

### مرحلة 1: الإعداد (اليوم)
- [x] إنشاء Schema SQL
- [x] إنشاء Types
- [x] تحديث AuthService
- [ ] **تشغيل Schema في Supabase** ← أنت هنا
- [ ] اختبار تسجيل دخول/خروج

### مرحلة 2: تحديث Services (الأسبوع المقبل)
- [ ] GiftService → يقرأ من `gifts` table
- [ ] WealthLevelService → يقرأ/يكتب `users.wealth_level`
- [ ] EconomyService → `coin_transactions` table
- [ ] VoiceChatService → `voice_rooms` + `room_participants`

### مرحلة 3: Realtime (الأسبوع التالي)
- [ ] Realtime notifications
- [ ] Live room updates
- [ ] Gift animations في الوقت الفعلي

### مرحلة 4: Storage (لاحقاً)
- [ ] رفع الصور الشخصية
- [ ] رفع أغلفة الغرف
- [ ] CDN optimization

---

## 🆘 المساعدة

### Supabase Documentation:
- **Auth**: https://supabase.com/docs/guides/auth
- **Database**: https://supabase.com/docs/guides/database
- **Realtime**: https://supabase.com/docs/guides/realtime

### مشاكل شائعة:
1. **"Supabase not ready"**: تأكد من `.env` وإعادة تشغيل dev server
2. **"RLS policy violation"**: تحقق من Policies في SQL
3. **"Relation does not exist"**: شغّل `schema.sql` كاملاً

---

**الحالة**: ✅ Backend جاهز - يحتاج فقط **إعداد Supabase project**
