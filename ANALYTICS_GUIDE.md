# 📊 Analytics Dashboard - Hướng Dẫn

## ✅ Đã Hoàn Thành

### 1. API Analytics (`/api/analytics`)
- ✅ KPI tổng quan (8 metrics)
- ✅ Phân tích theo chiều (role, class, emergency)
- ✅ Chất lượng & an toàn
- ✅ Timeline theo ngày
- ✅ Heatmap giờ × ngày

### 2. Dashboard UI (`/admin/analytics`)
- ✅ 4 KPI cards với gradient
- ✅ Performance metrics (latency, RAG usage)
- ✅ Safety metrics (emergency levels)
- ✅ Area chart timeline
- ✅ Bar chart phân bố người dùng
- ✅ Top classes với progress bars
- ✅ Top keywords khẩn cấp
- ✅ Heatmap hoạt động

### 3. Charts Library
- ✅ Cài đặt Recharts
- ✅ LineChart, AreaChart, BarChart
- ✅ Responsive design

---

## 📊 Metrics Đã Implement

### 1. KPI Tổng Quan (Header Cards)

| Metric | Mô tả | Công thức |
|--------|-------|-----------|
| **Tổng phiên chat** | Số phiên trong khoảng thời gian | `COUNT(sessions)` |
| **Người dùng duy nhất** | Unique users | `COUNT(DISTINCT user_id)` |
| **Tỉ lệ hoàn tất** | Phiên có `ended_at` | `(completed / total) * 100` |
| **Thời lượng TB** | Median duration (phút) | `MEDIAN(ended_at - created_at)` |
| **Lượt trao đổi TB** | Median turns/session | `MEDIAN(user_messages_count)` |
| **P50 Latency** | Bot response time p50 | `PERCENTILE(response_time_ms, 0.5)` |
| **P90 Latency** | Bot response time p90 | `PERCENTILE(response_time_ms, 0.9)` |
| **Tỉ lệ leo thang** | Sessions có emergency | `(is_emergency / total) * 100` |
| **Tỉ lệ cờ rủi ro** | YELLOW + RED sessions | `((YELLOW + RED) / total) * 100` |

### 2. Phân Tích Theo Chiều

**Theo vai trò:**
- 🎓 Học sinh
- 👨‍🏫 Giáo viên
- 👨‍👩‍👧 Phụ huynh

**Theo lớp:**
- Top 10 lớp có nhiều phiên nhất
- Progress bar visualization

**Theo mức khẩn cấp:**
- 🟢 GREEN: Bình thường
- 🟡 YELLOW: Cần theo dõi
- 🔴 RED: Khẩn cấp

**Top keywords:**
- 10 từ khóa khẩn cấp phổ biến nhất
- Số lần xuất hiện

### 3. Chất Lượng & An Toàn

| Metric | Mô tả |
|--------|-------|
| **Risk Detection** | Số phiên theo level (RED/YELLOW/GREEN) |
| **Avg Risk Response Time** | Thời gian từ phát hiện → bot phản hồi |
| **RAG Usage Rate** | % messages sử dụng RAG |
| **Escalation Outcomes** | Flagged / Resolved / Pending |

### 4. Timeline

- **Area Chart** hiển thị:
  - Số phiên chat theo ngày
  - Số phiên khẩn cấp theo ngày
  - Gradient fill đẹp mắt

### 5. Heatmap

- **Giờ × Ngày trong tuần**
- Màu sắc theo intensity:
  - Xám: Không có
  - Xanh nhạt: Thấp
  - Xanh đậm: Cao

---

## 🎯 Metrics KHÔNG Implement (Chưa Có Data)

### ❌ Không có trong database:

1. **CSAT (Customer Satisfaction)**
   - Cần thêm: `satisfaction_score` (1-5) vào `chat_sessions`
   - Hỏi sau mỗi phiên

2. **Sentiment Analysis**
   - Cần AI phân tích cảm xúc
   - Lưu vào `messages.metadata`

3. **Chủ đề (Topic Taxonomy)**
   - Cần classify: Học tập, Quan hệ, Gia đình, etc.
   - Lưu vào `chat_sessions.metadata`

4. **Retention / Cohort**
   - Cần track user quay lại
   - Cần `user_id` persistent

5. **Kênh truy cập**
   - Cần track: web/app/QR
   - Lưu vào `chat_sessions.metadata`

6. **Thiết bị**
   - Cần track: mobile/desktop
   - Lưu vào `chat_sessions.metadata`

---

## 🚀 Cách Sử Dụng

### 1. Vào Analytics Dashboard

```
http://localhost:3000/admin
→ Click nút "Analytics" (màu indigo)
```

### 2. Chọn Khoảng Thời Gian

```
Dropdown: 7 ngày / 30 ngày / 90 ngày
```

### 3. Xem Metrics

**KPI Cards:**
- Tổng phiên chat
- Tỉ lệ hoàn tất
- Thời lượng TB
- Tỉ lệ cờ rủi ro

**Performance:**
- P50/P90 Latency
- RAG Usage Rate

**Safety:**
- Emergency levels
- Escalation outcomes

**Charts:**
- Timeline: Xu hướng theo ngày
- Bar chart: Phân bố người dùng
- Top classes: Progress bars
- Heatmap: Giờ × Ngày

---

## 📊 Ví Dụ Dữ Liệu

### API Response

```json
{
  "ok": true,
  "period": "30d",
  "analytics": {
    "overview": {
      "totalSessions": 150,
      "uniqueUsers": 45,
      "completionRate": 78.5,
      "medianDuration": "5.2",
      "medianTurns": 4,
      "p50Latency": 1200,
      "p90Latency": 2500,
      "escalationRate": 8.5,
      "riskFlagRate": 12.3,
      "totalMessages": 1200
    },
    "dimensions": {
      "byRole": {
        "student": 100,
        "teacher": 30,
        "parent": 20
      },
      "topClasses": [
        {"name": "6/1", "count": 25},
        {"name": "7/2", "count": 20}
      ],
      "byEmergency": {
        "GREEN": 130,
        "YELLOW": 15,
        "RED": 5
      },
      "topKeywords": [
        {"keyword": "bắt nạt", "count": 8},
        {"keyword": "căng thẳng", "count": 12}
      ]
    },
    "safety": {
      "riskDetection": {
        "RED": 5,
        "YELLOW": 15,
        "GREEN": 130
      },
      "avgRiskResponseTime": 2.5,
      "ragUsageRate": 65.5,
      "escalationOutcomes": {
        "flagged": 20,
        "resolved": 15,
        "pending": 5
      }
    },
    "timeline": [
      {
        "date": "2024-10-01",
        "sessions": 5,
        "messages": 40,
        "emergencies": 1,
        "users": 4
      }
    ],
    "heatmap": {
      "data": [[0,0,0,...], [1,2,3,...], ...],
      "labels": {
        "days": ["CN","T2","T3",...],
        "hours": ["0h","1h",...]
      }
    }
  }
}
```

---

## 🧪 Test

### 1. Test API

```bash
curl http://localhost:3000/api/analytics?period=30d
```

**Phải thấy:**
- `ok: true`
- `analytics.overview` có đầy đủ metrics
- `analytics.timeline` có data theo ngày
- `analytics.heatmap` có ma trận 7×24

### 2. Test Dashboard

```
1. Vào http://localhost:3000/admin
2. Click "Analytics"
3. Chọn "30 ngày"
```

**Phải thấy:**
- 4 KPI cards hiển thị số liệu
- Area chart có đường xu hướng
- Bar chart phân bố người dùng
- Heatmap có màu sắc

### 3. Test Responsive

```
F12 → Toggle device toolbar
→ Test mobile/tablet
```

---

## 🎨 Customization

### Thêm Metric Mới

**1. Update API (`app/api/analytics/route.js`):**

```javascript
function calculateOverview(sessions, messages) {
  // ... existing code
  
  // Thêm metric mới
  const avgMessagesPerSession = totalSessions > 0
    ? (messages.length / totalSessions).toFixed(1)
    : 0;
  
  return {
    // ... existing metrics
    avgMessagesPerSession: parseFloat(avgMessagesPerSession)
  };
}
```

**2. Update UI (`app/admin/analytics/page.jsx`):**

```jsx
<div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
  <div className="text-sm opacity-90">Tin nhắn TB/phiên</div>
  <div className="text-4xl font-bold">{overview?.avgMessagesPerSession || 0}</div>
</div>
```

### Thêm Chart Mới

**Pie Chart Example:**

```jsx
import { PieChart, Pie, Cell } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={[
        {name: 'Học sinh', value: dimensions?.byRole?.student},
        {name: 'Giáo viên', value: dimensions?.byRole?.teacher},
        {name: 'Phụ huynh', value: dimensions?.byRole?.parent}
      ]}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={100}
      label
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

---

## 🔮 Nâng Cấp Tương Lai

### Phase 2: CSAT & Sentiment

**1. Thêm vào database:**

```sql
ALTER TABLE chat_sessions 
ADD COLUMN satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5);

ALTER TABLE messages
ADD COLUMN sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative'));
```

**2. Implement trong chat:**

```javascript
// Sau khi kết thúc phiên
const rating = await askUserRating(); // 1-5 stars
await updateSession(sessionId, { satisfaction_score: rating });
```

**3. Analytics:**

```javascript
const avgCSAT = sessions
  .filter(s => s.satisfaction_score)
  .reduce((sum, s) => sum + s.satisfaction_score, 0) / sessions.length;
```

### Phase 3: Topic Classification

**1. AI classify topics:**

```javascript
const topics = await classifyTopics(messages);
// → ['học tập', 'quan hệ bạn bè', 'gia đình']
```

**2. Lưu vào metadata:**

```javascript
await updateSession(sessionId, {
  metadata: { topics: ['học tập', 'quan hệ'] }
});
```

**3. Analytics:**

```javascript
const topicCount = {};
sessions.forEach(s => {
  s.metadata?.topics?.forEach(topic => {
    topicCount[topic] = (topicCount[topic] || 0) + 1;
  });
});
```

### Phase 4: Retention & Cohort

**1. Track returning users:**

```sql
SELECT 
  user_id,
  MIN(created_at) as first_session,
  COUNT(*) as total_sessions,
  MAX(created_at) as last_session
FROM chat_sessions
GROUP BY user_id;
```

**2. Cohort analysis:**

```javascript
// Users who returned after 7 days
const retention7d = users.filter(u => {
  const daysSinceFirst = (u.last_session - u.first_session) / (1000 * 60 * 60 * 24);
  return daysSinceFirst >= 7;
}).length;
```

---

## ✅ Checklist

- [x] Tạo API `/api/analytics`
- [x] Implement KPI calculations
- [x] Tạo dashboard UI
- [x] Thêm charts (Area, Bar, Heatmap)
- [x] Thêm link Analytics vào admin
- [x] Cài đặt Recharts
- [ ] Test với data thật
- [ ] Verify tất cả metrics
- [ ] Test responsive mobile

---

**Vào analytics ngay! 📊**

```
http://localhost:3000/admin
→ Click "Analytics"
```
