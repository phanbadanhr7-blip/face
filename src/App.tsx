import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ConnectionsTab from "./components/ConnectionsTab";
import MessengerTab from "./components/MessengerTab";
import CreatePostTab from "./components/CreatePostTab";
import PostsAndAnalyticsTab from "./components/PostsAndAnalyticsTab";
import HelpGuideTab from "./components/HelpGuideTab";
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
        const response = await fetch("/api/facebook/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: page.id,
            accessToken: page.accessToken,
            message: newPost.message,
            mediaUrl: newPost.mediaUrl,
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
      const response = await fetch("/api/facebook/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.id,
          accessToken: page.accessToken,
          message: post.message,
          mediaUrl: post.mediaUrl,
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
          />
        );
      case "api-guide":
        return <HelpGuideTab />;
      default:
        return (
          <ConnectionsTab
            pages={pages}
            onAddPage={handleAddPage}
            onDisconnectPage={handleDisconnectPage}
            onSetDefaultPage={handleSetDefaultPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Panel */}
      <main className="flex-1 pl-64 min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 py-8 md:px-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
