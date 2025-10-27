# 🧪 Hướng Dẫn Chạy Test Gemini API

## 📋 Mục đích:

Test script sẽ kiểm tra:
1. ✅ Gemini có sử dụng đúng **2 file JSON** không
2. ✅ Độ chính xác của câu trả lời
3. ✅ Context có được build đúng không

## 🚀 Cách chạy:

### **Bước 1: Cài đặt dependencies (nếu chưa có)**
```bash
npm install
```

### **Bước 2: Kiểm tra .env.local**
```bash
# Đảm bảo có GEMINI_API_KEY
GEMINI_API_KEY=your-api-key-here
GEMINI_API_KEY_2=your-second-api-key-here
```

### **Bước 3: Chạy test**
```bash
node test-gemini-context.js
```

## 📊 20 Test Cases:

### **Nhóm 1: BGH (5 tests)**
1. Hiệu trưởng tên gì?
2. Có bao nhiêu phó hiệu trưởng?
3. Thứ 2 buổi sáng BGH ai trực?
4. Thứ 5 buổi chiều ai trực?
5. BGH trực từ mấy giờ?

### **Nhóm 2: GVCN (5 tests)**
6. Số điện thoại GVCN lớp 6/1?
7. GVCN lớp 9/6 tên gì?
8. Lớp 7/3 GVCN là ai?
9. Số điện thoại cô Bùi Như Thành Nhân?
10. Lớp 8/5 học phòng nào và GVCN là ai?

### **Nhóm 3: Quy định (5 tests)**
11. Sổ đầu bài chấm điểm thế nào?
12. Công thức tính điểm thi đua lớp?
13. Lớp đạt bao nhiêu điểm xếp loại Tốt?
14. Học sinh hút thuốc bị xử lý thế nào?
15. Nộp sổ sao đỏ khi nào?

### **Nhóm 4: Tư vấn tâm lý (5 tests)**
16. Em stress vì sắp thi, làm sao giảm căng thẳng?
17. Em bị bạn bắt nạt, em phải làm gì?
18. Làm sao để học tốt hơn khi hay quên bài?
19. Giáo viên: Học sinh không làm bài tập nhiều lần?
20. Em bị bắt nạt, em học lớp 6/1, liên hệ ai? (Test kết hợp)

## 📈 Kết quả mong đợi:

### **Độ chính xác:**
- ✅ **≥ 90%**: Xuất sắc (Gemini trả lời đúng hầu hết từ khóa)
- ✅ **70-89%**: Tốt (Gemini hiểu và trả lời đúng)
- ⚠️ **50-69%**: Trung bình (Thiếu một số thông tin)
- ❌ **< 50%**: Kém (Không sử dụng đúng context)

### **Output mẫu:**
```
================================================================================
TEST 1: BGH
================================================================================
📝 Câu hỏi: Hiệu trưởng trường THCS Nguyễn Huệ tên gì?
🎯 Từ khóa mong đợi: Võ Thanh Phước
📚 Context cần: school_info

📖 Context đã build (245 chars):
=== THÔNG TIN TRƯỜNG THCS NGUYỄN HUỆ ===

**Ban Giám Hiệu:**
- Hiệu trưởng: Võ Thanh Phước
- Phó HT: Hồ Thị Phước, Phạm Thị Thùy Loan

✅ Câu trả lời từ Gemini:
Hiệu trưởng trường THCS Nguyễn Huệ là thầy Võ Thanh Phước.

📊 Kết quả:
- Từ khóa tìm thấy: 1/1
- Độ chính xác: 100.0%
- Từ khóa đúng: Võ Thanh Phước
```

## 🎯 Điểm kiểm tra:

### **1. Context có được build không?**
```
✅ Phải thấy: "=== THÔNG TIN TRƯỜNG THCS NGUYỄN HUỆ ==="
✅ Phải thấy: "=== TÌNH HUỐNG TƯƠNG TỰ ===" (với câu tư vấn)
```

### **2. Thông tin có đúng không?**
```
✅ BGH: Võ Thanh Phước, Hồ Thị Phước, Phạm Thị Thùy Loan
✅ GVCN 6/1: Lê Thị Lý - 0906444659
✅ Sổ đầu bài: 10 điểm, 4 tiêu chí mỗi 2.5 điểm
```

### **3. Gemini có trả lời đúng không?**
```
✅ Phải chứa từ khóa mong đợi
✅ Phải chính xác (tên, số điện thoại, quy định)
✅ Phải ngắn gọn, dễ hiểu
```

## 📁 File kết quả:

Sau khi chạy xong, sẽ tạo file `test-results.json`:

```json
[
  {
    "id": 1,
    "category": "BGH",
    "question": "Hiệu trưởng trường THCS Nguyễn Huệ tên gì?",
    "answer": "Hiệu trưởng trường THCS Nguyễn Huệ là thầy Võ Thanh Phước.",
    "expected": 1,
    "found": 1,
    "accuracy": 100,
    "passed": true
  },
  ...
]
```

## 🔍 Debug:

### **Nếu accuracy thấp:**

1. **Kiểm tra context:**
   ```javascript
   console.log(context); // Xem context có đủ thông tin không
   ```

2. **Kiểm tra file JSON:**
   ```bash
   # Xem file có load đúng không
   node -e "console.log(require('./app/public/data/context_school_info.json').ban_giam_hieu)"
   ```

3. **Kiểm tra Gemini API:**
   ```bash
   # Test trực tiếp
   curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Test"}]}]}'
   ```

## ⚠️ Lưu ý:

### **Rate limit:**
- Script có delay 2s giữa mỗi test
- Nếu bị rate limit, tăng delay lên 3-5s

### **API Key:**
- Đảm bảo API key còn quota
- Có thể dùng GEMINI_API_KEY_2 nếu key 1 hết quota

### **Token limit:**
- Context không quá 4000 tokens
- Nếu quá, cần rút gọn context

## 📊 Tổng kết mẫu:

```
================================================================================
📊 TỔNG KẾT
================================================================================

✅ Passed: 18/20 (90.0%)
❌ Failed: 2/20
📈 Độ chính xác trung bình: 87.5%

BGH: 5/5 passed (95.0% accuracy)
GVCN: 5/5 passed (92.0% accuracy)
Quy định: 4/5 passed (85.0% accuracy)
Tư vấn: 4/5 passed (78.0% accuracy)

💾 Kết quả đã lưu vào: test-results.json
```

## ✅ Kết luận:

Nếu **≥ 16/20 tests passed** (80%):
- ✅ Gemini đang sử dụng đúng 2 file JSON
- ✅ Context được build chính xác
- ✅ Câu trả lời có chất lượng tốt

Nếu **< 16/20 tests passed**:
- ❌ Cần kiểm tra lại logic build context
- ❌ Cần kiểm tra lại prompt template
- ❌ Cần kiểm tra lại 2 file JSON

---

**Chúc test thành công! 🎉**
