# 🧪 Test Data Mới

## ✅ Đã Hoàn Thành

1. ✅ Trích xuất 4 file Word/Excel → txt
2. ✅ Tạo `rag_documents.json` (47 entries)
3. ✅ Merge vào `rag_all.json` (140 → 187 entries)
4. ✅ Cập nhật RAG search hỗ trợ `category: 'document'`

---

## 📊 Thống Kê

### Data Mới

```
📁 Tổng: 47 entries

📄 Theo nguồn:
- HUONG DAN CHAM THI DUA... : 28 entries
- Lich truc BGH: 2 entries
- Thong tin HSG 9: 4 entries
- Câu hỏi tình huống GV: 13 entries
```

### RAG Database

```
Trước: 140 entries
Sau:   187 entries (+47)

📂 Theo category:
- unknown: 140 (FAQ cũ)
- document: 47 (Data mới)
```

---

## 🧪 Test Cases

### 1. Lịch Trực Ban Giám Hiệu

**Câu hỏi:**
```
Lịch trực ban giám hiệu là gì?
```

**Kỳ vọng:**
- ✅ RAG tìm thấy data từ "Lich truc BGH.docx"
- ✅ Trả lời thông tin lịch trực
- ✅ Source: Lich truc BGH truong THCS Nguyen Hue.docx

**Test:**
```bash
curl http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "text": "Lịch trực ban giám hiệu là gì?"}
    ],
    "userRole": "teacher"
  }'
```

---

### 2. Thông Tin Học Sinh Giỏi

**Câu hỏi:**
```
Thông tin học sinh giỏi lớp 9 năm học 05-06
```

**Kỳ vọng:**
- ✅ RAG tìm thấy data từ "Thong tin HSG 9.docx"
- ✅ Trả lời thông tin HSG
- ✅ Source: Thong tin HSG 9 (05-06).docx

**Test:**
```bash
curl http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "text": "Thông tin học sinh giỏi lớp 9"}
    ],
    "userRole": "student"
  }'
```

---

### 3. Hướng Dẫn Chấm Thi Đua

**Câu hỏi:**
```
Hướng dẫn chấm thi đua của lớp
```

**Kỳ vọng:**
- ✅ RAG tìm thấy data từ "HUONG DAN CHAM THI DUA.docx"
- ✅ Trả lời hướng dẫn chấm điểm
- ✅ Source: HUONG DAN CHAM THI DUA...

**Test:**
```bash
curl http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "text": "Hướng dẫn chấm thi đua của lớp"}
    ],
    "userRole": "teacher"
  }'
```

---

### 4. Câu Hỏi Tình Huống Giáo Viên

**Câu hỏi:**
```
Câu hỏi tình huống cho giáo viên
```

**Kỳ vọng:**
- ✅ RAG tìm thấy data từ "Câu hỏi tình huống GV.xlsx"
- ✅ Trả lời các tình huống
- ✅ Source: Câu hỏi tình huống GV.xlsx

**Test:**
```bash
curl http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "text": "Câu hỏi tình huống cho giáo viên"}
    ],
    "userRole": "teacher"
  }'
```

---

## 🔍 Debug RAG Matching

### Kiểm Tra Console

Khi test, xem console log:

```javascript
// Trong app/api/chat/route.js
console.log('📊 RAG Stats:');
console.log('  Total entries:', ragData.length);
console.log('  Documents:', documents.length);
console.log('  FAQs:', faqs.length);
console.log('  Fuse data:', fuseData.length);
console.log('  Top matches:', fuseResults.slice(0, 3));
```

**Phải thấy:**
```
📊 RAG Stats:
  Total entries: 187
  Documents: 47
  FAQs: 140
  Fuse data: 187
  Top matches: [...]
```

---

## 🎯 Test Trong Browser

### 1. Mở Chat

```
http://localhost:3000
```

### 2. Chọn Vai Trò

- Giáo viên (để test câu hỏi GV, lịch trực)
- Học sinh (để test HSG, thi đua)

### 3. Hỏi

```
User: "Lịch trực ban giám hiệu là gì?"
AI: [Phải trả lời từ data mới]
```

### 4. Kiểm Tra Console

```
F12 → Console
→ Xem RAG matching logs
```

---

## ✅ Checklist

- [x] Chạy extract_data.py
- [x] Chạy merge_rag.js
- [x] Cập nhật RAG search
- [ ] Restart server
- [ ] Test 4 câu hỏi
- [ ] Verify RAG matching
- [ ] Check console logs

---

## 🚀 Restart Server

```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```

---

## 📝 Kết Quả Mong Đợi

### Trước (Chỉ FAQ cũ)

```
User: "Lịch trực ban giám hiệu"
AI: "Xin lỗi, tôi không có thông tin về lịch trực..."
```

### Sau (Có data mới)

```
User: "Lịch trực ban giám hiệu"
AI: "Lịch trực ban giám hiệu trường THCS Nguyễn Huệ:
     - Thứ 2: [Tên]
     - Thứ 3: [Tên]
     ..."
```

---

## 🔧 Nếu Không Hoạt Động

### 1. Kiểm Tra File

```bash
# Xem rag_all.json có 187 entries không
cat app/public/data/rag_all.json | grep -c '"id"'
```

### 2. Kiểm Tra Format

```javascript
// Mở rag_all.json
// Tìm entry có category: 'document'
{
  "id": "doc_1_0",
  "question": "",
  "answer": "...",
  "category": "document",
  "keywords": ["Lich truc BGH..."],
  "source": "Lich truc BGH truong THCS Nguyen Hue.docx"
}
```

### 3. Kiểm Tra RAG Search

```javascript
// Thêm log trong searchRAG()
console.log('Documents found:', documents.length);
console.log('Sample document:', documents[0]);
```

---

**Restart server và test ngay! 🚀**

```bash
npm run dev
```
