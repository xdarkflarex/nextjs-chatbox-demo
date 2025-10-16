import { GoogleGenerativeAI } from "@google/generative-ai";

async function callGeminiAPI(prompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY');
      return 'Không thể tóm tắt';
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Không thể tóm tắt';
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = body?.messages ?? [];

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ 
        summary: "Phiên chat trống" 
      }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Tạo nội dung phiên chat để tóm tắt
    let chatContent = '';
    messages.forEach((msg, idx) => {
      const role = msg.role === 'user' ? 'Học sinh' : 'Trợ lý';
      chatContent += `${role}: ${msg.content}\n`;
    });

    // Tạo prompt yêu cầu tóm tắt
    const prompt = `Dưới đây là một cuộc hội thoại giữa học sinh và trợ lý AI:

${chatContent}

Hãy tóm tắt nội dung chính của cuộc hội thoại này trong MỘT câu ngắn gọn (tối đa 10-15 từ), tập trung vào vấn đề chính mà học sinh đang hỏi hoặc chia sẻ.

Ví dụ tốt:
- "Hỏi về cách học tốt môn Toán"
- "Chia sẻ về áp lực học tập"
- "Xin tư vấn về mâu thuẫn với bạn"

Chỉ trả về câu tóm tắt, không thêm bất kỳ giải thích nào khác.`;

    // Gọi Gemini API
    const summary = await callGeminiAPI(prompt);
    
    return new Response(JSON.stringify({ 
      summary: summary.trim()
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in summarize API:', error);
    return new Response(JSON.stringify({ 
      summary: "Không thể tóm tắt",
      error: error.message 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
