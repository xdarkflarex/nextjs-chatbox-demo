"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("admin")) {
      router.push("/admin-login");
      return;
    }
    fetchStats();
  }, [router]);

  async function fetchStats() {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (data.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">Đang tải thống kê...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800">
                📊 Dashboard Thống Kê
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Tổng quan hoạt động trợ lý AI
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all"
              >
                ← Quay lại
              </Link>
              <Link
                href="/"
                onClick={() => localStorage.removeItem("admin")}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold shadow-lg hover:bg-red-700 transition-all"
              >
                Đăng xuất
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Role Distribution */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              Phân bố người dùng
            </h3>
            <div className="space-y-4">
              {/* Students */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">🎓 Học sinh</span>
                  <span className="text-sm font-bold text-blue-600">{stats?.byRole?.student || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{width: `${stats?.totalSessions > 0 ? (stats?.byRole?.student || 0) / stats.totalSessions * 100 : 0}%`}}
                  ></div>
                </div>
              </div>

              {/* Teachers */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">👨‍🏫 Giáo viên</span>
                  <span className="text-sm font-bold text-purple-600">{stats?.byRole?.teacher || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{width: `${stats?.totalSessions > 0 ? (stats?.byRole?.teacher || 0) / stats.totalSessions * 100 : 0}%`}}
                  ></div>
                </div>
              </div>

              {/* Parents */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">👨‍👩‍👧 Phụ huynh</span>
                  <span className="text-sm font-bold text-green-600">{stats?.byRole?.parent || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{width: `${stats?.totalSessions > 0 ? (stats?.byRole?.parent || 0) / stats.totalSessions * 100 : 0}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Level Distribution */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-red-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </span>
              Mức độ khẩn cấp
            </h3>
            <div className="space-y-4">
              {/* Green */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">🟢 Bình thường</span>
                  <span className="text-sm font-bold text-green-600">{stats?.byEmergency?.GREEN || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{width: `${stats?.totalSessions > 0 ? (stats?.byEmergency?.GREEN || 0) / stats.totalSessions * 100 : 0}%`}}
                  ></div>
                </div>
              </div>

              {/* Yellow */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">🟡 Cần theo dõi</span>
                  <span className="text-sm font-bold text-yellow-600">{stats?.byEmergency?.YELLOW || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{width: `${stats?.totalSessions > 0 ? (stats?.byEmergency?.YELLOW || 0) / stats.totalSessions * 100 : 0}%`}}
                  ></div>
                </div>
              </div>

              {/* Red */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">🔴 Khẩn cấp</span>
                  <span className="text-sm font-bold text-red-600">{stats?.byEmergency?.RED || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                    style={{width: `${stats?.totalSessions > 0 ? (stats?.byEmergency?.RED || 0) / stats.totalSessions * 100 : 0}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-purple-100 p-2 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Hoạt động gần đây
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats?.todaySessions || 0}</div>
              <div className="text-sm text-gray-600">Phiên chat hôm nay</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats?.weekSessions || 0}</div>
              <div className="text-sm text-gray-600">Phiên chat tuần này</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats?.monthSessions || 0}</div>
              <div className="text-sm text-gray-600">Phiên chat tháng này</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
