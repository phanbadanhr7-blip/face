import React, { useState } from "react";
import { FacebookPage } from "../types";
import { 
  Plus, 
  Info, 
  Copy, 
  Check, 
  Trash2, 
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Facebook
} from "lucide-react";

interface ConnectionsTabProps {
  pages: FacebookPage[];
  onAddPage: (page: Omit<FacebookPage, "id" | "createdAt" | "isConnected"> & { id?: string }) => void;
  onDisconnectPage: (id: string) => void;
  onSetDefaultPage: (id: string) => void;
}

const STOCK_AVATARS = [
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60", // Tech workspace
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60", // Gaming hardware
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=60", // Tech marketing
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=60", // Developer
];

export default function ConnectionsTab({ pages, onAddPage, onDisconnectPage, onSetDefaultPage }: ConnectionsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Form State
  const [pageName, setPageName] = useState("");
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(STOCK_AVATARS[0]);
  const [isDefault, setIsDefault] = useState(false);

  const handleFacebookLogin = async () => {
    try {
      setAuthLoading(true);
      
      // 1. Fetch authorization URL from server
      const response = await fetch('/api/auth/facebook/url');
      if (!response.ok) {
        throw new Error('Failed to fetch authentication URL');
      }
      const { url } = await response.json();

      // 2. Open popup
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const authWindow = window.open(
        url,
        'facebook_login_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!authWindow) {
        alert('Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cho phép bật lên để đăng nhập Facebook!');
        setAuthLoading(false);
      }
    } catch (err) {
      console.error("Facebook Login Error:", err);
      alert("Đã xảy ra lỗi khi khởi tạo đăng nhập Facebook.");
      setAuthLoading(false);
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
            isDefault: index === 0 && pages.length === 0, // Set first page as default if no pages existed
          });
        });
        alert(`Đăng nhập thành công! Đã tự động kết nối ${importedPages.length} trang Facebook.`);
        setShowAddModal(false);
      }
      setAuthLoading(false);
    };

    // 1. PostMessage listener
    const handleMessage = (event: MessageEvent) => {
      // Validate origin - support same-origin, local development, and cloud run/AI studio domains
      const origin = event.origin;
      const isAllowedOrigin = 
        origin === window.location.origin ||
        origin.endsWith('.run.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.google.com') ||
        origin.endsWith('.googleusercontent.com') ||
        origin.endsWith('.aistudio.google');

      if (!isAllowedOrigin) {
        return;
      }

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
      console.warn("BroadcastChannel not supported in this environment:", e);
    }

    // 3. LocalStorage storage event listener fallback
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'fb_auth_success' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data && data.pages) {
            processImportedPages(data.pages);
            // Clear storage key
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
      if (bc) {
        bc.close();
      }
    };
  }, [pages, onAddPage]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName.trim() || !pageId.trim()) return;

    onAddPage({
      id: pageId.trim(),
      name: pageName.trim(),
      accessToken: accessToken.trim(),
      picture: avatarUrl,
      isDefault: isDefault,
    });

    // Reset Form
    setPageName("");
    setPageId("");
    setAccessToken("");
    setAvatarUrl(STOCK_AVATARS[0]);
    setIsDefault(false);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kênh Kết Nối</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hồ sơ Fanpage và các tích hợp mạng xã hội</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kết Nối Kênh Mới</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            Thêm Hồ Sơ
          </button>
        </div>
      </div>

      {/* Filter / Search section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Bộ lọc</span>
          <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-hidden focus:border-slate-300">
            <option>Tất cả hồ sơ</option>
            <option>Chỉ các Trang Facebook</option>
            <option>Chỉ kênh đăng mặc định</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-hidden">
            <option>Tất cả nền tảng</option>
            <option>Facebook</option>
          </select>
          <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-hidden">
            <option>Tất cả trạng thái</option>
            <option>Đã kết nối</option>
            <option>Chưa kết nối</option>
          </select>
          <button className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div 
            key={page.id} 
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 rounded-md text-white">
                  <Facebook className="w-4 h-4 fill-white text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-slate-800">Facebook</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">đã kết nối</span>
                  </div>
                </div>
              </div>
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Card Body */}
            <div className="p-4 flex-1">
              <div className="flex items-start gap-3">
                <img 
                  src={page.picture} 
                  alt={page.name} 
                  className="w-12 h-12 rounded-lg object-cover border border-slate-100"
                  onError={(e) => {
                    // Fallback avatar
                    e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60";
                  }}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 text-sm leading-tight">{page.name}</h4>
                    {page.isDefault && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                    <span>{page.name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400 font-normal">ID: {page.id.substring(0, 8)}...</span>
                    <button 
                      onClick={() => handleCopyId(page.id)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                      title="Sao chép ID Trang"
                    >
                      {copiedId === page.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-slate-400">Kết nối lúc: {new Date(page.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Status details */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Mã truy cập trang (Token):</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {page.accessToken ? "••••••••••••" + page.accessToken.substring(page.accessToken.length - 4) : "Mã Demo/Mô phỏng"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Quyền đăng tải bài viết:</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Đang hoạt động
                  </span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button 
                onClick={() => onSetDefaultPage(page.id)}
                className={`text-xs px-2.5 py-1.5 font-semibold rounded-lg border transition-all ${
                  page.isDefault 
                    ? "bg-slate-100 text-slate-500 border-transparent" 
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                }`}
                disabled={page.isDefault}
              >
                {page.isDefault ? "Kênh Mặc Định" : "Đặt Mặc Định"}
              </button>
              
              <div className="flex items-center gap-1.5">
                <button className="text-xs px-2.5 py-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-semibold rounded-lg transition-all cursor-pointer">
                  Quản lý nội dung
                </button>
                <button 
                  onClick={() => onDisconnectPage(page.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                  title="Ngắt kết nối trang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {pages.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center border border-slate-100">
              <Facebook className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Chưa cấu hình kênh kết nối</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                Đăng nhập tài khoản Facebook của bạn để tự động liên kết nhanh tất cả các trang bạn quản lý, hoặc điền thông tin thủ công.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleFacebookLogin}
                disabled={authLoading}
                className="px-5 py-2.5 bg-[#1877F2] hover:bg-[#1565C0] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
              >
                <Facebook className="w-4 h-4 fill-current" />
                <span>{authLoading ? "Đang kết nối..." : "Đăng nhập Facebook (Kết nối nhanh)"}</span>
              </button>
              
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cấu hình thủ công</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Connection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Kết Nối Trang Facebook</h3>
                <p className="text-xs text-slate-500">Cung cấp thông tin để đăng tải bài viết trực tiếp lên Facebook</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Login Section */}
            <div className="px-5 pt-4 pb-1 border-b border-slate-100 bg-blue-50/40">
              <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs space-y-2">
                <p className="text-[11px] font-semibold text-blue-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Kết nối cực nhanh qua Đăng nhập Facebook
                </p>
                <button 
                  type="button"
                  onClick={handleFacebookLogin}
                  disabled={authLoading}
                  className="w-full py-2 bg-[#1877F2] hover:bg-[#1565C0] text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                >
                  <Facebook className="w-3.5 h-3.5 fill-current" />
                  <span>{authLoading ? "Đang kết nối..." : "Đăng nhập bằng Facebook"}</span>
                </button>
              </div>
              <div className="relative flex py-3.5 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hoặc nhập thủ công</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Tên Trang (Fanpage) *
                </label>
                <input 
                  type="text" 
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  placeholder="Ví dụ: Máy Tính Mũi Né" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Facebook Page ID *
                </label>
                <input 
                  type="text" 
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  placeholder="Ví dụ: 10248591837582" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Tìm thấy trong mục giới thiệu hoặc thông tin chi tiết của Fanpage</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Mã Access Token của Trang (Không bắt buộc với Demo)
                </label>
                <input 
                  type="password" 
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAA..." 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Để trống để hoạt động ở <strong>chế độ Demo/Mô phỏng</strong>. Xem Hướng dẫn cấu hình để lấy token thật.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Chọn ảnh đại diện thể loại Trang
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
                  Đặt trang này làm kênh đăng mặc định
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Lưu Kết Nối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
