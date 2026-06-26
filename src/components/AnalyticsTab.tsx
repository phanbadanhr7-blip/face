import React, { useState } from "react";
import { FacebookPage } from "../types";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar,
  Cell
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointerClick, 
  Heart, 
  MessageSquare,
  RefreshCw,
  Calendar
} from "lucide-react";

interface AnalyticsTabProps {
  pages: FacebookPage[];
}

// Mock Analytics timeline data
const PAGE_ANALYTICS_DATA: Record<string, any[]> = {
  "default": [
    { date: "06/19", reach: 1200, engagement: 210, likes: 85, comments: 22, shares: 12 },
    { date: "06/20", reach: 1540, engagement: 280, likes: 110, comments: 34, shares: 18 },
    { date: "06/21", reach: 1890, engagement: 310, likes: 130, comments: 40, shares: 25 },
    { date: "06/22", reach: 2400, engagement: 420, likes: 185, comments: 65, shares: 42 },
    { date: "06/23", reach: 3100, engagement: 590, likes: 240, comments: 85, shares: 60 },
    { date: "06/24", reach: 2800, engagement: 510, likes: 210, comments: 70, shares: 55 },
    { date: "06/25", reach: 3400, engagement: 640, likes: 280, comments: 94, shares: 68 },
  ],
  "May Tinh Mui Ne": [
    { date: "06/19", reach: 850, engagement: 150, likes: 62, comments: 14, shares: 8 },
    { date: "06/20", reach: 1100, engagement: 195, likes: 78, comments: 21, shares: 12 },
    { date: "06/21", reach: 1340, engagement: 220, likes: 90, comments: 28, shares: 15 },
    { date: "06/22", reach: 1980, engagement: 350, likes: 142, comments: 48, shares: 31 },
    { date: "06/23", reach: 2500, engagement: 470, likes: 195, comments: 64, shares: 48 },
    { date: "06/24", reach: 2200, engagement: 410, likes: 168, comments: 55, shares: 40 },
    { date: "06/25", reach: 2950, engagement: 560, likes: 235, comments: 78, shares: 58 },
  ]
};

export default function AnalyticsTab({ pages }: AnalyticsTabProps) {
  const [selectedPageName, setSelectedPageName] = useState<string>(() => {
    return pages.length > 0 ? pages[0].name : "default";
  });
  const [metricType, setMetricType] = useState<'reach' | 'engagement' | 'likes'>('reach');

  // Find analytics data or default
  const chartData = PAGE_ANALYTICS_DATA[selectedPageName] || PAGE_ANALYTICS_DATA["default"];

  // Compute stats totals
  const totalReach = chartData.reduce((acc, curr) => acc + curr.reach, 0);
  const totalEngagement = chartData.reduce((acc, curr) => acc + curr.engagement, 0);
  const totalLikes = chartData.reduce((acc, curr) => acc + curr.likes, 0);
  const totalComments = chartData.reduce((acc, curr) => acc + curr.comments, 0);
  const totalShares = chartData.reduce((acc, curr) => acc + curr.shares, 0);
  
  const engagementRate = ((totalEngagement / totalReach) * 100).toFixed(1);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bảng Thống Kê & Phân Tích</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi lượt xem, tiếp cận và tương tác của khách hàng trong 7 ngày qua</p>
        </div>
        
        {/* Page Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kênh:</span>
          <select 
            value={selectedPageName}
            onChange={(e) => setSelectedPageName(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-hidden"
          >
            {pages.map(page => (
              <option key={page.id} value={page.name}>{page.name} (Trang Facebook)</option>
            ))}
            <option value="default">Chỉ số chung của hệ thống</option>
          </select>
        </div>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat item */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lượt tiếp cận</p>
            <p className="text-2xl font-bold text-slate-800">{totalReach.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2% so với tuần trước
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Stat item */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tỷ lệ tương tác</p>
            <p className="text-2xl font-bold text-slate-800">{engagementRate}%</p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +2.1% so với tuần trước
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <MousePointerClick className="w-5 h-5" />
          </div>
        </div>

        {/* Stat item */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lượt Thích</p>
            <p className="text-2xl font-bold text-slate-800">{totalLikes.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +8.5% so với tuần trước
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        {/* Stat item */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bình luận & Chia sẻ</p>
            <p className="text-2xl font-bold text-slate-800">{(totalComments + totalShares).toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +19.3% so với tuần trước
            </span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Area Chart: Trend performance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Biểu đồ hiệu suất kênh</h3>
              <p className="text-xs text-slate-400">Xem tiến trình biến động số liệu chi tiết trong 7 ngày qua</p>
            </div>
            
            {/* Metric select */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setMetricType('reach')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  metricType === 'reach' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tiếp cận
              </button>
              <button
                onClick={() => setMetricType('engagement')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  metricType === 'engagement' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Nhấp chuột
              </button>
              <button
                onClick={() => setMetricType('likes')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  metricType === 'likes' ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Lượt Thích
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey={metricType} 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                  name={metricType === 'reach' ? 'Lượt tiếp cận' : metricType === 'engagement' ? 'Lượt nhấp chuột tương tác' : 'Lượt thích'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Content Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-4 space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Cơ cấu Tương tác</h3>
            <p className="text-xs text-slate-400">Chi tiết phân bổ phản hồi của khách hàng</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Likes", count: totalLikes, fill: "#F43F5E" },
                  { name: "Comments", count: totalComments, fill: "#3B82F6" },
                  { name: "Shares", count: totalShares, fill: "#10B981" }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  <Cell fill="#F43F5E" />
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Thích</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Bình luận</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Chia sẻ</span>
          </div>
        </div>

      </div>

    </div>
  );
}
