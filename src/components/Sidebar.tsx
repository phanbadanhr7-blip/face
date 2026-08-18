import React from "react";
import { 
  Link2, 
  BarChart3, 
  Inbox, 
  Key, 
  Sparkles,
  X,
  Settings,
  Bot,
  Sun,
  Moon
} from "lucide-react";
import InstallPwaBanner from "./InstallPwaBanner";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen = false, 
  onClose = () => {},
  theme = "light",
  onToggleTheme = () => {}
}: SidebarProps) {
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 text-slate-700 dark:text-slate-200 font-sans z-40 select-none transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Profile Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              MT
            </div>
            <div className="overflow-hidden">
              <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">MÁY TÍNH MŨI NÉ</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Quản trị viên</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={theme === "dark" ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            {/* Close button for mobile */}
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-3 mb-2 tracking-wider">
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
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-800/60"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* PWA Install Banner */}
        <div className="pt-2 pb-3 border-t border-slate-200/80 dark:border-slate-800">
          <InstallPwaBanner />
        </div>
      </div>
    </>
  );
}
