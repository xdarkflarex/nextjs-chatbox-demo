/**
 * SCRIPT TEST SMART RETRIEVAL
 * Chạy: node test-smart-retrieval.js
 */

const testCases = [
  {
    name: "Test 1: Tìm số điện thoại GVCN",
    query: "Số điện thoại GVCN lớp 6/1",
    expectedIntent: "contact",
    expectedKeywords: ["Lê Thị Lý", "0906444659"]
  },
  {
    name: "Test 2: Hỏi quy định sổ đầu bài",
    query: "Sổ đầu bài chấm điểm như thế nào",
    expectedIntent: "policy",
    expectedKeywords: ["10", "điểm", "tiết"]
  },
  {
    name: "Test 3: Hỏi lịch trực BGH",
    query: "Thứ 2 BGH ai trực",
    expectedIntent: "schedule",
    expectedKeywords: ["Thứ 2", "Phạm Thị Thùy Loan"]
  },
  {
    name: "Test 4: Tìm phòng học",
    query: "Lớp 8/5 học ở phòng nào",
    expectedIntent: "rooms",
    expectedKeywords: ["8/5", "Phòng"]
  },
  {
    name: "Test 5: Câu hỏi tâm lý (không dùng smart retrieval)",
    query: "Em đang căng thẳng trước kỳ thi",
    expectedIntent: "general",
    expectedKeywords: []
  },
  {
    name: "Test 6: Nhiều lớp",
    query: "Cho em xin số điện thoại GVCN lớp 7/3",
    expectedIntent: "contact",
    expectedKeywords: ["7/3", "Vi Thị Hằng"]
  }
];

async function runTests() {
  console.log('🧪 BẮT ĐẦU TEST SMART RETRIEVAL\n');
  console.log('=' .repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`\n📝 ${testCase.name}`);
    console.log(`   Query: "${testCase.query}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/smart-retrieval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testCase.query })
      });
      
      if (!response.ok) {
        console.log(`   ❌ FAILED: HTTP ${response.status}`);
        failed++;
        continue;
      }
      
      const result = await response.json();
      
      // Kiểm tra intent
      const intentMatch = result.intent === testCase.expectedIntent;
      console.log(`   Intent: ${result.intent} ${intentMatch ? '✅' : '❌ Expected: ' + testCase.expectedIntent}`);
      
      // Kiểm tra số lượng kết quả
      const resultsCount = result.results?.length || 0;
      console.log(`   Results: ${resultsCount} items`);
      
      // Kiểm tra keywords (nếu có)
      if (testCase.expectedKeywords.length > 0 && resultsCount > 0) {
        const resultText = JSON.stringify(result.results);
        const keywordsFound = testCase.expectedKeywords.filter(kw => 
          resultText.includes(kw)
        );
        
        const allKeywordsFound = keywordsFound.length === testCase.expectedKeywords.length;
        console.log(`   Keywords: ${keywordsFound.length}/${testCase.expectedKeywords.length} ${allKeywordsFound ? '✅' : '❌'}`);
        
        if (!allKeywordsFound) {
          console.log(`   Missing: ${testCase.expectedKeywords.filter(kw => !keywordsFound.includes(kw)).join(', ')}`);
        }
      }
      
      // Tổng kết test case
      if (intentMatch && (testCase.expectedKeywords.length === 0 || resultsCount > 0)) {
        console.log(`   ✅ PASSED`);
        passed++;
      } else {
        console.log(`   ❌ FAILED`);
        failed++;
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 KẾT QUẢ TEST:`);
  console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
  console.log(`   📈 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (passed === testCases.length) {
    console.log('\n🎉 TẤT CẢ TEST ĐỀU PASSED! HỆ THỐNG HOẠT ĐỘNG TỐT!');
  } else {
    console.log('\n⚠️  CÓ TEST FAILED. VUI LÒNG KIỂM TRA LẠI!');
  }
}

// Kiểm tra server có chạy không
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/smart-retrieval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test' })
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Main
(async () => {
  console.log('🔍 Kiểm tra server...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server không chạy!');
    console.log('   Vui lòng chạy: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server đang chạy\n');
  
  await runTests();
})();
