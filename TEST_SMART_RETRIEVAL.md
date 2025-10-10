# Test Cases - Hệ Thống Truy Xuất Thông Minh

## 🧪 Cách Test

### **1. Test API Trực Tiếp**
```bash
# Khởi động server
npm run dev

# Test bằng curl hoặc Postman
curl -X POST http://localhost:3000/api/smart-retrieval \
  -H "Content-Type: application/json" \
  -d '{"query": "Số điện thoại GVCN lớp 6/1"}'
```

### **2. Test Qua Chatbot**
Mở chatbot và hỏi các câu hỏi dưới đây, kiểm tra:
- ✅ Thời gian phản hồi (< 2 giây)
- ✅ Độ chính xác thông tin
- ✅ Console log có hiển thị "✅ Smart retrieval"

---

## 📋 Test Cases

### **A. LIÊN HỆ (Contact)**

#### Test 1.1: Tìm GVCN theo lớp
```
Input: "Cho em xin số điện thoại thầy chủ nhiệm lớp 6/1"
Expected Intent: contact
Expected Details: { class: "6/1", grade: "6" }
Expected Result: 
  - Tên: Lê Thị Lý
  - SĐT: 0906444659
```

#### Test 1.2: Tìm GVCN nhiều lớp
```
Input: "Số điện thoại GVCN lớp 7/3 và 8/5"
Expected Intent: contact
Expected Result: 
  - Lớp 7/3: Vi Thị Hằng - 0367681696
  - Lớp 8/5: Lê Thị Ngọc Anh - 0906468227
```

#### Test 1.3: Hỏi chung chung
```
Input: "Làm sao liên hệ với giáo viên chủ nhiệm?"
Expected Intent: contact
Expected Result: Danh sách GVCN hoặc hướng dẫn cách liên hệ
```

---

### **B. QUY ĐỊNH (Policy)**

#### Test 2.1: Sổ đầu bài
```
Input: "Sổ đầu bài chấm điểm như thế nào?"
Expected Intent: policy
Expected Result: 
  - Tổng điểm: 10 điểm/tiết
  - Tiêu chí: Học tập, Kỷ luật, Vệ sinh, Chuyên cần
  - Mỗi tiêu chí: 2.5 điểm
```

#### Test 2.2: Sao đỏ
```
Input: "Quy định chấm điểm sao đỏ là gì?"
Expected Intent: policy
Expected Result:
  - Nộp sổ: Tiết 5 ngày Thứ 6
  - Vệ sinh: 2 điểm
  - Nề nếp: 4 điểm
  - Tự quản: 4 điểm
```

#### Test 2.3: Thi đua
```
Input: "Thi đua lớp tính điểm ra sao?"
Expected Intent: policy
Expected Result:
  - Công thức: (Sổ đầu bài x 2) + Nề nếp + Sao đỏ + Thưởng
  - Xếp loại: Tốt ≥32, Khá 26-31.9, TB 20-25.9, Kém <20
```

#### Test 2.4: Nghỉ học
```
Input: "Nghỉ học có phép thì có bị trừ điểm không?"
Expected Intent: policy
Expected Result:
  - Nghỉ có phép ≤3 ngày: Không trừ điểm
  - Nghỉ có phép ≥4 ngày: Trừ 0.5 điểm (nếu không được duyệt)
  - Nghỉ không phép: Trừ 0.5 điểm/lần
```

#### Test 2.5: Trang phục
```
Input: "Quy định về đồng phục là gì?"
Expected Intent: policy
Expected Result: Áo trắng, quần xanh, thắt lưng, bảng tên...
```

---

### **C. LỊCH TRÌNH (Schedule)**

#### Test 3.1: Lịch trực BGH
```
Input: "Thứ 2 tuần này BGH ai trực?"
Expected Intent: schedule
Expected Details: { weekday: "Thứ 2" }
Expected Result:
  - Sáng (6:30-11:30): Phạm Thị Thùy Loan
  - Chiều (12:30-17:30): Hồ Thị Phước
```

#### Test 3.2: Lịch trực nhiều ngày
```
Input: "Lịch trực BGH cả tuần"
Expected Intent: schedule
Expected Result: Lịch trực từ Thứ 2 đến Thứ 7
```

#### Test 3.3: Hỏi chung
```
Input: "Khi nào có họp phụ huynh?"
Expected Intent: schedule
Expected Result: Thông tin lịch họp (nếu có trong data)
```

---

### **D. PHÒNG HỌC (Rooms)**

#### Test 4.1: Tìm phòng theo lớp
```
Input: "Lớp 6/1 học ở phòng nào?"
Expected Intent: rooms
Expected Details: { class: "6/1", grade: "6" }
Expected Result: Phòng 24
```

#### Test 4.2: Nhiều lớp
```
Input: "Lớp 8/5 và 8/6 học ở đâu?"
Expected Intent: rooms
Expected Result: Phòng 3 (cả 2 lớp)
```

#### Test 4.3: Sơ đồ chung
```
Input: "Cho em xem sơ đồ phòng học"
Expected Intent: rooms
Expected Result: Thông tin về sơ đồ phòng học
```

---

### **E. HÒA NHẬP (Inclusive Education)**

#### Test 5.1: Chính sách
```
Input: "Chính sách giáo dục hòa nhập là gì?"
Expected Intent: inclusive
Expected Result:
  - Nguyên tắc: Đảm bảo quyền học tập bình đẳng...
  - Liên hệ: Hồ Thị Phước (Phó Hiệu trưởng)
```

#### Test 5.2: Học sinh khuyết tật
```
Input: "Trường có bao nhiêu học sinh khuyết tật?"
Expected Intent: inclusive
Expected Result: Thông tin về học sinh khuyết tật (nếu được phép)
```

---

### **F. VĂN HÓA NGHỆ THUẬT (Arts)**

#### Test 6.1: CLB
```
Input: "Trường có câu lạc bộ văn nghệ không?"
Expected Intent: arts
Expected Result: Thông tin về CLB văn học, nghệ thuật
```

#### Test 6.2: Hoạt động ngoại khóa
```
Input: "Có hoạt động âm nhạc nào không?"
Expected Intent: arts
Expected Result: Thông tin về hoạt động VHNT
```

---

### **G. TỔNG HỢP (Mixed)**

#### Test 7.1: Câu hỏi phức tạp
```
Input: "Em học lớp 7/5, muốn biết thầy chủ nhiệm là ai, học ở phòng nào, và quy định về nghỉ học"
Expected: Kết hợp nhiều intent
Expected Result:
  - GVCN: Nguyễn Thị Như Quỳnh - 0764326400
  - Phòng: 19
  - Quy định nghỉ học: ...
```

#### Test 7.2: Câu hỏi không rõ ràng
```
Input: "Em muốn hỏi về điểm"
Expected Intent: general hoặc policy
Expected Result: Hỏi lại học sinh muốn biết về loại điểm nào
```

---

## 📊 Checklist Kiểm Tra

### **Chức Năng**
- [ ] Phát hiện đúng intent cho 6 loại câu hỏi
- [ ] Trích xuất đúng lớp học (6/1, 7/2, ...)
- [ ] Trích xuất đúng ngày trong tuần
- [ ] Tìm kiếm chính xác trong structured data
- [ ] Fallback đúng sang raw data khi cần
- [ ] Kết hợp kết quả từ nhiều nguồn

### **Hiệu Năng**
- [ ] Thời gian phản hồi < 2 giây
- [ ] Console log hiển thị đúng thông tin
- [ ] Không bị lỗi khi file không tồn tại
- [ ] Xử lý đúng khi query rỗng

### **Độ Chính Xác**
- [ ] Trả về đúng thông tin liên hệ
- [ ] Trả về đúng quy định
- [ ] Trả về đúng lịch trình
- [ ] Trả về đúng phòng học
- [ ] Format context rõ ràng cho AI

### **Xử Lý Lỗi**
- [ ] Xử lý khi file JSONL bị lỗi format
- [ ] Xử lý khi không tìm thấy kết quả
- [ ] Xử lý khi API smart-retrieval fail
- [ ] Fallback về phương pháp cũ khi cần

---

## 🐛 Debug

### **Kiểm Tra Console Log**
```javascript
// Trong smart-retrieval/route.js
console.log('🔍 Smart Retrieval:', {
  query,
  intent: intent.type,
  details
});

// Trong chat/route.js
console.log('✅ Smart retrieval:', {
  intent: smartResults.intent,
  resultsCount: smartResults.results?.length || 0
});
```

### **Kiểm Tra Dữ Liệu**
```bash
# Kiểm tra file có tồn tại
ls app/public/data/

# Kiểm tra format JSONL
head -n 5 app/public/data/RAG_MASTER_STRUCTURED.jsonl

# Đếm số dòng
wc -l app/public/data/RAG_MASTER_STRUCTURED.jsonl
```

### **Test Riêng API**
```javascript
// Test file: test-smart-retrieval.js
const testQueries = [
  "Số điện thoại GVCN lớp 6/1",
  "Sổ đầu bài chấm điểm thế nào",
  "Thứ 2 BGH ai trực",
  "Lớp 8/5 học phòng mấy"
];

for (const query of testQueries) {
  const response = await fetch('http://localhost:3000/api/smart-retrieval', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const result = await response.json();
  console.log(`Query: ${query}`);
  console.log(`Intent: ${result.intent}`);
  console.log(`Results: ${result.results.length}`);
  console.log('---');
}
```

---

## ✅ Kết Quả Mong Đợi

Sau khi test, hệ thống phải:
1. ✅ Phát hiện đúng **90%+** intent
2. ✅ Trả về kết quả chính xác cho **95%+** câu hỏi có dữ liệu
3. ✅ Thời gian phản hồi **< 2 giây**
4. ✅ Không bị crash khi có lỗi
5. ✅ Tiết kiệm **50-70%** tokens gửi cho Gemini
