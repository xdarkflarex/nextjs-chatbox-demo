# 🚀 Hướng Dẫn Nhanh - Supabase Setup

## ✅ Checklist Setup (5 phút)

### Bước 1: Lấy API Keys từ Supabase

1. Truy cập: https://supabase.com/dashboard
2. Chọn project của bạn (hoặc tạo mới)
3. Vào **Settings** → **API**
4. Copy 2 keys sau:

```
Project URL: https://aolgnzgyewbsrjqlvzrs.supabase.co
anon/public key: eyJhbGc... (key dài)
service_role key: eyJhbGc... (key dài - bí mật)
```

### Bước 2: Cập nhật `.env.local`

Mở file `.env.local` và thay thế:

```env
# Thay ĐỔI 2 dòng này:
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Thành keys bạn vừa copy ở Bước 1
```

### Bước 3: Tạo Database Schema

**Cách 1: Dùng Supabase Dashboard (Khuyến nghị)**

1. Vào Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Copy toàn bộ nội dung file: `supabase/migrations/001_initial_schema.sql`
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)
6. Đợi ~10 giây
7. Xem kết quả: Nếu có dòng "✅ Database schema created successfully!" là thành công!

**Cách 2: Dùng Command Line**

```bash
# Cài pg module (nếu chưa có)
npm install pg

# Chạy migration
node supabase/run-migration.js
```

### Bước 4: Kiểm Tra Database

Chạy query này trong SQL Editor để kiểm tra:

```sql
-- Liệt kê tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Kết quả mong đợi:
-- admin_logs
-- chat_sessions
-- emergency_alerts
-- messages
-- statistics
-- users
```

### Bước 5: Test Kết Nối

Tạo file test: `test-supabase.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log('🧪 Testing Supabase connection...\n');
  
  // Test 1: Count sessions
  const { count, error } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Connected! Total sessions:', count);
  }
  
  // Test 2: Create test session
  const { data, error: insertError } = await supabase
    .from('chat_sessions')
    .insert({
      user_role: 'student',
      user_class: '6/1',
      session_name: 'Test Session'
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('❌ Insert error:', insertError.message);
  } else {
    console.log('✅ Test session created:', data.id);
  }
}

test();
```

Chạy test:

```bash
node test-supabase.js
```

---

## 🎯 Sử Dụng Trong Code

### Client-side (Components)

```javascript
import { supabase } from '../lib/supabase';

// Lấy danh sách sessions
const { data, error } = await supabase
  .from('chat_sessions')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);
```

### Server-side (API Routes)

```javascript
import { supabaseAdmin } from '../lib/supabase';

// Tạo session mới
const { data, error } = await supabaseAdmin
  .from('chat_sessions')
  .insert({
    user_role: 'student',
    user_class: '6/1'
  })
  .select()
  .single();
```

---

## 📊 API Endpoints Mới

### 1. Sessions API

```bash
# Tạo session mới
POST /api/sessions
{
  "userRole": "student",
  "userClass": "6/1",
  "messages": []
}

# Lấy danh sách sessions
GET /api/sessions?role=student&limit=50

# Xóa session
DELETE /api/sessions
{ "id": "session-uuid" }
```

### 2. Admin Stats API

```bash
# Thống kê tổng quan
GET /api/admin/stats?period=today

# Response:
{
  "stats": {
    "totalSessions": 100,
    "totalMessages": 500,
    "activeSessions": 5,
    "unresolvedAlerts": 2,
    "byRole": {
      "student": 80,
      "teacher": 15,
      "parent": 5
    },
    "emergency": {
      "total": 10,
      "red": 2,
      "yellow": 8
    }
  }
}
```

### 3. Emergencies API

```bash
# Lấy cảnh báo khẩn cấp
GET /api/admin/emergencies?resolved=false&level=RED

# Đánh dấu đã xử lý
PATCH /api/admin/emergencies
{
  "alertId": "alert-uuid",
  "resolvedBy": "admin-uuid",
  "notes": "Đã liên hệ phụ huynh"
}

# Export CSV
POST /api/admin/emergencies/export
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### 4. Session Detail API

```bash
# Xem chi tiết session
GET /api/admin/sessions/[session-id]

# Response:
{
  "session": {
    "id": "...",
    "user_role": "student",
    "messages": [...],
    "alerts": [...]
  }
}
```

---

## 🔄 Migration từ Local JSON sang Supabase

### Option 1: Giữ cả 2 (Hybrid)

File hiện tại: `app/api/sessions/route.js` (local JSON)
File mới: `app/api/sessions/route-supabase.js` (Supabase)

Để chuyển sang Supabase:

```bash
# Backup file cũ
mv app/api/sessions/route.js app/api/sessions/route-local.js

# Đổi tên file mới
mv app/api/sessions/route-supabase.js app/api/sessions/route.js

# Restart dev server
npm run dev
```

### Option 2: Import dữ liệu cũ

Nếu bạn có file `chat_sessions.json` cũ:

```javascript
// import-old-data.js
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importData() {
  const oldData = JSON.parse(fs.readFileSync('chat_sessions.json', 'utf8'));
  
  for (const session of oldData) {
    // Insert session
    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_role: session.role || 'student',
        session_name: `Imported ${session.time}`,
        created_at: session.time,
        metadata: { imported: true, original: session }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error:', error);
      continue;
    }
    
    // Insert messages
    if (session.messages) {
      const messages = session.messages.map(msg => ({
        session_id: newSession.id,
        sender: msg.sender,
        content: msg.text,
        created_at: msg.timestamp || new Date().toISOString()
      }));
      
      await supabase.from('messages').insert(messages);
    }
    
    console.log('✅ Imported session:', newSession.id);
  }
  
  console.log('🎉 Import completed!');
}

importData();
```

---

## 🔒 Bảo Mật

### ⚠️ QUAN TRỌNG

1. **KHÔNG** commit `.env.local` lên Git
2. **KHÔNG** share `SUPABASE_SERVICE_ROLE_KEY` công khai
3. **CHỈ** dùng `service_role_key` trong API routes (server-side)
4. **SỬ DỤNG** `anon_key` cho client-side

### Row Level Security (RLS)

Database đã được cấu hình RLS:
- ✅ Admin có full access
- ✅ User chỉ xem session của mình
- ✅ Anonymous có thể tạo session mới

---

## 🐛 Troubleshooting

### Lỗi: "Invalid API key"

```bash
# Kiểm tra .env.local
cat .env.local | grep SUPABASE

# Đảm bảo không có khoảng trắng thừa
# Đảm bảo key đầy đủ (rất dài)
```

### Lỗi: "relation does not exist"

```bash
# Chưa chạy migration
# → Quay lại Bước 3
```

### Lỗi: "permission denied"

```bash
# Đang dùng anon_key thay vì service_role_key
# → Kiểm tra API route có dùng supabaseAdmin không
```

### Lỗi: "Connection timeout"

```bash
# Kiểm tra firewall/network
# Thử ping Supabase
ping db.aolgnzgyewbsrjqlvzrs.supabase.co
```

---

## 📞 Support

Nếu gặp vấn đề:

1. Xem logs: Supabase Dashboard → Logs
2. Xem SQL history: SQL Editor → History
3. Test connection: `node test-supabase.js`
4. Kiểm tra `.env.local`

---

## ✅ Checklist Hoàn Thành

- [ ] Lấy API keys từ Supabase Dashboard
- [ ] Cập nhật `.env.local`
- [ ] Chạy migration (tạo tables)
- [ ] Kiểm tra tables đã tạo
- [ ] Test connection
- [ ] Chuyển API routes sang Supabase
- [ ] Test tạo session mới
- [ ] Test admin dashboard
- [ ] Deploy lên production

---

**Chúc bạn setup thành công! 🎉**

Nếu cần hỗ trợ, hãy kiểm tra file `supabase/SETUP_INSTRUCTIONS.md` để biết thêm chi tiết.
