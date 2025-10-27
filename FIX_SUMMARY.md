# ✅ Fix: Hiển Thị Tóm Tắt Chat

## 🐛 Vấn Đề

Danh sách session chỉ hiển thị:
```
Chat 13:54:01 26/10/2025
```

Thay vì tóm tắt nội dung như:
```
Em cần hỗ trợ học tập
```

## 🔧 Giải Pháp

### Lưu Summary Vào Supabase

**Không dùng Gemini API** (tốn tiền + chậm)  
**Dùng logic đơn giản:** Lấy tin nhắn đầu tiên từ user

### Flow Mới

```
1. User chat: "Em cần hỗ trợ học tập"
   ↓
2. API tạo summary: "Em cần hỗ trợ học tập"
   ↓
3. Lưu vào Supabase:
   session_name = "Em cần hỗ trợ học tập"
   ↓
4. Admin load sessions
   ↓
5. Hiển thị: "Em cần hỗ trợ học tập"
```

---

## 📝 Đã Sửa

### 1. API Sessions (`/api/sessions/route.js`)

**Thêm function `generateSummary()`:**
```javascript
// Lấy tin nhắn đầu tiên từ user
// Cắt ngắn nếu > 60 ký tự
// Lưu vào session_name
```

**Dùng khi tạo session:**
```javascript
const summary = await generateSummary(messages);
session_name: summary // Thay vì timestamp
```

### 2. Admin Page (`/app/admin/page.jsx`)

**Đã có sẵn:**
```javascript
summary: s.session_name // Map từ Supabase
```

**Function `getPreview()`:**
```javascript
// Ưu tiên hiển thị summary
if (session.summary) return session.summary;
```

---

## 🧪 Test Ngay

### Bước 1: Restart Server

```bash
npm run dev
```

### Bước 2: Clear Data Cũ

```javascript
// Console (F12):
localStorage.clear();
location.reload();
```

**Hoặc xóa sessions cũ trong Supabase:**
```sql
DELETE FROM chat_sessions;
```

### Bước 3: Test Chat

```
1. Chọn "Học sinh"
2. Nhập "6/1"
3. Chat: "Em cần hỗ trợ học tập"
4. Đợi bot trả lời
```

### Bước 4: Kiểm Tra Supabase

```sql
SELECT 
    id,
    session_name,
    user_role,
    created_at
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 5;
```

**Phải thấy:**
```
session_name = "Em cần hỗ trợ học tập"
```

**Không còn:**
```
session_name = "Chat 13:54:01 26/10/2025"
```

### Bước 5: Test Admin

```
1. http://localhost:3000/admin-login
2. Login: admin / admin123
3. Danh sách phải hiển thị:
   "Em cần hỗ trợ học tập"
```

---

## 🎯 Test Cases

### Test 1: Tin Nhắn Ngắn

```
Chat: "Xin chào"
→ Summary: "Xin chào"
```

### Test 2: Tin Nhắn Dài

```
Chat: "Em đang gặp khó khăn trong việc học toán, em không hiểu bài về phương trình bậc hai"
→ Summary: "Em đang gặp khó khăn trong việc học toán, em không hiể..."
(Cắt ở 60 ký tự)
```

### Test 3: Nhiều Tin Nhắn

```
Chat 1: "Em cần hỗ trợ"
Chat 2: "Về môn toán"
→ Summary: "Em cần hỗ trợ"
(Lấy tin nhắn đầu tiên)
```

### Test 4: Emergency

```
Chat: "Em đang rất stress"
→ Summary: "Em đang rất stress"
→ Badge: 🚨 Khẩn cấp
```

---

## 📊 Kiểm Tra

### Query 1: Xem Summary

```sql
SELECT 
    session_name,
    user_role,
    user_class,
    is_emergency,
    created_at
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 10;
```

### Query 2: Sessions Hôm Nay

```sql
SELECT 
    session_name,
    total_messages,
    created_at
FROM chat_sessions
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;
```

---

## 🔍 Debug

### Nếu Vẫn Hiển Thị Timestamp

**Check 1: Supabase có summary đúng không?**
```sql
SELECT session_name FROM chat_sessions 
ORDER BY created_at DESC LIMIT 1;
```

**Check 2: Admin có map đúng không?**
```javascript
// Console trong admin page
console.log(sessions[0].summary);
// Phải thấy: "Em cần hỗ trợ học tập"
```

**Check 3: getPreview() có hoạt động không?**
```javascript
// Thêm log trong getPreview()
console.log('Session summary:', session.summary);
```

### Nếu Summary = "Chat mới"

**Nguyên nhân:** Không có tin nhắn từ user

**Giải pháp:** 
- Đảm bảo có ít nhất 1 tin nhắn từ user
- Check messages có `role: 'user'` hoặc `sender: 'user'`

---

## 💡 Tại Sao Không Dùng Gemini?

### Ưu Điểm Logic Đơn Giản

1. ✅ **Nhanh** - Không cần gọi API
2. ✅ **Miễn phí** - Không tốn tiền
3. ✅ **Đơn giản** - Dễ maintain
4. ✅ **Đủ dùng** - Tin nhắn đầu đã mô tả vấn đề

### Nếu Muốn Dùng Gemini

**Có thể thêm sau:**
```javascript
async function generateSummaryWithAI(messages) {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    body: JSON.stringify({ messages })
  });
  const data = await response.json();
  return data.summary;
}
```

**Nhưng:**
- ❌ Tốn tiền (mỗi request)
- ❌ Chậm (phải đợi API)
- ❌ Phức tạp (xử lý lỗi, retry)

---

## ✅ Success Criteria

- [ ] Restart server
- [ ] Clear data cũ
- [ ] Test chat
- [ ] Supabase: session_name = tin nhắn đầu
- [ ] Admin: Hiển thị tin nhắn thay vì timestamp
- [ ] Tin nhắn dài → Cắt ở 60 ký tự
- [ ] Emergency → Vẫn hiển thị summary + badge

---

## 🎨 Kết Quả Mong Đợi

### Trước (❌)
```
┌─────────────────────────────────┐
│ Chat 13:54:01 26/10/2025       │
│ 13:54 26 thg 10                │
└─────────────────────────────────┘
```

### Sau (✅)
```
┌─────────────────────────────────┐
│ Em cần hỗ trợ học tập          │
│ Học sinh - Lớp 6/1             │
│ 13:54 26 thg 10                │
└─────────────────────────────────┘
```

### Với Emergency (✅)
```
┌─────────────────────────────────┐
│ Em đang rất stress             │
│ 🚨 Khẩn cấp                    │
│ Học sinh - Lớp 7/2             │
└─────────────────────────────────┘
```

---

## 📋 Lưu Ý

### Summary Được Tạo Khi Nào?

- ✅ Khi tạo session mới
- ✅ Khi update session (nếu chưa có)
- ✅ Lưu vào `session_name` trong Supabase

### Summary Không Thay Đổi

- Một khi đã tạo, summary không đổi
- Vì tin nhắn đầu tiên thường mô tả vấn đề chính
- Nếu muốn update, có thể thêm logic sau

---

**Bắt đầu test! 🚀**
