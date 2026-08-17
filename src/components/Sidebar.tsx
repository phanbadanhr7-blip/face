import React from "react";
import { 
  Link2, 
  BarChart3, 
  Inbox, 
  Key, 
  BookOpen, 
  Sparkles,
  X,
  Settings,
  Bot
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen = false, onClose = () => {} }: SidebarProps) {
  const menuItems = [
    { id: "connections", name: "Kết nối Trang", icon: Link2 },
    { id: "messenger", name: "Hộp thư Messenger", icon: Inbox },
    { id: "create-post", name: "Tạo bài viết AI", icon: Sparkles },
    { id: "ai-prompt", name: "Kịch bản & Gợi ý AI", icon: Bot },
    { id: "posts-analytics", name: "Quản lý & Thống kê Bài viết", icon: BarChart3 },
    { id: "settings", name: "Cấu hình Hệ thống", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 text-slate-700 font-sans z-40 select-none transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Profile Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              MT
            </div>
            <div className="overflow-hidden">
              <h2 className="font-semibold text-sm text-slate-800 truncate">MÁY TÍNH MŨI NÉ</h2>
              <p className="text-xs text-slate-500 truncate">Quản trị viên</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
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
    </>
  );
}
