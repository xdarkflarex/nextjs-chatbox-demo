"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function ChatWidget() {
  const [sessionId, setSessionId] = useState(uuidv4());
  const [userRole, setUserRole] = useState(null); // 'student', 'teacher', 'parent'
  const [userClass, setUserClass] = useState(null); // Lớp của học sinh (optional)
  const [isEmergency, setIsEmergency] = useState(false); // Đánh dấu phiên khẩn cấp
  const [emergencyInfo, setEmergencyInfo] = useState(null); // Thông tin khẩn cấp
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chào! Mình là trợ lý AI của trường. Để hỗ trợ bạn tốt hơn, vui lòng cho mình biết bạn là ai?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // "saving" | "saved" | ""
  const listRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function send(text, isEmergencyMode = false) {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg = { role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    
    // Detect lớp nếu là học sinh và chưa có userClass
    if (userRole === 'student' && !userClass) {
      const classPattern = /^(\d{1,2})\/(\d{1,2})$/; // Pattern: 6/1, 7/2, etc.
      if (classPattern.test(content)) {
        setUserClass(content);
        setMessages((m) => [...m, { 
          role: "assistant", 
          content: `Cảm ơn em! Mình đã ghi nhận em học lớp ${content}. Bây giờ em có thể hỏi mình bất cứ điều gì nhé! 😊` 
        }]);
        setLoading(false);
        return; // Không gọi API, chỉ lưu lớp
      }
    }
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMsg], 
          userRole,
          isEmergency: isEmergencyMode || isEmergency 
        }),
      });
      // Gửi log lên server
      fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      // Ensure reply is a plain string (guard against server returning an object)
      let assistantContent = "Xin lỗi, mình chưa nắm rõ.";
      if (typeof data?.reply === "string") {
        assistantContent = data.reply;
      } else if (data?.reply && typeof data.reply === "object") {
        // If reply contains a nested text field, prefer it; otherwise stringify safely
        assistantContent = data.reply.text || data.reply.content || JSON.stringify(data.reply);
      }
      setMessages((m) => [...m, { role: "assistant", content: assistantContent }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Có lỗi kết nối. Bạn thử lại nhé." }]);
    } finally {
      setLoading(false);
    }
  }

  // Câu hỏi gợi ý theo vai trò (Chỉ về tâm lý học đường - tính năng đã hoàn thiện)
  const quickQuestions = {
    student: [
      "Bạn bè trêu chọc – mình nên làm gì?",
      "Em đang căng thẳng trước kiểm tra",
      "Nếu em bị bạn bè trêu chọc thì nên làm gì?",
      "Mình cảm thấy cô đơn ở trường",
      "Làm sao để tự tin hơn khi nói trước lớp?",
      "Em sợ đi học vì bị bắt nạt",
      "Cách giảm stress khi áp lực học tập"
    ],
    teacher: [
      "Cách quản lý lớp học hiệu quả",
      "Phương pháp dạy học tích cực",
      "Xử lý xung đột giữa học sinh",
      "Hỗ trợ học sinh có khó khăn học tập",
      "Quy trình báo cáo kết quả học tập",
      "Tài liệu giảng dạy môn...",
      "Lịch họp giáo viên tháng này"
    ],
    parent: [
      "Cách theo dõi kết quả học tập của con",
      "Con em bị bạn bè bắt nạt, phải làm sao?",
      "Lịch họp phụ huynh kỳ này",
      "Cách hỗ trợ con ôn thi hiệu quả",
      "Con em hay quên bài, cần làm gì?",
      "Thông tin về học phí và các khoản thu",
      "Quy định đưa đón học sinh"
    ]
  };

  const quick = userRole ? quickQuestions[userRole] : [];

  function handleRoleSelect(role) {
    setUserRole(role);
    const roleNames = {
      student: 'Học sinh',
      teacher: 'Giáo viên',
      parent: 'Phụ huynh'
    };
    
    // Nếu là học sinh, hỏi lớp
    if (role === 'student') {
      setMessages((m) => [...m, 
        { role: "user", content: `Tôi là ${roleNames[role]}` },
        { role: "assistant", content: `Chào em! Em học lớp nào? (Ví dụ: 6/1, 7/2, 8/3)` }
      ]);
    } else {
      setMessages((m) => [...m, 
        { role: "user", content: `Tôi là ${roleNames[role]}` },
        { role: "assistant", content: `Chào ${roleNames[role]}! Mình có thể giúp gì cho bạn? Bạn có thể chọn một trong các câu hỏi gợi ý bên dưới hoặc nhập câu hỏi của riêng bạn.` }
      ]);
    }
  }

  async function handleEmergency() {
    setIsEmergency(true);
    
    const emergencyPrompt = {
      student: "Em đang gặp tình huống khẩn cấp. Để mình có thể hỗ trợ em tốt nhất, em vui lòng cho mình biết:\n\n1. Tên và lớp của em\n2. Em đang gặp vấn đề gì?\n3. Tình huống này có nguy hiểm không?\n\nThông tin của em sẽ được bảo mật và chỉ chia sẻ với cô/thầy phụ trách nếu cần thiết.",
      teacher: "Thầy/cô đang gặp tình huống khẩn cấp. Vui lòng mô tả chi tiết tình huống để mình có thể hỗ trợ hoặc chuyển đến bộ phận phụ trách phù hợp.",
      parent: "Phụ huynh đang gặp tình huống khẩn cấp liên quan đến con em. Vui lòng cho mình biết:\n\n1. Tên và lớp của con\n2. Vấn đề cụ thể\n3. Mức độ khẩn cấp\n\nMình sẽ giúp kết nối với GVCN hoặc bộ phận phụ trách."
    };
    
    setMessages((m) => [...m, {
      role: "assistant",
      content: emergencyPrompt[userRole] || emergencyPrompt.student
    }]);
    
    // Gọi API để xử lý chế độ khẩn cấp
    // AI sẽ tự động thu thập thông tin trong các tin nhắn tiếp theo
  }

  // Hàm lưu session vào localStorage (đồng bộ để đảm bảo lưu được khi đóng tab)
  async function saveSession(messages) {
    try {
      setSaveStatus("saving");
      
      let sid = sessionId;
      if (!sid || sid.length < 10) {
        sid = uuidv4();
        setSessionId(sid);
      }

      // Chuẩn bị emergency data
      const emergencyData = isEmergency ? {
        isEmergency: true,
        level: emergencyInfo?.level || 'YELLOW',
        keywords: emergencyInfo?.keywords || []
      } : {
        isEmergency: false,
        level: 'GREEN',
        keywords: []
      };

      // Gửi lên Supabase
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          messages: messages,
          userRole: userRole,
          userClass: userClass,
          emergencyData: emergencyData
        })
      });

      const data = await response.json();

      if (data.ok) {
        console.log('✅ Session saved to Supabase:', sid, 'Emergency:', isEmergency);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(""), 2000);
      } else {
        console.error('❌ Error saving to Supabase:', data.error);
        setSaveStatus("");
      }
    } catch (error) {
      console.error('❌ Error saving session:', error);
      setSaveStatus("");
    }
  }

  // Tự động lưu khi có tin nhắn mới (sau mỗi lần chat)
  useEffect(() => {
    if (messages.length > 1) { // Chỉ lưu khi có ít nhất 1 tin nhắn từ user
      saveSession(messages);
    }
  }, [messages]);

  // Tự động lưu định kỳ mỗi 10 giây (nếu có thay đổi)
  useEffect(() => {
    const interval = setInterval(() => {
      if (messages.length > 1) {
        saveSession(messages);
      }
    }, 10000); // 10 giây
    return () => clearInterval(interval);
  }, [messages]);

  // Lưu khi đóng tab hoặc chuyển trang
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (messages.length > 1) {
        saveSession(messages);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [messages, sessionId, userRole, isEmergency, emergencyInfo]);

  // Nút kết thúc chat
  function endChat() {
    saveSession(messages);
    router.push("/thank-you");
  }

  return (
    <div className="chat-container w-full max-w-xl mx-auto my-4 sm:my-8 bg-gradient-to-br from-blue-100 to-blue-300 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-blue-300 flex flex-col">
      <div className="px-3 sm:px-4 py-3 sm:py-4 border-b bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl sm:rounded-t-3xl flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className="inline-block bg-white rounded-full p-1.5 sm:p-2 shadow text-blue-600 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm-6 8v-2a4 4 0 014-4h4a4 4 0 014 4v2" /></svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="chat-header-title text-lg sm:text-xl font-bold text-white drop-shadow truncate">Trợ lý học đường</div>
            <div className="chat-header-subtitle text-xs text-blue-100 hidden sm:block">AI hỗ trợ thông tin & kỹ năng học tập</div>
          </div>
        </div>
        {saveStatus && (
          <div className="flex items-center gap-1 text-xs text-white bg-white/20 px-2 py-1 rounded-full">
            {saveStatus === "saving" ? (
              <>
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Đã lưu</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="px-2 sm:px-3 py-2 sm:py-3 flex gap-1.5 sm:gap-2 flex-wrap border-b bg-blue-50">
        {!userRole ? (
          // Hiển thị lựa chọn vai trò
          <>
            <div className="w-full text-xs sm:text-sm font-semibold text-blue-700 mb-1">Vui lòng chọn vai trò:</div>
            <button onClick={() => handleRoleSelect('student')}
              className="role-button flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-blue-400 bg-white text-blue-700 hover:bg-blue-100 font-semibold transition shadow-lg hover:shadow-xl flex-1 sm:flex-initial justify-center">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
              <span>Học sinh</span>
            </button>
            <button onClick={() => handleRoleSelect('teacher')}
              className="role-button flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-green-400 bg-white text-green-700 hover:bg-green-100 font-semibold transition shadow-lg hover:shadow-xl flex-1 sm:flex-initial justify-center">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>Giáo viên</span>
            </button>
            <button onClick={() => handleRoleSelect('parent')}
              className="role-button flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-purple-400 bg-white text-purple-700 hover:bg-purple-100 font-semibold transition shadow-lg hover:shadow-xl flex-1 sm:flex-initial justify-center">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span>Phụ huynh</span>
            </button>
          </>
        ) : (
          // Hiển thị câu hỏi gợi ý theo vai trò
          <>
            {quick.map((q, idx) => (
              <button key={q} onClick={() => send(q)}
                className="quick-question-btn flex items-center gap-1 text-xs px-2.5 sm:px-3 py-1 rounded-full border border-blue-300 bg-white text-blue-700 hover:bg-blue-100 font-semibold transition shadow text-left">
                <span className="inline-block flex-shrink-0">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
                </span>
                <span className="truncate">{q}</span>
              </button>
            ))}
            <button onClick={handleEmergency} className="quick-question-btn flex items-center gap-1 text-xs px-2.5 sm:px-3 py-1 rounded-full border border-red-400 text-red-600 bg-white hover:bg-red-100 font-semibold transition shadow">
              <span className="inline-block flex-shrink-0">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
              </span>
              <span>Cần hỗ trợ khẩn</span>
            </button>
          </>
        )}
      </div>

      <div ref={listRef} className="chat-messages flex-1 overflow-y-auto px-2 sm:px-3 py-3 sm:py-4 space-y-2 sm:space-y-3 bg-white/80" style={{ minHeight: '50vh', maxHeight: '60vh' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-1.5 sm:gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <span className="inline-block bg-blue-200 rounded-full p-1 shadow flex-shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4zm-6 8v-2a4 4 0 014-4h4a4 4 0 014 4v2" /></svg>
              </span>
            )}
            <div className={`chat-bubble max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 rounded-2xl shadow-lg text-xs sm:text-sm whitespace-pre-wrap break-words ${m.role === "user" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-900"}`}>
              {m.content}
            </div>
            {m.role === "user" && (
              <span className="inline-block bg-blue-600 rounded-full p-1 shadow flex-shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z" /></svg>
              </span>
            )}
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-xs text-blue-500"><span className="animate-spin inline-block"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-30" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4" /></svg></span>Đang soạn trả lời…</div>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="chat-input-form p-3 sm:p-4 border-t flex gap-2 bg-blue-50 rounded-b-2xl sm:rounded-b-3xl">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập nội dung…"
          className="flex-1 border border-blue-300 rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow"
        />
        <button
          type="submit"
          className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500 font-semibold shadow-lg transition flex-shrink-0">
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          <span className="hidden sm:inline">Gửi</span>
        </button>
        <button
          type="button"
          onClick={endChat}
          className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-green-400 text-white hover:from-green-600 hover:to-green-500 font-semibold shadow-lg transition flex-shrink-0">
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="hidden sm:inline">Kết thúc</span>
        </button>
      </form>
    </div>
  );
}
