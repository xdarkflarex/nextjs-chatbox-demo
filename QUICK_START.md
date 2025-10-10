# 🚀 QUICK START - Bắt Đầu Nhanh

## ⚡ 5 Phút Để Chạy Chatbot

### **Bước 1: Cài Đặt (1 phút)**
```bash
cd nextjs-chatbox-demo
npm install
```

### **Bước 2: Cấu Hình API Key (1 phút)**
```bash
# Tạo file .env.local
echo GEMINI_API_KEY=AIzaSyDGd4LxK9FHf4Mc9k3mUHQ6Auz-jda-B84 > .env.local
```

**Lấy API Key mới (nếu cần):**
1. Vào: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy và paste vào `.env.local`

### **Bước 3: Chạy (1 phút)**
```bash
npm run dev
```

### **Bước 4: Test (2 phút)**
Mở trình duyệt: **http://localhost:3000**

**Test nhanh:**
1. Chọn "Học sinh"
2. Hỏi: "Số điện thoại GVCN lớp 6/1"
3. Kết quả: "Lê Thị Lý - 0906444659"

✅ **Xong! Chatbot đã chạy!**

---

## 🎯 Test Các Tính Năng Chính

### **1. Smart Retrieval (30 giây)**
```
"Số điện thoại GVCN lớp 6/1"
→ Trả về: Lê Thị Lý - 0906444659

"Sổ đầu bài chấm điểm thế nào"
→ Trả về: 10 điểm/tiết, 4 tiêu chí

"Thứ 2 BGH ai trực"
→ Trả về: Lịch trực Thứ 2
```

### **2. Tư Vấn Tâm Lý (30 giây)**
```
"Em đang stress trước kỳ thi"
→ AI tư vấn cách giảm stress

"Em bị bạn bắt nạt"
→ AI hướng dẫn và gợi ý gặp GVCN
```

### **3. Emergency Detection (30 giây)**
```
"Em muốn tự tử"
→ Phát hiện RED, hiển thị nút khẩn cấp
→ Yêu cầu liên hệ GVCN/Tổng đài 111
```

### **4. Admin Dashboard (30 giây)**
Mở: **http://localhost:3000/admin**
- Xem danh sách phiên chat
- Lọc phiên khẩn cấp
- Xem chi tiết hội thoại

---

## 📱 Test Trên Mobile

### **Chrome DevTools**
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Chọn: iPhone SE
3. Test chatbot
4. Xoay ngang/dọc

### **Điện Thoại Thật**
1. Tìm IP máy tính: `ipconfig` (Windows) hoặc `ifconfig` (Mac/Linux)
2. Mở trên điện thoại: `http://[IP]:3000`
3. Ví dụ: `http://192.168.1.100:3000`

---

## 🐛 Troubleshooting Nhanh

### **Lỗi: "GEMINI_API_KEY is not defined"**
```bash
# Kiểm tra file .env.local
cat .env.local

# Phải có dòng:
GEMINI_API_KEY=your-key-here

# Restart server
npm run dev
```

### **Lỗi: "Cannot find module"**
```bash
# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install
```

### **Lỗi: "Port 3000 already in use"**
```bash
# Dùng port khác
npm run dev -- -p 3001

# Hoặc kill process trên port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

### **Lỗi 503 từ Gemini API**
```bash
# Kiểm tra quota
# Vào: https://aistudio.google.com/app/apikey
# Xem usage

# Nếu hết quota, đợi 24h hoặc tạo key mới
```

### **Smart Retrieval không hoạt động**
```bash
# Kiểm tra file dữ liệu
ls app/public/data/

# Phải có:
# - RAG_MASTER_STRUCTURED.jsonl
# - RAG_MASTER_RAW.jsonl
# - rag_all.json

# Nếu thiếu, check lại repo
```

---

## 📊 Kiểm Tra Hiệu Suất

### **Console Log (F12)**
Phải thấy:
```
✅ Smart retrieval: { intent: 'contact', resultsCount: 1 }
📌 Using smart context: === THÔNG TIN TRƯỜNG ===...
Loaded 62 RAG entries
```

KHÔNG được thấy:
```
❌ Error loading smart retrieval data
⚠️ Smart retrieval failed
[GoogleGenerativeAI Error]: 503
```

### **Network Tab (F12)**
Request `/api/chat`:
- Status: 200 OK
- Time: < 2000ms
- Size: < 50KB

---

## 🎨 Tùy Chỉnh Nhanh

### **Đổi Màu Theme**
File: `components/ChatWidget.jsx`
```jsx
// Tìm và thay đổi:
from-blue-600 to-blue-400  →  from-green-600 to-green-400
bg-blue-600                →  bg-green-600
text-blue-700              →  text-green-700
```

### **Đổi Tên Chatbot**
File: `components/ChatWidget.jsx` (Line 216)
```jsx
<div className="...">Trợ lý học đường</div>
→
<div className="...">Chatbot THCS Nguyễn Huệ</div>
```

### **Thêm Câu Hỏi Gợi Ý**
File: `components/ChatWidget.jsx` (Line ~130)
```jsx
const quickQuestions = {
  student: [
    "Em đang stress trước kỳ thi",
    "Số điện thoại GVCN lớp 6/1",
    "Câu hỏi mới của bạn",  // ← Thêm ở đây
  ],
  // ...
}
```

---

## 📚 Tài Liệu Chi Tiết

| File | Nội dung |
|------|----------|
| `README.md` | Tổng quan dự án |
| `DEPLOYMENT_CHECKLIST.md` | Checklist triển khai đầy đủ |
| `SMART_RETRIEVAL_README.md` | Hướng dẫn Smart Retrieval |
| `MOBILE_RESPONSIVE_FIX.md` | Hướng dẫn responsive |
| `FINAL_SUMMARY.md` | Tổng kết toàn bộ |

---

## 🚀 Deploy Lên Internet (5 phút)

### **Vercel (Khuyến nghị)**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Thêm environment variable
# Vào dashboard Vercel
# Settings → Environment Variables
# Thêm: GEMINI_API_KEY = your-key
```

### **Netlify**
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build

# 4. Deploy
netlify deploy --prod

# 5. Thêm environment variable
# Vào dashboard Netlify
# Site settings → Environment variables
# Thêm: GEMINI_API_KEY = your-key
```

---

## ✅ Checklist Nhanh

### **Development**
- [ ] `npm install` thành công
- [ ] `.env.local` có API key
- [ ] `npm run dev` chạy không lỗi
- [ ] Chatbot hiển thị và trả lời được
- [ ] Smart retrieval hoạt động (check console)
- [ ] Admin page mở được

### **Production**
- [ ] `npm run build` thành công
- [ ] `npm start` chạy được
- [ ] Test trên mobile
- [ ] Deploy lên Vercel/Netlify
- [ ] Thêm environment variable
- [ ] Test trên production URL

---

## 💡 Tips Hữu Ích

### **1. Hot Reload**
Khi sửa code, Next.js tự động reload. Không cần restart server.

### **2. Clear Cache**
Nếu thấy lỗi lạ:
```bash
# Clear Next.js cache
rm -rf .next

# Clear browser cache
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

### **3. Debug Console**
Luôn mở F12 để xem console log và network requests.

### **4. Test Script**
```bash
# Chạy test tự động
node test-smart-retrieval.js
```

### **5. Backup Data**
```javascript
// Backup chat sessions từ localStorage
localStorage.getItem('chatSessions')
// Copy và lưu vào file
```

---

## 🎯 Next Steps

Sau khi chạy thành công:

1. **Đọc tài liệu:** `README.md`
2. **Tùy chỉnh:** Đổi màu, text, câu hỏi
3. **Test kỹ:** Tất cả tính năng
4. **Deploy:** Lên Vercel/Netlify
5. **Chia sẻ:** Cho học sinh, giáo viên sử dụng

---

## 📞 Cần Giúp Đỡ?

### **Tài Liệu**
- Xem `DEPLOYMENT_CHECKLIST.md` cho hướng dẫn chi tiết
- Xem `FINAL_SUMMARY.md` cho tổng quan

### **Debug**
- Check console log (F12)
- Check network tab (F12)
- Check `.env.local`

### **Community**
- Next.js Discord
- Stack Overflow
- GitHub Issues

---

<div align="center">

**🎉 Chúc Mừng! Bạn Đã Chạy Thành Công Chatbot! 🎉**

**Giờ hãy test và tùy chỉnh theo ý bạn!**

⭐ **Nếu hữu ích, hãy cho chúng tôi một star!** ⭐

</div>
