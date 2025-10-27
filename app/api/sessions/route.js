/**
 * =====================================================
 * SESSIONS API - SUPABASE VERSION
 * =====================================================
 * API endpoints để quản lý chat sessions với Supabase
 * - POST: Tạo hoặc cập nhật session
 * - GET: Lấy danh sách sessions
 * - DELETE: Xóa session
 * =====================================================
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

/**
 * Tóm tắt nội dung chat bằng Gemini AI
 */
async function generateSummary(messages) {
  try {
    if (!messages || messages.length === 0) {
      return 'Chat mới';
    }
    
    // Lọc chỉ lấy tin nhắn từ user
    const userMessages = messages.filter(m => 
      m.role === 'user' || m.sender === 'user'
    );
    
    if (userMessages.length === 0) {
      return 'Chat mới';
    }
    
    // Lấy tất cả câu hỏi của user (bỏ qua "Tôi là...", số lớp)
    const realQuestions = userMessages.filter(m => {
      const content = m.content || m.text || '';
      // Bỏ qua "Tôi là..."
      if (content.startsWith('Tôi là') || content.startsWith('tôi là')) {
        return false;
      }
      // Bỏ qua số lớp
      if (/^\d{1,2}\/\d{1,2}$/.test(content.trim())) {
        return false;
      }
      return true;
    });
    
    if (realQuestions.length === 0) {
      return 'Chat mới';
    }
    
    // Nếu chỉ có 1 câu hỏi, dùng nó luôn
    if (realQuestions.length === 1) {
      const content = realQuestions[0].content || realQuestions[0].text || '';
      return content.length > 60 ? content.substring(0, 60) + '...' : content;
    }
    
    // Nếu có nhiều câu hỏi, gọi Gemini tóm tắt
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const questionsText = realQuestions
        .map(m => m.content || m.text)
        .join('\n- ');
      
      const prompt = `Tóm tắt ngắn gọn (tối đa 60 ký tự) nội dung chính của các câu hỏi sau:\n\n- ${questionsText}\n\nChỉ trả về câu tóm tắt, không giải thích.`;
      
      const result = await model.generateContent(prompt);
      const summary = result.response.text().trim();
      
      return summary.length > 60 ? summary.substring(0, 60) + '...' : summary;
    } catch (aiError) {
      console.warn('Gemini summarization failed, using first question:', aiError.message);
      // Fallback: Dùng câu hỏi đầu tiên
      const content = realQuestions[0].content || realQuestions[0].text || '';
      return content.length > 60 ? content.substring(0, 60) + '...' : content;
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Chat mới';
  }
}

/**
 * POST /api/sessions
 * Tạo session mới hoặc cập nhật session hiện có
 */
export async function POST(req) {
  try {
    const { sessionId, messages, userRole, userClass, emergencyData } = await req.json();

    // Tạo summary từ messages
    const summary = await generateSummary(messages || []);

    // Nếu không có sessionId, tạo session mới
    if (!sessionId) {
      const { data: newSession, error } = await supabaseAdmin
        .from('chat_sessions')
        .insert({
          user_role: userRole || 'student',
          user_class: userClass || null,
          session_name: summary,
          emergency_level: emergencyData?.level || 'GREEN',
          emergency_keywords: emergencyData?.keywords || [],
          is_emergency: emergencyData?.isEmergency || false,
          total_messages: messages?.length || 0,
          metadata: {
            created_from: 'web',
            initial_messages: messages || []
          }
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating session:', error);
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        );
      }

      // Lưu messages nếu có
      if (messages && messages.length > 0) {
        const messagesData = messages.map(msg => ({
          session_id: newSession.id,
          sender: msg.sender,
          content: msg.text || msg.content,
          emergency_detected: msg.emergencyDetected || false,
          emergency_level: msg.emergencyLevel || 'GREEN',
          emergency_keywords: msg.emergencyKeywords || [],
          metadata: {
            timestamp: msg.timestamp || new Date().toISOString()
          }
        }));

        const { error: msgError } = await supabaseAdmin
          .from('messages')
          .insert(messagesData);

        if (msgError) {
          console.error('❌ Error saving messages:', msgError);
        }
      }

      return NextResponse.json({
        ok: true,
        sessionId: newSession.id,
        session: newSession
      });
    }

    // Kiểm tra session có tồn tại không
    const { data: existingSession, error: fetchError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    // Nếu session chưa tồn tại, tạo mới với sessionId đã cho
    if (fetchError || !existingSession) {
      const { data: newSession, error: createError } = await supabaseAdmin
        .from('chat_sessions')
        .insert({
          id: sessionId, // Dùng sessionId từ client
          user_role: userRole || 'student',
          user_class: userClass || null,
          session_name: summary, // Dùng summary thay vì timestamp
          emergency_level: emergencyData?.level || 'GREEN',
          emergency_keywords: emergencyData?.keywords || [],
          is_emergency: emergencyData?.isEmergency || false,
          total_messages: messages?.length || 0,
          metadata: {
            created_from: 'web',
            initial_messages: messages || []
          }
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating session:', createError);
        return NextResponse.json(
          { ok: false, error: createError.message },
          { status: 500 }
        );
      }

      // Lưu messages
      if (messages && messages.length > 0) {
        const messagesData = messages.map(msg => ({
          session_id: sessionId,
          sender: msg.role === 'user' ? 'user' : 'bot',
          content: msg.content,
          emergency_detected: msg.emergencyDetected || false,
          emergency_level: msg.emergencyLevel || 'GREEN',
          emergency_keywords: msg.emergencyKeywords || [],
          metadata: {
            timestamp: msg.timestamp || new Date().toISOString()
          }
        }));

        const { error: msgError } = await supabaseAdmin
          .from('messages')
          .insert(messagesData);

        if (msgError) {
          console.error('❌ Error saving messages:', msgError);
        }
      }

      return NextResponse.json({
        ok: true,
        sessionId: sessionId,
        session: newSession
      });
    }

    // Tạo lại summary nếu cần (khi có messages mới)
    let newSummary = existingSession.session_name;
    if (messages && messages.length > 0) {
      // Chỉ tạo lại summary nếu hiện tại là "Chat mới" hoặc "Tôi là..."
      if (
        !existingSession.session_name ||
        existingSession.session_name === 'Chat mới' ||
        existingSession.session_name.startsWith('Tôi là') ||
        existingSession.session_name.startsWith('Chat ')
      ) {
        newSummary = await generateSummary(messages);
        console.log(`🔄 Updated summary for ${sessionId}: "${newSummary}"`);
      }
    }

    // Cập nhật thông tin session
    const { error: updateError } = await supabaseAdmin
      .from('chat_sessions')
      .update({
        session_name: newSummary,
        total_messages: messages?.length || existingSession.total_messages,
        emergency_level: emergencyData?.level || existingSession.emergency_level,
        emergency_keywords: emergencyData?.keywords || existingSession.emergency_keywords,
        is_emergency: emergencyData?.isEmergency || existingSession.is_emergency,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('❌ Error updating session:', updateError);
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Lưu messages mới
    if (messages && messages.length > 0) {
      // Lấy số lượng messages hiện có
      const { count } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      // Chỉ lưu messages mới (chưa có trong DB)
      const newMessages = messages.slice(count || 0);
      
      if (newMessages.length > 0) {
        const messagesData = newMessages.map(msg => ({
          session_id: sessionId,
          sender: msg.role === 'user' ? 'user' : 'bot', // Map role → sender
          content: msg.text || msg.content,
          emergency_detected: msg.emergencyDetected || false,
          emergency_level: msg.emergencyLevel || 'GREEN',
          emergency_keywords: msg.emergencyKeywords || [],
          metadata: {
            timestamp: msg.timestamp || new Date().toISOString()
          }
        }));

        const { error: msgError } = await supabaseAdmin
          .from('messages')
          .insert(messagesData);

        if (msgError) {
          console.error('❌ Error saving new messages:', msgError);
        }
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('❌ Session API error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sessions
 * Lấy danh sách tất cả sessions
 * Query params:
 * - role: Filter by user role
 * - emergency: Filter by emergency status
 * - limit: Số lượng sessions (default: 100)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const emergency = searchParams.get('emergency');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabaseAdmin
      .from('chat_sessions')
      .select(`
        *,
        messages:messages(count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by role
    if (role) {
      query = query.eq('user_role', role);
    }

    // Filter by emergency
    if (emergency === 'true') {
      query = query.eq('is_emergency', true);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('❌ Error fetching sessions:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      sessions: sessions || [],
      count: sessions?.length || 0
    });

  } catch (error) {
    console.error('❌ GET sessions error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sessions
 * Cập nhật trạng thái session (is_processed, processed_at, processed_by)
 */
export async function PATCH(req) {
  try {
    const { id, is_processed, processed_by } = await req.json();

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const updateData = {
      is_processed: is_processed,
      updated_at: new Date().toISOString()
    };

    // Nếu đánh dấu đã xử lý, lưu thời gian và người xử lý
    if (is_processed) {
      updateData.processed_at = new Date().toISOString();
      if (processed_by) {
        updateData.processed_by = processed_by;
      }
    } else {
      // Nếu bỏ đánh dấu, xóa thông tin xử lý
      updateData.processed_at = null;
      updateData.processed_by = null;
    }

    const { error } = await supabaseAdmin
      .from('chat_sessions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('❌ Error updating session:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('❌ PATCH session error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions
 * Xóa một session (và tất cả messages liên quan)
 */
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Xóa session (messages sẽ tự động xóa do CASCADE)
    const { error } = await supabaseAdmin
      .from('chat_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting session:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('❌ DELETE session error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
