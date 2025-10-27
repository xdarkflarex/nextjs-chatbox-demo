/**
 * =====================================================
 * FINALIZE SESSION API
 * =====================================================
 * Kết thúc phiên chat và tạo tóm tắt chất lượng cao
 * - Đọc toàn bộ messages từ database
 * - Gọi Gemini phân tích và tóm tắt
 * - Cập nhật session_name với tóm tắt chi tiết
 * =====================================================
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getNextApiKey, resetKeyErrors } from "../../../../lib/gemini-rotator.js";

/**
 * Tạo tóm tắt chất lượng cao từ toàn bộ cuộc hội thoại
 */
async function generateDetailedSummary(messages, userRole, userClass) {
  try {
    if (!messages || messages.length === 0) {
      return 'Phiên chat trống';
    }

    // Lọc messages thực sự (bỏ qua "Tôi là...", số lớp)
    const realMessages = messages.filter(msg => {
      const content = msg.content || '';
      // Bỏ qua tin nhắn giới thiệu
      if (content.startsWith('Tôi là') || content.startsWith('tôi là')) {
        return false;
      }
      // Bỏ qua số lớp
      if (/^\d{1,2}\/\d{1,2}$/.test(content.trim())) {
        return false;
      }
      return true;
    });

    if (realMessages.length === 0) {
      return 'Phiên chat giới thiệu';
    }

    // Nếu chỉ có 1-2 tin nhắn, dùng câu đầu tiên
    if (realMessages.length <= 2) {
      const firstUserMsg = realMessages.find(m => m.sender === 'user');
      if (firstUserMsg) {
        const content = firstUserMsg.content || '';
        return content.length > 80 ? content.substring(0, 80) + '...' : content;
      }
    }

    // Tạo transcript đầy đủ
    const transcript = realMessages.map(msg => {
      const role = msg.sender === 'user' ? 'Người dùng' : 'Trợ lý AI';
      return `${role}: ${msg.content}`;
    }).join('\n\n');

    // Gọi Gemini để tóm tắt (với rotation)
    const apiKey = getNextApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const roleText = userRole === 'student' ? 'Học sinh' : 
                     userRole === 'teacher' ? 'Giáo viên' : 'Phụ huynh';
    const classText = userClass ? ` lớp ${userClass}` : '';

    const prompt = `Bạn là chuyên gia phân tích cuộc hội thoại tâm lý học đường.

THÔNG TIN:
- Người dùng: ${roleText}${classText}
- Số lượng tin nhắn: ${realMessages.length}

CUỘC HỘI THOẠI:
${transcript}

YÊU CẦU:
Tóm tắt cuộc hội thoại này trong 1 câu ngắn gọn (tối đa 100 ký tự), bao gồm:
1. Chủ đề chính (vấn đề gì?)
2. Cảm xúc/tình trạng (nếu có)
3. Kết quả (đã giải quyết/đang tư vấn/cần theo dõi)

VÍ DỤ TỐT:
- "Học sinh lo lắng về kỳ thi, đã được tư vấn kỹ thuật học tập"
- "Phụ huynh hỏi về lịch họp và số điện thoại GVCN"
- "Giáo viên tìm hiểu cách xử lý học sinh chậm tiến bộ"

CHỈ TRẢ VỀ CÂU TÓM TẮT, KHÔNG GIẢI THÍCH THÊM.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    // Reset error count khi thành công
    resetKeyErrors(apiKey);

    // Giới hạn độ dài
    return summary.length > 120 ? summary.substring(0, 120) + '...' : summary;

  } catch (error) {
    console.error('❌ Error generating detailed summary:', error);
    
    // Fallback: Dùng câu hỏi đầu tiên
    const firstUserMsg = messages.find(m => m.sender === 'user');
    if (firstUserMsg) {
      const content = firstUserMsg.content || '';
      return content.length > 80 ? content.substring(0, 80) + '...' : content;
    }
    
    return 'Phiên chat đã kết thúc';
  }
}

/**
 * POST /api/sessions/finalize
 * Kết thúc phiên chat và tạo tóm tắt
 */
export async function POST(req) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Finalizing session: ${sessionId}`);

    // 1. Lấy thông tin session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('❌ Session not found:', sessionError);
      return NextResponse.json(
        { ok: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // 2. Lấy tất cả messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError);
      return NextResponse.json(
        { ok: false, error: 'Error fetching messages' },
        { status: 500 }
      );
    }

    console.log(`📊 Found ${messages?.length || 0} messages`);

    // 3. Tạo tóm tắt chi tiết
    const summary = await generateDetailedSummary(
      messages || [],
      session.user_role,
      session.user_class
    );

    console.log(`✅ Generated summary: "${summary}"`);

    // 4. Cập nhật session
    const { error: updateError } = await supabaseAdmin
      .from('chat_sessions')
      .update({
        session_name: summary,
        ended_at: new Date().toISOString(),
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('❌ Error updating session:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Error updating session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      summary: summary,
      messageCount: messages?.length || 0
    });

  } catch (error) {
    console.error('❌ Finalize session error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
