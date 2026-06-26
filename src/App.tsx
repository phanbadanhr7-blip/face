import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ConnectionsTab from "./components/ConnectionsTab";
import MessengerTab from "./components/MessengerTab";
import CreatePostTab from "./components/CreatePostTab";
import PostQueueTab from "./components/PostQueueTab";
import AnalyticsTab from "./components/AnalyticsTab";
import HelpGuideTab from "./components/HelpGuideTab";
import { FacebookPage, FacebookPost } from "./types";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { 
  db, 
  savePageToFirestore, 
  deletePageFromFirestore, 
  savePostToFirestore, 
  deletePostFromFirestore 
} from "./firebase";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("connections");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [posts, setPosts] = useState<FacebookPost[]>([]);

  // Synchronize pages with Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "fb_pages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pagesList: FacebookPage[] = [];
      snapshot.forEach((doc) => {
        pagesList.push(doc.data() as FacebookPage);
      });
      setPages(pagesList);
    }, (error) => {
      console.error("Error fetching pages from Firestore: ", error);
    });

    return () => unsubscribe();
  }, []);

  // Synchronize posts with Firestore in real-time
  useEffect(() => {
    const q = collection(db, "fb_posts");
    const unsubscribe = onSnapshot(q, (snapshot) => {
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

      setPosts(postsList);
    }, (error) => {
      console.error("Error fetching posts from Firestore: ", error);
    });

    return () => unsubscribe();
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

    try {
      if (createdPage.isDefault) {
        // If setting as default, clear defaults on other pages
        for (const p of pages) {
          if (p.isDefault && p.id !== createdPage.id) {
            await savePageToFirestore({ ...p, isDefault: false });
          }
        }
      }
      await savePageToFirestore(createdPage);
    } catch (err) {
      console.error("Error saving page to Firestore:", err);
    }
  };

  const handleDisconnectPage = async (id: string) => {
    try {
      await deletePageFromFirestore(id);
    } catch (err) {
      console.error("Error deleting page from Firestore:", err);
    }
  };

  const handleSetDefaultPage = async (id: string) => {
    try {
      for (const p of pages) {
        const isTarget = p.id === id;
        if (p.isDefault !== isTarget) {
          await savePageToFirestore({ ...p, isDefault: isTarget });
        }
      }
    } catch (err) {
      console.error("Error setting default page in Firestore:", err);
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
          fbPostId: data.fbPostId
        };

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
      const updatedPost = { ...post, status: 'failed', error: 'Page connection not found.' };
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
        await savePostToFirestore(updatedPost);
        throw new Error(data.error || "Facebook publishing failed.");
      }

      // Success!
      const updatedPost: FacebookPost = {
        ...post,
        status: 'published',
        publishedAt: new Date().toISOString(),
        error: null,
        fbPostId: data.fbPostId
      };
      await savePostToFirestore(updatedPost);

    } catch (err: any) {
      const updatedPost: FacebookPost = {
        ...post,
        status: 'failed',
        error: err.message || "Network request failed."
      };
      await savePostToFirestore(updatedPost);
      throw err;
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePostFromFirestore(id);
    } catch (err) {
      console.error("Error deleting post from Firestore:", err);
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
            isDemoMode={isDemoMode}
            onAddPost={handleAddPost}
          />
        );
      case "post-queue":
        return (
          <PostQueueTab
            posts={posts}
            onPublishNow={handlePublishNow}
            onDeletePost={handleDeletePost}
          />
        );
      case "analytics":
        return <AnalyticsTab pages={pages} />;
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
