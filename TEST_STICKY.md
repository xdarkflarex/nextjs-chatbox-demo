# 🧪 TEST STICKY CHAT - HƯỚNG DẪN CHI TIẾT

**Ngày**: 16/10/2025

---

## 🎯 Mục tiêu

Kiểm tra xem chat widget có "dính" (sticky) khi scroll xuống hay không.

---

## 🚀 Chuẩn bị

### Bước 1: Restart server
```bash
# Dừng server hiện tại (Ctrl+C)
npm run dev
```

### Bước 2: Mở trình duyệt
```
http://localhost:3000
```

### Bước 3: Hard refresh
```
Ctrl+Shift+R (hoặc Ctrl+F5)
Nhấn 3-5 lần để chắc chắn
```

---

## 🧪 Test Sticky - Desktop

### Điều kiện:
- ✅ Màn hình phải ≥1024px (desktop)
- ✅ Không thu nhỏ cửa sổ

### Các bước test:

#### 1. Kiểm tra vị trí ban đầu
```
✅ Mở trang
✅ Thấy 2 cột: Trái (thông tin) + Phải (chat)
✅ Chat ở bên phải, ngang với logo
```

#### 2. Scroll xuống CHẬM (quan trọng!)
```
✅ Dùng chuột scroll xuống từ từ
✅ Quan sát chat widget bên phải
✅ Khi scroll qua logo → Chat phải BẮT ĐẦU DÍNH
```

**Dấu hiệu chat đang sticky:**
- Chat không di chuyển theo scroll
- Chat "đóng băng" ở vị trí
- Cách top màn hình khoảng 1rem

#### 3. Tiếp tục scroll xuống
```
✅ Scroll xuống xem card "Trợ lý AI"
✅ Scroll xuống xem card "Admin"
✅ Scroll xuống xem card "Lưu ý"
```

**Kết quả mong đợi:**
- ✅ Chat vẫn ở bên phải
- ✅ Chat không bị cuốn theo
- ✅ Chat "dính" ở vị trí cố định

#### 4. Test chat trong khi scroll
```
✅ Giữ vị trí scroll ở giữa trang
✅ Click vào chat widget
✅ Chọn vai trò (Học sinh/GV/PH)
✅ Gửi tin nhắn
```

**Kết quả mong đợi:**
- ✅ Chat hoạt động bình thường
- ✅ Không cần scroll lên để chat
- ✅ Vừa xem thông tin vừa chat được

#### 5. Scroll lên lại
```
✅ Scroll lên về đầu trang
```

**Kết quả mong đợi:**
- ✅ Chat trở về vị trí ban đầu
- ✅ Ngang với logo như lúc đầu

---

## 🐛 Nếu sticky KHÔNG hoạt động

### Debug bằng DevTools

#### Bước 1: Mở DevTools
```
F12 (hoặc Ctrl+Shift+I)
```

#### Bước 2: Inspect chat widget
```
1. Click icon "Select element" (Ctrl+Shift+C)
2. Click vào chat widget
3. Tab Elements sẽ highlight element
```

#### Bước 3: Kiểm tra classes
Trong tab Elements, tìm div wrapper của ChatWidget.

**Phải thấy:**
```html
<div class="lg:sticky lg:top-4 lg:z-10">
  <div class="lg:-my-4">
    <ChatWidget />
  </div>
</div>
```

**Nếu KHÔNG thấy `lg:sticky`:**
- ❌ Code chưa được cập nhật
- ❌ Cần restart server và hard refresh

#### Bước 4: Kiểm tra Computed styles
```
1. Vẫn trong DevTools, tab Elements
2. Scroll xuống phần "Computed"
3. Tìm property "position"
```

**Trên desktop (≥1024px) phải thấy:**
```
position: sticky
top: 1rem (hoặc 16px)
z-index: 10
```

**Nếu thấy `position: static` hoặc `position: relative`:**
- ❌ Sticky không được apply
- ❌ Có thể do CSS conflict

#### Bước 5: Kiểm tra parent container
```
1. Trong tab Elements
2. Click vào parent của sticky div
3. Kiểm tra có `overflow: hidden` không
```

**Nếu parent có `overflow: hidden`:**
- ❌ Sticky sẽ không hoạt động
- ❌ Cần remove overflow

---

## 🔧 Giải pháp nếu vẫn lỗi

### Giải pháp 1: Clear cache hoàn toàn
```powershell
# Dừng server (Ctrl+C)

# Xóa .next folder
Remove-Item -Recurse -Force .next

# Xóa node_modules/.cache (nếu có)
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Restart
npm run dev
```

### Giải pháp 2: Hard refresh nhiều lần
```
Ctrl+Shift+R (5-10 lần)

Hoặc:
1. F12 → Network tab
2. Check "Disable cache"
3. Refresh (F5)
```

### Giải pháp 3: Thử trình duyệt khác
```
- Chrome → Thử Firefox
- Firefox → Thử Edge
- Edge → Thử Chrome
```

### Giải pháp 4: Kiểm tra màn hình
```
# Kiểm tra width
1. F12 → Console
2. Gõ: window.innerWidth
3. Phải ≥1024 để sticky hoạt động
```

### Giải pháp 5: Test với CSS trực tiếp
```
1. F12 → Elements
2. Tìm div wrapper của chat
3. Tab "Styles"
4. Thêm trực tiếp:
   position: sticky !important;
   top: 1rem !important;
   z-index: 10 !important;
5. Scroll test
```

**Nếu vẫn không hoạt động sau khi thêm CSS trực tiếp:**
- ❌ Có thể do parent container có vấn đề
- ❌ Kiểm tra parent có `overflow: hidden` không

---

## 📊 Checklist đầy đủ

### Trước khi test:
- [ ] Server đang chạy (`npm run dev`)
- [ ] Trình duyệt đã mở http://localhost:3000
- [ ] Đã hard refresh (Ctrl+Shift+R)
- [ ] Màn hình ≥1024px

### Trong khi test:
- [ ] Thấy 2 cột: Trái + Phải
- [ ] Chat ở bên phải
- [ ] Scroll xuống CHẬM
- [ ] Chat bắt đầu dính khi scroll qua logo
- [ ] Chat không di chuyển theo scroll
- [ ] Chat cách top khoảng 1rem

### Sau khi test:
- [ ] Chat vẫn hoạt động bình thường
- [ ] Có thể chat trong khi scroll
- [ ] Scroll lên, chat trở về vị trí ban đầu

### DevTools check:
- [ ] Element có class `lg:sticky`
- [ ] Computed style: `position: sticky`
- [ ] Computed style: `top: 1rem`
- [ ] Không có lỗi console

---

## 🎯 Kết quả mong đợi

### ✅ Sticky hoạt động:
```
SCROLL TOP:
┌──────────┬────────────┐
│ Logo     │   Chat     │ ← Vị trí ban đầu
│          │            │
└──────────┴────────────┘

↓ SCROLL XUỐNG

SCROLL MIDDLE:
┌──────────┬────────────┐
│ Cards    │   Chat     │ ← Chat dính ở đây!
│          │  (Sticky)  │
└──────────┴────────────┘

↓ SCROLL XUỐNG NỮA

SCROLL BOTTOM:
┌──────────┬────────────┐
│ Cards    │   Chat     │ ← Chat vẫn ở đây!
│ (cuối)   │  (Sticky)  │
└──────────┴────────────┘
```

### ❌ Sticky KHÔNG hoạt động:
```
SCROLL TOP:
┌──────────┬────────────┐
│ Logo     │   Chat     │
│          │            │
└──────────┴────────────┘

↓ SCROLL XUỐNG

SCROLL MIDDLE:
┌──────────┬────────────┐
│ Cards    │            │ ← Chat bị cuốn lên!
│          │            │   (Không thấy nữa)
└──────────┴────────────┘
```

---

## 📝 Ghi chú

### Sticky chỉ hoạt động khi:
1. ✅ Element có `position: sticky`
2. ✅ Element có `top/bottom/left/right` được set
3. ✅ Parent KHÔNG có `overflow: hidden`
4. ✅ Element có đủ không gian để scroll
5. ✅ Màn hình đủ lớn (≥1024px cho `lg:`)

### Sticky KHÔNG hoạt động khi:
1. ❌ Parent có `overflow: hidden`
2. ❌ Element không có `top/bottom` value
3. ❌ Màn hình quá nhỏ (<1024px)
4. ❌ Browser không support sticky
5. ❌ CSS bị override bởi style khác

---

## 🆘 Cần hỗ trợ?

Nếu sau tất cả các bước trên sticky vẫn không hoạt động:

1. **Chụp màn hình:**
   - Screenshot toàn bộ trang
   - Screenshot DevTools → Elements tab
   - Screenshot DevTools → Computed tab

2. **Copy thông tin:**
   - Browser version
   - Window width (console: `window.innerWidth`)
   - Classes của chat wrapper

3. **Mô tả chi tiết:**
   - Sticky có hoạt động một chút không?
   - Chat có di chuyển gì không?
   - Có lỗi console không?

---

**Chúc bạn test thành công!** 🚀
