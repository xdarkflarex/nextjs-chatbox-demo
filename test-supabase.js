/**
 * =====================================================
 * SUPABASE CONNECTION TEST
 * =====================================================
 * Test kết nối Supabase và các chức năng cơ bản
 * Chạy: node test-supabase.js
 * =====================================================
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 TESTING SUPABASE CONNECTION');
console.log('='.repeat(60));
console.log('');

// Kiểm tra environment variables
console.log('📋 Environment Variables:');
console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('   ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('   SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Please update .env.local with your Supabase keys');
  console.error('   See SUPABASE_QUICKSTART.md for instructions');
  process.exit(1);
}

// Tạo clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Kiểm tra kết nối
  console.log('📝 Test 1: Connection Test');
  try {
    const { count, error } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('   ❌ FAILED:', error.message);
      failedTests++;
    } else {
      console.log('   ✅ PASSED - Connected! Total sessions:', count || 0);
      passedTests++;
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    failedTests++;
  }
  console.log('');

  // Test 2: Tạo session mới
  console.log('📝 Test 2: Create Session');
  let testSessionId = null;
  try {
    const { data, error } = await supabaseAdmin
      .from('chat_sessions')
      .insert({
        user_role: 'student',
        user_class: '6/1',
        session_name: 'Test Session - ' + new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.log('   ❌ FAILED:', error.message);
      failedTests++;
    } else {
      testSessionId = data.id;
      console.log('   ✅ PASSED - Session created:', data.id);
      passedTests++;
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    failedTests++;
  }
  console.log('');

  // Test 3: Tạo message
  if (testSessionId) {
    console.log('📝 Test 3: Create Message');
    try {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert({
          session_id: testSessionId,
          sender: 'user',
          content: 'Test message from test script'
        })
        .select()
        .single();
      
      if (error) {
        console.log('   ❌ FAILED:', error.message);
        failedTests++;
      } else {
        console.log('   ✅ PASSED - Message created:', data.id);
        passedTests++;
      }
    } catch (err) {
      console.log('   ❌ FAILED:', err.message);
      failedTests++;
    }
    console.log('');
  }

  // Test 4: Query sessions
  console.log('📝 Test 4: Query Sessions');
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('   ❌ FAILED:', error.message);
      failedTests++;
    } else {
      console.log('   ✅ PASSED - Found', data.length, 'sessions');
      passedTests++;
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    failedTests++;
  }
  console.log('');

  // Test 5: Query messages
  console.log('📝 Test 5: Query Messages');
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('   ❌ FAILED:', error.message);
      failedTests++;
    } else {
      console.log('   ✅ PASSED - Found', data.length, 'messages');
      passedTests++;
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    failedTests++;
  }
  console.log('');

  // Test 6: Check views
  console.log('📝 Test 6: Check Views');
  try {
    const { data, error } = await supabase
      .from('v_daily_stats')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('   ❌ FAILED:', error.message);
      failedTests++;
    } else {
      console.log('   ✅ PASSED - View accessible, found', data.length, 'records');
      passedTests++;
    }
  } catch (err) {
    console.log('   ❌ FAILED:', err.message);
    failedTests++;
  }
  console.log('');

  // Test 7: Emergency alert (nếu có test session)
  if (testSessionId) {
    console.log('📝 Test 7: Emergency Detection');
    try {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert({
          session_id: testSessionId,
          sender: 'user',
          content: 'Em đang rất stress và lo lắng',
          emergency_detected: true,
          emergency_level: 'YELLOW',
          emergency_keywords: ['stress', 'lo lắng']
        })
        .select()
        .single();
      
      if (error) {
        console.log('   ❌ FAILED:', error.message);
        failedTests++;
      } else {
        console.log('   ✅ PASSED - Emergency message created');
        
        // Kiểm tra alert được tạo tự động
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi trigger
        
        const { data: alerts } = await supabaseAdmin
          .from('emergency_alerts')
          .select('*')
          .eq('session_id', testSessionId);
        
        if (alerts && alerts.length > 0) {
          console.log('   ✅ BONUS - Emergency alert auto-created!');
        }
        
        passedTests++;
      }
    } catch (err) {
      console.log('   ❌ FAILED:', err.message);
      failedTests++;
    }
    console.log('');
  }

  // Cleanup: Xóa test session
  if (testSessionId) {
    console.log('🧹 Cleanup: Deleting test session...');
    try {
      await supabaseAdmin
        .from('chat_sessions')
        .delete()
        .eq('id', testSessionId);
      console.log('   ✅ Test session deleted');
    } catch (err) {
      console.log('   ⚠️  Could not delete test session:', err.message);
    }
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('   ✅ Passed:', passedTests);
  console.log('   ❌ Failed:', failedTests);
  console.log('   📈 Success Rate:', ((passedTests / (passedTests + failedTests)) * 100).toFixed(1) + '%');
  console.log('');

  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED! Supabase is ready to use!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Update API routes to use Supabase');
    console.log('   2. Test the chatbot with real data');
    console.log('   3. Configure admin dashboard');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check if migration was run: npm run db:migrate');
    console.log('   2. Verify API keys in .env.local');
    console.log('   3. Check Supabase Dashboard → Logs for errors');
    console.log('   4. See SUPABASE_QUICKSTART.md for help');
  }
  
  console.log('');
}

runTests().catch(err => {
  console.error('❌ Test script error:', err);
  process.exit(1);
});
