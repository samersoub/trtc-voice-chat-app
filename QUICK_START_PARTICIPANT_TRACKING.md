# دليل سريع: تفعيل ميزة تتبع المستخدمين
**Quick Guide: Enable Participant Tracking**

## 🎯 الهدف

عند تطبيق هذه التحديثات:
- ✅ الغرف الفارغة تختفي تلقائياً من القائمة
- ✅ الغرف تختفي عند خروج صاحبها
- ✅ عدد المستخدمين يظهر ويتحدث في الوقت الفعلي
- ✅ تحديثات فورية بدون refresh

---

## ⚡ خطوات التطبيق السريعة

### 1️⃣ طبّق SQL في Supabase (5 دقائق)

```bash
# افتح Supabase Dashboard
https://vdpfjkmqggteaijvlule.supabase.co

# اذهب إلى SQL Editor
# انسخ والصق محتوى هذا الملف:
supabase/room_participant_tracking.sql

# اضغط Run ✅
```

---

### 2️⃣ Commit & Push (1 دقيقة)

```bash
git add .
git commit -m "Add room participant tracking & auto-hide empty rooms"
git push origin main
```

✅ Vercel سينشر التحديثات تلقائياً

---

### 3️⃣ اختبر على Vercel

```
1. افتح: https://trtc-voice-chat-app.vercel.app
2. أنشئ غرفة جديدة
3. ✅ يجب أن ترى: 👥 1 مستخدم
4. اخرج من الغرفة
5. ✅ يجب أن تختفي الغرفة من القائمة
```

---

## 📋 الملفات المُضافة/المُحدثة

### SQL Files:
- ✅ `supabase/room_participant_tracking.sql` (جديد)
- ✅ `supabase/fix_rls_policies.sql` (محدث)

### Services:
- ✅ `src/services/RoomParticipantService.ts` (جديد)

### Hooks:
- ✅ `src/hooks/useTrtc.ts` (محدث - يتتبع المستخدمين تلقائياً)

### Pages:
- ✅ `src/pages/voice-chat/RoomList.tsx` (محدث - يعرض العدد + real-time)

### Documentation:
- ✅ `ROOM_PARTICIPANT_TRACKING.md` (دليل شامل)
- ✅ `FIX_RLS_POLICIES.md` (إصلاح RLS)

---

## 🧪 نتائج الاختبار المتوقعة

### قبل التحديثات:
```
❌ الغرف الفارغة تبقى في القائمة
❌ عدد المستخدمين ثابت (من localStorage)
❌ لا real-time updates
```

### بعد التحديثات:
```
✅ الغرف الفارغة تختفي فوراً
✅ عدد المستخدمين يتحدث في الوقت الفعلي
✅ Real-time updates عبر Supabase
✅ إخفاء تلقائي عند خروج صاحب الغرفة
```

---

## 🔧 استكشاف الأخطاء السريع

### الخطأ: "permission denied for table room_participants"
```sql
-- الحل: طبّق fix_rls_policies.sql
-- أو أعد تطبيق STEP 7 من room_participant_tracking.sql
```

### الخطأ: العدد لا يتحدث
```sql
-- التحقق من الـ Triggers:
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'room_participants';
```

يجب أن ترى:
- `trigger_update_participant_count`
- `trigger_auto_hide_empty_rooms`

---

## 📚 الوثائق الكاملة

راجع [`ROOM_PARTICIPANT_TRACKING.md`](ROOM_PARTICIPANT_TRACKING.md) للحصول على:
- شرح مفصّل لكيفية عمل النظام
- أمثلة على الكود
- سيناريوهات الاختبار
- Database schema
- UI components

---

## ✅ Checklist

قبل التطبيق:
- [ ] قرأت [`ROOM_PARTICIPANT_TRACKING.md`](ROOM_PARTICIPANT_TRACKING.md)
- [ ] طبّقت `fix_rls_policies.sql` في Supabase (إذا لم تكن قد فعلت)
- [ ] Backup قاعدة البيانات (اختياري لكن موصى به)

بعد التطبيق:
- [ ] طبّقت `room_participant_tracking.sql` في Supabase SQL Editor
- [ ] رأيت "Success. No rows returned"
- [ ] تحققت من الـ Triggers في SQL
- [ ] Commit & Push إلى GitHub
- [ ] اختبرت على Vercel deployment
- [ ] الغرف الفارغة تختفي ✅
- [ ] عدد المستخدمين يظهر ويتحدث ✅

---

## 🎉 انتهى!

الآن لديك:
- 🎯 نظام تتبع مستخدمين كامل
- 📊 عرض عدد المستخدمين real-time
- 🚫 إخفاء تلقائي للغرف الفارغة
- ⚡ Real-time updates عبر Supabase
- 🔒 آمن ومحمي بـ RLS

---

**💡 نصيحة:** إذا واجهت أي مشكلة، راجع قسم "استكشاف الأخطاء" في [`ROOM_PARTICIPANT_TRACKING.md`](ROOM_PARTICIPANT_TRACKING.md)

**🚀 التالي:** يمكنك إضافة ميزات مثل:
- Presence indicators (نقطة خضراء للنشطين)
- إشعارات عند دخول/خروج المستخدمين
- Analytics للغرف الأكثر نشاطاً
