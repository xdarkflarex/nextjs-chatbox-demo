/**
 * =====================================================
 * GEMINI API KEY ROTATOR
 * =====================================================
 * Tự động rotate giữa nhiều API keys để:
 * - Tránh rate limit (15 req/phút/key)
 * - Tự động failover khi 1 key lỗi
 * - Tăng capacity lên gấp đôi với 2 keys
 * =====================================================
 */

// Danh sách API keys từ .env.local
const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
].filter(Boolean); // Lọc bỏ undefined

// Index hiện tại
let currentIndex = 0;

// Tracking lỗi cho mỗi key
const keyErrors = new Map();
const keyLastUsed = new Map();

/**
 * Lấy API key tiếp theo (round-robin)
 */
export function getNextApiKey() {
  if (API_KEYS.length === 0) {
    throw new Error('❌ No Gemini API keys configured in .env.local');
  }

  // Nếu chỉ có 1 key, dùng luôn
  if (API_KEYS.length === 1) {
    console.log('ℹ️ Using single API key');
    return API_KEYS[0];
  }

  // Rotate sang key tiếp theo
  const key = API_KEYS[currentIndex];
  const keyNumber = currentIndex + 1;
  currentIndex = (currentIndex + 1) % API_KEYS.length;

  // Log để debug
  console.log(`🔄 Rotating to API key ${keyNumber}/${API_KEYS.length}`);
  
  // Track thời gian sử dụng
  keyLastUsed.set(key, Date.now());

  return key;
}

/**
 * Đánh dấu key bị lỗi và thử key khác
 */
export function markKeyError(apiKey, error) {
  const count = (keyErrors.get(apiKey) || 0) + 1;
  keyErrors.set(apiKey, count);
  
  console.warn(`⚠️ API key error (count: ${count}):`, error.message);
  
  // Nếu key bị lỗi quá 3 lần liên tiếp, skip sang key khác
  if (count >= 3) {
    console.error(`❌ API key failed ${count} times, trying next key...`);
    return getNextApiKey();
  }
  
  return null;
}

/**
 * Reset error tracking (gọi khi request thành công)
 */
export function resetKeyErrors(apiKey) {
  if (keyErrors.has(apiKey)) {
    keyErrors.delete(apiKey);
    console.log('✅ API key error count reset');
  }
}

/**
 * Lấy thống kê
 */
export function getStats() {
  return {
    totalKeys: API_KEYS.length,
    currentIndex,
    errors: Object.fromEntries(keyErrors),
    lastUsed: Object.fromEntries(keyLastUsed)
  };
}

/**
 * Log stats (để debug)
 */
export function logStats() {
  const stats = getStats();
  console.log('📊 Gemini API Key Stats:', JSON.stringify(stats, null, 2));
}
