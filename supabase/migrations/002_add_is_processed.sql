-- =====================================================
-- MIGRATION: Thêm cột is_processed vào chat_sessions
-- =====================================================
-- Mục đích: Cho phép admin đánh dấu phiên chat đã xử lý
-- Ngày tạo: 2025-10-27
-- =====================================================

-- Thêm cột is_processed
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT FALSE;

-- Thêm cột processed_at để lưu thời gian xử lý
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Thêm cột processed_by để lưu admin đã xử lý
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS processed_by VARCHAR(100);

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_sessions_is_processed ON chat_sessions(is_processed);

-- Comment
COMMENT ON COLUMN chat_sessions.is_processed IS 'Admin đã xử lý phiên chat này chưa';
COMMENT ON COLUMN chat_sessions.processed_at IS 'Thời gian admin xử lý';
COMMENT ON COLUMN chat_sessions.processed_by IS 'Admin đã xử lý (username hoặc email)';

-- Log
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 002 completed: Added is_processed, processed_at, processed_by to chat_sessions';
END $$;
