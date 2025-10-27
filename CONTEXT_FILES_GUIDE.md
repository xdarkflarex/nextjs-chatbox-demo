# 📚 Hướng Dẫn Sử Dụng 2 File Context Cho Gemini API

## 🎯 Tổng quan:

Thay vì sử dụng nhiều file rời rạc, giờ chỉ cần **2 FILE JSON** để gửi lên Gemini API:

### **File 1: `context_situations.json`**
- **Mục đích:** Tình huống tư vấn tâm lý học đường
- **Nội dung:** 2,895 tình huống cho học sinh, giáo viên, phụ huynh
- **Nguồn:** `rag_all.json` + `Câu hỏi tình huống GV.txt`

### **File 2: `context_school_info.json`**
- **Mục đích:** Thông tin trường THCS Nguyễn Huệ
- **Nội dung:** BGH, GVCN, phòng học, quy định, thi đua, HSG
- **Nguồn:** Tất cả files trong `public/data/` (JSONL, TXT)

---

## 📋 Chi tiết File 1: `context_situations.json`

### **Cấu trúc:**
```json
{
  "metadata": {
    "file": "context_situations.json",
    "description": "Tình huống tư vấn tâm lý học đường",
    "total_situations": 2895
  },
  "situations": "LOAD_FROM_rag_all.json"
}
```

### **Nội dung (từ rag_all.json):**
- ✅ **Policy/Boundary:** Vai trò AI, giới hạn, quy tắc
- ✅ **Escalation Levels:** GREEN/YELLOW/RED
- ✅ **Tình huống học sinh:** Stress, học tập, bạn bè, gia đình
- ✅ **Tình huống giáo viên:** Quản lý lớp, phụ huynh, đồng nghiệp
- ✅ **Tình huống phụ huynh:** Theo dõi con, giao tiếp với trường

### **Ví dụ tình huống:**
```json
{
  "id": "student-stress-exam-001",
  "question": "Em stress vì sắp thi, không ngủ được",
  "answer": "Hãy thử kỹ thuật thở sâu 4-7-8...",
  "level": "yellow",
  "audience": "student",
  "tags": ["stress", "exam", "sleep"]
}
```

---

## 📋 Chi tiết File 2: `context_school_info.json`

### **Cấu trúc:**
```json
{
  "metadata": {...},
  "ban_giam_hieu": {...},
  "danh_sach_gvcn": {...},
  "so_do_phong_hoc": {...},
  "hoc_sinh_gioi": {...},
  "quy_dinh_so_dau_bai": {...},
  "quy_dinh_thi_dua_lop": {...},
  "quy_dinh_sao_do": {...},
  "vi_pham_nghiem_trong": [...],
  "noi_quy_nha_truong": {...}
}
```

### **1. Ban Giám Hiệu:**
```json
"ban_giam_hieu": {
  "hieu_truong": {
    "name": "Võ Thanh Phước",
    "position": "Hiệu trưởng"
  },
  "pho_hieu_truong": [
    {"name": "Hồ Thị Phước"},
    {"name": "Phạm Thị Thùy Loan"}
  ],
  "lich_truc": {
    "thu_2": {"sang": "Phạm Thị Thùy Loan", "chieu": "Hồ Thị Phước"},
    ...
  }
}
```

### **2. Danh sách GVCN (48 lớp):**
```json
"danh_sach_gvcn": {
  "khoi_6": [
    {"class": "6/1", "name": "Lê Thị Lý", "phone": "0906444659"},
    ...
  ],
  "khoi_7": [...],
  "khoi_8": [...],
  "khoi_9": [...]
}
```

### **3. Sơ đồ phòng học:**
```json
"so_do_phong_hoc": {
  "khoi_6": {"6/1-2": "Phòng 2, 24", ...},
  "khoi_7": {"7/1-2": "Phòng 17", ...},
  ...
}
```

### **4. Học sinh giỏi:**
```json
"hoc_sinh_gioi": {
  "thoi_gian_thi": "12/3/2026",
  "dieu_kien": {
    "ren_luyen": "Khá trở lên",
    "diem_mon_thi": "≥ 8.0"
  },
  "lich_boi_duong": [...]
}
```

### **5. Quy định sổ đầu bài:**
```json
"quy_dinh_so_dau_bai": {
  "thang_diem": 10.0,
  "tieu_chi": [
    {"name": "Học tập", "max": 2.5},
    {"name": "Kỷ luật", "max": 2.5},
    {"name": "Vệ sinh", "max": 2.5},
    {"name": "Chuyên cần", "max": 2.5}
  ]
}
```

### **6. Quy định thi đua lớp:**
```json
"quy_dinh_thi_dua_lop": {
  "cong_thuc": "(Sổ đầu bài × 2) + Nề nếp + Điểm sao đỏ + Điểm thưởng",
  "xep_loai": [
    {"loai": "Tốt", "diem": "≥ 32"},
    {"loai": "Khá", "diem": "26 - 31.9"},
    ...
  ]
}
```

### **7. Vi phạm nghiêm trọng:**
```json
"vi_pham_nghiem_trong": [
  {
    "hanh_vi": "Bạo lực học đường",
    "xu_ly_lop": "Trừ 10 điểm/trường hợp",
    "xu_ly_hs": "Hạ 2 bậc hạnh kiểm"
  },
  ...
]
```

### **8. Nội quy nhà trường:**
```json
"noi_quy_nha_truong": {
  "trang_phuc": {...},
  "cam_ky": [...],
  "dien_thoai": "...",
  "atgt": [...],
  "trong_lop": {...}
}
```

---

## 🚀 Cách sử dụng trong API:

### **Bước 1: Load 2 files**
```javascript
import fs from 'fs';

// File 1: Tình huống tư vấn
const situations = JSON.parse(
  fs.readFileSync('app/public/data/rag_all.json', 'utf8')
);

// File 2: Thông tin trường
const schoolInfo = JSON.parse(
  fs.readFileSync('app/public/data/context_school_info.json', 'utf8')
);
```

### **Bước 2: Tạo context cho Gemini**
```javascript
function buildContext(userQuestion, userRole, userClass) {
  let context = '';
  
  // 1. Thêm thông tin trường (nếu cần)
  if (needsSchoolInfo(userQuestion)) {
    context += `=== THÔNG TIN TRƯỜNG ===\n`;
    
    // BGH
    if (userQuestion.includes('hiệu trưởng') || userQuestion.includes('BGH')) {
      context += `Hiệu trưởng: ${schoolInfo.ban_giam_hieu.hieu_truong.name}\n`;
      context += `Phó HT: ${schoolInfo.ban_giam_hieu.pho_hieu_truong.map(p => p.name).join(', ')}\n`;
    }
    
    // GVCN
    if (userQuestion.includes('GVCN') || userQuestion.includes('chủ nhiệm')) {
      const gvcn = findGVCN(userClass, schoolInfo);
      if (gvcn) {
        context += `GVCN lớp ${userClass}: ${gvcn.name} - ${gvcn.phone}\n`;
      }
    }
    
    // Phòng học
    if (userQuestion.includes('phòng học')) {
      const room = findRoom(userClass, schoolInfo);
      context += `Lớp ${userClass} học tại: ${room}\n`;
    }
    
    // Quy định
    if (userQuestion.includes('quy định') || userQuestion.includes('nội quy')) {
      context += JSON.stringify(schoolInfo.noi_quy_nha_truong, null, 2);
    }
    
    // Thi đua
    if (userQuestion.includes('thi đua') || userQuestion.includes('sổ đầu bài')) {
      context += JSON.stringify(schoolInfo.quy_dinh_thi_dua_lop, null, 2);
    }
    
    context += `\n`;
  }
  
  // 2. Thêm tình huống tương tự (từ rag_all.json)
  const similarSituations = findSimilarSituations(userQuestion, situations, userRole);
  if (similarSituations.length > 0) {
    context += `=== TÌNH HUỐNG TƯƠNG TỰ ===\n`;
    similarSituations.forEach(s => {
      context += `Q: ${s.question}\nA: ${s.answer}\n\n`;
    });
  }
  
  return context;
}
```

### **Bước 3: Gửi lên Gemini**
```javascript
const prompt = `${context}

=== CÂU HỎI CỦA ${userRole.toUpperCase()} ===
${userQuestion}

=== HƯỚNG DẪN TRẢ LỜI ===
- Dựa trên thông tin trường và tình huống tương tự ở trên
- Trả lời ngắn gọn, cụ thể, có bước hành động
- Nếu cần liên hệ GVCN, nêu rõ tên và SĐT

Hãy trả lời:`;

const result = await model.generateContent(prompt);
```

---

## 📊 So sánh trước/sau:

### **Trước (nhiều files):**
```
❌ rag_all.json (198KB)
❌ rag_documents.json (46KB)
❌ RAG_MASTER_STRUCTURED.jsonl (32KB)
❌ HUONG DAN CHAM THI DUA.txt (21KB)
❌ Lich truc BGH.txt (856B)
❌ Thong tin HSG.txt (2.3KB)
❌ Câu hỏi tình huống GV.txt (9.5KB)
───────────────────────────────────
Tổng: 7 files, ~310KB
```

### **Sau (2 files):**
```
✅ rag_all.json (198KB) → Tình huống
✅ context_school_info.json (15KB) → Thông tin trường
───────────────────────────────────
Tổng: 2 files, ~213KB
```

**Lợi ích:**
- ✅ Giảm 5 files
- ✅ Giảm ~97KB
- ✅ Dễ quản lý hơn
- ✅ Nhanh hơn (ít file I/O)

---

## 🎯 Các trường hợp sử dụng:

### **Case 1: Hỏi GVCN**
```
User: "Số điện thoại GVCN lớp 6/1"

Context:
=== THÔNG TIN TRƯỜNG ===
GVCN lớp 6/1: Lê Thị Lý - 0906444659

AI: "GVCN lớp 6/1 là cô Lê Thị Lý: 0906444659"
```

### **Case 2: Hỏi BGH trực**
```
User: "Thứ 2 buổi sáng BGH ai trực?"

Context:
=== THÔNG TIN TRƯỜNG ===
Thứ 2 sáng: Phạm Thị Thùy Loan (Phó HT)

AI: "Thứ 2 buổi sáng, cô Phạm Thị Thùy Loan (Phó HT) trực"
```

### **Case 3: Hỏi quy định**
```
User: "Sổ đầu bài chấm điểm thế nào?"

Context:
=== THÔNG TIN TRƯỜNG ===
Thang điểm: 10.0
Tiêu chí:
- Học tập: 2.5 điểm
- Kỷ luật: 2.5 điểm
- Vệ sinh: 2.5 điểm
- Chuyên cần: 2.5 điểm

AI: "Sổ đầu bài chấm theo 4 tiêu chí, mỗi tiêu chí 2.5 điểm..."
```

### **Case 4: Tư vấn tâm lý + Liên hệ GVCN**
```
User: "Em bị bạn bắt nạt, em học lớp 6/1"

Context:
=== THÔNG TIN TRƯỜNG ===
GVCN lớp 6/1: Lê Thị Lý - 0906444659

=== TÌNH HUỐNG TƯƠNG TỰ ===
Q: Học sinh bị bạn bè cô lập
A: Tìm hiểu nguyên nhân, gặp riêng các em...

AI: "Em đang gặp tình huống khó khăn. 
     Hãy báo ngay cho cô Lê Thị Lý (GVCN lớp 6/1): 0906444659
     Cô sẽ giúp em xử lý tình huống này."
```

---

## ✅ Checklist triển khai:

### **Bước 1: Chuẩn bị files**
- [x] Tạo `context_school_info.json` (đã có)
- [x] Sử dụng `rag_all.json` (đã có)
- [ ] Test load 2 files trong Node.js

### **Bước 2: Cập nhật API**
- [ ] Sửa `app/api/chat/route.js`
- [ ] Load 2 files thay vì nhiều files
- [ ] Implement `buildContext()` function
- [ ] Test với các câu hỏi mẫu

### **Bước 3: Tối ưu**
- [ ] Cache 2 files trong memory
- [ ] Implement smart search trong `rag_all.json`
- [ ] Giới hạn context size (max 4000 tokens)

### **Bước 4: Test**
```bash
# Test GVCN
"Số điện thoại GVCN lớp 6/1"
→ Phải trả về: Lê Thị Lý - 0906444659

# Test BGH
"Hiệu trưởng tên gì?"
→ Phải trả về: Võ Thanh Phước

# Test quy định
"Sổ đầu bài chấm thế nào?"
→ Phải trả về: 4 tiêu chí, mỗi tiêu chí 2.5 điểm

# Test tư vấn
"Em stress vì thi"
→ Phải trả về: Lời khuyên + (nếu cần) liên hệ GVCN
```

---

## 🎉 Kết luận:

**Giờ chỉ cần 2 files:**
1. ✅ `rag_all.json` - Tình huống tư vấn (đã có)
2. ✅ `context_school_info.json` - Thông tin trường (vừa tạo)

**Lợi ích:**
- ✅ Đơn giản hóa code
- ✅ Dễ maintain
- ✅ Nhanh hơn
- ✅ Đầy đủ thông tin

**Next steps:**
1. Cập nhật `app/api/chat/route.js` để dùng 2 files này
2. Test kỹ với các câu hỏi thực tế
3. Deploy và monitor

Hoàn tất! 🚀
