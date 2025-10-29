"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function getPreview(session) {
  // Ưu tiên hiển thị summary nếu có, không thì hiển thị câu đầu
  if (session.summary) {
    return session.summary;
  }
  const firstAssistant = session.messages.find((m) => m.role === "assistant");
  return firstAssistant ? firstAssistant.content.split(". ")[0] : "Chat log";
}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const [processing, setProcessing] = useState(-1);
  const [deleted, setDeleted] = useState(-1);
  const [summarizing, setSummarizing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("admin")) {
      router.push("/admin-login");
      return;
    }
    
    // Đọc dữ liệu từ Supabase API
    fetchSessions();
    fetchStats();
  }, [router]);

  async function fetchSessions() {
    try {
      setLoading(true);
      const response = await fetch('/api/sessions');
      const data = await response.json();
      
      if (data.ok && data.sessions) {
        // Chuyển đổi format từ Supabase sang format admin cần
        const formattedSessions = data.sessions.map(s => ({
          id: s.id,
          sessionId: s.id,
          time: s.created_at,
          role: s.user_role,
          userRole: s.user_role, // Thêm userRole để consistent
          userClass: s.user_class,
          emergencyLevel: s.emergency_level,
          isEmergency: s.is_emergency,
          emergencyKeywords: s.emergency_keywords,
          totalMessages: s.total_messages,
          summary: s.session_name,
          messages: [], // Sẽ load khi click vào session
          processed: s.is_processed || false, // Đọc từ database
          processedAt: s.processed_at,
          processedBy: s.processed_by
        }));
        
        setSessions(formattedSessions);
        
        // Tự động tóm tắt các phiên chat chưa có summary
        // summarizeSessions(formattedSessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (data.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function summarizeSessions(sessions) {
    // Lọc các phiên chưa có summary
    const sessionsNeedSummary = sessions.filter(s => !s.summary && s.messages && s.messages.length > 0);
    
    if (sessionsNeedSummary.length === 0) return;
    
    setSummarizing(true);
    
    // Tóm tắt từng phiên một
    for (const session of sessionsNeedSummary) {
      try {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: session.messages })
        });
        
        const data = await response.json();
        
        if (data.summary) {
          // Cập nhật summary cho session
          session.summary = data.summary;
        }
      } catch (error) {
        console.error('Error summarizing session:', error);
      }
    }
    
    setSessions([...sessions]);
    setSummarizing(false);
  }

  async function handleRegenerateSummaries() {
    if (!confirm('Tạo lại tóm tắt cho tất cả phiên chat? Có thể mất vài giây.')) {
      return;
    }
    
    setRegenerating(true);
    
    try {
      const response = await fetch('/api/sessions/regenerate-summaries', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.ok) {
        alert(`✅ Đã cập nhật ${data.updated} phiên chat!\n⏭️ Bỏ qua: ${data.skipped}\n❌ Lỗi: ${data.failed}`);
        // Reload sessions
        fetchSessions();
      } else {
        alert('❌ Lỗi: ' + data.error);
      }
    } catch (error) {
      console.error('Error regenerating summaries:', error);
      alert('❌ Lỗi: ' + error.message);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDelete(id) {
    setDeleted(id);
    
    try {
      // Xóa từ Supabase ngay lập tức (Real-time)
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        // Cập nhật UI
        setTimeout(() => {
          const updated = sessions.filter((s) => s.id !== id);
          setSessions(updated);
          setDeleted(-1);
          setSelected(0);
        }, 400);
      } else {
        console.error('Error deleting session:', data.error);
        setDeleted(-1);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setDeleted(-1);
    }
  }

  async function handleProcess(id) {
    setProcessing(id);
    
    try {
      // Gọi API để cập nhật trạng thái trong database
      const response = await fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          is_processed: true,
          processed_by: 'admin' // Có thể lấy từ localStorage nếu có
        })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        // Cập nhật UI sau khi lưu thành công
        setTimeout(() => {
          const updated = sessions.map(s =>
            s.id === id ? { ...s, processed: true } : s
          );
          setSessions(updated);
          setProcessing(-1);
        }, 400);
      } else {
        console.error('Error updating session:', data.error);
        setProcessing(-1);
        alert('Lỗi: Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating session:', error);
      setProcessing(-1);
      alert('Lỗi: ' + error.message);
    }
  }

  async function loadSessionMessages(sessionId, index) {
    // Set selected trước để UI responsive
    setSelected(index);
    
    // Nếu session đã có messages, không cần load lại
    const session = sessions[index];
    if (session.messages && session.messages.length > 0) {
      return;
    }
    
    try {
      // Load messages từ Supabase
      const response = await fetch(`/api/sessions/${sessionId}`);
      const data = await response.json();
      
      if (data.ok && data.session) {
        // Cập nhật session với messages
        const updated = [...sessions];
        updated[index] = {
          ...updated[index],
          messages: data.session.messages || []
        };
        setSessions(updated);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
        </div>

        <div className="relative bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full border-2 border-blue-200 animate-slideUp">
          {/* Animated logo */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          
          {/* Loading text */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Đang tải dữ liệu
          </h2>
          <p className="text-gray-500 mb-6">Đang kết nối với cơ sở dữ liệu...</p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (summarizing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-200 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
        </div>

        <div className="relative bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full border-2 border-purple-200 animate-slideUp">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Đang tóm tắt nội dung
          </h2>
          <p className="text-gray-600 mb-2">AI đang phân tích các phiên chat...</p>
          <p className="text-sm text-gray-400 mb-6">Quá trình này có thể mất vài phút</p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{width: '75%'}}></div>
          </div>
          
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 md:p-6">
      {/* Header với logo */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo + Tên */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg bg-white flex-shrink-0">
                <Image
                  src="/logo-nguyen-hue.jpg"
                  alt="Logo THCS Nguyễn Huệ"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-blue-800">
                  THCS Nguyễn Huệ
                </h1>
                <p className="text-sm text-blue-600 font-medium">
                  Quản lý phiên chat trợ lý AI
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {/* Nút Phân Tích */}
              <Link
                href="/admin/analytics"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Phân Tích Dữ Liệu</span>
              </Link>

              {/* Nút tạo lại tóm tắt */}
              <button
                onClick={handleRegenerateSummaries}
                disabled={regenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{regenerating ? 'Đang xử lý...' : 'Tạo lại tóm tắt'}</span>
              </button>

              {/* Nút đăng xuất */}
              <Link
                href="/"
                onClick={() => localStorage.removeItem("admin")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Đăng xuất</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sessions */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats?.totalSessions || 0}</div>
                <div className="text-sm opacity-80">Tổng phiên chat</div>
              </div>
            </div>
            <div className="text-xs opacity-75">
              +{stats?.todaySessions || 0} hôm nay
            </div>
          </div>

          {/* Total Messages */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats?.totalMessages || 0}</div>
                <div className="text-sm opacity-80">Tổng tin nhắn</div>
              </div>
            </div>
            <div className="text-xs opacity-75">
              Trung bình {Math.round((stats?.totalMessages || 0) / (stats?.totalSessions || 1))} tin/phiên
            </div>
          </div>

          {/* Emergency Sessions */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats?.emergencySessions || 0}</div>
                <div className="text-sm opacity-80">Phiên khẩn cấp</div>
              </div>
            </div>
            <div className="text-xs opacity-75">
              {stats?.totalSessions > 0 ? Math.round((stats?.emergencySessions || 0) / stats.totalSessions * 100) : 0}% tổng số
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats?.activeUsers || 0}</div>
                <div className="text-sm opacity-80">Người dùng</div>
              </div>
            </div>
            <div className="text-xs opacity-75">
              Hoạt động 7 ngày qua
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Danh sách */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Danh sách phiên chat</h2>
                  <p className="text-sm text-gray-500">{sessions.length} phiên</p>
                </div>
              </div>
        {/* Danh sách phiên chat với thanh cuộn */}
        <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 hover:scrollbar-thumb-blue-500">
          {sessions.length === 0 && <div>Chưa có dữ liệu.</div>}
          {sessions.map((session, idx) => (
            <button
              key={session.id}
              onClick={() => loadSessionMessages(session.id, idx)}
              className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 bg-white shadow hover:shadow-xl transition-all duration-300 flex flex-col gap-1 ${selected === idx ? "ring-2 ring-blue-400" : ""} ${deleted === session.id ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"} ${session.isEmergency ? "border-red-500 bg-red-50 animate-pulse" : session.processed ? "border-green-400 bg-green-50" : "border-blue-200"}`}
              style={{ transitionProperty: "opacity,transform" }}
            >
              <div className="flex items-start gap-2">
                <div className="font-semibold text-blue-700 flex-1 break-words text-sm sm:text-base line-clamp-2">
                  {getPreview(session)}
                </div>
                <div className="flex gap-1 flex-wrap flex-shrink-0">
                  {session.isEmergency && (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold whitespace-nowrap flex items-center gap-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                      <span className="hidden sm:inline">Khẩn cấp</span>
                    </span>
                  )}
                  {session.processed && (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-green-400 text-white text-xs font-bold whitespace-nowrap">✓</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400 flex-wrap">
                <span className="text-xs">{new Date(session.time).toLocaleString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                {session.userRole && (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold text-xs">
                    {session.userRole === 'student' ? '🎓' : session.userRole === 'teacher' ? '👨‍🏫' : '👨‍👩‍👧'}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
            </div>
          </div>

          {/* Cột phải: Chi tiết */}
          <div className="lg:col-span-8">
        {sessions[selected] ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border-2 border-blue-200 flex flex-col h-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 gap-2 sm:gap-0">
              <div className="font-bold text-blue-700 text-base sm:text-lg">
                Chi tiết phiên chat
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleProcess(sessions[selected].id)}
                  className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1 text-xs sm:text-sm rounded font-semibold shadow transition-all duration-300 ${sessions[selected].processed ? "bg-green-400 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"} ${processing === sessions[selected].id ? "opacity-60 cursor-wait" : ""}`}
                  disabled={sessions[selected].processed || processing === sessions[selected].id}
                >
                  {sessions[selected].processed
                    ? "✓ Đã xử lý"
                    : processing === sessions[selected].id
                    ? "Đang xử lý..."
                    : "Đánh dấu"}
                </button>
                <button
                  onClick={() => handleDelete(sessions[selected].id)}
                  className="flex-1 sm:flex-initial px-2 sm:px-3 py-1 text-xs sm:text-sm rounded bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 font-semibold shadow transition-all duration-300"
                >
                  Xóa
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white">
              <div className="space-y-3">
              {sessions[selected].isEmergency && (
                <div className="mb-3 p-4 rounded-xl bg-red-100 border-2 border-red-400">
                  <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    PHIÊN CHAT KHẨN CẤP
                  </div>
                  <div className="text-sm text-red-600">
                    Phiên chat này đã được đánh dấu khẩn cấp. Vui lòng ưu tiên xử lý và liên hệ với học sinh/phụ huynh nếu cần thiết.
                  </div>
                </div>
              )}
              {sessions[selected].processed && (
                <div className="mb-2 px-3 py-1 rounded bg-green-100 text-green-700 font-semibold inline-block">Phiên này đã được xử lý</div>
              )}
              {sessions[selected].messages.map((m, i) => (
                <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <span className="inline-block bg-blue-200 rounded-full p-1.5 shadow flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                  )}
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-md text-sm whitespace-pre-wrap ${
                    m.role === "user" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-sm" 
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}>
                    <div className="text-xs font-semibold mb-1 opacity-70">
                      {m.role === "user" 
                        ? (sessions[selected].userRole === 'student' ? "🎓 Học sinh" : sessions[selected].userRole === 'teacher' ? "👨‍🏫 Giáo viên" : "👨‍👩‍👧 Phụ huynh")
                        : "🤖 Trợ lý AI"}
                    </div>
                    <div>{m.content}</div>
                  </div>
                  {m.role === "user" && (
                    <span className="inline-block bg-blue-600 rounded-full p-1.5 shadow flex-shrink-0">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                  )}
                </div>
              ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200 text-blue-700">
            Chọn một phiên chat để xem chi tiết.
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
