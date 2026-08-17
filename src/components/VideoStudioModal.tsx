import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  Film, 
  Type, 
  RotateCcw, 
  Download, 
  Check, 
  Sparkle,
  Upload,
  Sliders,
  Tv,
  Flame,
  Award,
  Zap,
  Tag,
  Loader2,
  Settings,
  MonitorPlay,
  Scissors
} from "lucide-react";

interface VideoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (url: string) => void;
  currentVideo?: string;
}

// Tech / Business stock videos
const STOCK_VIDEOS = [
  {
    id: "motherboard",
    title: "🔧 Vi mạch & Phần cứng Laptop",
    url: "https://assets.mixkit.co/videos/preview/mixkit-computer-motherboard-and-electronic-parts-closeup-41589-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=60"
  },
  {
    id: "keyboard",
    title: "🎮 Bàn phím Gaming LED RGB",
    url: "https://assets.mixkit.co/videos/preview/mixkit-rgb-gaming-keyboard-and-mouse-closeup-41595-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=60"
  },
  {
    id: "typing",
    title: "💻 Lập trình & Sửa chữa phần mềm",
    url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-programmer-typing-on-a-keyboard-41584-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1484417894907-623942c8ea29?w=200&auto=format&fit=crop&q=60"
  },
  {
    id: "server",
    title: "⚡ Phòng Máy Chủ Server Đẳng Cấp",
    url: "https://assets.mixkit.co/videos/preview/mixkit-server-room-flashing-lights-closeup-41592-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop&q=60"
  }
];

// Presets effects filters
const EFFECT_PRESETS = [
  {
    id: "none",
    name: "🚫 Gốc",
    description: "Không áp dụng hiệu ứng lọc màu",
    cssFilter: "none",
    overlayClass: ""
  },
  {
    id: "cyberpunk",
    name: "🚀 Cyberpunk Neon",
    description: "Tông màu neon tím-hồng rực rỡ, độ tương phản cao",
    cssFilter: "hue-rotate(270deg) saturate(1.8) contrast(1.2)",
    overlayClass: "bg-radial from-transparent via-fuchsia-950/10 to-indigo-950/25 border-4 border-fuchsia-500/30 animate-pulse"
  },
  {
    id: "vhs",
    name: "📹 Retro VHS Cam",
    description: "Bộ lọc nhiễu analog, mốc thời gian xưa cũ cổ điển",
    cssFilter: "sepia(0.25) saturate(0.9) contrast(1.1) brightness(0.95)",
    overlayClass: "bg-linear-to-b from-black/5 via-transparent to-black/5 scanlines-overlay border-2 border-slate-900/10"
  },
  {
    id: "hot_sale",
    name: "🔥 Khuyến Mãi Hot",
    description: "Viền nhấp nháy đỏ vàng, kích thích mua hàng",
    cssFilter: "saturate(1.4) contrast(1.15)",
    overlayClass: "border-8 border-amber-500 animate-border-flash"
  },
  {
    id: "matrix",
    name: "📟 Hacker Matrix",
    description: "Bộ lọc xanh lục kỹ thuật số chuyên nghiệp",
    cssFilter: "hue-rotate(60deg) saturate(1.5) contrast(1.3) brightness(0.9)",
    overlayClass: "bg-radial from-transparent to-emerald-950/20 matrix-overlay"
  },
  {
    id: "cinematic",
    name: "🎬 Cinematic Movie",
    description: "Khung hình 21:9 chuẩn rạp phim, tông màu ấm áp",
    cssFilter: "sepia(0.15) saturate(1.1) contrast(1.05)",
    overlayClass: "cinematic-letterbox"
  }
];

// Royalty-free loopable background music
const MUSIC_TRACKS = [
  { id: "none", name: "🔇 Không có nhạc nền", url: "" },
  { id: "synthwave", name: "🎵 Retro Synthwave (Sôi động)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "lofi", name: "🎵 Lofi Chillhop (Thư giãn, nhẹ nhàng)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "tech", name: "🎵 Modern Tech Ambient (Chuyên nghiệp)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
];

export default function VideoStudioModal({ isOpen, onClose, onSelectVideo, currentVideo }: VideoStudioModalProps) {
  if (!isOpen) return null;

  // Video Source state
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(currentVideo || STOCK_VIDEOS[0].url);
  const [customUrl, setCustomUrl] = useState("");
  const [activeSourceTab, setActiveSourceTab] = useState<'stock' | 'upload'>('stock');

  // Video playback controllers
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [videoProgress, setVideoProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // FX parameters
  const [activeEffect, setActiveEffect] = useState("none");
  const [selectedMusic, setSelectedMusic] = useState("none");
  const [musicVolume, setMusicVolume] = useState(50);

  // Overlay text properties
  const [overlayText, setOverlayText] = useState("MÁY TÍNH MŨI NÉ - GIÁM GIÁ 30%");
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#ef4444");
  const [textSize, setTextSize] = useState("text-base");
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [textAnimation, setTextAnimation] = useState<'static' | 'flicker' | 'pulse' | 'slide'>('pulse');

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiTip, setAiTip] = useState("");

  // Rendering Sim State
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStep, setRenderStep] = useState("");

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Play / Pause video & audio synced
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (audioRef.current && selectedMusic !== "none") {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(e => console.error("Video play error:", e));
      if (audioRef.current && selectedMusic !== "none") {
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
      }
      setIsPlaying(true);
    }
  };

  // Sync music with video timeline or loops
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (selectedMusic !== "none") {
        const track = MUSIC_TRACKS.find(t => t.id === selectedMusic);
        if (track && track.url) {
          audioRef.current.src = track.url;
          audioRef.current.load();
          audioRef.current.volume = musicVolume / 100;
          if (isPlaying) {
            audioRef.current.play().catch(e => console.log("Audio play error:", e));
          }
        }
      }
    }
  }, [selectedMusic]);

  // Adjust audio volumes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Stop everything on exit
  useEffect(() => {
    return () => {
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // Update playback indicators
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setVideoProgress(isNaN(progress) ? 0 : progress);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newPercentage = parseFloat(e.target.value);
    const newTime = (newPercentage / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setVideoProgress(newPercentage);
  };

  // Handle local video upload
  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setSelectedVideoUrl(blobUrl);
      setIsPlaying(false);
      setVideoProgress(0);
    }
  };

  // Apply custom AI Effects instructions
  const handleApplyAiVideoPrompt = () => {
    if (!aiPrompt.trim()) {
      alert("Vui lòng nhập mô tả ý tưởng hiệu ứng video!");
      return;
    }

    setIsAiProcessing(true);
    setAiTip("");

    // Intelligently parse prompt to select configurations
    setTimeout(() => {
      const promptLower = aiPrompt.toLowerCase();
      
      if (promptLower.includes("cyberpunk") || promptLower.includes("tím") || promptLower.includes("neon") || promptLower.includes("glitch")) {
        setActiveEffect("cyberpunk");
        setSelectedMusic("synthwave");
        setOverlayText("CYBERPUNK PC STORE");
        setBgColor("#d946ef");
        setTextAnimation("flicker");
        setAiTip("✨ Đã kích hoạt bộ lọc Cyberpunk Neon, nhịp nhạc Synthwave, nhãn text nhấp nháy hồng ngoại!");
      } else if (promptLower.includes("vhs") || promptLower.includes("cổ điển") || promptLower.includes("xưa") || promptLower.includes("analog")) {
        setActiveEffect("vhs");
        setSelectedMusic("lofi");
        setOverlayText("DỊCH VỤ SỬA CHỮA LAPTOP 1990");
        setBgColor("#000000");
        setTextAnimation("static");
        setAiTip("✨ Đã kích hoạt bộ lọc VHS hoài cổ với vạch quét nhiễu, nhạc nền Lofi êm đềm!");
      } else if (promptLower.includes("sale") || promptLower.includes("giảm giá") || promptLower.includes("khuyến mãi") || promptLower.includes("rẻ")) {
        setActiveEffect("hot_sale");
        setSelectedMusic("synthwave");
        setOverlayText("🔥 SIÊU GIẢM GIÁ 50% TUẦN NÀY 🔥");
        setBgColor("#ef4444");
        setTextAnimation("pulse");
        setAiTip("✨ Đã bật khung viền flash đỏ-vàng kích thích chốt Sale, nhạc nền sôi động!");
      } else if (promptLower.includes("hacker") || promptLower.includes("matrix") || promptLower.includes("xanh") || promptLower.includes("code")) {
        setActiveEffect("matrix");
        setSelectedMusic("tech");
        setOverlayText("MATRIX TECHNOLOGY CENTER");
        setBgColor("#10b981");
        setTextAnimation("slide");
        setAiTip("✨ Đã chuyển màu kỹ thuật số Matrix cổ điển với hiệu ứng chèn nhãn xanh lục!");
      } else {
        // Default smart fallback based on keywords
        setActiveEffect("cinematic");
        setSelectedMusic("tech");
        setOverlayText("MÁY TÍNH MŨI NÉ UY TÍN CHẤT LƯỢNG");
        setBgColor("#2563eb");
        setTextAnimation("pulse");
        setAiTip("✨ Đã tối ưu hiệu ứng Cinematic 21:9 đỉnh cao, lồng nhạc nền Công nghệ hiện đại!");
      }
      setIsAiProcessing(false);
    }, 1500);
  };

  // Run Simulated Render process
  const handleStartRender = () => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderStep("Khởi động mô-đun mã hóa video...");

    const steps = [
      { prg: 15, msg: "Đang trích xuất luồng hình ảnh & âm thanh..." },
      { prg: 35, msg: "Áp dụng bộ lọc màu " + (EFFECT_PRESETS.find(f => f.id === activeEffect)?.name || "Gốc") + "..." },
      { prg: 55, msg: "Đang chèn nhãn hiệu ứng: \"" + overlayText + "\"..." },
      { prg: 75, msg: "Đang trộn âm thanh & lồng nhạc nền: " + (MUSIC_TRACKS.find(m => m.id === selectedMusic)?.name || "Gốc") + "..." },
      { prg: 90, msg: "Đang biên dịch tệp video nén chuẩn MP4 H.264 HD..." },
      { prg: 100, msg: "Hoàn tất xuất video thành công!" }
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        const nextPrg = prev + 5;
        if (currentStepIndex < steps.length && nextPrg >= steps[currentStepIndex].prg) {
          setRenderStep(steps[currentStepIndex].msg);
          currentStepIndex++;
        }
        if (nextPrg >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Apply render results
            onSelectVideo(selectedVideoUrl);
            setIsRendering(false);
            onClose();
          }, 800);
          return 100;
        }
        return nextPrg;
      });
    }, 150);
  };

  const activePreset = EFFECT_PRESETS.find(e => e.id === activeEffect) || EFFECT_PRESETS[0];

  return (
    <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] lg:h-[680px]">
        
        {/* Left Side: Real-time Interactive Video Player & Overlays (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 p-5 flex flex-col justify-between text-white relative">
          
          {/* Header indicator */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tv className="w-4 h-4 text-blue-500 animate-pulse" />
              Giao diện chỉnh sửa live
            </span>
            <span className="text-[10px] font-mono bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-0.5 rounded font-bold">
              PREVIEW HD
            </span>
          </div>

          {/* Interactive Player Container */}
          <div className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-2xl border border-slate-800">
            
            {/* Background Audio Hidden player */}
            <audio ref={audioRef} loop />

            {/* The Main Video Player */}
            <video
              ref={videoRef}
              src={selectedVideoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              loop
              className="w-full h-full object-cover transition-all duration-300"
              style={{ filter: activePreset.cssFilter }}
              playsInline
            />

            {/* Visual Filters / Overlay Screens */}
            {activeEffect !== "none" && (
              <div className={`absolute inset-0 pointer-events-none z-10 ${activePreset.overlayClass}`} />
            )}

            {/* VHS Camera specific live display */}
            {activeEffect === "vhs" && (
              <div className="absolute inset-x-4 top-4 font-mono text-[10px] text-emerald-400 flex justify-between pointer-events-none uppercase z-10 tracking-widest">
                <span>● REC</span>
                <span>SP 1080i</span>
              </div>
            )}
            {activeEffect === "vhs" && (
              <div className="absolute inset-x-4 bottom-14 font-mono text-[10px] text-emerald-400 flex justify-between pointer-events-none uppercase z-10 tracking-widest">
                <span>AUG 16, 2026</span>
                <span>12:00:23 AM</span>
              </div>
            )}

            {/* Matrix rain digital background overlay simulated details */}
            {activeEffect === "matrix" && (
              <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-20 pointer-events-none z-10 font-mono text-[8px] text-emerald-500 overflow-hidden leading-tight">
                <div>01001101 01000001 01010100 01010010 01001001 01011000</div>
                <div>10101010 01100110 11001100 11110000 00001111 01010101</div>
              </div>
            )}

            {/* Cinematic Letterboxes */}
            {activeEffect === "cinematic" && (
              <>
                <div className="absolute top-0 left-0 right-0 h-8 bg-black z-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-black z-20 pointer-events-none" />
              </>
            )}

            {/* Interactive Customizable Subtitle / Banner Overlay */}
            {overlayText && (
              <div 
                className={`absolute left-4 right-4 z-20 pointer-events-none px-3 py-1.5 rounded-lg text-center font-bold text-xs truncate shadow-lg transition-all duration-300 ${
                  textPosition === 'top' ? 'top-6' : textPosition === 'center' ? 'top-1/2 -translate-y-1/2' : 'bottom-6'
                } ${
                  textAnimation === 'flicker' ? 'animate-flicker' : 
                  textAnimation === 'pulse' ? 'animate-pulse' : 
                  textAnimation === 'slide' ? 'animate-bounce' : ''
                }`}
                style={{ 
                  color: textColor, 
                  backgroundColor: bgColor + "dd", // slight transparency
                  borderColor: textColor,
                  borderWidth: '1px'
                }}
              >
                {overlayText}
              </div>
            )}

            {/* Unstarted Watermark */}
            {!isPlaying && (
              <button 
                onClick={togglePlay}
                className="absolute inset-0 bg-black/45 hover:bg-black/35 transition-colors flex items-center justify-center cursor-pointer z-30"
              >
                <div className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
              </button>
            )}
          </div>

          {/* Timeline & Audio Synchronization Controls */}
          <div className="space-y-2 mt-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            {/* Timeline slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>{videoRef.current ? new Date(videoRef.current.currentTime * 1000).toISOString().substr(14, 5) : "00:00"}</span>
                <span>{videoRef.current && !isNaN(duration) ? new Date(duration * 1000).toISOString().substr(14, 5) : "00:00"}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={videoProgress}
                onChange={handleProgressChange}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-slate-300" /> : <Play className="w-4 h-4 fill-slate-300" />}
                </button>

                {/* Speaker controllers */}
                <div className="flex items-center gap-1 group/vol">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseInt(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-14 h-1 bg-slate-800 rounded-lg cursor-pointer accent-blue-500 opacity-0 group-hover/vol:opacity-100 transition-opacity"
                  />
                </div>
              </div>

              {/* Music syncing status */}
              {selectedMusic !== "none" && (
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <Music className="w-3 h-3 animate-bounce" />
                  Đồng bộ nhạc nền
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tab Options & Effects Configurations (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 p-6 flex flex-col justify-between max-h-[90vh] lg:h-[680px] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-base font-bold text-slate-800">Studio Sản Xuất Video AI</h2>
                <p className="text-[11px] text-slate-400 font-medium">Chọn video mẫu, lồng nhạc nền và áp hiệu ứng chuẩn thương hiệu</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-slate-700 text-xs">
            
            {/* Section 1: Video Sources */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bước 1: Chọn Video gốc</span>
                <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveSourceTab('stock')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${activeSourceTab === 'stock' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Thư viện mẫu
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSourceTab('upload')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${activeSourceTab === 'upload' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Tải lên / Link ngoài
                  </button>
                </div>
              </div>

              {activeSourceTab === 'stock' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STOCK_VIDEOS.map((vid) => (
                    <button
                      key={vid.id}
                      onClick={() => {
                        setSelectedVideoUrl(vid.url);
                        setIsPlaying(false);
                        setVideoProgress(0);
                      }}
                      className={`relative rounded-xl overflow-hidden text-left h-16 border transition-all cursor-pointer ${
                        selectedVideoUrl === vid.url
                          ? "border-blue-600 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-slate-350"
                      }`}
                    >
                      <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 p-1.5 flex flex-col justify-end">
                        <span className="text-[9px] font-bold text-white line-clamp-1 leading-tight">{vid.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-2xl">
                  {/* Local upload */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tải lên video MP4 từ thiết bị</label>
                    <div className="relative border border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 text-center transition-all">
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime"
                        onChange={handleLocalVideoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-[11px] font-bold text-slate-600 block">Chọn tệp MP4</span>
                      <span className="text-[9px] text-slate-400">Tối đa 15MB cho phép</span>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hoặc dán Link video trực tiếp</label>
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="Dán link .mp4 trực tiếp..."
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customUrl.trim()) {
                            setSelectedVideoUrl(customUrl.trim());
                            setIsPlaying(false);
                            setVideoProgress(0);
                          }
                        }}
                        className="w-full py-1 bg-slate-800 text-white rounded-lg font-bold text-[10px] hover:bg-slate-900 cursor-pointer"
                      >
                        Áp dụng liên kết
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: AI Video Effect Generator */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ý tưởng hiệu ứng AI (Gemini Powered)
                </span>
                <span className="text-[8px] uppercase bg-blue-600/30 text-blue-300 font-mono px-1.5 py-0.2 rounded font-bold">Smart Video v2</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Mô tả ý tưởng video (Ví dụ: Giảm giá 50% cực bốc phong cách Cyberpunk tím đỏ)..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-xs text-white rounded-xl placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleApplyAiVideoPrompt}
                  disabled={isAiProcessing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {isAiProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkle className="w-3.5 h-3.5" />}
                  <span>Áp dụng</span>
                </button>
              </div>

              {aiTip && (
                <p className="text-[10px] text-emerald-300 font-medium bg-emerald-950/40 p-2 border border-emerald-900/30 rounded-lg">
                  {aiTip}
                </p>
              )}
            </div>

            {/* Section 3: Color Effects & Presets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Bước 2: Hiệu ứng lọc màu và khung viền</span>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {EFFECT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setActiveEffect(preset.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between h-20 bg-white ${
                      activeEffect === preset.id
                        ? "border-blue-600 bg-blue-50/40 text-blue-700 ring-1 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <span className="text-sm block mx-auto">{preset.name.split(" ")[0]}</span>
                    <span className="text-[9px] font-bold truncate block w-full">{preset.name.split(" ").slice(1).join(" ")}</span>
                    <span className="text-[8px] text-slate-400 scale-95 origin-center block truncate">{preset.name.includes("Gốc") ? "Không màu" : "Có hiệu ứng"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4: Overlay & Custom Subtitle Label Editor */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Bước 3: Ghép nhãn văn bản (Overlay Text)</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nội dung hiển thị</label>
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="Không hiển thị..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hiệu ứng chuyển động chữ</label>
                  <select
                    value={textAnimation}
                    onChange={(e) => setTextAnimation(e.target.value as any)}
                    className="w-full px-3 py-1.8 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="static">Tĩnh lặng (Static)</option>
                    <option value="flicker">Chớp tắt liên tục (Flicker)</option>
                    <option value="pulse">Nhịp đập êm (Pulse)</option>
                    <option value="slide">Nảy nhịp nhàng (Bounce)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {/* Text Color */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Màu chữ</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-6 h-6 border-0 p-0 rounded cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] font-mono uppercase text-slate-500">{textColor}</span>
                  </div>
                </div>

                {/* Bg Color */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Màu nền nhãn</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-6 h-6 border-0 p-0 rounded cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] font-mono uppercase text-slate-500">{bgColor}</span>
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vị trí nhãn</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-bold w-full">
                    <button
                      type="button"
                      onClick={() => setTextPosition('top')}
                      className={`flex-1 py-1 rounded transition-all cursor-pointer ${textPosition === 'top' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500'}`}
                    >
                      Trên
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextPosition('center')}
                      className={`flex-1 py-1 rounded transition-all cursor-pointer ${textPosition === 'center' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500'}`}
                    >
                      Giữa
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextPosition('bottom')}
                      className={`flex-1 py-1 rounded transition-all cursor-pointer ${textPosition === 'bottom' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500'}`}
                    >
                      Dưới
                    </button>
                  </div>
                </div>

                {/* Reset button */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setOverlayText("MÁY TÍNH MŨI NÉ - GIÁM GIÁ 30%");
                      setTextColor("#ffffff");
                      setBgColor("#ef4444");
                      setTextPosition('bottom');
                      setTextAnimation('pulse');
                    }}
                    className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset nhãn
                  </button>
                </div>
              </div>
            </div>

            {/* Section 5: Audio & Soundtracks */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Bước 4: Đồng bộ Nhạc nền cuốn hút</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Danh sách nhạc bản quyền</label>
                  <select
                    value={selectedMusic}
                    onChange={(e) => setSelectedMusic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {MUSIC_TRACKS.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Âm lượng nhạc nền ({musicVolume}%)</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <Music className="w-4 h-4 text-slate-400" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                      className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      disabled={selectedMusic === "none"}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Action rendering bar */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            
            {/* If currently encoding */}
            {isRendering ? (
              <div className="bg-slate-900 p-4 rounded-2xl text-white space-y-2 animate-in fade-in duration-100">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    {renderStep}
                  </span>
                  <span>{renderProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-150"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                >
                  Đóng Studio
                </button>

                <button
                  type="button"
                  onClick={handleStartRender}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Biên Dịch & Áp Dụng Video Cho Bài Viết</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
