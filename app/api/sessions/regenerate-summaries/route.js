/**
 * =====================================================
 * REGENERATE SUMMARIES API
 * =====================================================
 * API để tạo lại summary cho các sessions cũ
 * =====================================================
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

/**
 * Tóm tắt messages của 1 session
 */
async function generateSummaryForSession(messages) {
  try {
    if (!messages || messages.length === 0) {
      return 'Chat mới';
    }
    
    // Lọc chỉ lấy tin nhắn từ user
    const userMessages = messages.filter(m => m.sender === 'user');
    
    if (userMessages.length === 0) {
      return 'Chat mới';
    }
    
    // Lấy tất cả câu hỏi của user (bỏ qua "Tôi là...", số lớp)
    const realQuestions = userMessages.filter(m => {
      const content = m.content || '';
      // Bỏ qua "Tôi là..."
      if (content.startsWith('Tôi là') || content.startsWith('tôi là')) {
        return false;
      }
      // Bỏ qua số lớp
      if (/^\d{1,2}\/\d{1,2}$/.test(content.trim())) {
        return false;
      }
      return true;
    });
    
    if (realQuestions.length === 0) {
      return 'Chat mới';
    }
    
    // Nếu chỉ có 1 câu hỏi, dùng nó luôn
    if (realQuestions.length === 1) {
      const content = realQuestions[0].content || '';
      return content.length > 60 ? content.substring(0, 60) + '...' : content;
    }
    
    // Nếu có nhiều câu hỏi, gọi Gemini tóm tắt
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const questionsText = realQuestions
        .map(m => m.content)
        .join('\n- ');
      
      const prompt = `Tóm tắt ngắn gọn (tối đa 60 ký tự) nội dung chính của các câu hỏi sau:\n\n- ${questionsText}\n\nChỉ trả về câu tóm tắt, không giải thích.`;
      
      const result = await model.generateContent(prompt);
      const summary = result.response.text().trim();
      
      return summary.length > 60 ? summary.substring(0, 60) + '...' : summary;
    } catch (aiError) {
      console.warn('Gemini summarization failed, using first question:', aiError.message);
      // Fallback: Dùng câu hỏi đầu tiên
      const content = realQuestions[0].content || '';
      return content.length > 60 ? content.substring(0, 60) + '...' : content;
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Chat mới';
  }
}

/**
 * POST /api/sessions/regenerate-summaries
 * Tạo lại summary cho tất cả sessions
 */
export async function POST(req) {
  try {
    console.log('🔄 Starting summary regeneration...');
    
    // Lấy tất cả sessions
    const { data: sessions, error: sessError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id, session_name')
      .order('created_at', { ascending: false });
    
    if (sessError) {
      console.error('❌ Error fetching sessions:', sessError);
      return NextResponse.json(
        { ok: false, error: sessError.message },
        { status: 500 }
      );
    }
    
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const session of sessions) {
      // Bỏ qua nếu đã có summary tốt (không phải "Chat mới", "Tôi là...")
      if (
        session.session_name && 
        session.session_name !== 'Chat mới' &&
        !session.session_name.startsWith('Tôi là') &&
        !session.session_name.startsWith('Chat ')
      ) {
        skipped++;
        continue;
      }
      
      try {
        // Lấy messages của session
        const { data: messages, error: msgError } = await supabaseAdmin
          .from('messages')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true });
        
        if (msgError || !messages || messages.length === 0) {
          console.log(`⚠️  Session ${session.id}: No messages`);
          skipped++;
          continue;
        }
        
        // Generate summary
        const newSummary = await generateSummaryForSession(messages);
        
        // Update session
        const { error: updateError } = await supabaseAdmin
          .from('chat_sessions')
          .update({ session_name: newSummary })
          .eq('id', session.id);
        
        if (updateError) {
          console.error(`❌ Failed to update ${session.id}:`, updateError);
          failed++;
        } else {
          console.log(`✅ Updated ${session.id}: "${newSummary}"`);
          updated++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${session.id}:`, error);
        failed++;
      }
    }
    
    console.log(`\n🎉 Summary regeneration complete!`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    
    return NextResponse.json({
      ok: true,
      updated,
      skipped,
      failed,
      total: sessions.length
    });
    
  } catch (error) {
    console.error('❌ Regenerate summaries error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
