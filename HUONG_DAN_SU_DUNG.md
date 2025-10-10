# 🎓 HƯỚNG DẪN SỬ DỤNG - Hệ Thống Chatbot Trường Học

## 📋 MỤC LỤC
1. [Tổng Quan](#tổng-quan)
2. [Cài Đặt & Chạy](#cài-đặt--chạy)
3. [Cấu Trúc Dữ Liệu](#cấu-trúc-dữ-liệu)
4. [Thêm Dữ Liệu Mới](#thêm-dữ-liệu-mới)
5. [Tính Năng Chính](#tính-năng-chính)
6. [Xử Lý Sự Cố](#xử-lý-sự-cố)

---

## 🎯 TỔNG QUAN

### Hệ Thống Gồm 2 Phần:

#### **1. Chatbot AI (Gemini 2.0 Flash)**
- Trả lời câu hỏi tâm lý, học tập, kỹ năng sống
- Phát hiện tình huống khẩn cấp
- Hỗ trợ 3 vai trò: Học sinh, Giáo viên, Phụ huynh

#### **2. Hệ Thống Truy Xuất Thông Minh (Smart Retrieval)**
- Tìm kiếm thông tin trường học nhanh chóng
- Không cần AI lọc → Tiết kiệm chi phí
- Hỗ trợ: Liên hệ, Quy định, Lịch trình, Phòng học, Hòa nhập, Văn nghệ

---

## 🚀 CÀI ĐẶT & CHẠY

### **Bước 1: Cài đặt dependencies**
```bash
npm install
```

### **Bước 2: Cấu hình API Key**
Tạo file `.env.local`:
```
GEMINI_API_KEY=your-api-key-here
```

### **Bước 3: Chạy server**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### **Bước 4: Truy cập**
- **Chatbot**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

---

## 📂 CẤU TRÚC DỮ LIỆU

### **1. Dữ Liệu Tâm Lý & FAQ**
**File**: `app/public/data/rag_all.json`

Chứa:
- Câu hỏi thường gặp về tâm lý, học tập
- Quy định chung
- Templates hướng dẫn

### **2. Dữ Liệu Trường Học (Structured)**
**File**: `app/public/data/RAG_MASTER_STRUCTURED.jsonl`

Format: Mỗi dòng là 1 JSON object

**Ví dụ - Thông tin liên hệ:**
```json
{
  "id": "thcs-nguyen-hue-dn:contact:gvcn:6/1",
  "school_id": "thcs-nguyen-hue-dn",
  "source": "DANH SÁCH GIÁO VIÊN CHỦ NHIỆM CÓ SĐT-2526 (1).pdf",
  "title": "Danh sách GVCN & SĐT 2025-2026",
  "tags": ["contact", "directory", "homeroom"],
  "contact": {
    "role": "GVCN",
    "class": "6/1",
    "name": "Lê Thị Lý",
    "phone": "0906444659"
  }
}
```

**Ví dụ - Quy định chấm điểm:**
```json
{
  "id": "thcs-nguyen-hue-dn:sodb:scoring:v1",
  "tags": ["policy", "normalized", "sodb_scoring"],
  "title": "Hướng dẫn chấm điểm Sổ đầu bài",
  "sodb_scoring": {
    "total_per_period": 10.0,
    "criteria": [
      {"name": "Học tập", "max": 2.5, "deduction_per_violation": 0.1},
      {"name": "Kỷ luật", "max": 2.5, "deduction_per_violation": 0.1},
      {"name": "Vệ sinh", "max": 2.5, "deduction_per_violation": 0.1},
      {"name": "Chuyên cần", "max": 2.5, "deduction_per_violation": 0.1}
    ]
  }
}
```

### **3. Dữ Liệu Raw (Fallback)**
**File**: `app/public/data/RAG_MASTER_RAW.jsonl`

Chứa text nguyên bản từ PDF/DOC, dùng khi không tìm thấy trong structured data.

---

## ➕ THÊM DỮ LIỆU MỚI

### **Cách 1: Thêm Thông Tin Liên Hệ**

**Thêm vào**: `RAG_MASTER_STRUCTURED.jsonl`

```json
{
  "id": "thcs-nguyen-hue-dn:contact:gvcn:6/13",
  "school_id": "thcs-nguyen-hue-dn",
  "source": "danh-sach-gvcn.pdf",
  "title": "Danh sách GVCN & SĐT 2025-2026",
  "tags": ["contact", "directory", "homeroom"],
  "contact": {
    "role": "GVCN",
    "class": "6/13",
    "name": "Nguyễn Văn A",
    "phone": "0123456789"
  }
}
```

### **Cách 2: Thêm Quy Định Mới**

**Thêm vào**: `RAG_MASTER_STRUCTURED.jsonl`

```json
{
  "id": "thcs-nguyen-hue-dn:policy:new_rule:v1",
  "school_id": "thcs-nguyen-hue-dn",
  "source": "quy-dinh-moi.pdf",
  "title": "Quy định về ...",
  "tags": ["policy", "rules"],
  "policy": {
    "description": "Mô tả quy định",
    "rules": [
      "Quy tắc 1",
      "Quy tắc 2"
    ]
  }
}
```

### **Cách 3: Thêm Lịch Trình**

```json
{
  "id": "thcs-nguyen-hue-dn:schedule:exam:2025_2026",
  "tags": ["schedule", "exam"],
  "title": "Lịch thi giữa kỳ 2025-2026",
  "schedule": {
    "exam_name": "Kiểm tra giữa kỳ I",
    "dates": {
      "start": "2025-10-15",
      "end": "2025-10-20"
    },
    "subjects": [
      {"subject": "Toán", "date": "2025-10-15", "time": "07:30-09:00"},
      {"subject": "Văn", "date": "2025-10-16", "time": "07:30-09:30"}
    ]
  }
}
```

### **Cách 4: Thêm Dữ Liệu Raw (Văn bản dài)**

**Thêm vào**: `RAG_MASTER_RAW.jsonl`

```json
{
  "id": "thcs-nguyen-hue-dn:document:new_doc:0",
  "school_id": "thcs-nguyen-hue-dn",
  "source": "tai-lieu-moi.pdf",
  "title": "Tài liệu ...",
  "page": 1,
  "chunk_index": 0,
  "text": "Nội dung văn bản đầy đủ...",
  "tags": ["policy", "rules"]
}
```

---

## 🎯 TÍNH NĂNG CHÍNH

### **1. Chatbot Đa Vai Trò**

#### **Học Sinh**
- Hỏi về học tập, tâm lý, kỹ năng sống
- Tìm số điện thoại GVCN
- Tra cứu quy định, lịch trình

**Ví dụ:**
```
"Em đang stress trước kỳ thi, phải làm sao?"
"Số điện thoại thầy chủ nhiệm lớp 7/3 là gì?"
"Sổ đầu bài chấm điểm như thế nào?"
```

#### **Giáo Viên**
- Hỏi về phương pháp giảng dạy
- Tra cứu quy định nhà trường
- Xử lý tình huống học sinh

**Ví dụ:**
```
"Cách xử lý học sinh vi phạm kỷ luật?"
"Quy trình báo cáo kết quả học tập?"
```

#### **Phụ Huynh**
- Theo dõi con học tập
- Liên hệ nhà trường
- Hỏi về quy định

**Ví dụ:**
```
"Con em bị bạn bắt nạt, phải làm sao?"
"Lịch họp phụ huynh khi nào?"
```

### **2. Phát Hiện Khẩn Cấp**

Hệ thống tự động phát hiện 3 mức độ:

#### **🔴 RED - Khẩn Cấp**
Từ khóa: tự hại, tự tử, bạo lực, lạm dụng, nguy hiểm
→ Yêu cầu liên hệ ngay GVCN/Tổng đài 111

#### **🟡 YELLOW - Cần Theo Dõi**
Từ khóa: căng thẳng, áp lực, bị bắt nạt, mâu thuẫn
→ Gợi ý gặp GVCN/Chuyên viên tâm lý

#### **🟢 GREEN - Bình Thường**
→ Hướng dẫn tự trợ giúp

### **3. Tìm Kiếm Thông Minh**

Hệ thống tự động nhận diện loại câu hỏi:

| Loại | Từ Khóa | Ví Dụ |
|------|---------|-------|
| **Liên hệ** | số điện thoại, GVCN, liên hệ | "SĐT GVCN lớp 6/1" |
| **Quy định** | nội quy, quy định, chấm điểm | "Quy định về trang phục" |
| **Lịch trình** | lịch, thời gian, khi nào | "Thứ 2 BGH ai trực" |
| **Phòng học** | phòng học, sơ đồ, ở đâu | "Lớp 8/5 học phòng nào" |
| **Hòa nhập** | khuyết tật, hòa nhập | "Chính sách HS khuyết tật" |
| **Văn nghệ** | CLB, ngoại khóa, âm nhạc | "Có CLB văn nghệ không" |

### **4. Trang Admin**

**Truy cập**: http://localhost:3000/admin

**Chức năng:**
- Xem tất cả phiên chat
- Lọc theo vai trò (học sinh/giáo viên/phụ huynh)
- Lọc phiên khẩn cấp
- Xem chi tiết hội thoại
- Xuất dữ liệu

---

## 🔧 XỬ LÝ SỰ CỐ

### **Vấn Đề 1: Chatbot không trả lời**

**Kiểm tra:**
```bash
# 1. API key có đúng không
cat .env.local

# 2. Server có chạy không
npm run dev

# 3. Xem console log
# Mở Developer Tools (F12) → Console
```

**Giải pháp:**
- Kiểm tra API key Gemini
- Restart server
- Xem lỗi trong console

### **Vấn Đề 2: Không tìm thấy thông tin**

**Kiểm tra:**
```bash
# 1. File dữ liệu có tồn tại không
ls app/public/data/

# 2. Format JSONL có đúng không
head -n 5 app/public/data/RAG_MASTER_STRUCTURED.jsonl
```

**Giải pháp:**
- Kiểm tra file có trong `app/public/data/`
- Kiểm tra format JSON (mỗi dòng phải là JSON hợp lệ)
- Kiểm tra tags có đúng không

### **Vấn Đề 3: Smart Retrieval không hoạt động**

**Kiểm tra console:**
```
✅ Smart retrieval: { intent: 'contact', resultsCount: 1 }
```

Nếu thấy:
```
⚠️ Smart retrieval failed, fallback to old method
```

**Giải pháp:**
- Kiểm tra API `/api/smart-retrieval` có hoạt động không
- Test trực tiếp:
```bash
curl -X POST http://localhost:3000/api/smart-retrieval \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

### **Vấn Đề 4: Phiên chat không lưu**

**Kiểm tra:**
```javascript
// Mở Console (F12)
localStorage.getItem('chatSessions')
```

**Giải pháp:**
- Xóa localStorage và thử lại:
```javascript
localStorage.clear()
```
- Kiểm tra browser có block localStorage không

### **Vấn Đề 5: Chi phí API cao**

**Kiểm tra:**
- Xem số lượng request trong console
- Kiểm tra có dùng smart retrieval không

**Giải pháp:**
- Đảm bảo smart retrieval hoạt động (tiết kiệm 50-70% token)
- Giới hạn độ dài context
- Sử dụng caching nếu cần

---

## 📊 GIÁM SÁT & BẢO TRÌ

### **Hàng Ngày**
- [ ] Kiểm tra trang Admin xem có phiên khẩn cấp không
- [ ] Xem console log có lỗi không
- [ ] Kiểm tra số lượng phiên chat

### **Hàng Tuần**
- [ ] Backup dữ liệu localStorage
- [ ] Cập nhật dữ liệu mới (nếu có)
- [ ] Kiểm tra chi phí API

### **Hàng Tháng**
- [ ] Đánh giá chất lượng trả lời
- [ ] Cập nhật FAQ dựa trên câu hỏi thường gặp
- [ ] Tối ưu hóa dữ liệu

---

## 📞 HỖ TRỢ

### **Tài Liệu Tham Khảo**
- `SMART_RETRIEVAL_README.md` - Hướng dẫn chi tiết Smart Retrieval
- `TEST_SMART_RETRIEVAL.md` - Test cases đầy đủ
- `SUMMARY_SMART_RETRIEVAL.md` - Tóm tắt hệ thống
- `AUTO_SAVE_README.md` - Hướng dẫn tự động lưu

### **Debug**
```bash
# Xem log server
npm run dev

# Test API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'

# Test Smart Retrieval
curl -X POST http://localhost:3000/api/smart-retrieval \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

---

## ✅ CHECKLIST TRIỂN KHAI

### **Trước Khi Đưa Vào Sử Dụng**
- [ ] Đã cài đặt dependencies (`npm install`)
- [ ] Đã cấu hình API key trong `.env.local`
- [ ] Đã test chatbot với 3 vai trò
- [ ] Đã test smart retrieval với 6 loại câu hỏi
- [ ] Đã kiểm tra trang Admin
- [ ] Đã test tính năng tự động lưu
- [ ] Đã test phát hiện khẩn cấp
- [ ] Đã chuẩn bị dữ liệu đầy đủ

### **Sau Khi Triển Khai**
- [ ] Hướng dẫn học sinh/giáo viên/phụ huynh sử dụng
- [ ] Giao nhiệm vụ kiểm tra Admin hàng ngày
- [ ] Thiết lập quy trình xử lý phiên khẩn cấp
- [ ] Giám sát chi phí API
- [ ] Thu thập feedback để cải thiện

---

**Chúc bạn triển khai thành công! 🎉**
