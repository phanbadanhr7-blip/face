import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Search, 
  User, 
  CheckCheck, 
  Bot, 
  Loader2, 
  MessageCircleCode,
  MapPin,
  Laptop,
  Coins,
  ShieldCheck,
  AlertCircle,
  PhoneCall,
  ExternalLink,
  RefreshCw,
  Wifi,
  WifiOff,
  HelpCircle,
  Info,
  Trash2,
  X,
  ArrowLeft
} from "lucide-react";
import { FacebookPage, ChatThread, ChatMessage } from "../types";

interface MessengerTabProps {
  pages: FacebookPage[];
  isDemoMode: boolean;
  onNavigateToConnections?: () => void;
}

// Default mock messages for pre-population
const MOCK_INITIAL_THREADS: Record<string, ChatThread[]> = {
  // Page 1: May Tinh Mui Ne
  "10249581837582": [
    {
      id: "thread_1",
      pageId: "10249581837582",
      customerName: "Nguyễn Văn Hùng",
      customerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      lastMessage: "Dịch vụ cài win máy tính giá bao nhiêu vậy shop? Có cài phần mềm Photoshop không ạ?",
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
      isUnread: true,
      messages: [
        {
          id: "m1_1",
          senderId: "customer_1",
          senderName: "Nguyễn Văn Hùng",
          message: "Chào shop, mình mới mua máy bàn cũ mà chạy chậm quá.",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          isPage: false
        },
        {
          id: "m1_2",
          senderId: "10249581837582",
          senderName: "May Tinh Mui Ne",
          message: "Dạ chào anh Hùng! Shop có thể hỗ trợ kiểm tra lỗi miễn phí và nâng cấp ổ cứng SSD cho chạy cực kỳ mượt mà nhanh gấp 5 lần ạ. Cho em hỏi máy anh đang dùng win mấy ạ?",
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          isPage: true
        },
        {
          id: "m1_3",
          senderId: "customer_1",
          senderName: "Nguyễn Văn Hùng",
          message: "Dịch vụ cài win máy tính giá bao nhiêu vậy shop? Có cài phần mềm Photoshop không ạ?",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          isPage: false
        }
      ]
    },
    {
      id: "thread_2",
      pageId: "10249581837582",
      customerName: "Trần Thị Lan",
      customerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      lastMessage: "Dạ vâng để tối em bảo chồng em ghé qua shop xem cấu hình cụ thể luôn ạ.",
      updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
      isUnread: false,
      messages: [
        {
          id: "m2_1",
          senderId: "customer_2",
          senderName: "Trần Thị Lan",
          message: "Shop ơi, mình cần tư vấn cấu hình PC chơi game FiFa Online 4 tầm giá 15 triệu đổ lại thôi.",
          timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          isPage: false
        },
        {
          id: "m2_2",
          senderId: "10249581837582",
          senderName: "May Tinh Mui Ne",
          message: "Dạ chào chị Lan! Với tầm giá 15 triệu, shop đang sẵn cấu hình Intel Core i5 thế hệ mới kèm card đồ họa rời GTX 1660 Super chiến mượt mà FIFA 4, cấu hình đồ họa cao luôn ạ. Máy mới chính hãng bảo hành 3 năm, tặng kèm phím chuột led nữa chị nha.",
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          isPage: true
        },
        {
          id: "m2_3",
          senderId: "customer_2",
          senderName: "Trần Thị Lan",
          message: "Dạ vâng để tối em bảo chồng em ghé qua shop xem cấu hình cụ thể luôn ạ.",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          isPage: false
        }
      ]
    },
    {
      id: "thread_3",
      pageId: "10249581837582",
      customerName: "Minh Tuấn Tech",
      customerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      lastMessage: "Shop có sẵn card màn hình GTX 1660 Super cũ không? Bảo hành thế nào?",
      updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
      isUnread: false,
      messages: [
        {
          id: "m3_1",
          senderId: "customer_3",
          senderName: "Minh Tuấn Tech",
          message: "Shop có sẵn card màn hình GTX 1660 Super cũ không? Bảo hành thế nào?",
          timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          isPage: false
        }
      ]
    }
  ],
  // Page 2: Mui Ne Tech Lab
  "20938475620192": [
    {
      id: "thread_4",
      pageId: "20938475620192",
      customerName: "Hoàng Bách",
      customerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      lastMessage: "Khóa học lập trình React bên mình học phí bao nhiêu vậy ạ?",
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      isUnread: true,
      messages: [
        {
          id: "m4_1",
          senderId: "customer_4",
          senderName: "Hoàng Bách",
          message: "Khóa học lập trình React bên mình học phí bao nhiêu vậy ạ?",
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          isPage: false
        }
      ]
    }
  ]
};

export default function MessengerTab({ pages, isDemoMode, onNavigateToConnections }: MessengerTabProps) {
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Live Facebook Synchronization state
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveSyncError, setLiveSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);

  // AI Autopilot / Auto-Reply state configurations
  const [aiAutoreplyEnabled, setAiAutoreplyEnabled] = useState(true);
  const [aiPersona, setAiPersona] = useState<"sales" | "support" | "playful" | "standard">("standard");
  const [aiCustomInstructions, setAiCustomInstructions] = useState("");
  const [aiHistoryLength, setAiHistoryLength] = useState<number>(5);
  const [isAutoreplyThinking, setIsAutoreplyThinking] = useState(false);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(true);

  // Thread deletion and clear inbox modal state
  const [threadToDelete, setThreadToDelete] = useState<ChatThread | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // Simulation custom text state
  const [customSimText, setCustomSimText] = useState("");

  // Zalo Escalation & Quick Call settings
  const [zaloPhone, setZaloPhone] = useState(() => {
    return localStorage.getItem("fb_zalo_phone") || "0905123456";
  });
  const [zaloMessageTemplate, setZaloMessageTemplate] = useState(() => {
    return localStorage.getItem("fb_zalo_template") || "Dạ chào anh/chị, nếu anh/chị cần hỗ trợ gấp hoặc gọi điện tư vấn trực tiếp, vui lòng liên hệ Zalo Hotline của shop tại: https://zalo.me/{{PHONE}} để nhận cuộc gọi và hỗ trợ ngay lập tức ạ!";
  });

  // Sync Zalo settings to localstorage
  useEffect(() => {
    localStorage.setItem("fb_zalo_phone", zaloPhone);
  }, [zaloPhone]);

  useEffect(() => {
    localStorage.setItem("fb_zalo_template", zaloMessageTemplate);
  }, [zaloMessageTemplate]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Set default page on mount
  useEffect(() => {
    if (pages.length > 0) {
      const defaultPage = pages.find(p => p.isDefault) || pages[0];
      setSelectedPage(defaultPage);
    } else {
      setSelectedPage(null);
    }
  }, [pages]);

  // Load threads for selected page (persistent in localstorage)
  useEffect(() => {
    if (!selectedPage) {
      setThreads([]);
      setSelectedThread(null);
      return;
    }

    const storageKey = `fb_messenger_threads_${selectedPage.id}`;
    const saved = localStorage.getItem(storageKey);
    const deletedIds = getDeletedThreadIds(selectedPage.id);
    const isInboxCleared = localStorage.getItem(`fb_inbox_cleared_${selectedPage.id}`) === "true";

    if (saved !== null) {
      try {
        const parsed: ChatThread[] = JSON.parse(saved);
        const filtered = parsed.filter(t => !deletedIds.includes(t.id) && !deletedIds.includes(t.id.replace(/^t_/, "")));
        setThreads(filtered);
        // Find previously selected thread or default to first
        if (filtered.length > 0) {
          setSelectedThread(filtered[0]);
        } else {
          setSelectedThread(null);
        }
      } catch (e) {
        console.error("Error parsing saved threads:", e);
        setThreads([]);
        setSelectedThread(null);
      }
    } else if (isInboxCleared) {
      // User explicitly cleared inbox before
      setThreads([]);
      setSelectedThread(null);
    } else {
      // Fallback to mock defaults only if never saved/cleared
      const defaults = (MOCK_INITIAL_THREADS[selectedPage.id] || []).filter(
        t => !deletedIds.includes(t.id) && !deletedIds.includes(t.id.replace(/^t_/, ""))
      );
      setThreads(defaults);
      localStorage.setItem(storageKey, JSON.stringify(defaults));
      if (defaults.length > 0) {
        setSelectedThread(defaults[0]);
      } else {
        setSelectedThread(null);
      }
    }
    setAiSuggestion(null);

    // Load page-specific AI configurations on page switch
    const settingsKey = `fb_page_ai_settings_${selectedPage.id}`;
    const savedSettings = localStorage.getItem(settingsKey);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAiAutoreplyEnabled(parsed.enabled ?? true);
        setAiPersona(parsed.persona ?? "standard");
        setAiCustomInstructions(parsed.customInstructions ?? "");
        setAiHistoryLength(parsed.historyLength ?? 5);
      } catch (e) {
        console.error("Error loading AI settings:", e);
      }
    } else {
      // Set reasonable defaults based on page name
      setAiAutoreplyEnabled(true);
      setAiPersona("standard");
      setAiHistoryLength(5);
      if (selectedPage.name.toLowerCase().includes("mũi né") || selectedPage.name.toLowerCase().includes("may tinh")) {
        setAiCustomInstructions("Cửa hàng: Máy Tính Mũi Né\nĐịa chỉ: 125 Huỳnh Thúc Kháng, Mũi Né, Phan Thiết\nDịch vụ: Sửa máy tính tận nơi, cài Win dạo giá sinh viên 100k, vệ sinh PC/Laptop 150k, nâng cấp ổ cứng SSD 120GB giá 350k mượt gấp 5 lần, ráp máy PC gaming giá rẻ từ 6 triệu đồng.\nChính sách: Bảo hành 1 đổi 1 tận nơi, hỗ trợ nhiệt tình, tư vấn miễn phí.");
      } else {
        setAiCustomInstructions("Chào mừng bạn ghé thăm Page của chúng tôi. Chúng tôi chuyên cung cấp giải pháp công nghệ chất lượng cao.");
      }
    }
  }, [selectedPage]);

  // Save page-specific AI configurations helper
  const handleToggleAutoreply = (enabled: boolean) => {
    setAiAutoreplyEnabled(enabled);
    if (selectedPage) {
      const settingsKey = `fb_page_ai_settings_${selectedPage.id}`;
      localStorage.setItem(settingsKey, JSON.stringify({
        enabled,
        persona: aiPersona,
        customInstructions: aiCustomInstructions,
        historyLength: aiHistoryLength
      }));
    }
  };

  const handleChangePersona = (persona: "sales" | "support" | "playful" | "standard") => {
    setAiPersona(persona);
    if (selectedPage) {
      const settingsKey = `fb_page_ai_settings_${selectedPage.id}`;
      localStorage.setItem(settingsKey, JSON.stringify({
        enabled: aiAutoreplyEnabled,
        persona,
        customInstructions: aiCustomInstructions,
        historyLength: aiHistoryLength
      }));
    }
  };

  const handleChangeCustomInstructions = (custom: string) => {
    setAiCustomInstructions(custom);
    if (selectedPage) {
      const settingsKey = `fb_page_ai_settings_${selectedPage.id}`;
      localStorage.setItem(settingsKey, JSON.stringify({
        enabled: aiAutoreplyEnabled,
        persona: aiPersona,
        customInstructions: custom,
        historyLength: aiHistoryLength
      }));
    }
  };

  const handleChangeHistoryLength = (length: number) => {
    setAiHistoryLength(length);
    if (selectedPage) {
      const settingsKey = `fb_page_ai_settings_${selectedPage.id}`;
      localStorage.setItem(settingsKey, JSON.stringify({
        enabled: aiAutoreplyEnabled,
        persona: aiPersona,
        customInstructions: aiCustomInstructions,
        historyLength: length
      }));
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedThread?.messages, selectedThread?.id, isAutoreplyThinking]);

  // Helper to manage persistent deleted threads blacklist per page
  const getDeletedThreadIds = (pageId: string): string[] => {
    try {
      const raw = localStorage.getItem(`fb_deleted_threads_${pageId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const markThreadAsDeleted = (pageId: string, thread: ChatThread) => {
    try {
      const current = getDeletedThreadIds(pageId);
      const idsToAdd = [thread.id, thread.id.replace(/^t_/, "")];
      thread.messages.forEach(m => {
        if (m.senderId && !m.isPage) idsToAdd.push(m.senderId);
      });
      const updated = Array.from(new Set([...current, ...idsToAdd]));
      localStorage.setItem(`fb_deleted_threads_${pageId}`, JSON.stringify(updated));

      // Save metadata of the last message in this thread when it was deleted
      const lastMsg = thread.messages && thread.messages.length > 0 ? thread.messages[thread.messages.length - 1] : null;
      if (lastMsg) {
        const deletedMetaRaw = localStorage.getItem(`fb_deleted_threads_meta_${pageId}`);
        let deletedMeta = {};
        try {
          deletedMeta = deletedMetaRaw ? JSON.parse(deletedMetaRaw) : {};
        } catch {}
        (deletedMeta as any)[thread.id] = {
          lastMessageId: lastMsg.id,
          timestamp: lastMsg.timestamp,
          text: lastMsg.message
        };
        localStorage.setItem(`fb_deleted_threads_meta_${pageId}`, JSON.stringify(deletedMeta));
      }
    } catch (e) {
      console.error("Failed to persist deleted thread id:", e);
    }
  };

  const markAllCurrentThreadsAsDeleted = (pageId: string, currentThreads: ChatThread[]) => {
    try {
      const current = getDeletedThreadIds(pageId);
      const idsToAdd: string[] = [];
      const deletedMetaRaw = localStorage.getItem(`fb_deleted_threads_meta_${pageId}`);
      let deletedMeta = {};
      try {
        deletedMeta = deletedMetaRaw ? JSON.parse(deletedMetaRaw) : {};
      } catch {}

      currentThreads.forEach(t => {
        idsToAdd.push(t.id);
        idsToAdd.push(t.id.replace(/^t_/, ""));
        t.messages.forEach(m => {
          if (m.senderId && !m.isPage) idsToAdd.push(m.senderId);
        });

        const lastMsg = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;
        if (lastMsg) {
          (deletedMeta as any)[t.id] = {
            lastMessageId: lastMsg.id,
            timestamp: lastMsg.timestamp,
            text: lastMsg.message
          };
        }
      });
      const updated = Array.from(new Set([...current, ...idsToAdd]));
      localStorage.setItem(`fb_deleted_threads_${pageId}`, JSON.stringify(updated));
      localStorage.setItem(`fb_deleted_threads_meta_${pageId}`, JSON.stringify(deletedMeta));
      localStorage.setItem(`fb_inbox_cleared_${pageId}`, "true");
    } catch (e) {
      console.error("Failed to persist clear inbox:", e);
    }
  };

  const clearDeletedBlacklist = (pageId: string) => {
    localStorage.removeItem(`fb_deleted_threads_${pageId}`);
    localStorage.removeItem(`fb_deleted_threads_meta_${pageId}`);
    localStorage.removeItem(`fb_inbox_cleared_${pageId}`);
  };

  // Helper to sync threads back to LocalStorage
  const saveThreadsToStorage = (updatedThreads: ChatThread[]) => {
    if (!selectedPage) return;
    const storageKey = `fb_messenger_threads_${selectedPage.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedThreads));
  };

  // Helper to build AI system instructions with smart Zalo routing logic
  const buildAiPromptInstructions = () => {
    let finalInstructions = aiCustomInstructions || "";

    // Append custom knowledge base documents if any are selected
    if (selectedPage) {
      const knowledgeKey = `fb_page_ai_knowledge_${selectedPage.id}`;
      const savedKnowledge = localStorage.getItem(knowledgeKey);
      if (savedKnowledge) {
        try {
          const parsed = JSON.parse(savedKnowledge);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const knowledgeBlocks = parsed.map((item: any, idx: number) => {
              const text = typeof item === 'string' ? item : (item.message || "");
              return `Tài liệu kiến thức thực tế ${idx + 1}:\n"""\n${text}\n"""`;
            }).join("\n\n");
            
            finalInstructions += `\n\nKIẾN THỨC VÀ THÔNG TIN SẢN PHẨM/DỊCH VỤ THỰC TẾ (Sử dụng thông tin dưới đây để trả lời câu hỏi của khách hàng một cách chính xác nhất):\n${knowledgeBlocks}`;
          }
        } catch (e) {
          console.error("Error reading selected knowledge posts:", e);
        }
      }
    }

    if (zaloPhone) {
      const cleanPhone = zaloPhone.replace(/\D/g, "");
      finalInstructions += `\n\nTHÔNG TIN HOTLINE / ZALO CỬA HÀNG: Số Hotline/Zalo kỹ thuật là ${zaloPhone} (link: https://zalo.me/${cleanPhone}).\n` +
        `QUY TẮC PHÂN LUỒNG ZALO QUAN TRỌNG:\n` +
        `- TUYỆT ĐỐI KHÔNG đưa link Zalo hoặc số điện thoại vào các câu chào hỏi, hỏi giá thông thường, hỏi giờ giấc, hỏi cấu hình hay các thắc mắc thông thường mà bạn có thể trả lời trực tiếp.\n` +
        `- CHỈ ĐƯỢC CHỦ ĐỘNG GỢI Ý ZALO KHI:\n` +
        `  1. Khách hàng gặp câu hỏi kỹ thuật quá khó, lỗi phần cứng bí ẩn cần gửi video clip kiểm tra chuyên sâu, hoặc cần thợ kỹ thuật liên hệ trực tiếp để khảo sát tận nơi.\n` +
        `  2. Khách hàng có việc khẩn cấp (ví dụ: "cần gấp", "máy hỏng nặng cứu gấp", "cần thợ qua ngay").\n` +
        `  3. Khách hàng trực tiếp yêu cầu xin số điện thoại, xin Zalo hoặc muốn gọi điện thoại trao đổi.`;
    }
    return finalInstructions;
  };

  // Helper to trigger AI Auto-reply for a thread and dispatch to Facebook if Live mode
  const triggerAiAutoreplyForThread = async (
    targetThread: ChatThread,
    customerMessageText: string,
    historyMessages: ChatMessage[]
  ) => {
    if (!selectedPage || !aiAutoreplyEnabled) return;

    // Check if we've already answered this specific message ID or timestamp
    const respondedKey = `fb_ai_responded_${selectedPage.id}_${targetThread.id}`;
    const lastRespondedMsg = localStorage.getItem(respondedKey);
    if (lastRespondedMsg === customerMessageText) {
      return; // Already replied to this message
    }

    setIsAutoreplyThinking(true);

    try {
      const finalInstructions = buildAiPromptInstructions();

      // 1. Generate reply with Gemini 3.1 Flash Lite
      const response = await fetch("/api/facebook/messages/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageName: selectedPage.name,
          customerName: targetThread.customerName,
          lastMessage: customerMessageText,
          chatHistory: historyMessages.slice(-aiHistoryLength).map(m => ({
            sender: m.isPage ? "Shop" : "Khách hàng",
            text: m.message
          })),
          persona: aiPersona,
          customInstructions: finalInstructions
        })
      });

      const data = await response.json();
      const aiResponseText = response.ok && data.suggestion
        ? data.suggestion
        : `Dạ chào anh/chị ${targetThread.customerName}! Cảm ơn anh/chị đã nhắn tin. Shop "${selectedPage.name}" đã nhận được tin: "${customerMessageText}". Em sẽ kiểm tra và tư vấn kỹ thuật ngay cho mình nhé ạ!`;

      // 2. Append AI reply to the thread
      const newAiMsg: ChatMessage = {
        id: "msg_ai_auto_" + Math.random().toString(36).substring(2, 9),
        senderId: selectedPage.id,
        senderName: `${selectedPage.name} (Trợ lý AI)`,
        message: aiResponseText,
        timestamp: new Date().toISOString(),
        isPage: true
      };

      const finalMessages = [...historyMessages, newAiMsg];
      const finalThread: ChatThread = {
        ...targetThread,
        lastMessage: aiResponseText,
        updatedAt: newAiMsg.timestamp,
        isUnread: false,
        messages: finalMessages
      };

      // Mark this message as answered
      localStorage.setItem(respondedKey, customerMessageText);

      // Update state & storage
      setSelectedThread(prev => prev && prev.id === targetThread.id ? finalThread : prev);
      setThreads(prev => {
        const list = prev.map(t => t.id === targetThread.id ? finalThread : t);
        saveThreadsToStorage(list);
        return list;
      });

      // 3. If Live Page connected with real access token, dispatch message back to Facebook via Graph API!
      if (!isDemoMode && selectedPage.accessToken && !selectedPage.accessToken.startsWith("demo_")) {
        const resolvedCustomerId = targetThread.customerId || (targetThread.id.startsWith("t_") ? targetThread.id.substring(2) : targetThread.id);
        try {
          await fetch("/api/facebook/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pageId: selectedPage.id,
              accessToken: selectedPage.accessToken,
              conversationId: targetThread.id,
              customerId: resolvedCustomerId,
              recipientId: resolvedCustomerId,
              message: aiResponseText
            })
          });
        } catch (sendErr) {
          console.error("Failed to push AI reply to live Facebook Graph API:", sendErr);
        }
      }

    } catch (err) {
      console.error("AI Autoreply Execution Error:", err);
    } finally {
      setIsAutoreplyThinking(false);
    }
  };

  // Sync Live Facebook Conversations from Graph API
  const syncFacebookConversations = async (silent = false) => {
    if (!selectedPage || !selectedPage.accessToken || selectedPage.accessToken.startsWith("demo_")) {
      if (!silent) {
        setIsSyncing(true);
        setTimeout(() => {
          setIsSyncing(false);
          setLastSyncedAt(new Date());
        }, 600);
      }
      return;
    }

    try {
      if (!silent) setIsSyncing(true);
      setLiveSyncError(null);

      const res = await fetch(`/api/facebook/conversations?pageId=${selectedPage.id}&accessToken=${encodeURIComponent(selectedPage.accessToken)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLiveSyncError(data.error || "Không thể tải tin nhắn từ Facebook. Vui lòng kiểm tra lại quyền.");
        return;
      }

      if (data.threads && Array.isArray(data.threads)) {
        let deletedIds = getDeletedThreadIds(selectedPage.id);
        const deletedMetaRaw = localStorage.getItem(`fb_deleted_threads_meta_${selectedPage.id}`);
        let deletedMeta = {};
        try {
          deletedMeta = deletedMetaRaw ? JSON.parse(deletedMetaRaw) : {};
        } catch {}

        let blacklistChanged = false;
        const updatedDeletedIds = [...deletedIds];

        data.threads.forEach((t: ChatThread) => {
          const cleanId = t.id.replace(/^t_/, "");
          const isBlacklisted = updatedDeletedIds.includes(t.id) || updatedDeletedIds.includes(cleanId);
          
          if (isBlacklisted) {
            const lastMsg = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;
            if (lastMsg) {
              const saved = (deletedMeta as any)[t.id] || (deletedMeta as any)[cleanId];
              // If there's new activity (different message ID, different timestamp, or different text)
              const isNewMessage = !saved || 
                (saved.lastMessageId && saved.lastMessageId !== lastMsg.id) || 
                (saved.timestamp && saved.timestamp !== lastMsg.timestamp) || 
                (saved.text && saved.text !== lastMsg.message);
              
              if (isNewMessage) {
                // Remove thread IDs from deleted blacklist
                const idx1 = updatedDeletedIds.indexOf(t.id);
                if (idx1 > -1) updatedDeletedIds.splice(idx1, 1);
                const idx2 = updatedDeletedIds.indexOf(cleanId);
                if (idx2 > -1) updatedDeletedIds.splice(idx2, 1);
                
                // Also remove customer's senderId from the blacklist if it was added
                if (lastMsg.senderId) {
                  const idx3 = updatedDeletedIds.indexOf(lastMsg.senderId);
                  if (idx3 > -1) updatedDeletedIds.splice(idx3, 1);
                }

                // Remove from metadata too
                delete (deletedMeta as any)[t.id];
                delete (deletedMeta as any)[cleanId];
                blacklistChanged = true;
              }
            }
          }
        });

        if (blacklistChanged) {
          deletedIds = updatedDeletedIds;
          localStorage.setItem(`fb_deleted_threads_${selectedPage.id}`, JSON.stringify(updatedDeletedIds));
          localStorage.setItem(`fb_deleted_threads_meta_${selectedPage.id}`, JSON.stringify(deletedMeta));
          // If we had a cleared state, turn it off since a new thread is now active
          localStorage.removeItem(`fb_inbox_cleared_${selectedPage.id}`);
        }

        const activeThreads = data.threads.filter((t: ChatThread) => {
          const cleanId = t.id.replace(/^t_/, "");
          return !deletedIds.includes(t.id) && !deletedIds.includes(cleanId);
        });

        setThreads(activeThreads);
        saveThreadsToStorage(activeThreads);
        setSelectedThread(prev => {
          if (!prev) return activeThreads.length > 0 ? activeThreads[0] : null;
          const match = activeThreads.find((t: ChatThread) => t.id === prev.id);
          return match || (activeThreads.length > 0 ? activeThreads[0] : null);
        });
        setLastSyncedAt(new Date());

        // Check if there is any unread thread whose last message is from customer and needs AI auto-reply
        if (aiAutoreplyEnabled) {
          for (const thread of activeThreads) {
            const msgs = thread.messages || [];
            if (msgs.length > 0) {
              const lastMsg = msgs[msgs.length - 1];
              // If last message is from customer (not page)
              if (!lastMsg.isPage && lastMsg.senderId !== selectedPage.id) {
                const respondedKey = `fb_ai_responded_${selectedPage.id}_${thread.id}`;
                const lastResponded = localStorage.getItem(respondedKey);
                if (lastResponded !== lastMsg.message) {
                  // Trigger AI Auto-reply
                  triggerAiAutoreplyForThread(thread, lastMsg.message, msgs);
                  break; // Process one at a time
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (!silent) {
        console.error("Live conversations fetch failed:", err);
        setLiveSyncError(err.message || "Không thể tải tin nhắn từ Facebook.");
      }
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  // Poll incoming webhook events and live conversations every 10 seconds
  useEffect(() => {
    if (!selectedPage || !selectedPage.accessToken || selectedPage.accessToken.startsWith("demo_")) {
      return;
    }

    // Initial fetch
    syncFacebookConversations(true);

    const interval = setInterval(() => {
      syncFacebookConversations(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedPage?.id, selectedPage?.accessToken]);

  const handleSelectThread = (thread: ChatThread) => {
    // Mark as read
    const updated = threads.map(t => t.id === thread.id ? { ...t, isUnread: false } : t);
    setThreads(updated);
    saveThreadsToStorage(updated);
    setSelectedThread({ ...thread, isUnread: false });
    setAiSuggestion(null);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedThread || !selectedPage) return;

    const messageContent = inputText.trim();
    setInputText("");
    setIsSending(true);

    const newMessage: ChatMessage = {
      id: "msg_user_" + Math.random().toString(36).substring(2, 9),
      senderId: selectedPage.id,
      senderName: selectedPage.name,
      message: messageContent,
      timestamp: new Date().toISOString(),
      isPage: true
    };

    const updatedMessages = [...selectedThread.messages, newMessage];
    const updatedThread: ChatThread = {
      ...selectedThread,
      lastMessage: messageContent,
      updatedAt: newMessage.timestamp,
      isUnread: false,
      messages: updatedMessages
    };

    // Update selected thread
    setSelectedThread(updatedThread);

    // Update list
    const updatedThreadsList = threads.map(t => t.id === selectedThread.id ? updatedThread : t);
    setThreads(updatedThreadsList);
    saveThreadsToStorage(updatedThreadsList);
    setIsSending(false);
    setAiSuggestion(null);

    // Trigger simulation reply in Demo Mode or when disconnected
    if (isDemoMode || !selectedPage.accessToken || selectedPage.accessToken.startsWith("demo_")) {
      setTimeout(() => {
        const customerReplies = [
          "Dạ vâng em cảm ơn shop nha, tư vấn nhiệt tình quá!",
          "Shop check xem có giao hàng luôn trong ngày được ở Phan Thiết không ạ?",
          "OK shop, tí nữa chồng em rảnh sẽ ghé qua bên Mũi Né xem trực tiếp ạ.",
          "Dạ em đã nhận được thông tin, lát em chuyển khoản cọc rồi shop ráp máy giúp em nhé.",
          "Vâng shop, bảo hành chính hãng tại shop luôn đúng không ạ?"
        ];

        // Choose a reply based on user message content
        let responseText = customerReplies[Math.floor(Math.random() * customerReplies.length)];
        if (messageContent.toLowerCase().includes("địa chỉ") || messageContent.toLowerCase().includes("ở đâu")) {
          responseText = "Dạ vâng shop ở Mũi Né thì gần nhà em rồi, lát tầm 5h em chạy qua xem luôn nhé.";
        } else if (messageContent.toLowerCase().includes("giá") || messageContent.toLowerCase().includes("bao nhiêu")) {
          responseText = "Dạ vâng giá đó hợp lý quá ạ, shop có hỗ trợ quẹt thẻ tín dụng không vậy ạ?";
        }

        const simMessage: ChatMessage = {
          id: "msg_sim_" + Math.random().toString(36).substring(2, 9),
          senderId: "customer_sim",
          senderName: selectedThread.customerName,
          message: responseText,
          timestamp: new Date().toISOString(),
          isPage: false
        };

        const finalMessages = [...updatedThread.messages, simMessage];
        const finalThread: ChatThread = {
          ...updatedThread,
          lastMessage: responseText,
          updatedAt: simMessage.timestamp,
          isUnread: true,
          messages: finalMessages
        };

        // If the user is still on this thread, update selected too
        setSelectedThread(prev => {
          if (prev && prev.id === selectedThread.id) {
            return finalThread;
          }
          return prev;
        });

        // Update list
        setThreads(prev => {
          const list = prev.map(t => t.id === selectedThread.id ? finalThread : t);
          saveThreadsToStorage(list);
          return list;
        });

        // If AI auto-reply is on, trigger it for this customer reply too!
        if (aiAutoreplyEnabled) {
          setTimeout(() => {
            triggerAiAutoreplyForThread(finalThread, responseText, finalMessages);
          }, 1000);
        }

      }, 1500);
    } else {
      // LIVE API SEND MESSAGE to Graph API (Standard Facebook Messenger endpoint)
      try {
        const lastCustomerMsg = [...selectedThread.messages].reverse().find(m => !m.isPage && m.senderId && m.senderId !== selectedPage.id);
        const resolvedCustomerId = selectedThread.customerId || lastCustomerMsg?.senderId || (selectedThread.id.startsWith("t_") ? selectedThread.id.substring(2) : selectedThread.id);

        const response = await fetch("/api/facebook/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: selectedPage.id,
            accessToken: selectedPage.accessToken,
            conversationId: selectedThread.id,
            customerId: resolvedCustomerId,
            recipientId: resolvedCustomerId,
            message: messageContent
          })
        });

        const resData = await response.json();
        if (!response.ok || !resData.success) {
          console.error("Facebook Live Message send error:", resData);
          setLiveSyncError(resData.error || "Không thể gửi tin nhắn qua Facebook. Kiểm tra lại quyền hoặc ID khách hàng.");
        } else {
          setLiveSyncError(null);
        }
      } catch (err: any) {
        console.error("Failed to make live message network request:", err);
        setLiveSyncError(err.message || "Lỗi mạng khi gửi tin nhắn tới Facebook.");
      }
    }
  };

  // Simulate incoming customer message and auto-trigger AI if enabled
  const simulateCustomerIncomingMessage = async (text: string) => {
    if (!selectedThread || !selectedPage) return;

    const messageContent = text.trim();
    if (!messageContent) return;

    // 1. Create the customer message
    const newCustomerMsg: ChatMessage = {
      id: "msg_cust_sim_" + Math.random().toString(36).substring(2, 9),
      senderId: "customer_sim",
      senderName: selectedThread.customerName,
      message: messageContent,
      timestamp: new Date().toISOString(),
      isPage: false
    };

    const updatedMessages = [...selectedThread.messages, newCustomerMsg];
    const updatedThread: ChatThread = {
      ...selectedThread,
      lastMessage: messageContent,
      updatedAt: newCustomerMsg.timestamp,
      isUnread: true,
      messages: updatedMessages
    };

    // Update state and storage
    setSelectedThread(updatedThread);
    const updatedList = threads.map(t => t.id === selectedThread.id ? updatedThread : t);
    setThreads(updatedList);
    saveThreadsToStorage(updatedList);

    // 2. If AI Auto-reply is enabled, trigger the auto-responder!
    if (aiAutoreplyEnabled) {
      setIsAutoreplyThinking(true);
      
      try {
        const finalInstructions = buildAiPromptInstructions();

        // Fetch AI suggest
        const response = await fetch("/api/facebook/messages/ai-suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageName: selectedPage.name,
            customerName: selectedThread.customerName,
            lastMessage: messageContent,
            chatHistory: updatedMessages.slice(-aiHistoryLength).map(m => ({
              sender: m.isPage ? "Shop" : "Khách hàng",
              text: m.message
            })),
            persona: aiPersona,
            customInstructions: finalInstructions
          })
        });

        const data = await response.json();
        
        // Add artificial delay for realism
        await new Promise(resolve => setTimeout(resolve, 2000));

        const aiResponseText = response.ok && data.suggestion 
          ? data.suggestion 
          : `Dạ chào anh/chị ${selectedThread.customerName}! Cảm ơn anh/chị đã quan tâm. Shop "${selectedPage.name}" đã nhận được yêu cầu: "${messageContent}". Nhân viên kỹ thuật sẽ tư vấn và hỗ trợ mình ngay lập tức ạ!`;

        const newAiMsg: ChatMessage = {
          id: "msg_ai_auto_" + Math.random().toString(36).substring(2, 9),
          senderId: selectedPage.id,
          senderName: `${selectedPage.name} (Trợ lý AI)`,
          message: aiResponseText,
          timestamp: new Date().toISOString(),
          isPage: true
        };

        const finalMessages = [...updatedThread.messages, newAiMsg];
        const finalThread: ChatThread = {
          ...updatedThread,
          lastMessage: aiResponseText,
          updatedAt: newAiMsg.timestamp,
          isUnread: false,
          messages: finalMessages
        };

        setSelectedThread(prev => prev && prev.id === selectedThread.id ? finalThread : prev);
        setThreads(prev => {
          const list = prev.map(t => t.id === selectedThread.id ? finalThread : t);
          saveThreadsToStorage(list);
          return list;
        });

      } catch (err) {
        console.error("AI Autoreply Error:", err);
      } finally {
        setIsAutoreplyThinking(false);
      }
    }
  };

  // Generate AI Suggestion based on last customer message
  const handleGenerateAiReply = async () => {
    if (!selectedThread || !selectedPage) return;

    // Find the last customer message
    const lastCustomerMsg = [...selectedThread.messages]
      .reverse()
      .find(m => !m.isPage);

    if (!lastCustomerMsg) return;

    try {
      setIsAiLoading(true);
      setAiSuggestion(null);

      const finalInstructions = buildAiPromptInstructions();

      const response = await fetch("/api/facebook/messages/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageName: selectedPage.name,
          customerName: selectedThread.customerName,
          lastMessage: lastCustomerMsg.message,
          chatHistory: selectedThread.messages.slice(-aiHistoryLength).map(m => ({
            sender: m.isPage ? "Shop" : "Khách hàng",
            text: m.message
          })),
          persona: aiPersona,
          customInstructions: finalInstructions
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate suggestion");
      }

      setAiSuggestion(data.suggestion);
    } catch (err: any) {
      console.error("AI Suggestion Error:", err);
      // Fallback response suggestion
      const plainPhone = zaloPhone.replace(/\D/g, "");
      setAiSuggestion(`Dạ chào anh/chị ${selectedThread.customerName}! Shop đã nhận được yêu cầu cần hỗ trợ gấp từ mình. Anh/chị vui lòng liên hệ ngay Zalo Hotline hỗ trợ gấp của cửa hàng tại https://zalo.me/${plainPhone} để bên em gọi điện tư vấn chi tiết hỗ trợ kỹ thuật nhanh nhất cho mình nhé ạ!`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (aiSuggestion) {
      setInputText(aiSuggestion);
      setAiSuggestion(null);
    }
  };

  // Action helper to instantly send Zalo Escalation Call Card to customer
  const handleSendZaloCard = async () => {
    if (!selectedThread || !selectedPage) return;

    const plainPhone = zaloPhone.replace(/\D/g, "");
    const formattedMessage = zaloMessageTemplate.replace("{{PHONE}}", plainPhone);

    const newMessage: ChatMessage = {
      id: "msg_zalo_send_" + Math.random().toString(36).substring(2, 9),
      senderId: selectedPage.id,
      senderName: `${selectedPage.name} (Zalo Hotline)`,
      message: formattedMessage,
      timestamp: new Date().toISOString(),
      isPage: true
    };

    const updatedMessages = [...selectedThread.messages, newMessage];
    const updatedThread: ChatThread = {
      ...selectedThread,
      lastMessage: "Đã gửi thông tin Zalo Hotline hỗ trợ gấp.",
      updatedAt: newMessage.timestamp,
      isUnread: false,
      messages: updatedMessages
    };

    // Update state & storage
    setSelectedThread(updatedThread);
    const updatedThreadsList = threads.map(t => t.id === selectedThread.id ? updatedThread : t);
    setThreads(updatedThreadsList);
    saveThreadsToStorage(updatedThreadsList);

    // If live mode, propagate to live FB page too
    if (!isDemoMode && selectedPage.accessToken && !selectedPage.accessToken.startsWith("demo_")) {
      try {
        await fetch("/api/facebook/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: selectedPage.id,
            accessToken: selectedPage.accessToken,
            recipientId: selectedThread.id,
            message: formattedMessage
          })
        });
      } catch (err) {
        console.error("Failed to send live Zalo card:", err);
      }
    }
  };

  // Delete single thread
  const handleConfirmDeleteThread = () => {
    if (!threadToDelete || !selectedPage) return;
    markThreadAsDeleted(selectedPage.id, threadToDelete);
    const updated = threads.filter(t => t.id !== threadToDelete.id);
    setThreads(updated);
    saveThreadsToStorage(updated);

    if (selectedThread?.id === threadToDelete.id) {
      setSelectedThread(updated.length > 0 ? updated[0] : null);
    }
    setThreadToDelete(null);
  };

  // Clear all threads in inbox
  const handleConfirmClearAllThreads = () => {
    if (!selectedPage) return;
    markAllCurrentThreadsAsDeleted(selectedPage.id, threads);
    setThreads([]);
    saveThreadsToStorage([]);
    setSelectedThread(null);
    setShowClearAllModal(false);
  };

  // Restore deleted threads if user wants to re-fetch from Facebook
  const handleRestoreDeletedThreads = async () => {
    if (!selectedPage) return;
    clearDeletedBlacklist(selectedPage.id);
    await syncFacebookConversations(false);
  };

  // Filter threads by search query
  const filteredThreads = threads.filter(t => 
    t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to format time relative to now
  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return date.toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" });
    } catch (e) {
      return "";
    }
  };

  // 1. Empty state if no connected Facebook Pages
  if (pages.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-5 max-w-xl mx-auto shadow-sm my-10">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 animate-pulse">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Messenger Inbox Chưa Sẵn Sàng</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Hệ thống cần liên kết ít nhất một Trang Facebook (Facebook Page) của bạn để đồng bộ tin nhắn Messenger, trả lời tự động và kích hoạt Trợ lý AI.
          </p>
        </div>
        <button 
          onClick={onNavigateToConnections}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          Kết nối Facebook Page Ngay
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[calc(100vh-112px)] md:h-[calc(100vh-130px)]">
      
      {/* Top Header Controls */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <MessageCircleCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Messenger Inbox
              </h1>
              {selectedPage?.accessToken && !selectedPage.accessToken.startsWith("demo_") ? (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
                  Live Facebook
                </span>
              ) : (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lastSyncedAt 
                ? `Đồng bộ lần cuối lúc: ${lastSyncedAt.toLocaleTimeString("vi-VN")}` 
                : "Đồng bộ tin nhắn & chăm sóc khách hàng tự động"}
            </p>
          </div>
        </div>

        {/* Action Controls & Facebook Page Dropdown Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Sync Button */}
          <button
            onClick={() => syncFacebookConversations(false)}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Đồng bộ tin nhắn mới nhất từ Facebook Page"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Đang đồng bộ..." : "Đồng bộ tin nhắn"}</span>
          </button>

          {/* Webhook / Live Info Toggle */}
          <button
            onClick={() => setShowWebhookGuide(!showWebhookGuide)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showWebhookGuide 
                ? "bg-blue-50 text-blue-700 border-blue-200" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            title="Hướng dẫn nhận tin nhắn trực tiếp"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
          </button>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Page:</span>
            <select 
              value={selectedPage?.id || ""}
              onChange={(e) => {
                const selected = pages.find(p => p.id === e.target.value);
                if (selected) setSelectedPage(selected);
              }}
              className="text-xs font-semibold text-slate-700 bg-transparent outline-hidden cursor-pointer max-w-[160px] sm:max-w-[200px] truncate"
            >
              {pages.map(page => (
                <option key={page.id} value={page.id}>
                  🚩 {page.name} ({page.accountName || "MÁY TÍNH MŨI NÉ"})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Webhook & Permissions Guide Banner (Collapsible) */}
      {(showWebhookGuide || liveSyncError) && (
        <div className="p-4 bg-blue-50/70 border-b border-blue-100 text-xs space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Hướng dẫn nhận & đồng bộ tin nhắn Facebook Messenger</span>
            </div>
            <button 
              onClick={() => { setShowWebhookGuide(false); setLiveSyncError(null); }}
              className="text-slate-400 hover:text-slate-600 font-bold px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {liveSyncError && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Thông báo từ Facebook API:</p>
                <p className="text-[11px] text-amber-700 mt-0.5">{liveSyncError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-slate-600 pt-1">
            <div className="p-2.5 bg-white rounded-lg border border-blue-100">
              <p className="font-bold text-slate-800 mb-1">1. Gửi tin nhắn thử</p>
              <p className="text-[11px] leading-relaxed">
                Mở Facebook hoặc ứng dụng Messenger cá nhân, tìm Trang <strong className="text-blue-600">{selectedPage?.name}</strong> và gửi tin nhắn text bất kỳ.
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-blue-100">
              <p className="font-bold text-slate-800 mb-1">2. Đồng bộ tự động</p>
              <p className="text-[11px] leading-relaxed">
                Hệ thống tự động kiểm tra tin nhắn mới mỗi 10 giây hoặc bạn có thể bấm ngay nút <strong>"Đồng bộ tin nhắn"</strong> ở góc trên bên phải.
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-blue-100">
              <p className="font-bold text-slate-800 mb-1">3. Cấp quyền Messenger</p>
              <p className="text-[11px] leading-relaxed">
                Đảm bảo khi Đăng nhập Facebook, bạn cho phép quyền <code>pages_messaging</code> để hệ thống có quyền đọc và trả lời tin nhắn của Trang.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Inbox Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Side: Threads list */}
        <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/20 ${selectedThread ? "hidden md:flex" : "flex"}`}>
          
          {/* Threads search bar */}
          <div className="p-3 border-b border-slate-100/80 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm khách hàng, tin nhắn..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-100/70 hover:bg-slate-100 focus:bg-white text-slate-700 rounded-xl pl-9 pr-4 py-2 outline-hidden border border-transparent focus:border-slate-200 transition-all placeholder:text-slate-400"
              />
            </div>
            {threads.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearAllModal(true)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200/80 transition-all shrink-0 cursor-pointer"
                title="Xóa tất cả hội thoại trong hộp thư"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Threads list scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50">
            {filteredThreads.length > 0 ? (
              filteredThreads.map(thread => {
                const isSelected = selectedThread?.id === thread.id;
                return (
                  <div 
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`group w-full p-3 text-left transition-all hover:bg-slate-50 flex items-start gap-3 cursor-pointer relative ${
                      isSelected ? "bg-blue-50/50 border-l-3 border-blue-600" : ""
                    }`}
                  >
                    {/* Avatar with Status badge */}
                    <div className="relative flex-shrink-0">
                      {thread.customerAvatar ? (
                        <img 
                          src={thread.customerAvatar} 
                          alt={thread.customerName} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-3xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${thread.isUnread ? "text-slate-900" : "text-slate-700"}`}>
                          {thread.customerName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-1">
                          {formatRelativeTime(thread.updatedAt)}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-1 ${thread.isUnread ? "text-slate-800 font-semibold" : "text-slate-500"}`}>
                        {thread.lastMessage}
                      </p>
                    </div>

                    {/* Actions & unread indicator */}
                    <div className="flex items-center gap-1 shrink-0 self-center">
                      {thread.isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shadow-xs group-hover:hidden"></span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThreadToDelete(thread);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title={`Xóa cuộc trò chuyện với ${thread.customerName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-3">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p>Hộp thư trống hoặc không có tin nhắn phù hợp.</p>
                {selectedPage && getDeletedThreadIds(selectedPage.id).length > 0 && (
                  <button
                    type="button"
                    onClick={handleRestoreDeletedThreads}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Tải lại tất cả từ Facebook
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat message detail pane */}
        <div className={`flex-1 flex flex-col bg-white overflow-hidden ${selectedThread ? "flex" : "hidden md:flex"}`}>
          {selectedThread ? (
            <>
              {/* Active Conversation Header */}
              <div id="msg-header" className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setSelectedThread(null)}
                    className="md:hidden p-1.5 -ml-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer mr-0.5"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img 
                    src={selectedThread.customerAvatar} 
                    alt={selectedThread.customerName} 
                    className="w-9 h-9 rounded-full object-cover border"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h2 className="text-xs font-bold text-slate-800">{selectedThread.customerName}</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] text-slate-500 font-medium">Đang hoạt động trên Facebook</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="text-right hidden md:block">
                    <span className="text-[10px] font-semibold text-slate-400 block">Kênh kết nối</span>
                    <span className="text-[11px] font-bold text-blue-700">{selectedPage?.name}</span>
                  </div>

                  <button
                    id="btn-delete-active-thread"
                    type="button"
                    onClick={() => setThreadToDelete(selectedThread)}
                    className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Xóa cuộc trò chuyện này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Xóa hội thoại</span>
                  </button>

                  <button
                    id="btn-send-zalo-escalation"
                    type="button"
                    onClick={handleSendZaloCard}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-250 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Gửi ngay thông tin liên hệ Zalo Hotline hỗ trợ gấp"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    <span className="hidden sm:inline">Chuyển Zalo Gấp</span>
                    <span className="sm:hidden">Zalo</span>
                  </button>

                  <button
                    id="btn-toggle-ai-config"
                    type="button"
                    onClick={() => setIsAiConfigOpen(!isAiConfigOpen)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isAiConfigOpen 
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>{isAiConfigOpen ? "Đóng cài đặt AI" : "Cấu hình AI"}</span>
                  </button>
                </div>
              </div>

              {/* Chat Message Scrollable Bubble list */}
              <div id="chat-messages-container" className="flex-1 overflow-y-auto p-5 bg-slate-50/30 space-y-4">
                {selectedThread.messages.map((msg, index) => {
                  const isPage = msg.isPage;
                  const isAutoAi = msg.senderName?.includes("Trợ lý AI");
                  return (
                    <div 
                      key={msg.id || index} 
                      className={`flex ${isPage ? "justify-end" : "justify-start"} items-end gap-2.5`}
                    >
                      {/* Customer avatar on left */}
                      {!isPage && (
                        <img 
                          src={selectedThread.customerAvatar} 
                          alt={selectedThread.customerName} 
                          className="w-7 h-7 rounded-full object-cover mb-1 border shadow-4xs"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      {/* Bubble box */}
                      <div className={`max-w-[70%] space-y-1`}>
                        <div 
                          className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-3xs ${
                            isPage 
                              ? isAutoAi 
                                ? "bg-indigo-600 text-white rounded-br-none border border-indigo-500" 
                                : "bg-blue-600 text-white rounded-br-none" 
                              : "bg-white text-slate-800 border border-slate-150 rounded-bl-none"
                          }`}
                        >
                          <div>{msg.message}</div>
                          {msg.message.includes("zalo.me") && (
                            <div className={`mt-3 p-3 rounded-xl border flex flex-col gap-2.5 transition-all ${
                              isPage 
                                ? "bg-white/15 border-white/20 text-white" 
                                : "bg-blue-50/50 border-blue-100 text-slate-800"
                            }`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 select-none ${
                                  isPage ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                                }`}>
                                  Zalo
                                </div>
                                <div className="text-left">
                                  <p className="font-bold text-xs">Hotline Hỗ Trợ Gấp (Zalo)</p>
                                  <p className={`text-[10px] ${isPage ? "text-white/80" : "text-slate-500"}`}>Nhấn để nhận cuộc gọi tư vấn ngay</p>
                                </div>
                              </div>
                              <a 
                                href={`https://zalo.me/${zaloPhone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className={`w-full py-2 px-3 rounded-lg text-center font-bold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] ${
                                  isPage 
                                    ? "bg-white text-blue-700 hover:bg-slate-50" 
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>Gọi Điện / Chat Zalo Ngay</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 px-1 ${isPage ? "justify-end" : "justify-start"}`}>
                          {isAutoAi && (
                            <span className="text-[8px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              ✨ Trợ lý AI tự động
                            </span>
                          )}
                          <p className={`text-[9px] text-slate-400 font-medium`}>
                            {new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>

                      {/* Page avatar on right (optional, just empty check check icon) */}
                      {isPage && (
                        <div className="text-blue-500 mb-1">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* AI Autoreply thinking typing bubble */}
                {isAutoreplyThinking && (
                  <div className="flex justify-start items-end gap-2.5 animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-4xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="max-w-[70%] space-y-1">
                      <div className="rounded-2xl px-4 py-2.5 text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium flex items-center gap-2 rounded-bl-none">
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                        <span>Trợ lý AI đang soạn câu trả lời tự động...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* AI Suggestion Box Panel */}
              {aiSuggestion && (
                <div id="ai-suggestion-panel" className="mx-4 mt-2 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl shadow-2xs space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                      <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                      <span>Trợ lý AI gợi ý phản hồi:</span>
                    </div>
                    <button 
                      id="btn-dismiss-ai-suggest"
                      onClick={() => setAiSuggestion(null)} 
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Bỏ qua
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-indigo-100/50 leading-relaxed font-medium">
                    "{aiSuggestion}"
                  </p>
                  <div className="flex justify-end gap-2">
                    <button 
                      id="btn-apply-ai-suggest"
                      onClick={handleApplyAiSuggestion}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      Sử dụng câu trả lời này
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input & Action Triggers */}
              <div className="p-4 border-t border-slate-100 bg-white space-y-2.5">
                
                {/* Live Message Error Banner */}
                {liveSyncError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start justify-between gap-2 animate-fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Không thể chuyển tin nhắn đến Messenger Facebook:</p>
                        <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">{liveSyncError}</p>
                        <p className="text-[10px] text-rose-600 mt-1">
                          💡 <em>Gợi ý:</em> Hãy đảm bảo khách hàng đã nhắn tin vào Page trong 24h gần nhất và tài khoản Facebook đã được cấp quyền <code>pages_messaging</code> khi đăng nhập.
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setLiveSyncError(null)}
                      className="text-rose-400 hover:text-rose-700 font-bold px-1 text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* AI Assistant Trigger Button Row */}
                <div className="flex items-center justify-between mb-1">
                  <button 
                    id="btn-trigger-copilot"
                    type="button"
                    onClick={handleGenerateAiReply}
                    disabled={isAiLoading}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-blue-200/50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-transparent"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang phân tích tin nhắn...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                        <span>Trợ lý AI soạn trả lời mẫu</span>
                      </>
                    )}
                  </button>

                  {/* Standard Templates */}
                  <div className="flex gap-1.5">
                    <button 
                      id="btn-tmpl-greet"
                      onClick={() => setInputText(`Chào ${selectedThread.customerName} ạ! Shop có thể hỗ trợ tư vấn chi tiết gì cho anh/chị hôm nay thế ạ?`)}
                      className="px-2 py-1 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-lg text-[10px] font-semibold cursor-pointer"
                    >
                      👋 Chào khách
                    </button>
                    <button 
                      id="btn-tmpl-address"
                      onClick={() => setInputText("Dạ shop ở địa chỉ: 125 Huỳnh Thúc Kháng, Mũi Né, Phan Thiết ạ. Shop mở cửa từ 8h00 đến 21h00 hàng ngày, rất mong được đón tiếp anh/chị ghé qua!")}
                      className="px-2 py-1 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-lg text-[10px] font-semibold cursor-pointer"
                    >
                      📍 Địa chỉ shop
                    </button>
                    <button 
                      id="btn-tmpl-zalo"
                      onClick={() => setInputText(`Dạ nếu anh/chị cần hỗ trợ gấp hoặc gọi điện tư vấn trực tiếp, vui lòng liên hệ ngay Zalo Hotline của shop tại: https://zalo.me/${zaloPhone.replace(/\D/g, "")} nha!`)}
                      className="px-2 py-1 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-lg text-[10px] font-semibold cursor-pointer"
                    >
                      📞 Gợi ý Zalo
                    </button>
                  </div>
                </div>

                {/* Main typing form */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Nhập tin nhắn phản hồi..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isSending}
                    className="flex-1 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-800 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 outline-hidden transition-all shadow-3xs"
                  />
                  <button 
                    id="btn-send-message"
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl shadow-md disabled:shadow-none hover:shadow-lg cursor-pointer disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Simulated notification tag */}
                {isDemoMode && (
                  <p className="text-[10px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Demo Simulation: Tin nhắn gửi đi sẽ tự động nhận câu trả lời giả lập từ khách hàng sau 2 giây.</span>
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 bg-slate-50/10">
              <MessageSquare className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-sm font-semibold">Chưa chọn cuộc hội thoại nào</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Vui lòng chọn một cuộc hội thoại từ danh sách bên trái để xem lịch sử tin nhắn và trả lời.
              </p>
            </div>
          )}
        </div>

        {/* Rightmost Settings Desk: AI Config & Simulator */}
        {isAiConfigOpen && selectedThread && selectedPage && (
          <div id="ai-settings-sidebar" className="w-80 border-l border-slate-200 bg-slate-50/50 flex flex-col overflow-y-auto p-4 space-y-5 animate-in slide-in-from-right duration-150">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Cài Đặt Trợ Lý AI</span>
                </h3>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  Gemini 3.1 Flash Lite
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Tự động hóa kết nối và phản hồi khách hàng thông minh</p>
            </div>

            {/* Auto reply switch card */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Tự động trả lời AI</span>
                <button
                  id="btn-toggle-autoreply"
                  type="button"
                  onClick={() => handleToggleAutoreply(!aiAutoreplyEnabled)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    aiAutoreplyEnabled ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      aiAutoreplyEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/40 text-[10px] text-indigo-900 leading-relaxed font-medium">
                {aiAutoreplyEnabled ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Đã bật Autopilot Mode: AI tự phản hồi!
                  </span>
                ) : (
                  <span>Đang tắt: Bạn cần soạn câu trả lời thủ công hoặc bấm nút gợi ý từng câu một.</span>
                )}
              </div>
            </div>

            {/* AI Behavior Selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tính cách & Giọng điệu AI
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "standard", label: "Tiêu chuẩn", desc: "Chu đáo, lịch sự" },
                  { id: "sales", label: "Chốt đơn", desc: "Thuyết phục, ưu đãi" },
                  { id: "support", label: "Kỹ thuật", desc: "Kiên nhẫn, hỗ trợ" },
                  { id: "playful", label: "Thân thiện", desc: "Hài hước, gần gũi" }
                ].map(item => (
                  <button
                    key={item.id}
                    id={`btn-persona-${item.id}`}
                    type="button"
                    onClick={() => handleChangePersona(item.id as any)}
                    className={`p-2 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                      aiPersona === item.id
                        ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[9px] text-slate-400 font-normal leading-tight mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions box */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Chỉ dẫn riêng / Kiến thức cửa hàng
              </label>
              <textarea
                id="txt-ai-custom-instructions"
                value={aiCustomInstructions}
                onChange={(e) => handleChangeCustomInstructions(e.target.value)}
                rows={5}
                placeholder="Ví dụ: Shop ở 125 Huỳnh Thúc Kháng, cài Win dạo giá 100k, ráp máy chơi game FO4 giá 12 triệu..."
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 resize-none font-medium text-slate-700 shadow-3xs"
              />
              <p className="text-[10px] text-slate-400 italic leading-tight">
                AI sẽ tham chiếu kiến thức này khi trả lời tự động cho khách hàng của bạn.
              </p>
            </div>

            {/* Context Memory Length */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-750">Độ dài ngữ cảnh hội thoại</span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-150">
                  {aiHistoryLength} tin nhắn
                </span>
              </div>
              <input
                id="range-ai-history-length"
                type="range"
                min={1}
                max={20}
                step={1}
                value={aiHistoryLength}
                onChange={(e) => handleChangeHistoryLength(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                <span>Ngắn (1 tin)</span>
                <span>Vừa (10 tin)</span>
                <span>Dài (20 tin)</span>
              </div>
              <p className="text-[10px] text-slate-400 italic leading-tight">
                Cấu hình số tin nhắn gần nhất AI sẽ xem xét để nhớ ngữ cảnh trò chuyện, giúp trả lời liền mạch và không bị trùng lặp thông tin.
              </p>
            </div>

            {/* Zalo Escalation Hotline Config Card */}
            <div className="bg-white p-3.5 rounded-xl border border-blue-150 shadow-3xs space-y-3">
              <div className="flex items-center justify-between text-blue-850">
                <div className="flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-blue-600 animate-pulse shrink-0" />
                  <span className="text-xs font-black">Zalo Hotline Kỹ Thuật</span>
                </div>
                <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                  Chỉ gửi khi cần gấp / ca khó
                </span>
              </div>

              <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100 text-[10px] text-blue-900 leading-relaxed">
                🛡️ <strong>Nguyên tắc:</strong> AI sẽ tự giải đáp các câu hỏi thông thường trên Messenger. AI <strong>chỉ</strong> đưa link Zalo khi khách cần gấp, xin số điện thoại, hoặc ca sửa chữa phức tạp.
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                  Số điện thoại Zalo
                </label>
                <input
                  id="input-zalo-phone"
                  type="text"
                  value={zaloPhone}
                  onChange={(e) => setZaloPhone(e.target.value)}
                  placeholder="Ví dụ: 0905123456"
                  className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg outline-none font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                  Tin nhắn mẫu giới thiệu
                </label>
                <textarea
                  id="txt-zalo-template"
                  value={zaloMessageTemplate}
                  onChange={(e) => setZaloMessageTemplate(e.target.value)}
                  rows={2}
                  placeholder="Tin nhắn gửi đi giới thiệu hotline..."
                  className="w-full text-[11px] p-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg outline-none resize-none font-medium text-slate-700 leading-tight"
                />
                <p className="text-[9px] text-slate-400 italic">
                  Sử dụng <code className="font-mono text-blue-600 font-bold bg-slate-100 px-1 rounded">{"{{PHONE}}"}</code> để chèn số điện thoại ở trên.
                </p>
              </div>

              <button
                id="btn-send-zalo-sidebar"
                type="button"
                onClick={handleSendZaloCard}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Gửi Thẻ Hotline Zalo Ngay</span>
              </button>
            </div>

            {/* Simulator Sandbox */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span>Giả Lập Tin Nhắn Đến</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Giả lập tin nhắn từ khách gửi đến để kiểm tra AI hoạt động tự động</p>
              </div>

              {/* Predefined questions list */}
              <div className="space-y-1.5">
                {[
                  "Chào shop",
                  "Cửa hàng mình mở cửa đến mấy giờ ạ?",
                  "Sửa máy tính ở Mũi Né bao nhiêu tiền hả shop?",
                  "Shop ơi có card màn hình cũ GTX 1660s không?",
                  "Có ráp PC Gaming tầm 10 triệu không shop?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    id={`btn-sim-q-${idx}`}
                    type="button"
                    onClick={() => simulateCustomerIncomingMessage(q)}
                    disabled={isAutoreplyThinking}
                    className="w-full text-left p-2 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 text-[11px] text-slate-600 font-medium border border-slate-200/50 hover:border-indigo-200 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed truncate flex items-center gap-1.5"
                    title={q}
                  >
                    <span>💬</span>
                    <span className="font-semibold">{q}</span>
                  </button>
                ))}
              </div>

              {/* Custom question simulation form */}
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1.5">
                  <input
                    id="input-custom-sim"
                    type="text"
                    value={customSimText}
                    onChange={(e) => setCustomSimText(e.target.value)}
                    placeholder="Nhập tin nhắn khách tự gõ..."
                    disabled={isAutoreplyThinking}
                    className="flex-1 text-[11px] px-2 py-1.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none"
                  />
                  <button
                    id="btn-send-custom-sim"
                    type="button"
                    onClick={() => {
                      if (!customSimText.trim()) return;
                      simulateCustomerIncomingMessage(customSimText);
                      setCustomSimText("");
                    }}
                    disabled={!customSimText.trim() || isAutoreplyThinking}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Delete Single Thread Confirmation Modal */}
      {threadToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-150 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <button 
                type="button"
                onClick={() => setThreadToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-800 text-sm">
                Xóa cuộc trò chuyện này?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bạn có chắc muốn xóa cuộc trò chuyện với <strong className="text-slate-800 font-semibold">{threadToDelete.customerName}</strong> khỏi hộp thư của Trang <strong className="text-blue-600 font-semibold">{selectedPage?.name}</strong> không?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setThreadToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteThread}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Threads Confirmation Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-150 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <button 
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-800 text-sm">
                Xóa tất cả hội thoại trong hộp thư?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thao tác này sẽ dọn sạch toàn bộ <strong className="text-slate-800 font-semibold">{threads.length} cuộc hội thoại</strong> hiện có trong hộp thư của Trang <strong className="text-blue-600 font-semibold">{selectedPage?.name}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllThreads}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tất cả</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
