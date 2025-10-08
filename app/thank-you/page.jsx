"use client";
import Link from "next/link";

export default function ThankYou() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200 text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">Cảm ơn bạn đã liên hệ!</h1>
        <p className="text-blue-700 mb-4">Nhà trường sẽ phản hồi hoặc hỗ trợ bạn sớm nhất có thể.</p>
        <Link href="/">
          <button className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-semibold">Quay về trang chủ</button>
        </Link>
      </div>
    </div>
  );
}
