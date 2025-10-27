# 🔄 Hướng Dẫn API Rotation (Gemini + DeepSeek)

## 🎯 Tổng quan:

Hệ thống tự động **rotate giữa 3 API keys** theo thứ tự ưu tiên:

1. ✅ **GEMINI_API_KEY** (Primary - Ưu tiên cao nhất)
2. ✅ **GEMINI_API_KEY_2** (Backup - Dự phòng)
3. ✅ **DEEPSEEK_API_KEY** (Fallback - Dự phòng cuối cùng)

## 📋 Cách hoạt động:

### **1. Round-Robin Rotation:**
```
Request 1 → Gemini Primary
Request 2 → Gemini Backup
Request 3 → DeepSeek
Request 4 → Gemini Primary (lặp lại)
...
```

### **2. Auto Failover:**
```
Gemini Primary lỗi → Tự động chuyển sang Gemini Backup
Gemini Backup lỗi → Tự động chuyển sang DeepSeek
DeepSeek lỗi → Retry với Gemini Primary
```

### **3. Error Tracking:**
- Mỗi key bị lỗi → Đếm số lần lỗi
- Lỗi ≥ 3 lần → Tự động skip sang key khác
- Request thành công → Reset error count

## 🚀 Cách setup:

### **Bước 1: Thêm API keys vào `.env.local`**

```env
# Gemini Primary (Bắt buộc)
GEMINI_API_KEY=AIzaSy...

# Gemini Backup (Tùy chọn)
GEMINI_API_KEY_2=AIzaSy...

# DeepSeek Fallback (Tùy chọn - Cần top-up)
DEEPSEEK_API_KEY=sk-...
```

### **Bước 2: Lấy DeepSeek API Key**

1. Truy cập: https://platform.deepseek.com/
2. Đăng ký/Đăng nhập
3. Vào **API Keys** → **Create API Key**
4. Copy key (dạng `sk-...`)
5. **Top-up credit** (Quan trọng!)
   - Vào **Billing** → **Top-up**
   - Nạp tối thiểu $5-10
   - DeepSeek rất rẻ: ~$0.14/1M tokens (input), ~$0.28/1M tokens (output)

### **Bước 3: Restart server**

```bash
npm run dev
```

## 📊 Kiểm tra logs:

### **Log khi rotate:**
```
🔄 Rotating to Gemini Primary (1/3)
  → Calling Gemini 2.0 Flash (prompt: 1234 chars)
✅ Gemini Primary response received successfully
```

### **Log khi failover:**
```
🔄 Attempt 1/3 - Using Gemini Primary
❌ Attempt 1/3 failed: 503 Service Unavailable
⏳ Switching to next API key and retrying in 1000ms...

🔄 Attempt 2/3 - Using Gemini Backup
  → Calling Gemini 2.0 Flash (prompt: 1234 chars)
✅ Gemini Backup response received successfully
```

### **Log khi dùng DeepSeek:**
```
🔄 Rotating to DeepSeek (3/3)
  → Calling DeepSeek API (prompt: 1234 chars)
✅ DeepSeek response received successfully
```

## 💰 Chi phí so sánh:

| Provider | Input (1M tokens) | Output (1M tokens) | Free Tier |
|----------|-------------------|-------------------|-----------|
| **Gemini 2.0 Flash** | FREE | FREE | 1500 req/day |
| **DeepSeek** | $0.14 | $0.28 | Không |

**Khuyến nghị:**
- Dùng Gemini làm primary (miễn phí)
- DeepSeek chỉ dùng khi Gemini hết quota hoặc lỗi
- Top-up $5-10 cho DeepSeek là đủ dùng lâu

## 🔧 Tùy chỉnh:

### **Chỉ dùng Gemini (không dùng DeepSeek):**
```env
# Chỉ cần comment hoặc xóa dòng này
# DEEPSEEK_API_KEY=sk-...
```

### **Chỉ dùng 1 Gemini key:**
```env
GEMINI_API_KEY=AIzaSy...
# GEMINI_API_KEY_2=  (comment hoặc xóa)
# DEEPSEEK_API_KEY=  (comment hoặc xóa)
```

### **Thay đổi thứ tự ưu tiên:**
Sửa file `lib/gemini-rotator.js`:
```javascript
const API_CONFIGS = [
  // Đổi thứ tự ở đây
  { key: process.env.DEEPSEEK_API_KEY, provider: 'deepseek', name: 'DeepSeek' },
  { key: process.env.GEMINI_API_KEY, provider: 'gemini', name: 'Gemini Primary' },
  ...
];
```

## 📈 Monitoring:

### **Xem stats:**
```javascript
import { getStats, logStats } from '../lib/gemini-rotator.js';

// Trong code
const stats = getStats();
console.log(stats);
// {
//   totalKeys: 3,
//   providers: ['Gemini Primary', 'Gemini Backup', 'DeepSeek'],
//   currentIndex: 0,
//   errors: {},
//   lastUsed: { ... }
// }

// Hoặc log trực tiếp
logStats();
```

## ⚠️ Lưu ý:

### **1. DeepSeek cần top-up:**
- Không có free tier
- Phải nạp tiền trước khi dùng
- Nếu không nạp → API trả lỗi 402 (Payment Required)

### **2. Rate limits:**
- **Gemini Free:** 15 req/phút, 1500 req/ngày
- **DeepSeek:** Tùy plan (thường 60-100 req/phút)

### **3. Latency:**
- **Gemini:** ~1-2s
- **DeepSeek:** ~2-3s (server ở Trung Quốc)

### **4. Chất lượng:**
- **Gemini 2.0 Flash:** Rất tốt cho tiếng Việt
- **DeepSeek:** Tốt, nhưng đôi khi kém hơn Gemini một chút

## 🎯 Best Practices:

1. ✅ **Luôn có ít nhất 2 Gemini keys** (primary + backup)
2. ✅ **DeepSeek chỉ dùng làm fallback** (khi Gemini lỗi)
3. ✅ **Monitor logs** để biết key nào đang được dùng
4. ✅ **Top-up DeepSeek $5-10** là đủ dùng lâu
5. ✅ **Rotate keys định kỳ** để tránh bị ban

## 🐛 Troubleshooting:

### **Lỗi: "No API keys configured"**
→ Kiểm tra `.env.local` có ít nhất 1 key

### **Lỗi: "DeepSeek API error: Insufficient balance"**
→ Top-up credit cho DeepSeek

### **Lỗi: "API key error (count: 3)"**
→ Key bị lỗi 3 lần, hệ thống tự động skip sang key khác

### **Tất cả keys đều lỗi:**
→ Kiểm tra:
1. Keys có đúng không?
2. Gemini có hết quota không? (1500 req/ngày)
3. DeepSeek có đủ credit không?
4. Network có vấn đề không?

---

**Chúc bạn sử dụng hiệu quả! 🎉**
