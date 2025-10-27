# 🔍 Debug: Messages Hiển Thị Sai Sender

## 🐛 Vấn Đề

Tất cả messages đều hiển thị "Trợ lý AI" thay vì phân biệt:
- User: "Bạn bè trêu chọc – mình nên làm gì?"
- AI: "Chào em! Bị bạn bè trêu chọc..."

## 🔍 Kiểm Tra

### Bước 1: Xem Data Trong Supabase

```sql
-- Xem messages của session mới nhất
SELECT 
    m.id,
    m.sender,
    m.content,
    m.created_at
FROM messages m
JOIN chat_sessions cs ON m.session_id = cs.id
ORDER BY cs.created_at DESC, m.created_at ASC
LIMIT 20;
```

**Kết quả mong đợi:**
```
sender | content
-------|------------------------------------------
user   | Bạn bè trêu chọc – mình nên làm gì?
bot    | Chào em! Bị bạn bè trêu chọc có thể...
user   | Lập kế hoạch ôn 7 ngày cho Toán
bot    | Chào em! Để giúp em ôn thi Toán...
```

**Nếu thấy:**
```
sender | content
-------|------------------------------------------
bot    | Bạn bè trêu chọc – mình nên làm gì?  ❌ SAI!
bot    | Chào em! Bị bạn bè trêu chọc...
```

→ **Vấn đề:** Messages được lưu sai `sender`

### Bước 2: Kiểm Tra API Response

```
F12 → Network → Click vào session
→ /api/sessions/[id]
→ Response tab
```

**Xem:**
```json
{
  "session": {
    "messages": [
      {
        "role": "user",  // ← Phải là "user"
        "content": "Bạn bè trêu chọc..."
      },
      {
        "role": "assistant",  // ← Phải là "assistant"
        "content": "Chào em!..."
      }
    ]
  }
}
```

**Nếu tất cả đều `role: "assistant"`** → Vấn đề ở API mapping

### Bước 3: Test Console Log

Thêm log vào admin page:

```javascript
// Trong loadSessionMessages()
console.log('Loaded messages:', data.session.messages);
data.session.messages.forEach((m, i) => {
  console.log(`Message ${i}: role=${m.role}, content=${m.content.substring(0, 30)}`);
});
```

---

## 🔧 Giải Pháp

### Nguyên Nhân 1: Messages Cũ Có Sender Sai

**Xóa messages cũ:**
```sql
DELETE FROM messages;
DELETE FROM chat_sessions;
```

**Test lại:**
```
1. Chat mới
2. Kiểm tra Supabase
3. Xem admin
```

### Nguyên Nhân 2: ChatWidget Gửi Sai Format

Kiểm tra ChatWidget có gửi đúng `role` không:

```javascript
// Trong saveSession()
console.log('Saving messages:', messages);
messages.forEach(m => {
  console.log(`- role: ${m.role}, content: ${m.content.substring(0, 30)}`);
});
```

**Phải thấy:**
```
- role: user, content: Bạn bè trêu chọc...
- role: assistant, content: Chào em!...
```

### Nguyên Nhân 3: API Mapping Sai

Kiểm tra file `/api/sessions/[id]/route.js` dòng 57:

```javascript
role: m.sender === 'user' ? 'user' : 'assistant'
```

**Nếu `m.sender` là `'bot'` thay vì `'user'`:**
- `'user'` → `'user'` ✅
- `'bot'` → `'assistant'` ✅
- Anything else → `'assistant'` ⚠️

---

## 🧪 Test Script

Tạo file `test-messages.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMessages() {
  console.log('🧪 Testing Messages...\n');
  
  // Lấy session mới nhất
  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (!sessions || sessions.length === 0) {
    console.log('❌ No sessions found');
    return;
  }
  
  const sessionId = sessions[0].id;
  console.log('Session ID:', sessionId);
  
  // Lấy messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  
  console.log('\n📝 Messages:');
  messages.forEach((m, i) => {
    console.log(`\n${i + 1}. Sender: ${m.sender}`);
    console.log(`   Content: ${m.content.substring(0, 50)}...`);
  });
  
  // Kiểm tra
  const userMessages = messages.filter(m => m.sender === 'user');
  const botMessages = messages.filter(m => m.sender === 'bot');
  
  console.log('\n📊 Summary:');
  console.log(`   User messages: ${userMessages.length}`);
  console.log(`   Bot messages: ${botMessages.length}`);
  
  if (userMessages.length === 0) {
    console.log('\n❌ PROBLEM: No user messages found!');
    console.log('   All messages have sender="bot"');
  } else {
    console.log('\n✅ OK: Found both user and bot messages');
  }
}

testMessages();
```

**Chạy:**
```bash
node test-messages.js
```

---

## 🔧 Fix Nhanh

### Fix 1: Xóa Data Cũ & Test Lại

```sql
-- Xóa tất cả
DELETE FROM messages;
DELETE FROM chat_sessions;
```

```bash
# Restart server
npm run dev
```

```
# Test chat mới
1. Chọn "Học sinh"
2. Nhập "6/1"
3. Chat "Bạn bè trêu chọc – mình nên làm gì?"
4. Kiểm tra Supabase
```

### Fix 2: Sửa Messages Cũ (Nếu Muốn Giữ)

```sql
-- Update messages dựa vào content
-- (Giả sử messages từ user thường ngắn hơn)

-- Hoặc update thủ công:
UPDATE messages 
SET sender = 'user'
WHERE content LIKE 'Bạn bè trêu chọc%';

UPDATE messages 
SET sender = 'bot'
WHERE content LIKE 'Chào em!%';
```

---

## ✅ Checklist Debug

- [ ] Chạy query kiểm tra `sender` trong Supabase
- [ ] Xem API response `/api/sessions/[id]`
- [ ] Check console log trong admin
- [ ] Chạy `test-messages.js`
- [ ] Xóa data cũ
- [ ] Test chat mới
- [ ] Kiểm tra lại admin

---

## 🎯 Kết Quả Mong Đợi

### Supabase
```sql
SELECT sender, content FROM messages ORDER BY created_at;
```

```
sender | content
-------|------------------------------------------
user   | Tôi là Học sinh
bot    | Chào em! Em học lớp nào?
user   | 6/1
bot    | Cảm ơn em!
user   | Bạn bè trêu chọc – mình nên làm gì?
bot    | Chào em! Bị bạn bè trêu chọc...
```

### Admin UI

```
🎓 Học sinh: Bạn bè trêu chọc – mình nên làm gì?
🤖 Trợ lý AI: Chào em! Bị bạn bè trêu chọc...
```

---

**Chạy query kiểm tra trước! 🔍**
