# ✅ Fix: Role Sai & Summary Sai

## 🐛 3 Vấn Đề

### 1. Chọn "Học sinh" → Hiển thị "Phụ huynh"
**Nguyên nhân:** Admin page dùng `userRole` nhưng map từ API là `role`

### 2. Summary Hiển Thị Câu Trả Lời AI
**Nguyên nhân:** `generateSummary()` lấy nhầm message từ bot

### 3. Summary Chung Chung
**Ví dụ:** "Chào em! Em học lớp nào?"  
**Nguyên nhân:** Lấy tin nhắn hỏi lớp thay vì câu hỏi thật

---

## 🔧 Đã Sửa

### Fix 1: Role Mapping

**Admin Page (`/app/admin/page.jsx`):**
```javascript
// Thêm userRole để consistent
userRole: s.user_role
```

### Fix 2 & 3: Summary Logic

**API Sessions (`/api/sessions/route.js`):**
```javascript
// 1. Lọc chỉ lấy tin nhắn từ USER
const userMessages = messages.filter(m => 
  m.role === 'user' || m.sender === 'user'
);

// 2. Bỏ qua "Tôi là Học sinh"
if (content.startsWith('Tôi là')) {
  // Lấy tin thứ 2
}

// 3. Bỏ qua số lớp "6/1"
if (/^\d{1,2}\/\d{1,2}$/.test(content)) {
  // Lấy tin thứ 3
}

// 4. Lấy câu hỏi thật đầu tiên
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

**Xóa sessions cũ:**
```sql
DELETE FROM chat_sessions;
```

### Bước 3: Test Flow Đầy Đủ

```
1. Chọn: "Học sinh"
2. Nhập: "6/1"
3. Chat: "Thông tin về cuộc thi học sinh giỏi"
4. Đợi bot trả lời
```

### Bước 4: Kiểm Tra Supabase

```sql
SELECT 
    session_name,
    user_role,
    user_class
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 1;
```

**Phải thấy:**
```
session_name = "Thông tin về cuộc thi học sinh giỏi"
user_role = "student"
user_class = "6/1"
```

**Không còn:**
```
session_name = "Chào em! Em học lớp nào?"
session_name = "Tôi là Học sinh"
session_name = "6/1"
```

### Bước 5: Test Admin

```
1. http://localhost:3000/admin-login
2. Login: admin / admin123
3. Danh sách phải hiển thị:
   "Thông tin về cuộc thi học sinh giỏi"
   🎓 (icon học sinh)
```

### Bước 6: Click Vào Session

```
1. Click vào session
2. Phải thấy:
   🎓 Học sinh: "Thông tin về cuộc thi học sinh giỏi"
   🤖 Trợ lý AI: "..."
```

**Không còn:**
```
👨‍👩‍👧 Phụ huynh: "Thông tin về cuộc thi học sinh giỏi"
```

---

## 🎯 Test Cases

### Test 1: Học Sinh Chat

```
Input:
1. Chọn "Học sinh"
2. Nhập "6/1"
3. Chat "Em cần hỗ trợ học tập"

Expected:
- Summary: "Em cần hỗ trợ học tập" ✅
- Role: 🎓 Học sinh ✅
- Messages: 🎓 Học sinh (không phải 👨‍👩‍👧) ✅
```

### Test 2: Giáo Viên Chat

```
Input:
1. Chọn "Giáo viên"
2. Chat "Cách quản lý lớp học hiệu quả"

Expected:
- Summary: "Cách quản lý lớp học hiệu quả" ✅
- Role: 👨‍🏫 Giáo viên ✅
- Messages: 👨‍🏫 Giáo viên ✅
```

### Test 3: Phụ Huynh Chat

```
Input:
1. Chọn "Phụ huynh"
2. Chat "Con em học thế nào?"

Expected:
- Summary: "Con em học thế nào?" ✅
- Role: 👨‍👩‍👧 Phụ huynh ✅
- Messages: 👨‍👩‍👧 Phụ huynh ✅
```

### Test 4: Chat Nhiều Tin Nhắn

```
Input:
1. Chọn "Học sinh"
2. Nhập "7/2"
3. Chat "Em đang stress"
4. Chat "Cảm ơn"
5. Chat "Tạm biệt"

Expected:
- Summary: "Em đang stress" ✅
- Không phải: "Tôi là Học sinh" ❌
- Không phải: "7/2" ❌
- Không phải: "Chào em! Em học lớp nào?" ❌
```

---

## 📊 Kiểm Tra

### Query 1: Xem Summary & Role

```sql
SELECT 
    session_name,
    user_role,
    user_class,
    created_at
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 10;
```

**Kết quả mong đợi:**
```
session_name                              | user_role | user_class
------------------------------------------|-----------|------------
Thông tin về cuộc thi học sinh giỏi     | student   | 6/1
Em cần hỗ trợ học tập                    | student   | 7/2
Cách quản lý lớp học hiệu quả            | teacher   | NULL
Con em học thế nào?                       | parent    | NULL
```

### Query 2: Xem Messages

```sql
SELECT 
    cs.user_role,
    m.sender,
    m.content
FROM messages m
JOIN chat_sessions cs ON m.session_id = cs.id
ORDER BY m.created_at DESC
LIMIT 10;
```

**Kết quả mong đợi:**
```
user_role | sender | content
----------|--------|----------------------------------
student   | user   | Thông tin về cuộc thi học sinh giỏi
student   | bot    | Chào em! Để giúp em...
```

---

## 🔍 Debug

### Nếu Vẫn Hiển Thị Sai Role

**Check 1: Console log trong admin**
```javascript
// Thêm vào admin page
console.log('Session:', sessions[selected]);
console.log('UserRole:', sessions[selected].userRole);
```

**Check 2: API response**
```
F12 → Network → /api/sessions
→ Response → sessions[0].user_role
```

### Nếu Summary Vẫn Sai

**Check 1: Messages format**
```javascript
// Log trong generateSummary()
console.log('Messages:', messages);
console.log('User messages:', userMessages);
console.log('First user msg:', firstUserMsg);
```

**Check 2: Test với console**
```javascript
const messages = [
  { role: 'user', content: 'Tôi là Học sinh' },
  { role: 'assistant', content: 'Chào em!' },
  { role: 'user', content: '6/1' },
  { role: 'assistant', content: 'Cảm ơn!' },
  { role: 'user', content: 'Em cần hỗ trợ' }
];

// Phải return: "Em cần hỗ trợ"
```

---

## ✅ Success Criteria

- [ ] Restart server
- [ ] Clear data cũ
- [ ] Test chat đầy đủ (chọn role → nhập lớp → chat)
- [ ] Supabase: session_name = câu hỏi thật
- [ ] Supabase: user_role = đúng role đã chọn
- [ ] Admin: Hiển thị đúng role icon
- [ ] Admin: Click vào → Messages hiển thị đúng role
- [ ] Summary không còn "Tôi là...", "6/1", hoặc câu bot

---

## 🎨 Kết Quả

### Trước (❌)

**Danh sách:**
```
Chào em! Em học lớp nào?
👨‍👩‍👧 Phụ huynh
```

**Messages:**
```
👨‍👩‍👧 Phụ huynh: Thông tin về cuộc thi học sinh giỏi
🤖 Trợ lý AI: Chào em! Để giúp em...
```

### Sau (✅)

**Danh sách:**
```
Thông tin về cuộc thi học sinh giỏi
🎓 Học sinh - Lớp 6/1
```

**Messages:**
```
🎓 Học sinh: Thông tin về cuộc thi học sinh giỏi
🤖 Trợ lý AI: Chào em! Để giúp em...
```

---

## 💡 Logic Summary Mới

```
Messages:
1. "Tôi là Học sinh"     → Bỏ qua
2. "6/1"                  → Bỏ qua
3. "Em cần hỗ trợ"       → ✅ Lấy cái này!

Summary = "Em cần hỗ trợ"
```

---

**Bắt đầu test! Nhớ xóa data cũ! 🚀**
