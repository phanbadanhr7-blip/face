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

export const getStoredPosts = (): FacebookPost[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to read posts from localStorage:", e);
    return [];
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

