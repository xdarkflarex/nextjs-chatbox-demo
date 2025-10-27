/**
 * =====================================================
 * ADMIN EMERGENCIES API - SUPABASE VERSION
 * =====================================================
 * API để quản lý cảnh báo khẩn cấp
 * - GET: Lấy danh sách cảnh báo
 * - PATCH: Đánh dấu đã xử lý
 * =====================================================
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

/**
 * GET /api/admin/emergencies
 * Lấy danh sách cảnh báo khẩn cấp
 * Query params:
 * - resolved: true/false (filter)
 * - level: RED/YELLOW (filter)
 * - limit: số lượng (default: 50)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const resolved = searchParams.get('resolved');
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseAdmin
      .from('emergency_alerts')
      .select(`
        *,
        session:chat_sessions(
          id,
          user_role,
          user_class,
          created_at,
          total_messages
        ),
        message:messages(
          id,
          content,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by resolved status
    if (resolved !== null) {
      query = query.eq('is_resolved', resolved === 'true');
    }

    // Filter by alert level
    if (level) {
      query = query.eq('alert_level', level.toUpperCase());
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error('❌ Error fetching emergencies:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      alerts: alerts || [],
      count: alerts?.length || 0
    });

  } catch (error) {
    console.error('❌ GET emergencies error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/emergencies
 * Đánh dấu cảnh báo đã xử lý
 */
export async function PATCH(req) {
  try {
    const { alertId, resolvedBy, notes } = await req.json();

    if (!alertId) {
      return NextResponse.json(
        { ok: false, error: 'Alert ID required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('emergency_alerts')
      .update({
        is_resolved: true,
        resolved_by: resolvedBy || null,
        resolved_at: new Date().toISOString(),
        resolution_notes: notes || null
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error resolving alert:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // Log admin action
    if (resolvedBy) {
      await supabaseAdmin
        .from('admin_logs')
        .insert({
          admin_id: resolvedBy,
          action: 'resolve_emergency',
          target_type: 'emergency_alert',
          target_id: alertId,
          description: `Resolved emergency alert: ${data.alert_level}`,
          metadata: {
            alert_level: data.alert_level,
            keywords: data.keywords,
            notes: notes
          }
        });
    }

    return NextResponse.json({
      ok: true,
      alert: data
    });

  } catch (error) {
    console.error('❌ PATCH emergency error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/emergencies/export
 * Export cảnh báo khẩn cấp ra CSV
 */
export async function POST(req) {
  try {
    const { startDate, endDate } = await req.json();

    let query = supabaseAdmin
      .from('emergency_alerts')
      .select(`
        *,
        session:chat_sessions(user_role, user_class),
        message:messages(content)
      `)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error('❌ Error exporting emergencies:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Alert Level',
      'Keywords',
      'Student Class',
      'Created At',
      'Resolved',
      'Resolved At',
      'Notes',
      'Message Content'
    ].join(',');

    const csvRows = alerts?.map(alert => [
      alert.id,
      alert.alert_level,
      `"${alert.keywords?.join('; ') || ''}"`,
      alert.student_class || '',
      alert.created_at,
      alert.is_resolved ? 'Yes' : 'No',
      alert.resolved_at || '',
      `"${alert.resolution_notes || ''}"`,
      `"${alert.message?.content?.substring(0, 100) || ''}"`
    ].join(',')) || [];

    const csv = [csvHeaders, ...csvRows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="emergencies_${new Date().toISOString()}.csv"`
      }
    });

  } catch (error) {
    console.error('❌ Export emergencies error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
