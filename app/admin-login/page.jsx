"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Hardcode tài khoản demo
    setTimeout(() => {
      if (user === "admin" && pass === "123") {
        localStorage.setItem("admin", "1");
        router.push("/admin");
      } else {
        setError("Sai tài khoản hoặc mật khẩu");
        setLoading(false);
      }
    }, 500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo và tên trường */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl bg-white">
              <Image
                src="/logo-nguyen-hue.jpg"
                alt="Logo THCS Nguyễn Huệ"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-800 mb-1">
            THCS Nguyễn Huệ
          </h1>
          <p className="text-sm text-blue-600 font-medium">
            Hệ thống quản lý trợ lý AI
          </p>
        </div>

        {/* Form đăng nhập */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Đăng nhập Admin</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Tài khoản */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tài khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  placeholder="Nhập tài khoản"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <input
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  type="password"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Thông báo lỗi */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-sm animate-shake">
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Thông tin demo */}
          <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Tài khoản demo:</p>
                <p>Tài khoản: <code className="bg-white px-2 py-0.5 rounded font-mono">admin</code></p>
                <p>Mật khẩu: <code className="bg-white px-2 py-0.5 rounded font-mono">123</code></p>
              </div>
            </div>
          </div>
        </div>

        {/* Link quay lại */}
        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
