# Hệ thống Tự động Lưu Phiên Chat

## Tổng quan
Hệ thống đã được nâng cấp để **tự động lưu** tất cả phiên chat vào localStorage, đảm bảo không mất dữ liệu ngay cả khi người dùng đóng tab hoặc refresh trang.

## Cơ chế Lưu Tự động

### 1. **Lưu sau mỗi tin nhắn**
- Mỗi khi có tin nhắn mới (từ user hoặc AI), phiên chat được lưu ngay lập tức
- Đảm bảo dữ liệu luôn được cập nhật real-time

### 2. **Lưu định kỳ (mỗi 10 giây)**
- Backup định kỳ để đảm bảo an toàn
- Tránh mất dữ liệu trong trường hợp lỗi không mong muốn

### 3. **Lưu khi đóng tab/chuyển trang**
- Sử dụng event `beforeunload` để lưu trước khi trang đóng
- Đảm bảo dữ liệu được lưu ngay cả khi người dùng đóng tab đột ngột

### 4. **Lưu khi kết thúc chat**
- Nút "Kết thúc chat" vẫn lưu như bình thường
- Chuyển hướng đến trang cảm ơn sau khi lưu

## Dữ liệu được lưu

Mỗi phiên chat bao gồm:
```javascript
{
  sessionId: "unique-id",
  id: "unique-id",
  messages: [...],           // Tất cả tin nhắn
  userRole: "student/teacher/parent",
  isEmergency: true/false,   // Đánh dấu khẩn cấp
  emergencyInfo: {...},      // Thông tin khẩn cấp (nếu có)
  time: timestamp            // Thời gian tạo/cập nhật
}
```

## Visual Indicator

Người dùng sẽ thấy trạng thái lưu ở góc phải header:
- 🔄 **"Đang lưu..."** - Khi đang lưu dữ liệu
- ✅ **"Đã lưu"** - Sau khi lưu thành công (hiện 2 giây rồi ẩn)

## Lợi ích

### Cho Học sinh/Phụ huynh/Giáo viên:
✅ Không lo mất dữ liệu khi đóng tab nhầm
✅ Có thể quay lại chat sau khi refresh
✅ Dữ liệu được bảo vệ tự động

### Cho Admin:
✅ Nhận được TẤT CẢ phiên chat, kể cả khi người dùng không nhấn "Kết thúc"
✅ Phiên khẩn cấp được lưu ngay lập tức
✅ Dữ liệu đầy đủ hơn để xử lý và hỗ trợ

### Cho Hệ thống:
✅ Giảm mất mát dữ liệu
✅ Tăng độ tin cậy
✅ Trải nghiệm người dùng tốt hơn

## Kiểm tra Console

Mở Developer Tools (F12) để xem log:
- `✅ Session saved: [sessionId] Emergency: [true/false]` - Khi lưu thành công
- `❌ Error saving session: [error]` - Nếu có lỗi

## Lưu ý Kỹ thuật

1. **Synchronous Save**: Hàm `saveSession()` là đồng bộ để đảm bảo lưu được khi đóng tab
2. **localStorage**: Dữ liệu lưu trên trình duyệt, không mất khi refresh
3. **Session ID**: Mỗi phiên có ID duy nhất để tránh trùng lặp
4. **Auto-merge**: Nếu cùng sessionId, dữ liệu sẽ được cập nhật thay vì tạo mới

## Troubleshooting

### Nếu dữ liệu không hiện ở Admin:
1. Kiểm tra localStorage: `localStorage.getItem('chatSessions')`
2. Refresh trang Admin
3. Kiểm tra console có lỗi không

### Nếu không lưu được:
1. Kiểm tra localStorage có đầy không (giới hạn ~5-10MB)
2. Kiểm tra browser có block localStorage không
3. Xem console log để debug
