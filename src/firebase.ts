import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocFromServer
} from "firebase/firestore";
import { FacebookPage, FacebookPost } from "./types";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiry0umVMIZ1vrO_KiMXdYY03jqDLvxeI",
  authDomain: "face-36f86.firebaseapp.com",
  projectId: "face-36f86",
  storageBucket: "face-36f86.firebasestorage.app",
  messagingSenderId: "831804236769",
  appId: "1:831804236769:web:20f40dce448928c558a8a0"
};

// Initialize Firebase safely
let app: any = null;
let db: any = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization skipped or failed, using local storage fallback:", e);
}

export { db };

// Test connection on boot quietly
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    // Expected when offline or when test document doesn't have open permissions
  }
}
testConnection();

// --- LocalStorage helpers for reliable zero-error persistence ---
const STORAGE_KEYS = {
  PAGES: "facebook_manager_pages",
  POSTS: "facebook_manager_posts"
};

export const getStoredPages = (): FacebookPage[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAGES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to read pages from localStorage:", e);
    return [];
  }
};

export const setStoredPages = (pages: FacebookPage[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
  } catch (e) {
    console.error("Failed to save pages to localStorage:", e);
  }
};

const DEFAULT_SAMPLE_POSTS: FacebookPost[] = [
  {
    id: "sample_post_1",
    pageId: "109848525048293",
    pageName: "MÁY TÍNH MŨI NÉ",
    pagePicture: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80",
    message: "🔥 Dịch vụ sửa chữa, vệ sinh tra keo tản nhiệt và nâng cấp Laptop - Máy tính bàn uy tín tại Mũi Né, Phan Thiết!\n\n👉 Kiểm tra lỗi phần cứng tận nơi, tư vấn tận tâm.\n👉 Linh kiện chính hãng, bảo hành chu đáo.\n👉 Giảm ngay 15% phí dịch vụ cho học sinh - sinh viên trong tuần này!",
    mediaUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
    scheduledAt: null,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    error: null,
    fbPostId: "109848525048293_987654321",
    viewsCount: 0,
    reachCount: 0,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    clicksCount: 0
  },
  {
    id: "sample_post_2",
    pageId: "109848525048293",
    pageName: "MÁY TÍNH MŨI NÉ",
    pagePicture: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80",
    message: "💻 Vừa về lô Màn hình Gaming IPS 24 inch 165Hz viền siêu mỏng, chuẩn màu đồ họa & chiến game mượt mà không lo mỏi mắt.\n\n✅ Tấm nền IPS sắc nét góc nhìn 178 độ\n✅ Tần số quét 165Hz / 1ms MPRT\n✅ Bảo hành 24 tháng chính hãng đổi mới\n\nInbox shop để nhận giá ưu đãi và quà tặng kèm nhé!",
    mediaUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    scheduledAt: null,
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    error: null,
    fbPostId: "109848525048293_123456789",
    viewsCount: 0,
    reachCount: 0,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    clicksCount: 0
  },
  {
    id: "sample_post_3",
    pageId: "109848525048293",
    pageName: "MÁY TÍNH MŨI NÉ",
    pagePicture: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80",
    message: "⚡ Cài đặt Windows bản quyền, xử lý phần mềm, diệt virus và cứu dữ liệu ổ cứng tận nơi cho văn phòng, khách sạn & resort tại Mũi Né.",
    mediaUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80",
    scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: null,
    status: 'scheduled',
    error: null,
    fbPostId: null
  }
];

export const getStoredPosts = (): FacebookPost[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Reset legacy metrics of sample posts to 0 so they start calculating fresh
        return parsed.map(post => ({
          ...post,
          viewsCount: post.id?.startsWith("sample_") ? 0 : (post.viewsCount ?? 0),
          reachCount: post.id?.startsWith("sample_") ? 0 : (post.reachCount ?? 0),
          likesCount: post.id?.startsWith("sample_") ? 0 : (post.likesCount ?? 0),
          commentsCount: post.id?.startsWith("sample_") ? 0 : (post.commentsCount ?? 0),
          sharesCount: post.id?.startsWith("sample_") ? 0 : (post.sharesCount ?? 0),
          clicksCount: post.id?.startsWith("sample_") ? 0 : (post.clicksCount ?? 0)
        }));
      }
    }
    return DEFAULT_SAMPLE_POSTS;
  } catch (e) {
    console.error("Failed to read posts from localStorage:", e);
    return DEFAULT_SAMPLE_POSTS;
  }
};

export const setStoredPosts = (posts: FacebookPost[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  } catch (e) {
    console.error("Failed to save posts to localStorage:", e);
  }
};

// --- Firestore + LocalStorage Unified Sync Helpers ---

export const savePageToFirestore = async (page: FacebookPage) => {
  // Update local storage first
  const existingPages = getStoredPages();
  const index = existingPages.findIndex(p => p.id === page.id);
  if (index >= 0) {
    existingPages[index] = page;
  } else {
    existingPages.unshift(page);
  }
  setStoredPages(existingPages);

  // Sync to Firestore if permitted
  if (db) {
    try {
      await setDoc(doc(db, "fb_pages", page.id), page);
    } catch (err: any) {
      // Graceful fallback to local persistence when permissions are restricted
      if (!err?.message?.includes("insufficient permissions")) {
        console.warn("Firestore savePage notice:", err?.message || err);
      }
    }
  }
};

export const deletePageFromFirestore = async (id: string) => {
  // Remove from local storage
  const existingPages = getStoredPages();
  const filtered = existingPages.filter(p => p.id !== id);
  setStoredPages(filtered);

  // Sync to Firestore if permitted
  if (db) {
    try {
      await deleteDoc(doc(db, "fb_pages", id));
    } catch (err: any) {
      if (!err?.message?.includes("insufficient permissions")) {
        console.warn("Firestore deletePage notice:", err?.message || err);
      }
    }
  }
};

export const savePostToFirestore = async (post: FacebookPost) => {
  // Update local storage first
  const existingPosts = getStoredPosts();
  const index = existingPosts.findIndex(p => p.id === post.id);
  if (index >= 0) {
    existingPosts[index] = post;
  } else {
    existingPosts.unshift(post);
  }
  setStoredPosts(existingPosts);

  // Sync to Firestore if permitted
  if (db) {
    try {
      await setDoc(doc(db, "fb_posts", post.id), post);
    } catch (err: any) {
      if (!err?.message?.includes("insufficient permissions")) {
        console.warn("Firestore savePost notice:", err?.message || err);
      }
    }
  }
};

export const deletePostFromFirestore = async (id: string) => {
  // Remove from local storage
  const existingPosts = getStoredPosts();
  const filtered = existingPosts.filter(p => p.id !== id);
  setStoredPosts(filtered);

  // Sync to Firestore if permitted
  if (db) {
    try {
      await deleteDoc(doc(db, "fb_posts", id));
    } catch (err: any) {
      if (!err?.message?.includes("insufficient permissions")) {
        console.warn("Firestore deletePost notice:", err?.message || err);
      }
    }
  }
};

