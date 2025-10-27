-- =====================================================
-- CHATBOT TÂM LÝ THCS NGUYỄN HUỆ - DATABASE SCHEMA
-- =====================================================
-- Mục đích: Lưu trữ phiên chat, tin nhắn, và quản lý người dùng
-- Cho phép giáo viên theo dõi online khi có mạng
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: USERS (Người dùng)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(200),
    role VARCHAR(50) CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
    email VARCHAR(255),
    phone VARCHAR(20),
    class_name VARCHAR(50), -- Lớp (nếu là học sinh)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Index cho tìm kiếm nhanh
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_class ON users(class_name);

-- =====================================================
-- TABLE 2: CHAT_SESSIONS (Phiên chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_name VARCHAR(255),
    user_role VARCHAR(50) CHECK (user_role IN ('student', 'teacher', 'parent')),
    user_class VARCHAR(50), -- Lớp của người dùng
    emergency_level VARCHAR(20) CHECK (emergency_level IN ('GREEN', 'YELLOW', 'RED')) DEFAULT 'GREEN',
    emergency_keywords TEXT[], -- Mảng từ khóa khẩn cấp phát hiện được
    is_emergency BOOLEAN DEFAULT FALSE,
    total_messages INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb -- Lưu thông tin bổ sung
);

-- Index cho tìm kiếm và lọc
CREATE INDEX idx_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_sessions_user_role ON chat_sessions(user_role);
CREATE INDEX idx_sessions_emergency_level ON chat_sessions(emergency_level);
CREATE INDEX idx_sessions_is_emergency ON chat_sessions(is_emergency);
CREATE INDEX idx_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX idx_sessions_is_active ON chat_sessions(is_active);

-- =====================================================
-- TABLE 3: MESSAGES (Tin nhắn)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(20) CHECK (sender IN ('user', 'bot')),
    content TEXT NOT NULL,
    emergency_detected BOOLEAN DEFAULT FALSE,
    emergency_level VARCHAR(20) CHECK (emergency_level IN ('GREEN', 'YELLOW', 'RED')),
    emergency_keywords TEXT[], -- Từ khóa khẩn cấp trong tin nhắn này
    rag_used BOOLEAN DEFAULT FALSE, -- Có sử dụng RAG không
    smart_retrieval_used BOOLEAN DEFAULT FALSE, -- Có sử dụng Smart Retrieval không
    response_time_ms INTEGER, -- Thời gian phản hồi (ms)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb -- Context, sources, etc.
);

-- Index cho truy vấn nhanh
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_emergency_detected ON messages(emergency_detected);

-- =====================================================
-- TABLE 4: ADMIN_LOGS (Nhật ký quản trị)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'view_session', 'export_data', 'delete_session', etc.
    target_type VARCHAR(50), -- 'session', 'user', 'message'
    target_id UUID,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index cho audit trail
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);

-- =====================================================
-- TABLE 5: EMERGENCY_ALERTS (Cảnh báo khẩn cấp)
-- =====================================================
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    alert_level VARCHAR(20) CHECK (alert_level IN ('YELLOW', 'RED')) NOT NULL,
    keywords TEXT[] NOT NULL,
    student_class VARCHAR(50),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index cho theo dõi cảnh báo
CREATE INDEX idx_emergency_alerts_session_id ON emergency_alerts(session_id);
CREATE INDEX idx_emergency_alerts_alert_level ON emergency_alerts(alert_level);
CREATE INDEX idx_emergency_alerts_is_resolved ON emergency_alerts(is_resolved);
CREATE INDEX idx_emergency_alerts_created_at ON emergency_alerts(created_at DESC);

-- =====================================================
-- TABLE 6: STATISTICS (Thống kê hệ thống)
-- =====================================================
CREATE TABLE IF NOT EXISTS statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_sessions INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    student_sessions INTEGER DEFAULT 0,
    teacher_sessions INTEGER DEFAULT 0,
    parent_sessions INTEGER DEFAULT 0,
    emergency_alerts INTEGER DEFAULT 0,
    red_alerts INTEGER DEFAULT 0,
    yellow_alerts INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho báo cáo
CREATE INDEX idx_statistics_date ON statistics(date DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger cho chat_sessions
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger cho statistics
CREATE TRIGGER update_statistics_updated_at
    BEFORE UPDATE ON statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Tự động tăng total_messages khi có tin nhắn mới
CREATE OR REPLACE FUNCTION increment_session_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions
    SET total_messages = total_messages + 1,
        updated_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger tăng message count
CREATE TRIGGER increment_message_count
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_session_message_count();

-- Function: Tự động tạo emergency alert khi phát hiện khẩn cấp
CREATE OR REPLACE FUNCTION create_emergency_alert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.emergency_detected = TRUE AND NEW.emergency_level IN ('YELLOW', 'RED') THEN
        INSERT INTO emergency_alerts (
            session_id,
            message_id,
            alert_level,
            keywords,
            student_class
        )
        SELECT 
            NEW.session_id,
            NEW.id,
            NEW.emergency_level,
            NEW.emergency_keywords,
            cs.user_class
        FROM chat_sessions cs
        WHERE cs.id = NEW.session_id;
        
        -- Cập nhật session emergency status
        UPDATE chat_sessions
        SET is_emergency = TRUE,
            emergency_level = NEW.emergency_level,
            emergency_keywords = NEW.emergency_keywords
        WHERE id = NEW.session_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger tạo emergency alert
CREATE TRIGGER create_alert_on_emergency
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION create_emergency_alert();

-- =====================================================
-- VIEWS (Các view hữu ích cho admin)
-- =====================================================

-- View: Phiên chat khẩn cấp chưa xử lý
CREATE OR REPLACE VIEW v_unresolved_emergencies AS
SELECT 
    ea.id AS alert_id,
    ea.alert_level,
    ea.keywords,
    ea.created_at AS alert_time,
    cs.id AS session_id,
    cs.user_role,
    cs.user_class AS student_class,
    cs.total_messages,
    cs.created_at AS session_start,
    m.content AS trigger_message
FROM emergency_alerts ea
JOIN chat_sessions cs ON ea.session_id = cs.id
JOIN messages m ON ea.message_id = m.id
WHERE ea.is_resolved = FALSE
ORDER BY ea.created_at DESC;

-- View: Thống kê theo ngày
CREATE OR REPLACE VIEW v_daily_stats AS
SELECT 
    DATE(created_at) AS date,
    COUNT(DISTINCT id) AS total_sessions,
    COUNT(DISTINCT CASE WHEN user_role = 'student' THEN id END) AS student_sessions,
    COUNT(DISTINCT CASE WHEN user_role = 'teacher' THEN id END) AS teacher_sessions,
    COUNT(DISTINCT CASE WHEN user_role = 'parent' THEN id END) AS parent_sessions,
    COUNT(DISTINCT CASE WHEN is_emergency = TRUE THEN id END) AS emergency_sessions,
    COUNT(DISTINCT CASE WHEN emergency_level = 'RED' THEN id END) AS red_alerts,
    COUNT(DISTINCT CASE WHEN emergency_level = 'YELLOW' THEN id END) AS yellow_alerts
FROM chat_sessions
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: Phiên chat đang hoạt động
CREATE OR REPLACE VIEW v_active_sessions AS
SELECT 
    cs.id,
    cs.user_role,
    cs.user_class,
    cs.emergency_level,
    cs.is_emergency,
    cs.total_messages,
    cs.created_at,
    cs.updated_at,
    EXTRACT(EPOCH FROM (NOW() - cs.updated_at)) / 60 AS minutes_since_last_activity
FROM chat_sessions cs
WHERE cs.is_active = TRUE
  AND cs.ended_at IS NULL
ORDER BY cs.updated_at DESC;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Bảo mật dữ liệu
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Admin có thể xem tất cả
CREATE POLICY admin_all_access ON users
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_all_sessions ON chat_sessions
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_all_messages ON messages
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy: User chỉ xem được session của mình
CREATE POLICY user_own_sessions ON chat_sessions
    FOR SELECT
    USING (user_id::text = auth.uid()::text);

-- Policy: Cho phép insert session mới (anonymous users)
CREATE POLICY allow_insert_sessions ON chat_sessions
    FOR INSERT
    WITH CHECK (true);

-- Policy: Cho phép insert messages
CREATE POLICY allow_insert_messages ON messages
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- SEED DATA - Dữ liệu mẫu
-- =====================================================

-- Tạo admin user mặc định
INSERT INTO users (username, password_hash, full_name, role, email, is_active)
VALUES 
    ('admin', '$2a$10$YourHashedPasswordHere', 'Quản trị viên', 'admin', 'admin@nguyenhue.edu.vn', true),
    ('gvcn_demo', '$2a$10$YourHashedPasswordHere', 'Giáo viên Demo', 'teacher', 'teacher@nguyenhue.edu.vn', true)
ON CONFLICT (username) DO NOTHING;

-- Tạo thống kê mặc định cho hôm nay
INSERT INTO statistics (date)
VALUES (CURRENT_DATE)
ON CONFLICT (date) DO NOTHING;

-- =====================================================
-- COMMENTS - Mô tả các bảng
-- =====================================================

COMMENT ON TABLE users IS 'Bảng người dùng: admin, giáo viên, học sinh, phụ huynh';
COMMENT ON TABLE chat_sessions IS 'Bảng phiên chat: lưu thông tin mỗi cuộc hội thoại';
COMMENT ON TABLE messages IS 'Bảng tin nhắn: lưu từng tin nhắn trong phiên chat';
COMMENT ON TABLE admin_logs IS 'Bảng nhật ký: theo dõi hành động của admin';
COMMENT ON TABLE emergency_alerts IS 'Bảng cảnh báo: phát hiện tình huống khẩn cấp';
COMMENT ON TABLE statistics IS 'Bảng thống kê: tổng hợp dữ liệu theo ngày';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes cho các truy vấn phổ biến
CREATE INDEX idx_sessions_role_emergency ON chat_sessions(user_role, emergency_level, created_at DESC);
CREATE INDEX idx_messages_session_created ON messages(session_id, created_at DESC);
CREATE INDEX idx_alerts_unresolved ON emergency_alerts(is_resolved, alert_level, created_at DESC);

-- =====================================================
-- COMPLETED
-- =====================================================

-- Thông báo hoàn thành
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables: users, chat_sessions, messages, admin_logs, emergency_alerts, statistics';
    RAISE NOTICE '🔍 Views: v_unresolved_emergencies, v_daily_stats, v_active_sessions';
    RAISE NOTICE '🔒 RLS enabled for security';
    RAISE NOTICE '🚀 Ready for THCS Nguyễn Huệ Chatbot!';
END $$;
