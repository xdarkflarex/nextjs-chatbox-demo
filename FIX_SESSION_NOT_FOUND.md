# ✅ Fix: Session not found - Bỏ localStorage

## 🐛 Lỗi Ban Đầu

```
Error saving to Supabase: Session not found
```

**Nguyên nhân:**
- ChatWidget tạo sessionId mới (UUID)
- Gửi lên API với sessionId đó
- API tìm session trong DB → Không có → Lỗi "Session not found"

## 🔧 Đã Sửa

### 1. API Sessions (`/api/sessions/route.js`)
- ✅ Nếu sessionId chưa tồn tại → Tự động tạo mới
- ✅ Không còn báo lỗi "Session not found"
- ✅ Dùng sessionId từ client làm ID

### 2. ChatWidget (`/components/ChatWidget.jsx`)
- ✅ Bỏ hoàn toàn localStorage backup
- ✅ Chỉ lưu lên Supabase
- ✅ Đơn giản hóa logic

### 3. Admin Page (`/app/admin/page.jsx`)
- ✅ Bỏ localStorage fallback
- ✅ Chỉ đọc từ Supabase API
- ✅ Giữ localStorage cho admin login (cần thiết)

---

## 🎯 Flow Mới (100% Supabase)

```
CHAT:
1. Học sinh chat
   ↓
2. ChatWidget.saveSession()
   ↓
3. POST /api/sessions { sessionId, messages, ... }
   ↓
4. API check session tồn tại?
   - Không → Tạo mới với sessionId đã cho
   - Có → Update
   ↓
5. Supabase lưu data
   ↓
6. Response: { ok: true }

ADMIN:
1. Admin mở dashboard
   ↓
2. GET /api/sessions
   ↓
3. Supabase trả về danh sách
   ↓
4. Admin thấy sessions
   ↓
5. Click session
   ↓
6. GET /api/sessions/[id]
   ↓
7. Supabase trả về messages
   ↓
8. Admin thấy chi tiết
```

---

## 🧪 Test Lại Toàn Bộ

### Bước 1: Clean Start

```bash
# Stop server
Ctrl+C

# Clear Supabase data (optional - để test từ đầu)
# Vào Supabase Dashboard → Table Editor
# Delete all records trong chat_sessions

# Start server
npm run dev
```

### Bước 2: Clear Browser

```javascript
// Mở http://localhost:3000
// Console (F12):
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Bước 3: Test Chat

```
1. Chọn: "Học sinh"
2. Nhập: "6/1"
3. Chat: "Em cần hỗ trợ học tập"
4. Đợi bot trả lời
5. Chat thêm: "Cảm ơn"
```

### Bước 4: Kiểm Tra Console

**Phải thấy:**
```
✅ Session saved to Supabase: [uuid] Emergency: false
✅ Session saved to Supabase: [uuid] Emergency: false
```

**Không còn:**
```
❌ Error saving to Supabase: Session not found
❌ userClass is not defined
```

### Bước 5: Kiểm Tra Network

```
F12 → Network tab
Filter: /api/sessions

Phải thấy:
- POST /api/sessions → 200 (lần 1: tạo mới)
- POST /api/sessions → 200 (lần 2: update)
```

### Bước 6: Kiểm Tra Supabase

```sql
-- Xem sessions
SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 5;

-- Phải thấy:
-- 1 session với user_role = 'student', user_class = '6/1'

-- Xem messages
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;

-- Phải thấy:
-- Nhiều messages (user + bot)
```

### Bước 7: Test Admin

```
1. Mở tab mới: http://localhost:3000/admin-login
2. Login: admin / admin123
3. Dashboard phải thấy: 1 session
4. Click vào session
5. Phải thấy: Tất cả messages
```

### Bước 8: Test Refresh Admin

```
1. Ở tab admin, refresh trang (F5)
2. Phải vẫn thấy sessions
3. Click vào → Vẫn thấy messages
```

---

## 🔍 Debug

### Console Logs Quan Trọng

**ChatWidget:**
```javascript
✅ Session saved to Supabase: [uuid] Emergency: false
```

**Admin:**
```javascript
// Khi load dashboard
GET /api/sessions → 200

// Khi click session
GET /api/sessions/[id] → 200
```

### Nếu Vẫn Lỗi

**Lỗi: "Session not found"**
```bash
# Kiểm tra API route đã update chưa
cat app/api/sessions/route.js | grep "Nếu session chưa tồn tại"

# Phải thấy logic tạo mới
```

**Lỗi: "Could not find table"**
```bash
# Chạy lại migration
npm run db:test
```

**Lỗi: "Invalid API key"**
```bash
# Kiểm tra .env.local
cat .env.local | grep SUPABASE
```

---

## 📊 Queries Kiểm Tra

### Query 1: Sessions hôm nay
```sql
SELECT 
    id,
    user_role,
    user_class,
    total_messages,
    is_emergency,
    created_at
FROM chat_sessions
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

### Query 2: Messages của session mới nhất
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

### Query 3: Count messages per session
```sql
SELECT 
    cs.id,
    cs.user_role,
    cs.user_class,
    COUNT(m.id) as message_count,
    cs.total_messages
FROM chat_sessions cs
LEFT JOIN messages m ON m.session_id = cs.id
GROUP BY cs.id
ORDER BY cs.created_at DESC;
```

---

## ✅ Success Criteria

Sau khi test, phải thấy:

- [ ] Console: "✅ Session saved to Supabase" (mỗi lần chat)
- [ ] Network: POST /api/sessions → 200
- [ ] Supabase: chat_sessions có 1 record
- [ ] Supabase: messages có nhiều records
- [ ] Admin: Thấy session trong danh sách
- [ ] Admin: Click vào thấy messages
- [ ] Admin: Refresh vẫn thấy data
- [ ] Không có lỗi "Session not found"
- [ ] Không có lỗi "userClass is not defined"
- [ ] Không còn dùng localStorage (trừ admin login)

---

## 🎯 Test Cases Đầy Đủ

### Test 1: Chat Đơn Giản
```
1. Chọn "Học sinh" → Nhập "6/1"
2. Chat: "Xin chào"
3. Check Supabase: 1 session, 2 messages ✅
```

### Test 2: Chat Nhiều Tin Nhắn
```
1. Chat: "Em cần hỗ trợ"
2. Chat: "Cảm ơn"
3. Chat: "Tạm biệt"
4. Check Supabase: 1 session, 8 messages ✅
```

### Test 3: Emergency Detection
```
1. Chat: "Em đang rất stress"
2. Check Supabase:
   - is_emergency = true ✅
   - emergency_alerts có 1 record ✅
```

### Test 4: Admin View
```
1. Admin login
2. Thấy session ✅
3. Click → Thấy messages ✅
4. Refresh → Vẫn thấy ✅
```

### Test 5: Đa Tab
```
Tab 1: Học sinh chat
Tab 2: Admin xem
→ Admin thấy session mới ✅
```

### Test 6: Delete Session
```
1. Admin click "Xóa"
2. Session biến mất ✅
3. Check Supabase: Không còn session ✅
```

---

## 🚀 Deploy Checklist

Trước khi deploy:

- [ ] Test local hoàn chỉnh
- [ ] Không còn lỗi console
- [ ] Supabase có data
- [ ] Admin xem được
- [ ] Commit code
- [ ] Push lên Git
- [ ] Deploy Vercel
- [ ] Thêm env vars trong Vercel
- [ ] Test production

---

## 💡 Lưu Ý Quan Trọng

### localStorage Còn Dùng Ở Đâu?

**Chỉ còn 1 chỗ:**
- ✅ Admin login check: `localStorage.getItem("admin")`
- ✅ Admin logout: `localStorage.removeItem("admin")`

**Không còn dùng cho:**
- ❌ Lưu sessions
- ❌ Lưu messages
- ❌ Backup data

### Supabase Là Source of Truth

```
localStorage → ❌ Không dùng
Supabase → ✅ Dùng 100%
```

---

**Bắt đầu test từ Bước 1! 🚀**
