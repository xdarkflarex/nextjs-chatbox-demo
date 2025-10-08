// Test RAG implementation
const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');

// Load RAG data
const ragPath = path.join(__dirname, 'app/public/data/rag_all.json');
const ragData = JSON.parse(fs.readFileSync(ragPath, 'utf8'));

console.log(`✓ Loaded ${ragData.length} RAG entries\n`);

// Test escalation detection
function detectEscalationLevel(text) {
  const redKeywords = [
    'tự hại', 'tự tử', 'muốn chết', 'không muốn sống', 'tự làm đau', 
    'bạo lực', 'đánh đập', 'lạm dụng', 'bị hành hạ', 'bị đe dọa',
    'nguy hiểm', 'khẩn cấp', 'cứu em', 'help me'
  ];
  
  const yellowKeywords = [
    'căng thẳng', 'áp lực', 'stress', 'lo lắng kéo dài', 'mất ngủ nhiều ngày',
    'bị bắt nạt', 'bị tẩy chay', 'bị trêu chọc', 'mâu thuẫn', 'xung đột',
    'cãi nhau', 'bố mẹ cãi nhau', 'gia đình', 'buồn nhiều ngày'
  ];
  
  const lowerText = text.toLowerCase();
  
  if (redKeywords.some(kw => lowerText.includes(kw))) {
    return 'red';
  }
  if (yellowKeywords.some(kw => lowerText.includes(kw))) {
    return 'yellow';
  }
  return 'green';
}

// Extract Q&A
function extractQA(text) {
  const qMatch = text.match(/Câu hỏi thường gặp:\s*([^\n]+)/);
  const aMatch = text.match(/Câu trả lời mẫu:\s*(.+?)(?=\nNgười dùng mục tiêu:|$)/s);
  
  return {
    question: qMatch ? qMatch[1].trim() : '',
    answer: aMatch ? aMatch[1].trim() : ''
  };
}

// Search RAG
function searchRAG(userQuery, ragData) {
  function normalize(str) {
    return str.toLowerCase()
      .replace(/[.,!?;:()\[\]"'\-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  const normalizedQuery = normalize(userQuery);
  
  const policies = ragData.filter(item => 
    item.type === 'policy' && item.title && 
    (item.title.includes('POLICY') || item.title.includes('ESCALATION'))
  );
  
  const faqs = ragData.filter(item => 
    item.type === 'row' && 
    item.text && 
    item.text.includes('Câu hỏi thường gặp')
  );
  
  const fuseData = faqs.map(item => {
    const qa = extractQA(item.text);
    return {
      ...item,
      normText: normalize(item.text),
      normQuestion: normalize(qa.question),
      question: qa.question,
      answer: qa.answer
    };
  });
  
  const fuse = new Fuse(fuseData, {
    keys: [
      { name: 'normQuestion', weight: 0.7 },
      { name: 'normText', weight: 0.3 }
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 3
  });
  
  const fuseResults = fuse.search(normalizedQuery);
  
  const templates = ragData.filter(item => 
    item.type === 'template' && 
    item.text
  );
  
  const level = detectEscalationLevel(userQuery);
  const scenarios = ragData.filter(item => 
    item.type === 'scenario' && 
    item.level === level
  );
  
  return {
    level,
    policies,
    topMatches: fuseResults.slice(0, 3),
    templates,
    scenarios,
    allFaqs: fuseData
  };
}

// Test cases
const testCases = [
  {
    name: "GREEN - Học tập cơ bản",
    query: "Em cảm thấy lo lắng trước kỳ thi, em phải làm sao?"
  },
  {
    name: "GREEN - Phương pháp học",
    query: "Em học hoài nhưng không nhớ, có cách nào không?"
  },
  {
    name: "YELLOW - Bị bắt nạt",
    query: "Em bị bạn bè trêu chọc và tẩy chay"
  },
  {
    name: "YELLOW - Áp lực gia đình",
    query: "Bố mẹ em cãi nhau nhiều, em thấy căng thẳng lắm"
  },
  {
    name: "RED - Khẩn cấp",
    query: "Em cảm thấy không muốn sống nữa"
  },
  {
    name: "Kế hoạch học tập",
    query: "Em muốn lập kế hoạch ôn thi 7 ngày"
  }
];

console.log("=".repeat(70));
console.log("TESTING RAG ALGORITHM");
console.log("=".repeat(70));

testCases.forEach((testCase, idx) => {
  console.log(`\n[TEST ${idx + 1}] ${testCase.name}`);
  console.log(`Query: "${testCase.query}"`);
  console.log("-".repeat(70));
  
  const results = searchRAG(testCase.query, ragData);
  
  console.log(`✓ Escalation Level: ${results.level.toUpperCase()}`);
  console.log(`✓ Policies found: ${results.policies.length}`);
  console.log(`✓ Top matches: ${results.topMatches.length}`);
  console.log(`✓ Templates: ${results.templates.length}`);
  console.log(`✓ Scenarios: ${results.scenarios.length}`);
  
  if (results.topMatches.length > 0) {
    console.log(`\n  Top Match (Score: ${(1 - results.topMatches[0].score).toFixed(2)}):`);
    console.log(`  Q: ${results.topMatches[0].item.question.substring(0, 80)}...`);
    console.log(`  A: ${results.topMatches[0].item.answer.substring(0, 100)}...`);
  }
  
  console.log();
});

console.log("=".repeat(70));
console.log("✓ All tests completed successfully!");
console.log("=".repeat(70));
