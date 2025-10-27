const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMessages() {
  console.log('🧪 TESTING MESSAGES SENDER\n');
  console.log('='.repeat(60));
  
  // Lấy session mới nhất
  const { data: sessions, error: sessError } = await supabase
    .from('chat_sessions')
    .select('id, session_name, created_at')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (sessError || !sessions || sessions.length === 0) {
    console.log('❌ No sessions found');
    console.log('   Please chat first to create a session');
    return;
  }
  
  const session = sessions[0];
  console.log('\n📋 Latest Session:');
  console.log(`   ID: ${session.id}`);
  console.log(`   Name: ${session.session_name}`);
  console.log(`   Created: ${new Date(session.created_at).toLocaleString('vi-VN')}`);
  
  // Lấy messages
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true });
  
  if (msgError || !messages) {
    console.log('\n❌ Error fetching messages:', msgError);
    return;
  }
  
  console.log(`\n📝 Messages (${messages.length} total):`);
  console.log('='.repeat(60));
  
  messages.forEach((m, i) => {
    const senderIcon = m.sender === 'user' ? '👤' : '🤖';
    const senderLabel = m.sender === 'user' ? 'USER' : 'BOT ';
    const preview = m.content.length > 50 ? m.content.substring(0, 50) + '...' : m.content;
    
    console.log(`\n${i + 1}. ${senderIcon} ${senderLabel}: ${preview}`);
    console.log(`   Sender field: "${m.sender}"`);
  });
  
  // Phân tích
  console.log('\n' + '='.repeat(60));
  console.log('📊 ANALYSIS:');
  console.log('='.repeat(60));
  
  const userMessages = messages.filter(m => m.sender === 'user');
  const botMessages = messages.filter(m => m.sender === 'bot');
  const otherMessages = messages.filter(m => m.sender !== 'user' && m.sender !== 'bot');
  
  console.log(`   👤 User messages: ${userMessages.length}`);
  console.log(`   🤖 Bot messages: ${botMessages.length}`);
  if (otherMessages.length > 0) {
    console.log(`   ⚠️  Other senders: ${otherMessages.length}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (userMessages.length === 0) {
    console.log('❌ PROBLEM FOUND!');
    console.log('   No messages with sender="user"');
    console.log('   All messages are marked as "bot"');
    console.log('\n💡 Solution:');
    console.log('   1. Delete old data: DELETE FROM messages; DELETE FROM chat_sessions;');
    console.log('   2. Restart server: npm run dev');
    console.log('   3. Test new chat');
  } else if (botMessages.length === 0) {
    console.log('❌ PROBLEM FOUND!');
    console.log('   No messages with sender="bot"');
    console.log('   All messages are marked as "user"');
  } else {
    console.log('✅ LOOKS GOOD!');
    console.log('   Found both user and bot messages');
    console.log('\n📋 Sample user message:');
    console.log(`   "${userMessages[0].content.substring(0, 60)}..."`);
    console.log('\n📋 Sample bot message:');
    console.log(`   "${botMessages[0].content.substring(0, 60)}..."`);
  }
  
  console.log('\n' + '='.repeat(60));
}

testMessages().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
