# 📊 Dashboard & Loading UI Guide

## ✅ Đã Hoàn Thành

### 1. Loading UI/UX Đẹp ✨

**Cải thiện:**
- ✅ Animated spinner với gradient
- ✅ Progress dots bounce animation
- ✅ Modern card design với shadow
- ✅ Smooth transitions

**Trước:**
```
[Spinner đơn giản]
Đang tải dữ liệu...
```

**Sau:**
```
[Animated gradient circle]
[Spinning icon inside]
Đang tải dữ liệu
Vui lòng đợi trong giây lát...
[● ● ● Bouncing dots]
```

### 2. Dashboard Thống Kê 📈

**Trang mới:** `/admin/dashboard`

**Features:**
- ✅ 4 stat cards với gradient
- ✅ User role distribution chart
- ✅ Emergency level distribution
- ✅ Recent activity metrics
- ✅ Real-time data từ Supabase

---

## 🎨 Loading UI Details

### Loading States

**1. Loading Data:**
```jsx
<div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
  <div className="bg-white rounded-3xl shadow-2xl p-12">
    {/* Animated logo với gradient ring */}
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse">
      <svg className="animate-spin">...</svg>
    </div>
    <h2>Đang tải dữ liệu</h2>
    {/* Bouncing dots */}
  </div>
</div>
```

**2. Summarizing:**
```jsx
<div className="bg-gradient-to-r from-purple-500 to-pink-500">
  <svg>Document icon</svg>
  <h2>Đang tóm tắt nội dung</h2>
  <p>AI đang phân tích các phiên chat...</p>
</div>
```

---

## 📊 Dashboard Features

### Stat Cards

**1. Total Sessions (Blue)**
```
📱 Icon: Chat bubble
📊 Number: Total sessions
📈 Trend: +X hôm nay
```

**2. Total Messages (Purple)**
```
💬 Icon: Message
📊 Number: Total messages
📈 Average: X tin/phiên
```

**3. Emergency Sessions (Red)**
```
⚠️ Icon: Alert triangle
📊 Number: Emergency count
📈 Percentage: X% tổng số
```

**4. Active Users (Green)**
```
👥 Icon: Users
📊 Number: Active users
📈 Period: 7 ngày qua
```

### Charts

**1. User Role Distribution**
- 🎓 Học sinh (Blue bar)
- 👨‍🏫 Giáo viên (Purple bar)
- 👨‍👩‍👧 Phụ huynh (Green bar)

**2. Emergency Level**
- 🟢 Bình thường (Green bar)
- 🟡 Cảnh báo (Yellow bar)
- 🔴 Khẩn cấp (Red bar)

**3. Recent Activity**
- Hôm nay
- Tuần này
- Tháng này

---

## 🔧 API Stats

### Endpoint: `/api/stats`

**Response:**
```json
{
  "ok": true,
  "stats": {
    "totalSessions": 150,
    "totalMessages": 1200,
    "emergencySessions": 5,
    "todaySessions": 10,
    "weekSessions": 45,
    "monthSessions": 120,
    "byRole": {
      "student": 100,
      "teacher": 30,
      "parent": 20
    },
    "byEmergency": {
      "GREEN": 140,
      "YELLOW": 8,
      "RED": 2
    },
    "activeUsers": 45
  }
}
```

### Queries Sử Dụng

**1. Get all sessions:**
```sql
SELECT * FROM chat_sessions
ORDER BY created_at DESC;
```

**2. Count by role:**
```sql
SELECT 
    user_role,
    COUNT(*) as count
FROM chat_sessions
GROUP BY user_role;
```

**3. Count by emergency:**
```sql
SELECT 
    emergency_level,
    COUNT(*) as count
FROM chat_sessions
GROUP BY emergency_level;
```

**4. Recent sessions:**
```sql
SELECT COUNT(*) 
FROM chat_sessions
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

## 🧪 Test

### Bước 1: Vào Admin

```
http://localhost:3000/admin
```

**Phải thấy:**
- ✅ Loading animation đẹp
- ✅ Nút "Dashboard" màu xanh lá

### Bước 2: Click Dashboard

```
Click nút "📊 Dashboard"
```

**Phải thấy:**
- ✅ 4 stat cards với số liệu
- ✅ 2 charts phân bố
- ✅ Recent activity metrics

### Bước 3: Kiểm Tra Data

**Console:**
```
F12 → Network → /api/stats
→ Response phải có data
```

**Supabase:**
```sql
SELECT COUNT(*) FROM chat_sessions;
-- Phải match với totalSessions
```

---

## 🎯 Dashboard Metrics Explained

### Total Sessions
- **Tính:** Tổng số phiên chat
- **Source:** `COUNT(*) FROM chat_sessions`

### Total Messages
- **Tính:** Tổng số tin nhắn
- **Source:** `SUM(total_messages) FROM chat_sessions`

### Emergency Sessions
- **Tính:** Số phiên khẩn cấp
- **Source:** `COUNT(*) WHERE is_emergency = true`

### Active Users
- **Tính:** Số phiên trong 7 ngày
- **Source:** `COUNT(*) WHERE created_at >= NOW() - 7 days`

### Today/Week/Month Sessions
- **Tính:** Số phiên theo khoảng thời gian
- **Source:** `COUNT(*) WHERE created_at >= [date]`

---

## 💡 Customization

### Thêm Metric Mới

**1. Update API `/api/stats/route.js`:**
```javascript
const stats = {
  // ... existing stats
  averageResponseTime: calculateAvgResponseTime(sessions),
  topKeywords: getTopKeywords(sessions),
};
```

**2. Update Dashboard UI:**
```jsx
<div className="bg-gradient-to-br from-orange-500 to-orange-600">
  <div className="text-3xl font-bold">{stats.averageResponseTime}s</div>
  <div className="text-sm">Thời gian phản hồi TB</div>
</div>
```

### Thêm Chart Mới

**Line Chart (Sessions over time):**
```jsx
<div className="bg-white rounded-2xl p-6">
  <h3>Xu hướng phiên chat</h3>
  {/* Implement line chart với data theo ngày */}
</div>
```

**Pie Chart (Role distribution):**
```jsx
<div className="bg-white rounded-2xl p-6">
  <h3>Phân bố người dùng</h3>
  {/* Implement pie chart */}
</div>
```

---

## 🚀 Next Steps

### Nâng Cao Dashboard

**1. Real-time Updates:**
```javascript
// Polling mỗi 30s
useEffect(() => {
  const interval = setInterval(fetchStats, 30000);
  return () => clearInterval(interval);
}, []);
```

**2. Export Data:**
```javascript
function exportToCSV() {
  const csv = convertStatsToCSV(stats);
  downloadFile(csv, 'stats.csv');
}
```

**3. Date Range Filter:**
```jsx
<select onChange={(e) => setDateRange(e.target.value)}>
  <option value="7">7 ngày</option>
  <option value="30">30 ngày</option>
  <option value="90">90 ngày</option>
</select>
```

**4. Charts Library:**
```bash
npm install recharts
# hoặc
npm install chart.js react-chartjs-2
```

**Example với Recharts:**
```jsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={sessionsOverTime}>
  <Line type="monotone" dataKey="sessions" stroke="#3B82F6" />
  <XAxis dataKey="date" />
  <YAxis />
</LineChart>
```

---

## ✅ Checklist

- [ ] Vào admin → Thấy loading đẹp
- [ ] Click Dashboard → Thấy stats
- [ ] 4 stat cards hiển thị đúng số
- [ ] Charts hiển thị phân bố
- [ ] Recent activity có data
- [ ] Nút "Quay lại" hoạt động
- [ ] Responsive trên mobile

---

## 🎨 Color Scheme

**Stat Cards:**
- Blue: `from-blue-500 to-blue-600`
- Purple: `from-purple-500 to-purple-600`
- Red: `from-red-500 to-red-600`
- Green: `from-green-500 to-green-600`

**Charts:**
- Student: Blue `#3B82F6`
- Teacher: Purple `#8B5CF6`
- Parent: Green `#10B981`

**Emergency:**
- Green: `#10B981`
- Yellow: `#F59E0B`
- Red: `#EF4444`

---

**Vào dashboard ngay! 📊**

```
http://localhost:3000/admin
→ Click "Dashboard"
```
