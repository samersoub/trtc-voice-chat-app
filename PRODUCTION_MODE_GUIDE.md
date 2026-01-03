# دليل التحويل من DEMO إلى PRODUCTION MODE
**Switching from Demo to Production Mode Guide**

## ✅ التغييرات المكتملة (Completed Changes)

### 1. إزالة البيانات التجريبية من الغرف الصوتية
**Voice Room Demo Data Removed**

- **الملف**: `src/components/voice/AuthenticLamaVoiceRoom.tsx`
- **التغيير**: 
  - إزالة 150 سطر من المستخدمين التجريبيين المثبتين
  - استبدال `initialSeats` بدالة `generateEmptySeats()`
  - المقاعد الآن تُحمل من Supabase عند فتح الغرفة
  - يتم تحديث المقاعد في الوقت الفعلي عبر Supabase Realtime

### 2. تعطيل البيانات التجريبية
**Demo Data Disabled**

- **الملف**: `src/config/advancedFeatures.ts`
- **التغيير**: `enableDemoData: false`
- **التأثير**: جميع الخدمات الآن تستخدم Supabase بدلاً من البيانات التجريبية

### 3. تحديث خدمة الغرف
**Room Service Updated**

- **الملف**: `src/services/roomService.ts`
- **التغيير**:
  - إزالة جميع الغرف التجريبية المثبتة
  - الآن يسحب الغرف من جدول `voice_rooms` في Supabase
  - يعرض عدد المستمعين الحقيقي من جدول `room_participants`
  - يعرض معلومات المضيف الحقيقية من جدول `users`

### 4. تحديث خدمة البحث
**Search Service Updated**

- **الملف**: `src/services/AdvancedSearchService.ts`
- **التغيير**:
  - `search()` الآن يبحث في جدول `users` في Supabase
  - `quickSearch()` يستخدم Supabase `ilike` للبحث السريع
  - Fallback للبيانات التجريبية فقط إذا لم يكن Supabase متاحاً

## 📋 خطوات الإعداد (Setup Steps)

### الخطوة 1: إنشاء غرف صوتية في قاعدة البيانات
**Create Voice Rooms in Database**

1. سجل دخولك إلى التطبيق وأنشئ حساب مستخدم
   ```
   http://localhost:8080/auth/register
   ```

2. احصل على User ID الخاص بك من Supabase:
   ```sql
   SELECT id, username, email FROM users;
   ```

3. افتح ملف `supabase/insert_test_rooms.sql`

4. استبدل `'YOUR_USER_ID_HERE'` بـ UUID المستخدم الخاص بك

5. نفذ السكريبت في Supabase SQL Editor

6. تحقق من إنشاء الغرف:
   ```sql
   SELECT id, name, owner_id, is_active FROM voice_rooms;
   ```

### الخطوة 2: تأكيد إعدادات Supabase
**Verify Supabase Configuration**

تأكد من وجود هذه المتغيرات في `.env`:

```env
VITE_SUPABASE_URL=https://vdpfjkmqggteaijvlule.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### الخطوة 3: تأكيد إعدادات TRTC
**Verify TRTC Configuration**

تأكد من وجود هذه المتغيرات في `.env`:

```env
VITE_TRTC_SDK_APP_ID=20029772
VITE_TRTC_SECRET_KEY=your-secret-key
```

## 🧪 اختبار التطبيق (Testing the App)

### اختبار مع صديق (Testing with a Friend)

1. **التسجيل (Registration)**
   - سجل حسابين مختلفين (أنت وصديقك)
   - تحقق من وجود الحسابات في جدول `users`

2. **إنشاء غرفة (Create Room)**
   - افتح التطبيق من حساب المستخدم الأول
   - انتقل إلى صفحة الغرف الصوتية
   - يجب أن ترى الغرف التي أنشأتها في قاعدة البيانات

3. **الانضمام للغرفة (Join Room)**
   - افتح الغرفة من الحساب الأول
   - اجلس على مقعد (اضغط على مقعد فارغ)
   - من حساب ثاني، انضم لنفس الغرفة
   - يجب أن يظهر المستخدم الأول في المقعد الذي جلس عليه

4. **اختبار الصوت (Test Voice Chat)**
   - اطلب إذن الميكروفون من المتصفح
   - فعّل الميكروفون من المقعد
   - تحدث واستمع للصديق

5. **اختبار الرسائل (Test Messages)**
   - أرسل رسالة في الغرفة
   - يجب أن تظهر فوراً للمستخدم الآخر
   - الرسائل تُحفظ في جدول `voice_room_messages`

## 🔍 التحقق من Real-time (Verify Real-time)

### فحص Supabase Realtime
افتح Developer Console في المتصفح وابحث عن هذه الرسائل:

```javascript
✅ Setting up Realtime subscriptions for room: room-1
Messages channel status: SUBSCRIBED
Seat change received: { eventType: 'INSERT', new: {...} }
New message received: { new: {...} }
```

### فحص TRTC
ابحث عن هذه الرسائل في Console:

```javascript
TRTC: Join flow start
TRTC: Joining room: room-1
TRTC: Join success
TRTC: Remote user joined: user-123
```

## 🐛 استكشاف الأخطاء (Troubleshooting)

### المشكلة: الغرف لا تظهر
**Problem: Rooms don't appear**

```javascript
// Check console for:
⚠️ Supabase not ready - cannot fetch rooms
📭 No active rooms found

// Solution:
// 1. Verify Supabase credentials in .env
// 2. Run insert_test_rooms.sql
// 3. Check that is_active = true in voice_rooms table
```

### المشكلة: المستخدمون لا يظهرون على المقاعد
**Problem: Users don't appear on seats**

```sql
-- Check voice_room_seats table
SELECT * FROM voice_room_seats WHERE room_id = 'room-1';

-- Clear ghost users
DELETE FROM voice_room_seats WHERE room_id = 'room-1';
```

### المشكلة: الصوت لا يعمل
**Problem: Voice not working**

1. تحقق من إذن الميكروفون في المتصفح
2. تحقق من TRTC credentials في `.env`
3. ابحث عن أخطاء في Console:
   ```
   TRTC: Join failed: Error message...
   ```

### المشكلة: الرسائل لا تظهر في الوقت الفعلي
**Problem: Messages don't appear in real-time**

1. تحقق من Realtime status في Console:
   ```javascript
   Messages channel status: SUBSCRIBED
   ```

2. تحقق من RLS policies في Supabase:
   ```sql
   -- Check if policies allow reading messages
   SELECT * FROM voice_room_messages WHERE room_id = 'room-1';
   ```

## 📊 جداول قاعدة البيانات المستخدمة (Database Tables)

### الجداول الرئيسية (Main Tables):

1. **users** - معلومات المستخدمين
2. **voice_rooms** - الغرف الصوتية
3. **voice_room_seats** - المقاعد في الغرف
4. **room_participants** - المشاركون في الغرف
5. **voice_room_messages** - رسائل الغرف

### البيانات المطلوبة (Required Data):

```sql
-- Check all required data exists:
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Rooms', COUNT(*) FROM voice_rooms WHERE is_active = true
UNION ALL
SELECT 'Participants', COUNT(*) FROM room_participants
UNION ALL
SELECT 'Seats', COUNT(*) FROM voice_room_seats
UNION ALL
SELECT 'Messages', COUNT(*) FROM voice_room_messages;
```

## ✨ الميزات النشطة (Active Features)

- ✅ الغرف الصوتية (Voice Rooms)
- ✅ TRTC Voice Chat
- ✅ Real-time Messaging
- ✅ Seat Management (20 seats per room)
- ✅ Online Count
- ✅ User Profiles
- ✅ Authentication
- ⏳ Gift System (needs testing)
- ⏳ Coin Economy (needs testing)

## 🚀 البدء السريع (Quick Start)

```bash
# 1. Start dev server
pnpm dev

# 2. Open in browser
# http://localhost:8080

# 3. Register two accounts

# 4. Create rooms using insert_test_rooms.sql

# 5. Join same room from both accounts

# 6. Test voice chat and messaging
```

## 📝 ملاحظات مهمة (Important Notes)

1. **Ghost User Bug**: تم إصلاح المشكلة التي تسبب ظهور المستخدم على أكثر من مقعد
2. **Demo Data**: جميع البيانات التجريبية المثبتة تم إزالتها
3. **Real-time**: يتم تحديث المقاعد والرسائل فوراً عبر Supabase Realtime
4. **TRTC**: يتطلب اتصال إنترنت ثابت للعمل بشكل صحيح
5. **Max Seats**: الحد الأقصى 20 مقعد لكل غرفة (8 مقاعد للمتحدثين)

## 🎯 الخطوات التالية (Next Steps)

1. اختبر التطبيق مع الأصدقاء
2. راقب الأخطاء في Console
3. تحقق من أداء Real-time
4. اختبر نظام الهدايا والعملات
5. حضّر التطبيق للتحويل إلى Android

---

**آخر تحديث**: 2025-12-08
**الإصدار**: 1.0.0 (Production Mode)
