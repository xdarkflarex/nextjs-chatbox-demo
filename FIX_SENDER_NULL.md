# ✅ Fix: Sender = null

## 🐛 Vấn Đề

Test cho kết quả:
```
👤 User messages: 1
🤖 Bot messages: 2
⚠️  Other senders: 4  ← ❌ 4 messages có sender="null"
```

**Messages bị null:**
```
4. Bạn bè trêu chọc – mình nên làm gì?  → sender="null"
5. Chào em! Bị bạn bè trêu chọc...      → sender="null"
6. Lập kế hoạch ôn 7 ngày cho Toán     → sender="null"
7. Chào em! Để giúp em ôn thi...        → sender="null"
```

## 🔍 Nguyên Nhân

**API Sessions dòng 243:**
```javascript
sender: msg.sender  // ← msg.sender = undefined!
```

**Vấn đề:**
- ChatWidget gửi messages với field `role` (user/assistant)
- API đang lấy field `sender` (không tồn tại)
- Kết quả: `sender = null` trong database

## 🔧 Đã Sửa

**API Sessions (`/api/sessions/route.js`):**
```javascript
// Trước:
sender: msg.sender  // ← undefined → null

// Sau:
sender: msg.role === 'user' ? 'user' : 'bot'  // ← Map đúng!
```

---

## 🧪 Test Lại

### Bước 1: Xóa Data Cũ

```sql
-- Xóa messages có sender=null
DELETE FROM messages WHERE sender IS NULL;

-- Hoặc xóa tất cả để test sạch
DELETE FROM messages;
DELETE FROM chat_sessions;
```

### Bước 2: Restart Server

Server đang chạy, không cần restart. Nhưng nếu muốn chắc chắn:

```bash
# Stop: Ctrl+C
npm run dev
```

### Bước 3: Clear Cache & Test Chat Mới

```javascript
// Console (F12):
localStorage.clear();
location.reload();
```

```
1. Chọn "Học sinh"
2. Nhập "6/1"  
3. Chat "Bạn bè trêu chọc – mình nên làm gì?"
4. Đợi bot trả lời
5. Chat "Lập kế hoạch ôn 7 ngày cho Toán"
```

### Bước 4: Test Lại

```bash
node test-messages.js
```

**Kết quả mong đợi:**
```
📊 ANALYSIS:
   👤 User messages: 3
   🤖 Bot messages: 4
   
✅ LOOKS GOOD!
   Found both user and bot messages
```

**Không còn:**
```
⚠️  Other senders: 4  ❌
```

### Bước 5: Kiểm Tra Supabase

```sql
SELECT 
    sender,
    content,
    created_at
FROM messages
ORDER BY created_at DESC
LIMIT 10;
```

**Phải thấy:**
```
sender | content
-------|------------------------------------------
bot    | Chào em! Để giúp em ôn thi...
user   | Lập kế hoạch ôn 7 ngày cho Toán
bot    | Chào em! Bị bạn bè trêu chọc...
user   | Bạn bè trêu chọc – mình nên làm gì?
bot    | Cảm ơn em!
user   | 6/1
```

**Không còn:**
```
sender | content
-------|------------------------------------------
null   | Bạn bè trêu chọc...  ❌
```

### Bước 6: Test Admin UI

```
1. http://localhost:3000/admin
2. Click vào session
3. Phải thấy:
   🎓 Học sinh: Bạn bè trêu chọc – mình nên làm gì?
   🤖 Trợ lý AI: Chào em! Bị bạn bè trêu chọc...
```

---

## 📊 So Sánh

### Trước Fix

**Database:**
```sql
sender | content
-------|------------------------------------------
user   | Tôi là Học sinh
bot    | Chào em! Em học lớp nào?
null   | Bạn bè trêu chọc...  ❌
null   | Chào em! Bị bạn...   ❌
```

**Test Result:**
```
👤 User messages: 1
🤖 Bot messages: 2
⚠️  Other senders: 4  ❌
```

**Admin UI:**
```
🤖 Trợ lý AI: Bạn bè trêu chọc...  ❌ (Sai!)
🤖 Trợ lý AI: Chào em! Bị bạn...
```

### Sau Fix

**Database:**
```sql
sender | content
-------|------------------------------------------
user   | Tôi là Học sinh
bot    | Chào em! Em học lớp nào?
user   | Bạn bè trêu chọc...  ✅
bot    | Chào em! Bị bạn...   ✅
```

**Test Result:**
```
👤 User messages: 3  ✅
🤖 Bot messages: 4   ✅
✅ LOOKS GOOD!
```

**Admin UI:**
```
🎓 Học sinh: Bạn bè trêu chọc...  ✅ (Đúng!)
🤖 Trợ lý AI: Chào em! Bị bạn...
```

---

## ✅ Checklist

- [ ] Xóa messages có sender=null
- [ ] Clear browser cache
- [ ] Test chat mới
- [ ] Chạy `node test-messages.js`
- [ ] Kết quả: Không còn "Other senders"
- [ ] Kiểm tra Supabase: Không còn sender=null
- [ ] Test admin UI: Hiển thị đúng sender

---

## 🎯 Kết Quả Cuối Cùng

### Test Script
```
✅ LOOKS GOOD!
   👤 User messages: 3
   🤖 Bot messages: 4
```

### Admin UI
```
🎓 Học sinh: Bạn bè trêu chọc – mình nên làm gì?
🤖 Trợ lý AI: Chào em! Bị bạn bè trêu chọc có thể...
🎓 Học sinh: Lập kế hoạch ôn 7 ngày cho Toán
🤖 Trợ lý AI: Chào em! Để giúp em ôn thi Toán...
```

---

**Xóa data cũ và test lại ngay! 🚀**

```sql
DELETE FROM messages WHERE sender IS NULL;
```

```bash
node test-messages.js
```
