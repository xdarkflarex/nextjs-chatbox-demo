"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ThankYou() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-blue-200 text-center max-w-lg w-full animate-slideUp">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-full animate-pulse">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Cảm ơn bạn! 🎉
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6 text-lg">
          Nhà trường đã nhận được thông tin và sẽ phản hồi hoặc hỗ trợ bạn sớm nhất có thể.
        </p>

        {/* Countdown */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
          <p className="text-sm text-gray-600 mb-2">
            Tự động quay về trang chủ sau
          </p>
          <div className="text-5xl font-bold text-blue-600 animate-pulse">
            {countdown}
          </div>
          <p className="text-xs text-gray-500 mt-2">giây</p>
        </div>

        {/* Manual Button */}
        <Link href="/">
          <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl font-semibold transition-all transform hover:scale-105">
            Quay về ngay
          </button>
        </Link>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-amber-700 text-left">
              Nếu cần hỗ trợ khẩn cấp, vui lòng liên hệ:
              <br />
              <strong>Cô Lan Phương: 0905887689</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
