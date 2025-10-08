"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleLogin(e) {
    e.preventDefault();
    // Hardcode tài khoản demo
    if (user === "admin" && pass === "123") {
      localStorage.setItem("admin", "1");
      router.push("/admin");
    } else {
      setError("Sai tài khoản hoặc mật khẩu");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow max-w-xs w-full">
        <h2 className="text-xl font-bold mb-4">Đăng nhập Admin</h2>
        <input value={user} onChange={e=>setUser(e.target.value)} placeholder="Tài khoản" className="mb-2 w-full border rounded px-3 py-2" />
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Mật khẩu" type="password" className="mb-2 w-full border rounded px-3 py-2" />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button className="w-full bg-blue-600 text-white py-2 rounded">Đăng nhập</button>
      </form>
    </div>
  );
}
