import fs from "fs";
import path from "path";
import Fuse from "fuse.js";

/**
 * LIBRARY CHO SMART RETRIEVAL
 * Tách riêng logic để gọi trực tiếp, tránh fetch internal
 */

// ========== PHÂN LOẠI INTENT ==========
function detectIntent(query) {
  const normalizedQuery = query.toLowerCase().trim();
  
  const contactPatterns = [
    /s(ố|o)\s*(đ|d)i(ệ|e)n\s*tho(ạ|a)i/i,
    /li(ê|e)n\s*(h|l)(ệ|e)/i,
    /(gvcn|gi(á|a)o\s*vi(ê|e)n\s*ch(ủ|u)\s*nhi(ệ|e)m)/i,
    /(th(ầ|a)y|c(ô|o))\s*ch(ủ|u)\s*nhi(ệ|e)m/i,
    /ban\s*gi(á|a)m\s*hi(ệ|e)u/i,
    /l(ớ|o)p\s*\d+\/\d+/i
  ];
  
  const policyPatterns = [
    /n(ộ|o)i\s*quy/i,
    /quy\s*(đ|d)(ị|i)nh/i,
    /ch(ấ|a)m\s*(đ|d)i(ể|e)m/i,
    /s(ổ|o)\s*(đ|d)(ầ|au)\s*b(à|a)i/i,
    /sao\s*(đ|d)(ỏ|o)/i,
    /thi\s*(đ|d)ua/i,
    /k(ỷ|y)\s*lu(ậ|a)t/i,
    /vi\s*ph(ạ|a)m/i,
    /tr(ừ|u)\s*(đ|d)i(ể|e)m/i,
    /ngh(ỉ|i)\s*h(ọ|o)c/i,
    /(đ|d)i\s*tr(ễ|e)/i,
    /trang\s*ph(ụ|u)c/i,
    /(đ|d)(ồ|o)ng\s*ph(ụ|u)c/i
  ];
  
  const schedulePatterns = [
    /l(ị|i)ch/i,
    /th(ờ|o)i\s*gian/i,
    /khi\s*n(à|a)o/i,
    /ng(à|a)y\s*n(à|a)o/i,
    /bu(ổ|o)i/i,
    /gi(ờ|o)/i,
    /tr(ự|u)c/i
  ];
  
  const roomPatterns = [
    /ph(ò|o)ng\s*h(ọ|o)c/i,
    /l(ớ|o)p\s*h(ọ|o)c\s*(ở|o)\s*(đ|d)(â|au)/i,
    /s(ơ|o)\s*(đ|d)(ồ|o)/i,
    /khu\s*[A-D]/i,
    /v(ị|i)\s*tr(í|i)/i
  ];
  
  const inclusivePatterns = [
    /khuye(ế|t)\s*t(ậ|a)t/i,
    /h(ò|o)a\s*nh(ậ|a)p/i,
    /gi(á|a)o\s*d(ụ|u)c\s*h(ò|o)a\s*nh(ậ|a)p/i
  ];
  
  const artsPatterns = [
    /v(ă|a)n\s*h(ó|o)a/i,
    /ngh(ệ|e)\s*thu(ậ|a)t/i,
    /c(â|au)\s*l(ạ|a)c\s*b(ộ|o)/i,
    /clb/i,
    /ngo(ạ|a)i\s*kh(ó|o)a/i,
    /(â|au)m\s*nh(ạ|a)c/i,
    /m(ỹ|y)\s*thu(ậ|a)t/i
  ];
  
  if (contactPatterns.some(p => p.test(normalizedQuery))) {
    return { type: 'contact', priority: 1 };
  }
  if (policyPatterns.some(p => p.test(normalizedQuery))) {
    return { type: 'policy', priority: 1 };
  }
  if (schedulePatterns.some(p => p.test(normalizedQuery))) {
    return { type: 'schedule', priority: 1 };
  }
  if (roomPatterns.some(p => p.test(normalizedQuery))) {
    return { type: 'rooms', priority: 1 };
  }
  if (inclusivePatterns.some(p => p.test(normalizedQuery))) {
    return { type: 'inclusive', priority: 1 };
  }
  if (artsPatterns.some(p => p.test(normalizedQuery))) {
    return { type: 'arts', priority: 1 };
  }
  
  return { type: 'general', priority: 2 };
}

// ========== TRÍCH XUẤT CHI TIẾT ==========
function extractDetails(query) {
  const details = {};
  
  const classMatch = query.match(/(\d+)\/(\d+)/);
  if (classMatch) {
    details.class = classMatch[0];
    details.grade = classMatch[1];
  }
  
  const dayMatch = query.match(/th(ứ|u)\s*(\d+|hai|ba|t(ư|u)|n(ă|a)m|s(á|a)u|b(ả|a)y)/i);
  if (dayMatch) {
    const dayMap = {
      'hai': '2', 'ba': '3', 'tư': '4', 'tu': '4',
      'năm': '5', 'nam': '5', 'sáu': '6', 'sau': '6',
      'bảy': '7', 'bay': '7'
    };
    const dayNum = dayMatch[2];
    details.weekday = 'Thứ ' + (dayMap[dayNum.toLowerCase()] || dayNum);
  }
  
  return details;
}

// ========== TÌM KIẾM STRUCTURED ==========
function searchStructured(intent, details, structuredData) {
  const results = [];
  
  for (const item of structuredData) {
    let score = 0;
    
    if (intent.type === 'contact' && item.tags?.includes('contact')) {
      score = 100;
      if (details.class && item.contact?.class === details.class) {
        score = 200;
      }
      results.push({ item, score, reason: 'contact_match' });
    }
    else if (intent.type === 'policy' && item.tags?.includes('policy')) {
      score = 100;
      if (item.tags.includes('sodb_scoring')) score += 50;
      if (item.tags.includes('saodo_rules')) score += 50;
      if (item.tags.includes('class_competition')) score += 50;
      if (item.tags.includes('school_rules')) score += 30;
      results.push({ item, score, reason: 'policy_match' });
    }
    else if (intent.type === 'schedule' && item.tags?.includes('schedule')) {
      score = 100;
      if (details.weekday && item.duty?.weekly?.[details.weekday]) {
        score = 200;
      }
      results.push({ item, score, reason: 'schedule_match' });
    }
    else if (intent.type === 'rooms' && item.tags?.includes('rooms')) {
      score = 100;
      if (details.class && item.rooms) {
        for (const [room, classes] of Object.entries(item.rooms)) {
          if (classes.includes(details.class)) {
            score = 200;
            item._foundRoom = room;
            break;
          }
        }
      }
      results.push({ item, score, reason: 'room_match' });
    }
    else if (intent.type === 'inclusive' && item.tags?.includes('inclusive_education')) {
      score = 100;
      results.push({ item, score, reason: 'inclusive_match' });
    }
    else if (intent.type === 'arts' && item.tags?.includes('arts')) {
      score = 100;
      results.push({ item, score, reason: 'arts_match' });
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}

// ========== TÌM KIẾM RAW ==========
function searchRaw(query, rawData) {
  const fuseData = rawData.map(item => ({
    ...item,
    searchText: `${item.title || ''} ${item.text || ''} ${item.tags?.join(' ') || ''}`
  }));
  
  const fuse = new Fuse(fuseData, {
    keys: [
      { name: 'searchText', weight: 0.7 },
      { name: 'title', weight: 0.2 },
      { name: 'tags', weight: 0.1 }
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 3
  });
  
  const results = fuse.search(query);
  return results.slice(0, 5);
}

// ========== HÀM CHÍNH - EXPORT ==========
export async function searchSmartRetrieval(query) {
  if (!query || !query.trim()) {
    return null;
  }
  
  try {
    const dataPath = path.join(process.cwd(), "app/public/data");
    
    let structuredData = [];
    let rawData = [];
    
    // Đọc file JSONL
    try {
      const structuredContent = fs.readFileSync(
        path.join(dataPath, "RAG_MASTER_STRUCTURED.jsonl"), 
        "utf8"
      );
      structuredData = structuredContent
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
      
      const rawContent = fs.readFileSync(
        path.join(dataPath, "RAG_MASTER_RAW.jsonl"), 
        "utf8"
      );
      rawData = rawContent
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
        
    } catch (error) {
      console.error('❌ Error loading smart retrieval data:', error.message);
      return null;
    }
    
    // Phân loại intent
    const intent = detectIntent(query);
    const details = extractDetails(query);
    
    // Tìm kiếm
    const structuredResults = searchStructured(intent, details, structuredData);
    const rawResults = structuredResults.length < 3 
      ? searchRaw(query, rawData) 
      : [];
    
    // Kết hợp
    const combinedResults = [
      ...structuredResults.map(r => ({
        source: 'structured',
        data: r.item,
        score: r.score,
        reason: r.reason
      })),
      ...rawResults.map(r => ({
        source: 'raw',
        data: r.item,
        score: (1 - r.score) * 100,
        reason: 'fuzzy_match'
      }))
    ];
    
    return {
      intent: intent.type,
      details,
      results: combinedResults.slice(0, 5),
      total: combinedResults.length
    };
    
  } catch (error) {
    console.error('❌ Smart retrieval error:', error.message);
    return null;
  }
}
