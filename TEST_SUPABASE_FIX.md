# 🔧 Fix: ChatWidget Gửi Data Lên Supabase

## ✅ Đã Sửa

### ChatWidget.jsx
- ✅ `saveSession()` giờ gọi API `/api/sessions` 
- ✅ Gửi data lên Supabase thay vì chỉ localStorage
- ✅ Vẫn backup vào localStorage (fallback)

---

## 🧪 Test Lại Ngay

### Bước 1: Restart Server

```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```

### Bước 2: Clear Data Cũ (Quan Trọng!)

```javascript
// Mở http://localhost:3000
// Mở Console (F12)
// Chạy lệnh này:
localStorage.clear();
location.reload();
```

### Bước 3: Test Chat

```
1. Chọn vai trò: "Học sinh"
2. Nhập lớp: "6/1"
3. Chat: "Em cần hỗ trợ học tập"
4. Đợi bot trả lời
```

### Bước 4: Kiểm Tra Console

Mở Console (F12), bạn phải thấy:

```
✅ Session saved to Supabase: [uuid] Emergency: false
```

**Và trong Network tab:**
```
POST /api/sessions → Status 200
```

### Bước 5: Kiểm Tra Supabase

```
1. Vào Supabase Dashboard
2. Table Editor → chat_sessions
3. Phải thấy 1 record MỚI (vừa tạo)
4. Table Editor → messages
5. Phải thấy 2 messages (user + bot)
```

### Bước 6: Test Admin

```
1. Mở tab mới: http://localhost:3000/admin-login
2. Login: admin / admin123
3. Vào dashboard
```

**Bạn phải thấy:**
- ✅ Danh sách có 1 session
- ✅ Session hiển thị: "Học sinh - Lớp 6/1"
- ✅ Click vào → Thấy tin nhắn

---

## 🔍 Debug

### Nếu Console Báo Lỗi

**Lỗi: "Failed to fetch"**
```bash
# Server chưa chạy
npm run dev
```

**Lỗi: "Invalid API key"**
```bash
# Kiểm tra .env.local
cat .env.local | grep SUPABASE
```

**Lỗi: "Could not find table"**
```bash
# Chưa chạy migration
# Vào Supabase Dashboard → SQL Editor
# Chạy lại file: supabase/migrations/001_initial_schema.sql
```

### Nếu Không Thấy Data Trong Supabase

**Check 1: API có được gọi không?**
```
F12 → Network tab → Filter: /api/sessions
Chat 1 tin nhắn
→ Phải thấy POST request
```

**Check 2: Response có lỗi không?**
```
Click vào POST request
→ Response tab
→ Phải thấy: { "ok": true, "sessionId": "..." }
```

**Check 3: Supabase credentials đúng chưa?**
```bash
# Test connection
npm run db:test

# Phải thấy: ALL TESTS PASSED
```

---

## 📊 Queries Kiểm Tra

### Query 1: Xem sessions vừa tạo
```sql
SELECT 
    id,
    user_role,
    user_class,
    total_messages,
    created_at
FROM chat_sessions
WHERE created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;
```

### Query 2: Xem messages vừa tạo
```sql
SELECT 
    m.sender,
    m.content,
    m.created_at,
    cs.user_role,
    cs.user_class
FROM messages m
JOIN chat_sessions cs ON m.session_id = cs.id
WHERE m.created_at > NOW() - INTERVAL '10 minutes'
ORDER BY m.created_at DESC;
```

### Query 3: Count sessions hôm nay
```sql
SELECT COUNT(*) as total_sessions_today
FROM chat_sessions
WHERE DATE(created_at) = CURRENT_DATE;
```

---

## 🎯 Flow Hoàn Chỉnh

```
1. Học sinh chat
   ↓
2. ChatWidget.saveSession()
   ↓
3. POST /api/sessions
   ↓
4. Supabase lưu data
   ↓
5. Admin refresh
   ↓
6. GET /api/sessions
   ↓
7. Admin thấy sessions
   ↓
8. Admin click session
   ↓
9. GET /api/sessions/[id]
   ↓
10. Admin thấy messages
```

---

## ✅ Success Criteria

Sau khi test, bạn phải thấy:

- [ ] Console log: "✅ Session saved to Supabase"
- [ ] Network: POST /api/sessions → 200
- [ ] Supabase: chat_sessions có record mới
- [ ] Supabase: messages có 2 records
- [ ] Admin: Thấy session trong danh sách
- [ ] Admin: Click vào thấy messages
- [ ] Không có lỗi đỏ trong console

---

## 🚨 Test Emergency

### Test Emergency Detection

```
1. Chat: "Em đang rất stress"
2. Đợi bot trả lời
3. Kiểm tra Console:
   ✅ Session saved to Supabase: [uuid] Emergency: true
```

### Kiểm Tra Supabase

```sql
-- Xem emergency sessions
SELECT * FROM chat_sessions 
WHERE is_emergency = TRUE
ORDER BY created_at DESC;

-- Xem emergency alerts
SELECT * FROM emergency_alerts
ORDER BY created_at DESC;
```

### Kiểm Tra Admin

```
1. Vào admin dashboard
2. Session phải có:
   - Badge đỏ "🚨 Khẩn cấp"
   - Border đỏ
   - Animate pulse
```

---

## 💡 Tips

### Xem Real-time Logs

**Terminal 1: Dev Server**
```bash
npm run dev
```

**Terminal 2: Supabase Logs** (optional)
```bash
# Nếu có Supabase CLI
supabase logs --project-ref your-project-ref
```

### Monitor Network

```
F12 → Network tab
Filter: /api/
→ Xem tất cả API calls
```

### Clear Cache

```javascript
// Nếu test nhiều lần, clear cache:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 🎉 Kết Luận

Giờ flow đã hoàn chỉnh:

1. ✅ Học sinh chat → Lưu lên Supabase
2. ✅ Admin login → Đọc từ Supabase
3. ✅ Admin click → Load messages từ Supabase
4. ✅ Emergency → Tự động tạo alerts

**Bắt đầu test từ Bước 1! 🚀**
