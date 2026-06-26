export interface FacebookPage {
  id: string;
  name: string;
  accessToken: string;
  picture: string;
  isConnected: boolean;
  createdAt: string;
  isDefault: boolean;
}

export interface FacebookPost {
  id: string;
  pageId: string;
  pageName: string;
  pagePicture: string;
  message: string;
  mediaUrl: string | null;
  scheduledAt: string | null; // ISO string
  publishedAt: string | null; // ISO string
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  error: string | null;
  fbPostId: string | null;
}

export interface AnalyticsData {
  date: string;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isPage: boolean;
}

export interface ChatThread {
  id: string;
  pageId: string;
  customerName: string;
  customerAvatar: string;
  lastMessage: string;
  updatedAt: string;
  isUnread: boolean;
  messages: ChatMessage[];
}

