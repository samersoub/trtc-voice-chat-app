# نظام تتبع المستخدمين وإخفاء الغرف الفارغة
**Room Participant Tracking & Auto-Hide Empty Rooms**

## ✨ الميزات الجديدة

### 1. تتبع المستخدمين في الغرف
✅ كل مستخدم يدخل الغرفة يُسجّل في جدول `room_participants`  
✅ تتبع حالة المستخدم: نشط (`is_online = TRUE`) أو غير نشط  
✅ تسجيل وقت الدخول والخروج  

### 2. إخفاء الغرف الفارغة تلقائياً
✅ الغرفة تختفي من القائمة عندما `current_participants = 0`  
✅ الغرفة تختفي عند خروج صاحبها  
✅ تحديث `is_active = FALSE` تلقائياً  

### 3. عرض عدد المستخدمين
✅ عدد المستخدمين الحاليين يظهر في قائمة الغرف  
✅ Real-time updates عند دخول/خروج المستخدمين  
✅ أيقونة ومعلومات واضحة بالعربية  

---

## 🚀 التطبيق

### الخطوة 1: تطبيق SQL في Supabase

افتح **Supabase SQL Editor** وطبّق:

#### [`room_participant_tracking.sql`](supabase/room_participant_tracking.sql) ⭐

هذا الملف يقوم بـ:
1. ✅ إنشاء/تحديث جدول `room_participants`
2. ✅ إضافة عمود `current_participants` لجدول `voice_rooms`
3. ✅ إنشاء Triggers لتحديث العدد تلقائياً
4. ✅ إنشاء Trigger لإخفاء الغرف الفارغة
5. ✅ تفعيل RLS Policies
6. ✅ تحديث البيانات الموجودة

**التطبيق:**
```
1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. انسخ محتوى room_participant_tracking.sql
4. الصق → Run
5. ✅ انتظر "Success"
```

---

## 📊 كيف يعمل النظام

### 1. عند دخول مستخدم للغرفة

```typescript
// في useTrtc hook - يتم تلقائياً
await RoomParticipantService.joinRoom(roomId, userId, 'listener');
```

**ما يحدث:**
1. يُضاف المستخدم في جدول `room_participants`
2. `is_online = TRUE`, `joined_at = NOW()`
3. **Trigger** يُحدّث `current_participants` تلقائياً
4. **Trigger** يُحدّث `is_active = TRUE`
5. الغرفة تظهر في القائمة

---

### 2. عند خروج مستخدم من الغرفة

```typescript
// في useTrtc hook - يتم تلقائياً
await RoomParticipantService.leaveRoom(roomId, userId);
```

**ما يحدث:**
1. يُحدّث السجل: `is_online = FALSE`, `left_at = NOW()`
2. **Trigger** يُحدّث `current_participants` (ينقص العدد)
3. **Trigger** يتحقق من العدد:
   - إذا `current_participants = 0` → `is_active = FALSE`
   - إذا خرج صاحب الغرفة → `is_active = FALSE`
4. الغرفة **تختفي** من القائمة تلقائياً!

---

### 3. في صفحة قائمة الغرف (RoomList)

```tsx
// Real-time updates
- تحميل الغرف كل 3 ثواني
- الاشتراك في Supabase Realtime
- عرض عدد المستخدمين من current_participants
- إخفاء الغرف التي is_active = false
```

**الواجهة:**
```
┌─────────────────────────────────────┐
│ 👥 3 مستخدمين                      │
│                                     │
│ غرفة الأصدقاء                       │
│ وصف الغرفة هنا...                  │
│                                     │
│ [التفاصيل]  [انضمام]              │
└─────────────────────────────────────┘
```

---

## 🎯 الملفات المُحدّثة

### 1. Backend (SQL)
✅ [`supabase/room_participant_tracking.sql`](supabase/room_participant_tracking.sql)
- إنشاء جدول `room_participants`
- Triggers للتحديث التلقائي
- RLS Policies

### 2. Service Layer
✅ [`src/services/RoomParticipantService.ts`](src/services/RoomParticipantService.ts) (جديد)
- `joinRoom()` - دخول الغرفة
- `leaveRoom()` - خروج من الغرفة
- `getRoomParticipants()` - الحصول على قائمة المستخدمين
- `getParticipantCount()` - الحصول على العدد
- `subscribeToRoomParticipants()` - Real-time updates

### 3. Hooks
✅ [`src/hooks/useTrtc.ts`](src/hooks/useTrtc.ts)
- Updated `join()` - يضيف المستخدم تلقائياً
- Updated `leave()` - يُزيل المستخدم تلقائياً

### 4. UI Components
✅ [`src/pages/voice-chat/RoomList.tsx`](src/pages/voice-chat/RoomList.tsx)
- عرض `current_participants` من قاعدة البيانات
- Real-time subscription لـ `voice_rooms` و `room_participants`
- UI محسّنة مع أيقونة 👥 وعدد المستخدمين بالعربية
- Badge "فارغة" للغرف بدون مستخدمين

---

## 🧪 الاختبار

### السيناريو 1: إنشاء غرفة ودخولها

1. اذهب إلى **Create Room**
2. أنشئ غرفة جديدة
3. ✅ يجب أن ترى `👥 1 مستخدم` (أنت)
4. في SQL Editor:
```sql
SELECT id, name, current_participants, is_active
FROM voice_rooms
WHERE is_active = true;
```

---

### السيناريو 2: دخول مستخدم آخر

1. افتح التطبيق في متصفح آخر (أو Incognito)
2. سجل دخول بحساب مختلف
3. ادخل نفس الغرفة
4. ✅ يجب أن يتحدث العدد إلى `👥 2 مستخدمين`
5. Real-time update تلقائياً!

---

### السيناريو 3: خروج صاحب الغرفة

1. صاحب الغرفة يخرج من الغرفة
2. ✅ الغرفة **تختفي** من القائمة فوراً
3. في SQL:
```sql
SELECT id, name, is_active, current_participants
FROM voice_rooms
WHERE owner_id = 'YOUR_USER_ID';
```
✅ `is_active = false`

---

### السيناريو 4: خروج جميع المستخدمين

1. جميع المستخدمين يخرجون من الغرفة
2. ✅ الغرفة تختفي من القائمة
3. ✅ `current_participants = 0`
4. ✅ `is_active = false`

---

## 🔧 استكشاف الأخطاء

### المشكلة: العدد لا يتحدث

**السبب:** Triggers غير نشطة

**الحل:**
```sql
-- تحقق من الـ Triggers
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'room_participants';
```

يجب أن ترى:
- `trigger_update_participant_count`
- `trigger_auto_hide_empty_rooms`

---

### المشكلة: الغرف لا تختفي

**السبب:** Function `auto_hide_empty_rooms()` غير نشطة

**الحل:**
```sql
-- أعد تطبيق الـ Function
-- انسخ STEP 5 من room_participant_tracking.sql وشغّله
```

---

### المشكلة: "permission denied for table room_participants"

**السبب:** RLS policies غير صحيحة

**الحل:**
```sql
-- تأكد من تطبيق STEP 7 من room_participant_tracking.sql
-- أو طبّق fix_rls_policies.sql
```

---

## 📊 Database Schema

### جدول `room_participants`

```sql
CREATE TABLE room_participants (
  id UUID PRIMARY KEY,
  room_id TEXT REFERENCES voice_rooms(id),
  user_id UUID REFERENCES users(id),
  role TEXT, -- 'owner', 'admin', 'speaker', 'listener'
  mic_seat INTEGER,
  is_muted BOOLEAN,
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  is_online BOOLEAN,  -- ⭐ مفتاح الميزة
  
  UNIQUE(room_id, user_id)
);
```

### عمود جديد في `voice_rooms`

```sql
ALTER TABLE voice_rooms
ADD COLUMN current_participants INTEGER DEFAULT 0;  -- ⭐ العدد الحالي
```

---

## 🎨 UI Components

### في RoomList.tsx

```tsx
<div className="flex items-center gap-2">
  <Users className="w-4 h-4 text-primary" />
  <span className="text-sm font-medium">
    {r.participantCount || 0}
  </span>
  <span className="text-xs text-muted-foreground">
    {r.participantCount === 1 ? 'مستخدم' : 'مستخدمين'}
  </span>
  {r.participantCount === 0 && (
    <Badge variant="outline" className="text-xs mr-2">فارغة</Badge>
  )}
</div>
```

---

## 💡 ملاحظات مهمة

### الأداء
✅ **Indexed**: `room_id`, `user_id`, `is_online`  
✅ **Triggers**: تعمل على مستوى قاعدة البيانات (سريعة جداً)  
✅ **Real-time**: Supabase Realtime للتحديثات الفورية  

### الأمان
✅ **RLS Policies**: المستخدم يُحدّث بياناته فقط  
✅ **Validation**: CHECK constraints على `role` و `mic_seat`  
✅ **CASCADE DELETE**: عند حذف غرفة، تُحذف البيانات المرتبطة  

### الـ Graceful Degradation
✅ إذا فشل Supabase → يستخدم localStorage فقط  
✅ لا أخطاء → يعمل في وضع offline  
✅ Console logs لمتابعة العمليات  

---

## 🚀 الخطوات التالية

### بعد التطبيق:

1. ✅ طبّق `room_participant_tracking.sql` في Supabase
2. ✅ Commit التغييرات إلى Git
3. ✅ Push إلى GitHub (Vercel يُنشر تلقائياً)
4. ✅ اختبر على Vercel deployment

### ميزات مستقبلية (اختيارية):

- 🔄 Presence indicators (نقطة خضراء للمستخدمين النشطين)
- 📊 Analytics: كم مستخدم زار الغرفة؟
- ⏰ Auto-cleanup للمستخدمين غير النشطين (بعد 30 دقيقة)
- 🔔 إشعارات عند دخول/خروج المستخدمين

---

## ✅ الخلاصة

### ما تم إنجازه:

1. ✅ نظام تتبع المستخدمين في الغرف (`room_participants`)
2. ✅ تحديث `current_participants` تلقائياً عبر Triggers
3. ✅ إخفاء الغرف الفارغة تلقائياً (`is_active = false`)
4. ✅ إخفاء الغرف عند خروج صاحبها
5. ✅ عرض عدد المستخدمين في الواجهة
6. ✅ Real-time updates عبر Supabase Realtime
7. ✅ RLS Policies للأمان
8. ✅ Graceful degradation

### النتيجة:

- 🎯 **الغرف الفارغة تختفي تلقائياً**
- 📊 **عدد المستخدمين يظهر ويتحدث في الوقت الفعلي**
- ⚡ **Real-time updates بدون تحديث الصفحة**
- 🔒 **آمن ومحمي بـ RLS**
- 🚀 **جاهز للإنتاج**

---

**🎉 الآن طبّق SQL واستمتع بميزات Real-time Presence!**

**⚠️ تذكّر:** طبّق `room_participant_tracking.sql` في Supabase أولاً، ثم commit وpush إلى GitHub.
