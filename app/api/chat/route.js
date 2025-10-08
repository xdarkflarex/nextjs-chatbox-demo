import fs from "fs";
import path from "path";
import Fuse from "fuse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function callGeminiAPI(prompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY');
      return 'Đang tạm thời không thể kết nối dịch vụ AI. Vui lòng thử lại sau.';
    }

    // Khởi tạo Gemini AI với API key
    const genAI = new GoogleGenerativeAI(apiKey);
    // Sử dụng model mới nhất: gemini-2.0-flash (nhanh và miễn phí)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    console.log('Calling Gemini API with prompt length:', String(prompt).length);

    // Gọi API để tạo nội dung
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini response received successfully');
    return text;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Xử lý các loại lỗi cụ thể
    if (error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID')) {
      return 'Lỗi xác thực API key. Vui lòng kiểm tra cấu hình.';
    }
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return 'Đã vượt quá giới hạn sử dụng API. Vui lòng thử lại sau.';
    }
    if (error.message?.includes('blocked') || error.message?.includes('safety')) {
      return 'Xin lỗi, nội dung này không thể được xử lý. Vui lòng thử câu hỏi khác.';
    }
    
    return `Đã xảy ra lỗi khi xử lý yêu cầu: ${error.message}`;
  }
}

// Hàm phát hiện mức độ khẩn cấp
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

// Hàm trích xuất Q&A từ text
function extractQA(text) {
  const qMatch = text.match(/Câu hỏi thường gặp:\s*([^\n]+)/);
  const aMatch = text.match(/Câu trả lời mẫu:\s*(.+?)(?=\nNgười dùng mục tiêu:|$)/s);
  
  return {
    question: qMatch ? qMatch[1].trim() : '',
    answer: aMatch ? aMatch[1].trim() : ''
  };
}

// Hàm tìm kiếm RAG nâng cao
function searchRAG(userQuery, ragData) {
  // Chuẩn hóa input
  function normalize(str) {
    return str.toLowerCase()
      .replace(/[.,!?;:()\[\]"'\-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  const normalizedQuery = normalize(userQuery);
  
  // 1. Lấy policies và scenarios quan trọng
  const policies = ragData.filter(item => 
    item.type === 'policy' && item.title && 
    (item.title.includes('POLICY') || item.title.includes('ESCALATION'))
  );
  
  // 2. Tìm kiếm trong FAQ (Excel rows)
  const faqs = ragData.filter(item => 
    item.type === 'row' && 
    item.text && 
    item.text.includes('Câu hỏi thường gặp')
  );
  
  // Chuẩn bị dữ liệu cho Fuse.js
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
  
  // Tìm kiếm với Fuse.js (fuzzy matching)
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
  
  // 3. Tìm kiếm templates phù hợp
  const templates = ragData.filter(item => 
    item.type === 'template' && 
    item.text
  );
  
  // 4. Tìm scenarios phù hợp theo level
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

// Hàm xây dựng context cho AI
function buildAIContext(searchResults, userQuery) {
  const { level, policies, topMatches, templates, scenarios } = searchResults;
  
  let context = '';
  
  // 1. Thêm policy và quy định
  if (policies.length > 0) {
    context += '=== QUY ĐỊNH VÀ NGUYÊN TẮC ===\n';
    policies.forEach(p => {
      context += `${p.text}\n\n`;
    });
  }
  
  // 2. Thêm thông tin về mức độ
  context += `=== MỨC ĐỘ TÌNH HUỐNG: ${level.toUpperCase()} ===\n`;
  if (level === 'red') {
    context += 'CẢNH BÁO: Đây là tình huống KHẨN CẤP cần chuyển tuyến ngay!\n';
    context += 'Liên hệ: GVCN 0xxx-xxx-xxx, Tổng đài 111\n\n';
  } else if (level === 'yellow') {
    context += 'LƯU Ý: Tình huống cần theo dõi và có thể cần gặp GVCN/CVTL\n\n';
  } else {
    context += 'Tình huống có thể tự trợ giúp với hướng dẫn phù hợp\n\n';
  }
  
  // 3. Thêm các câu trả lời tương tự nhất
  if (topMatches.length > 0) {
    context += '=== CÁC TÌNH HUỐNG TƯƠNG TỰ ===\n';
    topMatches.forEach((match, idx) => {
      const item = match.item;
      context += `\n[Tình huống ${idx + 1}] (Độ khớp: ${(1 - match.score).toFixed(2)})\n`;
      context += `Câu hỏi: ${item.question}\n`;
      context += `Trả lời: ${item.answer}\n`;
    });
    context += '\n';
  }
  
  // 4. Thêm templates nếu có liên quan
  const relevantTemplates = templates.filter(t => {
    const tLower = t.text.toLowerCase();
    const qLower = userQuery.toLowerCase();
    return (
      (qLower.includes('kế hoạch') && tLower.includes('kế hoạch')) ||
      (qLower.includes('ôn') && tLower.includes('ôn')) ||
      (qLower.includes('tập trung') && tLower.includes('timebox')) ||
      (qLower.includes('xung đột') && tLower.includes('conflict'))
    );
  });
  
  if (relevantTemplates.length > 0) {
    context += '=== MẪU HƯỚNG DẪN ===\n';
    relevantTemplates.forEach(t => {
      context += `${t.text}\n\n`;
    });
  }
  
  return context;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const messages = body?.messages ?? [];
  const userRole = body?.userRole || 'student'; // 'student', 'teacher', 'parent'
  const isEmergency = body?.isEmergency || false;
  const last = messages[messages.length - 1]?.content || "";

  if (!last || last.trim() === "") {
    return new Response(JSON.stringify({ 
      reply: "Chào bạn! Mình là trợ lý AI của trường. Bạn có thể chia sẻ điều gì đang băn khoăn không?" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  // Đọc file RAG
  const ragPath = path.join(process.cwd(), "app/public/data/rag_all.json");
  let ragData = [];
  try {
    ragData = JSON.parse(fs.readFileSync(ragPath, "utf8"));
    console.log(`Loaded ${ragData.length} RAG entries`);
  } catch (error) {
    console.error('Error loading RAG data:', error);
  }

  // Tìm kiếm RAG
  const searchResults = searchRAG(last, ragData);
  console.log('Search results:', {
    level: searchResults.level,
    topMatchesCount: searchResults.topMatches.length,
    topMatch: searchResults.topMatches[0]?.item?.question
  });

  // Xây dựng context cho AI
  const context = buildAIContext(searchResults, last);
  const level = searchResults.level;
  
  // Tùy chỉnh prompt theo vai trò
  const roleConfig = {
    student: {
      title: 'HỌC SINH',
      tone: 'Thân thiện, tôn trọng, không phán xét, gọi học sinh là "em"',
      focus: 'học tập, tâm lý, kỹ năng sống, và các vấn đề học đường',
      specialNote: '- Nếu phát hiện dấu hiệu tâm lý nặng (tự hại, bạo lực, lạm dụng): Thu thập thông tin học sinh (tên, lớp) và khuyến nghị liên hệ GVCN/phụ huynh ngay\n- Nếu là vấn đề học tập: Đưa ra lời khuyên cụ thể, khả thi'
    },
    teacher: {
      title: 'GIÁO VIÊN',
      tone: 'Chuyên nghiệp, hỗ trợ, tôn trọng, xưng hô "thầy/cô" và "mình"',
      focus: 'phương pháp giảng dạy, quản lý lớp học, xử lý tình huống học sinh, quy định nhà trường',
      specialNote: '- Cung cấp các phương pháp sư phạm hiện đại\n- Gợi ý cách xử lý tình huống cụ thể với học sinh\n- Hướng dẫn quy trình hành chính nếu cần'
    },
    parent: {
      title: 'PHỤ HUYNH',
      tone: 'Tôn trọng, thấu hiểu, hỗ trợ, xưng hô "phụ huynh" và "mình"',
      focus: 'theo dõi học tập của con, giao tiếp với nhà trường, hỗ trợ con học tập và phát triển',
      specialNote: '- Hướng dẫn cách theo dõi và hỗ trợ con học tập tại nhà\n- Gợi ý cách giao tiếp với giáo viên và nhà trường\n- Tư vấn về tâm lý và phát triển của trẻ THCS'
    }
  };

  const config = roleConfig[userRole] || roleConfig.student;

  // Tạo prompt cho Gemini
  let prompt = '';
  
  if (isEmergency) {
    // Prompt đặc biệt cho tình huống khẩn cấp
    prompt = `${context}

=== TÌNH HUỐNG KHẨN CẤP ===
Đây là tình huống khẩn cấp từ ${config.title}

Lịch sử hội thoại:
${messages.map(m => `${m.role === 'user' ? 'Người dùng' : 'AI'}: ${m.content}`).join('\n')}

Câu hỏi/Thông tin mới nhất:
${last}

=== HƯỚNG DẪN XỬ LÝ KHẨN CẤP ===
- Vai trò: Trợ lý AI xử lý tình huống khẩn cấp cho ${config.title}
- Giọng điệu: ${config.tone}, nhưng thêm sự quan tâm và khẩn trương
- MỨC ĐỘ: ${level.toUpperCase()} - KHẨN CẤP

NHIỆM VỤ:
1. Thu thập thông tin quan trọng (nếu chưa có):
   ${userRole === 'student' ? '- Tên học sinh\n   - Lớp\n   - Vấn đề cụ thể\n   - Mức độ nguy hiểm' : ''}
   ${userRole === 'teacher' ? '- Tình huống cụ thể\n   - Học sinh liên quan (nếu có)\n   - Mức độ nghiêm trọng' : ''}
   ${userRole === 'parent' ? '- Tên và lớp của con\n   - Vấn đề cụ thể\n   - Mức độ khẩn cấp' : ''}

2. Đánh giá mức độ nghiêm trọng:
   - RED (Cực kỳ khẩn cấp): Tự hại, bạo lực, nguy hiểm tính mạng → Yêu cầu liên hệ ngay 111 hoặc GVCN
   - YELLOW (Khẩn cấp): Cần can thiệp trong 24h → Đề xuất gặp GVCN/tâm lý
   - GREEN (Quan trọng): Cần theo dõi → Hướng dẫn và hẹn gặp

3. Đưa ra hành động cụ thể:
   - Số điện thoại liên hệ khẩn cấp
   - Bước tiếp theo rõ ràng
   - Động viên và đảm bảo sẽ được hỗ trợ

4. Tổng hợp thông tin đã thu thập được (nếu có) ở cuối câu trả lời theo format:
   [THÔNG TIN THU THẬP]
   - Tên: ...
   - Lớp: ...
   - Vấn đề: ...
   - Mức độ: ...
   [/THÔNG TIN THU THẬP]

Hãy trả lời một cách thấu hiểu, khẩn trương nhưng không gây hoảng loạn:`;
  } else {
    // Prompt bình thường
    prompt = `${context}

=== CÂU HỎI CỦA ${config.title} ===
${last}

=== HƯỚNG DẪN TRẢ LỜI ===
- Vai trò: Trợ lý AI hỗ trợ ${config.title} về ${config.focus}
- Giọng điệu: ${config.tone}
- Dựa trên các tình huống tương tự và quy định trường học ở trên
- Mức độ tình huống: ${level.toUpperCase()}
  ${level === 'red' ? '→ Ưu tiên an toàn, đề xuất liên hệ người lớn/chuyên gia ngay' : ''}
  ${level === 'yellow' ? '→ Gợi ý giải pháp và khuyến nghị gặp GVCN/chuyên viên tâm lý' : ''}
  ${level === 'green' ? '→ Cung cấp hướng dẫn cụ thể và động viên' : ''}

LƯU Ý ĐỐI VỚI ${config.title}:
${config.specialNote}

- Trả lời ngắn gọn (3-5 câu), có bước hành động rõ ràng
- Kết thúc bằng câu hỏi mở hoặc lời động viên phù hợp

Hãy trả lời:`;
  }

  // Gọi Gemini API
  const aiReply = await callGeminiAPI(prompt);
  
  return new Response(JSON.stringify({ 
    reply: aiReply,
    metadata: {
      level: searchResults.level,
      matchCount: searchResults.topMatches.length,
      topMatch: searchResults.topMatches[0]?.item?.question || null
    }
  }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}
