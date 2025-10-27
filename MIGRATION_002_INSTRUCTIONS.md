# 🔧 Hướng Dẫn Chạy Migration 002

## Vấn đề
Khi admin đánh dấu "Đã xử lý" phiên chat, trạng thái không được lưu vào database. Sau khi F5, trạng thái bị mất.

## Giải pháp
Thêm 3 cột mới vào bảng `chat_sessions`:
- `is_processed` - Đã xử lý chưa (true/false)
- `processed_at` - Thời gian xử lý
- `processed_by` - Admin đã xử lý

## Cách chạy Migration

### **Bước 1: Truy cập Supabase Dashboard**

1. Mở: https://supabase.com/dashboard
2. Chọn project: **aolgnzgyewbsrjqlvzrs**
3. Vào menu: **SQL Editor**

### **Bước 2: Chạy SQL**

Copy và paste đoạn SQL sau vào SQL Editor, rồi click **Run**:

```sql
-- =====================================================
-- MIGRATION 002: Thêm cột is_processed
-- =====================================================

-- Thêm cột is_processed
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT FALSE;

-- Thêm cột processed_at
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Thêm cột processed_by
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS processed_by VARCHAR(100);

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_sessions_is_processed 
ON chat_sessions(is_processed);

-- Kiểm tra kết quả
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_sessions' 
AND column_name IN ('is_processed', 'processed_at', 'processed_by');
```

### **Bước 3: Verify**

Sau khi chạy SQL, bạn sẽ thấy kết quả:

```
column_name    | data_type                   | is_nullable
---------------|----------------------------|-------------
is_processed   | boolean                     | YES
processed_at   | timestamp with time zone    | YES
processed_by   | character varying           | YES
```

### **Bước 4: Test**

1. Restart server: `npm run dev`
2. Vào trang admin: http://localhost:3000/admin
3. Click "Đánh dấu" trên một phiên chat
4. F5 refresh trang
5. ✅ Trạng thái "Đã xử lý" vẫn còn!

## Đã cập nhật

✅ **API**: Thêm method `PATCH /api/sessions` để cập nhật `is_processed`  
✅ **Admin Page**: Hàm `handleProcess()` gọi API để lưu vào database  
✅ **Fetch**: Hàm `fetchSessions()` đọc `is_processed` từ database  

## Nếu gặp lỗi

### Lỗi: "permission denied"
- Đảm bảo bạn đang dùng **service_role_key** trong `.env.local`
- Kiểm tra RLS policies trong Supabase

### Lỗi: "column already exists"
- Không sao, có nghĩa là cột đã được tạo rồi
- Tiếp tục các bước tiếp theo

## Kết quả

Sau khi migration thành công:
- ✅ Đánh dấu "Đã xử lý" → Lưu vào database
- ✅ F5 refresh → Trạng thái vẫn còn
- ✅ Có thể xem thời gian xử lý (`processed_at`)
- ✅ Có thể xem ai đã xử lý (`processed_by`)
