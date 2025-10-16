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

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("admin")) {
      router.push("/admin-login");
      return;
    }
    // Đọc dữ liệu từ localStorage
    let sessions = [];
    try {
      sessions = JSON.parse(localStorage.getItem("chatSessions")) || [];
    } catch {}
    // Thêm trường thời gian nếu chưa có
    sessions = sessions.map((s) => ({
      ...s,
      time: s.time || Date.now(),
      id: s.sessionId || s.id || Math.random().toString(36).slice(2),
    }));
    setSessions(sessions);
    setLoading(false);
    
    // Tự động tóm tắt các phiên chat chưa có summary
    summarizeSessions(sessions);
  }, [router]);

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
    
    // Lưu lại vào localStorage
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
    setSessions([...sessions]);
    setSummarizing(false);
  }

  async function handleDelete(id) {
    setDeleted(id);
    setTimeout(() => {
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      localStorage.setItem("chatSessions", JSON.stringify(updated));
      setDeleted(-1);
      setSelected(0);
    }, 400);
  }

  async function handleProcess(id) {
    setProcessing(id);
    setTimeout(() => {
      // Cập nhật trạng thái processed cho session
      const updated = sessions.map(s =>
        s.id === id ? { ...s, processed: true } : s
      );
      setSessions(updated);
      localStorage.setItem("chatSessions", JSON.stringify(updated));
      setProcessing(-1);
    }, 600);
  }

  if (loading) return <div className="p-8">Đang tải dữ liệu…</div>;
  
  if (summarizing && sessions.length > 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen rounded-xl shadow-xl flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 font-semibold">Đang tóm tắt nội dung các phiên chat...</p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
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
        <div className="space-y-3">
          {sessions.length === 0 && <div>Chưa có dữ liệu.</div>}
          {sessions.map((session, idx) => (
            <button
              key={session.id}
              onClick={() => setSelected(idx)}
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
