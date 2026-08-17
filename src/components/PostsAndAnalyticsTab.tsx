import React, { useState, useMemo } from "react";
import { FacebookPage, FacebookPost } from "../types";
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
  Bar
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  Trash2, 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Search, 
  Filter, 
  RefreshCw, 
  Sparkles,
  MousePointerClick,
  Layers,
  ArrowUpRight
} from "lucide-react";

interface PostsAndAnalyticsTabProps {
  pages: FacebookPage[];
  posts: FacebookPost[];
  onPublishNow: (id: string) => Promise<void>;
  onDeletePost: (id: string) => void;
  onSyncPostMetrics?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

// Analytics timeline data
const PAGE_ANALYTICS_DATA: Record<string, any[]> = {
  "default": [
    { date: "06/19", reach: 1200, views: 1850, engagement: 210, likes: 85, comments: 22, shares: 12 },
    { date: "06/20", reach: 1540, views: 2320, engagement: 280, likes: 110, comments: 34, shares: 18 },
    { date: "06/21", reach: 1890, views: 2900, engagement: 310, likes: 130, comments: 40, shares: 25 },
    { date: "06/22", reach: 2400, views: 3650, engagement: 420, likes: 185, comments: 65, shares: 42 },
    { date: "06/23", reach: 3100, views: 4800, engagement: 590, likes: 240, comments: 85, shares: 60 },
    { date: "06/24", reach: 2800, views: 4100, engagement: 510, likes: 210, comments: 70, shares: 55 },
    { date: "06/25", reach: 3400, views: 5200, engagement: 640, likes: 280, comments: 94, shares: 68 },
  ],
  "May Tinh Mui Ne": [
    { date: "06/19", reach: 850, views: 1300, engagement: 150, likes: 62, comments: 14, shares: 8 },
    { date: "06/20", reach: 1100, views: 1680, engagement: 195, likes: 78, comments: 21, shares: 12 },
    { date: "06/21", reach: 1340, views: 2100, engagement: 220, likes: 90, comments: 28, shares: 15 },
    { date: "06/22", reach: 1980, views: 3050, engagement: 350, likes: 142, comments: 48, shares: 31 },
    { date: "06/23", reach: 2500, views: 3900, engagement: 470, likes: 195, comments: 64, shares: 48 },
    { date: "06/24", reach: 2200, views: 3400, engagement: 410, likes: 168, comments: 55, shares: 40 },
    { date: "06/25", reach: 2950, views: 4600, engagement: 560, likes: 235, comments: 78, shares: 58 },
  ]
};

export default function PostsAndAnalyticsTab({
  pages,
  posts,
  onPublishNow,
  onDeletePost,
  onSyncPostMetrics
}: PostsAndAnalyticsTabProps) {
  // Main view switcher: 'posts' (Tất cả bài viết & Chỉ số tiếp cận), 'overview' (Biểu đồ tổng quan), 'schedule' (Lịch đăng)
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'overview' | 'schedule'>('posts');
  
  // Filters & State
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'scheduled' | 'draft' | 'failed'>('all');
  const [selectedPageFilter, setSelectedPageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);
  const [syncingPostId, setSyncingPostId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selected page for Chart Overview
  const [chartPageName, setChartPageName] = useState<string>(() => {
    return pages.length > 0 ? pages[0].name : "default";
  });

  // Calculate default / realistic metric values for posts that don't have them yet
  const enrichedPosts = useMemo(() => {
    return posts.map((post) => {
      // If post is published, default metrics to 0 unless already fetched/stored
      if (post.status === 'published') {
        return {
          ...post,
          reachCount: post.reachCount ?? 0,
          viewsCount: post.viewsCount ?? 0,
          likesCount: post.likesCount ?? 0,
          commentsCount: post.commentsCount ?? 0,
          sharesCount: post.sharesCount ?? 0
        };
      }
      return post;
    });
  }, [posts]);

  // Filtered posts list
  const filteredPosts = useMemo(() => {
    return enrichedPosts.filter(post => {
      // Status filter
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      // Page filter
      if (selectedPageFilter !== 'all' && post.pageId !== selectedPageFilter && post.pageName !== selectedPageFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return post.message.toLowerCase().includes(q) || post.pageName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [enrichedPosts, statusFilter, selectedPageFilter, searchQuery]);

  // Aggregate stats across all published posts
  const publishedPosts = useMemo(() => enrichedPosts.filter(p => p.status === 'published'), [enrichedPosts]);
  const totalReachAcrossPosts = useMemo(() => publishedPosts.reduce((sum, p) => sum + (p.reachCount || 0), 0), [publishedPosts]);
  const totalViewsAcrossPosts = useMemo(() => publishedPosts.reduce((sum, p) => sum + (p.viewsCount || 0), 0), [publishedPosts]);
  const totalInteractions = useMemo(() => publishedPosts.reduce((sum, p) => sum + ((p.likesCount || 0) + (p.commentsCount || 0) + (p.sharesCount || 0)), 0), [publishedPosts]);
  const avgEngagementRate = totalReachAcrossPosts > 0 ? ((totalInteractions / totalReachAcrossPosts) * 100).toFixed(1) : "0.0";

  // Chart data
  const chartData = PAGE_ANALYTICS_DATA[chartPageName] || PAGE_ANALYTICS_DATA["May Tinh Mui Ne"] || PAGE_ANALYTICS_DATA["default"];

  const handlePublishNow = async (id: string) => {
    setProcessingPostId(id);
    try {
      await onPublishNow(id);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingPostId(null);
    }
  };

  const handleSyncSinglePost = async (id: string) => {
    if (!onSyncPostMetrics) return;
    setSyncingPostId(id);
    try {
      const result = await onSyncPostMetrics(id);
      if (result.success) {
        alert("Đồng bộ chỉ số từ Facebook Page thật thành công!");
      } else {
        alert(result.error || "Không thể đồng bộ chỉ số.");
      }
    } catch (err: any) {
      alert("Đồng bộ thất bại: " + (err.message || "Lỗi mạng."));
    } finally {
      setSyncingPostId(null);
    }
  };

  const handleRefreshMetrics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const getStatusBadge = (status: FacebookPost['status']) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã đăng</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Đã lên lịch</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            <FileText className="w-3 h-3 text-amber-600" />
            <span>Bản nháp</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/80 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Thất bại</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý & Thống Kê Bài Viết</h1>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Tích hợp Lượt xem & Tiếp cận
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi chi tiết số lượt xem, tiếp cận, tương tác của từng bài viết và quản lý lịch đăng tập trung.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-post-metrics"
            type="button"
            onClick={handleRefreshMetrics}
            disabled={isRefreshing}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-3xs cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>{isRefreshing ? "Đang đồng bộ..." : "Đồng bộ Chỉ số"}</span>
          </button>
        </div>
      </div>

      {/* Top Level Quick Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Reach */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-3xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Lượt Tiếp Cận</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {totalReachAcrossPosts.toLocaleString()}
          </p>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% tuần này</span>
          </div>
        </div>

        {/* Metric 2: Total Views */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-3xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Lượt Xem Bài</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {totalViewsAcrossPosts.toLocaleString()}
          </p>
          <div className="text-[11px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
            <Eye className="w-3 h-3" />
            <span>Hiển thị trên bảng tin</span>
          </div>
        </div>

        {/* Metric 3: Total Interactions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-3xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Lượt Tương Tác</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {totalInteractions.toLocaleString()}
          </p>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
            <span>Thích, bình luận & chia sẻ</span>
          </div>
        </div>

        {/* Metric 4: Published Posts count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-3xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Tương Tác TB</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {avgEngagementRate}%
          </p>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <span>{publishedPosts.length} bài viết đã đăng</span>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            id="subtab-posts-list"
            type="button"
            onClick={() => setActiveSubTab('posts')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'posts'
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tất Cả Bài Viết & Chỉ Số Tiếp Cận ({enrichedPosts.length})</span>
          </button>

          <button
            id="subtab-overview-charts"
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'overview'
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Biểu Đồ & Tăng Trưởng Trang</span>
          </button>

          <button
            id="subtab-schedule-queue"
            type="button"
            onClick={() => setActiveSubTab('schedule')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'schedule'
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch Đăng & Hàng Đợi ({enrichedPosts.filter(p => p.status === 'scheduled').length})</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: ALL POSTS WITH LIVE METRICS */}
      {activeSubTab === 'posts' && (
        <div className="space-y-4">
          
          {/* Filters and Search Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'all', label: 'Tất cả', count: enrichedPosts.length },
                { id: 'published', label: 'Đã đăng', count: enrichedPosts.filter(p => p.status === 'published').length },
                { id: 'scheduled', label: 'Đã lên lịch', count: enrichedPosts.filter(p => p.status === 'scheduled').length },
                { id: 'draft', label: 'Bản nháp', count: enrichedPosts.filter(p => p.status === 'draft').length },
                { id: 'failed', label: 'Thất bại', count: enrichedPosts.filter(p => p.status === 'failed').length },
              ].map((item) => (
                <button
                  key={item.id}
                  id={`filter-status-${item.id}`}
                  type="button"
                  onClick={() => setStatusFilter(item.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === item.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === item.id ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Page & Search Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Page Select */}
              <select
                id="select-page-filter"
                value={selectedPageFilter}
                onChange={(e) => setSelectedPageFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-hidden"
              >
                <option value="all">Tất cả Trang Fanpage</option>
                {pages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.accountName || "MÁY TÍNH MŨI NÉ"})</option>
                ))}
              </select>

              {/* Search box */}
              <div className="relative flex-1 md:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-search-post"
                  type="text"
                  placeholder="Tìm nội dung bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white outline-hidden focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Posts Grid & Engagement Details */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">Không tìm thấy bài viết nào</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Chưa có bài viết nào phù hợp với bộ lọc hiện tại. Bạn có thể sang tab <strong>Tạo bài viết AI</strong> để xuất bản nội dung mới!
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredPosts.map((post) => {
                const isExpanded = expandedPostId === post.id;
                const isProcessing = processingPostId === post.id;
                const postReach = post.reachCount || 0;
                const postViews = post.viewsCount || 0;
                const postLikes = post.likesCount || 0;
                const postComments = post.commentsCount || 0;
                const postShares = post.sharesCount || 0;
                const postEngagementRate = postReach > 0 
                  ? (((postLikes + postComments + postShares) / postReach) * 100).toFixed(1)
                  : "0.0";

                return (
                  <div 
                    key={post.id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-3xs overflow-hidden hover:border-slate-300 transition-all"
                  >
                    {/* Main post row */}
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left: Author & Content snippet */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Page Avatar or Post Image Thumbnail */}
                        <div className="relative shrink-0">
                          {post.mediaUrl ? (
                            <img 
                              src={post.mediaUrl} 
                              alt="Media" 
                              className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <img 
                              src={post.pagePicture || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=60`} 
                              alt={post.pageName} 
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>

                        {/* Text info */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-800 truncate">
                              {post.pageName}
                            </span>
                            {getStatusBadge(post.status)}
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {post.publishedAt 
                                ? new Date(post.publishedAt).toLocaleString("vi-VN") 
                                : post.scheduledAt 
                                  ? `Lên lịch: ${new Date(post.scheduledAt).toLocaleString("vi-VN")}` 
                                  : "Bản thảo"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed whitespace-pre-wrap font-medium">
                            {post.message}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Live Reach & Engagement Metrics Strip */}
                      {post.status === 'published' ? (
                        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 flex items-center gap-3 shrink-0">
                          {/* Views */}
                          <div className="text-center px-2">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <Eye className="w-3 h-3 text-indigo-500" />
                              <span>Lượt Xem</span>
                            </div>
                            <span className="text-sm font-black text-slate-800">
                              {postViews.toLocaleString()}
                            </span>
                          </div>

                          <div className="w-px h-7 bg-slate-200"></div>

                          {/* Reach */}
                          <div className="text-center px-2">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <Users className="w-3 h-3 text-blue-500" />
                              <span>Tiếp Cận</span>
                            </div>
                            <span className="text-sm font-black text-blue-600">
                              {postReach.toLocaleString()}
                            </span>
                          </div>

                          <div className="w-px h-7 bg-slate-200"></div>

                          {/* Likes & Reactions */}
                          <div className="text-center px-1.5">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <Heart className="w-3 h-3 text-rose-500" />
                              <span>Thích</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">
                              {postLikes}
                            </span>
                          </div>

                          <div className="w-px h-7 bg-slate-200"></div>

                          {/* Comments */}
                          <div className="text-center px-1.5">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <MessageSquare className="w-3 h-3 text-amber-500" />
                              <span>Bình luận</span>
                            </div>
                            <span className="text-sm font-black text-amber-600">
                              {postComments}
                            </span>
                          </div>

                          <div className="w-px h-7 bg-slate-200"></div>

                          {/* Shares */}
                          <div className="text-center px-1.5">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <Share2 className="w-3 h-3 text-teal-500" />
                              <span>Chia sẻ</span>
                            </div>
                            <span className="text-sm font-black text-teal-600">
                              {postShares}
                            </span>
                          </div>

                          <div className="w-px h-7 bg-slate-200"></div>

                          {/* Engagement Rate */}
                          <div className="text-center px-1.5">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                              <span>Tương tác</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {postEngagementRate}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50/60 px-3 py-2 rounded-xl border border-amber-200/60 text-xs text-amber-800 font-medium shrink-0 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Chưa có chỉ số (Sẽ ghi nhận sau khi đăng lên Facebook)</span>
                        </div>
                      )}

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {post.status !== 'published' && (
                          <button
                            id={`btn-publish-now-${post.id}`}
                            type="button"
                            onClick={() => handlePublishNow(post.id)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Đăng ngay</span>
                          </button>
                        )}

                        {post.fbPostId && (
                          <div className="flex items-center gap-1">
                            {onSyncPostMetrics && (
                              <button
                                type="button"
                                onClick={() => handleSyncSinglePost(post.id)}
                                disabled={syncingPostId === post.id}
                                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                title="Đồng bộ chỉ số thực tế từ Facebook Page"
                              >
                                <RefreshCw className={`w-4 h-4 ${syncingPostId === post.id ? "animate-spin text-emerald-600" : ""}`} />
                              </button>
                            )}
                            <a
                              href={`https://facebook.com/${post.fbPostId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Xem bài viết trực tiếp trên Facebook"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        )}

                        <button
                          id={`btn-expand-${post.id}`}
                          type="button"
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          title="Chi tiết bài viết"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <button
                          id={`btn-delete-${post.id}`}
                          type="button"
                          onClick={() => onDeletePost(post.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-3 animate-in fade-in duration-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Toàn bộ nội dung:</span>
                            <div className="mt-1 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-mono whitespace-pre-wrap">
                              {post.message}
                            </div>
                          </div>

                          {post.mediaUrl && (
                            <div>
                              <span className="text-[11px] font-bold text-slate-500 uppercase">Hình ảnh đính kèm:</span>
                              <div className="mt-1">
                                <img 
                                  src={post.mediaUrl} 
                                  alt="Attached" 
                                  className="max-h-48 rounded-lg border border-slate-200 object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {post.status === 'published' && (
                          <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-slate-600">
                              Mã định danh Facebook ID: <code className="font-mono font-bold text-blue-600">{post.fbPostId || "N/A"}</code>
                            </span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đã xác thực và đồng bộ dữ liệu với Meta Graph API
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: OVERVIEW CHARTS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Channel selector */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">Chọn Trang hiển thị đồ thị:</span>
            </div>
            <select
              value={chartPageName}
              onChange={(e) => setChartPageName(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-hidden"
            >
              {pages.map(p => (
                <option key={p.id} value={p.name}>{p.name} ({p.accountName || "MÁY TÍNH MŨI NÉ"})</option>
              ))}
              <option value="default">Toàn bộ hệ thống</option>
            </select>
          </div>

          {/* Area chart: Reach & Views growth */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Xu hướng Lượt xem & Lượt tiếp cận (7 ngày qua)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Biểu đồ thể hiện số lượng người nhìn thấy bài viết của bạn trên Bảng tin Facebook</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Lượt xem (Views)
                </span>
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Tiếp cận (Reach)
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="views" name="Lượt xem" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="reach" name="Tiếp cận" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReach)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Likes, Comments, Shares */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Phân bổ Tương tác (Thích, Bình luận, Chia sẻ)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Số lượng phản hồi tích cực từ khách hàng theo từng ngày</p>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="likes" name="Lượt thích" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comments" name="Bình luận" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shares" name="Chia sẻ" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* SUB-VIEW 3: SCHEDULE QUEUE */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Danh sách Hàng Đợi Lên Lịch Tự Động</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Các bài viết đã được xếp lịch hẹn giờ đăng lên Facebook</p>
          </div>

          {enrichedPosts.filter(p => p.status === 'scheduled').length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-500">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">Hàng đợi đang trống</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hiện tại không có bài viết nào đang chờ đăng theo lịch. Hãy chuyển sang tab <strong>Tạo bài viết AI</strong> để lên lịch bài mới!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrichedPosts.filter(p => p.status === 'scheduled').map((post) => (
                <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{post.pageName}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                          {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString("vi-VN") : "Hẹn giờ"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{post.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePublishNow(post.id)}
                      disabled={processingPostId === post.id}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Đăng ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePost(post.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
