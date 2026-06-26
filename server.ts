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
      model: "gemini-3.5-flash",
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
Dựa vào tin nhắn cuối cùng của khách hàng: "${lastMessage}".
Và lịch sử cuộc trò chuyện gần đây (nếu có):
${historyStr}

${customInstructions ? `HƯỚNG DẪN CẤU HÌNH RIÊNG CHO AI:\n${customInstructions}\n` : ""}

Yêu cầu phản hồi:
- Hãy xưng hô lịch sự, thân mật bằng tiếng Việt (ví dụ: Dạ chào anh/chị ${customerName || "ạ"}, Dạ chào anh ${customerName}... ).
- Trả lời trực tiếp, rõ ràng, nhiệt tình vào câu hỏi của họ.
- Nếu là Page "May Tinh Mui Ne", hãy thể hiện tính chuyên nghiệp về công nghệ, sửa chữa máy tính, cài win giá sinh viên, nâng cấp SSD, ráp PC gaming, giá cả phải chăng, bảo hành uy tín tại Mũi Né/Phan Thiết.
- Luôn kết thúc bằng một câu hỏi mở lịch sự hoặc lời mời để duy trì cuộc hội thoại (ví dụ: "Không biết mình muốn ráp máy tầm phân khúc bao nhiêu để em lên cấu hình chi tiết gửi mình tham khảo ạ?").
- KHÔNG viết bất kỳ giải thích, nhãn tiêu đề hay ký hiệu markdown rườm rà. Chỉ trả về duy nhất nội dung tin nhắn sẽ gửi đi để copy trực tiếp.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

// API Endpoint to send Facebook Page Messenger Message (Real Graph API)
app.post("/api/facebook/messages/send", async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageId, accessToken, recipientId, message } = req.body;

    if (!accessToken || accessToken.startsWith("demo_") || accessToken.trim() === "") {
      res.json({ success: true, message: "Message sent (Simulated Mode)." });
      return;
    }

    console.log(`Sending live Facebook Messenger response as Page ${pageId} to recipient ${recipientId}...`);

    // Standard Graph API reply endpoint for conversations:
    // POST /v18.0/{conversation_id}/messages
    const url = `https://graph.facebook.com/v18.0/${recipientId}/messages`;
    const fbResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        access_token: accessToken
      })
    });

    const data: any = await fbResponse.json();

    if (!fbResponse.ok || data.error) {
      console.error("Facebook Messenger Send API Error:", data.error);
      res.status(fbResponse.status).json({ error: data.error?.message || "Failed to send Messenger message." });
      return;
    }

    res.json({ success: true, fbMessageId: data.id });
  } catch (err: any) {
    console.error("Live Messenger Send error:", err);
    res.status(500).json({ error: err.message || "Network error while sending message." });
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

// API Endpoint to get Facebook Auth URL (Live or Mock/Simulated)
app.get("/api/auth/facebook/url", (req: Request, res: Response) => {
  const appId = process.env.FACEBOOK_APP_ID;
  if (appId) {
    const host = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${host}/auth/facebook/callback`;
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_manage_posts,pages_read_engagement,pages_show_list`;
    res.json({ url: authUrl, isLive: true });
  } else {
    const host = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.json({ url: `${host}/auth/facebook/mock-login`, isLive: false });
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
                BD
              </div>
              <div>
                <p class="text-sm font-bold text-slate-800">Ba Danh</p>
                <p class="text-xs text-slate-500">danhcan@gmail.com</p>
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
                Continue as Ba Danh
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

            if (window.opener) {
              window.opener.postMessage({ type: 'FB_AUTH_SUCCESS', pages: pages }, '*');
              window.close();
            } else {
              alert("Opener window not found. Please trigger this login from the dashboard.");
            }
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
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const host = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
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
              if (window.opener) {
                window.opener.postMessage({ type: 'FB_AUTH_SUCCESS', pages: ${JSON.stringify(pages)} }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
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
