# 📊 Tóm Tắt Setup Supabase Database

## 🎯 Mục Đích

Tạo database online trên Supabase để:
- ✅ Lưu trữ phiên chat của học sinh
- ✅ Giáo viên quản lý online khi có mạng
- ✅ Phát hiện và cảnh báo tình huống khẩn cấp
- ✅ Thống kê và báo cáo

---

## ✅ Đã Hoàn Thành

### 1. Database Schema (6 bảng + 3 views)

**Bảng chính:**
1. **users** - Quản lý người dùng (admin, giáo viên, học sinh, phụ huynh)
2. **chat_sessions** - Lưu phiên chat
3. **messages** - Lưu tin nhắn
4. **emergency_alerts** - Cảnh báo khẩn cấp (tự động tạo)
5. **admin_logs** - Nhật ký hành động admin
6. **statistics** - Thống kê theo ngày

**Views (truy vấn nhanh):**
1. **v_unresolved_emergencies** - Cảnh báo chưa xử lý
2. **v_daily_stats** - Thống kê theo ngày
3. **v_active_sessions** - Phiên đang hoạt động

### 2. Tính Năng Tự Động

- ✅ **Auto-increment** số lượng tin nhắn
- ✅ **Auto-create** cảnh báo khẩn cấp khi phát hiện
- ✅ **Auto-update** timestamp
- ✅ **Cascade delete** - Xóa session → xóa messages
- ✅ **Row Level Security** - Bảo mật dữ liệu

### 3. API Endpoints Mới

```bash
# Sessions
POST   /api/sessions              # Tạo/cập nhật session
GET    /api/sessions              # Danh sách sessions
DELETE /api/sessions              # Xóa session

# Admin Stats
GET    /api/admin/stats           # Thống kê tổng quan

# Emergencies
GET    /api/admin/emergencies     # Danh sách cảnh báo
PATCH  /api/admin/emergencies     # Đánh dấu đã xử lý
POST   /api/admin/emergencies/export  # Export CSV

# Session Detail
GET    /api/admin/sessions/[id]   # Chi tiết session
```

### 4. Files Đã Tạo

**Database:**
- ✅ `supabase/migrations/001_initial_schema.sql` - Schema đầy đủ
- ✅ `supabase/run-migration.js` - Script chạy migration
- ✅ `supabase/SETUP_INSTRUCTIONS.md` - Hướng dẫn chi tiết

**Code:**
- ✅ `lib/supabase.js` - Supabase client
- ✅ `app/api/sessions/route-supabase.js` - Sessions API
- ✅ `app/api/admin/stats/route.js` - Stats API
- ✅ `app/api/admin/emergencies/route.js` - Emergencies API
- ✅ `app/api/admin/sessions/[id]/route.js` - Session detail

**Config:**
- ✅ `.env.local` - Updated với Supabase config
- ✅ `.env.example` - Template
- ✅ `package.json` - Thêm scripts

**Docs:**
- ✅ `SUPABASE_QUICKSTART.md` - Quick start
- ✅ `SUPABASE_SETUP_COMPLETE.md` - Tổng quan
- ✅ `DATABASE_README.md` - Database docs
- ✅ `QUICK_REFERENCE.md` - Tham khảo nhanh
- ✅ `TOM_TAT_SUPABASE.md` - File này

**Testing:**
- ✅ `test-supabase.js` - Test connection
- ✅ `setup-supabase-keys.js` - Setup helper

---

## 🚀 Cách Sử Dụng (3 Bước)

### Bước 1: Lấy API Keys

1. Truy cập: https://supabase.com/dashboard
2. Chọn project (hoặc tạo mới)
3. Vào **Settings** → **API**
4. Copy 2 keys:
   - **anon/public key** (dài ~200 ký tự)
   - **service_role key** (dài ~200 ký tự)

### Bước 2: Setup Keys

**Cách 1: Dùng script (Dễ nhất)**
```bash
npm run db:setup
```
Nhập URL và 2 keys khi được hỏi.

**Cách 2: Thủ công**
Mở `.env.local` và thay thế:
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=paste-service-key-here
```

### Bước 3: Tạo Database

**Cách 1: Dùng Supabase Dashboard (Khuyến nghị)**
1. Vào Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Copy toàn bộ file: `supabase/migrations/001_initial_schema.sql`
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)
6. Đợi ~10 giây → Thành công!

**Cách 2: Dùng command line**
```bash
npm install pg
npm run db:migrate
```

### Bước 4: Test

```bash
npm run db:test
```

Kết quả mong đợi:
```
✅ Test 1: Connection Test - PASSED
✅ Test 2: Create Session - PASSED
✅ Test 3: Create Message - PASSED
...
🎉 ALL TESTS PASSED!
```

---

## 🎓 Demo Cho Học Sinh

### Kịch Bản

1. **Học sinh mở chatbot** → Chọn vai trò "Học sinh"
2. **Chat với AI** → "Em đang rất stress trước kỳ thi"
3. **Hệ thống phát hiện** → Từ khóa "stress" → Tạo cảnh báo YELLOW
4. **Giáo viên login admin** → Xem dashboard
5. **Thấy cảnh báo** → Click xem chi tiết session
6. **Đọc tin nhắn** → Hiểu tình huống
7. **Liên hệ học sinh** → Hỗ trợ
8. **Đánh dấu đã xử lý** → Update database

### Dữ Liệu Sẽ Lưu

**Trong `chat_sessions`:**
```json
{
  "id": "uuid-123",
  "user_role": "student",
  "user_class": "6/1",
  "emergency_level": "YELLOW",
  "emergency_keywords": ["stress"],
  "is_emergency": true,
  "total_messages": 5,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Trong `messages`:**
```json
[
  {
    "sender": "user",
    "content": "Em đang rất stress trước kỳ thi",
    "emergency_detected": true,
    "emergency_level": "YELLOW"
  },
  {
    "sender": "bot",
    "content": "Em đang cảm thấy áp lực về kỳ thi..."
  }
]
```

**Trong `emergency_alerts`:**
```json
{
  "alert_level": "YELLOW",
  "keywords": ["stress"],
  "student_class": "6/1",
  "is_resolved": false
}
```

---

## 📊 Dashboard Cho Giáo Viên

### Thống Kê Hiển Thị

```
📊 TỔNG QUAN HÔM NAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Tổng phiên chat:        45
💬 Tổng tin nhắn:          230
👥 Đang hoạt động:         3
🚨 Cảnh báo chưa xử lý:    2

THEO VAI TRÒ:
  👨‍🎓 Học sinh:    35 phiên
  👨‍🏫 Giáo viên:   7 phiên
  👨‍👩‍👧 Phụ huynh:   3 phiên

CẢNH BÁO KHẨN CẤP:
  🔴 RED (Nguy hiểm):      1
  🟡 YELLOW (Cần quan tâm): 5
  🟢 GREEN (Bình thường):   39
```

### Danh Sách Cảnh Báo

```
🚨 CẢNH BÁO CHƯA XỬ LÝ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 RED | Lớp 7/2 | 10:30 AM
   Từ khóa: tự hại, không muốn sống
   → [Xem chi tiết] [Đánh dấu đã xử lý]

🟡 YELLOW | Lớp 6/1 | 09:15 AM
   Từ khóa: stress, lo lắng
   → [Xem chi tiết] [Đánh dấu đã xử lý]
```

---

## 🔐 Bảo Mật

### Row Level Security (RLS)

Database đã được cấu hình:
- ✅ **Admin** có full access
- ✅ **User** chỉ xem session của mình
- ✅ **Anonymous** có thể tạo session mới

### API Keys

- **anon key** - Dùng cho client-side (browser)
  - ✅ An toàn để public
  - ✅ Có RLS protection
  
- **service_role key** - Chỉ dùng server-side
  - ⚠️ KHÔNG được public
  - ⚠️ Chỉ dùng trong API routes
  - ⚠️ Bypass RLS

---

## 💰 Chi Phí

### Free Tier (Đủ cho demo)

- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

### Ước Tính Cho Trường

**Giả sử:**
- 800 học sinh
- 50 phiên chat/ngày
- 10 tin nhắn/phiên
- = 500 tin nhắn/ngày
- = 15,000 tin nhắn/tháng

**Dung lượng:**
- 1 tin nhắn ≈ 500 bytes
- 15,000 tin nhắn ≈ 7.5 MB/tháng
- **→ Free tier đủ dùng cả năm!**

---

## 🔄 Migration Từ Local JSON

Nếu bạn đã có dữ liệu cũ trong `chat_sessions.json`:

### Option 1: Giữ Cả 2 (Hybrid)

```bash
# Backup file cũ
mv app/api/sessions/route.js app/api/sessions/route-local.js

# Dùng Supabase
mv app/api/sessions/route-supabase.js app/api/sessions/route.js
```

### Option 2: Import Dữ Liệu Cũ

Tạo script `import-old-data.js`:

```javascript
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
    const { data: newSession } = await supabase
      .from('chat_sessions')
      .insert({
        user_role: session.role || 'student',
        session_name: `Imported ${session.time}`,
        created_at: session.time
      })
      .select()
      .single();
    
    // Insert messages
    if (session.messages) {
      const messages = session.messages.map(msg => ({
        session_id: newSession.id,
        sender: msg.sender,
        content: msg.text
      }));
      
      await supabase.from('messages').insert(messages);
    }
    
    console.log('✅ Imported:', newSession.id);
  }
}

importData();
```

Chạy:
```bash
node import-old-data.js
```

---

## 🛠️ Maintenance

### Backup Database

```bash
# Full backup
pg_dump "postgresql://postgres:minh_123@db.aolgnzgyewbsrjqlvzrs.supabase.co:5432/postgres" > backup.sql

# Restore
psql "postgresql://..." < backup.sql
```

### Xóa Dữ Liệu Cũ (>6 tháng)

```sql
DELETE FROM chat_sessions 
WHERE created_at < CURRENT_DATE - INTERVAL '6 months'
  AND is_emergency = FALSE;
```

### Monitor

Vào Supabase Dashboard:
- **Logs** - Xem errors
- **Database → Performance** - Monitor queries
- **Settings → Usage** - Xem dung lượng

---

## 📞 Hỗ Trợ

### Nếu Gặp Vấn Đề

1. **Kiểm tra `.env.local`**
   ```bash
   cat .env.local | grep SUPABASE
   ```

2. **Test connection**
   ```bash
   npm run db:test
   ```

3. **Xem logs**
   - Supabase Dashboard → Logs

4. **Xem docs**
   - `SUPABASE_QUICKSTART.md`
   - `DATABASE_README.md`

### Common Issues

| Lỗi | Giải pháp |
|-----|-----------|
| "Invalid API key" | Kiểm tra keys trong `.env.local` |
| "relation does not exist" | Chưa chạy migration |
| "permission denied" | Dùng `supabaseAdmin` trong API routes |
| "Connection timeout" | Kiểm tra network/firewall |

---

## ✅ Checklist Hoàn Thành

### Setup
- [ ] Lấy API keys từ Supabase Dashboard
- [ ] Chạy `npm run db:setup` hoặc cập nhật `.env.local`
- [ ] Chạy migration (Dashboard hoặc `npm run db:migrate`)
- [ ] Chạy `npm run db:test` - Tất cả tests PASSED

### Integration
- [ ] Chuyển API routes sang Supabase
- [ ] Test tạo session mới
- [ ] Test xem danh sách sessions
- [ ] Test emergency detection

### Demo
- [ ] Tạo vài sessions test
- [ ] Test emergency alerts
- [ ] Test admin dashboard
- [ ] Import dữ liệu cũ (nếu có)

### Production
- [ ] Backup database
- [ ] Setup monitoring
- [ ] Configure auto-backup
- [ ] Document for team

---

## 🎉 Kết Luận

### Đã Có Gì

✅ **Database hoàn chỉnh** với 6 bảng + 3 views  
✅ **API endpoints** cho sessions, stats, emergencies  
✅ **Tự động hóa** - alerts, counting, timestamps  
✅ **Bảo mật** - RLS, API key separation  
✅ **Documentation** đầy đủ  
✅ **Testing** scripts  

### Lợi Ích

✅ **Online 24/7** - Giáo viên quản lý từ xa  
✅ **Real-time** - Cảnh báo khẩn cấp ngay lập tức  
✅ **Scalable** - Mở rộng dễ dàng  
✅ **Backup tự động** - Không mất dữ liệu  
✅ **Free** - Đủ dùng cho demo và cả năm học  

### Next Steps

1. ✅ Setup API keys
2. ✅ Chạy migration
3. ✅ Test
4. ✅ Demo cho học sinh
5. ✅ Train giáo viên sử dụng dashboard
6. ✅ Deploy production

---

**Chúc bạn demo thành công! 🚀**

*Nếu cần hỗ trợ, xem các file docs hoặc check Supabase Dashboard.*
