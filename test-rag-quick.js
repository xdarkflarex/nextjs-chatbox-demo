/**
 * Quick RAG + Gemini Test
 * Test nhanh để kiểm tra RAG có hoạt động với Gemini không
 */

import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

dotenv.config({ path: '.env.local' });

console.log('🧪 QUICK RAG + GEMINI TEST\n');

// Load RAG data
const ragDataPath = path.join(process.cwd(), 'app', 'public', 'data', 'rag_all.json');
const ragData = JSON.parse(fs.readFileSync(ragDataPath, 'utf-8'));

console.log(`✓ Loaded ${ragData.length} entries from RAG database`);

// Check API key
const apiKey = process.env.GEMINI_API_KEY;
console.log(`✓ API Key: ${apiKey ? 'Found' : 'NOT FOUND'}`);

if (!apiKey) {
  console.error('\n❌ Please add GEMINI_API_KEY to .env.local file');
  process.exit(1);
}

// Test question
const testQuestion = "Con tôi chơi game nhiều, tôi phải làm sao?";
console.log(`\n📝 Test question: "${testQuestion}"`);

// Filter parent entries
const parentEntries = ragData.filter(e => e.audience === 'parent');
console.log(`✓ Found ${parentEntries.length} parent entries`);

// Find relevant entry (simple keyword search)
const relevantEntry = parentEntries.find(e => 
  e.meta?.question?.toLowerCase().includes('game') ||
  e.meta?.question?.toLowerCase().includes('chơi')
);

if (!relevantEntry) {
  console.error('❌ No relevant entry found');
  process.exit(1);
}

console.log(`✓ Found relevant entry: "${relevantEntry.meta.question}"`);

// Build prompt
const context = `Câu hỏi tương tự: ${relevantEntry.meta.question}
Trả lời mẫu: ${relevantEntry.meta.answer}`;

const prompt = `Bạn là trợ lý tâm lý học đường cho phụ huynh.

Dựa vào thông tin sau:
${context}

Câu hỏi: ${testQuestion}

Hãy trả lời ngắn gọn và hữu ích.`;

console.log('\n🤖 Calling Gemini API...');

// Call Gemini
async function test() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const duration = Date.now() - startTime;
    
    console.log(`✓ Response received in ${duration}ms\n`);
    console.log('─'.repeat(60));
    console.log('📤 RESPONSE:');
    console.log('─'.repeat(60));
    console.log(text);
    console.log('─'.repeat(60));
    
    console.log('\n✅ TEST PASSED! RAG + Gemini is working correctly.');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
