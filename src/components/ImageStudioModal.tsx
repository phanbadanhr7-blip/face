import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Layers, 
  Upload, 
  Download, 
  Check, 
  X, 
  Loader2, 
  RefreshCw, 
  Wand2, 
  FolderHeart, 
  Grid, 
  Columns, 
  Plus, 
  Trash2, 
  Tag, 
  AlertCircle,
  Maximize2
} from "lucide-react";
import { STOCK_GALLERY_IMAGES, StockImageItem } from "../utils/textFormatter";

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImage?: string;
}

// Preset prompt ideas for tech / computer stores in Vietnamese
const PROMPT_SUGGESTIONS = [
  "Dàn máy tính PC Gaming LED RGB màu xanh tím rực rỡ, màn hình cong siêu nét",
  "Kỹ thuật viên đang kiểm tra bo mạch và vệ sinh laptop chuyên nghiệp tại bàn làm việc",
  "Banner quảng cáo khuyến mãi máy tính giảm giá sốc mùa hè với phong cách hiện đại",
  "Góc làm việc công nghệ sang trọng với máy tính mỏng nhẹ, bàn phím cơ và đèn led ấm",
  "Lắp ráp máy tính để bàn PC đồ họa render cấu hình cao với tản nhiệt nước",
  "Màn hình máy tính gaming 24 inch 165Hz viền mỏng hiển thị hình ảnh rực rỡ"
];

// Preset badges for banner collage
const PRESET_BADGES = [
  "🔥 HOT SALE",
  "💥 GIẢM GIÁ 50%",
  "💎 MÁY TÍNH MŨI NÉ",
  "⭐ BẢO HÀNH 24 THÁNG",
  "✅ CHÍNH HÃNG 100%",
  "⚡ RÁP PC LẤY LIỀN",
  "🛠️ VỆ SINH CÀI WIN 100K",
  "🎁 QUÀ TẶNG HẤP DẪN"
];

export default function ImageStudioModal({
  isOpen,
  onClose,
  onSelectImage,
  currentImage
}: ImageStudioModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'ai' | 'collage' | 'gallery' | 'upload'>('ai');

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStyle, setAiStyle] = useState<string>("realistic");
  const [aiRatio, setAiRatio] = useState<string>("1:1");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<string>("");
  const [aiError, setAiError] = useState<string>("");

  // Gallery state
  const [galleryCategory, setGalleryCategory] = useState<string>("all");

  // Collage state
  const [collageImages, setCollageImages] = useState<string[]>([
    STOCK_GALLERY_IMAGES[0].url,
    STOCK_GALLERY_IMAGES[1].url
  ]);
  const [collageLayout, setCollageLayout] = useState<'split-v' | 'split-h' | 'triple' | 'grid-4'>('split-v');
  const [selectedBadge, setSelectedBadge] = useState<string>("🔥 HOT SALE");
  const [customBadgeText, setCustomBadgeText] = useState<string>("");
  const [isRenderingCollage, setIsRenderingCollage] = useState(false);
  const [renderedCollageUrl, setRenderedCollageUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Upload state
  const [uploadUrlInput, setUploadUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Filtered gallery
  const filteredGallery = galleryCategory === "all"
    ? STOCK_GALLERY_IMAGES
    : STOCK_GALLERY_IMAGES.filter(img => img.category === galleryCategory);

  // Handle AI Image Generation
  const handleGenerateAiImage = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Vui lòng nhập nội dung mô tả hình ảnh bạn muốn tạo bằng tiếng Việt.");
      return;
    }

    setIsGeneratingAi(true);
    setAiError("");
    try {
      const res = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          style: aiStyle,
          aspectRatio: aiRatio
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Không thể tạo ảnh bằng AI.");
      }

      setAiGeneratedImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Đã xảy ra lỗi khi tạo ảnh bằng AI.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Render Canvas Collage
  const handleRenderCollage = async () => {
    if (collageImages.length < 2) {
      alert("Vui lòng chọn ít nhất 2 ảnh để ghép!");
      return;
    }

    setIsRenderingCollage(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context is not supported");

      const width = 1000;
      const height = 1000;
      canvas.width = width;
      canvas.height = height;

      // Background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      // Helper to load image
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => {
            // If crossOrigin fails, try without crossOrigin
            const fallbackImg = new Image();
            fallbackImg.onload = () => resolve(fallbackImg);
            fallbackImg.onerror = reject;
            fallbackImg.src = src;
          };
          img.src = src;
        });
      };

      const loadedImgs = await Promise.all(
        collageImages.slice(0, 4).map(src => loadImage(src).catch(() => null))
      );

      const validImgs = loadedImgs.filter(Boolean) as HTMLImageElement[];
      if (validImgs.length === 0) {
        throw new Error("Không thể tải các ảnh đã chọn do bảo mật nguồn ảnh.");
      }

      const padding = 12;

      // Render based on Layout
      if (collageLayout === 'split-v' && validImgs.length >= 2) {
        // Left & Right
        const w = (width - padding * 3) / 2;
        const h = height - padding * 2;
        ctx.drawImage(validImgs[0], padding, padding, w, h);
        ctx.drawImage(validImgs[1], padding * 2 + w, padding, w, h);
      } else if (collageLayout === 'split-h' && validImgs.length >= 2) {
        // Top & Bottom
        const w = width - padding * 2;
        const h = (height - padding * 3) / 2;
        ctx.drawImage(validImgs[0], padding, padding, w, h);
        ctx.drawImage(validImgs[1], padding, padding * 2 + h, w, h);
      } else if (collageLayout === 'triple' && validImgs.length >= 2) {
        // 1 Big on left, 2 smaller on right
        const leftW = (width - padding * 3) * 0.58;
        const rightW = (width - padding * 3) * 0.42;
        const subH = (height - padding * 3) / 2;

        ctx.drawImage(validImgs[0], padding, padding, leftW, height - padding * 2);
        ctx.drawImage(validImgs[1], padding * 2 + leftW, padding, rightW, subH);
        if (validImgs[2]) {
          ctx.drawImage(validImgs[2], padding * 2 + leftW, padding * 2 + subH, rightW, subH);
        } else {
          ctx.drawImage(validImgs[0], padding * 2 + leftW, padding * 2 + subH, rightW, subH);
        }
      } else {
        // Grid 4 (2x2)
        const w = (width - padding * 3) / 2;
        const h = (height - padding * 3) / 2;
        ctx.drawImage(validImgs[0], padding, padding, w, h);
        if (validImgs[1]) ctx.drawImage(validImgs[1], padding * 2 + w, padding, w, h);
        if (validImgs[2]) ctx.drawImage(validImgs[2], padding, padding * 2 + h, w, h);
        if (validImgs[3]) ctx.drawImage(validImgs[3], padding * 2 + w, padding * 2 + h, w, h);
      }

      // Draw Badge overlay
      const badgeText = customBadgeText.trim() || selectedBadge;
      if (badgeText) {
        const badgePaddingX = 28;
        const badgeHeight = 56;
        ctx.font = "bold 26px sans-serif";
        const textWidth = ctx.measureText(badgeText).width;
        const badgeWidth = textWidth + badgePaddingX * 2;

        const badgeX = (width - badgeWidth) / 2;
        const badgeY = height - badgeHeight - 32;

        // Shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Badge Background gradient
        const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeWidth, badgeY + badgeHeight);
        grad.addColorStop(0, "#dc2626");
        grad.addColorStop(1, "#f97316");
        ctx.fillStyle = grad;

        // Rounded badge
        const r = 14;
        ctx.beginPath();
        ctx.moveTo(badgeX + r, badgeY);
        ctx.lineTo(badgeX + badgeWidth - r, badgeY);
        ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + r);
        ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - r);
        ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - r, badgeY + badgeHeight);
        ctx.lineTo(badgeX + r, badgeY + badgeHeight);
        ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - r);
        ctx.lineTo(badgeX, badgeY + r);
        ctx.quadraticCurveTo(badgeX, badgeY, badgeX + r, badgeY);
        ctx.closePath();
        ctx.fill();

        // White border
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;

        // Badge Text
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, width / 2, badgeY + badgeHeight / 2);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setRenderedCollageUrl(dataUrl);
    } catch (e: any) {
      console.error("Collage render error:", e);
      alert("Không thể ghép ảnh: " + (e.message || "Lỗi xử lý hình ảnh."));
    } finally {
      setIsRenderingCollage(false);
    }
  };

  // Handle Local File Upload (Reader to DataURL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onSelectImage(result);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onSelectImage(result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Studio Hình Ảnh & Ghép Banner AI
                <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Đa Năng
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Tạo ảnh AI từ tiếng Việt, ghép nhiều ảnh thành banner hoặc chọn từ thư viện ảnh mẫu.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Wand2 className="w-4 h-4 text-purple-600" />
            <span>Tạo Ảnh AI Bằng Tiếng Việt</span>
          </button>

          <button
            onClick={() => setActiveTab('collage')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'collage'
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Ghép Ảnh & Tạo Banner</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gallery'
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FolderHeart className="w-4 h-4 text-emerald-600" />
            <span>Thư Viện Ảnh Mẫu Chuyên Ngành</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Tải Từ Máy Tính / URL</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: AI GENERATOR */}
          {activeTab === 'ai' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mô tả hình ảnh bằng tiếng Việt:
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    placeholder="Ví dụ: Dàn PC Gaming LED RGB màu tím cực đẹp, tản nhiệt nước, màn hình cong..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs text-slate-800 focus:outline-hidden resize-none transition-all leading-relaxed"
                  />
                </div>

                {/* Prompt suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Gợi ý chủ đề nhanh:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiPrompt(suggestion)}
                        className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg border border-slate-200 transition-colors text-left truncate max-w-full cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style & Ratio selector */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phong cách ảnh</label>
                    <select
                      value={aiStyle}
                      onChange={(e) => setAiStyle(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-hidden"
                    >
                      <option value="realistic">📸 Chụp Thực Tế (Photorealistic)</option>
                      <option value="3d">🎨 3D Render Hiện Đại</option>
                      <option value="banner">🏷️ Banner Quảng Cáo (Ad Banner)</option>
                      <option value="cyberpunk">🌌 Cyberpunk Neon Tech</option>
                      <option value="art">🖌️ Nghệ Thuật Số (Digital Art)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tỉ lệ khung hình</label>
                    <select
                      value={aiRatio}
                      onChange={(e) => setAiRatio(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-hidden"
                    >
                      <option value="1:1">1:1 (Vuông chuẩn Facebook)</option>
                      <option value="16:9">16:9 (Khung hình ngang rộng)</option>
                      <option value="4:5">4:5 (Dọc tối ưu di động)</option>
                    </select>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={handleGenerateAiImage}
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini đang tối ưu & tạo ảnh AI...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Tạo Ảnh AI Bằng Tiếng Việt</span>
                    </>
                  )}
                </button>

                {aiError && (
                  <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}
              </div>

              {/* Right: AI Result Preview */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-[280px]">
                {aiGeneratedImageUrl ? (
                  <div className="space-y-3 w-full text-center">
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm max-h-64 flex items-center justify-center bg-black">
                      <img
                        src={aiGeneratedImageUrl}
                        alt="AI Result"
                        className="max-h-64 w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectImage(aiGeneratedImageUrl);
                          onClose();
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Sử dụng ảnh này cho bài viết</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateAiImage}
                        disabled={isGeneratingAi}
                        className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg"
                        title="Tạo lại ảnh khác"
                      >
                        <RefreshCw className={`w-4 h-4 ${isGeneratingAi ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2 p-6">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-700">Chưa có ảnh AI</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Hãy nhập mô tả ở khung bên trái và bấm nút "Tạo Ảnh AI" để xem kết quả tại đây.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COLLAGE & BANNER CREATOR */}
          {activeTab === 'collage' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 space-y-4">
                
                {/* Layout selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    1. Chọn Bố Cục Ghép:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'split-v', label: '2 Ảnh Dọc', desc: 'Chia đôi trái / phải', icon: Columns },
                      { id: 'split-h', label: '2 Ảnh Ngang', desc: 'Chia đôi trên / dưới', icon: Layers },
                      { id: 'triple', label: '3 Ảnh Nổi Bật', desc: '1 lớn + 2 nhỏ', icon: Maximize2 },
                      { id: 'grid-4', label: '4 Ảnh Lưới', desc: 'Lưới 2x2 vuông', icon: Grid },
                    ].map((layout) => {
                      const Icon = layout.icon;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => setCollageLayout(layout.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            collageLayout === layout.id
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                          <span className="text-xs font-bold block">{layout.label}</span>
                          <span className="text-[9px] text-slate-400 block">{layout.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Badge Overlay */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Nhãn Đè Nổi Bật (Banner Badge):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BADGES.map((b, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedBadge(b);
                          setCustomBadgeText("");
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                          selectedBadge === b && !customBadgeText
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Hoặc tự gõ nhãn riêng (Ví dụ: KHUYẾN MÃI TẾT 30%)..."
                    value={customBadgeText}
                    onChange={(e) => setCustomBadgeText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Selected Images List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      3. Các ảnh đã chọn để ghép ({collageImages.length}/4 ảnh):
                    </label>
                    <span className="text-[10px] text-slate-400">Có thể chọn thêm từ Thư viện</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {collageImages.map((src, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-slate-200 h-20 group">
                        <img src={src} alt={`img-${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setCollageImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1 bg-black/70 text-white text-[9px] font-bold rounded">
                          Ảnh {index + 1}
                        </span>
                      </div>
                    ))}

                    {collageImages.length < 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextImg = STOCK_GALLERY_IMAGES[(collageImages.length + 2) % STOCK_GALLERY_IMAGES.length].url;
                          setCollageImages(prev => [...prev, nextImg]);
                        }}
                        className="h-20 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-[10px] font-bold mt-0.5">Thêm ảnh</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={handleRenderCollage}
                  disabled={isRenderingCollage || collageImages.length < 2}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isRenderingCollage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang ghép & kết xuất ảnh...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>Ghép Ảnh & Tạo Banner Ngay</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right: Rendered Collage Preview */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-4 min-h-[280px]">
                {renderedCollageUrl ? (
                  <div className="space-y-3 w-full text-center">
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm max-h-64 flex items-center justify-center bg-black">
                      <img
                        src={renderedCollageUrl}
                        alt="Collage Result"
                        className="max-h-64 w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectImage(renderedCollageUrl);
                        onClose();
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Sử dụng ảnh ghép này</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2 p-6">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-700">Xem trước ảnh ghép</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Chọn các ảnh và bấm "Ghép Ảnh & Tạo Banner Ngay" để tự động kết xuất ảnh ghép sắc nét.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CURATED STOCK GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'Tất cả ảnh' },
                  { id: 'pc', label: '🎮 PC Gaming & Case' },
                  { id: 'laptop', label: '💻 Laptop & Văn phòng' },
                  { id: 'repair', label: '🔧 Sửa Chữa & Kỹ Thuật' },
                  { id: 'gear', label: '🖱️ Linh Kiện & Màn Hình' },
                  { id: 'promo', label: '🏷️ Khuyến Mãi & Giảm Giá' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setGalleryCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      galleryCategory === cat.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredGallery.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-3xs hover:border-blue-500 transition-all group flex flex-col"
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <p className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-snug">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectImage(item.url);
                            onClose();
                          }}
                          className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                        >
                          Chọn ảnh này
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!collageImages.includes(item.url) && collageImages.length < 4) {
                              setCollageImages(prev => [...prev, item.url]);
                            }
                            setActiveTab('collage');
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                          title="Thêm vào danh sách ghép ảnh"
                        >
                          + Ghép
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: UPLOAD OR URL */}
          {activeTab === 'upload' && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              {/* Drag & drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDropFiles}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragOver
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Kéo và thả file ảnh vào đây</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Hỗ trợ định dạng JPG, PNG, WebP từ máy tính hoặc điện thoại
                </p>

                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Chọn ảnh từ thiết bị</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* URL Input */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Hoặc dán đường dẫn ảnh (Image URL) từ internet:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://domain.com/hinh-anh.jpg"
                    value={uploadUrlInput}
                    onChange={(e) => setUploadUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (uploadUrlInput.trim()) {
                        onSelectImage(uploadUrlInput.trim());
                        onClose();
                      }
                    }}
                    disabled={!uploadUrlInput.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Sử dụng URL
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Hỗ trợ tạo ảnh chất lượng cao 8K & ghép banner trực tiếp</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
