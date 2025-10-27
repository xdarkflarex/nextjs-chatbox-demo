# 📚 Hướng Dẫn Trích Xuất Data Từ Word/Excel

## 🎯 Mục Đích

Trích xuất nội dung từ 4 file trong `data update/` để bổ sung vào RAG system:
1. `Câu hỏi tình huống GV.xlsx` - Câu hỏi giáo viên
2. `HUONG DAN CHAM THI DUA CUA LOP va SO DO CAC PHONG HOC.docx` - Hướng dẫn thi đua
3. `Lich truc BGH truong THCS Nguyen Hue.docx` - Lịch trực ban giám hiệu
4. `Thong tin HSG 9 (05-06).docx` - Thông tin học sinh giỏi

---

## 🔧 Cách 1: Dùng Script Python (Tự Động)

### Bước 1: Cài Thư Viện

```bash
pip install python-docx openpyxl
```

### Bước 2: Chạy Script

```bash
python extract_data.py
```

### Kết Quả

Script sẽ tạo:
```
app/public/data/
├── Câu hỏi tình huống GV.txt
├── HUONG DAN CHAM THI DUA CUA LOP va SO DO CAC PHONG HOC.txt
├── Lich truc BGH truong THCS Nguyen Hue.txt
├── Thong tin HSG 9 (05-06).txt
├── extracted_data.json (Tổng hợp)
└── rag_documents.json (Format RAG)
```

---

## 📝 Cách 2: Thủ Công (Nếu Không Có Python)

### File 1: Câu hỏi tình huống GV.xlsx

**Cách làm:**
1. Mở file Excel
2. Copy toàn bộ nội dung
3. Paste vào file mới: `app/public/data/cau_hoi_giao_vien.txt`

**Format mong muốn:**
```
Câu hỏi 1: [Nội dung câu hỏi]
Trả lời: [Nội dung trả lời]

Câu hỏi 2: [Nội dung câu hỏi]
Trả lời: [Nội dung trả lời]
```

### File 2-4: Các file Word

**Cách làm:**
1. Mở file Word
2. Ctrl+A (chọn tất cả)
3. Ctrl+C (copy)
4. Tạo file .txt mới
5. Ctrl+V (paste)
6. Lưu vào `app/public/data/`

---

## 🔄 Cách 3: Chuyển Đổi Thủ Công Sang JSON

### Template JSON

Tạo file `app/public/data/new_data.json`:

```json
[
  {
    "id": "gv_001",
    "question": "Câu hỏi tình huống giáo viên 1",
    "answer": "Trả lời chi tiết...",
    "category": "teacher",
    "keywords": ["giáo viên", "tình huống"],
    "source": "Câu hỏi tình huống GV.xlsx"
  },
  {
    "id": "hsg_001",
    "question": "Thông tin học sinh giỏi",
    "answer": "Nội dung về HSG...",
    "category": "academic",
    "keywords": ["học sinh giỏi", "thi đua"],
    "source": "Thong tin HSG 9.docx"
  },
  {
    "id": "schedule_001",
    "question": "Lịch trực ban giám hiệu",
    "answer": "Lịch trực: ...",
    "category": "schedule",
    "keywords": ["lịch trực", "ban giám hiệu"],
    "source": "Lich truc BGH.docx"
  }
]
```

---

## 🔗 Tích Hợp Vào RAG System

### Bước 1: Merge Data

Sau khi có file JSON mới, merge với `rag_all.json`:

```javascript
// merge_rag.js
const fs = require('fs');

// Đọc data cũ
const oldData = JSON.parse(fs.readFileSync('app/public/data/rag_all.json', 'utf8'));

// Đọc data mới
const newData = JSON.parse(fs.readFileSync('app/public/data/rag_documents.json', 'utf8'));

// Merge
const mergedData = [...oldData, ...newData];

// Lưu
fs.writeFileSync(
  'app/public/data/rag_all.json',
  JSON.stringify(mergedData, null, 2),
  'utf8'
);

console.log(`✅ Đã merge ${newData.length} entries mới`);
console.log(`📊 Tổng: ${mergedData.length} entries`);
```

Chạy:
```bash
node merge_rag.js
```

### Bước 2: Test RAG

```bash
# Test xem data mới có hoạt động không
curl http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "text": "Lịch trực ban giám hiệu là gì?"}
    ]
  }'
```

---

## 📊 Cấu Trúc Data Mong Muốn

### Format RAG Entry

```json
{
  "id": "unique_id",
  "question": "Câu hỏi hoặc tiêu đề",
  "answer": "Nội dung chi tiết",
  "category": "teacher|student|parent|academic|schedule",
  "keywords": ["từ khóa 1", "từ khóa 2"],
  "source": "Tên file gốc",
  "metadata": {
    "date": "2024-10-27",
    "author": "THCS Nguyễn Huệ"
  }
}
```

### Categories

- `teacher` - Dành cho giáo viên
- `student` - Dành cho học sinh
- `parent` - Dành cho phụ huynh
- `academic` - Học tập, thi đua
- `schedule` - Lịch trình, thời gian biểu
- `regulation` - Quy định, nội quy

---

## 🧪 Test Sau Khi Cập Nhật

### 1. Kiểm Tra File

```bash
# Xem số lượng entries
cat app/public/data/rag_all.json | grep -c '"id"'

# Xem file mới
ls -lh app/public/data/
```

### 2. Test API

```javascript
// Test trong browser console
fetch('/api/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    messages: [{
      role: 'user',
      text: 'Lịch trực ban giám hiệu thế nào?'
    }],
    userRole: 'teacher'
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

### 3. Kiểm Tra RAG Matching

```javascript
// Trong app/api/chat/route.js
console.log('RAG matches:', ragMatches.length);
console.log('Top match:', ragMatches[0]);
```

---

## ⚠️ Lưu Ý

### 1. Encoding

- File phải UTF-8
- Nếu có ký tự lỗi, dùng Notepad++ → Encoding → UTF-8

### 2. Format

- JSON phải valid (dùng jsonlint.com để check)
- Không có trailing comma
- Escape ký tự đặc biệt: `"`, `\n`, `\t`

### 3. Size

- Mỗi entry không nên quá 2000 ký tự
- Split thành nhiều entries nếu quá dài

### 4. Keywords

- Thêm nhiều keywords để dễ tìm
- Bao gồm cả tiếng Việt có dấu và không dấu

---

## 🎯 Checklist

- [ ] Cài python-docx và openpyxl
- [ ] Chạy extract_data.py
- [ ] Kiểm tra file .txt đã tạo
- [ ] Review rag_documents.json
- [ ] Merge vào rag_all.json
- [ ] Test API với câu hỏi mới
- [ ] Verify RAG matching hoạt động
- [ ] Backup rag_all.json cũ

---

## 🚀 Sau Khi Hoàn Thành

### Update RAG Stats

```javascript
// Trong app/api/chat/route.js
console.log(`
📊 RAG STATS:
- Total entries: ${ragData.length}
- New entries: ${newEntries.length}
- Categories: ${categories.join(', ')}
`);
```

### Test Cases

```
1. "Lịch trực ban giám hiệu là gì?"
   → Phải trả về thông tin từ file Lich truc BGH

2. "Thông tin học sinh giỏi lớp 9"
   → Phải trả về thông tin từ file HSG 9

3. "Hướng dẫn chấm thi đua"
   → Phải trả về thông tin từ file HUONG DAN

4. "Câu hỏi tình huống cho giáo viên"
   → Phải trả về từ file Excel
```

---

**Chạy script ngay! 🚀**

```bash
pip install python-docx openpyxl
python extract_data.py
```
