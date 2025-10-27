# 🔄 Xóa Thông Tin Liên Hệ Cụ Thể - Cập Nhật Hệ Thống Tư Vấn

## ✅ Những gì đã thay đổi:

### **1. Xóa thông tin cá nhân:**
- ❌ Cô Lan Phương
- ❌ SĐT: 0905887689
- ❌ Nút "Cần hỗ trợ khẩn"

### **2. Thay bằng:**
- ✅ **Cán bộ tư vấn trường THCS Nguyễn Huệ**
- ✅ **Giáo viên chủ nhiệm** (nếu biết lớp)
- ✅ **Đường dây nóng 111** (cho tình huống nghiêm trọng)

## 📋 Files đã sửa:

### **1. `app/api/chat/route.js`**

**Trước:**
```javascript
- RED: Yêu cầu liên hệ ngay 111 hoặc Cô Lan Phương
- YELLOW: Đề xuất gặp Cô Lan Phương hoặc chuyên viên tâm lý
- GREEN: Có thể liên hệ Cô Lan Phương (0905887689)

THÔNG TIN LIÊN HỆ HỖ TRỢ:
- Cô Lan Phương - Giáo viên tư vấn tâm lý: 0905887689
- Đường dây nóng khẩn cấp: 111
```

**Sau:**
```javascript
- RED: Yêu cầu liên hệ ngay 111 hoặc cán bộ tư vấn trường
- YELLOW: Đề xuất gặp cán bộ tư vấn trường hoặc GVCN
- GREEN: Có thể liên hệ cán bộ tư vấn trường hoặc GVCN

THÔNG TIN LIÊN HỆ HỖ TRỢ:
- Cán bộ tư vấn trường THCS Nguyễn Huệ
- Giáo viên chủ nhiệm của lớp (nếu biết lớp)
- Đường dây nóng: 111
```

### **2. `app/thank-you/page.jsx`**

**Trước:**
```jsx
Nếu cần hỗ trợ khẩn cấp, vui lòng liên hệ:
Cô Lan Phương: 0905887689
```

**Sau:**
```jsx
Nếu cần hỗ trợ, vui lòng liên hệ:
Cán bộ tư vấn trường THCS Nguyễn Huệ hoặc GVCN của lớp
```

### **3. `app/page.js`**

**Trước:**
```jsx
Nếu bạn gặp tình huống khẩn cấp, 
vui lòng nhấn nút "Cần hỗ trợ khẩn" trong khung chat 
hoặc liên hệ trực tiếp với giáo viên chủ nhiệm.
```

**Sau:**
```jsx
Nếu bạn cần hỗ trợ, vui lòng liên hệ trực tiếp với 
cán bộ tư vấn trường hoặc giáo viên chủ nhiệm của lớp.
```

### **4. `components/ChatWidget.jsx`**

**Trước:**
```jsx
<button onClick={handleEmergency}>
  Cần hỗ trợ khẩn
</button>
```

**Sau:**
```jsx
// Đã xóa nút này
```

## 🎯 Lý do thay đổi:

### **1. Bảo vệ thông tin cá nhân:**
- Không công khai SĐT giáo viên
- Tránh quấy rối cá nhân

### **2. Linh hoạt hơn:**
- Không phụ thuộc vào 1 người
- Có thể thay đổi cán bộ tư vấn mà không cần sửa code

### **3. Chuyên nghiệp hơn:**
- Hướng đến hệ thống tư vấn của trường
- Phân cấp rõ ràng: Cán bộ tư vấn → GVCN → 111

## 📊 Cách hoạt động mới:

### **Khi học sinh cần hỗ trợ:**

```
Tình huống → AI phân loại → Khuyến nghị

RED (Nghiêm trọng):
  → "Hãy liên hệ ngay cán bộ tư vấn trường hoặc gọi 111"

YELLOW (Cần hỗ trợ):
  → "Em nên gặp cán bộ tư vấn trường hoặc GVCN để được hỗ trợ"

GREEN (Bình thường):
  → "Nếu cần hỗ trợ thêm, có thể liên hệ cán bộ tư vấn hoặc GVCN"
```

### **Nếu biết lớp học sinh:**

```
Học sinh lớp 6/1:
  → "Em có thể liên hệ cô Lê Thị Lý (GVCN lớp 6/1)"
  
Học sinh lớp 9/6:
  → "Em có thể liên hệ cô Nguyễn Thị Lan Phương (GVCN lớp 9/6)"
```

**Lưu ý:** Thông tin GVCN vẫn có trong database RAG, AI sẽ tự động tra cứu khi biết lớp.

## 🔍 Dữ liệu GVCN vẫn còn:

File `app/public/data/RAG_MASTER_STRUCTURED.jsonl` vẫn chứa đầy đủ thông tin GVCN:

```json
{
  "contact": {
    "role": "GVCN",
    "class": "6/1",
    "name": "Lê Thị Lý",
    "phone": "0906444659"
  }
}
```

**AI sẽ tự động:**
1. Hỏi học sinh: "Em học lớp mấy?"
2. Tra cứu GVCN từ database
3. Trả lời: "GVCN lớp 6/1 là cô Lê Thị Lý"

## 🧪 Test:

### **Test 1: Tình huống RED**
```
User: "Em không muốn sống nữa"
AI: "Em đang gặp tình huống rất nghiêm trọng. 
     Hãy liên hệ ngay:
     - Cán bộ tư vấn trường THCS Nguyễn Huệ
     - Hoặc gọi đường dây nóng: 111"
```

### **Test 2: Tình huống YELLOW**
```
User: "Em bị bạn bắt nạt"
AI: "Em nên gặp cán bộ tư vấn trường hoặc GVCN 
     để được hỗ trợ kịp thời nhé."
```

### **Test 3: Hỏi GVCN**
```
User: "Số điện thoại GVCN lớp 6/1"
AI: "GVCN lớp 6/1 là cô Lê Thị Lý: 0906444659"
```

## ✅ Checklist:

- [x] Xóa "Cô Lan Phương" trong `app/api/chat/route.js`
- [x] Xóa SĐT "0905887689" trong tất cả files
- [x] Xóa nút "Cần hỗ trợ khẩn" trong `ChatWidget.jsx`
- [x] Cập nhật trang `thank-you`
- [x] Cập nhật trang chủ `page.js`
- [x] Thay bằng "cán bộ tư vấn trường"
- [x] Giữ nguyên data GVCN trong RAG

## 🚀 Deploy:

```bash
# Test local
npm run dev

# Kiểm tra:
1. Chat thử tình huống khẩn cấp
2. Không thấy "Cô Lan Phương" hoặc "0905887689"
3. Thấy "cán bộ tư vấn trường"
4. Hỏi GVCN vẫn trả lời đúng

# Deploy
git add .
git commit -m "Remove personal contact info, use school counselor"
git push
```

## 💡 Lợi ích:

✅ **Bảo mật:** Không công khai SĐT cá nhân  
✅ **Linh hoạt:** Dễ thay đổi cán bộ tư vấn  
✅ **Chuyên nghiệp:** Hướng đến hệ thống trường  
✅ **Vẫn hiệu quả:** AI vẫn tra cứu được GVCN khi cần  

Hoàn tất! 🎉
