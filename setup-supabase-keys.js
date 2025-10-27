/**
 * =====================================================
 * SUPABASE API KEYS SETUP HELPER
 * =====================================================
 * Script để giúp setup Supabase API keys dễ dàng
 * Chạy: node setup-supabase-keys.js
 * =====================================================
 */

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 SUPABASE API KEYS SETUP');
console.log('='.repeat(60));
console.log('');
console.log('📋 Hướng dẫn lấy API keys:');
console.log('   1. Truy cập: https://supabase.com/dashboard');
console.log('   2. Chọn project của bạn');
console.log('   3. Vào Settings → API');
console.log('   4. Copy 2 keys bên dưới');
console.log('');
console.log('='.repeat(60));
console.log('');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  try {
    // Read current .env.local
    let envContent = '';
    try {
      envContent = fs.readFileSync('.env.local', 'utf8');
    } catch (err) {
      console.log('⚠️  .env.local not found, will create new one');
    }

    console.log('📝 Nhập thông tin Supabase:\n');

    // Get Supabase URL
    const url = await question('Project URL (https://xxx.supabase.co): ');
    if (!url || !url.includes('supabase.co')) {
      console.log('❌ Invalid URL. Phải có dạng: https://xxx.supabase.co');
      process.exit(1);
    }

    // Get anon key
    console.log('\n📌 Anon/Public Key (key dài ~200 ký tự):');
    const anonKey = await question('Paste anon key: ');
    if (!anonKey || anonKey.length < 100) {
      console.log('❌ Invalid anon key. Key phải dài hơn 100 ký tự');
      process.exit(1);
    }

    // Get service role key
    console.log('\n🔐 Service Role Key (key dài ~200 ký tự, BÍ MẬT):');
    const serviceKey = await question('Paste service role key: ');
    if (!serviceKey || serviceKey.length < 100) {
      console.log('❌ Invalid service role key. Key phải dài hơn 100 ký tự');
      process.exit(1);
    }

    // Update .env.local
    console.log('\n💾 Đang cập nhật .env.local...');

    // Check if Supabase config already exists
    if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
      // Update existing
      envContent = envContent.replace(
        /NEXT_PUBLIC_SUPABASE_URL=.*/,
        `NEXT_PUBLIC_SUPABASE_URL=${url}`
      );
      envContent = envContent.replace(
        /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`
      );
      envContent = envContent.replace(
        /SUPABASE_SERVICE_ROLE_KEY=.*/,
        `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`
      );
    } else {
      // Add new
      envContent += `\n# ==================== SUPABASE ====================\n`;
      envContent += `NEXT_PUBLIC_SUPABASE_URL=${url}\n`;
      envContent += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}\n`;
      envContent += `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}\n`;
    }

    // Write to file
    fs.writeFileSync('.env.local', envContent);

    console.log('✅ .env.local đã được cập nhật!\n');

    // Verify
    console.log('🔍 Kiểm tra cấu hình:');
    console.log('   URL:', url);
    console.log('   Anon Key:', anonKey.substring(0, 20) + '...');
    console.log('   Service Key:', serviceKey.substring(0, 20) + '...');
    console.log('');

    // Next steps
    console.log('='.repeat(60));
    console.log('✅ SETUP HOÀN TẤT!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 Bước tiếp theo:');
    console.log('');
    console.log('1️⃣  Chạy migration để tạo database:');
    console.log('   npm install pg');
    console.log('   npm run db:migrate');
    console.log('');
    console.log('   HOẶC dùng Supabase Dashboard → SQL Editor');
    console.log('   Copy file: supabase/migrations/001_initial_schema.sql');
    console.log('');
    console.log('2️⃣  Test kết nối:');
    console.log('   npm run db:test');
    console.log('');
    console.log('3️⃣  Chuyển sang Supabase:');
    console.log('   mv app/api/sessions/route.js app/api/sessions/route-local.js');
    console.log('   mv app/api/sessions/route-supabase.js app/api/sessions/route.js');
    console.log('');
    console.log('4️⃣  Restart dev server:');
    console.log('   npm run dev');
    console.log('');
    console.log('📖 Xem thêm: SUPABASE_QUICKSTART.md');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup();
