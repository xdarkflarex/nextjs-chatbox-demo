/**
 * =====================================================
 * TEST GEMINI API VỚI 2 FILE CONTEXT
 * =====================================================
 * Kiểm tra xem Gemini có sử dụng đúng:
 * 1. context_school_info.json (thông tin trường)
 * 2. rag_all.json (tình huống tư vấn)
 * =====================================================
 */

import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load 2 files context
const schoolInfo = JSON.parse(
  fs.readFileSync('./app/public/data/context_school_info.json', 'utf8')
);

const situations = JSON.parse(
  fs.readFileSync('./app/public/data/rag_all.json', 'utf8')
);

// Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// 20 test cases
const testCases = [
  // ===== NHÓM 1: THÔNG TIN BGH (5 câu) =====
  {
    id: 1,
    category: 'BGH',
    question: 'Hiệu trưởng trường THCS Nguyễn Huệ tên gì?',
    expected_keywords: ['Võ Thanh Phước'],
    context_needed: 'school_info'
  },
  {
    id: 2,
    category: 'BGH',
    question: 'Có bao nhiêu phó hiệu trưởng?',
    expected_keywords: ['2', 'Hồ Thị Phước', 'Phạm Thị Thùy Loan'],
    context_needed: 'school_info'
  },
  {
    id: 3,
    category: 'BGH',
    question: 'Thứ 2 buổi sáng BGH ai trực?',
    expected_keywords: ['Phạm Thị Thùy Loan'],
    context_needed: 'school_info'
  },
  {
    id: 4,
    category: 'BGH',
    question: 'Thứ 5 buổi chiều ai trực?',
    expected_keywords: ['Phạm Thị Thùy Loan'],
    context_needed: 'school_info'
  },
  {
    id: 5,
    category: 'BGH',
    question: 'BGH trực từ mấy giờ đến mấy giờ?',
    expected_keywords: ['6h30', '11h30', '12h30', '17h30'],
    context_needed: 'school_info'
  },

  // ===== NHÓM 2: GVCN (5 câu) =====
  {
    id: 6,
    category: 'GVCN',
    question: 'Số điện thoại GVCN lớp 6/1 là gì?',
    expected_keywords: ['Lê Thị Lý', '0906444659'],
    context_needed: 'school_info'
  },
  {
    id: 7,
    category: 'GVCN',
    question: 'GVCN lớp 9/6 tên gì?',
    expected_keywords: ['Nguyễn Thị Lan Phương', '0905887689'],
    context_needed: 'school_info'
  },
  {
    id: 8,
    category: 'GVCN',
    question: 'Lớp 7/3 GVCN là ai?',
    expected_keywords: ['Nguyễn Thị Hồng Hạnh'],
    context_needed: 'school_info'
  },
  {
    id: 9,
    category: 'GVCN',
    question: 'Cho tôi số điện thoại cô Bùi Như Thành Nhân',
    expected_keywords: ['6/9', '0905554285'],
    context_needed: 'school_info'
  },
  {
    id: 10,
    category: 'GVCN',
    question: 'Lớp 8/5 học phòng nào và GVCN là ai?',
    expected_keywords: ['Phòng 3', 'Hoàng Văn Em'],
    context_needed: 'school_info'
  },

  // ===== NHÓM 3: QUY ĐỊNH (5 câu) =====
  {
    id: 11,
    category: 'Quy định',
    question: 'Sổ đầu bài chấm điểm thế nào?',
    expected_keywords: ['10 điểm', '2.5', 'Học tập', 'Kỷ luật', 'Vệ sinh', 'Chuyên cần'],
    context_needed: 'school_info'
  },
  {
    id: 12,
    category: 'Quy định',
    question: 'Công thức tính điểm thi đua lớp là gì?',
    expected_keywords: ['Sổ đầu bài', '× 2', 'Nề nếp', 'Sao đỏ', 'Điểm thưởng'],
    context_needed: 'school_info'
  },
  {
    id: 13,
    category: 'Quy định',
    question: 'Lớp đạt bao nhiêu điểm thì xếp loại Tốt?',
    expected_keywords: ['32', 'trở lên'],
    context_needed: 'school_info'
  },
  {
    id: 14,
    category: 'Quy định',
    question: 'Học sinh hút thuốc bị xử lý thế nào?',
    expected_keywords: ['Hạ', 'hạnh kiểm', 'Yếu', 'lưu hồ sơ'],
    context_needed: 'school_info'
  },
  {
    id: 15,
    category: 'Quy định',
    question: 'Nộp sổ sao đỏ khi nào?',
    expected_keywords: ['Tiết 5', 'Thứ 6', 'hàng tuần'],
    context_needed: 'school_info'
  },

  // ===== NHÓM 4: TƯ VẤN TÂM LÝ (5 câu) =====
  {
    id: 16,
    category: 'Tư vấn',
    question: 'Em stress vì sắp thi, làm sao để giảm căng thẳng?',
    expected_keywords: ['thở sâu', 'nghỉ ngơi', 'kế hoạch', 'ôn tập'],
    context_needed: 'situations'
  },
  {
    id: 17,
    category: 'Tư vấn',
    question: 'Em bị bạn bắt nạt ở trường, em phải làm gì?',
    expected_keywords: ['GVCN', 'cán bộ tư vấn', 'báo', 'giáo viên'],
    context_needed: 'situations'
  },
  {
    id: 18,
    category: 'Tư vấn',
    question: 'Làm sao để học tốt hơn khi em hay quên bài?',
    expected_keywords: ['ghi chép', 'ôn tập', 'lặp lại', 'sơ đồ tư duy'],
    context_needed: 'situations'
  },
  {
    id: 19,
    category: 'Tư vấn',
    question: 'Tôi là giáo viên, học sinh không làm bài tập nhiều lần, tôi nên làm gì?',
    expected_keywords: ['tìm hiểu nguyên nhân', 'kế hoạch', 'động lực', 'khen'],
    context_needed: 'situations'
  },
  {
    id: 20,
    category: 'Tư vấn + GVCN',
    question: 'Em bị bạn bắt nạt, em học lớp 6/1, em nên liên hệ ai?',
    expected_keywords: ['Lê Thị Lý', '0906444659', 'GVCN', 'cán bộ tư vấn'],
    context_needed: 'both'
  }
];

/**
 * Build context dựa trên câu hỏi
 */
function buildContext(question, contextType) {
  let context = '';

  if (contextType === 'school_info' || contextType === 'both') {
    context += '=== THÔNG TIN TRƯỜNG THCS NGUYỄN HUỆ ===\n';

    // BGH
    if (question.includes('hiệu trưởng') || question.includes('BGH') || question.includes('trực')) {
      context += `\n**Ban Giám Hiệu:**\n`;
      context += `- Hiệu trưởng: ${schoolInfo.ban_giam_hieu.hieu_truong.name}\n`;
      context += `- Phó HT: ${schoolInfo.ban_giam_hieu.pho_hieu_truong.map(p => p.name).join(', ')}\n`;
      
      if (question.includes('trực')) {
        context += `\n**Lịch trực BGH:**\n`;
        context += `- Thời gian: Sáng ${schoolInfo.ban_giam_hieu.lich_truc.thoi_gian.sang}, Chiều ${schoolInfo.ban_giam_hieu.lich_truc.thoi_gian.chieu}\n`;
        Object.entries(schoolInfo.ban_giam_hieu.lich_truc.lich_tuan).forEach(([thu, lich]) => {
          context += `- ${thu.replace('_', ' ')}: Sáng ${lich.sang}, Chiều ${lich.chieu}\n`;
        });
      }
    }

    // GVCN
    if (question.includes('GVCN') || question.includes('chủ nhiệm') || /lớp \d\/\d+/.test(question)) {
      const classMatch = question.match(/(\d)\/(\d+)/);
      if (classMatch) {
        const grade = classMatch[1];
        const className = `${classMatch[1]}/${classMatch[2]}`;
        const gvcnList = schoolInfo.danh_sach_gvcn[`khoi_${grade}`];
        const gvcn = gvcnList?.find(g => g.class === className);
        
        if (gvcn) {
          context += `\n**GVCN lớp ${className}:**\n`;
          context += `- Tên: ${gvcn.name}\n`;
          context += `- SĐT: ${gvcn.phone}\n`;
        }
      } else {
        // Tìm theo tên giáo viên
        const teacherName = question.match(/cô|thầy ([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?: [A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)/i);
        if (teacherName) {
          const name = teacherName[1];
          for (const [khoi, list] of Object.entries(schoolInfo.danh_sach_gvcn)) {
            const gvcn = list.find(g => g.name.includes(name));
            if (gvcn) {
              context += `\n**${gvcn.name}:**\n`;
              context += `- GVCN lớp: ${gvcn.class}\n`;
              context += `- SĐT: ${gvcn.phone}\n`;
              break;
            }
          }
        }
      }
    }

    // Phòng học
    if (question.includes('phòng')) {
      const classMatch = question.match(/(\d)\/(\d+)/);
      if (classMatch) {
        const grade = classMatch[1];
        const className = `${classMatch[1]}/${classMatch[2]}`;
        const rooms = schoolInfo.so_do_phong_hoc[`khoi_${grade}`];
        
        for (const [classes, room] of Object.entries(rooms)) {
          if (classes.includes(className)) {
            context += `\n**Phòng học lớp ${className}:** ${room}\n`;
            break;
          }
        }
      }
    }

    // Quy định
    if (question.includes('sổ đầu bài') || question.includes('chấm điểm')) {
      context += `\n**Quy định Sổ đầu bài:**\n`;
      context += `- Thang điểm: ${schoolInfo.quy_dinh_so_dau_bai.thang_diem}\n`;
      context += `- Tiêu chí:\n`;
      schoolInfo.quy_dinh_so_dau_bai.tieu_chi.forEach(tc => {
        context += `  + ${tc.name}: ${tc.max} điểm\n`;
      });
    }

    if (question.includes('thi đua')) {
      context += `\n**Quy định Thi đua lớp:**\n`;
      context += `- Công thức: ${schoolInfo.quy_dinh_thi_dua_lop.cong_thuc}\n`;
      context += `- Xếp loại:\n`;
      schoolInfo.quy_dinh_thi_dua_lop.xep_loai.forEach(xl => {
        context += `  + ${xl.loai}: ${xl.diem} điểm\n`;
      });
    }

    if (question.includes('sao đỏ')) {
      context += `\n**Quy định Sao đỏ:**\n`;
      context += `- Nộp sổ: ${schoolInfo.quy_dinh_sao_do.nop_so}\n`;
      context += `- Tổng điểm: ${schoolInfo.quy_dinh_sao_do.tong_diem}\n`;
    }

    if (question.includes('hút thuốc') || question.includes('bạo lực') || question.includes('vi phạm')) {
      context += `\n**Vi phạm nghiêm trọng:**\n`;
      schoolInfo.vi_pham_nghiem_trong.forEach(vp => {
        context += `- ${vp.hanh_vi}:\n`;
        context += `  + Lớp: ${vp.xu_ly_lop}\n`;
        context += `  + Học sinh: ${vp.xu_ly_hs}\n`;
      });
    }

    context += '\n';
  }

  if (contextType === 'situations' || contextType === 'both') {
    // Tìm tình huống tương tự trong rag_all.json
    const keywords = question.toLowerCase().split(' ');
    const matchedSituations = situations.filter(s => {
      const text = (s.question + ' ' + s.answer).toLowerCase();
      return keywords.some(kw => text.includes(kw));
    }).slice(0, 3); // Lấy top 3

    if (matchedSituations.length > 0) {
      context += '=== TÌNH HUỐNG TƯƠNG TỰ ===\n';
      matchedSituations.forEach((s, idx) => {
        if (s.question && s.answer) {
          context += `\n[${idx + 1}] ${s.question}\n`;
          context += `→ ${s.answer}\n`;
        }
      });
      context += '\n';
    }
  }

  return context;
}

/**
 * Test 1 câu hỏi
 */
async function testQuestion(testCase) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST ${testCase.id}: ${testCase.category}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`📝 Câu hỏi: ${testCase.question}`);
  console.log(`🎯 Từ khóa mong đợi: ${testCase.expected_keywords.join(', ')}`);
  console.log(`📚 Context cần: ${testCase.context_needed}`);

  try {
    // Build context
    const context = buildContext(testCase.question, testCase.context_needed);
    
    console.log(`\n📖 Context đã build (${context.length} chars):`);
    console.log(context.substring(0, 500) + '...\n');

    // Tạo prompt
    const prompt = `${context}

=== CÂU HỎI ===
${testCase.question}

=== HƯỚNG DẪN TRẢ LỜI ===
- Dựa trên thông tin trường và tình huống ở trên
- Trả lời ngắn gọn, chính xác
- Nếu có thông tin liên hệ (GVCN, BGH), nêu rõ tên và SĐT

Hãy trả lời:`;

    // Gọi Gemini
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    console.log(`✅ Câu trả lời từ Gemini:`);
    console.log(answer);

    // Kiểm tra keywords
    const foundKeywords = testCase.expected_keywords.filter(kw => 
      answer.toLowerCase().includes(kw.toLowerCase())
    );

    const accuracy = (foundKeywords.length / testCase.expected_keywords.length) * 100;

    console.log(`\n📊 Kết quả:`);
    console.log(`- Từ khóa tìm thấy: ${foundKeywords.length}/${testCase.expected_keywords.length}`);
    console.log(`- Độ chính xác: ${accuracy.toFixed(1)}%`);
    console.log(`- Từ khóa đúng: ${foundKeywords.join(', ')}`);
    
    if (foundKeywords.length < testCase.expected_keywords.length) {
      const missing = testCase.expected_keywords.filter(kw => !foundKeywords.includes(kw));
      console.log(`- Từ khóa thiếu: ${missing.join(', ')}`);
    }

    return {
      id: testCase.id,
      category: testCase.category,
      question: testCase.question,
      answer: answer,
      expected: testCase.expected_keywords.length,
      found: foundKeywords.length,
      accuracy: accuracy,
      passed: accuracy >= 70
    };

  } catch (error) {
    console.error(`❌ Lỗi: ${error.message}`);
    return {
      id: testCase.id,
      category: testCase.category,
      question: testCase.question,
      error: error.message,
      passed: false
    };
  }
}

/**
 * Chạy tất cả tests
 */
async function runAllTests() {
  console.log('\n🚀 BẮT ĐẦU TEST GEMINI API VỚI 2 FILE CONTEXT\n');
  console.log(`📁 File 1: context_school_info.json (${JSON.stringify(schoolInfo).length} bytes)`);
  console.log(`📁 File 2: rag_all.json (${situations.length} tình huống)\n`);

  const results = [];

  for (const testCase of testCases) {
    const result = await testQuestion(testCase);
    results.push(result);
    
    // Delay để tránh rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Tổng kết
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 TỔNG KẾT');
  console.log(`${'='.repeat(80)}\n`);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const avgAccuracy = results
    .filter(r => r.accuracy !== undefined)
    .reduce((sum, r) => sum + r.accuracy, 0) / results.length;

  console.log(`✅ Passed: ${passed}/${testCases.length} (${(passed/testCases.length*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed}/${testCases.length}`);
  console.log(`📈 Độ chính xác trung bình: ${avgAccuracy.toFixed(1)}%\n`);

  // Chi tiết theo category
  const categories = [...new Set(testCases.map(t => t.category))];
  categories.forEach(cat => {
    const catResults = results.filter(r => r.category === cat);
    const catPassed = catResults.filter(r => r.passed).length;
    const catAccuracy = catResults
      .filter(r => r.accuracy !== undefined)
      .reduce((sum, r) => sum + r.accuracy, 0) / catResults.length;
    
    console.log(`${cat}: ${catPassed}/${catResults.length} passed (${catAccuracy.toFixed(1)}% accuracy)`);
  });

  // Lưu kết quả
  fs.writeFileSync(
    './test-results.json',
    JSON.stringify(results, null, 2),
    'utf8'
  );

  console.log(`\n💾 Kết quả đã lưu vào: test-results.json`);
}

// Chạy tests
runAllTests().catch(console.error);
