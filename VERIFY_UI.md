# ✅ CHECKLIST XÁC NHẬN UI MỚI

## 🎯 Mục tiêu
Xác nhận UI mới đã được cài đặt đúng và hoạt động tốt.

---

## 📋 Checklist nhanh (5 phút)

### Bước 1: Kiểm tra files
```bash
# Chạy trong PowerShell/Terminal
cd d:\Minh_Tin_hoc\nextjs-chatbox-demo

# Kiểm tra file logo
Test-Path "app\public\logo nguyen hue.JPG"
# Kết quả mong đợi: True

# Kiểm tra file page.js đã update
Get-Content "app\page.js" | Select-String "THCS Nguyễn Huệ"
# Kết quả mong đợi: Có dòng chứa "THCS Nguyễn Huệ"
```

**Kết quả:**
- [ ] Logo file tồn tại ✅
- [ ] page.js đã có nội dung mới ✅

---

### Bước 2: Khởi động server
```bash
npm run dev
```

**Kết quả:**
- [ ] Server chạy thành công ✅
- [ ] Không có lỗi compile ✅
- [ ] Port 3000 đang lắng nghe ✅

---

### Bước 3: Kiểm tra Desktop (màn hình lớn)

Mở: http://localhost:3000

#### Visual:
- [ ] Logo THCS Nguyễn Huệ hiển thị tròn, rõ nét
- [ ] Tên trường "THCS Nguyễn Huệ" hiển thị đẹp
- [ ] Layout 2 cột: Trái (thông tin) + Phải (chat)
- [ ] Card "Trợ lý AI" màu xanh dương
- [ ] Card "Quản trị viên" màu xám
- [ ] Card "Lưu ý quan trọng" màu xanh lá nhạt
- [ ] Chat widget bên phải, chiếm ~2/3 màn hình

#### Spacing & Layout:
- [ ] Khoảng cách giữa các cards đều đặn
- [ ] Không bị tràn ngang
- [ ] Text không bị cắt
- [ ] Icons hiển thị đẹp

---

### Bước 4: Kiểm tra Mobile (thu nhỏ trình duyệt)

Resize trình duyệt xuống ~400px hoặc dùng DevTools (F12 → Toggle device)

#### Visual:
- [ ] Layout chuyển thành 1 cột dọc
- [ ] Logo nhỏ hơn nhưng vẫn rõ
- [ ] Các cards xếp chồng lên nhau theo thứ tự:
  1. Logo + Tên trường
  2. Trợ lý AI
  3. Quản trị viên
  4. Lưu ý
  5. Chat widget
- [ ] Không bị scroll ngang
- [ ] Text vẫn đọc được

---

### Bước 5: Kiểm tra tương tác

#### Hover effects:
- [ ] Hover vào cards có shadow tăng
- [ ] Hover vào nút "Đăng nhập Admin" có hiệu ứng scale
- [ ] Transitions mượt mà

#### Click actions:
- [ ] Click "Đăng nhập Admin" → Chuyển sang /admin-login
- [ ] Chọn vai trò (Học sinh/GV/PH) → Chat hoạt động
- [ ] Gửi tin nhắn → AI trả lời bình thường
- [ ] Nút "Cần hỗ trợ khẩn" hoạt động

---

### Bước 6: Kiểm tra nội dung

#### Card Logo:
- [ ] Logo hiển thị
- [ ] Text: "THCS Nguyễn Huệ"
- [ ] Phụ đề: "Trường Trung học Cơ sở"

#### Card Trợ lý AI:
- [ ] Tiêu đề: "Trợ lý AI Học đường"
- [ ] Có icon bóng đèn
- [ ] Liệt kê 4 chức năng:
  - Tư vấn học tập & kỹ năng
  - Hỗ trợ tâm lý học đường
  - Tra cứu quy định nhà trường
  - Giải đáp thắc mắc nhanh chóng
- [ ] Có lời hướng dẫn

#### Card Admin:
- [ ] Tiêu đề: "Quản trị viên"
- [ ] Có icon khóa
- [ ] Mô tả: "Dành cho giáo viên và ban quản lý..."
- [ ] Nút "Đăng nhập Admin"

#### Card Lưu ý:
- [ ] Tiêu đề: "Lưu ý quan trọng"
- [ ] Có icon info
- [ ] Nội dung về tình huống khẩn cấp

---

## 🐛 Troubleshooting

### Vấn đề: Logo không hiển thị
**Giải pháp:**
```bash
# Copy lại file logo
Copy-Item "logo nguyen hue.JPG" -Destination "app\public\" -Force

# Restart server
# Ctrl+C để dừng, sau đó:
npm run dev
```

### Vấn đề: Layout bị vỡ
**Giải pháp:**
```bash
# Xóa cache
Remove-Item -Recurse -Force .next

# Build lại
npm run dev
```

### Vấn đề: CSS không áp dụng
**Giải pháp:**
```bash
# Hard refresh trình duyệt
# Ctrl+Shift+R (hoặc Ctrl+F5)

# Hoặc clear cache trình duyệt
```

### Vấn đề: File page.js không update
**Giải pháp:**
```bash
# Kiểm tra nội dung file
Get-Content "app\page.js" | Select-Object -First 10

# Nếu không đúng, restore từ backup hoặc edit lại
```

---

## 📊 Kết quả mong đợi

### ✅ Tất cả checks pass:
- Chúc mừng! UI mới đã hoạt động hoàn hảo
- Bạn có thể bắt đầu sử dụng

### ⚠️ Một số checks fail:
- Xem phần Troubleshooting
- Kiểm tra console log (F12)
- Kiểm tra terminal có lỗi không

### ❌ Nhiều checks fail:
- Có thể file bị lỗi khi edit
- Restore từ git (nếu có)
- Hoặc liên hệ để được hỗ trợ

---

## 📸 Screenshots để so sánh

### Desktop - Cột trái phải thấy:
```
┌────────────┬──────────────┐
│ Logo       │              │
│ THCS NH    │   Chat       │
│            │   Widget     │
│ [AI Card]  │              │
│            │   [Msgs]     │
│ [Admin]    │              │
│            │   [Input]    │
│ [Note]     │              │
└────────────┴──────────────┘
```

### Mobile - Phải thấy:
```
┌──────────────┐
│    Logo      │
├──────────────┤
│  [AI Card]   │
├──────────────┤
│  [Admin]     │
├──────────────┤
│  [Note]      │
├──────────────┤
│ Chat Widget  │
│  [Messages]  │
│  [Input]     │
└──────────────┘
```

---

## ⏱️ Thời gian ước tính

- **Kiểm tra files**: 1 phút
- **Khởi động server**: 1 phút
- **Test Desktop**: 2 phút
- **Test Mobile**: 1 phút
- **Test tương tác**: 2 phút

**Tổng**: ~7 phút

---

## 📝 Ghi chú

Sau khi verify xong, bạn có thể:
1. ✅ Sử dụng ngay nếu mọi thứ OK
2. 🔧 Fix issues nếu có lỗi nhỏ
3. 📞 Liên hệ hỗ trợ nếu có lỗi lớn

---

**Chúc bạn verify thành công!** 🎉
