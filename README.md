# 📘 Hướng Dẫn Cài Đặt Và Sử Dụng Hệ Thống Quản Lý Fanpage Facebook & Trợ Lý AI

Chào mừng bạn đến với hệ thống quản lý Fanpage chuyên nghiệp tích hợp Trợ lý Trí tuệ nhân tạo (AI) thông minh từ Google Gemini. Hệ thống giúp bạn tối ưu hóa quy trình chăm sóc khách hàng, quản lý hộp thư tập trung, soạn thảo bài viết và tự động trả lời khách hàng 24/7 cực kỳ chuẩn xác.

---

## 🚀 Tính Năng Nổi Bật Hiện Có

### 1. 🔗 Kết Nối & Quản Lý Trang Facebook
* Hỗ trợ kết nối linh hoạt giữa chế độ **Live Facebook** (sử dụng Facebook Access Token và Page ID thật) và **Demo Mode** (chế độ trải nghiệm thử nghiệm).
* Quản lý trạng thái kết nối trực quan, cảnh báo chi tiết các lỗi quyền hạn hoặc token hết hạn từ Facebook API để xử lý nhanh chóng.

### 2. 💬 Hộp Thư Messenger Inbox (Đồng bộ thời gian thực)
* **Đồng bộ ngầm tự động:** Chu kỳ tự động quét và tải tin nhắn mới từ Facebook mỗi 10 giây.
* **Đồng bộ thủ công:** Nút "Đồng bộ tin nhắn" nhanh giúp bạn chủ động nạp tin nhắn mới nhất ngay lập tức.
* **Cơ chế ẩn/xóa cuộc hội thoại thông minh:** 
  * Khi bạn bấm **Xóa hội thoại**, hệ thống sẽ ẩn tạm thời cuộc trò chuyện đó khỏi danh sách để làm sạch hộp thư.
  * **Tự động khôi phục (Auto-Restore):** Ngay khi khách hàng gửi một tin nhắn mới hoặc có hoạt động chat mới phát sinh, hệ thống sẽ tự động đối chiếu thông tin, gỡ hội thoại khỏi danh sách ẩn và đưa cuộc chat trở lại màn hình chính của bạn ngay lập tức.

### 3. 🤖 Trợ Lý Trí Tuệ Nhân Tạo (AI Assistant - Gemini)
* **Chế độ tự động phản hồi (Autopilot):** Khi kích hoạt, AI sẽ thay thế bạn tự động phân tích câu hỏi của khách hàng trên Messenger và phản hồi ngay lập tức 24/7.
* **Tùy chọn phong cách trả lời (AI Tone & Persona):** Tự động chuyển đổi phong cách giao tiếp linh hoạt:
  * *Tiêu chuẩn:* Chu đáo, lịch sự, chuyên nghiệp.
  * *Chốt đơn:* Thuyết phục, thu hút, tập trung vào ưu đãi.
  * *Kỹ thuật:* Kiến nhẫn, chi tiết, mang tính hỗ trợ cao.
  * *Thân thiện:* Hài hước, gần gũi, cởi mở.
* **Kho tri thức riêng biệt (Knowledge Base):** Nhập trực tiếp thông tin cửa hàng, địa chỉ, bảng giá dịch vụ, số điện thoại nóng của bạn... AI sẽ dựa trên dữ liệu độc quyền này để tư vấn khách hàng chính xác nhất mà không lo bị trả lời sai lệch thông tin.
* **AI gợi ý soạn thảo:** Đề xuất nội dung trả lời mẫu chỉ với một lần nhấp chuột để quản trị viên duyệt trước khi gửi đi.

### 4. 📝 Tạo Bài Viết Fanpage Tự Động Bằng AI
* Chỉ cần nhập ý tưởng ngắn gọn, trợ lý AI sẽ tự động soạn thảo và biên tập các bài viết chất lượng cao đầy thu hút (bao gồm cả tiêu đề, nội dung chi tiết và các hashtag xu hướng).

### 5. 📱 Thiết Kế Tương Thích Di Động Tuyệt Đối (Responsive Mobile First)
* Giao diện tối ưu hóa hoàn hảo cho các thiết bị điện thoại di động và máy tính bảng:
  * **Menu Drawer trượt:** Thanh menu điều hướng bên trái dạng ẩn/hiện thông minh giúp màn hình hiển thị rộng rãi.
  * **Trải nghiệm Single-View trên Mobile:** Chế độ chuyển đổi tự động giữa *Danh sách chat* và *Khung chat chi tiết* kèm theo nút "Quay lại" (Mũi tên trái) mượt mà như ứng dụng di động bản xứ.

---

## 🛠️ Hướng Dẫn Cài Đặt Hệ Thống (Dành Cho Lập Trình Viên)

Hệ thống được phát triển trên nền tảng **React (Vite)** cho Frontend và **Express.js** cho Backend, chạy toàn bộ trên ngôn ngữ **TypeScript**.

### 1. Chuẩn Bị Môi Trường
Yêu cầu máy tính của bạn đã cài đặt sẵn **Node.js** (Phiên bản v18 trở lên).

### 2. Cài Đặt Các Gói Phụ Thuộc
Tại thư mục gốc của dự án, mở cửa sổ dòng lệnh và chạy lệnh sau để tải các thư viện cần thiết:
```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường (`.env`)
Tạo một file `.env` mới tại thư mục gốc của dự án (hoặc sao chép từ file `.env.example`) và điền thông tin khoá API của bạn:
```env
# Khoá API Google Gemini (Bắt buộc để chạy các tính năng AI)
GEMINI_API_KEY=your_gemini_api_key_here

# Môi trường chạy (để mặc định khi chạy thử)
NODE_ENV=development
```

### 4. Chạy Dự Án Ở Chế Độ Phát Triển (Development)
Chạy lệnh bên dưới để khởi động đồng thời cả máy chủ Backend và máy chủ hiển thị giao diện Frontend:
```bash
npm run dev
```
Sau đó, mở trình duyệt và truy cập địa chỉ mặc định: [http://localhost:3000](http://localhost:3000)

### 5. Biên Dịch Và Đóng Gói Sản Phẩm (Production Build)
Để đóng gói và tối ưu hóa hệ thống để đưa lên máy chủ vận hành chính thức, hãy chạy lệnh:
```bash
# Biên dịch đóng gói dự án
npm run build

# Khởi chạy hệ thống sau khi biên dịch
npm run start
```

---

## 📘 Hướng Dẫn Kết Nối Fanpage Thực Tế

Để chuyển từ chế độ Demo sang chế độ hoạt động thực tế với trang Facebook cá nhân của bạn, hãy làm theo các bước sau:

1. **Truy cập Tab "Kết nối Trang":**
   * Tắt chế độ "Sử dụng dữ liệu Demo" ở góc trên bên phải màn hình.
2. **Cung cấp Mã Truy Cập (Access Token) & ID Trang:**
   * **Page Access Token:** Lấy mã truy cập của Trang từ trang Facebook Developer (Ứng dụng của bạn phải có quyền `pages_messaging`, `pages_read_engagement`, `pages_show_list`).
   * **Page ID:** ID của Fanpage bạn muốn quản lý.
   * Dán cả hai thông tin này vào khung kết nối và ấn **"Kết nối Fanpage"**.
3. **Sử dụng:**
   * Sau khi kết nối thành công, hệ thống sẽ chuyển sang trạng thái đèn xanh **LIVE FACEBOOK** ở thanh tiêu đề tab Messenger Inbox. Giờ đây bạn đã có thể nhắn tin thử nghiệm từ tài khoản cá nhân vào Fanpage để xem tin nhắn đồng bộ về trong 10 giây!

---

*Chúc bạn có những trải nghiệm tuyệt vời và bứt phá doanh số cùng Trợ lý quản lý Fanpage AI thông minh!*
