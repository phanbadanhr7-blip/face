# 📘 Hướng Dẫn Cài Đặt Và Sử Dụng Hệ Thống Quản Lý Fanpage Facebook & Trợ Lý AI

Chào mừng bạn đến với hệ thống quản lý Fanpage chuyên nghiệp tích hợp Trợ lý Trí tuệ nhân tạo (AI) thông minh từ Google Gemini. Hệ thống giúp bạn tối ưu hóa quy trình chăm sóc khách hàng, quản lý hộp thư tập trung, soạn thảo bài viết và tự động trả lời khách hàng 24/7 cực kỳ chuẩn xác.

---

## 🚀 Tính Năng Nổi Bật Hiện Có

### 1. 🔗 Kết Nối & Quản Lý Nhiều Trang & Tài Khoản Facebook (Multi-Account Support)
* **Kết nối đa tài khoản:** Hỗ trợ kết nối và nhận diện độc lập giữa nhiều tài khoản Facebook cá nhân hoặc doanh nghiệp khác nhau (ví dụ: Tài khoản Doanh nghiệp, Cá nhân, Spa/Mỹ phẩm...).
* **Xóa bộ nhớ & Đăng xuất (Clear Cache & Logout):** Tính năng cho phép xóa sạch toàn bộ dữ liệu kết nối cũ, giúp dễ dàng chuyển đổi sang tài khoản Facebook mới mà không bị xung đột dữ liệu.
* **Tự động nhận diện Tên Tài khoản:** Khi kết nối bằng Access Token hoặc đăng nhập OAuth, hệ thống sẽ tự động gọi API Graph (`/me`) để lấy chính xác **Họ & Tên của tài khoản Facebook cá nhân** quản lý và gán tương ứng, không còn bị cố định nhãn mặc định.
* **Tùy biến tên liên kết thủ công:** Cung cấp thêm ô nhập *Tên tài khoản Facebook (Cá nhân liên kết)* tại tab thêm thủ công để bạn dễ dàng phân nhóm và quản lý theo chủ sở hữu.
* **Bộ lọc Tài khoản thông minh:** Tích hợp bộ lọc tài khoản trực quan cho phép bạn xem nhanh các trang Fanpage thuộc sở hữu của từng tài khoản riêng biệt để dễ dàng kiểm soát.
* **Nhãn tài khoản trên toàn hệ thống:** Các tab Messenger, Tạo bài viết, AI Prompt và Báo cáo đều hỗ trợ hiển thị phân loại rõ ràng theo Trang và Tài khoản quản lý tương ứng.
* **Chế độ Demo/Live:** Hỗ trợ kết nối linh hoạt giữa chế độ **Live Facebook** (sử dụng Facebook Access Token và Page ID thật) và **Demo Mode** (chế độ trải nghiệm thử nghiệm).

### 2. 💬 Hộp Thư Messenger Inbox (Đồng bộ thời gian thực)
* **Đồng bộ ngầm tự động:** Chu kỳ tự động quét và tải tin nhắn mới từ Facebook mỗi 10 giây.
* **Đồng bộ thủ công:** Nút "Đồng bộ tin nhắn" nhanh giúp bạn chủ động nạp tin nhắn mới nhất ngay lập tức.
* **Cơ chế ẩn/xóa cuộc hội thoại thông minh:** 
  * Khi bạn bấm **Xóa hội thoại**, hệ thống sẽ ẩn tạm thời cuộc trò chuyện đó khỏi danh sách để làm sạch hộp thư.
  * **Tự động khôi phục (Auto-Restore):** Ngay khi khách hàng gửi một tin nhắn mới hoặc có hoạt động chat mới phát sinh, hệ thống sẽ tự động đối chiếu thông tin, gỡ hội thoại khỏi danh sách ẩn và đưa cuộc chat trở lại màn hình chính của bạn ngay lập tức.

### 3. 📍 Cấu Hình Thông Tin Liên Hệ Cửa Hàng / Fanpage
* **Thiết lập riêng biệt cho từng Fanpage:** Cho phép nhập và lưu trữ độc lập Địa chỉ cửa hàng, Hotline, Website, Giờ làm việc và Ghi chú khuyến mãi cho từng Fanpage khác nhau.
* **Đồng bộ hóa 1-Click vào Tri thức AI:** Ngay tại khung kịch bản AI, hệ thống hiển thị tóm tắt thông tin liên hệ của trang đang chọn và cung cấp nút **"Chèn nhanh vào Kiến thức"** giúp nạp toàn bộ thông tin chuẩn xác vào kịch bản AI chỉ trong 1 giây.

### 4. 🤖 Trợ Lý Trí Tuệ Nhân Tạo (AI Assistant - Gemini & Multi-Provider)
* **Tương thích đa nhà cung cấp cực kỳ linh hoạt (Multi-Provider):** Ngoài **Google Gemini** mặc định, hệ thống hỗ trợ tích hợp hoàn hảo với **OpenAI (ChatGPT)**, **Anthropic Claude**, **DeepSeek AI** và các **Nhà cung cấp tùy chỉnh** (Ollama, OpenRouter, LM Studio, TogetherAI, v.v.).
* **Tự động tải danh sách mô hình thực tế từ API (Dynamic Model Fetching):** Đối với các máy chủ tùy chỉnh, hệ thống hỗ trợ nút 🔄 **"Tải danh sách mô hình"** kết nối trực tiếp đến endpoint `${BaseURL}/models` để tự động nạp toàn bộ danh sách các mô hình đang hoạt động trên máy chủ của bạn để bạn chọn nhanh chỉ bằng 1 nhấp chuột.
* **Chế độ tự động phản hồi (Autopilot):** Khi kích hoạt, AI sẽ thay thế bạn tự động phân tích câu hỏi của khách hàng trên Messenger và phản hồi ngay lập tức 24/7.

### 4. 🧠 Phòng Thiết Lập Kịch Bản & Gợi Ý AI (AI Prompt & Persona Studio)
* **Thư viện mẫu lĩnh vực kinh doanh (Niche Templates):** Tự động khởi tạo cấu trúc tri thức và từ vựng chuyên môn cho các ngành hàng: *Máy tính & Công nghệ (Sửa chữa, cài win dạo, ổ SSD)*, *Thời trang & Mỹ phẩm*, *Bất động sản & Villa*, *Nhà hàng & Quán ăn*, *Spa & Thẩm mỹ viện*, hay *Tự cấu hình (Custom)*.
* **Bộ nhớ ngữ cảnh & Giọng điệu thông minh:**
  * Điều chỉnh linh hoạt số lượng tin nhắn quá khứ mà AI ghi nhớ để duy trì cuộc hội thoại liên tục (lên tới 20 tin nhắn gần nhất).
  * Chuyển đổi giọng điệu linh hoạt theo mục đích: *Lịch sự/Chuyên nghiệp (Standard)*, *Chốt đơn (Sales)*, *Hài hước/Trẻ trung (Playful)*, và *Ân cần hỗ trợ (Support)*.
* **Nạp tri thức độc quyền (Knowledge Base):** Khung nạp dữ liệu chi tiết về địa chỉ, bảng giá dịch vụ, số điện thoại nóng... giúp Trợ lý AI trả lời khách hàng chuẩn xác 100%, không lo đoán mò hay trả lời sai lệch thông tin.
* **Phòng thử nghiệm giả lập (Playground):** Cung cấp hộp thử nghiệm giả lập cục bộ nằm bên phải màn hình để bạn nhập tin nhắn của khách hàng giả lập và xem trước câu trả lời của AI một cách trực quan, mượt mà trước khi áp dụng thực tế.

### 5. 📝 Tạo Bài Viết Fanpage Tự Động Bằng AI
* Chỉ cần nhập ý tưởng ngắn gọn, trợ lý AI sẽ tự động soạn thảo và biên tập các bài viết chất lượng cao đầy thu hút (bao gồm cả tiêu đề, nội dung chi tiết và các hashtag xu hướng).

### 6. 📊 Quản lý & Thống kê Bài viết Chuẩn xác (Post Analytics & Metrics)
* **Thông số thực tế bắt đầu từ 0:** Đã loại bỏ hoàn toàn các thông số ngẫu nhiên mặc định cho bài viết mới. Mọi chỉ số (Xem bài, Tiếp cận, Thích, Bình luận, Chia sẻ) đều được thiết lập về `0` và chỉ bắt đầu tính thực tế kể từ thời điểm bài viết được xuất bản chính thức lên Facebook.
* **Tích hợp chỉ số Chia sẻ (Shares):** Hiển thị rõ ràng số lượt chia sẻ của từng bài viết trực tiếp trên giao diện danh sách, giúp tính toán Tỷ lệ tương tác chính xác 100% so với thông số tổng hợp trên bảng báo cáo.

### 7. 📱 Thiết Kế Tương Thích Di Động Tuyệt Đối (Responsive Mobile First)
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
