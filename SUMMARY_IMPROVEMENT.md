# 📝 Cải Tiến Tóm Tắt Phiên Chat

## ❌ Vấn đề cũ

**Trước đây:**
- Tóm tắt được tạo **trong khi chat** (mỗi lần có tin nhắn mới)
- Chỉ dựa vào **câu hỏi đầu tiên** hoặc vài câu đầu
- Không có context đầy đủ về cuộc hội thoại
- Kết quả: Tóm tắt **không chính xác**, thiếu thông tin

**Ví dụ tóm tắt cũ:**
```
"Em muốn hỏi về..."  ❌ Không rõ ràng
"Tôi là học sinh"    ❌ Không có nội dung
```

## ✅ Giải pháp mới

### **1. Tóm tắt khi KẾT THÚC phiên chat**

**Flow mới:**
```
User chat → Click "Kết thúc" → API đọc TOÀN BỘ messages → 
Gemini phân tích → Tạo tóm tắt chất lượng cao → Lưu vào database
```

### **2. API mới: `/api/sessions/finalize`**

**Chức năng:**
- Đọc **tất cả messages** từ database (không bỏ sót)
- Tạo **transcript đầy đủ** (User + Bot)
- Gọi Gemini với **prompt tốt hơn**
- Cập nhật `session_name` với tóm tắt chi tiết
- Đánh dấu `ended_at` và `is_active = false`

**Prompt mới cho Gemini:**
```
Bạn là chuyên gia phân tích cuộc hội thoại tâm lý học đường.

THÔNG TIN:
- Người dùng: Học sinh lớp 6/1
- Số lượng tin nhắn: 12

CUỘC HỘI THOẠI:
Người dùng: Em đang lo lắng về kỳ thi
Trợ lý AI: Em đang lo lắng điều gì cụ thể?
Người dùng: Em sợ không đạt điểm cao
...

YÊU CẦU:
Tóm tắt trong 1 câu (max 100 ký tự):
1. Chủ đề chính
2. Cảm xúc/tình trạng
3. Kết quả

VÍ DỤ TỐT:
- "Học sinh lo lắng về kỳ thi, đã được tư vấn kỹ thuật học tập"
- "Phụ huynh hỏi về lịch họp và số điện thoại GVCN"
```

### **3. Kết quả**

**Ví dụ tóm tắt mới:**
```
✅ "Học sinh lo lắng về kỳ thi, đã được tư vấn kỹ thuật học tập"
✅ "Phụ huynh hỏi về lịch họp phụ huynh và số điện thoại GVCN lớp 6/1"
✅ "Giáo viên tìm hiểu cách xử lý học sinh chậm tiến bộ, đã nhận gợi ý"
✅ "Học sinh tâm sự về bạn bè, cảm thấy cô đơn, cần theo dõi thêm"
```

## 🔄 So sánh

| Tiêu chí | Cũ | Mới |
|----------|-----|-----|
| **Thời điểm** | Trong khi chat | Khi kết thúc |
| **Context** | Vài câu đầu | Toàn bộ cuộc hội thoại |
| **Độ chính xác** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Chi tiết** | Thiếu | Đầy đủ (chủ đề + cảm xúc + kết quả) |
| **Prompt** | Đơn giản | Chuyên nghiệp |

## 📊 Cách hoạt động

### **Bước 1: User click "Kết thúc"**
```javascript
// ChatWidget.jsx
async function endChat() {
  // 1. Lưu session
  await saveSession(messages);
  
  // 2. Gọi API finalize
  const response = await fetch('/api/sessions/finalize', {
    method: 'POST',
    body: JSON.stringify({ sessionId })
  });
  
  // 3. Chuyển đến thank you page
  router.push("/thank-you");
}
```

### **Bước 2: API xử lý**
```javascript
// /api/sessions/finalize/route.js
export async function POST(req) {
  // 1. Lấy session info
  const session = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  
  // 2. Lấy TẤT CẢ messages
  const messages = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at');
  
  // 3. Tạo tóm tắt chi tiết
  const summary = await generateDetailedSummary(
    messages,
    session.user_role,
    session.user_class
  );
  
  // 4. Cập nhật database
  await supabase
    .from('chat_sessions')
    .update({
      session_name: summary,
      ended_at: new Date(),
      is_active: false
    })
    .eq('id', sessionId);
}
```

### **Bước 3: Gemini phân tích**
```javascript
async function generateDetailedSummary(messages, userRole, userClass) {
  // Tạo transcript đầy đủ
  const transcript = messages.map(msg => 
    `${msg.sender === 'user' ? 'Người dùng' : 'Trợ lý AI'}: ${msg.content}`
  ).join('\n\n');
  
  // Gọi Gemini với prompt chuyên nghiệp
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

## 🎯 Lợi ích

### **Cho Admin:**
✅ Tóm tắt **chính xác** hơn  
✅ Dễ **tìm kiếm** phiên chat  
✅ Hiểu rõ **vấn đề** học sinh  
✅ Theo dõi **kết quả** tư vấn  

### **Cho Hệ thống:**
✅ Tối ưu **token usage** (chỉ tóm tắt 1 lần)  
✅ Giảm **API calls** (không gọi mỗi tin nhắn)  
✅ Tăng **chất lượng** dữ liệu  
✅ Dễ **phân tích** sau này  

## 🧪 Test

### **Test 1: Phiên chat ngắn (1-2 tin nhắn)**
```
User: "Số điện thoại GVCN lớp 6/1"
Bot: "GVCN lớp 6/1 là cô Lê Thị Lý: 0906444659"

→ Tóm tắt: "Hỏi số điện thoại GVCN lớp 6/1"
```

### **Test 2: Phiên chat dài (10+ tin nhắn)**
```
User: "Em đang lo lắng về kỳ thi"
Bot: "Em lo lắng điều gì cụ thể?"
User: "Em sợ không đạt điểm cao"
Bot: "Em đã ôn tập như thế nào?"
...

→ Tóm tắt: "Học sinh lo lắng về kỳ thi, đã được tư vấn kỹ thuật học tập và quản lý thời gian"
```

### **Test 3: Phiên chat khẩn cấp**
```
User: "Em cảm thấy rất buồn và cô đơn"
Bot: "Em có thể chia sẻ thêm không?"
User: "Em không muốn đi học nữa"
...

→ Tóm tắt: "Học sinh tâm sự cảm giác cô đơn và buồn bã, cần theo dõi và hỗ trợ thêm"
```

## 📝 Cách sử dụng

### **Cho User:**
1. Chat bình thường
2. Click nút **"Kết thúc"** khi xong
3. Đợi vài giây (API đang tóm tắt)
4. Chuyển đến trang Thank You

### **Cho Admin:**
1. Vào trang Admin
2. Xem danh sách phiên chat
3. Tóm tắt đã được **cập nhật tự động**
4. Dễ dàng tìm và phân loại

## 🚀 Deploy

**Đã cập nhật:**
- ✅ `/api/sessions/finalize/route.js` - API mới
- ✅ `ChatWidget.jsx` - Gọi API khi kết thúc
- ✅ Prompt Gemini chuyên nghiệp hơn

**Cần làm:**
- ⏳ Chạy migration để thêm cột `is_processed` (nếu chưa)
- ⏳ Test trên local
- ⏳ Deploy lên Vercel

## 💡 Tips

**Để tóm tắt tốt hơn:**
- Khuyến khích user chat **đủ chi tiết**
- Mỗi phiên chat **1 chủ đề**
- Click "Kết thúc" khi **đã xong**

**Nếu tóm tắt vẫn chưa tốt:**
- Kiểm tra prompt trong `/api/sessions/finalize/route.js`
- Điều chỉnh độ dài (hiện tại: 100 ký tự)
- Thêm ví dụ vào prompt
