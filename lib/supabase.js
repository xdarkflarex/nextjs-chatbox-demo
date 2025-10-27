/**
 * =====================================================
 * SUPABASE CLIENT CONFIGURATION
 * =====================================================
 * Tạo Supabase client cho Next.js app
 * - Client-side: Dùng anon key (an toàn cho browser)
 * - Server-side: Dùng service role key (admin access)
 * =====================================================
 */

import { createClient } from '@supabase/supabase-js';

// Kiểm tra environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
}

if (!supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

/**
 * Client-side Supabase client
 * Sử dụng anon key - an toàn cho browser
 * Có Row Level Security (RLS) protection
 */
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: false, // Không lưu session (vì app này không có auth)
      autoRefreshToken: false,
    },
  }
);

/**
 * Server-side Supabase client (Admin)
 * Sử dụng service role key - bypass RLS
 * CHỈ dùng trong API routes (server-side)
 * KHÔNG expose ra client
 */
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || supabaseAnonKey || '', // Fallback to anon if service key not available
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Helper function: Kiểm tra kết nối Supabase
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err);
    return false;
  }
}

/**
 * Helper: Tạo session ID mới
 */
export function generateSessionId() {
  return crypto.randomUUID();
}

/**
 * Helper: Format timestamp cho database
 */
export function formatTimestamp(date = new Date()) {
  return date.toISOString();
}

/**
 * Helper: Parse emergency level từ keywords
 */
export function detectEmergencyLevel(keywords) {
  if (!keywords || keywords.length === 0) return 'GREEN';
  
  const redKeywords = ['tự tử', 'tự hại', 'chết', 'giết', 'bạo lực'];
  const yellowKeywords = ['stress', 'lo lắng', 'buồn', 'bắt nạt', 'cô đơn'];
  
  const hasRed = keywords.some(kw => 
    redKeywords.some(red => kw.toLowerCase().includes(red))
  );
  
  const hasYellow = keywords.some(kw => 
    yellowKeywords.some(yellow => kw.toLowerCase().includes(yellow))
  );
  
  if (hasRed) return 'RED';
  if (hasYellow) return 'YELLOW';
  return 'GREEN';
}

export default supabase;
