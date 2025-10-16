// Kiểm tra trạng thái Gemini API - Phát hiện lỗi rate limit và các vấn đề khác
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkGeminiStatus() {
  console.log('='.repeat(60));
  console.log('🔍 KIỂM TRA TRẠNG THÁI GEMINI API');
  console.log('='.repeat(60));
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  // 1. Kiểm tra API Key
  console.log('\n📋 BƯỚC 1: Kiểm tra API Key');
  console.log('─'.repeat(60));
  console.log('✓ API Key tồn tại:', !!apiKey);
  console.log('✓ Độ dài API Key:', apiKey?.length || 0);
  console.log('✓ API Key (10 ký tự đầu):', apiKey?.substring(0, 10));
  console.log('✓ API Key (10 ký tự cuối):', apiKey?.substring(apiKey.length - 10));
  
  if (!apiKey) {
    console.error('\n❌ LỖI: Không tìm thấy GEMINI_API_KEY trong file .env.local');
    console.log('\n💡 Hướng dẫn:');
    console.log('   1. Tạo file .env.local trong thư mục gốc');
    console.log('   2. Thêm dòng: GEMINI_API_KEY=your_api_key_here');
    console.log('   3. Lấy API key tại: https://aistudio.google.com/app/apikey');
    return;
  }

  // 2. Test các models khác nhau
  const models = [
    { name: 'gemini-2.0-flash-exp', desc: 'Gemini 2.0 Flash (Experimental - Mới nhất)' },
    { name: 'gemini-1.5-flash', desc: 'Gemini 1.5 Flash (Nhanh, miễn phí)' },
    { name: 'gemini-1.5-pro', desc: 'Gemini 1.5 Pro (Mạnh hơn)' },
    { name: 'gemini-pro', desc: 'Gemini Pro (Cũ)' }
  ];
  
  console.log('\n📋 BƯỚC 2: Test các models');
  console.log('─'.repeat(60));
  
  let successCount = 0;
  let failedModels = [];
  
  for (const modelInfo of models) {
    try {
      console.log(`\n🔄 Đang test: ${modelInfo.name}`);
      console.log(`   Mô tả: ${modelInfo.desc}`);
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelInfo.name });
      
      const startTime = Date.now();
      const result = await model.generateContent("Chào bạn, hãy trả lời ngắn gọn bằng tiếng Việt");
      const response = await result.response;
      const text = response.text();
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ THÀNH CÔNG (${duration}ms)`);
      console.log(`   📝 Phản hồi: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      successCount++;
      
    } catch (error) {
      console.log(`   ❌ THẤT BẠI`);
      console.log(`   📛 Lỗi: ${error.message}`);
      
      // Phân tích lỗi chi tiết
      if (error.status) {
        console.log(`   📊 HTTP Status: ${error.status}`);
      }
      
      // Kiểm tra các loại lỗi phổ biến
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log(`   ⚠️  NGUYÊN NHÂN: Đã vượt quá giới hạn sử dụng (Rate Limit/Quota)`);
        console.log(`   💡 GIẢI PHÁP:`);
        console.log(`      - Đợi một lúc rồi thử lại (thường reset sau 1 phút)`);
        console.log(`      - Kiểm tra quota tại: https://aistudio.google.com/app/apikey`);
        console.log(`      - Tạo API key mới nếu cần`);
      } else if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
        console.log(`   ⚠️  NGUYÊN NHÂN: API Key không hợp lệ`);
        console.log(`   💡 GIẢI PHÁP:`);
        console.log(`      - Kiểm tra lại API key`);
        console.log(`      - Tạo API key mới tại: https://aistudio.google.com/app/apikey`);
      } else if (error.message?.includes('model') || error.message?.includes('not found')) {
        console.log(`   ⚠️  NGUYÊN NHÂN: Model không tồn tại hoặc chưa được kích hoạt`);
      } else if (error.message?.includes('blocked') || error.message?.includes('safety')) {
        console.log(`   ⚠️  NGUYÊN NHÂN: Nội dung bị chặn bởi bộ lọc an toàn`);
      } else {
        console.log(`   ⚠️  NGUYÊN NHÂN: Lỗi không xác định`);
      }
      
      failedModels.push({ name: modelInfo.name, error: error.message });
    }
  }
  
  // 3. Tổng kết
  console.log('\n' + '='.repeat(60));
  console.log('📊 TỔNG KẾT');
  console.log('='.repeat(60));
  console.log(`✅ Thành công: ${successCount}/${models.length} models`);
  console.log(`❌ Thất bại: ${failedModels.length}/${models.length} models`);
  
  if (failedModels.length > 0) {
    console.log('\n❌ Các models thất bại:');
    failedModels.forEach(m => {
      console.log(`   - ${m.name}: ${m.error}`);
    });
  }
  
  // 4. Khuyến nghị
  console.log('\n💡 KHUYẾN NGHỊ:');
  if (successCount === 0) {
    console.log('   ⚠️  TẤT CẢ MODELS ĐỀU THẤT BẠI!');
    console.log('   🔧 Hành động cần làm:');
    console.log('      1. Kiểm tra kết nối internet');
    console.log('      2. Kiểm tra API key tại: https://aistudio.google.com/app/apikey');
    console.log('      3. Tạo API key mới nếu key hiện tại bị vô hiệu hóa');
    console.log('      4. Kiểm tra quota/rate limit của API key');
    console.log('      5. Đợi 1-5 phút nếu bị rate limit rồi chạy lại script này');
  } else if (successCount < models.length) {
    console.log('   ⚠️  MỘT SỐ MODELS THẤT BẠI');
    console.log('   🔧 Khuyến nghị:');
    console.log('      - Sử dụng model thành công cho ứng dụng');
    console.log('      - Cập nhật code để dùng model đang hoạt động');
  } else {
    console.log('   ✅ TẤT CẢ MODELS HOẠT ĐỘNG BÌNH THƯỜNG!');
    console.log('   🎉 API key của bạn đang hoạt động tốt');
  }
  
  // 5. Test rate limit
  console.log('\n📋 BƯỚC 3: Test Rate Limit (gửi 3 requests liên tiếp)');
  console.log('─'.repeat(60));
  
  const testModel = 'gemini-1.5-flash'; // Model phổ biến nhất
  let rateLimitHit = false;
  
  for (let i = 1; i <= 3; i++) {
    try {
      console.log(`\n🔄 Request ${i}/3...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: testModel });
      
      const startTime = Date.now();
      const result = await model.generateContent(`Test ${i}: Trả lời ngắn gọn số ${i}`);
      const response = await result.response;
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Thành công (${duration}ms)`);
      
      // Đợi 500ms giữa các requests
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.log(`   ❌ Thất bại: ${error.message}`);
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        rateLimitHit = true;
        console.log(`   ⚠️  ĐÃ CHẠM RATE LIMIT tại request ${i}!`);
        break;
      }
    }
  }
  
  if (rateLimitHit) {
    console.log('\n⚠️  PHÁT HIỆN RATE LIMIT!');
    console.log('💡 Giải pháp:');
    console.log('   - Thêm delay giữa các requests trong code');
    console.log('   - Giảm số lượng requests');
    console.log('   - Nâng cấp lên API key có quota cao hơn');
    console.log('   - Đợi quota reset (thường là 1 phút)');
  } else {
    console.log('\n✅ Không phát hiện rate limit trong test ngắn hạn');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ HOÀN THÀNH KIỂM TRA');
  console.log('='.repeat(60));
}

// Chạy kiểm tra
checkGeminiStatus().catch(error => {
  console.error('\n💥 LỖI NGHIÊM TRỌNG:', error);
  console.error('Stack trace:', error.stack);
});
