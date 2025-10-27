/**
 * Test nhanh xem buildSchoolInfoContext có hoạt động không
 */

import fs from 'fs';
import path from 'path';

// Load school info
const schoolInfoPath = path.join(process.cwd(), 'app', 'public', 'data', 'context_school_info.json');
const schoolInfo = JSON.parse(fs.readFileSync(schoolInfoPath, 'utf8'));

console.log('✅ Loaded school info');
console.log('Hiệu trưởng:', schoolInfo.ban_giam_hieu.hieu_truong.name);
console.log('Phó HT:', schoolInfo.ban_giam_hieu.pho_hieu_truong.map(p => p.name).join(', '));

// Test queries
const testQueries = [
  'Hiệu trưởng là ai?',
  'Cho em hỏi hiệu phó trưởng mình là ai ạ',
  'Phó hiệu trưởng tên gì?',
  'BGH trường mình có ai?',
  'Thứ 2 buổi sáng ai trực?'
];

function buildSchoolInfoContext(userQuery) {
  let context = '';
  const query = userQuery.toLowerCase();
  
  console.log('\n🔍 Query:', userQuery);
  console.log('   Lowercase:', query);
  
  // Check BGH
  const isBGHQuery = query.includes('hiệu trưởng') || 
                     query.includes('hiệu phó') || 
                     query.includes('phó hiệu') ||
                     query.includes('bgh') || 
                     query.includes('ban giám hiệu') || 
                     query.includes('giám hiệu') ||
                     query.includes('trực');
  
  console.log('   Is BGH query?', isBGHQuery);
  
  if (isBGHQuery) {
    context += '=== BAN GIÁM HIỆU ===\n';
    context += `- Hiệu trưởng: ${schoolInfo.ban_giam_hieu.hieu_truong.name}\n`;
    context += `- Phó Hiệu trưởng: ${schoolInfo.ban_giam_hieu.pho_hieu_truong.map(p => p.name).join(', ')}\n`;
    
    if (query.includes('trực')) {
      context += `\n**Lịch trực:**\n`;
      context += `- Thời gian: Sáng ${schoolInfo.ban_giam_hieu.lich_truc.thoi_gian.sang}, Chiều ${schoolInfo.ban_giam_hieu.lich_truc.thoi_gian.chieu}\n`;
      
      const days = ['thứ 2', 'thứ 3', 'thứ 4', 'thứ 5', 'thứ 6', 'thứ 7'];
      const foundDay = days.find(d => query.includes(d));
      if (foundDay) {
        const dayKey = foundDay.replace(' ', '_');
        const schedule = schoolInfo.ban_giam_hieu.lich_truc.lich_tuan[dayKey];
        if (schedule) {
          context += `- ${foundDay}: Sáng ${schedule.sang}, Chiều ${schedule.chieu}\n`;
        }
      }
    }
    context += '\n';
  }
  
  console.log('   Context built:', context ? 'YES' : 'NO');
  if (context) {
    console.log('   Context preview:', context.substring(0, 100) + '...');
  }
  
  return context;
}

// Test
console.log('\n' + '='.repeat(80));
console.log('TESTING SCHOOL INFO CONTEXT BUILDER');
console.log('='.repeat(80));

testQueries.forEach(q => {
  const context = buildSchoolInfoContext(q);
  console.log('\n' + '-'.repeat(80));
});

console.log('\n✅ Test completed!');
