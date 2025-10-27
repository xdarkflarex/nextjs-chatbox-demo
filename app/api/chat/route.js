import fs from "fs";
import path from "path";
import Fuse from "fuse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextApiKey, markKeyError, resetKeyErrors } from "../../../lib/gemini-rotator.js";

async function callGeminiAPI(prompt) {
  const maxRetries = 3;
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let currentApiKey = null;
    
    try {
      // Lấy API key tiếp theo (rotation)
      currentApiKey = getNextApiKey();
      
      if (!currentApiKey) {
        console.error('❌ Missing GEMINI_API_KEY in .env.local');
        return 'Đang tạm thời không thể kết nối dịch vụ AI. Vui lòng thử lại sau.';
      }

      // Khởi tạo Gemini AI với API key
      const genAI = new GoogleGenerativeAI(currentApiKey);
      // Sử dụng model mới nhất: gemini-2.0-flash-exp
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      console.log(`🔄 Attempt ${attempt}/${maxRetries} - Calling Gemini 2.0 Flash with prompt length:`, String(prompt).length);

      // Gọi API để tạo nội dung
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini 2.0 Flash response received successfully');
      
      // Reset error count khi thành công
      resetKeyErrors(currentApiKey);
      
      return text;

    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      // Xử lý các loại lỗi cụ thể
      if (error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID')) {
        return 'Lỗi xác thực API key. Vui lòng kiểm tra cấu hình.';
      }
      if (error.message?.includes('blocked') || error.message?.includes('safety')) {
        return 'Xin lỗi, nội dung này không thể được xử lý. Vui lòng thử câu hỏi khác.';
      }
      
      // Nếu là lỗi 503 hoặc overloaded, đánh dấu key lỗi và thử key khác
      if (error.message?.includes('503') || 
          error.message?.includes('429') ||
          error.message?.includes('overloaded') ||
          error.message?.includes('quota')) {
        
        // Đánh dấu key hiện tại bị lỗi
        if (currentApiKey) {
          markKeyError(currentApiKey, error);
        }
        
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s (ngắn hơn vì có rotation)
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ Switching to next API key and retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue; // Thử key tiếp theo
        }
        
        // Hết retries
        return 'Hệ thống đang quá tải do nhiều người dùng. Vui lòng thử lại sau 1-2 phút. 🙏';
      }
      
      // Lỗi khác
      if (attempt === maxRetries) {
        return `Đã xảy ra lỗi khi xử lý yêu cầu: ${error.message}`;
      }
    }
  }
  
  return `Đã xảy ra lỗi khi xử lý yêu cầu: ${lastError?.message || 'Unknown error'}`;
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
  
  // 3. Tìm kiếm trong documents mới (từ Word/Excel)
  const documents = ragData.filter(item => 
    item.category === 'document' && 
    item.answer
  );
  
  // Chuẩn bị dữ liệu cho Fuse.js
  const fuseData = [
    // FAQ từ Excel cũ
    ...faqs.map(item => {
      const qa = extractQA(item.text);
      return {
        ...item,
        normText: normalize(item.text),
        normQuestion: normalize(qa.question),
        question: qa.question,
        answer: qa.answer,
        source: 'faq'
      };
    }),
    // Documents mới
    ...documents.map(item => ({
      ...item,
      normText: normalize(item.answer || ''),
      normQuestion: normalize(item.question || ''),
      question: item.question || '',
      answer: item.answer || '',
      source: 'document'
    }))
  ];
  
  // Tìm kiếm với Fuse.js (fuzzy matching)
  const fuse = new Fuse(fuseData, {
    keys: [
      { name: 'normQuestion', weight: 0.5 },
      { name: 'normText', weight: 0.3 },
      { name: 'keywords', weight: 0.2 }
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

// Hàm xây dựng context từ Smart Retrieval (TỐI ƯU - GIẢM TOKEN)
function buildSmartContext(smartResults, userQuery) {
  if (!smartResults.results || smartResults.results.length === 0) {
    return '';
  }
  
  let context = '=== THÔNG TIN TRƯỜNG ===\n';
  let itemCount = 0;
  const maxItems = 3; // Giới hạn 3 kết quả để giảm token
  
  for (const result of smartResults.results) {
    if (itemCount >= maxItems) break;
    
    const data = result.data;
    
    // 1. LIÊN HỆ (Compact)
    if (data.contact) {
      context += `📞 ${data.contact.class}: ${data.contact.name} - ${data.contact.phone}\n`;
      itemCount++;
    }
    // 2. QUY ĐỊNH CHẤM ĐIỂM (Compact)
    else if (data.sodb_scoring) {
      context += `📋 Sổ đầu bài: ${data.sodb_scoring.total_per_period} điểm/tiết (Học tập, Kỷ luật, Vệ sinh, Chuyên cần: mỗi ${data.sodb_scoring.criteria[0]?.max} điểm)\n`;
      itemCount++;
    }
    // 3. SAO ĐỎ (Compact)
    else if (data.saodo_rules) {
      context += `⭐ Sao đỏ: Nộp ${data.saodo_rules.submission}\n`;
      itemCount++;
    }
    // 4. THI ĐUA (Compact)
    else if (data.class_competition) {
      context += `🏆 Thi đua: ${data.class_competition.weekly_formula}\n`;
      itemCount++;
    }
    // 5. LỊCH TRỰC (Compact)
    else if (data.duty && smartResults.details?.weekday) {
      const day = smartResults.details.weekday;
      const schedule = data.duty.weekly?.[day];
      if (schedule) {
        context += `📅 ${day}: Sáng ${schedule.morning}, Chiều ${schedule.afternoon}\n`;
        itemCount++;
      }
    }
    // 6. PHÒNG HỌC (Compact)
    else if (data.rooms && smartResults.details?.class && data._foundRoom) {
      context += `🏫 Lớp ${smartResults.details.class}: Phòng ${data._foundRoom}\n`;
      itemCount++;
    }
    // 7. HÒA NHẬP (Compact)
    else if (data.inclusive) {
      context += `♿ Giáo dục hòa nhập: Liên hệ ${data.inclusive.contacts?.deputy_principal_inclusive || 'BGH'}\n`;
      itemCount++;
    }
    // 8. DỮ LIỆU RAW (Compact)
    else if (data.text) {
      const preview = data.text.substring(0, 150).replace(/\n/g, ' ');
      context += `📄 ${data.title || 'Thông tin'}: ${preview}...\n`;
      itemCount++;
    }
  }
  
  return context + '\n';
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

  // ========== BƯỚC 1: TÌM KIẾM THÔNG MINH (DIRECT CALL) ==========
  let smartResults = null;
  try {
    // Gọi trực tiếp hàm thay vì fetch để tránh lỗi internal request
    const { searchSmartRetrieval } = await import('./smart-retrieval-lib.js');
    smartResults = await searchSmartRetrieval(last);
    
    if (smartResults && smartResults.results?.length > 0) {
      console.log('✅ Smart retrieval:', {
        intent: smartResults.intent,
        resultsCount: smartResults.results.length
      });
    }
  } catch (error) {
    console.error('⚠️ Smart retrieval failed, fallback to old method:', error.message);
  }

  // ========== BƯỚC 2: FALLBACK - TÌM KIẾM RAG CŨ ==========
  const ragPath = path.join(process.cwd(), "app/public/data/rag_all.json");
  let ragData = [];
  try {
    ragData = JSON.parse(fs.readFileSync(ragPath, "utf8"));
    console.log(`Loaded ${ragData.length} RAG entries`);
  } catch (error) {
    console.error('Error loading RAG data:', error);
  }

  // Tìm kiếm RAG (vẫn giữ để backup)
  const searchResults = searchRAG(last, ragData);
  console.log('Search results:', {
    level: searchResults.level,
    topMatchesCount: searchResults.topMatches.length,
    topMatch: searchResults.topMatches[0]?.item?.question
  });

  // ========== BƯỚC 3: KẾT HỢP CONTEXT ==========
  let context = '';
  
  // Ưu tiên smart retrieval nếu có kết quả tốt
  if (smartResults && smartResults.results?.length > 0) {
    const smartContext = buildSmartContext(smartResults, last);
    if (smartContext && smartContext.length > 50) {
      context = smartContext + '\n\n';
      console.log('📌 Using smart context:', smartContext.substring(0, 100) + '...');
    }
  }
  
  // Bổ sung context từ RAG cũ
  const ragContext = buildAIContext(searchResults, last);
  context += ragContext;
  
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
   - RED (Cực kỳ nghiêm trọng): Tự hại, bạo lực, nguy hiểm tính mạng → Yêu cầu liên hệ ngay 111 hoặc cán bộ tư vấn trường
   - YELLOW (Cần hỗ trợ): Cần can thiệp trong 24h → Đề xuất gặp cán bộ tư vấn trường hoặc GVCN
   - GREEN (Quan trọng): Cần theo dõi → Hướng dẫn và hẹn gặp

3. Đưa ra hành động cụ thể:
   - Khuyến nghị liên hệ cán bộ tư vấn trường THCS Nguyễn Huệ hoặc GVCN của lớp
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
  ${level === 'red' ? '→ Ưu tiên an toàn, đề xuất liên hệ cán bộ tư vấn trường hoặc đường dây nóng 111 ngay' : ''}
  ${level === 'yellow' ? '→ Gợi ý giải pháp và khuyến nghị gặp cán bộ tư vấn trường hoặc GVCN' : ''}
  ${level === 'green' ? '→ Cung cấp hướng dẫn cụ thể và động viên. Nếu cần hỗ trợ thêm, có thể liên hệ cán bộ tư vấn trường hoặc GVCN' : ''}

THÔNG TIN LIÊN HỆ HỖ TRỢ:
- Cán bộ tư vấn trường THCS Nguyễn Huệ
- Giáo viên chủ nhiệm của lớp (nếu biết lớp)
- Đường dây nóng: 111

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
