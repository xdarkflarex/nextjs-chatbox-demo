"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("admin")) {
      router.push("/admin-login");
      return;
    }
    fetchAnalytics();
  }, [router, period]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?period=${period}`);
      const data = await response.json();
      
      if (data.ok) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">Đang tải analytics...</h2>
        </div>
      </div>
    );
  }

  const { overview, dimensions, safety, timeline, heatmap } = analytics || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800">
                📊 Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Phân tích chuyên sâu chatbot tâm lý học đường
              </p>
            </div>
            <div className="flex gap-3">
              {/* Period Selector */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-blue-300 rounded-xl font-semibold text-blue-700 hover:bg-blue-50 transition-all"
              >
                <option value="7d">7 ngày</option>
                <option value="30d">30 ngày</option>
                <option value="90d">90 ngày</option>
              </select>
              
              <Link
                href="/admin"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all"
              >
                ← Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== 1. KPI CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sessions */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-90">Tổng phiên chat</div>
              <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="text-4xl font-bold mb-1">{overview?.totalSessions || 0}</div>
            <div className="text-xs opacity-75">{overview?.uniqueUsers || 0} người dùng duy nhất</div>
          </div>

          {/* Completion Rate */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-90">Tỉ lệ hoàn tất</div>
              <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold mb-1">{overview?.completionRate || 0}%</div>
            <div className="text-xs opacity-75">Phiên kết thúc tự nhiên</div>
          </div>

          {/* Median Duration */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-90">Thời lượng TB</div>
              <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold mb-1">{overview?.medianDuration || 0}<span className="text-2xl">m</span></div>
            <div className="text-xs opacity-75">{overview?.medianTurns || 0} lượt trao đổi TB</div>
          </div>

          {/* Risk Flag Rate */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-90">Tỉ lệ cờ rủi ro</div>
              <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-4xl font-bold mb-1">{overview?.riskFlagRate || 0}%</div>
            <div className="text-xs opacity-75">Leo thang: {overview?.escalationRate || 0}%</div>
          </div>
        </div>

        {/* ===== 2. PERFORMANCE METRICS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Hiệu suất Bot</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">P50 Latency</span>
                  <span className="font-bold text-blue-600">{overview?.p50Latency || 0}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min((overview?.p50Latency || 0) / 3000 * 100, 100)}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">P90 Latency</span>
                  <span className="font-bold text-purple-600">{overview?.p90Latency || 0}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: `${Math.min((overview?.p90Latency || 0) / 5000 * 100, 100)}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">RAG Usage</span>
                  <span className="font-bold text-green-600">{safety?.ragUsageRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${safety?.ragUsageRate || 0}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🚨 An Toàn</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">🟢 Bình thường</span>
                <span className="text-2xl font-bold text-green-600">{dimensions?.byEmergency?.GREEN || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">🟡 Cần theo dõi</span>
                <span className="text-2xl font-bold text-yellow-600">{dimensions?.byEmergency?.YELLOW || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">🔴 Khẩn cấp</span>
                <span className="text-2xl font-bold text-red-600">{dimensions?.byEmergency?.RED || 0}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">Thời gian phản ứng TB</div>
                <div className="text-xl font-bold text-blue-600">{safety?.avgRiskResponseTime || 0}s</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Escalation</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đã đánh dấu</span>
                <span className="text-2xl font-bold text-orange-600">{safety?.escalationOutcomes?.flagged || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đã xử lý</span>
                <span className="text-2xl font-bold text-green-600">{safety?.escalationOutcomes?.resolved || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đang chờ</span>
                <span className="text-2xl font-bold text-yellow-600">{safety?.escalationOutcomes?.pending || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 3. TIMELINE CHART ===== */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Xu hướng theo thời gian</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEmergencies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="sessions" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSessions)" name="Phiên chat" />
              <Area type="monotone" dataKey="emergencies" stroke="#EF4444" fillOpacity={1} fill="url(#colorEmergencies)" name="Khẩn cấp" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ===== 4. DIMENSIONS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Role */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Phân bố người dùng</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                {name: 'Học sinh', value: dimensions?.byRole?.student || 0},
                {name: 'Giáo viên', value: dimensions?.byRole?.teacher || 0},
                {name: 'Phụ huynh', value: dimensions?.byRole?.parent || 0}
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Classes */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🎓 Top lớp học</h3>
            <div className="space-y-2">
              {dimensions?.topClasses?.slice(0, 8).map((cls, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-16 text-sm font-semibold text-gray-700">{cls.name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{width: `${(cls.count / (dimensions?.topClasses[0]?.count || 1)) * 100}%`}}
                    >
                      <span className="text-white text-xs font-bold">{cls.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== 5. TOP KEYWORDS ===== */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🔑 Từ khóa khẩn cấp phổ biến</h3>
          <div className="flex flex-wrap gap-2">
            {dimensions?.topKeywords?.map((kw, idx) => (
              <div key={idx} className="px-4 py-2 bg-red-100 text-red-700 rounded-full border-2 border-red-300">
                <span className="font-semibold">{kw.keyword}</span>
                <span className="ml-2 text-sm opacity-75">({kw.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 6. HEATMAP ===== */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🔥 Heatmap hoạt động (Giờ × Ngày)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {heatmap?.labels?.hours.map((h, i) => (
                    <th key={i} className="p-1 text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap?.data?.map((row, dayIdx) => (
                  <tr key={dayIdx}>
                    <td className="p-2 font-semibold">{heatmap.labels.days[dayIdx]}</td>
                    {row.map((count, hourIdx) => {
                      const maxCount = Math.max(...heatmap.data.flat());
                      const intensity = maxCount > 0 ? count / maxCount : 0;
                      const bgColor = intensity === 0 ? 'bg-gray-100' :
                                     intensity < 0.25 ? 'bg-blue-200' :
                                     intensity < 0.5 ? 'bg-blue-400' :
                                     intensity < 0.75 ? 'bg-blue-600' : 'bg-blue-800';
                      const textColor = intensity > 0.5 ? 'text-white' : 'text-gray-800';
                      return (
                        <td key={hourIdx} className={`p-2 text-center ${bgColor} ${textColor} border border-white`}>
                          {count > 0 ? count : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border"></div>
              <span>Không có</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200"></div>
              <span>Thấp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600"></div>
              <span>Cao</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
