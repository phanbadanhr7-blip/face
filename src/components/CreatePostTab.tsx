import React, { useState, useEffect } from "react";
import { FacebookPage, FacebookPost } from "../types";
import { 
  Sparkles, 
  Send, 
  Calendar, 
  Save, 
  Image as ImageIcon, 
  Globe, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Clock, 
  HelpCircle,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronRight
} from "lucide-react";

interface CreatePostTabProps {
  pages: FacebookPage[];
  isDemoMode: boolean;
  onAddPost: (post: Omit<FacebookPost, "id" | "publishedAt" | "fbPostId" | "error">) => Promise<{ success: boolean; fbPostId?: string; error?: string; isSimulated?: boolean }>;
}

const PRESET_IMAGES = [
  { name: "Computer Hardware", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80" },
  { name: "Workspace Tech", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80" },
  { name: "AI Tech Sphere", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
  { name: "Tech Presentation", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80" },
];

const PRESET_EMOJIS = ["🚀", "🔥", "💻", "✨", "🎉", "🔥", "⚠️", "👍", "❤️", "🔔", "⭐", "📦", "💯"];

export default function CreatePostTab({ pages, isDemoMode, onAddPost }: CreatePostTabProps) {
  const defaultPage = pages.find(p => p.isDefault) || pages[0];
  
  // State
  const [selectedPageId, setSelectedPageId] = useState(defaultPage?.id || "");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  
  // AI Panel State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("Exciting 🚀");
  const [aiLanguage, setAiLanguage] = useState("Vietnamese 🇻🇳");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccessMessage, setAiSuccessMessage] = useState("");

  // Publish Status
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (defaultPage && !selectedPageId) {
      setSelectedPageId(defaultPage.id);
    }
  }, [defaultPage, selectedPageId]);

  const selectedPage = pages.find(p => p.id === selectedPageId) || defaultPage;

  // AI Generation with server-side Gemini endpoint
  const handleAiGenerate = async (action: 'create' | 'improve' | 'hashtags' | 'translate') => {
    if (action === 'create' && !aiPrompt.trim()) {
      setAiError("Please provide a prompt describing what you want the post to be about.");
      return;
    }
    if (action !== 'create' && !message.trim()) {
      setAiError("Please enter some text in the main post editor first so the AI can analyze it.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiSuccessMessage("");

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          prompt: aiPrompt,
          currentText: message,
          tone: aiTone,
          language: aiLanguage
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate AI content.");
      }

      if (action === 'hashtags') {
        setMessage(prev => prev ? `${prev}\n\n${data.text}` : data.text);
        setAiSuccessMessage("Hashtags generated and added to the end of your post!");
      } else {
        setMessage(data.text);
        setAiSuccessMessage(`Post successfully ${action === 'create' ? 'generated' : action === 'improve' ? 'improved' : 'translated'}!`);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong while talking to Gemini.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handlePostSubmit = async (status: 'draft' | 'scheduled' | 'published') => {
    if (!selectedPageId) {
      setPublishStatus({ type: "error", message: "Please connect and select a Facebook Page." });
      return;
    }
    if (!message.trim()) {
      setPublishStatus({ type: "error", message: "Please enter some text for your Facebook post." });
      return;
    }
    if (status === 'scheduled' && !scheduledDate) {
      setPublishStatus({ type: "error", message: "Please select a date and time to schedule this post." });
      return;
    }

    setPublishing(true);
    setPublishStatus(null);

    try {
      const response = await onAddPost({
        pageId: selectedPage.id,
        pageName: selectedPage.name,
        pagePicture: selectedPage.picture,
        message,
        mediaUrl: mediaUrl.trim() || null,
        scheduledAt: status === 'scheduled' ? new Date(scheduledDate).toISOString() : null,
        status,
      });

      if (response.success) {
        setPublishStatus({
          type: "success",
          message: status === 'published' 
            ? `Successfully posted to Facebook Page ${selectedPage.name}! ${response.isSimulated ? '(Simulated Mode)' : ''}`
            : status === 'scheduled'
            ? `Post successfully scheduled for ${new Date(scheduledDate).toLocaleString()}!`
            : "Post saved as Draft in your queue."
        });

        // Clear only if successfully published or scheduled
        if (status !== 'draft') {
          setMessage("");
          setMediaUrl("");
          setScheduledDate("");
          setIsScheduling(false);
        }
      } else {
        setPublishStatus({
          type: "error",
          message: response.error || "Failed to submit post."
        });
      }
    } catch (err: any) {
      setPublishStatus({
        type: "error",
        message: err.message || "An unexpected error occurred."
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 font-sans">
      {/* Editor & AI Panel (Left) */}
      <div className="xl:col-span-7 space-y-6">
        
        {/* Connection Quick Picker */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Kênh Facebook đăng tải bài viết
          </label>
          {pages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  type="button"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    selectedPageId === page.id
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <img src={page.picture} alt={page.name} className="w-5 h-5 rounded-md object-cover" />
                  <span>{page.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-rose-600 font-medium">
              Không tìm thấy kết nối Fanpage nào khả dụng. Vui lòng cấu hình trang trước trong tab Kênh Kết Nối.
            </p>
          )}
        </div>

        {/* Post Message Editor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Trình soạn thảo bài viết Facebook</span>
            <span className="text-xs text-slate-400 font-medium">{message.length} ký tự</span>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bạn đang nghĩ gì? Hãy soạn thảo nội dung hoặc sử dụng công cụ Trợ lý Gemini AI bên dưới..."
            className="w-full h-44 p-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-hidden resize-none transition-all leading-relaxed placeholder:text-slate-400"
          />

          {/* Quick Emoji Clicker */}
          <div className="flex items-center flex-wrap gap-1.5 pt-1">
            <span className="text-xs font-medium text-slate-400 mr-1 select-none">Chèn nhanh Emojis:</span>
            {PRESET_EMOJIS.map((e, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddEmoji(e)}
                className="w-7 h-7 text-xs bg-slate-50 hover:bg-slate-200 border border-slate-100 rounded-md transition-colors flex items-center justify-center cursor-pointer"
              >
                {e}
              </button>
            ))}
          </div>

          {/* Image media link */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                Đính kèm link hình ảnh (URL)
              </label>
              {mediaUrl && (
                <button 
                  onClick={() => setMediaUrl("")} 
                  className="text-[10px] text-rose-600 font-semibold hover:underline"
                >
                  Gỡ ảnh đính kèm
                </button>
              )}
            </div>
            
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://vi-du-website.com/hinh-anh.jpg"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
            />

            {/* Quick Presets Grid */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Hình ảnh mẫu gợi ý nhanh</p>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_IMAGES.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMediaUrl(img.url)}
                    type="button"
                    className="relative h-10 w-full rounded-md overflow-hidden border border-slate-100 group cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-all group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] text-white font-bold">Chọn</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gemini AI Writing Assistant (Using compliant server-side model pattern) */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm space-y-4 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-wide text-blue-400 flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4" />
              Trợ lý Sáng tạo Nội dung Gemini AI
            </h3>
            <span className="text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-600/20 px-2 py-0.5 rounded">
              Sẵn sàng
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Nhập các từ khóa chính hoặc ý tưởng, chọn giọng điệu và ngôn ngữ để tự động tạo ra bài viết Facebook chuyên nghiệp với đầy đủ biểu tượng cảm xúc và hashtag hấp dẫn.
          </p>

          <div className="space-y-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Bạn muốn viết về chủ đề gì? (Ví dụ: Cửa hàng Máy Tính Mũi Né sửa chữa laptop lấy liền giảm giá 15% ngày hè)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giọng điệu</label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-xs rounded-lg text-white focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Exciting 🚀">Hào hứng 🚀</option>
                  <option value="Professional 💼">Chuyên nghiệp 💼</option>
                  <option value="Friendly 😊">Thân thiện 😊</option>
                  <option value="Urgent ⚠️">Khẩn cấp ⚠️</option>
                  <option value="Humorous 🎭">Hài hước 🎭</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ngôn ngữ</label>
                <select
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-xs rounded-lg text-white focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Vietnamese 🇻🇳">Tiếng Việt 🇻🇳</option>
                  <option value="English 🇺🇸">Tiếng Anh 🇺🇸</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleAiGenerate('create')}
                disabled={aiLoading}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Tạo bài viết bằng AI</span>
              </button>

              <button
                type="button"
                onClick={() => handleAiGenerate('improve')}
                disabled={aiLoading || !message.trim()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs border border-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Tối ưu và nâng cấp bản thảo bài viết hiện tại"
              >
                <span>Tối ưu bản thảo</span>
              </button>

              <button
                type="button"
                onClick={() => handleAiGenerate('hashtags')}
                disabled={aiLoading || !message.trim()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs border border-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Tạo các thẻ hashtag dựa trên bản thảo hiện tại"
              >
                <span>Thêm Hashtags</span>
              </button>

              <button
                type="button"
                onClick={() => handleAiGenerate('translate')}
                disabled={aiLoading || !message.trim()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs border border-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Dịch sang {aiLanguage.includes('English') ? 'Tiếng Anh' : 'Tiếng Việt'}</span>
              </button>
            </div>

            {/* AI Action feedback messages */}
            {aiError && (
              <div className="p-3 bg-red-900/40 border border-red-800/50 text-red-200 text-xs rounded-lg flex items-start gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}
            {aiSuccessMessage && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 text-xs rounded-lg flex items-start gap-2 animate-in slide-in-from-top-1">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Settings & Action Buttons */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsScheduling(!isScheduling)}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-slate-800 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{isScheduling ? "Tắt hẹn giờ" : "Hẹn giờ đăng tải"}</span>
            </button>
            
            <span className="text-[10px] text-slate-400">
              {isScheduling ? "Tự chọn thời gian đăng bài" : "Sẽ xuất bản ngay lập tức"}
            </span>
          </div>

          {isScheduling && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3 animate-in fade-in duration-150">
              <Clock className="w-4 h-4 text-slate-400" />
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-transparent border-0 text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-0"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}

          {/* Action Alerts */}
          {publishStatus && (
            <div className={`p-4 rounded-lg flex items-start gap-3 text-xs ${
              publishStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {publishStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <p className="font-semibold">{publishStatus.type === 'success' ? 'Hoàn tất thao tác' : 'Thao tác thất bại'}</p>
                <p className="mt-0.5 leading-relaxed">{publishStatus.message}</p>
              </div>
            </div>
          )}

          {/* Action Buttons trigger */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            {isScheduling ? (
              <button
                type="button"
                onClick={() => handlePostSubmit('scheduled')}
                disabled={publishing}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                <span>Lên lịch đăng lên Fanpage</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handlePostSubmit('published')}
                disabled={publishing}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Đăng Lên Facebook Ngay</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handlePostSubmit('draft')}
              disabled={publishing}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-400" />
              <span>Lưu Bản Nháp</span>
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Mock Facebook Live Preview (Right) */}
      <div className="xl:col-span-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Xem trước bài đăng Facebook</h3>
        
        {/* Mock iPhone/Desktop Post Frame */}
        <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 shadow-inner flex justify-center">
          <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden border border-slate-200/60 font-sans">
            
            {/* Page header metadata */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPage?.picture || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60"}
                  alt={selectedPage?.name || "Target Page"}
                  className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60";
                  }}
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight flex items-center gap-1 hover:underline cursor-pointer">
                    {selectedPage?.name || "Tên Trang Kênh Kết Nối"}
                    <span className="w-3.5 h-3.5 bg-blue-500 rounded-full text-white flex items-center justify-center text-[8px] font-bold" title="Trang Đã Xác Minh">✓</span>
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <span>
                      {isScheduling && scheduledDate 
                        ? `Lên lịch lúc: ${new Date(scheduledDate).toLocaleDateString()}` 
                        : "Vừa xong"}
                    </span>
                    <span>·</span>
                    <Globe className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </div>
              
              <button className="text-slate-400 hover:text-slate-600 text-sm font-bold tracking-wider px-2">•••</button>
            </div>

            {/* Post text message */}
            <div className="px-4 pb-3">
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {message || (
                  <span className="text-slate-400 italic">
                    Nhập nội dung bài đăng ở bảng điều khiển bên trái hoặc sử dụng tính năng "Tạo bài bằng AI" để xem trước hiển thị thực tế tại đây...
                  </span>
                )}
              </p>
            </div>

            {/* Attached Image section */}
            {mediaUrl && (
              <div className="border-y border-slate-100 bg-slate-50 overflow-hidden max-h-[350px] flex items-center justify-center">
                <img 
                  src={mediaUrl} 
                  alt="Post attachment preview" 
                  className="w-full h-full object-cover max-h-[350px]"
                  onError={(e) => {
                    // Soft error fallback
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Mock Reactions Stats bar */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  <span className="w-4 h-4 bg-blue-500 rounded-full text-white flex items-center justify-center text-[9px]">👍</span>
                  <span className="w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center text-[9px]">❤️</span>
                </div>
                <span>Ba Danh và 18 người khác</span>
              </div>
              <div className="space-x-3">
                <span>3 bình luận</span>
                <span>1 chia sẻ</span>
              </div>
            </div>

            {/* Interaction Buttons (Like, Comment, Share) */}
            <div className="px-2 py-1.5 flex items-center justify-between text-slate-600 text-xs font-semibold">
              <button className="flex-1 py-1.5 hover:bg-slate-100 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <ThumbsUp className="w-4 h-4" />
                <span>Thích</span>
              </button>
              <button className="flex-1 py-1.5 hover:bg-slate-100 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span>Bình luận</span>
              </button>
              <button className="flex-1 py-1.5 hover:bg-slate-100 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Share2 className="w-4 h-4" />
                <span>Chia sẻ</span>
              </button>
            </div>

          </div>
        </div>

        {/* Guidelines alert box */}
        <div className="p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-200/60 text-xs space-y-1.5">
          <p className="font-bold flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            Lưu ý về hẹn giờ đăng
          </p>
          <p className="leading-relaxed">
            Trong <strong>Chế độ Mô phỏng (Demo)</strong>, các bài đăng lên lịch được lưu vào hàng đợi và có thể kích hoạt đăng bất cứ lúc nào. Trong <strong>Chế độ Hoạt động Thật</strong>, bài đăng cần cơ chế cron tự động để xuất bản đúng giờ hoặc đăng thủ công từ hàng đợi.
          </p>
        </div>
      </div>
    </div>
  );
}
