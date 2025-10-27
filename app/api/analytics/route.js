/**
 * =====================================================
 * ANALYTICS API - Advanced Metrics
 * =====================================================
 * KPIs cho chatbot tâm lý học đường
 * =====================================================
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

/**
 * GET /api/analytics?period=7d|30d|90d
 * Lấy analytics chi tiết
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d';
    
    // Tính ngày bắt đầu
    const now = new Date();
    let startDate = new Date();
    
    switch(period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    // 1. Lấy tất cả sessions trong khoảng thời gian
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (sessionsError) throw sessionsError;
    
    // 2. Lấy tất cả messages
    const sessionIds = sessions.map(s => s.id);
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: true });
    
    if (messagesError) throw messagesError;
    
    // ===== KPI 1: TỔNG QUAN =====
    const overview = calculateOverview(sessions, messages);
    
    // ===== KPI 2: PHÂN TÍCH THEO CHIỀU =====
    const dimensions = calculateDimensions(sessions, messages);
    
    // ===== KPI 3: CHẤT LƯỢNG & AN TOÀN =====
    const safety = calculateSafety(sessions, messages);
    
    // ===== KPI 4: TIMELINE =====
    const timeline = calculateTimeline(sessions, messages, startDate, now);
    
    // ===== KPI 5: HEATMAP =====
    const heatmap = calculateHeatmap(sessions);
    
    return NextResponse.json({
      ok: true,
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      analytics: {
        overview,
        dimensions,
        safety,
        timeline,
        heatmap
      }
    });
    
  } catch (error) {
    console.error('❌ Analytics API error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * 1. KPI TỔNG QUAN
 */
function calculateOverview(sessions, messages) {
  const totalSessions = sessions.length;
  
  // Số phiên hoàn tất (có ended_at)
  const completedSessions = sessions.filter(s => s.ended_at).length;
  const completionRate = totalSessions > 0 
    ? (completedSessions / totalSessions * 100).toFixed(1)
    : 0;
  
  // Thời lượng phiên (phút)
  const durations = sessions
    .filter(s => s.ended_at && s.created_at)
    .map(s => {
      const start = new Date(s.created_at);
      const end = new Date(s.ended_at);
      return (end - start) / 1000 / 60; // minutes
    })
    .sort((a, b) => a - b);
  
  const medianDuration = durations.length > 0
    ? durations[Math.floor(durations.length / 2)]
    : 0;
  
  // Số lượt trao đổi/phiên (turns)
  const turnsPerSession = sessions.map(s => {
    const sessionMessages = messages.filter(m => m.session_id === s.id);
    // Đếm số lần user gửi tin nhắn
    return sessionMessages.filter(m => m.sender === 'user').length;
  }).sort((a, b) => a - b);
  
  const medianTurns = turnsPerSession.length > 0
    ? turnsPerSession[Math.floor(turnsPerSession.length / 2)]
    : 0;
  
  // Thời gian phản hồi bot (ms)
  const responseTimes = messages
    .filter(m => m.sender === 'bot' && m.response_time_ms)
    .map(m => m.response_time_ms)
    .sort((a, b) => a - b);
  
  const p50Latency = responseTimes.length > 0
    ? responseTimes[Math.floor(responseTimes.length * 0.5)]
    : 0;
  
  const p90Latency = responseTimes.length > 0
    ? responseTimes[Math.floor(responseTimes.length * 0.9)]
    : 0;
  
  // Tỉ lệ leo thang (có emergency)
  const escalatedSessions = sessions.filter(s => s.is_emergency).length;
  const escalationRate = totalSessions > 0
    ? (escalatedSessions / totalSessions * 100).toFixed(1)
    : 0;
  
  // Tỉ lệ cờ rủi ro
  const riskFlaggedSessions = sessions.filter(s => 
    s.emergency_level === 'RED' || s.emergency_level === 'YELLOW'
  ).length;
  const riskFlagRate = totalSessions > 0
    ? (riskFlaggedSessions / totalSessions * 100).toFixed(1)
    : 0;
  
  // Người dùng duy nhất (unique users)
  const uniqueUsers = new Set(
    sessions.filter(s => s.user_id).map(s => s.user_id)
  ).size;
  
  return {
    totalSessions,
    uniqueUsers,
    completionRate: parseFloat(completionRate),
    medianDuration: medianDuration.toFixed(1),
    medianTurns,
    p50Latency,
    p90Latency,
    escalationRate: parseFloat(escalationRate),
    riskFlagRate: parseFloat(riskFlagRate),
    totalMessages: messages.length
  };
}

/**
 * 2. PHÂN TÍCH THEO CHIỀU
 */
function calculateDimensions(sessions, messages) {
  // Theo vai trò
  const byRole = {
    student: sessions.filter(s => s.user_role === 'student').length,
    teacher: sessions.filter(s => s.user_role === 'teacher').length,
    parent: sessions.filter(s => s.user_role === 'parent').length
  };
  
  // Theo lớp (top 10)
  const classCount = {};
  sessions.forEach(s => {
    if (s.user_class) {
      classCount[s.user_class] = (classCount[s.user_class] || 0) + 1;
    }
  });
  const topClasses = Object.entries(classCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  // Theo emergency level
  const byEmergency = {
    GREEN: sessions.filter(s => s.emergency_level === 'GREEN').length,
    YELLOW: sessions.filter(s => s.emergency_level === 'YELLOW').length,
    RED: sessions.filter(s => s.emergency_level === 'RED').length
  };
  
  // Theo từ khóa khẩn cấp (top keywords)
  const keywordCount = {};
  sessions.forEach(s => {
    if (s.emergency_keywords && Array.isArray(s.emergency_keywords)) {
      s.emergency_keywords.forEach(kw => {
        keywordCount[kw] = (keywordCount[kw] || 0) + 1;
      });
    }
  });
  const topKeywords = Object.entries(keywordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));
  
  return {
    byRole,
    topClasses,
    byEmergency,
    topKeywords
  };
}

/**
 * 3. CHẤT LƯỢNG & AN TOÀN
 */
function calculateSafety(sessions, messages) {
  // Tỉ lệ phát hiện rủi ro theo loại
  const riskDetection = {
    RED: sessions.filter(s => s.emergency_level === 'RED').length,
    YELLOW: sessions.filter(s => s.emergency_level === 'YELLOW').length,
    GREEN: sessions.filter(s => s.emergency_level === 'GREEN').length
  };
  
  // Thời gian phản ứng khi có cờ rủi ro
  const riskSessions = sessions.filter(s => s.is_emergency);
  const riskResponseTimes = riskSessions.map(s => {
    const sessionMessages = messages
      .filter(m => m.session_id === s.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    // Tìm tin nhắn đầu tiên có emergency_detected
    const firstRiskMsg = sessionMessages.find(m => m.emergency_detected);
    if (!firstRiskMsg) return null;
    
    // Tìm tin nhắn bot phản hồi ngay sau đó
    const firstRiskIndex = sessionMessages.indexOf(firstRiskMsg);
    const botResponse = sessionMessages
      .slice(firstRiskIndex + 1)
      .find(m => m.sender === 'bot');
    
    if (!botResponse) return null;
    
    const riskTime = new Date(firstRiskMsg.created_at);
    const responseTime = new Date(botResponse.created_at);
    return (responseTime - riskTime) / 1000; // seconds
  }).filter(t => t !== null);
  
  const avgRiskResponseTime = riskResponseTimes.length > 0
    ? (riskResponseTimes.reduce((a, b) => a + b, 0) / riskResponseTimes.length).toFixed(1)
    : 0;
  
  // Tỉ lệ sử dụng RAG
  const ragUsedMessages = messages.filter(m => m.rag_used).length;
  const ragUsageRate = messages.length > 0
    ? (ragUsedMessages / messages.length * 100).toFixed(1)
    : 0;
  
  // Escalation outcomes (sessions có emergency)
  const escalationOutcomes = {
    flagged: riskSessions.length,
    resolved: riskSessions.filter(s => s.ended_at).length,
    pending: riskSessions.filter(s => !s.ended_at).length
  };
  
  return {
    riskDetection,
    avgRiskResponseTime: parseFloat(avgRiskResponseTime),
    ragUsageRate: parseFloat(ragUsageRate),
    escalationOutcomes
  };
}

/**
 * 4. TIMELINE (Sessions theo ngày)
 */
function calculateTimeline(sessions, messages, startDate, endDate) {
  const days = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayStart = new Date(current);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(current);
    dayEnd.setHours(23, 59, 59, 999);
    
    const daySessions = sessions.filter(s => {
      const created = new Date(s.created_at);
      return created >= dayStart && created <= dayEnd;
    });
    
    const dayMessages = messages.filter(m => {
      const created = new Date(m.created_at);
      return created >= dayStart && created <= dayEnd;
    });
    
    days.push({
      date: dayStart.toISOString().split('T')[0],
      sessions: daySessions.length,
      messages: dayMessages.length,
      emergencies: daySessions.filter(s => s.is_emergency).length,
      users: new Set(daySessions.filter(s => s.user_id).map(s => s.user_id)).size
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

/**
 * 5. HEATMAP (Giờ x Ngày trong tuần)
 */
function calculateHeatmap(sessions) {
  const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));
  
  sessions.forEach(s => {
    const date = new Date(s.created_at);
    const day = date.getDay(); // 0 = Sunday
    const hour = date.getHours();
    heatmap[day][hour]++;
  });
  
  return {
    data: heatmap,
    labels: {
      days: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      hours: Array.from({length: 24}, (_, i) => `${i}h`)
    }
  };
}
