"use client";
import ChatWidget from "../components/ChatWidget";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Layout 2 cột: Trái (Info) + Phải (Chat) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:items-start">
          
          {/* CỘT TRÁI: Logo + Thông tin + Đăng nhập */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card Logo + Tên trường */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200 hover:shadow-2xl transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Logo trường */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg bg-white">
                  <Image
                    src="/logo-nguyen-hue.jpg"
                    alt="Logo THCS Nguyễn Huệ"
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                </div>
                
                {/* Tên trường */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800 mb-1">
                    THCS Nguyễn Huệ
                  </h1>
                  <p className="text-sm text-blue-600 font-medium">
                    Trường Trung học Cơ sở
                  </p>
                </div>
              </div>
            </div>

            {/* Card Giới thiệu Trợ lý AI */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">Trợ lý AI Học đường</h2>
              </div>
              
              <div className="space-y-3 text-sm">
                <p className="leading-relaxed">
                  Chào mừng bạn đến với <strong>Trợ lý AI</strong> của trường THCS Nguyễn Huệ!
                </p>
                
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="font-semibold mb-2">✨ Tôi có thể giúp bạn:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Tư vấn học tập & kỹ năng</li>
                    <li>• Hỗ trợ tâm lý học đường</li>
                    <li>• Tra cứu quy định nhà trường</li>
                    <li>• Giải đáp thắc mắc nhanh chóng</li>
                  </ul>
                </div>

                <p className="text-xs opacity-90 italic">
                  💬 Hãy chọn vai trò và bắt đầu trò chuyện với tôi bên phải!
                </p>
              </div>
            </div>

            {/* Card Đăng nhập Admin */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Quản trị viên</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Dành cho giáo viên và ban quản lý trường để xem lịch sử chat và quản lý hệ thống.
              </p>
              
              <Link href="/admin-login">
                <button className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl shadow-lg hover:from-gray-800 hover:to-gray-700 font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Đăng nhập Admin
                </button>
              </Link>
            </div>

            {/* Card Thông tin liên hệ */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg p-5 border border-green-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lưu ý quan trọng
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nếu bạn gặp tình huống <strong className="text-red-600">khẩn cấp</strong>, 
                vui lòng nhấn nút <strong>"Cần hỗ trợ khẩn"</strong> trong khung chat 
                hoặc liên hệ trực tiếp với giáo viên chủ nhiệm.
              </p>
            </div>

          </div>

          {/* CỘT PHẢI: Chat Widget */}
          <div className="lg:col-span-8">
            <ChatWidget />
          </div>

        </div>
      </div>
    </main>
  );
}
