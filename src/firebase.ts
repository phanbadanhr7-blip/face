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

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiry0umVMIZ1vrO_KiMXdYY03jqDLvxeI",
  authDomain: "face-36f86.firebaseapp.com",
  projectId: "face-36f86",
  storageBucket: "face-36f86.firebasestorage.app",
  messagingSenderId: "831804236769",
  appId: "1:831804236769:web:20f40dce448928c558a8a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase connection established successfully!");
  } catch (error) {
    console.warn("Could not reach Firestore on startup, using offline mode or cache:", error);
  }
}
testConnection();

// Helpers for pages
export const savePageToFirestore = async (page: FacebookPage) => {
  await setDoc(doc(db, "fb_pages", page.id), page);
};

export const deletePageFromFirestore = async (id: string) => {
  await deleteDoc(doc(db, "fb_pages", id));
};

// Helpers for posts
export const savePostToFirestore = async (post: FacebookPost) => {
  await setDoc(doc(db, "fb_posts", post.id), post);
};

export const deletePostFromFirestore = async (id: string) => {
  await deleteDoc(doc(db, "fb_posts", id));
};
