import React from "react";
import { 
  Link2, 
  FileText, 
  BarChart3, 
  Inbox, 
  Megaphone, 
  Key, 
  Users, 
  Webhook, 
  Terminal, 
  Settings, 
  BookOpen, 
  HelpCircle,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "connections", name: "Kết nối Trang", icon: Link2 },
    { id: "messenger", name: "Hộp thư Messenger", icon: Inbox },
    { id: "create-post", name: "Tạo bài viết AI", icon: Sparkles },
    { id: "post-queue", name: "Hàng đợi & Lịch đăng", icon: FileText },
    { id: "analytics", name: "Thống kê & Báo cáo", icon: BarChart3 },
    { id: "api-guide", name: "Hướng dẫn Cấu hình", icon: Key },
  ];

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 text-slate-700 font-sans z-10 select-none">
      {/* Profile Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            BD
          </div>
          <div className="overflow-hidden">
            <h2 className="font-semibold text-sm text-slate-800 truncate">Ba Danh</h2>
            <p className="text-xs text-slate-500 truncate">danhcan@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider">
          Menu
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-blue-50 text-blue-900 font-semibold border border-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              {item.name}
            </button>
          );
        })}

        {/* Dummy Disabled Items matching Screenshot for realism */}
        <p className="text-[10px] font-bold text-slate-400 uppercase px-3 pt-4 mb-2 tracking-wider">
          Tiện ích Hệ thống
        </p>
        <div className="space-y-0.5 opacity-60">
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-slate-500">
            <Megaphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Trình quản lý Quảng cáo</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-slate-500">
            <Webhook className="w-3.5 h-3.5 text-slate-400" />
            <span>Kết nối Webhooks</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-slate-500">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Nhật ký Hệ thống</span>
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          <span>Tài liệu Hướng dẫn</span>
        </div>
        <span className="text-[10px] text-slate-400">v1.2.0</span>
      </div>
    </div>
  );
}
