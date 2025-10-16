import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('🔑 API Key:', apiKey);
  console.log('📏 Length:', apiKey?.length);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    console.log('\n🚀 Testing gemini-2.0-flash-exp...');
    const result = await model.generateContent("Chào bạn! Hãy giới thiệu về bản thân bằng tiếng Việt.");
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! Gemini API đã kết nối thành công!');
    console.log('\n📝 Response:');
    console.log(text);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Details:', error);
  }
}

testGemini();
