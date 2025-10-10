/**
 * API ENDPOINT CHO SMART RETRIEVAL
 * Sử dụng shared library để tránh duplicate code
 */

import { searchSmartRetrieval } from '../chat/smart-retrieval-lib.js';

// ========== API ENDPOINT ==========
export async function POST(request) {
  try {
    const body = await request.json();
    const query = body?.query || "";
    
    if (!query.trim()) {
      return new Response(JSON.stringify({ 
        error: "Query is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Gọi shared library
    const result = await searchSmartRetrieval(query);
    
    if (!result) {
      return new Response(JSON.stringify({ 
        error: "Failed to search" 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({
      ...result,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error('❌ Smart retrieval API error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
