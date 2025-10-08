"use client";
import ChatWidget from "../components/ChatWidget";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-2xl text-center mb-6 bg-white/80 rounded-xl shadow-lg p-8 border-2 border-blue-200">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Demo Trợ lý học đường</h1>
        <p className="text-blue-700 mt-2 text-lg">
          Đây là trang demo. Chat trực tiếp với trợ lý AI bên dưới.<br />
          <Link href="/admin-login">
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-semibold">Đăng nhập admin</button>
          </Link>
        </p>
      </div>
      <div className="w-full flex justify-center">
        <ChatWidget />
      </div>
    </main>
  );
}
