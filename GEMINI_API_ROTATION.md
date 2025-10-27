# 🔄 Giải pháp Rotate API Keys cho Gemini

## ❌ Vấn đề hiện tại:

```
[GoogleGenerativeAI Error]: Error fetching from 
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent: 
[503 Service Unavailable] The model is overloaded. Please try again later.
```

**Nguyên nhân:**
- 1 API key free: **15 requests/phút**, **1,500 requests/ngày**
- Nhiều học sinh dùng cùng lúc → Vượt quota
- Server Gemini quá tải

## ✅ Giải pháp: API Key Rotation

### **Bước 1: Tạo nhiều API keys**

1. Truy cập: https://aistudio.google.com/app/apikey
2. Tạo 3-5 API keys khác nhau
3. Copy tất cả keys

**Ví dụ:**
```
GEMINI_API_KEY_1=AIzaSyAbc123...
GEMINI_API_KEY_2=AIzaSyDef456...
GEMINI_API_KEY_3=AIzaSyGhi789...
```

### **Bước 2: Cập nhật .env.local**

```bash
# ==================== GEMINI AI - MULTIPLE KEYS ====================
GEMINI_API_KEY_1=your-first-api-key
GEMINI_API_KEY_2=your-second-api-key
GEMINI_API_KEY_3=your-third-api-key
GEMINI_API_KEY_4=your-fourth-api-key
GEMINI_API_KEY_5=your-fifth-api-key

# Key hiện tại đang dùng (để backward compatible)
GEMINI_API_KEY=your-first-api-key
```

### **Bước 3: Tạo file API key rotator**

Tạo file: `lib/gemini-rotator.js`

```javascript
/**
 * Gemini API Key Rotator
 * Tự động rotate giữa nhiều API keys để tránh rate limit
 */

// Danh sách API keys
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean); // Lọc bỏ undefined

// Index hiện tại
let currentIndex = 0;

// Tracking lỗi cho mỗi key
const keyErrors = new Map();

/**
 * Lấy API key tiếp theo
 */
export function getNextApiKey() {
  if (API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured');
  }

  // Nếu chỉ có 1 key, dùng luôn
  if (API_KEYS.length === 1) {
    return API_KEYS[0];
  }

  // Rotate sang key tiếp theo
  const key = API_KEYS[currentIndex];
  currentIndex = (currentIndex + 1) % API_KEYS.length;

  console.log(`🔄 Using API key ${currentIndex + 1}/${API_KEYS.length}`);
  
  return key;
}

/**
 * Đánh dấu key bị lỗi
 */
export function markKeyError(apiKey, error) {
  const count = (keyErrors.get(apiKey) || 0) + 1;
  keyErrors.set(apiKey, count);
  
  console.warn(`⚠️ API key error count: ${count}`, error.message);
  
  // Nếu key bị lỗi quá 3 lần, skip sang key khác
  if (count >= 3) {
    console.error(`❌ API key failed ${count} times, rotating...`);
    return getNextApiKey();
  }
  
  return null;
}

/**
 * Reset error tracking
 */
export function resetErrorTracking() {
  keyErrors.clear();
  console.log('✅ Error tracking reset');
}

/**
 * Lấy thống kê
 */
export function getStats() {
  return {
    totalKeys: API_KEYS.length,
    currentIndex,
    errors: Object.fromEntries(keyErrors)
  };
}
```

### **Bước 4: Cập nhật API chat để dùng rotator**

File: `app/api/chat/route.js`

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getNextApiKey, markKeyError } from '../../../lib/gemini-rotator';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    // Thử với nhiều API keys
    let lastError = null;
    const maxRetries = 3;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Lấy API key tiếp theo
        const apiKey = getNextApiKey();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Gọi API
        const result = await model.generateContent(prompt);
        const reply = result.response.text();
        
        // Thành công → Return
        return NextResponse.json({ reply });
        
      } catch (error) {
        lastError = error;
        
        // Nếu là lỗi 503 hoặc 429, thử key khác
        if (error.message.includes('503') || 
            error.message.includes('429') ||
            error.message.includes('overloaded')) {
          console.warn(`⚠️ Retry ${i + 1}/${maxRetries}:`, error.message);
          markKeyError(apiKey, error);
          continue; // Thử key tiếp theo
        }
        
        // Lỗi khác → Throw
        throw error;
      }
    }
    
    // Hết retries → Trả lỗi
    throw lastError || new Error('All API keys failed');
    
  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { error: 'Hệ thống đang quá tải, vui lòng thử lại sau.' },
      { status: 503 }
    );
  }
}
```

## 📊 Lợi ích:

### **Với 1 API key:**
- ❌ 15 requests/phút
- ❌ 1,500 requests/ngày
- ❌ Dễ bị overload

### **Với 5 API keys (rotation):**
- ✅ 75 requests/phút (5 x 15)
- ✅ 7,500 requests/ngày (5 x 1,500)
- ✅ Tự động failover khi 1 key lỗi

## 🎯 Ước tính cho học sinh:

**Giả sử:**
- 1 học sinh chat: 5-10 requests
- 30 học sinh cùng lúc: 150-300 requests

**Với 1 key:**
- ❌ Vượt quota sau 1-2 phút

**Với 5 keys:**
- ✅ Đủ cho 30-50 học sinh cùng lúc

## 🚀 Cách deploy:

### **1. Tạo API keys:**
```bash
# Tạo 5 keys tại: https://aistudio.google.com/app/apikey
```

### **2. Cập nhật .env.local:**
```bash
GEMINI_API_KEY_1=...
GEMINI_API_KEY_2=...
GEMINI_API_KEY_3=...
GEMINI_API_KEY_4=...
GEMINI_API_KEY_5=...
```

### **3. Tạo file rotator:**
```bash
# Tạo lib/gemini-rotator.js với code ở trên
```

### **4. Cập nhật chat API:**
```bash
# Sửa app/api/chat/route.js để dùng rotator
```

### **5. Test:**
```bash
npm run dev
# Chat thử → Xem console log "🔄 Using API key X/5"
```

## ⚠️ Lưu ý:

### **Free tier limits:**
- 15 RPM (requests per minute)
- 1,500 RPD (requests per day)
- 1 million TPM (tokens per minute)

### **Nếu vẫn không đủ:**
- Nâng cấp lên **Gemini API Paid** ($0.075/1K tokens)
- Hoặc giới hạn số học sinh dùng cùng lúc
- Thêm queue system để xếp hàng

## 📝 Alternative: Retry with exponential backoff

Nếu không muốn nhiều keys, có thể dùng retry:

```javascript
async function callGeminiWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      console.log(`⏳ Retry in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## 🎓 Khuyến nghị cho trường học:

### **Option 1: Multiple Free Keys (Ngắn hạn)**
- ✅ Miễn phí
- ✅ Đủ cho 30-50 học sinh
- ❌ Cần quản lý nhiều keys

### **Option 2: Paid API (Dài hạn)**
- ✅ Không giới hạn
- ✅ Ổn định hơn
- ❌ Tốn tiền (~$5-10/tháng cho 100 học sinh)

### **Option 3: Hybrid**
- Free keys cho test
- Paid key cho production
- Rotate giữa cả 2
