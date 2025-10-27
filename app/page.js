"use client";
import { useState, useEffect } from "react";
import ChatWidget from "../components/ChatWidget";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  const [showWelcome, setShowWelcome] = useState(true); // Luôn hiện popup

  useEffect(() => {
    // Popup luôn hiện mỗi lần load trang
    setShowWelcome(true);
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <>
      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-slideUp">
            {/* Close button */}
            <button
              onClick={handleCloseWelcome}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Chào mừng đến với Trợ lý AI! 🤖
            </h2>

            {/* Content */}
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <p className="text-sm">
                  <strong className="text-gray-800">Chọn vai trò</strong> của bạn (Học sinh, Giáo viên, hoặc Phụ huynh)
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <p className="text-sm">
                  <strong className="text-gray-800">Nhập lớp</strong> của bạn để được hỗ trợ tốt hơn
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <p className="text-sm">
                  <strong className="text-gray-800">Bắt đầu trò chuyện</strong> với trợ lý AI
                </p>
              </div>

              {/* Important note */}
              <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-amber-800 mb-1">Lưu ý quan trọng:</p>
                    <p className="text-xs text-amber-700">
                      Để đạt hiệu quả chatbot cao nhất, <strong>mỗi phiên chat nên chỉ tập trung vào 1 nội dung cụ thể</strong>. Nếu bạn có nhiều vấn đề khác nhau, hãy tạo phiên chat mới cho mỗi vấn đề.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleCloseWelcome}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Đã hiểu, bắt đầu ngay!
            </button>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4 md:p-6 lg:p-8 relative overflow-hidden">
        {/* Animated Background - Enhanced */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 via-transparent to-purple-200/40"></div>
          
          {/* Floating orbs - Tăng opacity để thấy rõ hơn */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full opacity-30 blur-3xl animate-float"></div>
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-300 rounded-full opacity-30 blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-400 to-rose-300 rounded-full opacity-25 blur-3xl animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-400 to-blue-300 rounded-full opacity-25 blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-gradient-to-br from-violet-400 to-purple-300 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        </div>
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
                    <li className="flex items-start gap-1">
                      <span>•</span>
                      <span>
                        <strong className="text-green-300">Hỗ trợ tâm lý học đường</strong>
                        <span className="text-green-200 text-[10px] ml-1">(Đã hoàn thiện, đang chạy thử)</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-1 opacity-60">
                      <span>•</span>
                      <span>
                        Tư vấn học tập & kỹ năng
                        <span className="text-yellow-200 text-[10px] ml-1">(Đang phát triển)</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-1 opacity-60">
                      <span>•</span>
                      <span>
                        Tra cứu quy định nhà trường
                        <span className="text-yellow-200 text-[10px] ml-1">(Đang phát triển)</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-1 opacity-60">
                      <span>•</span>
                      <span>
                        Giải đáp thắc mắc nhanh chóng
                        <span className="text-yellow-200 text-[10px] ml-1">(Đang phát triển)</span>
                      </span>
                    </li>
                  </ul>
                </div>

                <p className="text-xs opacity-90 italic">
                  💬 Hãy chọn vai trò và bắt đầu trò chuyện với tôi bên phải!
                </p>
              </div>
            </div>

            {/* Nút xem lại hướng dẫn */}
            <button
              onClick={() => setShowWelcome(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Xem lại hướng dẫn
            </button>

            {/* Card Đăng nhập Admin */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200 mt-6">
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
                Nếu bạn cần hỗ trợ, vui lòng liên hệ trực tiếp với 
                <strong className="text-blue-600"> cán bộ tư vấn trường</strong> hoặc 
                <strong className="text-blue-600"> giáo viên chủ nhiệm</strong> của lớp.
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
    </>
  );
}
