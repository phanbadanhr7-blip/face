import React from "react";
import { Key, ShieldAlert, CheckCircle2, ChevronRight, ExternalLink, HelpCircle, Code } from "lucide-react";

export default function HelpGuideTab() {
  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hướng Dẫn Cấu Hình API Kết Nối</h1>
        <p className="text-sm text-slate-500 mt-1">
          Thực hiện các bước sau để kết nối các Fanpage thực tế và đăng tải trực tiếp từ phần mềm này
        </p>
      </div>

      {/* Intro box */}
      <div className="p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-200/60 text-xs space-y-1.5 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">Hỗ trợ đăng tải trực tiếp lên Facebook thật!</p>
          <p className="mt-1">
            Hệ thống hỗ trợ song song hai chế độ: <strong>Chế độ Mô phỏng</strong> (hiển thị mô phỏng kết quả) và <strong>Chế độ Hoạt động Thật (Live API Mode)</strong>. Khi ở chế độ Live, máy chủ của chúng tôi sẽ gửi yêu cầu trực tiếp, bảo mật đến Facebook Graph API để đăng nội dung bài viết của bạn.
          </p>
        </div>
      </div>

      {/* Setup Steps Timeline */}
      <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        
        {/* Step 1 */}
        <div className="flex gap-4 relative">
          <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-xs">
            1
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              Tạo tài khoản nhà phát triển Facebook Developer
              <a 
                href="https://developers.facebook.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                developers.facebook.com <ExternalLink className="w-3 h-3" />
              </a>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Đăng nhập vào nền tảng Meta Developer và đăng ký tài khoản nhà phát triển của bạn. Tạo một Ứng dụng mới (Chọn loại ứng dụng &ldquo;Doanh nghiệp - Business&rdquo; hoặc &ldquo;Khác - Other&rdquo; để có quyền truy cập vào các API quản lý Trang).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4 relative">
          <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-xs">
            2
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              Tìm ID Trang Facebook (Page ID)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Truy cập vào Trang Facebook (Fanpage) của bạn, nhấp vào tab **Giới thiệu**, chọn mục **Tính minh bạch của trang**. Tại đây bạn sẽ thấy dãy số **ID Trang** duy nhất (ví dụ: `102495818375`). Hãy sao chép ID này.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4 relative">
          <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-xs">
            3
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              Tạo mã truy cập trang (Page Access Token)
              <a 
                href="https://developers.facebook.com/tools/explorer/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                Trình khám phá Graph API <ExternalLink className="w-3 h-3" />
              </a>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trong cổng thông tin nhà phát triển Meta, đi tới công cụ **Graph API Explorer** (Trình khám phá Graph API).
            </p>
            <ul className="list-disc list-inside pl-1 text-[11px] text-slate-500 space-y-1">
              <li>Chọn Ứng dụng Facebook của bạn ở góc trên bên phải.</li>
              <li>Ở phần User or Page, chọn mục **Get Page Access Token** (Lấy mã truy cập trang).</li>
              <li>Thêm các quyền bắt buộc sau: <code className="px-1.5 py-0.5 bg-slate-100 font-mono text-slate-700 rounded">pages_manage_posts</code>, <code className="px-1.5 py-0.5 bg-slate-100 font-mono text-slate-700 rounded">pages_read_engagement</code>, và <code className="px-1.5 py-0.5 bg-slate-100 font-mono text-slate-700 rounded">pages_show_list</code>.</li>
              <li>Nhấp **Generate Access Token**, thực hiện xác thực và sao chép chuỗi mã bắt đầu bằng <code className="font-mono text-xs">EAA...</code>.</li>
            </ul>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-4 relative">
          <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-xs">
            4
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-sm">
              Lưu kết nối trong Bảng Điều Khiển
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vào mục **Kênh Kết Nối** trong ứng dụng này, nhấp chọn **Thêm Kênh Kết Nối Mới**, điền Tên Fanpage tùy ý, ID Trang và dán **Mã truy cập trang** bạn vừa tạo vào. Nhấn lưu lại.
            </p>
          </div>
        </div>

        {/* Step 5 */}
        <div className="flex gap-4 relative">
          <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-xs">
            5
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-sm">
              Kích hoạt chế độ đăng bài thật (Live Mode)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bật công tắc chọn chế độ ở thanh bên trái sang **Live API**. Giờ đây, mỗi khi bạn soạn bài đăng và bấm **Đăng Lên Facebook Ngay**, bài đăng sẽ được tải lên Fanpage thực tế của bạn ngay lập tức!
            </p>
          </div>
        </div>

      </div>

      {/* Webhook Setup Guide Box */}
      <div className="bg-white p-5 rounded-xl border border-blue-200/80 shadow-xs space-y-4 mt-6">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-600" />
          Cấu hình Webhooks Facebook (Nhận tin nhắn & Auto AI tức thì)
        </h3>
        
        <p className="text-xs text-slate-600 leading-relaxed">
          Để ứng dụng tự động nhận tin nhắn khách hàng gửi đến Fanpage theo thời gian thực mà không cần bấm F5 hoặc tải lại, bạn cấu hình Webhooks trong Meta Developer:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">URL Gọi Lại (Callback URL)</span>
            <div className="font-mono text-xs text-blue-700 bg-white p-2 border rounded border-slate-200 select-all break-all">
              https://ais-dev-qv2ignianzzncmdt66dz5z-876098673256.asia-southeast1.run.app/api/webhooks/facebook
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mã Xác Minh (Verify Token)</span>
            <div className="font-mono text-xs text-emerald-700 bg-white p-2 border rounded border-slate-200 select-all">
              maytinhmuine_secret_token_123
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-1">
          <p className="font-semibold text-blue-900">📌 Các trường cần đăng ký (Subscribed Fields):</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
            <li><code className="text-blue-700 font-mono">messages</code> — Nhận tin nhắn chat của khách</li>
            <li><code className="text-blue-700 font-mono">messaging_postbacks</code> — Nhận sự kiện bấm nút nhanh</li>
            <li><code className="text-blue-700 font-mono">feed</code> — Nhận thông báo bình luận/bài viết mới</li>
          </ul>
        </div>
      </div>

      {/* API Reference Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 pt-6 mt-8">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <Code className="w-4 h-4 text-slate-400" />
          Thông số kỹ thuật SDK & Graph API tương tác
        </h3>
        
        <p className="text-xs text-slate-500 leading-relaxed">
          Máy chủ xử lý xác thực mã bảo mật an toàn, gửi gói tin kèm nội dung và tệp đính kèm qua các cổng chính thống để bảo vệ thông tin đăng nhập của bạn:
        </p>

        <div className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-[10px] space-y-1">
          <p className="text-sky-400"># Với bài viết chỉ có chữ:</p>
          <p>POST https://graph.facebook.com/v18.0/&lt;page_id&gt;/feed</p>
          <p className="text-slate-400">body: &#123; message: message, access_token: token &#125;</p>
          
          <p className="text-sky-400 mt-3"># Với bài viết kèm liên kết hình ảnh:</p>
          <p>POST https://graph.facebook.com/v18.0/&lt;page_id&gt;/photos</p>
          <p className="text-slate-400">body: &#123; url: mediaUrl, caption: message, access_token: token &#125;</p>
        </div>
      </div>
    </div>
  );
}
