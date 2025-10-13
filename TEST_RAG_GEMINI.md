# Test RAG + Gemini Integration

Hướng dẫn kiểm tra xem hệ thống RAG có kết nối đúng với Gemini API không.

## Yêu cầu

1. **API Key**: Đã có GEMINI_API_KEY trong file `.env.local`
2. **Dependencies**: Đã cài đặt packages (`npm install`)

## Các file test

### 1. `test-rag-quick.js` - Test nhanh ⚡

Test đơn giản, nhanh chóng để kiểm tra cơ bản.

```bash
node test-rag-quick.js
```

**Kiểm tra:**
- ✅ Load RAG database
- ✅ Tìm entry phù hợp
- ✅ Gọi Gemini API
- ✅ Nhận response

**Thời gian:** ~2-3 giây

---

### 2. `test-rag-gemini-integration.js` - Test đầy đủ 🧪

Test toàn diện với nhiều test cases.

```bash
node test-rag-gemini-integration.js
```

**Kiểm tra:**
- ✅ Filter theo audience (parent/student)
- ✅ Smart search với Fuse.js
- ✅ Build context từ RAG
- ✅ Gọi Gemini API
- ✅ Validate response

**Test cases:**
1. Câu hỏi của phụ huynh về game
2. Câu hỏi của học sinh về bạn bè
3. Câu hỏi về học tập
4. Câu hỏi về gia đình

**Thời gian:** ~10-15 giây

---

## Kết quả mong đợi

### ✅ Test thành công

```
🧪 QUICK RAG + GEMINI TEST

✓ Loaded 140 entries from RAG database
✓ API Key: Found

📝 Test question: "Con tôi chơi game nhiều, tôi phải làm sao?"
✓ Found 40 parent entries
✓ Found relevant entry: "Tôi cấm con chơi game thì con lại nói dối để chơi, tôi nên xử lý thế nào?"

🤖 Calling Gemini API...
✓ Response received in 1234ms

────────────────────────────────────────────────────────────
📤 RESPONSE:
────────────────────────────────────────────────────────────
[Câu trả lời từ Gemini dựa trên RAG context]
────────────────────────────────────────────────────────────

✅ TEST PASSED! RAG + Gemini is working correctly.
```

### ❌ Test thất bại

**Lỗi 1: Thiếu API Key**
```
❌ Please add GEMINI_API_KEY to .env.local file
```
→ **Giải pháp**: Thêm API key vào `.env.local`

**Lỗi 2: API Key không hợp lệ**
```
❌ TEST FAILED
Error: API key not valid
```
→ **Giải pháp**: Kiểm tra lại API key tại https://aistudio.google.com/app/apikey

**Lỗi 3: Không tìm thấy RAG data**
```
❌ No relevant entry found
```
→ **Giải pháp**: Kiểm tra file `app/public/data/rag_all.json` có tồn tại không

---

## Chi tiết test đầy đủ

### Test 1: Câu hỏi của phụ huynh
```
📝 Test 1: Câu hỏi của phụ huynh
Câu hỏi: "Con tôi chơi game nhiều quá, tôi phải làm sao?"
User type: parent

[Step 1] Filtering RAG by audience...
✓ Filtered: 108 entries (from 140 total)
  - Entries with audience="parent": 40

[Step 2] Smart searching relevant entries...
✓ Found 3 relevant entries
  1. [parent/parenting] TuVan_TamLy_40cau - Row 3
     Tags: gia_đình, công_nghệ
  2. [parent/parenting] TuVan_TamLy_40cau - Row 2
     Tags: học_tập, gia_đình, công_nghệ
  3. [parent/parenting] TuVan_TamLy_40cau - Row 4
     Tags: gia_đình

[Step 3] Building context from RAG...
✓ Context built (523 characters)

[Step 4] Calling Gemini API...
✓ Response received in 1456ms

📤 GEMINI RESPONSE:
────────────────────────────────────────────────────────────
[Response từ Gemini dựa trên context]
────────────────────────────────────────────────────────────

[Validation]
✓ Response length: 234 characters
✓ Response time: 1456ms
✓ Context used: 3 entries
✓ Audience filter: parent
```

### Summary
```
📊 TEST SUMMARY
════════════════════════════════════════════════════════════
Total tests: 4
✓ Passed: 4
✗ Failed: 0

🎉 ALL TESTS PASSED! RAG + Gemini integration is working correctly.

📈 Performance Stats:
Average response time: 1523ms
Average entries used: 3.0

════════════════════════════════════════════════════════════
```

---

## Troubleshooting

### 1. Module not found error

```bash
npm install
```

### 2. API Key issues

Kiểm tra file `.env.local`:
```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. RAG data not loading

Kiểm tra đường dẫn:
```bash
ls app/public/data/rag_all.json
```

### 4. Slow response

- Gemini API có thể mất 1-3 giây
- Nếu > 5 giây, kiểm tra kết nối internet

---

## Giải thích cách hoạt động

### Flow của test

```
1. Load RAG Database (140 entries)
   ↓
2. Filter theo audience (parent/student)
   → Giảm xuống ~40-108 entries
   ↓
3. Smart Search với Fuse.js
   → Tìm 3-5 entries liên quan nhất
   ↓
4. Build Context từ entries
   → Tạo prompt với Q&A mẫu
   ↓
5. Call Gemini API
   → Gửi prompt + context
   ↓
6. Receive & Validate Response
   → Kiểm tra độ dài, thời gian, relevance
```

### Lợi ích của việc filter

**Không filter:**
- 140 entries → ~15,000 tokens
- Chi phí cao, response chậm

**Có filter:**
- 40-50 entries → ~5,000 tokens
- Tiết kiệm 60-70% chi phí
- Response nhanh hơn 2-3x

---

## Kết luận

Sau khi chạy test thành công, bạn có thể chắc chắn rằng:

✅ RAG database được load đúng  
✅ Filter theo audience hoạt động  
✅ Smart search tìm được entries phù hợp  
✅ Gemini API kết nối thành công  
✅ Response có chất lượng tốt  

Hệ thống sẵn sàng để sử dụng trong production! 🚀
