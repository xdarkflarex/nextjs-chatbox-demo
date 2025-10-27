/**
 * =====================================================
 * ADMIN STATS API - SUPABASE VERSION
 * =====================================================
 * API để lấy thống kê cho admin dashboard
 * - Tổng quan hệ thống
 * - Cảnh báo khẩn cấp
 * - Phiên chat đang hoạt động
 * =====================================================
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

/**
 * GET /api/admin/stats
 * Lấy thống kê tổng quan
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today'; // today, week, month, all

    // Tính toán thời gian bắt đầu
    let startDate = new Date();
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date('2000-01-01');
        break;
    }

    // 1. Tổng số sessions
    const { count: totalSessions, error: sessionsError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // 2. Sessions theo role
    const { data: sessionsByRole, error: roleError } = await supabaseAdmin
      .from('chat_sessions')
      .select('user_role')
      .gte('created_at', startDate.toISOString());

    const roleStats = {
      student: 0,
      teacher: 0,
      parent: 0
    };

    sessionsByRole?.forEach(s => {
      if (s.user_role in roleStats) {
        roleStats[s.user_role]++;
      }
    });

    // 3. Cảnh báo khẩn cấp
    const { data: emergencySessions, error: emergencyError } = await supabaseAdmin
      .from('chat_sessions')
      .select('emergency_level')
      .eq('is_emergency', true)
      .gte('created_at', startDate.toISOString());

    const emergencyStats = {
      total: emergencySessions?.length || 0,
      red: emergencySessions?.filter(s => s.emergency_level === 'RED').length || 0,
      yellow: emergencySessions?.filter(s => s.emergency_level === 'YELLOW').length || 0
    };

    // 4. Tổng số messages
    const { count: totalMessages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // 5. Phiên đang hoạt động (cập nhật trong 30 phút)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const { count: activeSessions, error: activeError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('updated_at', thirtyMinutesAgo.toISOString());

    // 6. Cảnh báo chưa xử lý
    const { count: unresolvedAlerts, error: alertsError } = await supabaseAdmin
      .from('emergency_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('is_resolved', false);

    // 7. Thời gian phản hồi trung bình
    const { data: responseTimeData, error: responseError } = await supabaseAdmin
      .from('messages')
      .select('response_time_ms')
      .not('response_time_ms', 'is', null)
      .gte('created_at', startDate.toISOString());

    const avgResponseTime = responseTimeData?.length > 0
      ? Math.round(
          responseTimeData.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) /
          responseTimeData.length
        )
      : 0;

    // Kiểm tra lỗi
    if (sessionsError || roleError || emergencyError || messagesError || activeError || alertsError) {
      console.error('❌ Stats query errors:', {
        sessionsError,
        roleError,
        emergencyError,
        messagesError,
        activeError,
        alertsError
      });
    }

    return NextResponse.json({
      ok: true,
      period,
      stats: {
        totalSessions: totalSessions || 0,
        totalMessages: totalMessages || 0,
        activeSessions: activeSessions || 0,
        unresolvedAlerts: unresolvedAlerts || 0,
        avgResponseTimeMs: avgResponseTime,
        byRole: roleStats,
        emergency: emergencyStats
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Stats API error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
