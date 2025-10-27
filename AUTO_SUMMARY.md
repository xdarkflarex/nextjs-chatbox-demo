# ✅ Tóm Tắt Tự Động Khi Lưu

## 💡 Ý Tưởng

**Trước (❌ Tốn token):**
```
1. User chat → Lưu session → Summary = "Chat mới"
2. Admin vào → Ấn "Tạo lại tóm tắt"
3. Gọi Gemini lại → Tốn token!
```

**Sau (✅ Tiết kiệm):**
```
1. User chat → Tóm tắt ngay → Lưu summary
2. Admin vào → Thấy summary đúng luôn
3. Không cần ấn nút!
```

---

## 🔧 Logic Mới

### Khi Tạo Session Mới
```javascript
const summary = await generateSummary(messages);
session_name: summary  // ✅ Đã có từ đầu
```

### Khi Update Session
```javascript
// Chỉ tạo lại nếu summary hiện tại là generic
if (session_name === 'Chat mới' || session_name.startsWith('Tôi là')) {
  const newSummary = await generateSummary(messages);
  // Update session_name
}
```

### Tiết Kiệm Token

**Chỉ gọi Gemini khi:**
- ✅ Tạo session mới
- ✅ Update session có summary generic ("Chat mới", "Tôi là...")
- ✅ Có nhiều câu hỏi (≥2)

**Không gọi khi:**
- ❌ Summary đã tốt rồi
- ❌ Chỉ có 1 câu hỏi (dùng luôn, không cần AI)

**Ước tính:**
- 1 session = 1 lần gọi Gemini (khi có ≥2 câu hỏi)
- 1 lần gọi ≈ 100 tokens
- 100 sessions = 10,000 tokens ≈ $0.001 (rất rẻ!)

---

## 🧪 Test

### Bước 1: Xóa Data Cũ

```sql
DELETE FROM messages;
DELETE FROM chat_sessions;
```

### Bước 2: Test Chat Mới

```javascript
// Clear cache
localStorage.clear();
location.reload();
```

```
1. Chọn "Học sinh"
2. Nhập "6/1"
3. Chat "Tra cứu quy định xin phép nghỉ học"
4. Đợi bot trả lời
```

### Bước 3: Kiểm Tra Console

**Phải thấy:**
```
✅ Session saved to Supabase: [uuid]
```

**Không thấy lỗi**

### Bước 4: Kiểm Tra Supabase

```sql
SELECT 
    session_name,
    created_at
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 1;
```

**Phải thấy:**
```
session_name = "Tra cứu quy định xin phép nghỉ học"
```

**Không còn:**
```
session_name = "Chat mới"  ❌
session_name = "Tôi là Học sinh"  ❌
```

### Bước 5: Test Nhiều Câu Hỏi

```
1. Chat "Tra cứu quy định xin phép nghỉ học"
2. Chat "Nếu em bị bạn bè trêu chọc?"
3. Chat "Lập kế hoạch ôn 7 ngày"
```

**Kiểm tra console:**
```
🔄 Updated summary for [uuid]: "Hỏi về quy định, xử lý bắt nạt và ôn thi"
```

**Kiểm tra Supabase:**
```sql
SELECT session_name FROM chat_sessions 
ORDER BY created_at DESC LIMIT 1;
```

**Phải thấy:**
```
session_name = "Hỏi về quy định, xử lý bắt nạt và ôn thi"
```

### Bước 6: Test Admin

```
http://localhost:3000/admin
```

**Phải thấy ngay:**
```
- Hỏi về quy định, xử lý bắt nạt và ôn thi
  🎓 Học sinh - Lớp 6/1
```

**Không cần ấn "Tạo lại tóm tắt"!**

---

## 📊 So Sánh

### Cách Cũ (❌ Tốn Token)

```
User chat:
1. POST /api/sessions → session_name = "Chat mới"
2. Lưu vào DB

Admin:
3. GET /api/sessions → Thấy "Chat mới"
4. Click "Tạo lại tóm tắt"
5. POST /api/sessions/regenerate-summaries
6. Gọi Gemini → Tốn token!
7. Update DB
8. Reload → Thấy summary đúng

Token: 2x (tạo + regenerate)
```

### Cách Mới (✅ Tiết Kiệm)

```
User chat:
1. POST /api/sessions
2. generateSummary(messages)
   - Nếu 1 câu → Dùng luôn (0 token)
   - Nếu nhiều câu → Gọi Gemini (1 token)
3. Lưu session_name vào DB

Admin:
4. GET /api/sessions → Thấy summary đúng luôn!

Token: 1x (chỉ khi tạo)
```

---

## 🎯 Khi Nào Gọi Gemini?

### Không Gọi (0 token)

**1. Chỉ có 1 câu hỏi:**
```
Messages:
- User: "Tra cứu quy định xin phép nghỉ học"

Summary: "Tra cứu quy định xin phép nghỉ học"
→ Dùng luôn, không cần AI
```

**2. Summary đã tốt:**
```
Existing: "Tra cứu quy định xin phép nghỉ học"
Update: Thêm messages mới

→ Giữ nguyên summary cũ
→ Không gọi Gemini
```

### Có Gọi (1 token)

**1. Nhiều câu hỏi:**
```
Messages:
- User: "Tra cứu quy định xin phép nghỉ học"
- User: "Nếu em bị bạn bè trêu chọc?"
- User: "Lập kế hoạch ôn 7 ngày"

→ Gọi Gemini tóm tắt
→ Summary: "Hỏi về quy định, xử lý bắt nạt và ôn thi"
```

**2. Summary generic:**
```
Existing: "Chat mới"
Update: Có messages mới

→ Gọi Gemini tạo summary mới
```

---

## 💰 Chi Phí Ước Tính

### Gemini 1.5 Flash Pricing

**Input:** $0.075 / 1M tokens  
**Output:** $0.30 / 1M tokens

### Ước Tính 1 Session

**Input:**
- Prompt: ~50 tokens
- Messages: ~50 tokens
- Total: 100 tokens

**Output:**
- Summary: ~15 tokens

**Cost:**
- Input: 100 × $0.075 / 1M = $0.0000075
- Output: 15 × $0.30 / 1M = $0.0000045
- **Total: $0.000012 ≈ $0.00001 (1 cent / 1000 sessions)**

### Ước Tính 1000 Sessions/Tháng

**Giả sử:**
- 1000 sessions
- 30% có nhiều câu hỏi → Gọi Gemini
- 70% chỉ 1 câu → Không gọi

**Chi phí:**
- 300 sessions × $0.00001 = **$0.003 ≈ 70 VNĐ/tháng**

**Kết luận:** Rất rẻ! Không đáng lo!

---

## 🔍 Debug

### Nếu Vẫn Thấy "Chat mới"

**Check 1: Console log**
```
F12 → Console
→ Tìm: "Updated summary"
```

**Phải thấy:**
```
🔄 Updated summary for [uuid]: "Tra cứu quy định..."
```

**Check 2: API response**
```
F12 → Network → /api/sessions
→ Response
```

**Check 3: Supabase**
```sql
SELECT 
    session_name,
    total_messages,
    updated_at
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 5;
```

### Nếu Gemini Lỗi

**Check .env.local:**
```bash
cat .env.local | grep GEMINI_API_KEY
```

**Phải có:**
```
GEMINI_API_KEY=AIza...
```

**Test Gemini:**
```bash
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

## ✅ Checklist

- [ ] Xóa data cũ
- [ ] Clear cache
- [ ] Test chat mới
- [ ] Console: Không có lỗi
- [ ] Supabase: session_name = câu hỏi thật
- [ ] Admin: Thấy summary đúng ngay
- [ ] Không cần ấn "Tạo lại tóm tắt"
- [ ] Test nhiều câu → Summary = tóm tắt Gemini

---

## 🎉 Kết Quả

### Flow Hoàn Chỉnh

```
User chat:
1. "Tra cứu quy định xin phép nghỉ học"
   ↓
2. API tạo summary: "Tra cứu quy định xin phép nghỉ học"
   ↓
3. Lưu vào Supabase
   ↓
4. Admin mở dashboard
   ↓
5. Thấy: "Tra cứu quy định xin phép nghỉ học" ✅
```

### Không Cần

- ❌ Ấn nút "Tạo lại tóm tắt"
- ❌ Gọi API thêm lần nữa
- ❌ Tốn token 2 lần

### Tiết Kiệm

- ✅ Token: 50% (chỉ gọi 1 lần)
- ✅ Thời gian: 100% (không cần ấn nút)
- ✅ UX: Tốt hơn (summary đúng ngay)

---

**Xóa data cũ và test lại! 🚀**

```sql
DELETE FROM messages;
DELETE FROM chat_sessions;
```

```javascript
localStorage.clear();
location.reload();
```
