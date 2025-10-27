/**
 * =====================================================
 * SESSION DETAIL API - SUPABASE VERSION
 * =====================================================
 * API để lấy chi tiết một session và messages
 * =====================================================
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

/**
 * GET /api/sessions/[id]
 * Lấy chi tiết session và tất cả messages
 */
export async function GET(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Lấy thông tin session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (sessionError || !session) {
      console.error('❌ Error fetching session:', sessionError);
      return NextResponse.json(
        { ok: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Lấy tất cả messages của session
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError);
    }

    // Format messages theo format admin cần
    const formattedMessages = (messages || []).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.content,
      timestamp: m.created_at,
      emergencyDetected: m.emergency_detected,
      emergencyLevel: m.emergency_level,
      emergencyKeywords: m.emergency_keywords
    }));

    return NextResponse.json({
      ok: true,
      session: {
        ...session,
        messages: formattedMessages
      }
    });

  } catch (error) {
    console.error('❌ GET session detail error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
