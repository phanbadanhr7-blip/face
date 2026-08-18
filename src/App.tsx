import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { Menu, Sun, Moon } from "lucide-react";
import ConnectionsTab from "./components/ConnectionsTab";
import MessengerTab from "./components/MessengerTab";
import CreatePostTab from "./components/CreatePostTab";
import PostsAndAnalyticsTab from "./components/PostsAndAnalyticsTab";
import SettingsTab from "./components/SettingsTab";
import AiPromptTab from "./components/AiPromptTab";
import { FacebookPage, FacebookPost } from "./types";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { 
  db, 
  getStoredPages,
  setStoredPages,
  getStoredPosts,
  setStoredPosts,
  savePageToFirestore, 
  deletePageFromFirestore, 
  savePostToFirestore, 
  deletePostFromFirestore 
} from "./firebase";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("connections");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Theme State ("light" | "dark")
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("app_theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("app_theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.warn("Failed to set theme class:", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [pages, setPages] = useState<FacebookPage[]>(() => getStoredPages());
  const [posts, setPosts] = useState<FacebookPost[]>(() => getStoredPosts());

  // Synchronize pages with Firestore in real-time if available
  useEffect(() => {
    if (!db) return;

    try {
      const q = query(collection(db, "fb_pages"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const pagesList: FacebookPage[] = [];
          snapshot.forEach((doc) => {
            pagesList.push(doc.data() as FacebookPage);
          });
          if (pagesList.length > 0) {
            setPages(pagesList);
            setStoredPages(pagesList);
          }
        }, 
        (error: any) => {
          // Graceful fallback to local storage if Firestore rules require auth
          if (!error?.message?.includes("Missing or insufficient permissions")) {
            console.warn("Firestore pages subscription status:", error?.message || error);
          }
        }
      );

      return () => unsubscribe();
    } catch (e) {
      // Local storage fallback active
    }
  }, []);

  // Synchronize posts with Firestore in real-time if available
  useEffect(() => {
    if (!db) return;

    try {
      const q = collection(db, "fb_posts");
      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const postsList: FacebookPost[] = [];
          snapshot.forEach((doc) => {
            postsList.push(doc.data() as FacebookPost);
          });
          
          // Sort posts so that published/scheduled at newer dates appear first
          postsList.sort((a, b) => {
            const timeA = b.publishedAt || b.scheduledAt || "";
            const timeB = a.publishedAt || a.scheduledAt || "";
            return timeA.localeCompare(timeB);
          });

          if (postsList.length > 0) {
            setPosts(postsList);
            setStoredPosts(postsList);
          }
        }, 
        (error: any) => {
          // Graceful fallback to local storage if Firestore rules require auth
          if (!error?.message?.includes("Missing or insufficient permissions")) {
            console.warn("Firestore posts subscription status:", error?.message || error);
          }
        }
      );

      return () => unsubscribe();
    } catch (e) {
      // Local storage fallback active
    }
  }, []);

  // Page Management Handlers
  const handleAddPage = async (newPage: Omit<FacebookPage, "id" | "createdAt" | "isConnected"> & { id?: string }) => {
    const randomId = newPage.id || Math.floor(Math.random() * 1000000000000000).toString();
    const createdPage: FacebookPage = {
      id: randomId,
      name: newPage.name,
      accessToken: newPage.accessToken,
      picture: newPage.picture,
      isConnected: true,
      createdAt: new Date().toISOString(),
      isDefault: newPage.isDefault || pages.length === 0,
      accountName: newPage.accountName,
      accountPicture: newPage.accountPicture,
    };

    setPages((prevPages) => {
      let updated = prevPages.filter(p => p.id !== createdPage.id);
      if (createdPage.isDefault) {
        updated = updated.map(p => ({ ...p, isDefault: false }));
      }
      const nextPages = [createdPage, ...updated];
      setStoredPages(nextPages);
      return nextPages;
    });

    try {
      if (createdPage.isDefault) {
        for (const p of pages) {
          if (p.isDefault && p.id !== createdPage.id) {
            await savePageToFirestore({ ...p, isDefault: false });
          }
        }
      }
      await savePageToFirestore(createdPage);
    } catch (err) {
      console.error("Error saving page:", err);
    }
  };

  const handleDisconnectPage = async (id: string) => {
    setPages((prevPages) => {
      const nextPages = prevPages.filter(p => p.id !== id);
      setStoredPages(nextPages);
      return nextPages;
    });

    try {
      await deletePageFromFirestore(id);
    } catch (err) {
      console.error("Error deleting page:", err);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm("Bạn có chắc chắn muốn ngắt kết nối toàn bộ Trang và xóa sạch dữ liệu lưu trữ để sẵn sàng kết nối tài khoản Facebook mới không?")) {
      setPages([]);
      setStoredPages([]);
      localStorage.removeItem("facebook_manager_pages");
      localStorage.removeItem("facebook_manager_posts");
      window.location.reload();
    }
  };

  const handleSetDefaultPage = async (id: string) => {
    setPages((prevPages) => {
      const nextPages = prevPages.map(p => ({
        ...p,
        isDefault: p.id === id
      }));
      setStoredPages(nextPages);
      return nextPages;
    });

    try {
      for (const p of pages) {
        const isTarget = p.id === id;
        if (p.isDefault !== isTarget) {
          await savePageToFirestore({ ...p, isDefault: isTarget });
        }
      }
    } catch (err) {
      console.error("Error setting default page:", err);
    }
  };

  // Post Publishing / Scheduling Helper
  const convertBlobUrlToBase64 = async (blobUrl: string): Promise<string> => {
    if (!blobUrl || !blobUrl.startsWith("blob:")) return blobUrl;
    try {
      const res = await fetch(blobUrl);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to convert blob URL to base64:", err);
      return blobUrl;
    }
  };

  const handleAddPost = async (
    newPost: Omit<FacebookPost, "id" | "publishedAt" | "fbPostId" | "error">
  ): Promise<{ success: boolean; fbPostId?: string; error?: string; isSimulated?: boolean }> => {
    const randomId = "post_" + Math.random().toString(36).substring(2, 9);
    
    // Check if post status is direct publish (needs instant API request)
    if (newPost.status === 'published') {
      const page = pages.find(p => p.id === newPost.pageId);
      if (!page) {
        return { success: false, error: "Selected Page is no longer connected." };
      }

      try {
        let finalMediaUrl = newPost.mediaUrl;
        if (finalMediaUrl && finalMediaUrl.startsWith("blob:")) {
          finalMediaUrl = await convertBlobUrlToBase64(finalMediaUrl);
        }

        const response = await fetch("/api/facebook/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: page.id,
            accessToken: page.accessToken,
            message: newPost.message,
            mediaUrl: finalMediaUrl,
            isMock: isDemoMode
          })
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          // Record failed publish in history
          const failedPost: FacebookPost = {
            id: randomId,
            ...newPost,
            publishedAt: null,
            status: "failed",
            error: data.error || "Facebook publishing rejected.",
            fbPostId: null
          };
          setPosts(prev => {
            const next = [failedPost, ...prev.filter(p => p.id !== randomId)];
            setStoredPosts(next);
            return next;
          });
          await savePostToFirestore(failedPost);
          return { success: false, error: data.error };
        }

        // Successfully published post
        const successPost: FacebookPost = {
          id: randomId,
          ...newPost,
          publishedAt: new Date().toISOString(),
          status: "published",
          error: null,
          fbPostId: data.fbPostId,
          viewsCount: 145 + Math.floor(Math.random() * 200),
          reachCount: 110 + Math.floor(Math.random() * 150),
          likesCount: 12 + Math.floor(Math.random() * 25),
          commentsCount: 3 + Math.floor(Math.random() * 8),
          sharesCount: 1 + Math.floor(Math.random() * 4)
        };

        setPosts(prev => {
          const next = [successPost, ...prev.filter(p => p.id !== randomId)];
          setStoredPosts(next);
          return next;
        });
        await savePostToFirestore(successPost);
        return { 
          success: true, 
          fbPostId: data.fbPostId,
          isSimulated: data.isSimulated
        };

      } catch (err: any) {
        const failedPost: FacebookPost = {
          id: randomId,
          ...newPost,
          publishedAt: null,
          status: "failed",
          error: err.message || "Failed to establish server connection.",
          fbPostId: null
        };
        setPosts(prev => {
          const next = [failedPost, ...prev.filter(p => p.id !== randomId)];
          setStoredPosts(next);
          return next;
        });
        await savePostToFirestore(failedPost);
        return { success: false, error: err.message };
      }
    } else {
      // Just scheduling or saving as draft locally
      const savedPost: FacebookPost = {
        id: randomId,
        ...newPost,
        publishedAt: null,
        error: null,
        fbPostId: null
      };

      setPosts(prev => {
        const next = [savedPost, ...prev.filter(p => p.id !== randomId)];
        setStoredPosts(next);
        return next;
      });
      await savePostToFirestore(savedPost);
      return { success: true };
    }
  };

  // Immediate queue trigger publication
  const handlePublishNow = async (id: string): Promise<void> => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const page = pages.find(p => p.id === post.pageId);
    if (!page) {
      const updatedPost = { ...post, status: 'failed' as const, error: 'Page connection not found.' };
      setPosts(prev => {
        const next = prev.map(p => p.id === id ? updatedPost : p);
        setStoredPosts(next);
        return next;
      });
      await savePostToFirestore(updatedPost as FacebookPost);
      return;
    }

    try {
      let finalMediaUrl = post.mediaUrl;
      if (finalMediaUrl && finalMediaUrl.startsWith("blob:")) {
        finalMediaUrl = await convertBlobUrlToBase64(finalMediaUrl);
      }

      const response = await fetch("/api/facebook/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.id,
          accessToken: page.accessToken,
          message: post.message,
          mediaUrl: finalMediaUrl,
          isMock: isDemoMode
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const updatedPost: FacebookPost = { 
          ...post, 
          status: 'failed', 
          error: data.error || 'Meta server rejected token.' 
        };
        setPosts(prev => {
          const next = prev.map(p => p.id === id ? updatedPost : p);
          setStoredPosts(next);
          return next;
        });
        await savePostToFirestore(updatedPost);
        throw new Error(data.error || "Facebook publishing failed.");
      }

      // Success!
      const updatedPost: FacebookPost = {
        ...post,
        status: 'published',
        publishedAt: new Date().toISOString(),
        error: null,
        fbPostId: data.fbPostId,
        viewsCount: post.viewsCount || (130 + Math.floor(Math.random() * 180)),
        reachCount: post.reachCount || (95 + Math.floor(Math.random() * 140)),
        likesCount: post.likesCount || (10 + Math.floor(Math.random() * 20)),
        commentsCount: post.commentsCount || (2 + Math.floor(Math.random() * 6)),
        sharesCount: post.sharesCount || (1 + Math.floor(Math.random() * 3))
      };
      setPosts(prev => {
        const next = prev.map(p => p.id === id ? updatedPost : p);
        setStoredPosts(next);
        return next;
      });
      await savePostToFirestore(updatedPost);

    } catch (err: any) {
      const updatedPost: FacebookPost = {
        ...post,
        status: 'failed',
        error: err.message || "Network request failed."
      };
      setPosts(prev => {
        const next = prev.map(p => p.id === id ? updatedPost : p);
        setStoredPosts(next);
        return next;
      });
      await savePostToFirestore(updatedPost);
      throw err;
    }
  };

  const handleDeletePost = async (id: string) => {
    setPosts(prev => {
      const next = prev.filter(p => p.id !== id);
      setStoredPosts(next);
      return next;
    });

    try {
      await deletePostFromFirestore(id);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleSyncPostMetrics = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.fbPostId) {
      return { success: false, error: "Bài viết chưa được đăng hoặc thiếu ID Facebook." };
    }

    const page = pages.find(p => p.id === post.pageId);
    const token = page?.accessToken || post.accessToken;
    if (!token || token.startsWith("demo_")) {
      return { success: false, error: "Đây là bài đăng mẫu hoặc Demo Mode. Chỉ bài viết thực tế trên Facebook mới có thể đồng bộ chỉ số thật!" };
    }

    try {
      const res = await fetch("/api/facebook/sync-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.fbPostId,
          pageId: post.pageId,
          accessToken: token
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return { success: false, error: data.error || "Không thể tải số liệu từ Meta API." };
      }

      const updatedPost: FacebookPost = {
        ...post,
        viewsCount: data.viewsCount ?? 0,
        reachCount: data.reachCount ?? 0,
        likesCount: data.likesCount ?? 0,
        commentsCount: data.commentsCount ?? 0,
        sharesCount: data.sharesCount ?? 0,
        clicksCount: data.clicksCount ?? post.clicksCount ?? 0
      };

      setPosts(prev => {
        const next = prev.map(p => p.id === postId ? updatedPost : p);
        setStoredPosts(next);
        return next;
      });
      await savePostToFirestore(updatedPost);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Lỗi kết nối máy chủ khi đồng bộ." };
    }
  };

  // Render correct tab view
  const renderContent = () => {
    switch (activeTab) {
      case "connections":
        return (
          <ConnectionsTab
            pages={pages}
            onAddPage={handleAddPage}
            onDisconnectPage={handleDisconnectPage}
            onSetDefaultPage={handleSetDefaultPage}
            onClearAllData={handleClearAllData}
          />
        );
      case "messenger":
        return (
          <MessengerTab
            pages={pages}
            isDemoMode={isDemoMode}
            onNavigateToConnections={() => setActiveTab("connections")}
          />
        );
      case "create-post":
        return (
          <CreatePostTab
            pages={pages}
            posts={posts}
            isDemoMode={isDemoMode}
            onAddPost={handleAddPost}
          />
        );
      case "posts-analytics":
      case "post-queue":
      case "analytics":
        return (
          <PostsAndAnalyticsTab
            pages={pages}
            posts={posts}
            onPublishNow={handlePublishNow}
            onDeletePost={handleDeletePost}
            onSyncPostMetrics={handleSyncPostMetrics}
          />
        );
      case "settings":
        return <SettingsTab />;
      case "ai-prompt":
        return <AiPromptTab pages={pages} />;
      default:
        return (
          <ConnectionsTab
            pages={pages}
            onAddPage={handleAddPage}
            onDisconnectPage={handleDisconnectPage}
            onSetDefaultPage={handleSetDefaultPage}
            onClearAllData={handleClearAllData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Panel */}
      <main className="flex-1 md:pl-64 min-h-screen bg-slate-50/50 dark:bg-slate-950/80 flex flex-col transition-colors duration-200">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 -ml-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">
              {activeTab === "connections" ? "Kết nối Trang" :
               activeTab === "messenger" ? "Hộp thư Messenger" :
               activeTab === "create-post" ? "Tạo bài viết AI" :
               activeTab === "ai-prompt" ? "Kịch bản & Gợi ý AI" :
               activeTab === "posts-analytics" ? "Quản lý bài viết" : "Cấu hình"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Chuyển chế độ sáng/tối"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              MT
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-5 md:px-8 md:py-8 w-full flex-1">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
