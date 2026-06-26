import React, { useState } from "react";
import { FacebookPost } from "../types";
import { 
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
  Loader2
} from "lucide-react";

interface PostQueueTabProps {
  posts: FacebookPost[];
  onPublishNow: (id: string) => Promise<void>;
  onDeletePost: (id: string) => void;
}

export default function PostQueueTab({ posts, onPublishNow, onDeletePost }: PostQueueTabProps) {
  const [filter, setFilter] = useState<'all' | 'published' | 'scheduled' | 'draft' | 'failed'>('all');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  const getStatusBadge = (status: FacebookPost['status']) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs px-2.5 py-1 rounded-full font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã đăng</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/80 text-xs px-2.5 py-1 rounded-full font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Đã lên lịch</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 text-xs px-2.5 py-1 rounded-full font-semibold">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Bản nháp</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/80 text-xs px-2.5 py-1 rounded-full font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Thất bại</span>
          </span>
        );
      default:
        return null;
    }
  };

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

  // Helper translate tab names
  const getTabLabel = (tab: typeof filter) => {
    switch(tab) {
      case 'all': return 'Tất cả';
      case 'published': return 'Đã đăng';
      case 'scheduled': return 'Đã lên lịch';
      case 'draft': return 'Bản nháp';
      case 'failed': return 'Thất bại';
      default: return tab;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header info */}
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hàng Đợi & Lịch Đăng</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý, đăng tải và theo dõi lịch sử hàng đợi bài viết của các Fanpage</p>
      </div>

      {/* Filter Menu Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-0.5">
        {(['all', 'published', 'scheduled', 'draft', 'failed'] as const).map((tab) => {
          const count = tab === 'all' 
            ? posts.length 
            : posts.filter(p => p.status === tab).length;
          
          const isActive = filter === tab;
          
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <span className="capitalize">{getTabLabel(tab)}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Posts Queue List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isExpanded = expandedPostId === post.id;
          return (
            <div 
              key={post.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Left block: Page and Post Summary */}
                <div className="flex items-start gap-4 flex-1">
                  <img 
                    src={post.pagePicture} 
                    alt={post.pageName}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60";
                    }}
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="font-bold text-slate-800 text-sm">{post.pageName}</h3>
                      <span className="text-slate-300 text-xs">·</span>
                      {getStatusBadge(post.status)}
                    </div>

                    {/* Truncated message with toggle */}
                    <div className="text-sm text-slate-600 pr-4">
                      <p className={isExpanded ? "whitespace-pre-wrap leading-relaxed" : "line-clamp-2 leading-relaxed"}>
                        {post.message}
                      </p>
                      {post.message.length > 150 && (
                        <button
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold mt-1 inline-flex items-center gap-0.5"
                        >
                          {isExpanded ? (
                            <><span>Thu gọn</span><ChevronUp className="w-3.5 h-3.5" /></>
                          ) : (
                            <><span>Xem thêm</span><ChevronDown className="w-3.5 h-3.5" /></>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Metadata release timestamp */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      {post.scheduledAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Thời gian đăng: {new Date(post.scheduledAt).toLocaleString()}</span>
                        </span>
                      )}
                      {post.publishedAt && (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã xuất bản: {new Date(post.publishedAt).toLocaleString()}</span>
                        </span>
                      )}
                      {post.status === 'draft' && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Bản nháp đã lưu</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right block: Image attachment and Action Triggers */}
                <div className="flex items-center gap-4 sm:shrink-0 justify-end sm:justify-start">
                  
                  {/* Image attachment small preview */}
                  {post.mediaUrl && (
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      <img src={post.mediaUrl} alt="Attachment" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {post.status !== 'published' && (
                      <button
                        onClick={() => handlePublishNow(post.id)}
                        disabled={processingPostId === post.id}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                        title="Đăng tải bài viết này lên Facebook ngay lập tức"
                      >
                        {processingPostId === post.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Đăng Ngay</span>
                      </button>
                    )}

                    {post.status === 'published' && post.fbPostId && (
                      <a
                        href={`https://facebook.com/${post.fbPostId}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Xem bài viết</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                      title="Xóa mục này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>

              {/* Expansions like errors */}
              {post.status === 'failed' && post.error && (
                <div className="bg-rose-50/50 px-4 py-2.5 border-t border-rose-100 text-xs text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Lỗi đăng tải:</span> {post.error}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">Không có bài viết nào thuộc bộ lọc trạng thái này.</p>
            <p className="text-sm text-slate-400">Hãy tạo một bài viết mới trong bảng điều khiển &ldquo;Tạo bài viết AI&rdquo; để hiển thị tại đây.</p>
          </div>
        )}
      </div>

    </div>
  );
}
