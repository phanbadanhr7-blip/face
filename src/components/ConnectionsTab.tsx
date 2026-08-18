import React, { useState } from "react";
import { FacebookPage } from "../types";
import { 
  Plus, 
  Info, 
  Copy, 
  Check, 
  Trash2, 
  SlidersHorizontal,
  ShieldCheck,
  Facebook,
  KeyRound,
  Sparkles,
  AlertCircle
} from "lucide-react";

interface ConnectionsTabProps {
  pages: FacebookPage[];
  onAddPage: (page: Omit<FacebookPage, "id" | "createdAt" | "isConnected"> & { id?: string }) => void;
  onDisconnectPage: (id: string) => void;
  onSetDefaultPage: (id: string) => void;
  onClearAllData?: () => void;
}

const STOCK_AVATARS = [
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60", // Tech workspace
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60", // Gaming hardware
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=60", // Tech marketing
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=60", // Developer
];

export default function ConnectionsTab({ pages, onAddPage, onDisconnectPage, onSetDefaultPage, onClearAllData }: ConnectionsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [inputToken, setInputToken] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"oauth" | "token" | "manual">("oauth");
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>("all");

  // Manual Form State
  const [pageName, setPageName] = useState("");
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [manualAccountName, setManualAccountName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(STOCK_AVATARS[0]);
  const [isDefault, setIsDefault] = useState(false);

  const handleFacebookLogin = async (openInNewTab: boolean = false) => {
    try {
      setAuthLoading(true);
      
      // 1. Fetch authorization URL from server
      const response = await fetch('/api/auth/facebook/url');
      if (!response.ok) {
        throw new Error('Failed to fetch authentication URL');
      }
      const { url } = await response.json();

      if (openInNewTab) {
        window.open(url, '_blank', 'noopener,noreferrer');
        setAuthLoading(false);
        return;
      }

      // 2. Open popup
      const width = 550;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const authWindow = window.open(
        url,
        'facebook_login_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!authWindow) {
        // Fallback to opening in new tab if popup is blocked
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error("Facebook Login Error:", err);
      alert("Đã xảy ra lỗi khi khởi tạo đăng nhập Facebook.");
    } finally {
      setTimeout(() => setAuthLoading(false), 2000);
    }
  };

  // Auto scan pages from access token
  const handleScanToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;

    try {
      setScanLoading(true);
      setScanError(null);

      const res = await fetch("/api/facebook/inspect-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inputToken.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.pages || data.pages.length === 0) {
        throw new Error(data.error || "Không tìm thấy trang Fanpage nào từ mã Token này.");
      }

      // Add each discovered page
      data.pages.forEach((p: any, index: number) => {
        onAddPage({
          id: p.id,
          name: p.name,
          accessToken: p.accessToken,
          picture: p.picture,
          isDefault: index === 0 && pages.length === 0,
          accountName: p.accountName || "MÁY TÍNH MŨI NÉ",
        });
      });

      alert(`Kết nối thành công! Đã tự động thêm ${data.pages.length} trang Facebook.`);
      setInputToken("");
      setShowAddModal(false);
    } catch (err: any) {
      setScanError(err.message || "Lỗi kiểm tra mã Token.");
    } finally {
      setScanLoading(false);
    }
  };

  // Listen for the callback postMessage or BroadcastChannel or localStorage fallback
  React.useEffect(() => {
    const processImportedPages = (importedPages: any[]) => {
      if (importedPages.length === 0) {
        alert("Không tìm thấy trang Facebook nào được quản lý bởi tài khoản này.");
      } else {
        // Add each page to the connections
        importedPages.forEach((p: any, index: number) => {
          onAddPage({
            id: p.id,
            name: p.name,
            accessToken: p.accessToken,
            picture: p.picture,
            isDefault: index === 0 && pages.length === 0,
            accountName: p.accountName || "MÁY TÍNH MŨI NÉ",
          });
        });
        alert(`Đăng nhập thành công! Đã tự động kết nối ${importedPages.length} trang Facebook.`);
        setShowAddModal(false);
      }
      setAuthLoading(false);
    };

    // 1. PostMessage listener
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      const isAllowedOrigin = 
        origin === window.location.origin ||
        origin.endsWith('.run.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.google.com') ||
        origin.endsWith('.googleusercontent.com') ||
        origin.endsWith('.aistudio.google');

      if (!isAllowedOrigin) return;

      if (event.data?.type === 'FB_AUTH_SUCCESS') {
        const importedPages = event.data.pages || [];
        processImportedPages(importedPages);
      }
    };

    // 2. BroadcastChannel listener
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('facebook_auth');
      bc.onmessage = (event) => {
        if (event.data?.type === 'FB_AUTH_SUCCESS') {
          const importedPages = event.data.pages || [];
          processImportedPages(importedPages);
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }

    // 3. LocalStorage storage event listener fallback
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'fb_auth_success' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data && data.pages) {
            processImportedPages(data.pages);
            localStorage.removeItem('fb_auth_success');
          }
        } catch (e) {
          console.error("Failed to parse storage authentication data:", e);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, [pages, onAddPage]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName.trim() || !pageId.trim()) return;

    onAddPage({
      id: pageId.trim(),
      name: pageName.trim(),
      accessToken: accessToken.trim(),
      picture: avatarUrl,
      isDefault: isDefault,
      accountName: manualAccountName.trim() || "MÁY TÍNH MŨI NÉ",
    });

    setPageName("");
    setPageId("");
    setAccessToken("");
    setManualAccountName("");
    setAvatarUrl(STOCK_AVATARS[0]);
    setIsDefault(false);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Kênh Kết Nối</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Quản lý hồ sơ Fanpage và các tích hợp mạng xã hội</p>
        </div>
        <div className="flex items-center gap-2">
          {onClearAllData && (
            <button 
              onClick={onClearAllData}
              className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 rounded-lg text-sm font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Xóa sạch dữ liệu lưu trữ để đăng nhập một tài khoản Facebook mới"
            >
              <span>Xóa bộ nhớ & Đăng xuất</span>
            </button>
          )}
          <button 
            onClick={() => { setActiveModalTab("oauth"); setShowAddModal(true); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kết Nối Kênh Mới</span>
          </button>
        </div>
      </div>

      {/* Connected Facebook Accounts filtering */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Facebook className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Tài khoản Facebook đã kết nối ({Array.from(new Set(pages.map(p => p.accountName || "MÁY TÍNH MŨI NÉ"))).length})
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedAccountFilter("all")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedAccountFilter === "all"
                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80"
            }`}
          >
            <span>👥 Tất cả tài khoản</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedAccountFilter === "all" ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
              {pages.length}
            </span>
          </button>
          {Array.from(new Set(pages.map(p => p.accountName || "MÁY TÍNH MŨI NÉ"))).map((account) => {
            const count = pages.filter(p => (p.accountName || "MÁY TÍNH MŨI NÉ") === account).length;
            let badgeBg = "bg-sky-500";
            if (account.includes("Nguyễn Văn A")) badgeBg = "bg-emerald-500";
            if (account.includes("Trần Thị B")) badgeBg = "bg-purple-500";
            return (
              <button
                key={account}
                onClick={() => setSelectedAccountFilter(account)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                  selectedAccountFilter === account
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${badgeBg}`}></span>
                <span>{account}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedAccountFilter === account ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter / Search section */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bộ lọc</span>
          <select className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden">
            <option>Tất cả hồ sơ</option>
            <option>Chỉ các Trang Facebook</option>
            <option>Chỉ kênh đăng mặc định</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-hidden">
            <option>Tất cả nền tảng</option>
            <option>Facebook</option>
          </select>
          <select className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-hidden">
            <option>Tất cả trạng thái</option>
            <option>Đã kết nối</option>
            <option>Chưa kết nối</option>
          </select>
          <button className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages
          .filter((p) => {
            if (selectedAccountFilter === "all") return true;
            return (p.accountName || "MÁY TÍNH MŨI NÉ") === selectedAccountFilter;
          })
          .map((page) => (
            <div 
              key={page.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950/50"></span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Đang hoạt động</span>
                </div>
                {page.isDefault ? (
                  <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[11px] font-bold rounded-full border border-blue-100 dark:border-blue-800">
                    Mặc định
                  </span>
                ) : (
                  <button
                    onClick={() => onSetDefaultPage(page.id)}
                    className="text-xs text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    Đặt mặc định
                  </button>
                )}
              </div>

            {/* Card Body */}
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-center gap-3.5">
                <img 
                  src={page.picture} 
                  alt={page.name} 
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">{page.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="truncate">ID: {page.id}</span>
                    <button 
                      onClick={() => handleCopyId(page.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                      title="Sao chép ID"
                    >
                      {copiedId === page.id ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1.5 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Tài khoản FB:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      (page.accountName || "MÁY TÍNH MŨI NÉ").includes("Nguyễn Văn A") ? "bg-emerald-500" :
                      (page.accountName || "MÁY TÍNH MŨI NÉ").includes("Trần Thị B") ? "bg-purple-500" : "bg-sky-500"
                    }`}></span>
                    {page.accountName || "MÁY TÍNH MŨI NÉ"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Loại kết nối:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Facebook Graph API v18.0</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Trạng thái Token:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Đã kích hoạt</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
              <button 
                onClick={() => onDisconnectPage(page.id)}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ngắt kết nối</span>
              </button>
            </div>
          </div>
        ))}

        {pages.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center border border-slate-100 dark:border-slate-800">
              <Facebook className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">Chưa cấu hình kênh kết nối Facebook</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1">
                Liên kết tài khoản Facebook để quản trị Fanpage và xuất bản bài viết tự động.
              </p>
            </div>

            <div className="flex justify-center w-full max-w-sm pt-2">
              <button 
                onClick={() => handleFacebookLogin(true)}
                disabled={authLoading}
                className="w-full p-3.5 bg-[#1877F2] hover:bg-[#1565C0] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Facebook className="w-5 h-5 fill-current" />
                <span>Đăng nhập bằng Facebook</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add Connection */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Kết Nối Trang Facebook</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Chọn phương thức liên kết tiện lợi nhất cho bạn</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 p-1.5 gap-1.5">
              <button
                onClick={() => setActiveModalTab("oauth")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeModalTab === "oauth" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Facebook className="w-3.5 h-3.5 fill-current" />
                <span>Đăng nhập OAuth</span>
              </button>
              <button
                onClick={() => setActiveModalTab("token")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeModalTab === "token" ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quét mã Token</span>
              </button>
              <button
                onClick={() => setActiveModalTab("manual")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeModalTab === "manual" ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thủ công</span>
              </button>
            </div>

            {/* TAB 1: OAuth Login */}
            {activeModalTab === "oauth" && (
              <div className="p-6 space-y-4">
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Đăng nhập tài khoản Facebook
                  </h4>
                  <p className="text-xs text-blue-700/90 leading-relaxed">
                    Hệ thống sẽ mở trang đăng nhập chính thức của Facebook. Hãy nhấn cho phép để ứng dụng tự động nhận diện tất cả các Fanpage mà bạn đang quản lý.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button 
                    type="button"
                    onClick={() => handleFacebookLogin(true)}
                    disabled={authLoading}
                    className="w-full py-3 bg-[#1877F2] hover:bg-[#1565C0] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
                  >
                    <Facebook className="w-4 h-4 fill-current" />
                    <span>Mở đăng nhập Facebook (Tab Riêng - Khuyên dùng)</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleFacebookLogin(false)}
                    disabled={authLoading}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Mở cửa sổ nhỏ (Popup)</span>
                  </button>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Lưu ý về môi trường AI Studio:
                  </p>
                  <p className="text-amber-700">
                    Nếu bạn gặp lỗi Google 403, đó là do khung preview iframe của AI Studio chặn popup. Hãy chọn <strong>"Mở đăng nhập Facebook (Tab Riêng)"</strong> hoặc chuyển sang tab <strong>"Quét mã Token"</strong> ở trên!
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: Token Auto Scanner */}
            {activeModalTab === "token" && (
              <form onSubmit={handleScanToken} className="p-6 space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Tự động nhận diện Trang từ Token
                  </p>
                  <p className="leading-relaxed">
                    Bạn chỉ cần dán <strong>User Token</strong> hoặc <strong>Page Token</strong> lấy từ <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-950">Graph API Explorer</a>, hệ thống sẽ tự động quét và thêm tất cả Fanpage trong 1 click.
                  </p>
                </div>

                {scanError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{scanError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dán mã Access Token Facebook
                  </label>
                  <textarea
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    rows={3}
                    placeholder="EAA..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={scanLoading || !inputToken.trim()}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:bg-slate-300"
                  >
                    {scanLoading ? "Đang quét..." : "Quét & Thêm Fanpage Ngay"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Manual Form */}
            {activeModalTab === "manual" && (
              <form onSubmit={handleSubmitManual} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tên Trang (Fanpage) *
                  </label>
                  <input 
                    type="text" 
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    placeholder="Ví dụ: Máy Tính Mũi Né" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Facebook Page ID *
                  </label>
                  <input 
                    type="text" 
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                    placeholder="Ví dụ: 10248591837582" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tên tài khoản Facebook (Cá nhân liên kết)
                  </label>
                  <input 
                    type="text" 
                    value={manualAccountName}
                    onChange={(e) => setManualAccountName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A (Mặc định: MÁY TÍNH MŨI NÉ)" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mã Access Token của Trang
                  </label>
                  <input 
                    type="password" 
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="EAA..." 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Chọn ảnh đại diện
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {STOCK_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={`relative rounded-lg overflow-hidden border-2 h-12 w-full transition-all cursor-pointer ${
                          avatarUrl === url ? "border-blue-600 scale-95" : "border-transparent"
                        }`}
                      >
                        <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="set-default"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <label htmlFor="set-default" className="text-xs font-medium text-slate-700 select-none cursor-pointer">
                    Đặt làm trang mặc định khi xuất bản bài viết
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Lưu Trang
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
