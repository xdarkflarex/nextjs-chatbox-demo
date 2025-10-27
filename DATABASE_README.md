# 📊 Database Documentation - Chatbot Tâm Lý THCS Nguyễn Huệ

## 🎯 Tổng Quan

Hệ thống sử dụng **Supabase (PostgreSQL)** để lưu trữ dữ liệu online, cho phép:
- ✅ Giáo viên quản lý phiên chat từ xa
- ✅ Theo dõi cảnh báo khẩn cấp real-time
- ✅ Thống kê và báo cáo
- ✅ Backup tự động
- ✅ Mở rộng dễ dàng

---

## 📋 Database Schema

### 1. **users** - Người dùng
Lưu thông tin admin, giáo viên, học sinh, phụ huynh

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `username` | VARCHAR(100) | Tên đăng nhập (unique) |
| `password_hash` | VARCHAR(255) | Mật khẩu đã hash |
| `full_name` | VARCHAR(200) | Họ tên đầy đủ |
| `role` | VARCHAR(50) | admin/teacher/student/parent |
| `email` | VARCHAR(255) | Email |
| `phone` | VARCHAR(20) | Số điện thoại |
| `class_name` | VARCHAR(50) | Lớp (nếu là học sinh) |
| `created_at` | TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | Ngày cập nhật |
| `last_login` | TIMESTAMP | Lần đăng nhập cuối |
| `is_active` | BOOLEAN | Trạng thái hoạt động |

**Indexes:**
- `idx_users_username` - Tìm kiếm theo username
- `idx_users_role` - Lọc theo role
- `idx_users_class` - Lọc theo lớp

---

### 2. **chat_sessions** - Phiên chat
Lưu thông tin mỗi cuộc hội thoại

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users (nullable) |
| `session_name` | VARCHAR(255) | Tên phiên chat |
| `user_role` | VARCHAR(50) | student/teacher/parent |
| `user_class` | VARCHAR(50) | Lớp của người dùng |
| `emergency_level` | VARCHAR(20) | GREEN/YELLOW/RED |
| `emergency_keywords` | TEXT[] | Mảng từ khóa khẩn cấp |
| `is_emergency` | BOOLEAN | Có phải khẩn cấp không |
| `total_messages` | INTEGER | Tổng số tin nhắn |
| `created_at` | TIMESTAMP | Thời gian bắt đầu |
| `updated_at` | TIMESTAMP | Lần cập nhật cuối |
| `ended_at` | TIMESTAMP | Thời gian kết thúc |
| `is_active` | BOOLEAN | Đang hoạt động |
| `metadata` | JSONB | Thông tin bổ sung |

**Indexes:**
- `idx_sessions_user_id` - Tìm theo user
- `idx_sessions_user_role` - Lọc theo role
- `idx_sessions_emergency_level` - Lọc theo mức độ khẩn cấp
- `idx_sessions_is_emergency` - Lọc phiên khẩn cấp
- `idx_sessions_created_at` - Sắp xếp theo thời gian
- `idx_sessions_is_active` - Lọc phiên đang hoạt động

**Triggers:**
- `update_sessions_updated_at` - Tự động cập nhật `updated_at`
- `increment_message_count` - Tự động tăng `total_messages`

---

### 3. **messages** - Tin nhắn
Lưu từng tin nhắn trong phiên chat

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | UUID | FK → chat_sessions |
| `sender` | VARCHAR(20) | user/bot |
| `content` | TEXT | Nội dung tin nhắn |
| `emergency_detected` | BOOLEAN | Phát hiện khẩn cấp |
| `emergency_level` | VARCHAR(20) | GREEN/YELLOW/RED |
| `emergency_keywords` | TEXT[] | Từ khóa khẩn cấp |
| `rag_used` | BOOLEAN | Có dùng RAG không |
| `smart_retrieval_used` | BOOLEAN | Có dùng Smart Retrieval |
| `response_time_ms` | INTEGER | Thời gian phản hồi (ms) |
| `created_at` | TIMESTAMP | Thời gian gửi |
| `metadata` | JSONB | Context, sources, etc. |

**Indexes:**
- `idx_messages_session_id` - Tìm theo session
- `idx_messages_created_at` - Sắp xếp theo thời gian
- `idx_messages_emergency_detected` - Lọc tin nhắn khẩn cấp

**Triggers:**
- `create_alert_on_emergency` - Tự động tạo emergency alert

**Cascade Delete:** Xóa session → Xóa tất cả messages

---

### 4. **emergency_alerts** - Cảnh báo khẩn cấp
Tự động tạo khi phát hiện tình huống khẩn cấp

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | UUID | FK → chat_sessions |
| `message_id` | UUID | FK → messages |
| `alert_level` | VARCHAR(20) | YELLOW/RED |
| `keywords` | TEXT[] | Từ khóa phát hiện |
| `student_class` | VARCHAR(50) | Lớp học sinh |
| `is_resolved` | BOOLEAN | Đã xử lý chưa |
| `resolved_by` | UUID | FK → users (admin) |
| `resolved_at` | TIMESTAMP | Thời gian xử lý |
| `resolution_notes` | TEXT | Ghi chú xử lý |
| `created_at` | TIMESTAMP | Thời gian phát hiện |
| `metadata` | JSONB | Thông tin bổ sung |

**Indexes:**
- `idx_emergency_alerts_session_id` - Tìm theo session
- `idx_emergency_alerts_alert_level` - Lọc theo mức độ
- `idx_emergency_alerts_is_resolved` - Lọc chưa xử lý
- `idx_emergency_alerts_created_at` - Sắp xếp theo thời gian

**Cascade Delete:** Xóa session → Xóa alerts

---

### 5. **admin_logs** - Nhật ký quản trị
Theo dõi hành động của admin

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `admin_id` | UUID | FK → users |
| `action` | VARCHAR(100) | Loại hành động |
| `target_type` | VARCHAR(50) | session/user/message |
| `target_id` | UUID | ID đối tượng |
| `description` | TEXT | Mô tả |
| `ip_address` | VARCHAR(50) | IP address |
| `created_at` | TIMESTAMP | Thời gian |
| `metadata` | JSONB | Thông tin bổ sung |

**Indexes:**
- `idx_admin_logs_admin_id` - Tìm theo admin
- `idx_admin_logs_created_at` - Sắp xếp theo thời gian
- `idx_admin_logs_action` - Lọc theo hành động

---

### 6. **statistics** - Thống kê hệ thống
Tổng hợp dữ liệu theo ngày

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `date` | DATE | Ngày (unique) |
| `total_sessions` | INTEGER | Tổng số phiên |
| `total_messages` | INTEGER | Tổng số tin nhắn |
| `student_sessions` | INTEGER | Phiên học sinh |
| `teacher_sessions` | INTEGER | Phiên giáo viên |
| `parent_sessions` | INTEGER | Phiên phụ huynh |
| `emergency_alerts` | INTEGER | Tổng cảnh báo |
| `red_alerts` | INTEGER | Cảnh báo đỏ |
| `yellow_alerts` | INTEGER | Cảnh báo vàng |
| `avg_response_time_ms` | INTEGER | Thời gian phản hồi TB |
| `created_at` | TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_statistics_date` - Sắp xếp theo ngày

**Triggers:**
- `update_statistics_updated_at` - Tự động cập nhật

---

## 🔍 Views (Materialized Queries)

### 1. **v_unresolved_emergencies**
Danh sách cảnh báo khẩn cấp chưa xử lý

```sql
SELECT * FROM v_unresolved_emergencies;
```

**Columns:**
- `alert_id` - ID cảnh báo
- `alert_level` - Mức độ (YELLOW/RED)
- `keywords` - Từ khóa
- `alert_time` - Thời gian phát hiện
- `session_id` - ID phiên chat
- `user_role` - Vai trò người dùng
- `student_class` - Lớp học sinh
- `total_messages` - Số tin nhắn
- `session_start` - Thời gian bắt đầu
- `trigger_message` - Tin nhắn kích hoạt

---

### 2. **v_daily_stats**
Thống kê theo ngày

```sql
SELECT * FROM v_daily_stats 
WHERE date >= CURRENT_DATE - INTERVAL '7 days';
```

**Columns:**
- `date` - Ngày
- `total_sessions` - Tổng phiên
- `student_sessions` - Phiên học sinh
- `teacher_sessions` - Phiên giáo viên
- `parent_sessions` - Phiên phụ huynh
- `emergency_sessions` - Phiên khẩn cấp
- `red_alerts` - Cảnh báo đỏ
- `yellow_alerts` - Cảnh báo vàng

---

### 3. **v_active_sessions**
Phiên chat đang hoạt động (cập nhật trong 30 phút)

```sql
SELECT * FROM v_active_sessions;
```

**Columns:**
- `id` - Session ID
- `user_role` - Vai trò
- `user_class` - Lớp
- `emergency_level` - Mức độ khẩn cấp
- `is_emergency` - Có khẩn cấp không
- `total_messages` - Số tin nhắn
- `created_at` - Thời gian bắt đầu
- `updated_at` - Lần cập nhật cuối
- `minutes_since_last_activity` - Phút kể từ hoạt động cuối

---

## 🔒 Row Level Security (RLS)

Database đã được cấu hình RLS để bảo mật:

### Policies

1. **admin_all_access** - Admin có full access tất cả bảng
2. **user_own_sessions** - User chỉ xem session của mình
3. **allow_insert_sessions** - Cho phép tạo session mới (anonymous)
4. **allow_insert_messages** - Cho phép tạo message mới

---

## 📊 Queries Hữu Ích

### 1. Xem phiên chat khẩn cấp hôm nay

```sql
SELECT 
    cs.id,
    cs.user_role,
    cs.user_class,
    cs.emergency_level,
    cs.emergency_keywords,
    cs.total_messages,
    cs.created_at
FROM chat_sessions cs
WHERE cs.is_emergency = TRUE
  AND cs.created_at >= CURRENT_DATE
ORDER BY cs.emergency_level DESC, cs.created_at DESC;
```

### 2. Xem tin nhắn của một phiên

```sql
SELECT 
    m.sender,
    m.content,
    m.emergency_detected,
    m.created_at
FROM messages m
WHERE m.session_id = 'your-session-id'
ORDER BY m.created_at ASC;
```

### 3. Thống kê tổng quan tuần này

```sql
SELECT 
    COUNT(*) AS total_sessions,
    COUNT(CASE WHEN user_role = 'student' THEN 1 END) AS student_sessions,
    COUNT(CASE WHEN is_emergency = TRUE THEN 1 END) AS emergency_sessions,
    COUNT(CASE WHEN emergency_level = 'RED' THEN 1 END) AS red_alerts
FROM chat_sessions
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
```

### 4. Top 10 từ khóa khẩn cấp phổ biến

```sql
SELECT 
    unnest(emergency_keywords) AS keyword,
    COUNT(*) AS frequency
FROM emergency_alerts
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY keyword
ORDER BY frequency DESC
LIMIT 10;
```

### 5. Phiên chat dài nhất

```sql
SELECT 
    cs.id,
    cs.user_role,
    cs.total_messages,
    cs.created_at,
    cs.ended_at,
    EXTRACT(EPOCH FROM (cs.ended_at - cs.created_at)) / 60 AS duration_minutes
FROM chat_sessions cs
WHERE cs.ended_at IS NOT NULL
ORDER BY duration_minutes DESC
LIMIT 10;
```

### 6. Giáo viên cần can thiệp (cảnh báo chưa xử lý)

```sql
SELECT 
    ea.id,
    ea.alert_level,
    ea.keywords,
    ea.student_class,
    ea.created_at,
    cs.total_messages,
    m.content AS trigger_message
FROM emergency_alerts ea
JOIN chat_sessions cs ON ea.session_id = cs.id
JOIN messages m ON ea.message_id = m.id
WHERE ea.is_resolved = FALSE
ORDER BY 
    CASE ea.alert_level 
        WHEN 'RED' THEN 1 
        WHEN 'YELLOW' THEN 2 
    END,
    ea.created_at DESC;
```

---

## 🔧 Maintenance

### Backup Database

```bash
# Full backup
pg_dump "postgresql://postgres:minh_123@db.aolgnzgyewbsrjqlvzrs.supabase.co:5432/postgres" > backup.sql

# Backup specific tables
pg_dump -t chat_sessions -t messages "postgresql://..." > sessions_backup.sql
```

### Restore Database

```bash
psql "postgresql://postgres:minh_123@db.aolgnzgyewbsrjqlvzrs.supabase.co:5432/postgres" < backup.sql
```

### Clean old data (older than 6 months)

```sql
-- Delete old sessions
DELETE FROM chat_sessions 
WHERE created_at < CURRENT_DATE - INTERVAL '6 months'
  AND is_emergency = FALSE;

-- Vacuum to reclaim space
VACUUM FULL;
```

### Update statistics

```sql
-- Manually update today's stats
INSERT INTO statistics (date)
VALUES (CURRENT_DATE)
ON CONFLICT (date) DO UPDATE SET
    total_sessions = (SELECT COUNT(*) FROM chat_sessions WHERE DATE(created_at) = CURRENT_DATE),
    total_messages = (SELECT COUNT(*) FROM messages WHERE DATE(created_at) = CURRENT_DATE),
    updated_at = NOW();
```

---

## 📈 Performance Tips

1. **Indexes** - Đã tạo sẵn indexes cho các truy vấn phổ biến
2. **Pagination** - Luôn dùng LIMIT khi query nhiều records
3. **Composite Indexes** - Dùng cho queries phức tạp
4. **Views** - Dùng views cho queries thường xuyên
5. **Connection Pooling** - Supabase tự động quản lý

---

## 🚨 Emergency Workflow

### Khi phát hiện cảnh báo RED:

1. **Trigger tự động** tạo record trong `emergency_alerts`
2. **Admin dashboard** hiển thị cảnh báo real-time
3. **Giáo viên** xem chi tiết session và messages
4. **Liên hệ** học sinh/phụ huynh
5. **Đánh dấu** đã xử lý:

```sql
UPDATE emergency_alerts
SET is_resolved = TRUE,
    resolved_by = 'admin-uuid',
    resolved_at = NOW(),
    resolution_notes = 'Đã liên hệ phụ huynh và GVCN'
WHERE id = 'alert-uuid';
```

---

## 📞 Support

Nếu cần hỗ trợ về database:
1. Xem Supabase Dashboard → Logs
2. Kiểm tra SQL Editor → History
3. Xem file `SUPABASE_QUICKSTART.md`
4. Test connection: `npm run db:test`

---

**Database version:** 1.0  
**Last updated:** 2024  
**Maintained by:** THCS Nguyễn Huệ IT Team
