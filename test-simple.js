import dotenv from "dotenv";
import fs from "fs";
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing API Key:', apiKey);

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    console.log('\n=== API Response ===');
    if (data.error) {
      console.log('ERROR:', data.error);
    } else if (data.models) {
      console.log('✅ API Key is VALID!');
      console.log('\nAvailable models that support generateContent:');
      data.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .forEach(m => console.log(`  - ${m.name}`));
    }
    fs.writeFileSync('api-response.json', JSON.stringify(data, null, 2));
    console.log('\nFull response saved to api-response.json');
  })
  .catch(err => console.error('Error:', err));
