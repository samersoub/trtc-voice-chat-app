/**
 * 🧪 سكريبت اختبار سريع لقاعدة البيانات
 * يمكن تشغيله من Console المتصفح
 * 
 * الاستخدام:
 * 1. افتح التطبيق في المتصفح
 * 2. افتح Developer Console (F12)
 * 3. انسخ والصق هذا الكود
 * 4. اضغط Enter
 */

import { supabase, isSupabaseReady } from './src/services/db/supabaseClient';
import { AuthService } from './src/services/AuthService';
import { ProfileService } from './src/services/ProfileService';

// ألوان Console للتنسيق
const colors = {
  success: 'color: #10b981; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;',
  info: 'color: #3b82f6; font-weight: bold;',
  warning: 'color: #f59e0b; font-weight: bold;',
};

async function runDatabaseTests() {
  console.log('%c🧪 بدء اختبار قاعدة البيانات...', colors.info);
  console.log('═══════════════════════════════════════════════════════════\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // ==========================================
  // Test 1: Supabase Connection
  // ==========================================
  console.log('%c📡 Test 1: فحص الاتصال بـ Supabase', colors.info);
  try {
    if (!isSupabaseReady) {
      throw new Error('Supabase not configured');
    }
    console.log('%c✅ PASS: Supabase متصل بنجاح', colors.success);
    results.passed++;
    results.tests.push({ name: 'Supabase Connection', status: 'PASS' });
  } catch (error) {
    console.log('%c❌ FAIL: ' + error.message, colors.error);
    results.failed++;
    results.tests.push({ name: 'Supabase Connection', status: 'FAIL', error: error.message });
  }
  console.log('');

  // ==========================================
  // Test 2: Check users table schema
  // ==========================================
  console.log('%c🗄️ Test 2: فحص جدول users', colors.info);
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    // Check if new columns exist
    const requiredColumns = [
      'level', 'followers', 'following', 'interests',
      'is_premium', 'location_lat', 'location_lng', 'city'
    ];
    
    if (data && data.length > 0) {
      const userSample = data[0];
      const missingColumns = requiredColumns.filter(col => !(col in userSample));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing columns: ${missingColumns.join(', ')}`);
      }
    }
    
    console.log('%c✅ PASS: جدول users يحتوي على جميع الحقول المطلوبة', colors.success);
    results.passed++;
    results.tests.push({ name: 'Users Table Schema', status: 'PASS' });
  } catch (error) {
    console.log('%c❌ FAIL: ' + error.message, colors.error);
    console.log('%c⚠️ قم بتطبيق migration file أولاً!', colors.warning);
    results.failed++;
    results.tests.push({ name: 'Users Table Schema', status: 'FAIL', error: error.message });
  }
  console.log('');

  // ==========================================
  // Test 3: Test User Registration
  // ==========================================
  console.log('%c👤 Test 3: اختبار تسجيل مستخدم جديد', colors.info);
  const testEmail = `test_${Date.now()}@android-test.com`;
  const testUsername = `test_user_${Date.now()}`;
  const testPassword = 'TestPassword123!';
  
  try {
    const newUser = await AuthService.registerExtended(
      testUsername,
      testEmail,
      testPassword,
      '+966501234567'
    );
    
    if (!newUser || !newUser.id) {
      throw new Error('Registration failed - no user ID returned');
    }
    
    console.log('%c✅ PASS: تم تسجيل المستخدم بنجاح', colors.success);
    console.log('User ID:', newUser.id);
    console.log('Email:', newUser.email);
    console.log('Username:', newUser.name);
    results.passed++;
    results.tests.push({ 
      name: 'User Registration', 
      status: 'PASS',
      data: { userId: newUser.id, email: testEmail }
    });
    
    // ==========================================
    // Test 4: Verify User in Database
    // ==========================================
    console.log('\n%c🔍 Test 4: التحقق من حفظ البيانات في قاعدة البيانات', colors.info);
    try {
      const profile = await ProfileService.getByUserId(newUser.id);
      
      if (!profile) {
        throw new Error('User not found in database after registration');
      }
      
      console.log('%c✅ PASS: المستخدم محفوظ في قاعدة البيانات', colors.success);
      console.log('Profile data:', {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        coins: profile.coins,
        is_verified: profile.is_verified
      });
      results.passed++;
      results.tests.push({ name: 'Database Persistence', status: 'PASS' });
      
      // ==========================================
      // Test 5: Check Default Values
      // ==========================================
      console.log('\n%c⚙️ Test 5: فحص القيم الافتراضية', colors.info);
      try {
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('coins, level, followers, following, is_premium')
          .eq('id', newUser.id)
          .single();
        
        if (error) throw error;
        
        const checks = [
          { name: 'coins', expected: 1000, actual: dbUser.coins },
          { name: 'level', expected: 1, actual: dbUser.level },
          { name: 'is_premium', expected: false, actual: dbUser.is_premium },
          { name: 'followers', expected: 'array', actual: Array.isArray(dbUser.followers) ? 'array' : 'not array' },
          { name: 'following', expected: 'array', actual: Array.isArray(dbUser.following) ? 'array' : 'not array' }
        ];
        
        const failedChecks = checks.filter(check => check.expected !== check.actual);
        
        if (failedChecks.length > 0) {
          throw new Error(`Default values mismatch: ${JSON.stringify(failedChecks)}`);
        }
        
        console.log('%c✅ PASS: جميع القيم الافتراضية صحيحة', colors.success);
        console.table(checks);
        results.passed++;
        results.tests.push({ name: 'Default Values', status: 'PASS' });
      } catch (error) {
        console.log('%c❌ FAIL: ' + error.message, colors.error);
        results.failed++;
        results.tests.push({ name: 'Default Values', status: 'FAIL', error: error.message });
      }
      
      // ==========================================
      // Test 6: Test User Update
      // ==========================================
      console.log('\n%c📝 Test 6: اختبار تحديث بيانات المستخدم', colors.info);
      try {
        const updatedProfile = await ProfileService.updateProfile(newUser.id, {
          ...profile,
          bio: 'Test bio for Android migration',
          coins: profile.coins + 500
        });
        
        if (!updatedProfile || updatedProfile.coins !== profile.coins + 500) {
          throw new Error('Update failed');
        }
        
        console.log('%c✅ PASS: تم تحديث بيانات المستخدم بنجاح', colors.success);
        console.log('Updated coins:', updatedProfile.coins);
        results.passed++;
        results.tests.push({ name: 'User Update', status: 'PASS' });
      } catch (error) {
        console.log('%c❌ FAIL: ' + error.message, colors.error);
        results.failed++;
        results.tests.push({ name: 'User Update', status: 'FAIL', error: error.message });
      }
      
      // ==========================================
      // Test 7: Test Follow/Unfollow Functions
      // ==========================================
      console.log('\n%c👥 Test 7: اختبار دوال المتابعة', colors.info);
      try {
        // Create a second test user
        const testUser2Email = `test2_${Date.now()}@android-test.com`;
        const testUser2Username = `test_user2_${Date.now()}`;
        const testUser2 = await AuthService.registerExtended(
          testUser2Username,
          testUser2Email,
          testPassword,
          '+966501234568'
        );
        
        // Test follow function
        const { error: followError } = await supabase.rpc('add_follower', {
          target_user_id: newUser.id,
          follower_id: testUser2.id
        });
        
        if (followError) throw followError;
        
        // Verify follow relationship
        const { data: user1, error: fetchError1 } = await supabase
          .from('users')
          .select('followers')
          .eq('id', newUser.id)
          .single();
        
        if (fetchError1) throw fetchError1;
        
        const { data: user2, error: fetchError2 } = await supabase
          .from('users')
          .select('following')
          .eq('id', testUser2.id)
          .single();
        
        if (fetchError2) throw fetchError2;
        
        if (!user1.followers.includes(testUser2.id) || !user2.following.includes(newUser.id)) {
          throw new Error('Follow relationship not established correctly');
        }
        
        console.log('%c✅ PASS: دوال المتابعة تعمل بشكل صحيح', colors.success);
        console.log('Follower relationship verified');
        results.passed++;
        results.tests.push({ name: 'Follow/Unfollow Functions', status: 'PASS' });
        
        // Cleanup test user 2
        await supabase.from('users').delete().eq('id', testUser2.id);
      } catch (error) {
        console.log('%c❌ FAIL: ' + error.message, colors.error);
        results.failed++;
        results.tests.push({ name: 'Follow/Unfollow Functions', status: 'FAIL', error: error.message });
      }
      
      // ==========================================
      // Cleanup: Delete Test User
      // ==========================================
      console.log('\n%c🧹 تنظيف: حذف المستخدم التجريبي', colors.warning);
      try {
        await ProfileService.deleteUser(newUser.id);
        console.log('%c✅ تم حذف المستخدم التجريبي', colors.success);
      } catch (error) {
        console.log('%c⚠️ فشل حذف المستخدم التجريبي: ' + error.message, colors.warning);
      }
      
    } catch (error) {
      console.log('%c❌ FAIL: ' + error.message, colors.error);
      results.failed++;
      results.tests.push({ name: 'Database Persistence', status: 'FAIL', error: error.message });
    }
    
  } catch (error) {
    console.log('%c❌ FAIL: ' + error.message, colors.error);
    console.log('%cتفاصيل الخطأ:', colors.warning, error);
    results.failed++;
    results.tests.push({ name: 'User Registration', status: 'FAIL', error: error.message });
  }

  // ==========================================
  // Final Report
  // ==========================================
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('%c📊 نتائج الاختبار النهائية:', colors.info);
  console.log('');
  console.log(`%c✅ اختبارات ناجحة: ${results.passed}`, colors.success);
  console.log(`%c❌ اختبارات فاشلة: ${results.failed}`, colors.error);
  console.log(`%c📈 معدل النجاح: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`, colors.info);
  console.log('');
  console.table(results.tests);
  console.log('═══════════════════════════════════════════════════════════');
  
  if (results.failed === 0) {
    console.log('\n%c🎉 مبروك! قاعدة البيانات جاهزة 100% للتحويل إلى Android!', colors.success);
    console.log('%c✅ جميع الاختبارات نجحت بدون أخطاء', colors.success);
  } else {
    console.log('\n%c⚠️ تحذير: هناك بعض الاختبارات الفاشلة', colors.warning);
    console.log('%cيرجى مراجعة الأخطاء أعلاه قبل المتابعة إلى Android', colors.warning);
    console.log('\n%cخطوات الحل:', colors.info);
    console.log('1. تأكد من تطبيق migration file في Supabase');
    console.log('2. تحقق من أن جميع متغيرات البيئة صحيحة في .env');
    console.log('3. راجع ملف DATABASE_READY_FOR_ANDROID.md');
  }
  
  return results;
}

// Export للاستخدام
export { runDatabaseTests };

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log('%c🚀 تحميل سكريبت اختبار قاعدة البيانات...', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
  console.log('%cللتشغيل، اكتب: runDatabaseTests()', 'color: #10b981; font-size: 12px;');
}
