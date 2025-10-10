# ✅ CHECKLIST TRIỂN KHAI - Chatbot Trường Học

## 📋 TRƯỚC KHI TRIỂN KHAI

### **1. Kiểm Tra Môi Trường**
- [ ] Node.js đã cài đặt (version ≥ 18)
- [ ] npm hoặc yarn đã cài đặt
- [ ] Git đã cài đặt (nếu cần version control)

### **2. Cài Đặt Dependencies**
```bash
cd nextjs-chatbox-demo
npm install
```

**Kiểm tra:**
- [ ] Không có lỗi khi install
- [ ] File `node_modules` đã được tạo
- [ ] File `package-lock.json` đã được tạo

### **3. Cấu Hình API Key**
```bash
# Tạo file .env.local
echo "GEMINI_API_KEY=your-api-key-here" > .env.local
```

**Lấy API Key:**
1. Truy cập: https://aistudio.google.com/app/apikey
2. Tạo API key mới
3. Copy và paste vào `.env.local`

**Kiểm tra:**
- [ ] File `.env.local` tồn tại
- [ ] API key hợp lệ (không có khoảng trắng thừa)
- [ ] File không bị commit lên Git (đã có trong `.gitignore`)

### **4. Kiểm Tra Dữ Liệu**
```bash
# Kiểm tra các file dữ liệu
ls app/public/data/
```

**Phải có:**
- [ ] `rag_all.json` - Dữ liệu FAQ tâm lý
- [ ] `RAG_MASTER_STRUCTURED.jsonl` - Dữ liệu trường đã cấu trúc
- [ ] `RAG_MASTER_RAW.jsonl` - Dữ liệu raw backup

**Kiểm tra format:**
```bash
# Kiểm tra JSONL hợp lệ
head -n 1 app/public/data/RAG_MASTER_STRUCTURED.jsonl | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')))"
```

---

## 🚀 TRIỂN KHAI

### **1. Chạy Development Server**
```bash
npm run dev
```

**Kiểm tra:**
- [ ] Server khởi động không lỗi
- [ ] Console hiển thị: `Ready on http://localhost:3000`
- [ ] Không có warning về missing dependencies

### **2. Test Chatbot**
Mở trình duyệt: http://localhost:3000

**Test cơ bản:**
- [ ] Trang load thành công
- [ ] Chatbot hiển thị
- [ ] Có thể chọn vai trò (Học sinh/Giáo viên/Phụ huynh)
- [ ] Có thể gửi tin nhắn
- [ ] Nhận được phản hồi từ AI

**Test các loại câu hỏi:**

#### **A. Thông tin liên hệ**
```
"Số điện thoại GVCN lớp 6/1"
```
- [ ] Trả về: Lê Thị Lý - 0906444659
- [ ] Thời gian phản hồi < 2 giây
- [ ] Console log: `✅ Smart retrieval: { intent: 'contact', ... }`

#### **B. Quy định**
```
"Sổ đầu bài chấm điểm như thế nào"
```
- [ ] Trả về thông tin về 10 điểm/tiết, 4 tiêu chí
- [ ] Thời gian phản hồi < 2 giây

#### **C. Lịch trình**
```
"Thứ 2 BGH ai trực"
```
- [ ] Trả về lịch trực Thứ 2
- [ ] Có tên người trực sáng và chiều

#### **D. Phòng học**
```
"Lớp 8/5 học ở phòng nào"
```
- [ ] Trả về: Phòng 3

#### **E. Tâm lý (RAG cũ)**
```
"Em đang căng thẳng trước kỳ thi"
```
- [ ] Trả về lời khuyên tâm lý
- [ ] Có phát hiện mức độ (yellow/green)

### **3. Test Smart Retrieval API**
```bash
# Test trực tiếp API
curl -X POST http://localhost:3000/api/smart-retrieval \
  -H "Content-Type: application/json" \
  -d '{"query": "Số điện thoại GVCN lớp 6/1"}'
```

**Kiểm tra:**
- [ ] Trả về JSON hợp lệ
- [ ] Có field `intent`, `details`, `results`
- [ ] `results` có dữ liệu đúng

### **4. Test Tự Động**
```bash
node test-smart-retrieval.js
```

**Kiểm tra:**
- [ ] Tất cả test cases PASSED
- [ ] Success rate ≥ 90%
- [ ] Không có lỗi timeout

### **5. Test Trang Admin**
Mở: http://localhost:3000/admin

**Kiểm tra:**
- [ ] Trang load thành công
- [ ] Hiển thị danh sách phiên chat
- [ ] Có thể lọc theo vai trò
- [ ] Có thể lọc phiên khẩn cấp
- [ ] Có thể xem chi tiết hội thoại

### **6. Test Tính Năng Tự Động Lưu**
1. Mở chatbot
2. Gửi vài tin nhắn
3. Refresh trang (F5)

**Kiểm tra:**
- [ ] Hội thoại vẫn còn sau khi refresh
- [ ] Console log: `✅ Session saved`
- [ ] localStorage có dữ liệu: `localStorage.getItem('chatSessions')`

### **7. Test Phát Hiện Khẩn Cấp**
```
"Em muốn tự tử"
```

**Kiểm tra:**
- [ ] Phát hiện mức độ RED
- [ ] Hiển thị nút "Cần hỗ trợ khẩn"
- [ ] Yêu cầu liên hệ GVCN/Tổng đài 111
- [ ] Phiên được đánh dấu khẩn cấp trong Admin

---

## 📊 GIÁM SÁT HIỆU SUẤT

### **1. Kiểm Tra Console Log**
Mở Developer Tools (F12) → Console

**Phải thấy:**
```
✅ Smart retrieval: { intent: 'contact', resultsCount: 1 }
📌 Using smart context: === THÔNG TIN TRƯỜNG ===...
Loaded 62 RAG entries
```

**KHÔNG được thấy:**
```
❌ Error loading smart retrieval data
⚠️ Smart retrieval failed
[GoogleGenerativeAI Error]: 503 Service Unavailable
```

### **2. Kiểm Tra Network**
Developer Tools → Network → Filter: `chat`

**Kiểm tra request `/api/chat`:**
- [ ] Status: 200 OK
- [ ] Time: < 2000ms
- [ ] Size: < 50KB

### **3. Kiểm Tra Token Usage**
Xem trong console log hoặc Gemini API dashboard

**Mục tiêu:**
- Input tokens: 800-1200 (thay vì 2000-3000)
- Output tokens: 500-800
- Total: < 2000 tokens/request

### **4. Kiểm Tra Chi Phí**
Truy cập: https://aistudio.google.com/app/apikey

**Theo dõi:**
- [ ] Requests per day
- [ ] Tokens used
- [ ] Quota remaining

**Ước tính chi phí:**
- Free tier: 1,500 requests/day = $0
- Paid: ~$0.06/1000 requests (sau khi tối ưu)

---

## 🔧 XỬ LÝ SỰ CỐ

### **Vấn Đề 1: Lỗi 503 Service Unavailable**

**Nguyên nhân:**
- API key hết quota
- Context quá dài
- Gemini API quá tải

**Giải pháp:**
1. Kiểm tra quota: https://aistudio.google.com/app/apikey
2. Kiểm tra context length trong console
3. Đợi 1-2 phút và thử lại
4. Nếu vẫn lỗi, kiểm tra file `smart-retrieval-lib.js` có hoạt động không

### **Vấn Đề 2: Smart Retrieval Không Hoạt Động**

**Triệu chứng:**
```
⚠️ Smart retrieval failed, fallback to old method
```

**Giải pháp:**
1. Kiểm tra file tồn tại:
```bash
ls app/public/data/RAG_MASTER_STRUCTURED.jsonl
```

2. Kiểm tra format JSONL:
```bash
head -n 1 app/public/data/RAG_MASTER_STRUCTURED.jsonl | jq .
```

3. Kiểm tra import trong `chat/route.js`

### **Vấn Đề 3: Chatbot Không Trả Lời**

**Kiểm tra:**
1. API key có đúng không: `cat .env.local`
2. Server có chạy không: `npm run dev`
3. Console có lỗi không: F12 → Console
4. Network có request failed không: F12 → Network

### **Vấn Đề 4: Phiên Chat Không Lưu**

**Kiểm tra:**
1. localStorage có hoạt động không:
```javascript
localStorage.setItem('test', '123')
localStorage.getItem('test') // Should return '123'
```

2. Browser có block localStorage không
3. Console có lỗi `Error saving session` không

---

## 🎯 PRODUCTION BUILD

### **1. Build Production**
```bash
npm run build
```

**Kiểm tra:**
- [ ] Build thành công không lỗi
- [ ] Folder `.next` được tạo
- [ ] Size < 100MB

### **2. Test Production Build**
```bash
npm start
```

**Kiểm tra:**
- [ ] Server khởi động
- [ ] Chatbot hoạt động bình thường
- [ ] Tất cả tính năng hoạt động

### **3. Deploy lên Vercel/Netlify**

#### **Vercel:**
```bash
npm install -g vercel
vercel
```

#### **Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Sau khi deploy:**
- [ ] Thêm environment variable `GEMINI_API_KEY`
- [ ] Test chatbot trên production URL
- [ ] Kiểm tra tất cả tính năng

---

## 📝 BẢO TRÌ HÀNG NGÀY

### **Hàng Ngày**
- [ ] Kiểm tra trang Admin có phiên khẩn cấp không
- [ ] Xem console log có lỗi không
- [ ] Kiểm tra số lượng phiên chat

### **Hàng Tuần**
- [ ] Backup localStorage: `localStorage.getItem('chatSessions')`
- [ ] Cập nhật dữ liệu mới (nếu có)
- [ ] Kiểm tra chi phí API
- [ ] Review các câu hỏi thường gặp

### **Hàng Tháng**
- [ ] Đánh giá chất lượng trả lời
- [ ] Cập nhật FAQ dựa trên câu hỏi mới
- [ ] Tối ưu hóa dữ liệu
- [ ] Backup toàn bộ dữ liệu

---

## 🎓 HƯỚNG DẪN NGƯỜI DÙNG

### **Cho Học Sinh**
1. Truy cập: [URL chatbot]
2. Chọn "Học sinh"
3. Hỏi về:
   - Tâm lý, học tập
   - Số điện thoại GVCN
   - Quy định nhà trường
   - Lịch trình, phòng học

### **Cho Giáo Viên**
1. Truy cập: [URL chatbot]
2. Chọn "Giáo viên"
3. Hỏi về:
   - Phương pháp giảng dạy
   - Xử lý tình huống học sinh
   - Quy định nhà trường

### **Cho Phụ Huynh**
1. Truy cập: [URL chatbot]
2. Chọn "Phụ huynh"
3. Hỏi về:
   - Theo dõi con học tập
   - Liên hệ nhà trường
   - Lịch họp phụ huynh

### **Cho Admin**
1. Truy cập: [URL]/admin
2. Xem danh sách phiên chat
3. Lọc phiên khẩn cấp
4. Xử lý các tình huống cần can thiệp

---

## ✅ CHECKLIST CUỐI CÙNG

### **Kỹ Thuật**
- [ ] Server chạy ổn định
- [ ] Smart retrieval hoạt động
- [ ] Gemini API không lỗi 503
- [ ] Thời gian phản hồi < 2s
- [ ] Token usage giảm 60%
- [ ] Tất cả test cases passed
- [ ] Production build thành công

### **Chức Năng**
- [ ] 3 vai trò hoạt động
- [ ] 6 loại câu hỏi trả lời đúng
- [ ] Phát hiện khẩn cấp hoạt động
- [ ] Tự động lưu hoạt động
- [ ] Trang Admin hoạt động

### **Tài Liệu**
- [ ] README.md đầy đủ
- [ ] Hướng dẫn sử dụng cho người dùng
- [ ] Hướng dẫn bảo trì cho admin
- [ ] Test cases đầy đủ

### **Bảo Mật**
- [ ] API key không bị lộ
- [ ] .env.local trong .gitignore
- [ ] Không có sensitive data trong code
- [ ] HTTPS khi deploy production

---

## 🎉 SẴN SÀNG TRIỂN KHAI!

Nếu tất cả checklist đều ✅, hệ thống đã sẵn sàng cho học sinh, giáo viên và phụ huynh sử dụng!

**Chúc mừng bạn đã hoàn thành triển khai Chatbot Trường Học! 🚀**

---

## 📞 HỖ TRỢ

**Tài liệu tham khảo:**
- `HUONG_DAN_SU_DUNG.md` - Hướng dẫn chi tiết
- `SMART_RETRIEVAL_README.md` - Hướng dẫn Smart Retrieval
- `FIX_SMART_RETRIEVAL.md` - Hướng dẫn fix lỗi
- `TEST_SMART_RETRIEVAL.md` - Test cases

**Test script:**
```bash
node test-smart-retrieval.js
```

**Debug:**
- Console log (F12)
- Network tab (F12)
- `localStorage.getItem('chatSessions')`
