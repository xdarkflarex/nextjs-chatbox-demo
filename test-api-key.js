// Test API key directly with REST API
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

async function testAPIKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('API Key:', apiKey);
  console.log('API Key length:', apiKey?.length);
  
  if (!apiKey) {
    console.error('No API key found');
    return;
  }

  // Test 1: List models
  console.log('\n📋 Testing: List available models...');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API Key is valid!');
      console.log('Available models:');
      data.models?.slice(0, 5).forEach(model => {
        console.log(`  - ${model.name}`);
      });
    } else {
      console.error('❌ API Key test failed:');
      console.error('Status:', response.status);
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }

  // Test 2: Generate content with gemini-1.5-pro
  console.log('\n💬 Testing: Generate content with gemini-1.5-pro...');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say hello in Vietnamese' }] }]
        })
      }
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Generate content works!');
      console.log('Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.error('❌ Generate content failed:');
      console.error('Status:', response.status);
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testAPIKey();
