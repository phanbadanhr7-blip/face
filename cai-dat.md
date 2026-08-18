# 📱 Hướng Dẫn Triển Khai Ứng Dụng Thành App Android & iOS

Tài liệu này hướng dẫn chi tiết cách đóng gói và chuyển đổi ứng dụng web React + Vite hiện tại thành ứng dụng di động chạy mượt mà trên hệ điều hành **Android (file APK/AAB)** và **iOS (file IPA)** mà không cần viết lại toàn bộ mã nguồn.

---

## 🚀 Phương Án 1: Đóng Gói Thành Native App Với Capacitor (Khuyên Dùng)

**Capacitor** (từ đội ngũ Ionic) là giải pháp tiêu chuẩn hiện nay giúp chuyển mã nguồn React/Vite thành các dự án Native trong **Android Studio** và **Xcode**.

### Bước 1: Cài đặt Capacitor vào dự án
Mở terminal tại thư mục gốc của dự án và chạy các lệnh sau:

```bash
# 1. Cài đặt các gói cốt lõi của Capacitor
npm install @capacitor/core @capacitor/cli

# 2. Khởi tạo cấu hình Capacitor
npx cap init "FB Manager" "com.yourcompany.fbmanager" --web-dir "dist"
```

### Bước 2: Thêm nền tảng Android & iOS

```bash
# Cài đặt nền tảng Android và iOS
npm install @capacitor/android @capacitor/ios

# Tạo thư mục dự án Native
npx cap add android
npx cap add ios
```

### Bước 3: Đóng gói Web và Đồng bộ vào App Native

Mỗi khi bạn sửa code React, hãy chạy các lệnh sau để cập nhật sang App di động:

```bash
# 1. Biên dịch code web ra thư mục dist
npm run build

# 2. Đồng bộ code vào thư mục Android & iOS
npx cap sync
```

### Bước 4: Mở dự án và Xuất file cài đặt

#### 🤖 Đối với Android (Xuất file APK / AAB):
1. Chạy lệnh:
   ```bash
   npx cap open android
   ```
2. Android Studio sẽ tự động mở dự án.
3. Chọn menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)** để lấy file cài đặt thử nghiệm trên điện thoại Android.
4. Chọn **Generate Signed Bundle / APK** khi muốn xuất bản lên Google Play Store.

#### 🍏 Đối với iOS (Cần máy tính macOS):
1. Chạy lệnh:
   ```bash
   npx cap open ios
   ```
2. Xcode sẽ tự động mở dự án.
3. Chọn thiết bị iPhone kết nối qua cáp hoặc máy ảo Simulator để chạy thử.
4. Chọn menu **Product** > **Archive** để đẩy lên TestFlight hoặc App Store.

---

## ⚙️ Những Phần Cần Sửa Đổi Trong Mã Nguồn

Khi chuyển từ môi trường Web sang Mobile App, cần lưu ý và điều chỉnh 4 điểm sau:

### 1. Tách Biệt & Cấu Hình Backend API
* **Vấn đề:** Trên App di động, các yêu cầu mạng gọi tới `/api/...` sẽ không tự trỏ về localhost mà cần một địa chỉ máy chủ thực tế có HTTPS.
* **Cách xử lý:**
  1. Triển khai phần Backend (`server.ts`) lên một dịch vụ Cloud (như Cloud Run, Render, Railway, VPS) để có domain riêng (ví dụ: `https://api.yourdomain.com`).
  2. Tạo biến môi trường `VITE_API_BASE_URL` trong frontend:
     ```env
     VITE_API_BASE_URL=https://api.yourdomain.com
     ```
  3. Cập nhật các lệnh gọi API trong mã nguồn để sử dụng tiền tố này.

### 2. Xử Lý Luồng Đăng Nhập Facebook (OAuth & Deep Link)
* **Vấn đề:** Trên App di động, lệnh `window.open` mở popup đăng nhập Facebook có thể bị chặn hoặc không nhận được callback.
* **Cách xử lý:**
  1. Cài đặt plugin trình duyệt trong app:
     ```bash
     npm install @capacitor/browser
     ```
  2. Cấu hình **Custom URL Scheme / Deep Link** (ví dụ: `fbmanager://callback`) trong cấu hình Facebook Developer để khi người dùng xác thực xong, trình duyệt sẽ tự động kích hoạt và điều hướng ngược lại vào App.

### 3. Tối Ưu Giao Diện Màn Hình Điện Thoại (Safe Area)
* Đảm bảo thẻ `<meta name="viewport">` trong `index.html` có thuộc tính `viewport-fit=cover`:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  ```
* Bổ sung khoảng đệm an toàn (`safe-area-inset-top`, `safe-area-inset-bottom`) để nội dung không bị che bởi tai thỏ (Notch) hoặc thanh điều hướng cử chỉ của điện thoại.

### 4. Thông Báo Đẩy (Push Notifications - Tùy Chọn)
* Nếu cần nhận thông báo khi có tin nhắn Messenger mới hoặc khi bài viết lên lịch đăng thành công, cài thêm:
  ```bash
  npm install @capacitor/push-notifications
  ```
* Kết nối với dịch vụ **Firebase Cloud Messaging (FCM)** để gửi thông báo đẩy đến điện thoại.

---

## 🌐 Phương Án 2: Triển Khai Dạng PWA (Không Cần Duyệt Store)

Nếu bạn chỉ muốn cài app trực tiếp lên màn hình chính điện thoại để dùng nội bộ mà **không cần đăng ký tài khoản Developer của Google (25$) hay Apple (99$/năm)**:

1. Cài đặt plugin PWA cho Vite:
   ```bash
   npm install vite-plugin-pwa -D
   ```
2. Cấu hình `vite.config.ts` để sinh file `manifest.json` và Service Worker.
3. Khi người dùng truy cập web bằng Safari (iPhone) hoặc Chrome (Android), chỉ cần bấm:
   * **iOS:** Nút Chia sẻ (Share) -> **Thêm vào Màn hình chính (Add to Home Screen)**.
   * **Android:** Menu 3 chấm -> **Cài đặt ứng dụng (Install App)**.
4. Ứng dụng sẽ hoạt động full màn hình như ứng dụng cài từ Store.

---

## 📊 Bảng Yêu Cầu & Chi Phí Hạ Tầng

| Hạng mục | Nền tảng Android | Nền tảng iOS |
| :--- | :--- | :--- |
| **Phần mềm biên dịch** | Android Studio (Miễn phí, chạy trên Windows/macOS/Linux) | Xcode (Miễn phí, **bắt buộc chạy trên macOS**) |
| **Phí tài khoản nhà phát triển** | Google Play Console: **25 USD** (Đóng 1 lần duy nhất) | Apple Developer Program: **99 USD / năm** |
| **Yêu cầu máy chủ Backend** | Bắt buộc đưa `server.ts` lên Cloud có HTTPS | Bắt buộc đưa `server.ts` lên Cloud có HTTPS |
| **Icon ứng dụng** | Ảnh PNG vuông kích thước tối thiểu 512x512 px | Ảnh PNG vuông kích thước tối thiểu 1024x1024 px |
