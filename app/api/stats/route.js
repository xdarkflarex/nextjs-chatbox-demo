/**
 * =====================================================
 * STATS API - SUPABASE VERSION
 * =====================================================
 * API để lấy thống kê dashboard
 * =====================================================
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

/**
 * GET /api/stats
 * Lấy thống kê tổng quan
 */
export async function GET(req) {
  try {
    // Lấy tất cả sessions
    const { data: sessions, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching sessions:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // Tính toán thống kê
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      // Tổng số
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, s) => sum + (s.total_messages || 0), 0),
      emergencySessions: sessions.filter(s => s.is_emergency).length,
      
      // Theo thời gian
      todaySessions: sessions.filter(s => new Date(s.created_at) >= today).length,
      weekSessions: sessions.filter(s => new Date(s.created_at) >= weekAgo).length,
      monthSessions: sessions.filter(s => new Date(s.created_at) >= monthAgo).length,
      
      // Theo role
      byRole: {
        student: sessions.filter(s => s.user_role === 'student').length,
        teacher: sessions.filter(s => s.user_role === 'teacher').length,
        parent: sessions.filter(s => s.user_role === 'parent').length,
      },
      
      // Theo emergency level
      byEmergency: {
        GREEN: sessions.filter(s => s.emergency_level === 'GREEN').length,
        YELLOW: sessions.filter(s => s.emergency_level === 'YELLOW').length,
        RED: sessions.filter(s => s.emergency_level === 'RED').length,
      },
      
      // Active users (unique sessions trong 7 ngày)
      activeUsers: sessions.filter(s => new Date(s.created_at) >= weekAgo).length,
    };

    return NextResponse.json({
      ok: true,
      stats
    });

  } catch (error) {
    console.error('❌ Stats API error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
