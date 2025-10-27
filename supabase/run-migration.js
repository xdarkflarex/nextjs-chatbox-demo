/**
 * =====================================================
 * SUPABASE MIGRATION RUNNER
 * =====================================================
 * Script để chạy migration file vào Supabase database
 * Sử dụng: node supabase/run-migration.js
 * =====================================================
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Please add:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting Supabase migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📊 SQL size:', (sql.length / 1024).toFixed(2), 'KB\n');

    // Split SQL into individual statements
    // Note: This is a simple split, may need adjustment for complex SQL
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log('📝 Found', statements.length, 'SQL statements\n');

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments and DO blocks (they need special handling)
      if (statement.startsWith('--') || statement.includes('DO $$')) {
        continue;
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          errorCount++;
        } else {
          successCount++;
          process.stdout.write(`✅ ${successCount}/${statements.length} `);
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1} error:`, err.message);
        errorCount++;
      }
    }

    console.log('\n\n📊 Migration Summary:');
    console.log('   ✅ Success:', successCount);
    console.log('   ❌ Errors:', errorCount);

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Run: SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';');
      console.log('   3. Verify tables: users, chat_sessions, messages, etc.');
    } else {
      console.log('\n⚠️  Migration completed with errors.');
      console.log('   Please check the errors above and run migration manually in Supabase Dashboard.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative: Direct PostgreSQL connection
async function runMigrationDirect() {
  console.log('🚀 Running migration via direct PostgreSQL connection...\n');

  const { Client } = require('pg');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executing migration...\n');

    // Execute the entire SQL file
    await client.query(sql);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Created tables:');
    result.rows.forEach(row => {
      console.log('   -', row.table_name);
    });

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Check if pg module is available
try {
  require('pg');
  console.log('📦 Using direct PostgreSQL connection (pg module found)\n');
  runMigrationDirect();
} catch (err) {
  console.log('📦 pg module not found, install it with: npm install pg');
  console.log('📦 Falling back to Supabase client method\n');
  runMigration();
}
