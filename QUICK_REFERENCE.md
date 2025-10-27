# 🚀 Quick Reference - Supabase Database

## ⚡ Setup Nhanh (3 Bước)

### 1. Setup API Keys
```bash
npm run db:setup
```
Nhập URL và 2 API keys từ Supabase Dashboard

### 2. Tạo Database
Vào Supabase Dashboard → SQL Editor → Copy & Run:
```
supabase/migrations/001_initial_schema.sql
```

### 3. Test
```bash
npm run db:test
```

---

## 📝 Lệnh Thường Dùng

```bash
# Setup API keys
npm run db:setup

# Chạy migration (cần cài pg: npm install pg)
npm run db:migrate

# Test kết nối
npm run db:test

# Start dev server
npm run dev
```

---

## 🗄️ Database Tables

| Table | Mô tả |
|-------|-------|
| `users` | Admin, giáo viên, học sinh, phụ huynh |
| `chat_sessions` | Phiên chat |
| `messages` | Tin nhắn |
| `emergency_alerts` | Cảnh báo khẩn cấp (tự động) |
| `admin_logs` | Nhật ký quản trị |
| `statistics` | Thống kê theo ngày |

---

## 🔍 Queries Hữu Ích

### Xem cảnh báo khẩn cấp chưa xử lý
```sql
SELECT * FROM v_unresolved_emergencies;
```

### Thống kê hôm nay
```sql
SELECT * FROM v_daily_stats WHERE date = CURRENT_DATE;
```

### Phiên đang hoạt động
```sql
SELECT * FROM v_active_sessions;
```

### Tất cả phiên khẩn cấp
```sql
SELECT * FROM chat_sessions 
WHERE is_emergency = TRUE 
ORDER BY created_at DESC;
```

---

## 🌐 API Endpoints

### Sessions
```bash
POST   /api/sessions              # Tạo/cập nhật
GET    /api/sessions              # Danh sách
DELETE /api/sessions              # Xóa
```

### Admin
```bash
GET   /api/admin/stats            # Thống kê
GET   /api/admin/emergencies      # Cảnh báo
PATCH /api/admin/emergencies      # Xử lý cảnh báo
GET   /api/admin/sessions/[id]    # Chi tiết session
```

---

## 🔑 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database (optional)
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
```

---

## 🚨 Emergency Levels

| Level | Ý nghĩa | Ví dụ |
|-------|---------|-------|
| 🟢 GREEN | Bình thường | Chat thông thường |
| 🟡 YELLOW | Cần quan tâm | Stress, lo lắng, bắt nạt |
| 🔴 RED | Khẩn cấp | Tự hại, bạo lực, nguy hiểm |

---

## 📊 Supabase Dashboard

### Truy cập
https://supabase.com/dashboard

### Sections Quan Trọng
- **SQL Editor** - Chạy queries
- **Table Editor** - Xem/sửa data
- **Logs** - Debug errors
- **Settings → API** - Lấy API keys
- **Database → Performance** - Monitor

---

## 🔧 Troubleshooting

| Lỗi | Giải pháp |
|-----|-----------|
| "Invalid API key" | Kiểm tra `.env.local` |
| "relation does not exist" | Chạy migration |
| "permission denied" | Dùng `supabaseAdmin` |
| "Connection timeout" | Kiểm tra network |

---

## 📖 Tài Liệu Đầy Đủ

- `SUPABASE_QUICKSTART.md` - Quick start 5 phút
- `SUPABASE_SETUP_COMPLETE.md` - Tổng quan setup
- `DATABASE_README.md` - Database chi tiết
- `supabase/SETUP_INSTRUCTIONS.md` - Hướng dẫn đầy đủ

---

## 🎯 Workflow Demo

1. **Học sinh chat** → Lưu vào Supabase
2. **Phát hiện khẩn cấp** → Auto alert
3. **Giáo viên login** → Xem dashboard
4. **Xem chi tiết** → Session + messages
5. **Xử lý** → Mark resolved
6. **Báo cáo** → Export CSV

---

## ✅ Checklist

- [ ] Lấy API keys
- [ ] Chạy `npm run db:setup`
- [ ] Chạy migration
- [ ] Chạy `npm run db:test`
- [ ] Chuyển API routes
- [ ] Test tạo session
- [ ] Demo!

---

**Lưu file này để tham khảo nhanh! 📌**
