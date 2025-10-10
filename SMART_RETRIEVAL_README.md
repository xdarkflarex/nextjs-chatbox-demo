# Hệ Thống Truy Xuất Thông Tin Thông Minh

## 🎯 Mục Đích

Hệ thống này giúp chatbot truy xuất thông tin trường học **NHANH CHÓNG** mà **KHÔNG CẦN** dùng AI Gemini để lọc, tiết kiệm chi phí và thời gian phản hồi.

## 📊 Cấu Trúc Dữ Liệu

### 1. **RAG_MASTER_STRUCTURED.jsonl**
File chứa dữ liệu đã được **cấu trúc hóa** theo các loại:

#### **A. Thông Tin Liên Hệ** (`tags: ["contact", "directory", "homeroom"]`)
```json
{
  "id": "thcs-nguyen-hue-dn:contact:gvcn:6/1",
  "tags": ["contact", "directory", "homeroom"],
  "contact": {
    "role": "GVCN",
    "class": "6/1",
    "name": "Lê Thị Lý",
    "phone": "0906444659"
  }
}
```

#### **B. Quy Định Chấm Điểm** (`tags: ["policy", "normalized", "sodb_scoring"]`)
```json
{
  "id": "thcs-nguyen-hue-dn:sodb:scoring:v1",
  "tags": ["policy", "normalized", "sodb_scoring"],
  "sodb_scoring": {
    "total_per_period": 10.0,
    "criteria": [
      {"name": "Học tập", "max": 2.5, "deduction_per_violation": 0.1},
      {"name": "Kỷ luật", "max": 2.5, "deduction_per_violation": 0.1}
    ]
  }
}
```

#### **C. Quy Định Sao Đỏ** (`tags: ["policy", "normalized", "saodo_rules"]`)
```json
{
  "id": "thcs-nguyen-hue-dn:saodo:rules:v1",
  "tags": ["policy", "normalized", "saodo_rules"],
  "saodo_rules": {
    "submission": "Nộp sổ sao đỏ & sổ đầu bài vào tiết 5 ngày Thứ 6",
    "sections": [
      {"name": "Vệ sinh", "max": 2.0},
      {"name": "Nề nếp, trang phục", "max": 4.0}
    ]
  }
}
```

#### **D. Lịch Trực BGH** (`tags: ["schedule", "management"]`)
```json
{
  "id": "thcs-nguyen-hue-dn:bgh:duty:2025_2026",
  "tags": ["schedule", "management"],
  "duty": {
    "weekly": {
      "Thứ 2": {
        "morning": "Phạm Thị Thùy Loan",
        "afternoon": "Hồ Thị Phước"
      }
    }
  }
}
```

#### **E. Sơ Đồ Phòng Học** (`tags: ["rooms", "map"]`)
```json
{
  "id": "thcs-nguyen-hue-dn:rooms:map:2025_2026",
  "tags": ["rooms", "map"],
  "rooms": {
    "1": ["8/1", "8/2"],
    "24": ["6/1", "6/2"]
  }
}
```

#### **F. Giáo Dục Hòa Nhập** (`tags: ["inclusive_education", "students", "policy"]`)
```json
{
  "id": "thcs-nguyen-hue-dn:inclusive:plan:2025_2026",
  "tags": ["inclusive_education", "students", "policy"],
  "inclusive": {
    "principles": ["Đảm bảo quyền học tập bình đẳng..."],
    "contacts": {"deputy_principal_inclusive": "Hồ Thị Phước"}
  }
}
```

### 2. **RAG_MASTER_RAW.jsonl**
File chứa dữ liệu **nguyên bản** từ PDF/DOC, dùng làm **fallback** khi không tìm thấy trong structured data.

```json
{
  "id": "thcs-nguyen-hue-dn:NỘI QUY NHÀ TRƯỜNG:0",
  "school_id": "thcs-nguyen-hue-dn",
  "source": "NỘI QUY NHÀ TRƯỜNG.pdf",
  "title": "NỘI QUY NHÀ TRƯỜNG",
  "text": "UBND PHƯỜNG HẢICHÂU...",
  "tags": ["policy", "rules", "discipline"]
}
```

## 🔍 Cách Hoạt Động

### **Bước 1: Phát Hiện Intent (Ý Định)**
Hệ thống phân tích câu hỏi và xác định loại thông tin cần tìm:

| Intent | Ví Dụ Câu Hỏi | Patterns |
|--------|----------------|----------|
| **contact** | "Số điện thoại GVCN lớp 6/1", "Liên hệ thầy chủ nhiệm" | `gvcn`, `giáo viên chủ nhiệm`, `số điện thoại`, `liên hệ` |
| **policy** | "Quy định chấm điểm sổ đầu bài", "Nội quy về trang phục" | `nội quy`, `quy định`, `chấm điểm`, `sao đỏ`, `kỷ luật` |
| **schedule** | "Lịch trực BGH thứ 2", "Khi nào họp phụ huynh" | `lịch`, `thời gian`, `khi nào`, `ngày nào`, `trực` |
| **rooms** | "Lớp 6/1 học ở phòng nào", "Sơ đồ phòng học" | `phòng học`, `sơ đồ`, `vị trí`, `khu` |
| **inclusive** | "Chính sách học sinh khuyết tật" | `khuyết tật`, `hòa nhập`, `giáo dục hòa nhập` |
| **arts** | "CLB văn nghệ", "Hoạt động ngoại khóa" | `văn hóa`, `nghệ thuật`, `câu lạc bộ`, `ngoại khóa` |

### **Bước 2: Trích Xuất Chi Tiết**
Hệ thống tự động nhận diện:
- **Lớp học**: `6/1`, `7/2`, `8/3`, `9/4`
- **Ngày trong tuần**: `Thứ 2`, `Thứ 3`, `Thứ Tư`, ...

### **Bước 3: Tìm Kiếm Trong Structured Data**
- Tìm kiếm **chính xác** dựa trên `tags` và `intent`
- Ưu tiên kết quả có **chi tiết khớp** (lớp, ngày)
- Trả về **Top 5** kết quả có điểm cao nhất

### **Bước 4: Fallback - Tìm Trong Raw Data**
Nếu không tìm thấy đủ kết quả, sử dụng **Fuse.js** để tìm kiếm mờ (fuzzy search) trong raw data.

### **Bước 5: Tích Hợp Vào Context AI**
Kết quả được format thành context rõ ràng cho Gemini AI:

```
=== THÔNG TIN TRƯỜNG HỌC (TÌM KIẾM NHANH) ===
Loại câu hỏi: CONTACT

📞 [1] LIÊN HỆ - GVCN
   Lớp: 6/1
   Giáo viên: Lê Thị Lý
   Số điện thoại: 0906444659
```

## 🚀 API Endpoint

### **POST /api/smart-retrieval**

**Request:**
```json
{
  "query": "Số điện thoại GVCN lớp 6/1"
}
```

**Response:**
```json
{
  "intent": "contact",
  "details": {
    "class": "6/1",
    "grade": "6"
  },
  "results": [
    {
      "source": "structured",
      "data": {
        "contact": {
          "role": "GVCN",
          "class": "6/1",
          "name": "Lê Thị Lý",
          "phone": "0906444659"
        }
      },
      "score": 200,
      "reason": "contact_match"
    }
  ],
  "total": 1,
  "timestamp": "2025-10-09T16:25:55.000Z"
}
```

## 📈 Lợi Ích

### **1. Tốc Độ Nhanh Hơn**
- ❌ **Trước**: Tìm kiếm → Gửi tất cả cho AI → AI lọc → Trả lời (2-3 giây)
- ✅ **Sau**: Tìm kiếm thông minh → Trả kết quả chính xác → AI format (0.5-1 giây)

### **2. Tiết Kiệm Chi Phí**
- Giảm **50-70%** số lượng tokens gửi cho Gemini
- Chỉ gửi thông tin **đã lọc** thay vì toàn bộ database

### **3. Độ Chính Xác Cao**
- Tìm kiếm **cấu trúc** thay vì **văn bản tự do**
- Ít bị nhầm lẫn hơn khi có nhiều thông tin tương tự

### **4. Dễ Mở Rộng**
- Thêm loại dữ liệu mới chỉ cần:
  1. Thêm pattern vào `detectIntent()`
  2. Thêm xử lý vào `searchStructured()`
  3. Thêm format vào `buildSmartContext()`

## 🔧 Cách Thêm Dữ Liệu Mới

### **Bước 1: Chuẩn Bị Dữ Liệu**
Tạo file JSON/JSONL với cấu trúc:
```json
{
  "id": "unique-id",
  "school_id": "thcs-nguyen-hue-dn",
  "source": "ten-file.pdf",
  "title": "Tiêu đề",
  "tags": ["loai1", "loai2"],
  "data_field": {
    // Dữ liệu cấu trúc
  }
}
```

### **Bước 2: Thêm Vào File**
- **Structured**: Thêm vào `RAG_MASTER_STRUCTURED.jsonl`
- **Raw**: Thêm vào `RAG_MASTER_RAW.jsonl`

### **Bước 3: Cập Nhật Code**
Nếu là loại dữ liệu mới, thêm:
1. Pattern vào `detectIntent()` trong `smart-retrieval/route.js`
2. Logic tìm kiếm vào `searchStructured()`
3. Format hiển thị vào `buildSmartContext()` trong `chat/route.js`

## 📝 Ví Dụ Sử Dụng

### **Ví Dụ 1: Tìm Số Điện Thoại GVCN**
```
Học sinh: "Cho em xin số điện thoại thầy chủ nhiệm lớp 7/3"

Intent: contact
Details: { class: "7/3", grade: "7" }
Kết quả: Vi Thị Hằng - 0367681696
```

### **Ví Dụ 2: Hỏi Quy Định**
```
Học sinh: "Sổ đầu bài chấm điểm như thế nào?"

Intent: policy
Kết quả: Hướng dẫn chấm điểm sổ đầu bài (10 điểm/tiết)
```

### **Ví Dụ 3: Hỏi Lịch Trình**
```
Phụ huynh: "Thứ 2 tuần này BGH ai trực?"

Intent: schedule
Details: { weekday: "Thứ 2" }
Kết quả: 
- Sáng: Phạm Thị Thùy Loan
- Chiều: Hồ Thị Phước
```

### **Ví Dụ 4: Tìm Phòng Học**
```
Học sinh: "Lớp 8/5 học ở phòng mấy?"

Intent: rooms
Details: { class: "8/5", grade: "8" }
Kết quả: Phòng 3
```

## 🎓 Kết Luận

Hệ thống Smart Retrieval giúp chatbot:
- ✅ Trả lời **nhanh hơn**
- ✅ **Chính xác hơn**
- ✅ **Tiết kiệm chi phí** API
- ✅ **Dễ bảo trì** và mở rộng

Đặc biệt phù hợp cho các câu hỏi về **thông tin cụ thể** của trường (liên hệ, quy định, lịch trình, phòng học).
