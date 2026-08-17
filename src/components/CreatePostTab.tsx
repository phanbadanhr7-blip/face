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
  Wand2,
  Layers,
  Upload,
  FolderHeart,
  Bold,
  Italic,
  List,
  Flame,
  PhoneCall,
  MapPin,
  Tag,
  Check,
  RotateCcw,
  Sparkle,
  MessageSquare,
  FileText,
  Copy,
  ChevronDown,
  Info,
  X,
  Video,
  Film
} from "lucide-react";
import { toUnicodeBold, toUnicodeItalic, STOCK_GALLERY_IMAGES } from "../utils/textFormatter";
import ImageStudioModal from "./ImageStudioModal";
import VideoStudioModal from "./VideoStudioModal";

interface CreatePostTabProps {
  pages: FacebookPage[];
  posts?: FacebookPost[];
  isDemoMode: boolean;
  onAddPost: (post: Omit<FacebookPost, "id" | "publishedAt" | "fbPostId" | "error">) => Promise<{ success: boolean; fbPostId?: string; error?: string; isSimulated?: boolean }>;
}

// Preset quick templates
const POST_TEMPLATES = [
  {
    id: "sale",
    name: "🛍️ Khuyến Mãi / Giảm Giá",
    template: `🔥 【SIÊU SALE CÔNG NGHỆ - GIẢM ĐẾN 30%】 🔥\n\n👉 Cơ hội vàng nâng cấp thiết bị với giá cực ưu đãi chỉ trong tuần này!\n\n✅ Giảm giá 30% phí vệ sinh & tra keo tản nhiệt Laptop - PC\n✅ Tặng lót chuột Gaming cao cấp khi nâng cấp SSD\n✅ Cài đặt phần mềm, diệt virus và tối ưu tốc độ máy\n\n⏰ Thời gian áp dụng: Từ hôm nay đến hết Chủ Nhật.\n📍 Địa chỉ: MÁY TÍNH MŨI NÉ - Phan Thiết\n📞 Hotline/Zalo: 0905.xxx.xxx để đặt lịch giữ ưu đãi ngay!`
  },
  {
    id: "repair",
    name: "🔧 Dịch Vụ Sửa Chữa & Cài Đặt",
    template: `⚡ DỊCH VỤ SỬA CHỮA & CÀI ĐẶT LAPTOP - PC UY TÍN TẠI MŨI NÉ ⚡\n\nMáy tính của bạn đang gặp các tình trạng:\n❌ Máy chạy chậm, khởi động lâu hoặc bị đơ lag?\n❌ Quạt kêu to, nhiệt độ máy quá nóng?\n❌ Lỗi màn hình xanh, virus, lỗi Windows?\n\n👉 ĐỪNG LO! Hãy mang máy đến ngay MÁY TÍNH MŨI NÉ:\n🔹 Kiểm tra lỗi phần cứng & tư vấn miễn phí\n🔹 Sửa chữa minh bạch, khách xem trực tiếp lấy liền\n🔹 Linh kiện chính hãng, bảo hành chu đáo 12 - 24 tháng\n\n💬 Inbox ngay Fanpage hoặc gọi Hotline để được hỗ trợ tận tâm!`
  },
  {
    id: "tip",
    name: "💡 Mẹo & Thủ Thuật Máy Tính",
    template: `💡 【MẸO CÔNG NGHỆ】 3 Bước Đơn Giản Giúp Laptop Chạy Nhanh Như Mới!\n\nSau một thời gian sử dụng, máy tính thường tích tụ nhiều file rác và ứng dụng chạy ngầm. Hãy áp dụng ngay 3 mẹo sau:\n\n1️⃣ Dọn dẹp ổ đĩa C: Nhấn Windows + R > gõ "temp" và "%temp%" > Xóa toàn bộ file rác.\n2️⃣ Tắt ứng dụng khởi động cùng Windows trong Task Manager (Startup apps).\n3️⃣ Nâng cấp ổ cứng SSD: Tăng tốc độ mở máy và ứng dụng lên gấp 5 lần so với HDD cũ.\n\n📌 Nếu cần hỗ trợ kỹ thuật, hãy gửi tin nhắn cho shop để được giải đáp miễn phí nhé!`
  },
  {
    id: "product",
    name: "🚀 Giới Thiệu Sản Phẩm / PC Mới",
    template: `🎮 VỪA VỀ HÀNG: Cấu hình PC Gaming Esport & Đồ họa cực đỉnh!\n\nChiến mượt mà mọi tựa game hot hiện nay (VALORANT, LOL, FO4, PUBG, GTA V) và render đồ họa mượt mà:\n\n✅ CPU: Intel Core i5 thế hệ mới hiệu năng mạnh mẽ\n✅ RAM: 16GB Dual Channel đa nhiệm mượt mà\n✅ SSD: 512GB NVMe tốc độ cao đọc ghi siêu tốc\n✅ VGA: Đồ họa rời chiến game mát mẻ\n✅ Case kính cường lực + Fan LED RGB đổi màu lung linh\n\n🎁 QUÀ TẶNG: Bàn phím cơ + Chuột gaming + Lót chuột size lớn!\n👉 Inbox ngay để nhận báo giá chi tiết và khuyến mãi kèm theo!`
  }
];

// Emoji Categories
const EMOJI_CATEGORIES = {
  sale: ["🔥", "⚡", "💥", "🎁", "🏷️", "💯", "🚀", "🏆", "💎", "📦"],
  tech: ["💻", "🖥️", "📱", "⌨️", "🖱️", "🎮", "⚙️", "🔧", "💾", "🔌"],
  cta: ["👉", "📌", "📍", "📞", "💬", "📩", "🎯", "🔔", "⏳", "✅"],
  reactions: ["⭐", "🌟", "✨", "😍", "😎", "👏", "👍", "❤️", "🤝", "🎉"]
};

export default function CreatePostTab({ pages, posts = [], isDemoMode, onAddPost }: CreatePostTabProps) {
  const defaultPage = pages.find(p => p.isDefault) || pages[0];
  
  // State
  const [selectedPageId, setSelectedPageId] = useState(defaultPage?.id || "");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  // AI Knowledge Base State
  const [knowledgeList, setKnowledgeList] = useState<Array<{ id: string; message: string; addedAt: string }>>([]);
  const [showPostPicker, setShowPostPicker] = useState(false);
  const [knowledgeSuccess, setKnowledgeSuccess] = useState("");

  // Load knowledge list when selected page changes
  useEffect(() => {
    if (!selectedPageId) return;
    const knowledgeKey = `fb_page_ai_knowledge_${selectedPageId}`;
    const saved = localStorage.getItem(knowledgeKey);
    if (saved) {
      try {
        setKnowledgeList(JSON.parse(saved));
      } catch (e) {
        console.error("Error reading knowledge:", e);
        setKnowledgeList([]);
      }
    } else {
      setKnowledgeList([]);
    }
    setKnowledgeSuccess("");
  }, [selectedPageId]);

  // Helper to save knowledge list to localstorage
  const saveKnowledgeToStorage = (list: Array<{ id: string; message: string; addedAt: string }>) => {
    if (!selectedPageId) return;
    const knowledgeKey = `fb_page_ai_knowledge_${selectedPageId}`;
    localStorage.setItem(knowledgeKey, JSON.stringify(list));
    setKnowledgeList(list);
  };

  // Action: Add current message to AI knowledge
  const handleAddCurrentAsKnowledge = () => {
    if (!message.trim()) {
      alert("Nội dung bài viết đang trống. Vui lòng viết nội dung trước khi dùng làm kiến thức AI.");
      return;
    }
    const newKnowledge = {
      id: "kw_" + Math.random().toString(36).substring(2, 9),
      message: message.trim(),
      addedAt: new Date().toISOString()
    };
    const updated = [newKnowledge, ...knowledgeList];
    saveKnowledgeToStorage(updated);
    setKnowledgeSuccess("Đã thêm bài viết này vào bộ nhớ Trợ lý AI thành công!");
    setTimeout(() => setKnowledgeSuccess(""), 4000);
  };

  // Action: Add an existing post as AI knowledge
  const handleAddExistingAsKnowledge = (postText: string) => {
    if (!postText.trim()) return;
    // Check if already exists in list to avoid duplicates
    const isDuplicate = knowledgeList.some(k => k.message === postText.trim());
    if (isDuplicate) {
      alert("Nội dung bài viết này đã có sẵn trong cơ sở kiến thức AI rồi.");
      return;
    }
    const newKnowledge = {
      id: "kw_" + Math.random().toString(36).substring(2, 9),
      message: postText.trim(),
      addedAt: new Date().toISOString()
    };
    const updated = [newKnowledge, ...knowledgeList];
    saveKnowledgeToStorage(updated);
    setShowPostPicker(false);
    setKnowledgeSuccess("Đã thêm bài viết được chọn vào bộ nhớ Trợ lý AI thành công!");
    setTimeout(() => setKnowledgeSuccess(""), 4000);
  };

  // Action: Remove a knowledge piece
  const handleRemoveKnowledge = (id: string) => {
    const updated = knowledgeList.filter(k => k.id !== id);
    saveKnowledgeToStorage(updated);
  };
  
  // Image Studio Modal state
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState(false);

  // AI Panel State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("Exciting 🚀");
  const [aiLanguage, setAiLanguage] = useState("Vietnamese 🇻🇳");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccessMessage, setAiSuccessMessage] = useState("");

  // Smart Tool dropdown / result
  const [smartToolResults, setSmartToolResults] = useState<string[]>([]);
  const [smartToolType, setSmartToolType] = useState<string>("");
  const [isSmartToolLoading, setIsSmartToolLoading] = useState(false);

  // Emoji tab state
  const [emojiTab, setEmojiTab] = useState<'sale' | 'tech' | 'cta' | 'reactions'>('sale');

  // Publish Status
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (defaultPage && !selectedPageId) {
      setSelectedPageId(defaultPage.id);
    }
  }, [defaultPage, selectedPageId]);

  const selectedPage = pages.find(p => p.id === selectedPageId) || defaultPage;

  // Formatting helpers
  const handleFormatBold = () => {
    const textarea = document.getElementById("fb-post-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = message.substring(start, end);
    if (selected) {
      const bolded = toUnicodeBold(selected);
      const newText = message.substring(0, start) + bolded + message.substring(end);
      setMessage(newText);
    } else {
      const sample = toUnicodeBold("NỘI DUNG IN ĐẬM");
      setMessage(prev => prev + " " + sample);
    }
  };

  const handleFormatItalic = () => {
    const textarea = document.getElementById("fb-post-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = message.substring(start, end);
    if (selected) {
      const italicized = toUnicodeItalic(selected);
      const newText = message.substring(0, start) + italicized + message.substring(end);
      setMessage(newText);
    } else {
      const sample = toUnicodeItalic("nội dung in nghiêng");
      setMessage(prev => prev + " " + sample);
    }
  };

  const handleInsertSnippet = (snippet: string) => {
    setMessage(prev => prev ? `${prev}\n${snippet}` : snippet);
  };

  // AI Generation
  const handleAiGenerate = async (action: 'create' | 'improve' | 'hashtags' | 'translate') => {
    if (action === 'create' && !aiPrompt.trim()) {
      setAiError("Vui lòng nhập mô tả chủ đề bạn muốn tạo bài viết.");
      return;
    }
    if (action !== 'create' && !message.trim()) {
      setAiError("Vui lòng nhập nội dung bài viết trước để AI có thể phân tích.");
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
        throw new Error(data.error || "Không thể tạo nội dung với Gemini AI.");
      }

      if (action === 'hashtags') {
        setMessage(prev => prev ? `${prev}\n\n${data.text}` : data.text);
        setAiSuccessMessage("Đã sinh 10 Hashtags phù hợp và chèn vào cuối bài viết!");
      } else {
        setMessage(data.text);
        setAiSuccessMessage(`Đã ${action === 'create' ? 'tạo bài viết' : action === 'improve' ? 'tối ưu' : 'dịch'} thành công!`);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Đã xảy ra lỗi khi kết nối với Gemini AI.");
    } finally {
      setAiLoading(false);
    }
  };

  // Smart Tool Actions (Headlines, CTAs, Tips, Sales Transform)
  const handleRunSmartTool = async (toolType: 'headlines' | 'cta' | 'sales_transform' | 'tech_tip') => {
    const inputContent = message.trim() || aiPrompt.trim() || "Máy tính Mũi Né dịch vụ sửa chữa laptop uy tín";
    setIsSmartToolLoading(true);
    setSmartToolType(toolType);
    setSmartToolResults([]);

    try {
      const response = await fetch("/api/gemini/smart-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType,
          input: inputContent
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Lỗi khi gọi Smart Tool");
      }

      if (toolType === "headlines" || toolType === "cta") {
        const lines = (data.result || "")
          .split("\n")
          .map((l: string) => l.replace(/^[0-9]+[\.\)\-]\s*/, '').trim())
          .filter((l: string) => l.length > 0);
        setSmartToolResults(lines);
      } else {
        setMessage(data.result);
        setAiSuccessMessage(`Đã áp dụng mẫu ${toolType === 'sales_transform' ? 'Bài Viết Bán Hàng' : 'Mẹo Công Nghệ'}!`);
      }
    } catch (e: any) {
      console.error(e);
      alert("Lỗi công cụ AI: " + e.message);
    } finally {
      setIsSmartToolLoading(false);
    }
  };

  const handlePostSubmit = async (status: 'draft' | 'scheduled' | 'published') => {
    if (!selectedPageId) {
      setPublishStatus({ type: "error", message: "Vui lòng chọn Fanpage muốn đăng bài." });
      return;
    }
    if (!message.trim()) {
      setPublishStatus({ type: "error", message: "Vui lòng nhập nội dung bài viết trước khi xuất bản." });
      return;
    }
    if (status === 'scheduled' && !scheduledDate) {
      setPublishStatus({ type: "error", message: "Vui lòng chọn ngày và giờ muốn lên lịch hẹn đăng." });
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
            ? `Đã đăng thành công lên Fanpage ${selectedPage.name}! ${response.isSimulated ? '(Chế độ mô phỏng)' : ''}`
            : status === 'scheduled'
            ? `Đã lên lịch đăng tự động vào lúc ${new Date(scheduledDate).toLocaleString('vi-VN')}!`
            : "Đã lưu bài viết vào danh sách bản nháp."
        });

        if (status !== 'draft') {
          setMessage("");
          setMediaUrl("");
          setScheduledDate("");
          setIsScheduling(false);
        }
      } else {
        setPublishStatus({
          type: "error",
          message: response.error || "Không thể đăng bài lên Facebook."
        });
      }
    } catch (err: any) {
      setPublishStatus({
        type: "error",
        message: err.message || "Đã xảy ra lỗi không xác định."
      });
    } finally {
      setPublishing(false);
    }
  };

  // Character calculation
  const charCount = message.length;
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;
  const isOptimalLength = charCount >= 120 && charCount <= 600;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 font-sans">
      
      {/* Editor & AI Tools (Left Column) */}
      <div className="xl:col-span-7 space-y-6">
        
        {/* Connection Quick Picker & Quick Templates Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fanpage đăng tải bài viết
              </label>
              <p className="text-[11px] text-slate-400">Chọn trang Facebook đích để xuất bản</p>
            </div>
            
            {/* Quick Templates Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Mẫu Bài Viết Sẵn Có</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 hidden group-hover:block group-focus-within:block z-30 animate-in fade-in duration-100">
                <span className="text-[10px] font-bold text-slate-400 px-2 py-1 block uppercase">
                  Chọn mẫu bài viết nhanh:
                </span>
                {POST_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setMessage(tmpl.template)}
                    className="w-full text-left px-2.5 py-2 hover:bg-blue-50 text-xs font-semibold text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {pages.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  type="button"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    selectedPageId === page.id
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <img src={page.picture} alt={page.name} className="w-5 h-5 rounded-md object-cover" />
                  <span>{page.name} ({page.accountName || "MÁY TÍNH MŨI NÉ"})</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-rose-600 font-medium">
              Chưa có Fanpage nào được kết nối. Vui lòng vào tab "Kênh Kết Nối" để liên kết tài khoản.
            </p>
          )}
        </div>

        {/* Enhanced Post Message Editor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Soạn thảo nội dung bài viết
            </span>

            {/* Character & Word counter with status badge */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                isOptimalLength ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}>
                {charCount} ký tự · {wordCount} từ
              </span>
            </div>
          </div>

          {/* Rich Format Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Định dạng FB:</span>
            
            <button
              type="button"
              onClick={handleFormatBold}
              className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-md font-bold text-slate-800 flex items-center gap-1 cursor-pointer transition-colors shadow-3xs"
              title="Chuyển đoạn bôi đen thành chữ Đậm Unicode trên Facebook"
            >
              <Bold className="w-3.5 h-3.5" />
              <span>In Đậm</span>
            </button>

            <button
              type="button"
              onClick={handleFormatItalic}
              className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-200 rounded-md italic text-slate-800 flex items-center gap-1 cursor-pointer transition-colors shadow-3xs"
              title="Chuyển đoạn bôi đen thành chữ Nghiêng Unicode trên Facebook"
            >
              <Italic className="w-3.5 h-3.5" />
              <span>In Nghiêng</span>
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1"></div>

            {/* Snippets */}
            <button
              type="button"
              onClick={() => handleInsertSnippet("🔥 【TIÊU ĐỀ BÀI VIẾT NỔI BẬT】\n")}
              className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-700 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Tiêu đề giật tít</span>
            </button>

            <button
              type="button"
              onClick={() => handleInsertSnippet("✅ Ưu điểm 1:\n✅ Ưu điểm 2:\n✅ Ưu điểm 3:\n")}
              className="px-2 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <List className="w-3 h-3 text-emerald-500" />
              <span>Danh sách ✅</span>
            </button>

            <button
              type="button"
              onClick={() => handleInsertSnippet("👉 Inbox ngay nhận báo giá ưu đãi hoặc Hotline/Zalo: 0905.xxx.xxx\n")}
              className="px-2 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <PhoneCall className="w-3 h-3 text-blue-500" />
              <span>Kêu gọi CTA</span>
            </button>
          </div>

          <textarea
            id="fb-post-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bạn đang muốn chia sẻ điều gì? Hãy soạn thảo nội dung hoặc bấm các công cụ hỗ trợ thông minh..."
            className="w-full h-48 p-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-hidden resize-none transition-all leading-relaxed placeholder:text-slate-400"
          />

          {/* Categorized Emojis Picker */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kho biểu tượng (Emojis):</span>
                <div className="flex gap-1">
                  {[
                    { id: 'sale', label: '🔥 Sale & Hot' },
                    { id: 'tech', label: '💻 Công nghệ' },
                    { id: 'cta', label: '👉 Kêu gọi' },
                    { id: 'reactions', label: '⭐ Uy tín' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEmojiTab(cat.id as any)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        emojiTab === cat.id
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-xl">
              {EMOJI_CATEGORIES[emojiTab].map((e, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(prev => prev + e)}
                  className="w-8 h-8 text-sm bg-white hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center justify-center cursor-pointer shadow-3xs"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* AI Smart Tools Quick Actions Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Công cụ AI 1-chạm (Gemini Powered)
              </span>
              {isSmartToolLoading && (
                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Đang xử lý...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleRunSmartTool('headlines')}
                disabled={isSmartToolLoading}
                className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl border border-purple-200/60 text-xs font-bold transition-colors text-left flex items-center gap-1.5 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-purple-600 shrink-0" />
                <span>5 Tiêu đề giật tít</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunSmartTool('cta')}
                disabled={isSmartToolLoading}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl border border-blue-200/60 text-xs font-bold transition-colors text-left flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
                <span>5 Câu chốt Sale</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunSmartTool('sales_transform')}
                disabled={isSmartToolLoading}
                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200/60 text-xs font-bold transition-colors text-left flex items-center gap-1.5 cursor-pointer"
              >
                <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Đổi giọng Bán Hàng</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunSmartTool('tech_tip')}
                disabled={isSmartToolLoading}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200/60 text-xs font-bold transition-colors text-left flex items-center gap-1.5 cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mẹo máy tính hay</span>
              </button>
            </div>

            {/* Smart tool results popup / drawer */}
            {smartToolResults.length > 0 && (
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">
                    Chọn gợi ý để chèn ngay vào bài viết:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSmartToolResults([])}
                    className="text-[10px] text-purple-700 hover:underline font-bold"
                  >
                    Đóng
                  </button>
                </div>

                <div className="space-y-1">
                  {smartToolResults.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (smartToolType === "headlines") {
                          setMessage(prev => `${item}\n\n${prev}`);
                        } else {
                          setMessage(prev => `${prev}\n\n${item}`);
                        }
                        setSmartToolResults([]);
                      }}
                      className="w-full text-left p-2 bg-white hover:bg-purple-100/60 border border-purple-100 rounded-lg text-xs font-medium text-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="line-clamp-1">{item}</span>
                      <span className="text-[10px] font-bold text-purple-600 opacity-0 group-hover:opacity-100 shrink-0 ml-2">
                        + Chèn
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image & Video Attachment Studio Entry */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-600" />
                <span>Hình ảnh hoặc Video đính kèm</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {/* Image Studio Button */}
                <button
                  type="button"
                  onClick={() => setIsImageStudioOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Studio Ảnh AI</span>
                </button>

                {/* Video Studio Button */}
                <button
                  type="button"
                  onClick={() => setIsVideoStudioOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Studio Video AI</span>
                </button>
              </div>
            </div>

            {/* Currently attached media display */}
            {mediaUrl ? (
              <div className="relative p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                {mediaUrl.toLowerCase().includes(".mp4") || mediaUrl.startsWith("blob:") || mediaUrl.startsWith("data:video") ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black flex items-center justify-center shrink-0 border border-slate-200">
                    <video
                      src={mediaUrl}
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                      <Film className="w-4 h-4 text-white animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Attached"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {mediaUrl.toLowerCase().includes(".mp4") || mediaUrl.startsWith("blob:") || mediaUrl.startsWith("data:video")
                      ? "Video hiệu ứng đã lồng nhạc"
                      : "Ảnh đã thiết kế đính kèm"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{mediaUrl}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (mediaUrl.toLowerCase().includes(".mp4") || mediaUrl.startsWith("blob:") || mediaUrl.startsWith("data:video")) {
                        setIsVideoStudioOpen(true);
                      } else {
                        setIsImageStudioOpen(true);
                      }
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaUrl("")}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Gỡ bỏ
                  </button>
                </div>
              </div>
            ) : (
              /* Quick Presets Grid with both Images and Videos */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Chọn nhanh từ thư viện mẫu:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Stock Video 1 Quick Shortcut */}
                  <button
                    onClick={() => setMediaUrl("https://assets.mixkit.co/videos/preview/mixkit-computer-motherboard-and-electronic-parts-closeup-41589-large.mp4")}
                    type="button"
                    className="relative h-14 w-full rounded-lg overflow-hidden border border-slate-200 group cursor-pointer hover:border-blue-500 transition-all bg-black flex items-center justify-center"
                  >
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-computer-motherboard-and-electronic-parts-closeup-41589-large.mp4"
                      muted
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                      <Film className="w-4 h-4 text-white mb-0.5" />
                      <span className="text-[8px] text-white font-bold uppercase">Video Vi Mạch</span>
                    </div>
                  </button>

                  {/* Stock Video 2 Quick Shortcut */}
                  <button
                    onClick={() => setMediaUrl("https://assets.mixkit.co/videos/preview/mixkit-rgb-gaming-keyboard-and-mouse-closeup-41595-large.mp4")}
                    type="button"
                    className="relative h-14 w-full rounded-lg overflow-hidden border border-slate-200 group cursor-pointer hover:border-blue-500 transition-all bg-black flex items-center justify-center"
                  >
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-rgb-gaming-keyboard-and-mouse-closeup-41595-large.mp4"
                      muted
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                      <Film className="w-4 h-4 text-white mb-0.5" />
                      <span className="text-[8px] text-white font-bold uppercase">Video Gaming</span>
                    </div>
                  </button>

                  {/* Stock Image 1 Quick Shortcut */}
                  {STOCK_GALLERY_IMAGES.slice(0, 2).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setMediaUrl(img.url)}
                      type="button"
                      className="relative h-14 w-full rounded-lg overflow-hidden border border-slate-200 group cursor-pointer hover:border-blue-500 transition-all"
                    >
                      <img src={img.thumbnail} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-white mb-0.5" />
                        <span className="text-[8px] text-white font-bold uppercase truncate max-w-[90%]">{img.title.split(" ").slice(0, 2).join(" ")}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gemini AI Full Post Generator Box */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-wide text-blue-400 flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4" />
              Soạn thảo bài viết tự động với Gemini AI
            </h3>
            <span className="text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-600/20 px-2 py-0.5 rounded">
              Gemini 3.1
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Nhập ý tưởng (Ví dụ: Máy Tính Mũi Né nâng cấp SSD giảm giá 20% tuần này)..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giọng điệu</label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-xs rounded-lg text-white outline-hidden focus:border-blue-500"
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
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-xs rounded-lg text-white outline-hidden focus:border-blue-500"
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
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Tạo bài viết mới</span>
              </button>

              <button
                type="button"
                onClick={() => handleAiGenerate('improve')}
                disabled={aiLoading || !message.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs border border-slate-700 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                title="Tối ưu và làm mượt bài viết hiện tại"
              >
                <span>Tối ưu bản thảo</span>
              </button>

              <button
                type="button"
                onClick={() => handleAiGenerate('hashtags')}
                disabled={aiLoading || !message.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs border border-slate-700 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>+10 Hashtags</span>
              </button>

              <button
                type="button"
                onClick={() => handleAiGenerate('translate')}
                disabled={aiLoading || !message.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs border border-slate-700 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Dịch {aiLanguage.includes('English') ? 'sang Tiếng Anh' : 'sang Tiếng Việt'}</span>
              </button>
            </div>

            {aiError && (
              <div className="p-3 bg-red-900/40 border border-red-800/50 text-red-200 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}
            {aiSuccessMessage && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 text-xs rounded-xl flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* 🧠 AI Knowledge Base Integration Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-indigo-600 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Cơ Sở Kiến Thức AI (Trợ lý Chat)</h3>
                <p className="text-[11px] text-slate-400">Chọn hoặc huấn luyện bài viết làm kiến thức cho AI tự động trả lời khách hàng</p>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold">
              {knowledgeList.length} tài liệu
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleAddCurrentAsKnowledge}
              className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200"
              title="Thêm trực tiếp bài viết đang soạn ở trên làm dữ liệu huấn luyện cho AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dùng Bài Viết Đang Soạn</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPostPicker(!showPostPicker)}
              className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>{showPostPicker ? "Đóng danh sách chọn" : "Chọn từ Bài Viết Hệ Thống"}</span>
            </button>
          </div>

          {/* Existing Posts Picker Dropdown */}
          {showPostPicker && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-150">
              <span className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                Chọn một bài viết để nạp làm kiến thức AI:
              </span>
              {posts && posts.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {posts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddExistingAsKnowledge(p.message)}
                      className="w-full text-left p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-xs transition-all flex items-start gap-2 group cursor-pointer"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-0.5">
                          <span>{p.pageName}</span>
                          <span className="uppercase text-[9px] bg-slate-100 px-1 py-0.2 rounded font-mono">
                            {p.status === 'published' ? 'Đã đăng' : p.status === 'scheduled' ? 'Lên lịch' : 'Bản nháp'}
                          </span>
                        </div>
                        <p className="text-slate-700 line-clamp-2 font-medium leading-relaxed">
                          {p.message}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 shrink-0 opacity-0 group-hover:opacity-100 self-center transition-opacity ml-1">
                        + Chọn
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Chưa có bài viết nào khác trong hệ thống để chọn. Hãy thử tự soạn bài viết rồi nạp ở trên nhé!
                </p>
              )}
            </div>
          )}

          {/* Success messages */}
          {knowledgeSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-100">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{knowledgeSuccess}</span>
            </div>
          )}

          {/* List of active knowledge pieces */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Dữ liệu kiến thức AI đang có ({knowledgeList.length}):
            </span>
            
            {knowledgeList.length > 0 ? (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {knowledgeList.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl flex items-start justify-between gap-3 group hover:border-indigo-200 transition-all"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500">
                        <span>Tài liệu #{index + 1}</span>
                        <span>•</span>
                        <span>Đã nạp {new Date(item.addedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap break-words">
                        {item.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveKnowledge(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-start shrink-0"
                      title="Xóa tài liệu kiến thức"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-center">
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Trợ lý AI hiện chưa có bài viết kiến thức nào được nạp bổ sung. AI sẽ phản hồi dựa vào Cấu hình chung trong tab <strong>Hộp thư Messenger</strong>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Action Publishing Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsScheduling(!isScheduling)}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-slate-900 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{isScheduling ? "Tắt hẹn giờ đăng" : "Hẹn giờ đăng tự động"}</span>
            </button>
            
            <span className="text-[11px] text-slate-400">
              {isScheduling ? "Tự chọn lịch đăng" : "Xuất bản ngay lập tức"}
            </span>
          </div>

          {isScheduling && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 animate-in fade-in duration-150">
              <Clock className="w-4 h-4 text-slate-500" />
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-transparent border-0 text-sm font-bold text-slate-800 outline-hidden"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}

          {/* Action Alerts */}
          {publishStatus && (
            <div className={`p-4 rounded-xl flex items-start gap-3 text-xs ${
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
                <p className="font-bold">{publishStatus.type === 'success' ? 'Thao tác thành công' : 'Thất bại'}</p>
                <p className="mt-0.5 leading-relaxed">{publishStatus.message}</p>
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            {isScheduling ? (
              <button
                type="button"
                onClick={() => handlePostSubmit('scheduled')}
                disabled={publishing}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                <span>Lên Lịch Hẹn Giờ Đăng</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handlePostSubmit('published')}
                disabled={publishing}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Đăng Lên Facebook Ngay</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handlePostSubmit('draft')}
              disabled={publishing}
              className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-400" />
              <span>Lưu Bản Nháp</span>
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Facebook Live Preview (Right Column) */}
      <div className="xl:col-span-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">
          Xem trước bài viết trên Facebook
        </h3>
        
        {/* Mock Post Frame */}
        <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 shadow-inner flex justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200/60 font-sans">
            
            {/* Page Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPage?.picture || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60"}
                  alt={selectedPage?.name || "Fanpage"}
                  className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60";
                  }}
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight flex items-center gap-1">
                    {selectedPage?.name || "MÁY TÍNH MŨI NÉ"}
                    <span className="w-3.5 h-3.5 bg-blue-500 rounded-full text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <span>
                      {isScheduling && scheduledDate 
                        ? `Lên lịch: ${new Date(scheduledDate).toLocaleDateString('vi-VN')}` 
                        : "Vừa xong"}
                    </span>
                    <span>·</span>
                    <Globe className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </div>
              
              <button className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2">•••</button>
            </div>

            {/* Post Message Text */}
            <div className="px-4 pb-3">
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {message || (
                  <span className="text-slate-400 italic">
                    Soạn thảo nội dung hoặc chọn mẫu bài viết bên trái để xem trước giao diện hiển thị thực tế tại đây...
                  </span>
                )}
              </p>
            </div>

            {/* Attached Image or Video Preview */}
            {mediaUrl && (
              <div className="border-y border-slate-100 bg-slate-950 overflow-hidden max-h-[380px] flex items-center justify-center">
                {mediaUrl.toLowerCase().includes(".mp4") || mediaUrl.startsWith("blob:") || mediaUrl.startsWith("data:video") ? (
                  <video 
                    src={mediaUrl} 
                    controls 
                    muted 
                    autoPlay 
                    loop 
                    className="w-full h-full object-cover max-h-[380px]"
                  />
                ) : (
                  <img 
                    src={mediaUrl} 
                    alt="Post Attachment" 
                    className="w-full h-full object-cover max-h-[380px]"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
            )}

            {/* Mock Reactions Stats */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  <span className="w-4 h-4 bg-blue-500 rounded-full text-white flex items-center justify-center text-[9px]">👍</span>
                  <span className="w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center text-[9px]">❤️</span>
                </div>
                <span>MÁY TÍNH MŨI NÉ và 24 người khác</span>
              </div>
              <div className="space-x-3">
                <span>5 bình luận</span>
                <span>2 chia sẻ</span>
              </div>
            </div>

            {/* Interactions buttons */}
            <div className="px-2 py-1.5 flex items-center justify-between text-slate-600 text-xs font-semibold">
              <button className="flex-1 py-1.5 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <ThumbsUp className="w-4 h-4" />
                <span>Thích</span>
              </button>
              <button className="flex-1 py-1.5 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span>Bình luận</span>
              </button>
              <button className="flex-1 py-1.5 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Share2 className="w-4 h-4" />
                <span>Chia sẻ</span>
              </button>
            </div>

          </div>
        </div>

        {/* Studio Modal Shortcuts */}
        <div className="space-y-2.5">
          {/* Image Studio Shortcut */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/70 flex items-center justify-between gap-3 shadow-3xs">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-blue-600" />
                Tạo ảnh AI & Ghép Banner
              </h4>
              <p className="text-[11px] text-blue-700 font-medium">
                Tạo ảnh chuyên nghiệp bằng tiếng Việt hoặc ghép nhiều ảnh SALE độc đáo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsImageStudioOpen(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Mở Studio Ảnh
            </button>
          </div>

          {/* Video Studio Shortcut */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/70 flex items-center justify-between gap-3 shadow-3xs">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-indigo-600" />
                Studio Sản Xuất Video AI & Nhạc Nền
              </h4>
              <p className="text-[11px] text-indigo-700 font-medium">
                Áp dụng bộ lọc Cyberpunk, VHS cổ điển, chèn nhãn nhấp nháy sôi động và lồng nhạc nền.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsVideoStudioOpen(true)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Mở Studio Video
            </button>
          </div>
        </div>

      </div>

      {/* Image Studio Modal */}
      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        onSelectImage={(url) => setMediaUrl(url)}
        currentImage={mediaUrl}
      />

      {/* Video Studio Modal */}
      <VideoStudioModal
        isOpen={isVideoStudioOpen}
        onClose={() => setIsVideoStudioOpen(false)}
        onSelectVideo={(url) => setMediaUrl(url)}
        currentVideo={mediaUrl}
      />

    </div>
  );
}
