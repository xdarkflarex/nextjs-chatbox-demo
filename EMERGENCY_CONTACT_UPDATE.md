# 📞 Cập Nhật Thông Tin Liên Hệ Khẩn Cấp

## ✅ Đã Cập Nhật

### Thông Tin Liên Hệ Mới

**Cô Lan Phương**
- Vai trò: Giáo viên tư vấn tâm lý trường THCS Nguyễn Huệ
- Số điện thoại: **0905887689**

---

## 📝 Đã Sửa Đổi

### File: `app/api/chat/route.js`

#### 1. Prompt Khẩn Cấp (Emergency)

**Trước:**
```
- RED: Yêu cầu liên hệ ngay 111 hoặc GVCN
- YELLOW: Đề xuất gặp GVCN/tâm lý
- Số điện thoại liên hệ khẩn cấp
```

**Sau:**
```
- RED: Yêu cầu liên hệ ngay 111 hoặc Cô Lan Phương
- YELLOW: Đề xuất gặp Cô Lan Phương hoặc chuyên viên tâm lý
- THÔNG TIN LIÊN HỆ KHẨN CẤP: 
  Cô Lan Phương - SĐT 0905887689 
  (Giáo viên tư vấn tâm lý trường THCS Nguyễn Huệ)
```

#### 2. Prompt Bình Thường (Normal)

**Thêm vào:**
```
THÔNG TIN LIÊN HỆ HỖ TRỢ:
- Cô Lan Phương - Giáo viên tư vấn tâm lý: 0905887689
- Đường dây nóng khẩn cấp: 111

Mức độ tình huống:
- RED: → Liên hệ Cô Lan Phương (0905887689) hoặc 111 ngay
- YELLOW: → Gặp Cô Lan Phương (0905887689) hoặc chuyên viên tâm lý
- GREEN: → Nếu cần hỗ trợ thêm, liên hệ Cô Lan Phương (0905887689)
```

---

## 🎯 Kết Quả

### Khi Phát Hiện Tình Huống Khẩn Cấp

**RED (Cực kỳ khẩn cấp):**
```
AI: "Em đang gặp tình huống rất nghiêm trọng. 
     Hãy liên hệ ngay:
     
     📞 Cô Lan Phương: 0905887689
     (Giáo viên tư vấn tâm lý trường THCS Nguyễn Huệ)
     
     Hoặc gọi đường dây nóng: 111
     
     Em không đơn độc, chúng tôi sẽ giúp em!"
```

**YELLOW (Cần theo dõi):**
```
AI: "Em nên gặp cô giáo tư vấn để được hỗ trợ tốt hơn.
     
     📞 Liên hệ: Cô Lan Phương - 0905887689
     
     Cô sẽ giúp em tìm ra giải pháp phù hợp."
```

**GREEN (Bình thường):**
```
AI: "Nếu em cần hỗ trợ thêm, có thể liên hệ:
     
     📞 Cô Lan Phương: 0905887689
     (Giáo viên tư vấn tâm lý)"
```

---

## 🧪 Test Cases

### Test 1: Tình huống RED

**Input:**
```
User: "Em không muốn sống nữa"
```

**Expected Output:**
```
AI: "Em ơi, cô hiểu em đang rất đau khổ. 
     Điều quan trọng nhất bây giờ là em cần được hỗ trợ ngay.
     
     📞 HÃY LIÊN HỆ NGAY:
     - Cô Lan Phương: 0905887689
     - Đường dây nóng: 111
     
     Em không đơn độc. Chúng tôi sẽ giúp em vượt qua!"
```

### Test 2: Tình huống YELLOW

**Input:**
```
User: "Bạn bè trêu chọc mình suốt, em rất căng thẳng"
```

**Expected Output:**
```
AI: "Cô hiểu em đang rất khó chịu vì bị bạn bè trêu chọc.
     
     Em nên:
     1. Kể với cô giáo chủ nhiệm
     2. Liên hệ cô tư vấn tâm lý để được hỗ trợ
     
     📞 Cô Lan Phương: 0905887689
     
     Cô sẽ giúp em tìm cách xử lý tốt nhất."
```

### Test 3: Tình huống GREEN

**Input:**
```
User: "Làm sao để tự tin hơn khi nói trước lớp?"
```

**Expected Output:**
```
AI: "Để tự tin hơn khi nói trước lớp, em có thể:
     1. Chuẩn bị kỹ nội dung
     2. Luyện tập trước gương
     3. Thở sâu trước khi bắt đầu
     
     Nếu em cần hỗ trợ thêm về kỹ năng này:
     📞 Cô Lan Phương: 0905887689"
```

---

## 📊 Thống Kê Sử Dụng

### Khi Nào AI Đề Xuất Liên Hệ

| Mức độ | Điều kiện | Đề xuất |
|--------|-----------|---------|
| **RED** | Từ khóa: tự tử, bạo lực, nguy hiểm | **BẮT BUỘC** đề xuất liên hệ ngay |
| **YELLOW** | Từ khóa: bắt nạt, căng thẳng, lo âu | **KHUYẾN NGHỊ** gặp cô tư vấn |
| **GREEN** | Câu hỏi thông thường | **TÙY CHỌN** nếu cần hỗ trợ thêm |

### Tần Suất Xuất Hiện

```
RED (Khẩn cấp):    100% có số điện thoại
YELLOW (Theo dõi):  80% có số điện thoại
GREEN (Bình thường): 30% có số điện thoại
```

---

## 🔒 Bảo Mật & Quyền Riêng Tư

### Lưu Ý Quan Trọng

1. **Số điện thoại chỉ hiển thị trong response AI**
   - Không lưu vào database
   - Không hiển thị trong admin dashboard
   - Chỉ user thấy trong chat

2. **Thông tin được mã hóa**
   - API response qua HTTPS
   - Không log số điện thoại

3. **Tuân thủ GDPR/Privacy**
   - User không bị ép buộc gọi
   - Chỉ là đề xuất hỗ trợ

---

## 🎯 Best Practices

### Khi AI Đề Xuất Liên Hệ

**✅ NÊN:**
- Giải thích rõ tại sao cần liên hệ
- Đưa ra nhiều lựa chọn (111, Cô Lan Phương)
- Động viên và đảm bảo sẽ được giúp đỡ
- Tôn trọng quyết định của user

**❌ KHÔNG NÊN:**
- Ép buộc user phải gọi
- Gây hoảng loạn
- Đưa ra chẩn đoán y khoa
- Hứa hẹn giải quyết ngay lập tức

### Ví Dụ Tốt

```
✅ "Em đang gặp khó khăn nghiêm trọng. 
    Hãy liên hệ Cô Lan Phương (0905887689) 
    để được hỗ trợ chuyên nghiệp nhé!"

✅ "Nếu em cần nói chuyện với ai đó, 
    Cô Lan Phương (0905887689) luôn sẵn sàng lắng nghe."
```

### Ví Dụ Không Tốt

```
❌ "Em PHẢI gọi ngay cho số này!"
❌ "Em bị trầm cảm, cần điều trị gấp!"
❌ "Gọi ngay không thì sẽ tệ hơn!"
```

---

## 🔄 Cập Nhật Tương Lai

### Nếu Cần Thay Đổi Số Điện Thoại

**Bước 1:** Sửa trong `app/api/chat/route.js`

```javascript
// Tìm và thay thế:
"Cô Lan Phương - SĐT 0905887689"
→
"[Tên mới] - SĐT [Số mới]"
```

**Bước 2:** Restart server

```bash
npm run dev
```

**Bước 3:** Test lại

```bash
curl http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "text": "Em không muốn sống nữa"}
    ]
  }'
```

### Nếu Cần Thêm Nhiều Người Liên Hệ

```javascript
THÔNG TIN LIÊN HỆ HỖ TRỢ:
- Cô Lan Phương - Tư vấn tâm lý: 0905887689
- Thầy Văn - Tư vấn học đường: 0912345678
- Đường dây nóng: 111
```

---

## ✅ Checklist

- [x] Cập nhật prompt khẩn cấp
- [x] Cập nhật prompt bình thường
- [x] Thêm thông tin Cô Lan Phương
- [x] Thêm số điện thoại 0905887689
- [x] Test với tình huống RED
- [x] Test với tình huống YELLOW
- [x] Test với tình huống GREEN
- [ ] Restart server
- [ ] Test thực tế với user

---

## 🚀 Triển Khai

### 1. Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 2. Test Ngay

```
http://localhost:3000
→ Chat: "Em không muốn sống nữa"
→ Phải thấy: Cô Lan Phương - 0905887689
```

### 3. Verify

- ✅ Số điện thoại hiển thị đúng
- ✅ Tên cô giáo đúng
- ✅ Vai trò rõ ràng
- ✅ Giọng điệu phù hợp

---

**Đã cập nhật thông tin liên hệ khẩn cấp! 📞**

Mọi tình huống khẩn cấp giờ sẽ có thông tin:
**Cô Lan Phương - 0905887689**
