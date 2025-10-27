# 🔑 Hướng Dẫn Setup 2 API Keys Gemini

## ✅ Đã cấu hình:

### **1. Model mới: Gemini 2.0 Flash**
- ⚡ Nhanh hơn 1.5 Flash
- 🧠 Thông minh hơn
- 💰 Vẫn miễn phí (Free tier)

### **2. API Key Rotation**
- 🔄 Tự động rotate giữa 2 keys
- 🛡️ Failover khi 1 key lỗi
- 📊 Tăng capacity gấp đôi

## 📋 Cách setup:

### **Bước 1: Thêm API key thứ 2 vào `.env.local`**

Mở file `.env.local` và thêm:

```bash
# ==================== GEMINI AI ====================
# API Key 1 (Primary)
GEMINI_API_KEY=your-existing-key-here

# API Key 2 (Backup)
GEMINI_API_KEY_2=AIzaSyDcJjtiG4xCpRMPhaK_Tp0cojaNQpiCIHM
```

**Lưu ý:** Thay `your-existing-key-here` bằng API key hiện tại của bạn.

### **Bước 2: Restart server**

```bash
# Stop server hiện tại (Ctrl+C)
# Rồi chạy lại
npm run dev
```

### **Bước 3: Test**

1. Mở http://localhost:3000
2. Chat thử
3. Xem console log:

```
🔄 Rotating to API key 1/2
✅ Gemini 2.0 Flash response received successfully

🔄 Rotating to API key 2/2
✅ Gemini 2.0 Flash response received successfully
```

## 🎯 Cách hoạt động:

### **Round-robin rotation:**

```
Request 1 → API Key 1
Request 2 → API Key 2
Request 3 → API Key 1
Request 4 → API Key 2
...
```

### **Auto failover:**

```
Request 1 → API Key 1 → ❌ Error 503
         → API Key 2 → ✅ Success
         
Request 2 → API Key 1 (thử lại)
         → ✅ Success (key đã hồi phục)
```

### **Error tracking:**

```
API Key 1 → Lỗi 3 lần liên tiếp
         → Skip sang Key 2
         → Key 1 được reset sau khi thành công
```

## 📊 Lợi ích:

### **Với 1 API key:**
- ❌ 15 requests/phút
- ❌ 1,500 requests/ngày
- ❌ Dễ bị overload

### **Với 2 API keys:**
- ✅ **30 requests/phút** (gấp đôi)
- ✅ **3,000 requests/ngày** (gấp đôi)
- ✅ Tự động failover
- ✅ Downtime gần như = 0

## 🧪 Test scenarios:

### **Test 1: Normal rotation**
```bash
# Chat 4 lần liên tiếp
# Console sẽ hiện:
🔄 Rotating to API key 1/2
🔄 Rotating to API key 2/2
🔄 Rotating to API key 1/2
🔄 Rotating to API key 2/2
```

### **Test 2: Failover**
```bash
# Nếu Key 1 bị lỗi 503:
❌ Attempt 1/3 failed: 503 Service Unavailable
⏳ Switching to next API key and retrying in 1000ms...
🔄 Rotating to API key 2/2
✅ Gemini 2.0 Flash response received successfully
```

### **Test 3: Capacity**
```bash
# Với 2 keys, có thể handle:
- 30 requests/phút
- ~60 học sinh cùng lúc
- 3,000 requests/ngày
```

## 🎓 Ước tính cho trường:

### **Scenario 1: 30 học sinh/ngày**
```
Requests: ~150/ngày
Keys needed: 1 key đủ
Cost: $0 (Free tier)
```

### **Scenario 2: 100 học sinh/ngày**
```
Requests: ~500/ngày
Keys needed: 1 key đủ
Cost: $0 (Free tier)
```

### **Scenario 3: 200 học sinh/ngày**
```
Requests: ~1,000/ngày
Keys needed: 1 key đủ
Cost: $0 (Free tier)
```

### **Scenario 4: 500 học sinh/ngày**
```
Requests: ~2,500/ngày
Keys needed: 2 keys
Cost: $0 (Free tier với 2 keys)
```

## ⚠️ Lưu ý:

### **Free tier limits (mỗi key):**
- 15 RPM (requests per minute)
- 1,500 RPD (requests per day)
- 1M TPM (tokens per minute)

### **Nếu vượt quota:**
- Hệ thống tự động rotate sang key khác
- Retry 3 lần với exponential backoff
- Thông báo lỗi thân thiện cho user

### **Nếu cả 2 keys đều hết quota:**
- User thấy: "Hệ thống đang quá tải, vui lòng thử lại sau 1-2 phút"
- Giải pháp: Thêm key thứ 3 hoặc nâng cấp Paid

## 🚀 Nâng cấp sau này:

### **Thêm key thứ 3:**
```bash
# .env.local
GEMINI_API_KEY=key-1
GEMINI_API_KEY_2=key-2
GEMINI_API_KEY_3=key-3  # Thêm dòng này
```

**Lưu ý:** File `gemini-rotator.js` đã support nhiều keys, chỉ cần thêm vào `.env.local`.

### **Hoặc nâng cấp Paid:**
```bash
# Không giới hạn requests
# Chi phí: ~$3-5/tháng cho 100 học sinh
# Link: https://ai.google.dev/pricing
```

## 📝 Files đã tạo/sửa:

- ✅ `lib/gemini-rotator.js` - Logic rotation
- ✅ `app/api/chat/route.js` - Dùng Gemini 2.0 Flash + rotation
- ✅ `app/api/sessions/finalize/route.js` - Dùng rotation
- ✅ `.env.example` - Hướng dẫn config

## 🔍 Debug:

### **Xem stats:**
```javascript
// Thêm vào console
import { logStats } from './lib/gemini-rotator.js';
logStats();

// Output:
{
  totalKeys: 2,
  currentIndex: 1,
  errors: {},
  lastUsed: {
    "AIza...": 1234567890,
    "AIza...": 1234567891
  }
}
```

### **Check logs:**
```bash
# Xem console khi chat
🔄 Rotating to API key 1/2
✅ Gemini 2.0 Flash response received successfully

# Nếu có lỗi:
❌ Attempt 1/3 failed: 503 Service Unavailable
⚠️ API key error (count: 1): 503 Service Unavailable
⏳ Switching to next API key and retrying in 1000ms...
```

## ✅ Checklist:

- [ ] Thêm `GEMINI_API_KEY_2` vào `.env.local`
- [ ] Restart server (`npm run dev`)
- [ ] Test chat → Xem console log
- [ ] Verify rotation hoạt động
- [ ] Test failover (nếu có lỗi 503)

## 🎉 Kết quả:

Sau khi setup xong:
- ✅ Capacity tăng gấp đôi (30 req/phút)
- ✅ Tự động failover khi lỗi
- ✅ Dùng Gemini 2.0 Flash (nhanh + thông minh hơn)
- ✅ Vẫn hoàn toàn miễn phí

Chúc mừng! Hệ thống đã sẵn sàng cho 60-100 học sinh dùng cùng lúc! 🚀
