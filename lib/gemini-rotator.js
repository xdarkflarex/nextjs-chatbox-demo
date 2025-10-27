/**
 * =====================================================
 * AI API KEY ROTATOR (GEMINI + DEEPSEEK)
 * =====================================================
 * Tự động rotate giữa nhiều API keys theo thứ tự ưu tiên:
 * 1. GEMINI_API_KEY (Primary)
 * 2. GEMINI_API_KEY_2 (Backup)
 * 3. DEEPSEEK_API_KEY (Fallback)
 * 
 * Lợi ích:
 * - Tránh rate limit
 * - Tự động failover khi 1 key lỗi
 * - Tăng capacity với nhiều keys
 * =====================================================
 */

// Danh sách API keys từ .env.local (theo thứ tự ưu tiên)
const API_CONFIGS = [
  {
    key: process.env.GEMINI_API_KEY,
    provider: 'gemini',
    name: 'Gemini Primary'
  },
  {
    key: process.env.GEMINI_API_KEY_2,
    provider: 'gemini',
    name: 'Gemini Backup'
  },
  {
    key: process.env.DEEPSEEK_API_KEY,
    provider: 'deepseek',
    name: 'DeepSeek'
  }
].filter(config => config.key); // Lọc bỏ undefined

// Index hiện tại
let currentIndex = 0;

// Tracking lỗi cho mỗi key
const keyErrors = new Map();
const keyLastUsed = new Map();

/**
 * Lấy API config tiếp theo (theo thứ tự ưu tiên)
 */
export function getNextApiKey() {
  if (API_CONFIGS.length === 0) {
    throw new Error('❌ No API keys configured in .env.local');
  }

  // Nếu chỉ có 1 key, dùng luôn
  if (API_CONFIGS.length === 1) {
    const config = API_CONFIGS[0];
    console.log(`ℹ️ Using single API key: ${config.name}`);
    keyLastUsed.set(config.key, Date.now());
    return config;
  }

  // Rotate sang key tiếp theo
  const config = API_CONFIGS[currentIndex];
  const keyNumber = currentIndex + 1;
  currentIndex = (currentIndex + 1) % API_CONFIGS.length;

  // Log để debug
  console.log(`🔄 Rotating to ${config.name} (${keyNumber}/${API_CONFIGS.length})`);
  
  // Track thời gian sử dụng
  keyLastUsed.set(config.key, Date.now());

  return config;
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
    totalKeys: API_CONFIGS.length,
    providers: API_CONFIGS.map(c => c.name),
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
  console.log('📊 AI API Key Stats:', JSON.stringify(stats, null, 2));
}
