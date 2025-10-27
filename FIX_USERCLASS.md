# ✅ Fix: userClass is not defined

## 🐛 Lỗi

```
ReferenceError: userClass is not defined
```

## 🔧 Đã Sửa

### 1. Thêm State `userClass`
```javascript
const [userClass, setUserClass] = useState(null);
```

### 2. Hỏi Lớp Khi Chọn "Học sinh"
```javascript
if (role === 'student') {
  // Bot hỏi: "Em học lớp nào?"
}
```

### 3. Detect Lớp Tự Động
```javascript
// Khi học sinh nhập: "6/1", "7/2", "8/3"
// → Tự động lưu vào userClass
// → Không gọi API chat
```

---

## 🧪 Test Lại

### Bước 1: Restart Server

```bash
# Stop (Ctrl+C)
npm run dev
```

### Bước 2: Clear Cache

```javascript
// Mở http://localhost:3000
// Console (F12):
localStorage.clear();
location.reload();
```

### Bước 3: Test Flow Mới

```
1. Mở http://localhost:3000
2. Click: "Học sinh"
3. Bot hỏi: "Em học lớp nào?"
4. Nhập: "6/1"
5. Bot: "Cảm ơn em! Mình đã ghi nhận em học lớp 6/1..."
6. Chat: "Em cần hỗ trợ học tập"
7. Bot trả lời
```

### Bước 4: Kiểm Tra Console

Phải thấy:
```
✅ Session saved to Supabase: [uuid] Emergency: false
```

**Không còn lỗi:**
```
❌ userClass is not defined
```

### Bước 5: Kiểm Tra Supabase

```
1. Vào Supabase Dashboard
2. Table Editor → chat_sessions
3. Phải thấy:
   - user_role = "student"
   - user_class = "6/1"
```

### Bước 6: Test Admin

```
1. http://localhost:3000/admin-login
2. Login: admin / admin123
3. Phải thấy session với: "Học sinh - Lớp 6/1"
```

---

## 🎯 Flow Hoàn Chỉnh

```
1. Chọn "Học sinh"
   ↓
2. Bot hỏi lớp
   ↓
3. Nhập "6/1"
   ↓
4. Bot xác nhận
   ↓
5. Chat bình thường
   ↓
6. Auto-save lên Supabase
   ↓
7. Admin thấy session với lớp
```

---

## 🔍 Debug

### Nếu Vẫn Lỗi

**Check 1: Console có lỗi gì?**
```
F12 → Console
```

**Check 2: Network có gọi API không?**
```
F12 → Network → Filter: /api/sessions
→ Phải thấy POST request
```

**Check 3: Response có lỗi không?**
```
Click vào POST request
→ Response tab
→ Phải thấy: { "ok": true }
```

### Nếu Không Detect Lớp

**Đảm bảo nhập đúng format:**
```
✅ Đúng: 6/1, 7/2, 8/3, 9/4
❌ Sai: lớp 6/1, 6-1, 6.1, 61
```

**Pattern:** `số/số` (ví dụ: 6/1)

---

## 📊 Test Cases

### Test 1: Học Sinh Có Lớp

```
1. Chọn: "Học sinh"
2. Nhập: "6/1"
3. Chat: "Em cần hỗ trợ"
4. Kiểm tra Supabase:
   - user_class = "6/1" ✅
```

### Test 2: Giáo Viên (Không Có Lớp)

```
1. Chọn: "Giáo viên"
2. Chat: "Tôi cần hỗ trợ"
3. Kiểm tra Supabase:
   - user_class = null ✅
```

### Test 3: Phụ Huynh (Không Có Lớp)

```
1. Chọn: "Phụ huynh"
2. Chat: "Con em học thế nào?"
3. Kiểm tra Supabase:
   - user_class = null ✅
```

### Test 4: Học Sinh Không Nhập Lớp

```
1. Chọn: "Học sinh"
2. Bỏ qua câu hỏi lớp
3. Chat: "Em cần hỗ trợ"
4. Kiểm tra Supabase:
   - user_class = null ✅
   - Vẫn lưu được session ✅
```

---

## ✅ Success Criteria

- [ ] Restart server
- [ ] Clear cache
- [ ] Chọn "Học sinh"
- [ ] Bot hỏi lớp
- [ ] Nhập "6/1"
- [ ] Bot xác nhận
- [ ] Chat bình thường
- [ ] Console: "✅ Session saved to Supabase"
- [ ] Supabase: user_class = "6/1"
- [ ] Admin: Thấy "Học sinh - Lớp 6/1"
- [ ] Không có lỗi "userClass is not defined"

---

## 🎉 Kết Luận

Flow mới:
1. ✅ Chọn vai trò
2. ✅ Nếu học sinh → Hỏi lớp
3. ✅ Detect lớp tự động
4. ✅ Lưu lên Supabase với đầy đủ thông tin
5. ✅ Admin xem được lớp

**Bắt đầu test! 🚀**
