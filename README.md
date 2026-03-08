# ✨ BeautyScan AI — Ứng Dụng Quét Khuôn Mặt

> Ứng dụng web giải trí phân tích khuôn mặt bằng AI, hiển thị "Beauty Score" ngẫu nhiên kèm nhận xét vui. **Chỉ mang tính giải trí.**

---

## 📁 Cấu Trúc File

```
beautyscan/
├── index.html        — Giao diện chính
├── style.css         — Thiết kế Cyberpunk Dark
├── script.js         — Logic camera + AI + scoring
├── manifest.json     — Cấu hình PWA
├── service-worker.js — Cache offline
├── icon-192.png      — Icon app 192×192
├── icon-512.png      — Icon app 512×512
└── README.md         — File này
```

---

## 🚀 Hướng Dẫn Deploy Lên GitHub Pages

### Bước 1: Tạo Repository GitHub

1. Truy cập [github.com](https://github.com) và đăng nhập
2. Nhấn nút **"+"** góc trên phải → **"New repository"**
3. Đặt tên repo: `beautyscan` (hoặc tên bạn muốn)
4. Chọn **Public** ✅
5. Nhấn **"Create repository"**

### Bước 2: Upload Files

**Cách A — Qua giao diện web (dễ nhất):**

1. Trong trang repo vừa tạo, nhấn **"uploading an existing file"**
2. Kéo thả tất cả file vào hoặc nhấn "choose your files"
3. Chọn tất cả 8 file: `index.html`, `style.css`, `script.js`, `manifest.json`, `service-worker.js`, `icon-192.png`, `icon-512.png`, `README.md`
4. Kéo xuống, nhấn **"Commit changes"** (màu xanh)

**Cách B — Qua Git CLI:**

```bash
git init
git add .
git commit -m "Initial commit: BeautyScan AI"
git branch -M main
git remote add origin https://github.com/TÊN_BẠN/beautyscan.git
git push -u origin main
```

### Bước 3: Bật GitHub Pages

1. Vào repo → nhấn tab **"Settings"** (⚙️)
2. Kéo xuống mục **"Pages"** (cột trái)
3. Mục **"Branch"**: chọn **`main`** và **`/(root)`**
4. Nhấn **"Save"**
5. Chờ 1–2 phút

✅ Website sẽ live tại:
```
https://TÊN_BẠN.github.io/beautyscan/
```

---

## 📱 Cài Web Thành App Trên Điện Thoại

### Android (Chrome)

1. Mở link website trên **Chrome**
2. Nhấn menu **⋮** (3 chấm) góc phải
3. Chọn **"Thêm vào màn hình chính"** hoặc **"Cài đặt ứng dụng"**
4. Nhấn **"Thêm"** / **"Cài đặt"**
5. App xuất hiện trên màn hình chính, mở như app thật! 🎉

> Hoặc: Khi mở web, banner "Cài vào màn hình chính" sẽ tự hiện ở cuối màn hình.

### iOS (Safari)

1. Mở link website trên **Safari**
2. Nhấn nút **Chia sẻ** (hình vuông mũi tên lên)
3. Kéo xuống, chọn **"Thêm vào Màn hình chính"**
4. Đặt tên và nhấn **"Thêm"**
5. App xuất hiện trên màn hình chính! 🎉

---

## ⚙️ Tính Năng

| Tính năng | Mô tả |
|-----------|-------|
| 📷 Camera | Dùng camera trước của điện thoại |
| 🔍 Face Detection | Phát hiện khuôn mặt bằng face-api.js |
| ✨ Beauty Score | Điểm ngẫu nhiên 0–100 (giải trí) |
| 💬 AI Comment | Nhận xét ngẫu nhiên vui nhộn |
| 📊 Stats | 6 chỉ số phụ (đối xứng, ánh mắt...) |
| 📤 Chia sẻ | Web Share API hoặc copy link |
| 📲 PWA | Cài như app, chạy fullscreen |
| 🌙 Dark Mode | Giao diện Cyberpunk tối |

---

## 🔒 Quyền Riêng Tư

- Camera **chỉ hoạt động cục bộ** trên thiết bị
- **Không** upload ảnh lên server nào
- **Không** lưu trữ dữ liệu khuôn mặt
- Mọi xử lý diễn ra hoàn toàn trên thiết bị của bạn

---

## ⚠️ Lưu Ý

**Ứng dụng này chỉ mang tính GIẢI TRÍ.** Beauty Score là điểm ngẫu nhiên, không phản ánh ngoại hình thực tế. Mọi người đều đẹp theo cách riêng của mình! 💖

---

## 🛠️ Công Nghệ

- **HTML5** + **CSS3** + **JavaScript ES6+**
- **face-api.js** (Tiny Face Detector)
- **Web Camera API** (getUserMedia)
- **PWA** (Service Worker + Web App Manifest)
- **Google Fonts**: Rajdhani, Exo 2, Share Tech Mono
