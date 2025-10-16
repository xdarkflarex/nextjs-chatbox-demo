// Test Chat API endpoint với model mới
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

async function testChatAPI() {
  console.log('='.repeat(60));
  console.log('🧪 TEST CHAT API VỚI MODEL MỚI');
  console.log('='.repeat(60));
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Không tìm thấy GEMINI_API_KEY');
    return;
  }
  
  console.log('\n✅ API Key: ' + apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));
  
  // Test 1: Câu hỏi đơn giản
  console.log('\n📋 TEST 1: Câu hỏi đơn giản');
  console.log('─'.repeat(60));
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `Bạn là trợ lý AI của trường học. Hãy trả lời ngắn gọn câu hỏi sau:

Câu hỏi: Em muốn học tốt môn Toán thì phải làm sao?

Trả lời ngắn gọn (2-3 câu):`;
    
    console.log('🔄 Đang gọi Gemini API...');
    const startTime = Date.now();
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Thành công (${duration}ms)`);
    console.log('\n📝 Câu trả lời:');
    console.log(text);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      console.log('\n⚠️  VẤN ĐỀ: Đã vượt quá giới hạn sử dụng (Rate Limit)');
      console.log('💡 Giải pháp: Đợi 1-5 phút rồi thử lại');
    }
  }
  
  // Test 2: Câu hỏi phức tạp hơn
  console.log('\n\n📋 TEST 2: Câu hỏi về tâm lý');
  console.log('─'.repeat(60));
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `Bạn là trợ lý AI của trường học. Hãy trả lời ngắn gọn câu hỏi sau:

Câu hỏi: Em cảm thấy áp lực học tập quá nhiều, phải làm sao?

Trả lời ngắn gọn (3-4 câu), thể hiện sự thấu hiểu:`;
    
    console.log('🔄 Đang gọi Gemini API...');
    const startTime = Date.now();
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Thành công (${duration}ms)`);
    console.log('\n📝 Câu trả lời:');
    console.log(text);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      console.log('\n⚠️  VẤN ĐỀ: Đã vượt quá giới hạn sử dụng (Rate Limit)');
      console.log('💡 Giải pháp: Đợi 1-5 phút rồi thử lại');
    }
  }
  
  // Test 3: Test rate limit
  console.log('\n\n📋 TEST 3: Kiểm tra Rate Limit (5 requests liên tiếp)');
  console.log('─'.repeat(60));
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 1; i <= 5; i++) {
    try {
      console.log(`\n🔄 Request ${i}/5...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const result = await model.generateContent(`Test ${i}: Chào bạn`);
      const response = await result.response;
      
      console.log(`   ✅ Thành công`);
      successCount++;
      
      // Đợi 300ms giữa các requests
      if (i < 5) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
    } catch (error) {
      console.log(`   ❌ Thất bại: ${error.message}`);
      failCount++;
      
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log(`   ⚠️  Đã chạm rate limit tại request ${i}`);
        break;
      }
    }
  }
  
  console.log('\n📊 Kết quả Rate Limit Test:');
  console.log(`   ✅ Thành công: ${successCount}/5`);
  console.log(`   ❌ Thất bại: ${failCount}/5`);
  
  if (failCount > 0) {
    console.log('\n⚠️  CẢNH BÁO: Phát hiện rate limit!');
    console.log('💡 Khuyến nghị:');
    console.log('   - Thêm delay giữa các requests trong production');
    console.log('   - Implement caching để giảm số lượng API calls');
    console.log('   - Xem xét nâng cấp quota nếu cần');
  } else {
    console.log('\n✅ Không phát hiện rate limit trong test');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ HOÀN THÀNH TEST');
  console.log('='.repeat(60));
}

testChatAPI().catch(error => {
  console.error('\n💥 LỖI NGHIÊM TRỌNG:', error);
});
