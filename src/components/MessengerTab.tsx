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
  ExternalLink
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

  // AI Autopilot / Auto-Reply state configurations
  const [aiAutoreplyEnabled, setAiAutoreplyEnabled] = useState(false);
  const [aiPersona, setAiPersona] = useState<"sales" | "support" | "playful" | "standard">("standard");
  const [aiCustomInstructions, setAiCustomInstructions] = useState("");
  const [isAutoreplyThinking, setIsAutoreplyThinking] = useState(false);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(true);

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

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setThreads(parsed);
        // Find previously selected thread or default to first
        if (parsed.length > 0) {
          setSelectedThread(parsed[0]);
        } else {
          setSelectedThread(null);
        }
      } catch (e) {
        console.error("Error parsing saved threads:", e);
      }
    } else {
      // Fallback to mock defaults or empty list
      const defaults = MOCK_INITIAL_THREADS[selectedPage.id] || [];
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
        setAiAutoreplyEnabled(parsed.enabled ?? false);
        setAiPersona(parsed.persona ?? "standard");
        setAiCustomInstructions(parsed.customInstructions ?? "");
      } catch (e) {
        console.error("Error loading AI settings:", e);
      }
    } else {
      // Set reasonable defaults based on page name
      setAiAutoreplyEnabled(false);
      setAiPersona("standard");
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
        customInstructions: aiCustomInstructions
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
        customInstructions: aiCustomInstructions
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
        customInstructions: custom
      }));
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedThread?.messages, selectedThread?.id, isAutoreplyThinking]);

  // Helper to sync threads back to LocalStorage
  const saveThreadsToStorage = (updatedThreads: ChatThread[]) => {
    if (!selectedPage) return;
    const storageKey = `fb_messenger_threads_${selectedPage.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedThreads));
  };

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

      }, 2000);
    } else {
      // LIVE API SEND MESSAGE to Graph API (Standard Facebook Messenger endpoint)
      try {
        const response = await fetch("/api/facebook/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: selectedPage.id,
            accessToken: selectedPage.accessToken,
            recipientId: selectedThread.id, // Using Thread ID or PSID as recipient
            message: messageContent
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          console.error("Facebook Live Message send error:", errData);
        }
      } catch (err) {
        console.error("Failed to make live message network request:", err);
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
        let finalInstructions = aiCustomInstructions || "";
        if (zaloPhone) {
          finalInstructions += `\nLƯU Ý QUAN TRỌNG VỀ HỖ TRỢ KHÁCH HÀNG GẤP: Nếu khách hàng tỏ ra cần gấp, muốn liên hệ trực tiếp, gọi điện thoại, cần hỗ trợ gấp hoặc hỏi số hotline/zalo, bạn hãy chủ động hướng dẫn họ liên hệ qua Zalo Hotline tại link: https://zalo.me/${zaloPhone.replace(/\D/g, "")} để nhận cuộc gọi hỗ trợ từ kỹ thuật viên ngay nhé.`;
        }

        // Fetch AI suggest
        const response = await fetch("/api/facebook/messages/ai-suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageName: selectedPage.name,
            customerName: selectedThread.customerName,
            lastMessage: messageContent,
            chatHistory: updatedMessages.slice(-5).map(m => ({
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

      let finalInstructions = aiCustomInstructions || "";
      if (zaloPhone) {
        finalInstructions += `\nLƯU Ý QUAN TRỌNG VỀ HỖ TRỢ KHÁCH HÀNG GẤP: Nếu khách hàng tỏ ra cần gấp, muốn liên hệ trực tiếp, gọi điện thoại, cần hỗ trợ gấp hoặc hỏi số hotline/zalo, bạn hãy chủ động hướng dẫn họ liên hệ qua Zalo Hotline tại link: https://zalo.me/${zaloPhone.replace(/\D/g, "")} để nhận cuộc gọi hỗ trợ từ kỹ thuật viên ngay nhé.`;
      }

      const response = await fetch("/api/facebook/messages/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageName: selectedPage.name,
          customerName: selectedThread.customerName,
          lastMessage: lastCustomerMsg.message,
          chatHistory: selectedThread.messages.slice(-5).map(m => ({
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
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-5 max-w-xl mx-auto shadow-sm my-10">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 animate-pulse">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-800">Messenger Inbox Chưa Sẵn Sàng</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[calc(100vh-130px)]">
      
      {/* Top Header Controls */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <MessageCircleCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base flex items-center gap-2">
              Messenger Inbox
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
            </h1>
            <p className="text-xs text-slate-500">Đồng bộ tin nhắn & chăm sóc khách hàng tự động</p>
          </div>
        </div>

        {/* Facebook Page Dropdown Switcher */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Đang xem:</span>
          <select 
            value={selectedPage?.id || ""}
            onChange={(e) => {
              const selected = pages.find(p => p.id === e.target.value);
              if (selected) setSelectedPage(selected);
            }}
            className="flex-1 sm:w-52 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 shadow-2xs"
          >
            {pages.map(page => (
              <option key={page.id} value={page.id}>
                🚩 {page.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Inbox Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Side: Threads list */}
        <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/20">
          
          {/* Threads search bar */}
          <div className="p-3 border-b border-slate-100/80">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm khách hàng, tin nhắn..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-100/70 hover:bg-slate-100 focus:bg-white text-slate-700 rounded-xl pl-9 pr-4 py-2 outline-hidden border border-transparent focus:border-slate-200 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Threads list scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50">
            {filteredThreads.length > 0 ? (
              filteredThreads.map(thread => {
                const isSelected = selectedThread?.id === thread.id;
                return (
                  <button 
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`w-full p-3 text-left transition-all hover:bg-slate-50 flex items-start gap-3 cursor-pointer relative ${
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
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${thread.isUnread ? "text-slate-900" : "text-slate-700"}`}>
                          {thread.customerName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {formatRelativeTime(thread.updatedAt)}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-1 ${thread.isUnread ? "text-slate-800 font-semibold" : "text-slate-500"}`}>
                        {thread.lastMessage}
                      </p>
                    </div>

                    {/* Unread indicator badge */}
                    {thread.isUnread && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600 shadow-xs"></span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không có cuộc hội thoại nào phù hợp.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat message detail pane */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {selectedThread ? (
            <>
              {/* Active Conversation Header */}
              <div id="msg-header" className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
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

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-semibold text-slate-400 block">Kênh kết nối</span>
                    <span className="text-[11px] font-bold text-blue-700">{selectedPage?.name}</span>
                  </div>

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
              <div className="p-4 border-t border-slate-100 bg-white">
                
                {/* AI Assistant Trigger Button Row */}
                <div className="flex items-center justify-between mb-2.5">
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
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>Cài Đặt Trợ Lý AI</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Tự động hóa kết nối và phản hồi khách hàng</p>
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

            {/* Zalo Escalation Hotline Config Card */}
            <div className="bg-white p-3.5 rounded-xl border border-blue-150 shadow-3xs space-y-3.5">
              <div className="flex items-center gap-2 text-blue-850">
                <PhoneCall className="w-4 h-4 text-blue-600 animate-pulse shrink-0" />
                <span className="text-xs font-black">Zalo Hotline Hỗ Trợ Gấp</span>
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
                  rows={3}
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
                <span>Gửi Hotline Zalo Gấp</span>
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
                  "Cửa hàng mình mở cửa đến mấy giờ ạ?",
                  "Sửa máy tính ở Mũi Né bao nhiêu tiền hả shop?",
                  "Shop ơi có card màn hình cũ GTX 1660s không?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    id={`btn-sim-q-${idx}`}
                    type="button"
                    onClick={() => simulateCustomerIncomingMessage(q)}
                    disabled={isAutoreplyThinking}
                    className="w-full text-left p-2 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 text-[11px] text-slate-600 font-medium border border-slate-200/50 hover:border-indigo-200 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed truncate"
                    title={q}
                  >
                    💬 {q}
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
    </div>
  );
}
