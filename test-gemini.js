// Test Gemini API connection
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key (first 10 chars):', apiKey?.substring(0, 10));
  
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY not found in environment');
    return;
  }

  // Try different model names
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  for (const modelName of models) {
    try {
      console.log(`\n🔄 Testing model: ${modelName}`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent("Say hello in Vietnamese");
      const response = await result.response;
      const text = response.text();
      
      console.log(`\n✅ SUCCESS with ${modelName}!`);
      console.log('Response:', text);
      break; // Stop if successful
    } catch (error) {
      console.error(`\n❌ FAILED with ${modelName}:`, error.message);
      if (error.status) console.error('Status:', error.status);
    }
  }
}

testGemini();
