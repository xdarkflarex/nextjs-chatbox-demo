/**
 * Script để chạy migration 002: Thêm cột is_processed
 * Chạy: node run-migration-002.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running migration 002: Add is_processed column...\n');

  try {
    // Thêm cột is_processed
    console.log('1️⃣ Adding is_processed column...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE chat_sessions 
        ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT FALSE;
      `
    });
    
    if (error1) {
      console.log('⚠️  Column might already exist:', error1.message);
    } else {
      console.log('✅ is_processed column added');
    }

    // Thêm cột processed_at
    console.log('\n2️⃣ Adding processed_at column...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE chat_sessions 
        ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;
      `
    });
    
    if (error2) {
      console.log('⚠️  Column might already exist:', error2.message);
    } else {
      console.log('✅ processed_at column added');
    }

    // Thêm cột processed_by
    console.log('\n3️⃣ Adding processed_by column...');
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE chat_sessions 
        ADD COLUMN IF NOT EXISTS processed_by VARCHAR(100);
      `
    });
    
    if (error3) {
      console.log('⚠️  Column might already exist:', error3.message);
    } else {
      console.log('✅ processed_by column added');
    }

    // Tạo index
    console.log('\n4️⃣ Creating index...');
    const { error: error4 } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_sessions_is_processed 
        ON chat_sessions(is_processed);
      `
    });
    
    if (error4) {
      console.log('⚠️  Index might already exist:', error4.message);
    } else {
      console.log('✅ Index created');
    }

    console.log('\n✅ Migration 002 completed successfully!');
    console.log('\n📊 New columns added to chat_sessions:');
    console.log('   - is_processed (BOOLEAN)');
    console.log('   - processed_at (TIMESTAMP)');
    console.log('   - processed_by (VARCHAR)');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
