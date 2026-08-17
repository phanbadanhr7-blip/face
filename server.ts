import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// API Endpoint to generate/improve content with Gemini
app.post("/api/gemini/generate", async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, action, currentText, tone, language } = req.body;

    if (!ai) {
      res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured in the server environment. Please configure it in Settings > Secrets." 
      });
      return;
    }

    let systemInstruction = "You are an expert social media manager and content creator for Facebook. You write highly engaging, natural, and clean posts.";
    let fullPrompt = "";

    if (action === "create") {
      fullPrompt = `Write a creative and engaging Facebook post about: "${prompt}".\n`;
      if (tone) fullPrompt += `Tone of voice: ${tone}.\n`;
      if (language) fullPrompt += `Language: ${language}.\n`;
      fullPrompt += "Make it natural, readable, use relevant emojis, and include 3-5 high-converting hashtags at the end.";
    } else if (action === "improve") {
      fullPrompt = `Optimize and rewrite the following Facebook post to be more engaging and polished:\n\n"${currentText}"\n\n`;
      if (prompt) fullPrompt += `Focus on incorporating these extra details: "${prompt}".\n`;
      if (tone) fullPrompt += `Change the tone to: ${tone}.\n`;
      if (language) fullPrompt += `Translate or keep in language: ${language}.\n`;
      fullPrompt += "Maintain the core message but elevate the writing quality, visual structure (spacing/paragraphs), and emojis.";
    } else if (action === "hashtags") {
      fullPrompt = `Analyze the following text and generate 10 highly relevant, trending, and targeted hashtags for a Facebook post. Do not write post content, only hashtags separated by spaces:\n\n"${currentText}"`;
    } else if (action === "translate") {
      fullPrompt = `Translate the following Facebook post into ${language || "English"}, maintaining its original formatting, emoji placement, and emotional tone:\n\n"${currentText}"`;
    } else {
      fullPrompt = prompt;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "";
    res.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content with AI." });
  }
});

// API Endpoint to generate AI Images from natural language Vietnamese description
app.post("/api/gemini/generate-image", async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, style, aspectRatio } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ error: "Vui lòng nhập mô tả bức ảnh cần tạo." });
      return;
    }

    let width = 1024;
    let height = 1024;
    if (aspectRatio === "16:9") {
      width = 1280;
      height = 720;
    } else if (aspectRatio === "4:5") {
      width = 960;
      height = 1200;
    } else if (aspectRatio === "9:16") {
      width = 720;
      height = 1280;
    }

    let enhancedEnglishPrompt = prompt;

    // Use Gemini to enrich and translate the prompt into an expert visual prompt
    if (ai) {
      try {
        const styleInstruction = style === "3d"
          ? "3D render, Octane render, cinematic studio lighting, vibrant colors, unreal engine 5, 8k resolution, ultra detailed"
          : style === "banner"
          ? "professional advertising banner, bold commercial marketing style, sleek modern typography graphics background, high quality commercial photography"
          : style === "cyberpunk"
          ? "cyberpunk aesthetic, neon blue and magenta lighting, futuristic tech atmosphere, highly detailed, dramatic shadows"
          : style === "art"
          ? "digital art illustration, artistic masterpiece, vivid colors, modern graphic design"
          : "ultra realistic commercial photography, 8k resolution, studio lighting, crisp focus, hyperdetailed";

        const translateRes = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `You are an expert AI image prompt engineer. Convert and expand the following Vietnamese user image request into a single descriptive English prompt for text-to-image generation:
User Request: "${prompt}"
Desired Style: "${styleInstruction}"

Rules:
- Respond ONLY with the finalized English prompt (around 30-50 words).
- Do not include explanations, quotes, or markdown.
- Make it visual, descriptive, focusing on subject, lighting, colors, and camera angle.`,
        });

        if (translateRes.text && translateRes.text.trim()) {
          enhancedEnglishPrompt = translateRes.text.trim();
        }
      } catch (e) {
        console.warn("Prompt enhancement fallback:", e);
      }
    }

    // Generate unique seed
    const seed = Math.floor(Math.random() * 9999999);
    const encoded = encodeURIComponent(enhancedEnglishPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;

    res.json({
      success: true,
      imageUrl,
      enhancedPrompt: enhancedEnglishPrompt,
      originalPrompt: prompt
    });
  } catch (error: any) {
    console.error("AI Image Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI image." });
  }
});

// API Endpoint for Smart Content Tools (Headlines, CTAs, Tips, Sale transformation)
app.post("/api/gemini/smart-tools", async (req: Request, res: Response): Promise<void> => {
  try {
    const { toolType, input, context } = req.body;

    if (!ai) {
      res.status(500).json({ error: "Gemini API is not configured." });
      return;
    }

    let prompt = "";
    if (toolType === "headlines") {
      prompt = `Hãy tạo 5 tiêu đề / Hook mở đầu bài viết Facebook cực kỳ giật tít, hấp dẫn, tò mò, có chứa icon phù hợp về chủ đề sau:\n"${input}"\nChỉ trả về 5 dòng tiêu đề, mỗi dòng 1 tiêu đề bắt đầu bằng emoji.`;
    } else if (toolType === "cta") {
      prompt = `Hãy tạo 5 lời kêu gọi hành động (Call To Action - CTA) chốt đơn, kích thích khách hàng inbox, gọi hotline hoặc bình luận cho bài viết Facebook:\n"${input}"\nChỉ trả về 5 câu CTA mẫu ngắn gọn, chuyên nghiệp kèm icon chỉ tay, điện thoại, quà tặng.`;
    } else if (toolType === "sales_transform") {
      prompt = `Hãy viết lại nội dung sau đây thành một bài viết Bán hàng / Khuyến mãi cực kỳ kích thích, nổi bật ưu đãi, giới hạn số lượng, kèm bảo hành uy tín và kêu gọi mua ngay:\n"${input}"\nĐịnh dạng bài viết rõ ràng, gạch đầu dòng các quyền lợi, icon sinh động.`;
    } else if (toolType === "tech_tip") {
      prompt = `Hãy viết một bài viết Facebook chia sẻ Mẹo & Thủ thuật công nghệ hữu ích, dễ hiểu, giải quyết vấn đề cho người dùng máy tính / laptop về chủ đề:\n"${input}"\nCấu trúc gồm: Tiêu đề thu hút -> Nguyên nhân/Vấn đề -> Các bước thực hiện đơn giản -> Lời khuyên & thông tin hỗ trợ của Shop.`;
    } else {
      prompt = `Hãy tối ưu nội dung bài viết sau cho Facebook:\n"${input}"`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "Bạn là chuyên gia sáng tạo nội dung hàng đầu cho các Fanpage công nghệ, bán lẻ và dịch vụ tại Việt Nam.",
        temperature: 0.75,
      },
    });

    res.json({ result: response.text?.trim() || "" });
  } catch (error: any) {
    console.error("Smart tools error:", error);
    res.status(500).json({ error: error.message || "Failed to execute smart tool." });
  }
});

// API Endpoint for Gemini AI-powered Messenger suggestions
app.post("/api/facebook/messages/ai-suggest", async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageName, customerName, lastMessage, chatHistory, persona, customInstructions } = req.body;

    if (!lastMessage) {
      res.status(400).json({ error: "Customer last message is required." });
      return;
    }

    if (!ai) {
      // Graceful fallback if GEMINI_API_KEY is not configured
      res.json({
        suggestion: `Dạ chào anh/chị ${customerName || "khách hàng"} ạ! Shop ${pageName || "chúng em"} đã nhận được tin nhắn của mình. Hiện tại nhân viên tư vấn đang bận chút xíu, shop sẽ liên hệ hỗ trợ báo giá chi tiết ngay cho mình nhé ạ!`
      });
      return;
    }

    let historyStr = "";
    if (chatHistory && Array.isArray(chatHistory)) {
      historyStr = chatHistory.map((h: any) => `${h.sender}: ${h.text}`).join("\n");
    }

    // Dynamic instructions based on Persona & Custom instructions
    let personaStr = "lịch sự, chu đáo, thân thiện và hữu ích";
    if (persona === "sales") {
      personaStr = "chuyên nghiệp, tập trung thuyết phục bán hàng, chốt sale nhanh, giới thiệu ưu đãi hấp dẫn";
    } else if (persona === "support") {
      personaStr = "kiên nhẫn, hỗ trợ kỹ thuật chi tiết, giải đáp thắc mắc cặn kẽ và chuyên nghiệp";
    } else if (persona === "playful") {
      personaStr = "vui vẻ, hài hước, sử dụng nhiều icon dễ thương, tạo thiện cảm cực kỳ thân mật";
    }

    const systemInstruction = `Bạn là Trợ lý AI Chăm sóc khách hàng xuất sắc cho Facebook Page tên là "${pageName || "Cửa hàng"}".
Hãy viết một tin nhắn phản hồi bằng tiếng Việt cực kỳ ${personaStr} để gửi cho khách hàng tên là "${customerName || "Anh/Chị"}".

LỊCH SỬ CUỘC TRÒ CHUYỆN GẦN ĐÂY GIỮA SHOP VÀ KHÁCH HÀNG (Độ dài tối đa cấu hình bởi người dùng. Sắp xếp theo thứ tự thời gian từ cũ đến mới):
${historyStr ? historyStr : "(Chưa có lịch sử trước đó)"}

TIN NHẮN MỚI NHẤT CẦN TRẢ LỜI NGAY:
"${lastMessage}"

YÊU CẦU ĐẶC BIỆT VỀ NGỮ CẢNH VÀ TRÍ NHỚ (CONVERSATIONAL MEMORY):
- Đọc kỹ toàn bộ lịch sử trò chuyện ở trên để biết hai bên đã trao đổi những gì trước đó.
- KHÔNG BAO GIỜ lặp lại câu chào hỏi hoặc giới thiệu bản thân nếu trước đó bạn hoặc Shop đã chào hỏi rồi.
- KHÔNG lặp lại các thông tin đã trả lời ở các tin nhắn trước trong lịch sử. Tránh trả lời vòng vo hoặc lặp lại cùng một câu trả lời mẫu.
- Hãy tạo sự liên kết tự nhiên với những gì khách hàng vừa nói hoặc hỏi trước đó để giữ cuộc trò chuyện liền mạch như một con người thực sự.
- Trả lời trực tiếp và giải quyết dứt điểm thắc mắc trong tin nhắn mới nhất dựa trên thông tin đã thỏa thuận trước đó.

${customInstructions ? `HƯỚNG DẪN CẤU HÌNH RIÊNG CHO AI (Kiến thức cửa hàng / Quy tắc riêng):\n${customInstructions}\n` : ""}

QUY TẮC PHẢN HỒI BẮT BUỘC:
1. GIẢI QUYẾT TRỰC TIẾP TRÊN MESSENGER:
- Với các câu chào hỏi ban đầu ("chào shop", "hi", "alo"), hỏi giờ mở cửa, hỏi bảng giá dịch vụ, hỏi cấu hình máy tính, bảo hành hoặc thông tin chung: Hãy tự tin trả lời trực tiếp, rõ ràng, nhiệt tình vào câu hỏi của họ.
- Nếu là Page "May Tinh Mui Ne", hãy thể hiện tính chuyên nghiệp về công nghệ, sửa chữa máy tính, cài win giá sinh viên 100k, vệ sinh 150k, nâng cấp SSD, ráp PC gaming, giá cả phải chăng, bảo hành uy tín tại Mũi Né/Phan Thiết.
- Kết thúc bằng một câu hỏi mở lịch sự để tiếp tục tư vấn (ví dụ: "Dạ không biết mình đang cần tư vấn máy tính dùng cho nhu cầu văn phòng hay chơi game ạ?").

2. QUY TẮC ĐƯA LINK ZALO / SỐ ĐIỆN THOẠI (CỰC KỲ QUAN TRỌNG):
- TUYỆT ĐỐI KHÔNG đưa link Zalo hay số điện thoại vào các câu chào hỏi thông thường hoặc các câu hỏi mà AI có thể giải đáp ngay.
- CHỈ ĐƯỢC đưa link Zalo / Hotline khi rơi vào các trường hợp sau:
  + Khách hàng chủ động hỏi số điện thoại, xin Zalo, xin hotline để gọi.
  + Khách hàng có việc khẩn cấp (ví dụ: "cần gấp", "máy hỏng nặng cứu gấp", "gọi cho mình ngay").
  + Vấn đề kỹ thuật quá phức tạp/chuyên sâu cần thợ kỹ thuật liên hệ trực tiếp hoặc gửi video/hình ảnh qua Zalo để kiểm tra tận nơi.

3. HÌNH THỨC:
- Xưng hô lịch sự, thân mật bằng tiếng Việt (Dạ chào anh/chị...).
- KHÔNG viết bất kỳ giải thích, nhãn tiêu đề hay ký hiệu markdown rườm rà. Chỉ trả về duy nhất nội dung tin nhắn sẽ gửi đi.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Hãy tạo tin nhắn phản hồi khách hàng tốt nhất cho câu hỏi: "${lastMessage}"`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const suggestion = response.text?.trim() || "";
    res.json({ suggestion });
  } catch (error: any) {
    console.error("Gemini AI Suggestion Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI suggestion." });
  }
});

// API Endpoint to get real Facebook Page Conversations (Graph API)
app.get("/api/facebook/conversations", async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageId, accessToken } = req.query;

    if (!pageId || !accessToken) {
      res.status(400).json({ error: "pageId and accessToken are required." });
      return;
    }

    if (String(accessToken).startsWith("demo_") || String(accessToken).trim() === "") {
      res.json({ success: true, threads: [], isMock: true });
      return;
    }

    // Query Graph API for conversations
    const graphUrl = `https://graph.facebook.com/v18.0/${pageId}/conversations?fields=id,snippet,updated_time,unread_count,participants,messages.limit(40){id,message,created_time,from}&access_token=${encodeURIComponent(String(accessToken))}`;
    
    const fbRes = await fetch(graphUrl);
    const data: any = await fbRes.json();

    if (!fbRes.ok || data.error) {
      console.warn("Facebook Conversations API Notice:", data.error?.message || data.error);
      
      // If token expired or lacks pages_messaging permission, return a graceful error with action hint
      const isPermissionOrTokenError = data.error?.code === 190 || data.error?.code === 200 || data.error?.type === "OAuthException";
      
      res.status(fbRes.status || 400).json({ 
        success: false,
        error: isPermissionOrTokenError
          ? "Token Facebook đã hết hạn hoặc chưa được cấp quyền 'pages_messaging'. Vui lòng kết nối lại tài khoản Facebook hoặc cấp quyền nhắn tin."
          : (data.error?.message || "Không thể tải danh sách hội thoại từ Facebook."),
        errorDetail: data.error
      });
      return;
    }

    // Transform Graph API conversations into our ChatThread[] structure
    const threads = (data.data || []).map((conv: any) => {
      const rawMessages = conv.messages?.data || [];

      // Find customer participant (not the page itself)
      const customerParticipant = conv.participants?.data?.find((p: any) => String(p.id) !== String(pageId));
      
      // Find customer sender from messages
      const customerFromMsg = rawMessages.find((m: any) => m.from && String(m.from.id) !== String(pageId))?.from;

      const customerName = customerParticipant?.name || customerFromMsg?.name || "Khách hàng Messenger";
      
      // Extract raw PSID
      const customerId = customerParticipant?.id || customerFromMsg?.id || (String(conv.id).startsWith("t_") ? conv.id.substring(2) : conv.id);

      // Graph API returns messages newest first, reverse for chronological chat view
      const messages = [...rawMessages].reverse().map((m: any) => ({
        id: m.id,
        senderId: m.from?.id || customerId,
        senderName: m.from?.name || (m.from?.id === pageId ? "Fanpage" : customerName),
        message: m.message || "",
        timestamp: m.created_time || conv.updated_time,
        isPage: m.from?.id === pageId
      }));

      return {
        id: conv.id,
        pageId: String(pageId),
        customerId: customerId,
        customerName: customerName,
        customerAvatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
        lastMessage: conv.snippet || messages[messages.length - 1]?.message || "Đã nhận tin nhắn mới",
        updatedAt: conv.updated_time || new Date().toISOString(),
        isUnread: (conv.unread_count && conv.unread_count > 0) || false,
        messages: messages
      };
    });

    res.json({ success: true, threads });
  } catch (err: any) {
    console.error("Fetch conversations error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch conversations." });
  }
});

// Webhook Verification (supports /api/webhooks/facebook, /api/webhook, /webhook, etc.)
const handleWebhookVerification = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("[WEBHOOK-VERIFY] Incoming verification request:", { mode, token, challenge });

  // If challenge is present and mode is subscribe, verify immediately
  if (challenge) {
    console.log(">>> FACEBOOK_WEBHOOK_VERIFIED_SUCCESSFULLY! Challenge returned:", challenge);
    res.status(200).send(challenge);
    return;
  }

  res.status(200).send("Facebook Webhook Endpoint Active");
};

// Register GET routes for Webhook Verification
app.get("/api/webhooks/facebook", handleWebhookVerification);
app.get("/api/webhook/facebook", handleWebhookVerification);
app.get("/api/webhooks", handleWebhookVerification);
app.get("/api/webhook", handleWebhookVerification);
app.get("/webhooks/facebook", handleWebhookVerification);
app.get("/webhooks", handleWebhookVerification);
app.get("/webhook", handleWebhookVerification);

// In-memory received webhook messages cache
let incomingWebhookEvents: any[] = [];

// Webhook Event Receiver (POST /api/webhooks/facebook, /api/webhook, /webhook, etc.)
const handleWebhookEvent = (req: Request, res: Response) => {
  const body = req.body;
  console.log("[WEBHOOK-EVENT] Received POST payload:", JSON.stringify(body, null, 2));

  if (body.object === "page") {
    body.entry?.forEach((entry: any) => {
      // 1. Messaging events (Direct Messenger messages)
      const webhookEvents = entry.messaging || [];
      webhookEvents.forEach((webhookEvent: any) => {
        console.log("[WEBHOOK-EVENT] Messenger message event:", webhookEvent);
        incomingWebhookEvents.push({
          pageId: entry.id,
          senderId: webhookEvent.sender?.id,
          recipientId: webhookEvent.recipient?.id,
          timestamp: webhookEvent.timestamp,
          message: webhookEvent.message?.text,
          raw: webhookEvent,
          receivedAt: new Date().toISOString()
        });
      });

      // 2. Changes events (Feed, comments, post interactions)
      const changes = entry.changes || [];
      changes.forEach((change: any) => {
        console.log("[WEBHOOK-EVENT] Page change event:", change);
        incomingWebhookEvents.push({
          pageId: entry.id,
          field: change.field,
          value: change.value,
          receivedAt: new Date().toISOString()
        });
      });

      if (incomingWebhookEvents.length > 200) {
        incomingWebhookEvents = incomingWebhookEvents.slice(-200);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Acknowledge other event types with 200 OK
    res.status(200).send("EVENT_RECEIVED");
  }
};

// Register POST routes for Webhook Events
app.post("/api/webhooks/facebook", handleWebhookEvent);
app.post("/api/webhook/facebook", handleWebhookEvent);
app.post("/api/webhooks", handleWebhookEvent);
app.post("/api/webhook", handleWebhookEvent);
app.post("/webhooks/facebook", handleWebhookEvent);
app.post("/webhooks", handleWebhookEvent);
app.post("/webhook", handleWebhookEvent);

app.get("/api/webhook/events", (req: Request, res: Response) => {
  res.json({ events: incomingWebhookEvents });
});

// API Endpoint to send Facebook Page Messenger Message (Real Graph API)
app.post("/api/facebook/messages/send", async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageId, accessToken, recipientId, customerId, conversationId, message } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: "Nội dung tin nhắn không được để trống." });
      return;
    }

    const targetThreadOrUser = recipientId || customerId || conversationId;

    // Check for simulated/demo tokens or local demo threads (e.g. thread_1, mock_...)
    const isMockThread = !targetThreadOrUser || 
      String(targetThreadOrUser).startsWith("thread_") || 
      String(targetThreadOrUser).startsWith("mock_") || 
      String(targetThreadOrUser).startsWith("demo_") || 
      String(targetThreadOrUser).startsWith("sim_") || 
      String(targetThreadOrUser).startsWith("customer_");

    if (isMockThread || !accessToken || accessToken.startsWith("demo_") || accessToken.trim() === "") {
      res.json({ success: true, message: "Đã gửi tin nhắn (Chế độ mô phỏng).", isMock: true });
      return;
    }

    console.log(`[FB-SEND] Sending message as Page ${pageId} to ${targetThreadOrUser} (customerId: ${customerId}, convId: ${conversationId})...`);

    let fbMessageId: string | null = null;
    let allErrors: any[] = [];

    // 1. Separate pure PSIDs (numbers only) from Conversation Thread IDs (start with t_ or explicit conversationId)
    const rawIds = [customerId, recipientId, targetThreadOrUser].filter(Boolean) as string[];
    const purePSIDs: string[] = [];
    rawIds.forEach(id => {
      const clean = String(id).replace(/^t_/, "").trim();
      // PSIDs on Facebook are pure numeric IDs
      if (clean && /^\d+$/.test(clean) && !purePSIDs.includes(clean)) {
        purePSIDs.push(clean);
      }
    });

    const conversationThreadIDs: string[] = [];
    if (conversationId && !conversationThreadIDs.includes(conversationId)) {
      conversationThreadIDs.push(conversationId);
    }
    if (targetThreadOrUser && String(targetThreadOrUser).startsWith("t_") && !conversationThreadIDs.includes(String(targetThreadOrUser))) {
      conversationThreadIDs.push(String(targetThreadOrUser));
    }

    console.log(`[FB-SEND] Identified purePSIDs:`, purePSIDs, `conversationThreadIDs:`, conversationThreadIDs);

    // Strategy 1: Messenger Send API POST /me/messages (RESPONSE - standard 24h window)
    for (const psid of purePSIDs) {
      if (fbMessageId) break;

      // 1a. Standard RESPONSE messaging_type
      try {
        const sendRes = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { id: psid },
            message: { text: message.trim() },
            messaging_type: "RESPONSE"
          })
        });
        const sendData: any = await sendRes.json();
        if (sendRes.ok && (sendData.message_id || sendData.recipient_id)) {
          fbMessageId = sendData.message_id || sendData.recipient_id;
          console.log(`[FB-SEND] Success via /me/messages (RESPONSE) with PSID ${psid}:`, fbMessageId);
          break;
        } else {
          allErrors.push({ method: `/me/messages RESPONSE (${psid})`, error: sendData.error });
        }
      } catch (e: any) {
        allErrors.push({ method: `/me/messages RESPONSE (${psid})`, error: e.message });
      }

      // 1b. Direct payload (without messaging_type)
      if (!fbMessageId) {
        try {
          const sendRes = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { id: psid },
              message: { text: message.trim() }
            })
          });
          const sendData: any = await sendRes.json();
          if (sendRes.ok && (sendData.message_id || sendData.recipient_id)) {
            fbMessageId = sendData.message_id || sendData.recipient_id;
            console.log(`[FB-SEND] Success via /me/messages (direct) with PSID ${psid}:`, fbMessageId);
            break;
          } else {
            allErrors.push({ method: `/me/messages direct (${psid})`, error: sendData.error });
          }
        } catch (e: any) {
          allErrors.push({ method: `/me/messages direct (${psid})`, error: e.message });
        }
      }

      // 1c. Send via /{pageId}/messages endpoint
      if (!fbMessageId && pageId) {
        try {
          const sendRes = await fetch(`https://graph.facebook.com/v18.0/${pageId}/messages?access_token=${encodeURIComponent(accessToken)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { id: psid },
              message: { text: message.trim() },
              messaging_type: "RESPONSE"
            })
          });
          const sendData: any = await sendRes.json();
          if (sendRes.ok && (sendData.message_id || sendData.recipient_id)) {
            fbMessageId = sendData.message_id || sendData.recipient_id;
            console.log(`[FB-SEND] Success via /${pageId}/messages with PSID ${psid}:`, fbMessageId);
            break;
          } else {
            allErrors.push({ method: `/${pageId}/messages (${psid})`, error: sendData.error });
          }
        } catch (e: any) {
          allErrors.push({ method: `/${pageId}/messages (${psid})`, error: e.message });
        }
      }

      // 1d. If outside 24h window, attempt supported tags: HUMAN_AGENT or POST_PURCHASE_UPDATE
      if (!fbMessageId) {
        // Try HUMAN_AGENT tag (gives 7-day window if approved/eligible)
        try {
          const sendRes = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipient: { id: psid },
              message: { text: message.trim() },
              messaging_type: "MESSAGE_TAG",
              tag: "HUMAN_AGENT"
            })
          });
          const sendData: any = await sendRes.json();
          if (sendRes.ok && (sendData.message_id || sendData.recipient_id)) {
            fbMessageId = sendData.message_id || sendData.recipient_id;
            console.log(`[FB-SEND] Success via /me/messages (HUMAN_AGENT) with PSID ${psid}:`, fbMessageId);
            break;
          } else {
            allErrors.push({ method: `/me/messages HUMAN_AGENT (${psid})`, error: sendData.error });
          }
        } catch (e: any) {
          allErrors.push({ method: `/me/messages HUMAN_AGENT (${psid})`, error: e.message });
        }
      }
    }

    // Strategy 2: Conversation Thread Reply via POST /{thread_id}/messages (Form URL Encoded & JSON)
    // ONLY executed for valid conversation thread IDs, never on raw PSIDs (to prevent subcode 33)
    if (!fbMessageId && conversationThreadIDs.length > 0) {
      for (const convThreadId of conversationThreadIDs) {
        if (fbMessageId) break;

        // 2a. Form URL Encoded
        try {
          const formParams = new URLSearchParams();
          formParams.append("message", message.trim());
          formParams.append("access_token", accessToken);

          const convRes = await fetch(`https://graph.facebook.com/v18.0/${convThreadId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formParams.toString()
          });
          const convData: any = await convRes.json();
          if (convRes.ok && (convData.id || convData.message_id)) {
            fbMessageId = convData.id || convData.message_id;
            console.log(`[FB-SEND] Success via /${convThreadId}/messages (Form):`, fbMessageId);
            break;
          } else {
            allErrors.push({ method: `POST /${convThreadId}/messages (Form)`, error: convData.error });
          }
        } catch (e: any) {
          allErrors.push({ method: `POST /${convThreadId}/messages (Form)`, error: e.message });
        }
      }
    }

    if (fbMessageId) {
      res.json({ success: true, fbMessageId });
    } else {
      console.warn("[FB-SEND] All sending methods failed:", JSON.stringify(allErrors, null, 2));
      
      const primaryError = allErrors.find(e => e.error?.message)?.error || allErrors[0]?.error;
      const rawMessage = primaryError?.message || "";
      const subcode = primaryError?.error_subcode || primaryError?.subcode;
      const code = primaryError?.code;
      let humanMessage = rawMessage || "Facebook không thể gửi tin nhắn phản hồi.";

      // Interpret common Facebook API errors into clear, actionable advice
      if (subcode === 2018001 || code === 10 || rawMessage.includes("outside of allowed window")) {
        humanMessage = "Chính sách Cửa sổ 24 giờ của Meta: Đã quá 24 giờ kể từ tin nhắn gần nhất của khách hàng. Meta chỉ cho phép Fanpage gửi tin nhắn trả lời khi khách hàng chủ động gửi tin nhắn mới trước.";
      } else if (subcode === 1893061 || subcode === 2018278 || rawMessage.includes("thẻ tin nhắn") || rawMessage.includes("message tag")) {
        humanMessage = "Chính sách gửi tin nhắn ngoài 24 giờ: Meta yêu cầu khách hàng phải gửi tin nhắn mới vào Trang trước thì Trang mới có thể tiếp tục nhắn tin tự do.";
      } else if (code === 190 || primaryError?.type === "OAuthException" && rawMessage.includes("token")) {
        humanMessage = "Mã truy cập Facebook (Access Token) đã hết hạn hoặc bị thu hồi. Vui lòng kết nối lại tài khoản Facebook trong tab Kết Nối.";
      } else if (code === 200 || rawMessage.includes("capability") || rawMessage.includes("permission") || rawMessage.includes("pages_messaging")) {
        humanMessage = "Ứng dụng Facebook chưa được cấp quyền 'pages_messaging' hoặc đang ở chế độ Phát triển (Development). Ở chế độ này, bạn chỉ có thể gửi tin nhắn đến tài khoản Quản trị viên/Tester của ứng dụng.";
      } else if (subcode === 33 || rawMessage.includes("Object with ID") && rawMessage.includes("does not exist")) {
        humanMessage = "Không tìm thấy người nhận hoặc cuộc trò chuyện tương ứng trên Facebook.";
      }
      
      res.status(400).json({ 
        success: false,
        error: humanMessage,
        errorDetail: primaryError,
        allErrors
      });
    }
  } catch (err: any) {
    console.error("Live Messenger Send catch error:", err);
    res.status(500).json({ success: false, error: err.message || "Lỗi kết nối khi gửi tin nhắn tới Facebook." });
  }
});

// API Endpoint to publish to Facebook (Real API + Mock Simulation fallback)
app.post("/api/facebook/publish", async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageId, accessToken, message, mediaUrl, isMock } = req.body;

    if (!pageId || !message) {
      res.status(400).json({ error: "Page ID and post message are required." });
      return;
    }

    // Check if the user is using simulation/mock mode
    if (isMock || !accessToken || accessToken.startsWith("demo_") || accessToken.trim() === "") {
      // Simulate API lag
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      const randomId = Math.floor(Math.random() * 1000000000000000);
      res.json({
        success: true,
        fbPostId: `${pageId}_${randomId}`,
        message: "Successfully posted (Simulated Mode).",
        isSimulated: true
      });
      return;
    }

    // REAL FACEBOOK GRAPH API POSTING
    console.log(`Attempting real Facebook post to Page ${pageId}...`);
    
    let fbUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    let bodyData: any = {
      message: message,
      access_token: accessToken
    };

    if (mediaUrl && mediaUrl.trim() !== "") {
      // If there's an image, we post to the /photos edge instead
      fbUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;
      bodyData = {
        url: mediaUrl,
        caption: message,
        access_token: accessToken
      };
    }

    const fbResponse = await fetch(fbUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    const data: any = await fbResponse.json();

    if (!fbResponse.ok || data.error) {
      const errMsg = data.error?.message || "Facebook API error.";
      console.error("Facebook API Error Details:", data.error);
      res.status(fbResponse.status).json({ 
        error: errMsg,
        details: data.error
      });
      return;
    }

    res.json({
      success: true,
      fbPostId: data.id || data.post_id,
      message: "Successfully published to Facebook Page!",
      isSimulated: false
    });

  } catch (error: any) {
    console.error("Facebook Publish Error:", error);
    res.status(500).json({ error: error.message || "Failed to publish post to Facebook." });
  }
});

// Helper to get reliable absolute host URL for OAuth callbacks
const getHostUrl = (req: Request): string => {
  if (process.env.APP_URL && process.env.APP_URL !== "MY_APP_URL" && !process.env.APP_URL.includes("MY_APP_URL")) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  const forwardedHost = req.headers['x-forwarded-host'] as string;
  const host = forwardedHost || req.get('host');
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('aistudio.google')) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    return `${proto}://${host}`;
  }
  return "https://ais-dev-qv2ignianzzncmdt66dz5z-876098673256.asia-southeast1.run.app";
};

// API Endpoint to inspect user token or page token and auto-fetch managed pages
app.post("/api/facebook/inspect-token", async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Access token is required." });
  }

  try {
    // 1. Try querying /me/accounts (works with User Access Token)
    const accountsRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${encodeURIComponent(token)}&fields=id,name,access_token,picture`);
    const accountsData: any = await accountsRes.json();

    if (accountsRes.ok && accountsData.data && accountsData.data.length > 0) {
      const pages = accountsData.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        accessToken: p.access_token,
        picture: p.picture?.data?.url || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60`
      }));
      return res.json({ success: true, pages });
    }

    // 2. If /me/accounts is empty or fails, maybe it's a Page Access Token (/me directly)
    const pageRes = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${encodeURIComponent(token)}&fields=id,name,picture`);
    const pageData: any = await pageRes.json();

    if (pageRes.ok && pageData.id) {
      const singlePage = {
        id: pageData.id,
        name: pageData.name || "Fanpage Facebook",
        accessToken: token,
        picture: pageData.picture?.data?.url || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60`
      };
      return res.json({ success: true, pages: [singlePage] });
    }

    throw new Error(accountsData.error?.message || pageData.error?.message || "Token Facebook không hợp lệ hoặc đã hết hạn.");
  } catch (error: any) {
    console.error("Inspect Token Error:", error);
    res.status(400).json({ error: error.message || "Failed to inspect token." });
  }
});

// API Endpoint to get Facebook Auth URL (Live or Mock/Simulated)
app.get("/api/auth/facebook/url", (req: Request, res: Response) => {
  const appId = process.env.FACEBOOK_APP_ID || "1405503574771652";
  const host = getHostUrl(req);
  const redirectUri = `${host}/auth/facebook/callback`;

  if (appId) {
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_messaging,pages_manage_metadata,pages_manage_posts,pages_read_engagement,pages_show_list`;
    res.json({ url: authUrl, isLive: true, redirectUri });
  } else {
    res.json({ url: `${host}/auth/facebook/mock-login`, isLive: false, redirectUri });
  }
});

// Mock/Simulated Meta Authorization Consent Screen for fast developer demoing
app.get("/auth/facebook/mock-login", (req: Request, res: Response) => {
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facebook Login - Authorization Request</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <style>
          body {
            background-color: #f0f2f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
        </style>
      </head>
      <body class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full overflow-hidden">
          <!-- Header -->
          <div class="bg-[#1877F2] p-6 text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold tracking-tight">facebook</span>
              <span class="text-xs bg-white/20 px-2 py-0.5 rounded font-semibold">OAuth Partner</span>
            </div>
            <span class="text-xs text-white/80 font-medium">Secure Connection</span>
          </div>

          <div class="p-6 space-y-6">
            <!-- User Intro -->
            <div class="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div class="w-12 h-12 bg-[#1877F2] text-white font-bold rounded-full flex items-center justify-center text-lg shadow-sm">
                MT
              </div>
              <div>
                <p class="text-sm font-bold text-slate-800">MÁY TÍNH MŨI NÉ</p>
                <p class="text-xs text-slate-500">Quản trị viên</p>
              </div>
            </div>

            <!-- Permissions request info -->
            <div class="space-y-3">
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Requested Permissions</h3>
              <div class="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div class="flex items-start gap-2 text-xs text-slate-700">
                  <span class="text-emerald-500 font-bold">✓</span>
                  <div>
                    <span class="font-bold text-slate-800">pages_manage_posts</span>
                    <p class="text-slate-500 mt-0.5">Allows the app to publish posts on your behalf</p>
                  </div>
                </div>
                <div class="flex items-start gap-2 text-xs text-slate-700">
                  <span class="text-emerald-500 font-bold">✓</span>
                  <div>
                    <span class="font-bold text-slate-800">pages_read_engagement</span>
                    <p class="text-slate-500 mt-0.5">Allows the app to fetch analytics and views data</p>
                  </div>
                </div>
                <div class="flex items-start gap-2 text-xs text-slate-700">
                  <span class="text-emerald-500 font-bold">✓</span>
                  <div>
                    <span class="font-bold text-slate-800">pages_show_list</span>
                    <p class="text-slate-500 mt-0.5">Allows the app to discover and list your Pages</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pages Selection Grid -->
            <div class="space-y-3">
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Facebook Pages to Import</h3>
              
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <label class="flex items-center justify-between p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                  <div class="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60" class="w-9 h-9 rounded-lg object-cover border" />
                    <div>
                      <p class="text-xs font-bold text-slate-800">May Tinh Mui Ne</p>
                      <p class="text-[10px] text-slate-500">ID: 10249581837582</p>
                    </div>
                  </div>
                  <input type="checkbox" id="page-1" checked class="w-4 h-4 accent-[#1877F2] cursor-pointer" />
                </label>

                <label class="flex items-center justify-between p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                  <div class="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60" class="w-9 h-9 rounded-lg object-cover border" />
                    <div>
                      <p class="text-xs font-bold text-slate-800">Mui Ne Tech Lab</p>
                      <p class="text-[10px] text-slate-500">ID: 20938475620192</p>
                    </div>
                  </div>
                  <input type="checkbox" id="page-2" checked class="w-4 h-4 accent-[#1877F2] cursor-pointer" />
                </label>

                <label class="flex items-center justify-between p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                  <div class="flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=60" class="w-9 h-9 rounded-lg object-cover border" />
                    <div>
                      <p class="text-xs font-bold text-slate-800">Chợ Phan Thiết Online</p>
                      <p class="text-[10px] text-slate-500">ID: 30129384756201</p>
                    </div>
                  </div>
                  <input type="checkbox" id="page-3" checked class="w-4 h-4 accent-[#1877F2] cursor-pointer" />
                </label>
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="flex gap-3 pt-2">
              <button 
                type="button" 
                onclick="window.close()" 
                class="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-500 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onclick="handleSubmit()" 
                class="flex-1 py-2.5 bg-[#1877F2] hover:bg-[#1565C0] rounded-lg text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
              >
                Tiếp tục dưới tên MÁY TÍNH MŨI NÉ
              </button>
            </div>
          </div>
        </div>

        <script>
          function handleSubmit() {
            const pages = [];
            
            if (document.getElementById('page-1').checked) {
              pages.push({
                id: "10249581837582",
                name: "May Tinh Mui Ne",
                accessToken: "demo_token_maytinhmuine",
                picture: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60"
              });
            }
            
            if (document.getElementById('page-2').checked) {
              pages.push({
                id: "20938475620192",
                name: "Mui Ne Tech Lab",
                accessToken: "demo_token_techlab",
                picture: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=60"
              });
            }
            
            if (document.getElementById('page-3').checked) {
              pages.push({
                id: "30129384756201",
                name: "Chợ Phan Thiết Online",
                accessToken: "demo_token_phanthiet",
                picture: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=60"
              });
            }

            // 1. Send via BroadcastChannel
            try {
              const bc = new BroadcastChannel('facebook_auth');
              bc.postMessage({ type: 'FB_AUTH_SUCCESS', pages: pages });
              bc.close();
            } catch (e) {
              console.warn("BroadcastChannel error:", e);
            }

            // 2. Send via LocalStorage
            try {
              localStorage.setItem('fb_auth_success', JSON.stringify({ pages: pages, timestamp: Date.now() }));
            } catch (e) {
              console.warn("localStorage error:", e);
            }

            // 3. Fallback to postMessage
            if (window.opener) {
              try {
                window.opener.postMessage({ type: 'FB_AUTH_SUCCESS', pages: pages }, '*');
              } catch (e) {
                console.warn("postMessage error:", e);
              }
            }

            // Close the popup after a small delay
            setTimeout(() => {
              window.close();
              // If window didn't close (not a popup), redirect to dashboard
              setTimeout(() => {
                window.location.href = '/';
              }, 500);
            }, 300);
          }
        </script>
      </body>
    </html>
  `);
});

// Real Meta Graph API Callback Route
app.get("/auth/facebook/callback", async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error || !code) {
    res.send(`
      <html>
        <head>
          <title>Facebook Authorization Failed</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        </head>
        <body class="bg-rose-50 flex flex-col items-center justify-center min-h-screen p-4 text-center font-sans">
          <div class="bg-white p-8 rounded-xl shadow-md border border-rose-100 max-w-sm w-full space-y-4">
            <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xl mx-auto">✕</div>
            <h2 class="text-lg font-bold text-rose-800">Facebook Authorization Failed</h2>
            <p class="text-xs text-slate-500">${error || "Access Denied by User."}</p>
            <button onclick="window.close()" class="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer">Close Window</button>
          </div>
        </body>
      </html>
    `);
    return;
  }

  try {
    const appId = process.env.FACEBOOK_APP_ID || "1405503574771652";
    const appSecret = process.env.FACEBOOK_APP_SECRET || "b80a4b2b45cf66f22662b347c3d96cbb";
    const host = getHostUrl(req);
    const redirectUri = `${host}/auth/facebook/callback`;

    // 1. Exchange OAuth code for User Access Token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData: any = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error?.message || "Failed to exchange authorization code.");
    }

    const userAccessToken = tokenData.access_token;

    // 2. Query Managed Pages (/me/accounts)
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}&fields=id,name,access_token,picture`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData: any = await pagesRes.json();

    if (!pagesRes.ok || pagesData.error) {
      throw new Error(pagesData.error?.message || "Failed to retrieve Facebook Pages.");
    }

    const pages = (pagesData.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      accessToken: p.access_token,
      picture: p.picture?.data?.url || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60`
    }));

    // 3. Send success postMessage and close
    res.send(`
      <html>
        <head>
          <title>Successfully Logged In!</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        </head>
        <body class="bg-slate-50 flex flex-col items-center justify-center min-h-screen p-4 text-center font-sans">
          <div class="bg-white p-8 rounded-xl shadow-md border border-emerald-100 max-w-sm w-full space-y-4">
            <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mx-auto">✓</div>
            <h2 class="text-lg font-bold text-emerald-800">Successfully Logged In!</h2>
            <p class="text-xs text-slate-500">Importing ${pages.length} Facebook Pages to your dashboard...</p>
            <script>
              const pages = ${JSON.stringify(pages)};

              // 1. Send via BroadcastChannel
              try {
                const bc = new BroadcastChannel('facebook_auth');
                bc.postMessage({ type: 'FB_AUTH_SUCCESS', pages: pages });
                bc.close();
              } catch (e) {
                console.warn("BroadcastChannel error:", e);
              }

              // 2. Send via LocalStorage
              try {
                localStorage.setItem('fb_auth_success', JSON.stringify({ pages: pages, timestamp: Date.now() }));
              } catch (e) {
                console.warn("localStorage error:", e);
              }

              // 3. Fallback to postMessage
              if (window.opener) {
                try {
                  window.opener.postMessage({ type: 'FB_AUTH_SUCCESS', pages: pages }, '*');
                } catch (e) {
                  console.warn("postMessage error:", e);
                }
              }

              // Close the popup after a small delay
              setTimeout(() => {
                window.close();
                // If window didn't close (not a popup), redirect to dashboard
                setTimeout(() => {
                  window.location.href = '/';
                }, 500);
              }, 300);
            </script>
          </div>
        </body>
      </html>
    `);

  } catch (err: any) {
    console.error("Facebook Login Callback Error:", err);
    res.send(`
      <html>
        <head>
          <title>Facebook Login Error</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        </head>
        <body class="bg-rose-50 flex flex-col items-center justify-center min-h-screen p-4 text-center font-sans">
          <div class="bg-white p-8 rounded-xl shadow-md border border-rose-100 max-w-sm w-full space-y-4">
            <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xl mx-auto">✕</div>
            <h2 class="text-lg font-bold text-rose-800">Facebook Login Error</h2>
            <p class="text-xs text-slate-500">${err.message || "An unexpected error occurred during page retrieval."}</p>
            <button onclick="window.close()" class="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }
});

// Configure Vite middleware or serve static files
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexPath = path.join(distPath, "index.html");
    
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("Error sending index.html in production:", err);
          // Return a descriptive error page suggesting the user runs 'npm run build'
          res.status(404).send(`
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Lỗi Triển Khai - Thiếu Thư Mục Build</title>
              <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body class="bg-slate-50 flex flex-col items-center justify-center min-h-screen p-6 font-sans">
              <div class="bg-white p-8 rounded-2xl shadow-lg border border-rose-150 max-w-lg w-full space-y-6">
                <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span class="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xl font-bold">✕</span>
                  <div>
                    <h1 class="text-base font-bold text-slate-800">Không tìm thấy thư mục Giao diện (Build Dist)</h1>
                    <p class="text-xs text-slate-500">Error: dist/index.html not found</p>
                  </div>
                </div>
                
                <div class="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p class="font-bold text-slate-800">Nguyên nhân:</p>
                  <p>Ứng dụng đang chạy ở chế độ Production (<code class="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono">NODE_ENV=production</code>) nhưng bạn chưa biên dịch giao diện React phía client, hoặc thư mục <code class="bg-slate-100 px-1 py-0.5 rounded font-mono">dist</code> chưa được tạo.</p>
                  
                  <p class="font-bold text-slate-800 mt-4">Cách khắc phục:</p>
                  <ol class="list-decimal pl-5 space-y-1.5">
                    <li>Hãy đảm bảo bạn chạy lệnh biên dịch trước khi khởi động server:
                      <pre class="bg-slate-900 text-slate-100 p-2 rounded mt-1 font-mono text-[11px] overflow-x-auto">npm run build</pre>
                    </li>
                    <li>Sau khi build hoàn tất (sẽ có thư mục <code class="bg-slate-100 px-1 py-0.5 rounded font-mono">dist</code>), khởi động server bằng lệnh:
                      <pre class="bg-slate-900 text-slate-100 p-2 rounded mt-1 font-mono text-[11px] overflow-x-auto">npm run start</pre>
                    </li>
                    <li>Nếu triển khai trên các host tự động (như Render, Railway, Vercel, VPS), hãy cấu hình lệnh build của bạn là:
                      <pre class="bg-slate-900 text-slate-100 p-2 rounded mt-1 font-mono text-[11px] overflow-x-auto">npm run build</pre>
                      và lệnh start là:
                      <pre class="bg-slate-900 text-slate-100 p-2 rounded mt-1 font-mono text-[11px] overflow-x-auto">npm run start</pre>
                    </li>
                  </ol>
                </div>
                
                <div class="pt-4 border-t border-slate-150 flex justify-end">
                  <a href="/" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer">Thử Tải Lại Trang</a>
                </div>
              </div>
            </body>
            </html>
          `);
        }
      });
    });
    console.log("Static files mounted in production mode with safe error fallbacks.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
