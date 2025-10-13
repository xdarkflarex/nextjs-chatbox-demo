/**
 * Test RAG + Gemini API Integration
 * Kiểm tra xem hệ thống RAG có kết nối đúng với Gemini API không
 */

import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import Fuse from "fuse.js";

dotenv.config({ path: '.env.local' });

// Load RAG data
const ragDataPath = path.join(process.cwd(), 'app', 'public', 'data', 'rag_all.json');
const ragData = JSON.parse(fs.readFileSync(ragDataPath, 'utf-8'));

console.log('='.repeat(80));
console.log('🧪 TEST RAG + GEMINI API INTEGRATION');
console.log('='.repeat(80));

// Test cases
const testCases = [
  {
    name: "Test 1: Câu hỏi của phụ huynh",
    userType: "parent",
    question: "Con tôi chơi game nhiều quá, tôi phải làm sao?",
    expectedAudience: "parent",
    expectedIntent: "parenting"
  },
  {
    name: "Test 2: Câu hỏi của học sinh",
    userType: "student", 
    question: "Em bị bạn bè trêu chọc, em nên làm gì?",
    expectedAudience: "student",
    expectedIntent: "student_support"
  },
  {
    name: "Test 3: Câu hỏi về học tập",
    userType: "student",
    question: "Em lo lắng trước kỳ thi, em phải làm sao?",
    expectedAudience: "student",
    expectedIntent: "student_support"
  },
  {
    name: "Test 4: Câu hỏi về gia đình",
    userType: "parent",
    question: "Con tôi hay cãi lời, tôi nên xử lý thế nào?",
    expectedAudience: "parent",
    expectedIntent: "parenting"
  }
];

// Function: Filter RAG by audience
function filterByAudience(userType) {
  return ragData.filter(entry => 
    entry.audience === userType || entry.audience === null
  );
}

// Function: Smart search using Fuse.js
function smartSearch(query, entries, limit = 5) {
  const fuse = new Fuse(entries, {
    keys: [
      { name: 'meta.question', weight: 0.7 },
      { name: 'meta.answer', weight: 0.2 },
      { name: 'text', weight: 0.1 }
    ],
    threshold: 0.4,
    includeScore: true
  });

  const results = fuse.search(query);
  return results.slice(0, limit).map(r => r.item);
}

// Function: Call Gemini API
async function callGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Function: Build context from RAG
function buildContext(entries) {
  if (entries.length === 0) return "Không tìm thấy thông tin liên quan.";
  
  return entries.map((entry, idx) => {
    const question = entry.meta?.question || 'N/A';
    const answer = entry.meta?.answer || entry.text;
    return `[${idx + 1}] Câu hỏi: ${question}\nTrả lời: ${answer}`;
  }).join('\n\n');
}

// Main test function
async function runTest(testCase) {
  console.log('\n' + '─'.repeat(80));
  console.log(`📝 ${testCase.name}`);
  console.log('─'.repeat(80));
  console.log(`Câu hỏi: "${testCase.question}"`);
  console.log(`User type: ${testCase.userType}`);
  
  try {
    // Step 1: Filter by audience
    console.log('\n[Step 1] Filtering RAG by audience...');
    const filteredData = filterByAudience(testCase.userType);
    console.log(`✓ Filtered: ${filteredData.length} entries (from ${ragData.length} total)`);
    
    // Verify filtering
    const audienceCount = filteredData.filter(e => e.audience === testCase.expectedAudience).length;
    console.log(`  - Entries with audience="${testCase.expectedAudience}": ${audienceCount}`);
    
    // Step 2: Smart search
    console.log('\n[Step 2] Smart searching relevant entries...');
    const relevantEntries = smartSearch(testCase.question, filteredData, 3);
    console.log(`✓ Found ${relevantEntries.length} relevant entries`);
    
    relevantEntries.forEach((entry, idx) => {
      console.log(`  ${idx + 1}. [${entry.audience || 'null'}/${entry.intent || 'null'}] ${entry.title}`);
      console.log(`     Tags: ${entry.tags?.join(', ') || 'none'}`);
    });
    
    // Verify entries match expected audience
    const matchingAudience = relevantEntries.filter(e => 
      e.audience === testCase.expectedAudience || e.audience === null
    ).length;
    console.log(`  ✓ Entries matching expected audience: ${matchingAudience}/${relevantEntries.length}`);
    
    // Step 3: Build context
    console.log('\n[Step 3] Building context from RAG...');
    const context = buildContext(relevantEntries);
    console.log(`✓ Context built (${context.length} characters)`);
    
    // Step 4: Create prompt
    const userTypeVN = testCase.userType === 'parent' ? 'phụ huynh' : 'học sinh';
    const prompt = `Bạn là trợ lý tâm lý học đường cho ${userTypeVN}.

Dựa vào thông tin sau từ cơ sở dữ liệu:

${context}

Câu hỏi: ${testCase.question}

Hãy trả lời một cách thấu hiểu, ngắn gọn và hữu ích. Sử dụng thông tin từ cơ sở dữ liệu nhưng diễn đạt tự nhiên.`;

    console.log('\n[Step 4] Calling Gemini API...');
    const startTime = Date.now();
    const response = await callGeminiAPI(prompt);
    const duration = Date.now() - startTime;
    
    console.log(`✓ Response received in ${duration}ms`);
    console.log('\n📤 GEMINI RESPONSE:');
    console.log('─'.repeat(80));
    console.log(response);
    console.log('─'.repeat(80));
    
    // Validation
    console.log('\n[Validation]');
    console.log(`✓ Response length: ${response.length} characters`);
    console.log(`✓ Response time: ${duration}ms`);
    console.log(`✓ Context used: ${relevantEntries.length} entries`);
    console.log(`✓ Audience filter: ${testCase.userType}`);
    
    return {
      success: true,
      response,
      duration,
      entriesUsed: relevantEntries.length,
      audienceMatched: matchingAudience === relevantEntries.length
    };
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n📊 RAG Database Stats:');
  console.log(`Total entries: ${ragData.length}`);
  
  const byAudience = {};
  const byIntent = {};
  ragData.forEach(entry => {
    const aud = entry.audience || 'null';
    const int = entry.intent || 'null';
    byAudience[aud] = (byAudience[aud] || 0) + 1;
    byIntent[int] = (byIntent[int] || 0) + 1;
  });
  
  console.log('\nBy Audience:');
  Object.entries(byAudience).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  
  console.log('\nBy Intent:');
  Object.entries(byIntent).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  
  // Check API key
  console.log('\n🔑 API Key Check:');
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`API Key exists: ${!!apiKey}`);
  console.log(`API Key length: ${apiKey?.length || 0}`);
  
  if (!apiKey) {
    console.error('\n❌ GEMINI_API_KEY not found in .env.local');
    console.error('Please add your API key to .env.local file');
    process.exit(1);
  }
  
  // Run tests
  const results = [];
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({ testCase, result });
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success).length;
  
  console.log(`Total tests: ${results.length}`);
  console.log(`✓ Passed: ${successful}`);
  console.log(`✗ Failed: ${failed}`);
  
  if (successful === results.length) {
    console.log('\n🎉 ALL TESTS PASSED! RAG + Gemini integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  // Performance stats
  const successfulResults = results.filter(r => r.result.success);
  if (successfulResults.length > 0) {
    const avgDuration = successfulResults.reduce((sum, r) => sum + r.result.duration, 0) / successfulResults.length;
    const avgEntries = successfulResults.reduce((sum, r) => sum + r.result.entriesUsed, 0) / successfulResults.length;
    
    console.log('\n📈 Performance Stats:');
    console.log(`Average response time: ${avgDuration.toFixed(0)}ms`);
    console.log(`Average entries used: ${avgEntries.toFixed(1)}`);
  }
  
  console.log('\n' + '='.repeat(80));
}

// Run
runAllTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
