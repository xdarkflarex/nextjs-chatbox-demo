# RAG Implementation Documentation

## Tổng quan

Đã triển khai thuật toán RAG (Retrieval-Augmented Generation) nâng cao cho chatbot tâm lý học đường THCS, kết hợp dữ liệu từ file `rag_all.json` với 46 câu hỏi thường gặp từ Excel.

## Cấu trúc dữ liệu RAG

### Các loại dữ liệu trong rag_all.json:

1. **Policy entries** (4 items)
   - POLICY/BOUNDARY: Vai trò, giới hạn của chatbot
   - ESCALATION_LEVELS: Định nghĩa mức độ GREEN/YELLOW/RED
   - EMERGENCY_CONTACTS: Thông tin liên hệ khẩn cấp
   - LABELLING: Hướng dẫn phân loại

2. **FAQ entries** (4 items)
   - Thông tin về nghỉ học, hoạt động, học bổng, kỷ luật

3. **Scenario entries** (6 items)
   - Phân loại theo level: green, yellow, red
   - Phân loại theo intent: study, sleep, bullying, conflict, general

4. **Excel rows** (46 Q&A pairs)
   - Câu hỏi thường gặp từ học sinh THCS
   - Câu trả lời mẫu chi tiết
   - Metadata: STT, Người dùng mục tiêu

5. **Template entries** (3 items)
   - Kế hoạch ôn 7 ngày
   - Timebox 30 phút
   - Hướng dẫn giải quyết xung đột

6. **Script entries** (3 items)
   - Mở đầu cuộc trò chuyện
   - Kết thúc và tóm tắt
   - Template báo cáo bắt nạt

## Thuật toán RAG

### 1. Phát hiện mức độ khẩn cấp (Escalation Detection)

```javascript
function detectEscalationLevel(text)
```

**RED (Khẩn cấp):**
- Từ khóa: tự hại, tự tử, muốn chết, bạo lực, đánh đập, lạm dụng, bị đe dọa
- Hành động: Chuyển tuyến ngay, liên hệ GVCN/Tổng đài 111

**YELLOW (Cần theo dõi):**
- Từ khóa: căng thẳng, áp lực, stress, bị bắt nạt, bị tẩy chay, mâu thuẫn
- Hành động: Gợi ý giải pháp + khuyến nghị gặp GVCN/CVTL

**GREEN (Tự trợ giúp):**
- Các tình huống học tập, kỹ năng thông thường
- Hành động: Cung cấp hướng dẫn cụ thể và động viên

### 2. Tìm kiếm ngữ nghĩa (Semantic Search)

```javascript
function searchRAG(userQuery, ragData)
```

**Bước 1: Chuẩn hóa input**
- Chuyển về chữ thường
- Loại bỏ ký tự đặc biệt
- Chuẩn hóa khoảng trắng

**Bước 2: Trích xuất Q&A từ Excel rows**
- Parse câu hỏi thường gặp
- Parse câu trả lời mẫu
- Tạo normalized text cho tìm kiếm

**Bước 3: Fuzzy matching với Fuse.js**
- Weight: Question (0.7), Full text (0.3)
- Threshold: 0.4 (độ tương đồng tối thiểu)
- Trả về top 3 matches với score

**Bước 4: Lọc templates và scenarios phù hợp**
- Templates: Dựa trên từ khóa (kế hoạch, ôn, tập trung, xung đột)
- Scenarios: Dựa trên escalation level

### 3. Xây dựng Context cho AI

```javascript
function buildAIContext(searchResults, userQuery)
```

**Context bao gồm:**

1. **Quy định và nguyên tắc** (Policies)
   - Vai trò chatbot
   - Giới hạn và ranh giới
   - Quy trình xử lý

2. **Mức độ tình huống** (Escalation Level)
   - Cảnh báo nếu RED
   - Lưu ý nếu YELLOW
   - Hướng dẫn nếu GREEN

3. **Tình huống tương tự** (Top Matches)
   - Top 3 câu hỏi gần giống nhất
   - Câu trả lời mẫu tương ứng
   - Điểm số độ khớp

4. **Mẫu hướng dẫn** (Templates)
   - Kế hoạch học tập
   - Kỹ thuật tập trung
   - Giải quyết xung đột

### 4. Prompt Engineering cho Gemini

**Cấu trúc prompt:**
```
=== QUY ĐỊNH VÀ NGUYÊN TẮC ===
[Policies]

=== MỨC ĐỘ TÌNH HUỐNG: [LEVEL] ===
[Cảnh báo/Lưu ý phù hợp]

=== CÁC TÌNH HUỐNG TƯƠNG TỰ ===
[Top matches với Q&A]

=== MẪU HƯỚNG DẪN ===
[Templates nếu có]

=== CÂU HỎI CỦA HỌC SINH ===
[User query]

=== HƯỚNG DẪN TRẢ LỜI ===
- Vai trò: Trợ lý AI hỗ trợ học sinh THCS
- Giọng điệu: Thân thiện, tôn trọng, gọi "em"
- Dựa trên tình huống tương tự
- Xử lý theo level (RED/YELLOW/GREEN)
- Ngắn gọn 3-5 câu
- Có bước hành động rõ ràng
```

## API Response

**Response format:**
```json
{
  "reply": "Câu trả lời từ AI",
  "metadata": {
    "level": "green|yellow|red",
    "matchCount": 3,
    "topMatch": "Câu hỏi khớp nhất"
  }
}
```

## Ưu điểm của thuật toán

1. **Multi-field matching**: Tìm kiếm trên nhiều trường (question, full text)
2. **Weighted search**: Ưu tiên câu hỏi hơn nội dung đầy đủ
3. **Fuzzy matching**: Chấp nhận lỗi chính tả, từ đồng nghĩa
4. **Context-aware**: Hiểu ngữ cảnh qua escalation level
5. **Safety-first**: Phát hiện tình huống khẩn cấp tự động
6. **Template integration**: Cung cấp hướng dẫn cụ thể khi phù hợp
7. **Structured prompting**: Context rõ ràng cho AI

## Test Cases

✓ GREEN - Học tập cơ bản: "Em cảm thấy lo lắng trước kỳ thi"
✓ GREEN - Phương pháp học: "Em học hoài nhưng không nhớ"
✓ YELLOW - Bị bắt nạt: "Em bị bạn bè trêu chọc và tẩy chay"
✓ YELLOW - Áp lực gia đình: "Bố mẹ em cãi nhau nhiều"
✓ RED - Khẩn cấp: "Em cảm thấy không muốn sống nữa"
✓ Kế hoạch học tập: "Em muốn lập kế hoạch ôn thi 7 ngày"

## Files Modified

- `app/api/chat/route.js`: Triển khai thuật toán RAG đầy đủ
- `test-rag.js`: Test suite để kiểm tra RAG algorithm

## Cách sử dụng

1. Server tự động load `app/public/data/rag_all.json`
2. Mỗi request được phân tích qua RAG pipeline
3. AI nhận context phong phú để trả lời chính xác
4. Response bao gồm metadata để tracking

## Tối ưu hóa trong tương lai

1. **Semantic embeddings**: Sử dụng vector embeddings thay vì fuzzy matching
2. **Conversation history**: Tích hợp lịch sử hội thoại vào context
3. **Dynamic templates**: Tạo templates động dựa trên tình huống
4. **Analytics**: Theo dõi các câu hỏi không match để cải thiện
5. **Multi-turn dialogue**: Xử lý hội thoại nhiều lượt phức tạp
