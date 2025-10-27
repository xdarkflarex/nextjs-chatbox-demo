/**
 * Script merge data mới vào RAG system
 */

const fs = require('fs');
const path = require('path');

function main() {
  console.log('🔄 Bắt đầu merge RAG data...\n');
  
  const dataDir = path.join('app', 'public', 'data');
  const oldFile = path.join(dataDir, 'rag_all.json');
  const newFile = path.join(dataDir, 'rag_documents.json');
  const backupFile = path.join(dataDir, 'rag_all.backup.json');
  
  // 1. Backup file cũ
  console.log('📦 Backup file cũ...');
  if (fs.existsSync(oldFile)) {
    fs.copyFileSync(oldFile, backupFile);
    console.log(`   ✅ Đã backup: ${backupFile}\n`);
  }
  
  // 2. Đọc data cũ
  console.log('📖 Đọc data cũ...');
  let oldData = [];
  if (fs.existsSync(oldFile)) {
    const oldContent = fs.readFileSync(oldFile, 'utf8');
    oldData = JSON.parse(oldContent);
    console.log(`   📊 Data cũ: ${oldData.length} entries\n`);
  }
  
  // 3. Đọc data mới
  console.log('📖 Đọc data mới...');
  if (!fs.existsSync(newFile)) {
    console.log(`   ❌ Không tìm thấy: ${newFile}`);
    console.log('   💡 Chạy: python extract_data.py');
    return;
  }
  
  const newContent = fs.readFileSync(newFile, 'utf8');
  const newData = JSON.parse(newContent);
  console.log(`   📊 Data mới: ${newData.length} entries\n`);
  
  // 4. Merge
  console.log('🔗 Merge data...');
  const mergedData = [...oldData, ...newData];
  console.log(`   📊 Tổng: ${mergedData.length} entries\n`);
  
  // 5. Lưu
  console.log('💾 Lưu file...');
  fs.writeFileSync(
    oldFile,
    JSON.stringify(mergedData, null, 2),
    'utf8'
  );
  console.log(`   ✅ Đã lưu: ${oldFile}\n`);
  
  // 6. Thống kê
  console.log('=' .repeat(50));
  console.log('📊 THỐNG KÊ:');
  console.log('=' .repeat(50));
  console.log(`📁 Data cũ:     ${oldData.length} entries`);
  console.log(`📁 Data mới:    ${newData.length} entries`);
  console.log(`📁 Tổng cộng:   ${mergedData.length} entries`);
  
  // Thống kê theo category
  const categories = {};
  mergedData.forEach(entry => {
    const cat = entry.category || 'unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  
  console.log('\n📂 Theo category:');
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });
  
  // Thống kê theo source
  const sources = {};
  newData.forEach(entry => {
    const src = entry.source || 'unknown';
    sources[src] = (sources[src] || 0) + 1;
  });
  
  console.log('\n📄 Data mới theo nguồn:');
  Object.entries(sources).forEach(([src, count]) => {
    console.log(`   ${src}: ${count} entries`);
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ HOÀN THÀNH!');
  console.log('=' .repeat(50));
  console.log('\n🎯 BƯỚC TIẾP THEO:');
  console.log('1. Restart server: npm run dev');
  console.log('2. Test API với câu hỏi mới');
  console.log('3. Kiểm tra RAG matching\n');
  
  console.log('💡 TEST:');
  console.log('curl http://localhost:3000/api/chat \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"messages":[{"role":"user","text":"Lịch trực ban giám hiệu"}]}\'');
}

try {
  main();
} catch (error) {
  console.error('❌ Lỗi:', error.message);
  process.exit(1);
}
