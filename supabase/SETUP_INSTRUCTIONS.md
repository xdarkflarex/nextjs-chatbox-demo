# 🚀 Hướng Dẫn Cài Đặt Supabase Database

## 📋 Mục Lục
1. [Tạo Database trên Supabase](#1-tạo-database-trên-supabase)
2. [Chạy Migration](#2-chạy-migration)
3. [Cấu Hình Kết Nối](#3-cấu-hình-kết-nối)
4. [Kiểm Tra Database](#4-kiểm-tra-database)
5. [Sử Dụng](#5-sử-dụng)

---

## 1. Tạo Database trên Supabase

Bạn đã có sẵn database với connection string:
```
postgresql://postgres:minh_123@db.aolgnzgyewbsrjqlvzrs.supabase.co:5432/postgres
```

### Thông tin kết nối:
- **Host**: `db.aolgnzgyewbsrjqlvzrs.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `minh_123`

---

## 2. Chạy Migration

### Cách 1: Sử dụng Supabase Dashboard (Khuyến nghị)

1. Truy cập: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor** (menu bên trái)
4. Tạo query mới
5. Copy toàn bộ nội dung file `migrations/001_initial_schema.sql`
6. Paste vào SQL Editor
7. Click **Run** để thực thi

### Cách 2: Sử dụng psql (Command line)

```bash
# Kết nối vào database
psql "postgresql://postgres:minh_123@db.aolgnzgyewbsrjqlvzrs.supabase.co:5432/postgres"

# Chạy migration file
\i supabase/migrations/001_initial_schema.sql
```

### Cách 3: Sử dụng Node.js script

```bash
# Chạy script setup (sẽ tạo sau)
npm run db:setup
```

---

## 3. Cấu Hình Kết Nối

### Lấy Supabase URL và API Key

1. Vào Supabase Dashboard
2. Chọn project của bạn
3. Vào **Settings** → **API**
4. Copy:
   - **Project URL**: `https://aolgnzgyewbsrjqlvzrs.supabase.co`
   - **anon/public key**: `eyJ...` (API key dài)
   - **service_role key**: `eyJ...` (API key dài - chỉ dùng server-side)

### Cập nhật `.env.local`

Thêm các biến môi trường sau vào file `.env.local`:

```env
# Gemini API Key (đã có)
GEMINI_API_KEY=AIzaSyDGd4LxK9FHf4Mc9k3mUHQ6Auz-jda-B84

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://aolgnzgyewbsrjqlvzrs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Direct Connection (optional - for migrations)
DATABASE_URL=postgresql://postgres:minh_123@db.aolgnzgyewbsrjqlvzrs.supabase.co:5432/postgres
```

---

## 4. Kiểm Tra Database

### Kiểm tra tables đã tạo

Chạy query sau trong SQL Editor:

```sql
-- Liệt kê tất cả tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Kết quả mong đợi:
-- admin_logs
-- chat_sessions
-- emergency_alerts
-- messages
-- statistics
-- users
```

### Kiểm tra views

```sql
-- Liệt kê tất cả views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Kết quả mong đợi:
-- v_active_sessions
-- v_daily_stats
-- v_unresolved_emergencies
```

### Test insert dữ liệu

```sql
-- Tạo một phiên chat test
INSERT INTO chat_sessions (user_role, user_class, session_name)
VALUES ('student', '6/1', 'Test Session')
RETURNING *;

-- Kiểm tra
SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 5;
```

---

## 5. Sử Dụng

### Cấu trúc Database

#### **Table: users**
Lưu thông tin người dùng (admin, giáo viên, học sinh, phụ huynh)

```sql
-- Tạo admin user
INSERT INTO users (username, full_name, role, email)
VALUES ('admin', 'Quản trị viên', 'admin', 'admin@nguyenhue.edu.vn');
```

#### **Table: chat_sessions**
Lưu thông tin phiên chat

Columns quan trọng:
- `id`: UUID của phiên
- `user_role`: 'student', 'teacher', 'parent'
- `user_class`: Lớp của học sinh
- `emergency_level`: 'GREEN', 'YELLOW', 'RED'
- `is_emergency`: Boolean
- `total_messages`: Số tin nhắn

#### **Table: messages**
Lưu từng tin nhắn

Columns quan trọng:
- `session_id`: Link đến chat_sessions
- `sender`: 'user' hoặc 'bot'
- `content`: Nội dung tin nhắn
- `emergency_detected`: Boolean
- `emergency_keywords`: Array từ khóa khẩn cấp

#### **Table: emergency_alerts**
Tự động tạo khi phát hiện khẩn cấp

Columns quan trọng:
- `alert_level`: 'YELLOW' hoặc 'RED'
- `is_resolved`: Boolean
- `resolved_by`: Admin đã xử lý

### Views hữu ích

#### **v_unresolved_emergencies**
Xem các cảnh báo khẩn cấp chưa xử lý

```sql
SELECT * FROM v_unresolved_emergencies;
```

#### **v_daily_stats**
Thống kê theo ngày

```sql
SELECT * FROM v_daily_stats 
WHERE date >= CURRENT_DATE - INTERVAL '7 days';
```

#### **v_active_sessions**
Phiên chat đang hoạt động

```sql
SELECT * FROM v_active_sessions 
WHERE minutes_since_last_activity < 30;
```

---

## 6. Queries Hữu Ích Cho Admin

### Xem phiên chat khẩn cấp

```sql
SELECT 
    cs.id,
    cs.user_role,
    cs.user_class,
    cs.emergency_level,
    cs.total_messages,
    cs.created_at,
    cs.emergency_keywords
FROM chat_sessions cs
WHERE cs.is_emergency = TRUE
  AND cs.emergency_level IN ('RED', 'YELLOW')
ORDER BY cs.created_at DESC;
```

### Xem tin nhắn của một phiên

```sql
SELECT 
    m.sender,
    m.content,
    m.emergency_detected,
    m.created_at
FROM messages m
WHERE m.session_id = 'your-session-id-here'
ORDER BY m.created_at ASC;
```

### Thống kê tổng quan

```sql
SELECT 
    COUNT(*) AS total_sessions,
    COUNT(CASE WHEN user_role = 'student' THEN 1 END) AS student_sessions,
    COUNT(CASE WHEN is_emergency = TRUE THEN 1 END) AS emergency_sessions,
    COUNT(CASE WHEN emergency_level = 'RED' THEN 1 END) AS red_alerts
FROM chat_sessions
WHERE created_at >= CURRENT_DATE;
```

### Export dữ liệu (CSV)

```sql
-- Export phiên chat
COPY (
    SELECT * FROM chat_sessions 
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
) TO STDOUT WITH CSV HEADER;
```

---

## 7. Bảo Mật

### Row Level Security (RLS)

Database đã được cấu hình RLS:
- ✅ Admin có thể xem tất cả dữ liệu
- ✅ User chỉ xem được session của mình
- ✅ Cho phép tạo session mới (anonymous)

### API Keys

- **anon key**: Dùng cho client-side (Next.js frontend)
- **service_role key**: Chỉ dùng server-side (API routes)

⚠️ **QUAN TRỌNG**: 
- KHÔNG commit API keys lên Git
- Thêm `.env.local` vào `.gitignore`
- Chỉ chia sẻ keys qua kênh bảo mật

---

## 8. Troubleshooting

### Lỗi: "permission denied"

```sql
-- Grant permissions cho user postgres
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

### Lỗi: "relation already exists"

```sql
-- Drop tables và tạo lại (CẢNH BÁO: Mất dữ liệu)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS emergency_alerts CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS statistics CASCADE;

-- Sau đó chạy lại migration
```

### Kiểm tra kết nối

```bash
# Test connection
psql "postgresql://postgres:minh_123@db.aolgnzgyewbsrjqlvzrs.supabase.co:5432/postgres" -c "SELECT version();"
```

---

## 9. Backup & Restore

### Backup database

```bash
pg_dump "postgresql://postgres:minh_123@db.aolgnzgyewbsrjqlvzrs.supabase.co:5432/postgres" > backup.sql
```

### Restore database

```bash
psql "postgresql://postgres:minh_123@db.aolgnzgyewbsrjqlvzrs.supabase.co:5432/postgres" < backup.sql
```

---

## 10. Next Steps

Sau khi setup database xong:

1. ✅ Cài đặt Supabase client: `npm install @supabase/supabase-js`
2. ✅ Tạo Supabase client utility
3. ✅ Cập nhật API routes để sử dụng Supabase
4. ✅ Test kết nối
5. ✅ Deploy lên production

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra Supabase Dashboard → Logs
2. Xem SQL Editor → History
3. Kiểm tra `.env.local` có đúng không
4. Test connection string

---

**Chúc bạn setup thành công! 🎉**
