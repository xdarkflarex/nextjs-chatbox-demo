# 🧪 Test Flow: Học Sinh Chat → Admin Xem

## ✅ Đã Cập Nhật

### 1. API Sessions (`/api/sessions/route.js`)
- ✅ POST: Lưu session + messages lên Supabase
- ✅ GET: Lấy danh sách sessions từ Supabase
- ✅ DELETE: Xóa session từ Supabase

### 2. API Session Detail (`/api/sessions/[id]/route.js`)
- ✅ GET: Lấy chi tiết session + messages từ Supabase

### 3. Admin Page (`/app/admin/page.jsx`)
- ✅ `fetchSessions()`: Đọc danh sách từ Supabase API
- ✅ `loadSessionMessages()`: Load messages khi click vào session
- ✅ `handleDelete()`: Xóa qua Supabase API

---

## 🔄 Flow Hoàn Chỉnh

### Bước 1: Học Sinh Chat

```
1. Học sinh mở: http://localhost:3000
2. Chọn vai trò: "Học sinh"
3. Nhập lớp: "6/1"
4. Chat: "Em cần hỗ trợ học tập"
5. Bot trả lời
```

**Điều gì xảy ra:**
```javascript
// ChatWidget tự động lưu mỗi 10 giây
→ POST /api/sessions
  {
    userRole: "student",
    userClass: "6/1",
    messages: [
      { sender: "user", text: "Em cần hỗ trợ học tập" },
      { sender: "bot", text: "..." }
    ]
  }

→ Supabase lưu vào:
  - chat_sessions (1 record mới)
  - messages (2 records mới)
```

### Bước 2: Admin Xem

```
1. Giáo viên mở: http://localhost:3000/admin-login
2. Login: admin / admin123
3. Vào dashboard
```

**Điều gì xảy ra:**
```javascript
// Admin page load
→ GET /api/sessions

→ Supabase trả về:
  {
    sessions: [
      {
        id: "uuid-123",
        user_role: "student",
        user_class: "6/1",
        total_messages: 2,
        created_at: "2024-01-15T10:30:00Z"
      }
    ]
  }

→ Admin thấy danh sách sessions
```

### Bước 3: Admin Click Vào Session

```
1. Admin click vào session
```

**Điều gì xảy ra:**
```javascript
// loadSessionMessages() được gọi
→ GET /api/sessions/uuid-123

→ Supabase trả về:
  {
    session: {
      id: "uuid-123",
      messages: [
        { role: "user", content: "Em cần hỗ trợ học tập" },
        { role: "assistant", content: "..." }
      ]
    }
  }

→ Admin thấy toàn bộ tin nhắn
```

---

## 🧪 Test Cases

### Test 1: Chat Cơ Bản

**Steps:**
1. Mở http://localhost:3000
2. Chat: "Xin chào"
3. Đợi 10 giây (auto-save)
4. Mở tab mới → http://localhost:3000/admin
5. Login

**Expected:**
- ✅ Admin thấy 1 session mới
- ✅ Click vào → Thấy tin nhắn "Xin chào"

### Test 2: Emergency Detection

**Steps:**
1. Chat: "Em đang rất stress"
2. Đợi 10 giây
3. Kiểm tra Supabase Dashboard:
   - Table: `chat_sessions` → `is_emergency` = true
   - Table: `emergency_alerts` → có 1 alert mới

**Expected:**
- ✅ Admin thấy session có badge đỏ "🚨 Khẩn cấp"
- ✅ Session có border đỏ và animate pulse

### Test 3: Đa Tab (Giả Lập Đa Thiết Bị)

**Tab 1 (Học sinh):**
```
http://localhost:3000
Chat: "Em cần giúp đỡ"
```

**Tab 2 (Admin):**
```
http://localhost:3000/admin
Refresh trang
```

**Expected:**
- ✅ Admin thấy session mới từ Tab 1
- ✅ Click vào → Thấy tin nhắn

**Tab 3 (Học sinh khác):**
```
http://localhost:3000
Chọn: "Phụ huynh"
Chat: "Con em học thế nào?"
```

**Tab 2 (Admin - Refresh):**

**Expected:**
- ✅ Thấy 2 sessions
- ✅ 1 từ học sinh, 1 từ phụ huynh

### Test 4: Delete Session

**Steps:**
1. Admin click nút "Xóa" trên một session
2. Kiểm tra Supabase Dashboard

**Expected:**
- ✅ Session biến mất khỏi UI
- ✅ Supabase không còn session đó
- ✅ Messages cũng bị xóa (CASCADE)

---

## 🔍 Debug Checklist

### Nếu Admin Không Thấy Sessions

**Check 1: API có hoạt động không?**
```bash
# Mở browser console (F12)
# Xem tab Network
# Phải thấy: GET /api/sessions → Status 200
```

**Check 2: Supabase có data không?**
```
1. Vào Supabase Dashboard
2. Table Editor → chat_sessions
3. Phải có records
```

**Check 3: Console có lỗi không?**
```javascript
// Mở F12 → Console
// Không được có lỗi đỏ
```

### Nếu Messages Không Load

**Check 1: API detail có hoạt động không?**
```bash
# Console → Network
# Click vào session
# Phải thấy: GET /api/sessions/[id] → Status 200
```

**Check 2: Messages table có data không?**
```sql
-- Chạy trong Supabase SQL Editor
SELECT * FROM messages 
WHERE session_id = 'your-session-id';
```

---

## 📊 Kiểm Tra Supabase

### Query 1: Xem tất cả sessions
```sql
SELECT 
    id,
    user_role,
    user_class,
    total_messages,
    is_emergency,
    created_at
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 10;
```

### Query 2: Xem messages của session mới nhất
```sql
SELECT 
    cs.user_role,
    cs.user_class,
    m.sender,
    m.content,
    m.created_at
FROM messages m
JOIN chat_sessions cs ON m.session_id = cs.id
ORDER BY cs.created_at DESC, m.created_at ASC
LIMIT 20;
```

### Query 3: Xem emergency alerts
```sql
SELECT 
    ea.alert_level,
    ea.keywords,
    ea.student_class,
    ea.created_at,
    cs.total_messages
FROM emergency_alerts ea
JOIN chat_sessions cs ON ea.session_id = cs.id
WHERE ea.is_resolved = FALSE
ORDER BY ea.created_at DESC;
```

---

## ✅ Success Criteria

Sau khi test, bạn phải thấy:

1. **Học sinh chat** → Data lưu vào Supabase ✅
2. **Admin refresh** → Thấy sessions mới ✅
3. **Admin click session** → Load messages từ Supabase ✅
4. **Emergency detection** → Tạo alerts tự động ✅
5. **Delete session** → Xóa khỏi Supabase ✅
6. **Đa tab** → Tất cả đều thấy data giống nhau ✅

---

## 🚀 Sẵn Sàng Deploy

Nếu tất cả tests PASS:

```bash
# Commit changes
git add .
git commit -m "Complete Supabase integration - tested locally"
git push

# Deploy
vercel --prod
```

**Nhớ thêm Environment Variables trong Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

---

**Bắt đầu test từ Test 1! 🧪**
