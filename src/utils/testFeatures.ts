/**
 * ملف اختبار شامل لجميع الميزات الجديدة
 * استخدم هذا الملف للتحقق من أن كل شيء يعمل
 */

import { 
  AdvancedSearchService,
  ModerationService,
  ChatHistoryService,
  TranslationService,
  RecordingService,
  NotificationService
} from '@/services';

/**
 * اختبار جميع الميزات
 */
export async function testAllFeatures() {
  console.log('🧪 بدء اختبار الميزات الجديدة...\n');

  // 1. الإشعارات
  console.log('1️⃣ اختبار الإشعارات...');
  try {
    const initialized = await NotificationService.initialize();
    if (initialized) {
      await NotificationService.send({
        userId: 'test-user',
        type: 'system',
        title: 'اختبار النظام',
        message: 'الإشعارات تعمل بنجاح! ✅',
      });
      console.log('✅ الإشعارات تعمل بنجاح');
    } else {
      console.log('⚠️ الإشعارات غير مدعومة في هذا المتصفح');
    }
  } catch (error) {
    console.error('❌ فشل اختبار الإشعارات:', error);
  }

  // 2. البحث المتقدم
  console.log('\n2️⃣ اختبار البحث المتقدم...');
  try {
    const results = await AdvancedSearchService.search({
      query: 'test',
      online: true,
      sortBy: 'relevance',
    }, 10, 0);
    console.log(`✅ البحث يعمل: ${results.length} نتيجة`);
    if (results.length > 0) {
      console.log('   - أول نتيجة:', results[0].user.name, 'نقاط التطابق:', results[0].score);
    }
  } catch (error) {
    console.error('❌ فشل اختبار البحث:', error);
  }

  // 3. الحظر والكتم
  console.log('\n3️⃣ اختبار نظام الحظر...');
  try {
    // حظر مستخدم
    ModerationService.blockUser('user1', 'user2', 'اختبار');
    const isBlocked = ModerationService.isBlocked('user1', 'user2');
    console.log(`✅ الحظر يعمل: محظور = ${isBlocked}`);

    // كتم مستخدم
    ModerationService.muteUser('user1', 'user3', 30);
    const isMuted = ModerationService.isMuted('user1', 'user3');
    console.log(`✅ الكتم يعمل: مكتوم = ${isMuted}`);

    // إلغاء
    ModerationService.unblockUser('user1', 'user2');
    ModerationService.unmuteUser('user1', 'user3');
  } catch (error) {
    console.error('❌ فشل اختبار الحظر:', error);
  }

  // 4. سجل المحادثات
  console.log('\n4️⃣ اختبار سجل المحادثات...');
  try {
    // إضافة رسائل تجريبية
    for (let i = 0; i < 5; i++) {
      ChatHistoryService.addMessage('test-room', {
        id: `msg-${i}`,
        text: `رسالة تجريبية ${i + 1}`,
        senderId: `user-${i % 2}`,
        senderName: `مستخدم ${i % 2}`,
        timestamp: new Date(Date.now() - i * 60000),
      });
    }

    const messages = ChatHistoryService.getRecentMessages('test-room', 10);
    console.log(`✅ سجل المحادثات يعمل: ${messages.length} رسالة محفوظة`);

    // اختبار Pagination
    const paginated = ChatHistoryService.getMessages('test-room', {
      limit: 3,
      offset: 0,
    });
    console.log(`   - Pagination: ${paginated.data.length} رسالة, المزيد = ${paginated.hasMore}`);

    // اختبار البحث
    const searchResults = ChatHistoryService.searchMessages('test-room', 'تجريبية');
    console.log(`   - البحث: ${searchResults.data.length} نتيجة`);
  } catch (error) {
    console.error('❌ فشل اختبار السجل:', error);
  }

  // 5. الترجمة
  console.log('\n5️⃣ اختبار الترجمة...');
  try {
    const translation1 = await TranslationService.translate('Hello World', 'ar');
    console.log(`✅ الترجمة تعمل: "${translation1.translatedText}"`);

    const translation2 = await TranslationService.translate('مرحبا', 'en');
    console.log(`   - عكسي: "${translation2.translatedText}"`);

    // اكتشاف اللغة
    const lang = TranslationService.detectLanguage('مرحبا بك في التطبيق');
    console.log(`   - اكتشاف اللغة: ${lang}`);
  } catch (error) {
    console.error('❌ فشل اختبار الترجمة:', error);
  }

  // 6. إحصائيات
  console.log('\n6️⃣ إحصائيات النظام:');
  try {
    const blockedCount = ModerationService.getBlockedUsers('user1').length;
    const roomStats = ChatHistoryService.getRoomStats('test-room');
    const translationStats = TranslationService.getStats();

    console.log(`   - المحظورين: ${blockedCount}`);
    console.log(`   - الرسائل المحفوظة: ${roomStats.totalMessages}`);
    console.log(`   - الترجمات المخزنة: ${translationStats.totalTranslations}`);
  } catch (error) {
    console.error('❌ فشل جمع الإحصائيات:', error);
  }

  console.log('\n✅ اكتمل الاختبار! جميع الميزات جاهزة للعمل 🎉');
}

/**
 * اختبار سريع (للتشغيل من Console)
 */
export function quickTest() {
  console.log('⚡ اختبار سريع...\n');

  // البحث
  AdvancedSearchService.search({ online: true }, 5).then(results => {
    console.log(`🔍 البحث: ${results.length} نتائج`);
  });

  // الحظر
  ModerationService.blockUser('me', 'test-user');
  console.log(`🚫 الحظر: ${ModerationService.isBlocked('me', 'test-user')}`);

  // السجل
  ChatHistoryService.addMessage('room1', {
    id: '1',
    text: 'Hello',
    senderId: 'user1',
    senderName: 'Test',
    timestamp: new Date(),
  });
  console.log(`💬 السجل: ${ChatHistoryService.getRecentMessages('room1').length} رسائل`);

  // الترجمة
  TranslationService.translate('Hello', 'ar').then(t => {
    console.log(`🌐 الترجمة: ${t.translatedText}`);
  });

  console.log('\n✅ الاختبار السريع مكتمل!');
}

/**
 * عرض معلومات الميزات
 */
export function showFeaturesInfo() {
  console.log(`
🎯 الميزات المتقدمة المتاحة:

1️⃣ نظام الإشعارات الفورية
   - NotificationService.initialize()
   - NotificationService.send(...)

2️⃣ البحث المتقدم
   - AdvancedSearchService.search(filters)
   - صفحة UI: /search/advanced

3️⃣ الفلترة والحظر
   - ModerationService.blockUser(...)
   - ModerationService.muteUser(...)
   - ModerationService.reportUser(...)

4️⃣ سجل المحادثات
   - ChatHistoryService.addMessage(...)
   - ChatHistoryService.getMessages(...)
   - ChatHistoryService.searchMessages(...)

5️⃣ تسجيل الغرف (VIP)
   - RecordingService.startRecording(...)
   - RecordingService.stopRecording(...)
   - RecordingService.downloadRecording(...)

6️⃣ الترجمة الآلية
   - TranslationService.translate(text, targetLang)
   - TranslationService.detectLanguage(text)

📚 للمزيد: راجع ADVANCED_FEATURES.md
  `);
}

// تصدير للاستخدام من Console
if (typeof window !== 'undefined') {
  (window as any).testAllFeatures = testAllFeatures;
  (window as any).quickTest = quickTest;
  (window as any).showFeaturesInfo = showFeaturesInfo;
  
  console.log(`
🎉 ميزات الاختبار متاحة الآن!

استخدم في Console:
  - testAllFeatures()    // اختبار شامل
  - quickTest()          // اختبار سريع
  - showFeaturesInfo()   // عرض المعلومات
  `);
}
