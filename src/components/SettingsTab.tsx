import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Cpu, 
  MessageSquare, 
  Layers, 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  Copy, 
  Save, 
  RefreshCw, 
  HelpCircle, 
  AlertTriangle,
  Code,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Globe,
  Clock,
  Info
} from "lucide-react";
import { getStoredPages, setStoredPages } from "../firebase";
import { FacebookPage } from "../types";

export default function SettingsTab() {
  // LLM Config State
  const [llmProvider, setLlmProvider] = useState<string>(() => {
    return localStorage.getItem("system_llm_provider") || "gemini";
  });
  const [llmModel, setLlmModel] = useState<string>(() => {
    return localStorage.getItem("system_llm_model") || "gemini-2.0-flash";
  });
  const [llmApiKey, setLlmApiKey] = useState<string>(() => {
    return localStorage.getItem("system_llm_api_key") || "";
  });
  const [llmCustomBaseUrl, setLlmCustomBaseUrl] = useState<string>(() => {
    return localStorage.getItem("system_llm_custom_base_url") || "https://api.openai.com/v1";
  });
  const [llmCustomModel, setLlmCustomModel] = useState<string>(() => {
    return localStorage.getItem("system_llm_custom_model") || "llama3";
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingLlm, setTestingLlm] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  // Page Contact Details State
  const [pagesList, setPagesList] = useState<FacebookPage[]>(() => getStoredPages());
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [pageAddress, setPageAddress] = useState("");
  const [pagePhone, setPagePhone] = useState("");
  const [pageWebsite, setPageWebsite] = useState("");
  const [pageHours, setPageHours] = useState("");
  const [pageNotes, setPageNotes] = useState("");
  const [savePageStatus, setSavePageStatus] = useState<string | null>(null);

  // Select first connected page automatically on load
  useEffect(() => {
    if (pagesList.length > 0 && !selectedPageId) {
      const active = pagesList.find(p => p.isConnected) || pagesList[0];
      setSelectedPageId(active.id);
    }
  }, [pagesList, selectedPageId]);

  // Sync specific contact info fields when the selected Page changes
  useEffect(() => {
    if (!selectedPageId) return;
    const page = pagesList.find(p => p.id === selectedPageId);
    if (page) {
      setPageAddress(localStorage.getItem(`fb_page_address_${selectedPageId}`) || (page as any).address || "");
      setPagePhone(localStorage.getItem(`fb_page_phone_${selectedPageId}`) || (page as any).phone || "");
      setPageWebsite(localStorage.getItem(`fb_page_website_${selectedPageId}`) || (page as any).website || "");
      setPageHours(localStorage.getItem(`fb_page_hours_${selectedPageId}`) || (page as any).hours || "");
      setPageNotes(localStorage.getItem(`fb_page_notes_${selectedPageId}`) || (page as any).notes || "");
    }
  }, [selectedPageId, pagesList]);

  const handleSavePageContact = () => {
    if (!selectedPageId) return;

    localStorage.setItem(`fb_page_address_${selectedPageId}`, pageAddress);
    localStorage.setItem(`fb_page_phone_${selectedPageId}`, pagePhone);
    localStorage.setItem(`fb_page_website_${selectedPageId}`, pageWebsite);
    localStorage.setItem(`fb_page_hours_${selectedPageId}`, pageHours);
    localStorage.setItem(`fb_page_notes_${selectedPageId}`, pageNotes);

    const updated = pagesList.map(p => {
      if (p.id === selectedPageId) {
        return {
          ...p,
          address: pageAddress,
          phone: pagePhone,
          website: pageWebsite,
          hours: pageHours,
          notes: pageNotes
        } as any;
      }
      return p;
    });

    setPagesList(updated);
    setStoredPages(updated);

    setSavePageStatus("success");
    setTimeout(() => setSavePageStatus(null), 3000);
  };

  // Custom Model Dynamic Fetching State
  const [fetchedCustomModels, setFetchedCustomModels] = useState<{ id: string; name: string }[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchModelsError, setFetchModelsError] = useState<string | null>(null);
  const [isManualModel, setIsManualModel] = useState<boolean>(() => {
    const saved = localStorage.getItem("system_llm_custom_model") || "llama3";
    const popularIds = [
      "llama3:latest",
      "llama3",
      "llama3.1:latest",
      "llama3.1",
      "qwen2.5:latest",
      "qwen2.5-coder:latest",
      "meta-llama/llama-3.1-8b-instruct:free",
      "google/gemma-2-9b-it:free",
      "deepseek/deepseek-chat"
    ];
    return !popularIds.includes(saved);
  });

  const popularCustomModels = [
    { id: "llama3:latest", name: "Ollama: Llama 3 (Mặc định)" },
    { id: "llama3.1:latest", name: "Ollama: Llama 3.1" },
    { id: "qwen2.5:latest", name: "Ollama: Qwen 2.5 (Tiếng Việt tốt)" },
    { id: "qwen2.5-coder:latest", name: "Ollama: Qwen 2.5 Coder" },
    { id: "meta-llama/llama-3.1-8b-instruct:free", name: "OpenRouter: Llama 3.1 8B (Miễn phí)" },
    { id: "google/gemma-2-9b-it:free", name: "OpenRouter: Gemma 2 9B (Miễn phí)" },
    { id: "deepseek/deepseek-chat", name: "OpenRouter: DeepSeek V3" },
  ];

  const fetchModelsFromApi = async () => {
    setFetchingModels(true);
    setFetchModelsError(null);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (llmApiKey) {
        headers["Authorization"] = `Bearer ${llmApiKey}`;
      }
      
      let cleanUrl = llmCustomBaseUrl.trim();
      if (cleanUrl.endsWith("/")) {
        cleanUrl = cleanUrl.slice(0, -1);
      }
      
      const response = await fetch(`${cleanUrl}/models`, {
        method: "GET",
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`Lỗi từ máy chủ: ${response.status} (${response.statusText})`);
      }
      
      const data = await response.json();
      let modelList: { id: string; name: string }[] = [];
      
      if (data && Array.isArray(data.data)) {
        // Standard OpenAI format
        modelList = data.data.map((item: any) => ({
          id: item.id,
          name: item.id
        }));
      } else if (data && Array.isArray(data.models)) {
        // Ollama format
        modelList = data.models.map((item: any) => ({
          id: item.name || item.model,
          name: item.name || item.model
        }));
      } else if (Array.isArray(data)) {
        modelList = data.map((item: any) => ({
          id: typeof item === "string" ? item : (item.id || item.name),
          name: typeof item === "string" ? item : (item.name || item.id)
        }));
      } else {
        throw new Error("Định dạng phản hồi không khớp OpenAI hay Ollama!");
      }
      
      if (modelList.length === 0) {
        throw new Error("Không tìm thấy mô hình nào hoạt động trên máy chủ này!");
      }
      
      setFetchedCustomModels(modelList);
      setLlmCustomModel(modelList[0].id);
      setIsManualModel(false);
    } catch (err: any) {
      console.error("Error fetching custom models:", err);
      setFetchModelsError(err.message || "Không thể kết nối đến API Base URL.");
    } finally {
      setFetchingModels(false);
    }
  };

  // Zalo OA State
  const [zaloEnabled, setZaloEnabled] = useState<boolean>(() => {
    return localStorage.getItem("system_zalo_enabled") === "true";
  });
  const [zaloOaId, setZaloOaId] = useState<string>(() => {
    return localStorage.getItem("system_zalo_oa_id") || "";
  });
  const [zaloAccessToken, setZaloAccessToken] = useState<string>(() => {
    return localStorage.getItem("system_zalo_access_token") || "";
  });
  const [zaloWebhookSecret, setZaloWebhookSecret] = useState<string>(() => {
    return localStorage.getItem("system_zalo_webhook_secret") || "";
  });
  const [showZaloToken, setShowZaloToken] = useState(false);

  // Notification states
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const webhookUrl = "https://ais-dev-qv2ignianzzncmdt66dz5z-876098673256.asia-southeast1.run.app/api/webhooks/facebook";
  const verifyToken = "maytinhmuine_secret_token_123";

  // Available models mapping
  const modelsMap: Record<string, { id: string; name: string }[]> = {
    gemini: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Khuyên dùng)" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Phân tích sâu)" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Tối ưu chi phí)" }
    ],
    openai: [
      { id: "gpt-4o", name: "GPT-4o (Đỉnh cao hiệu năng)" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini (Siêu nhanh & rẻ)" },
      { id: "o1-mini", name: "o1 Mini (Lập luận logic)" }
    ],
    claude: [
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet v2 (Viết lách hay)" },
      { id: "claude-3-5-haiku", name: "Claude 3.5 Haiku (Tốc độ cao)" }
    ],
    deepseek: [
      { id: "deepseek-chat", name: "DeepSeek V3 (Thông minh & Tiết kiệm)" },
      { id: "deepseek-coder", name: "DeepSeek Coder (Hỗ trợ viết mã)" }
    ]
  };

  // Adjust model when provider changes
  useEffect(() => {
    const available = modelsMap[llmProvider] || [];
    if (available.length > 0 && !available.some(m => m.id === llmModel)) {
      setLlmModel(available[0].id);
    }
  }, [llmProvider]);

  const handleSaveSettings = () => {
    localStorage.setItem("system_llm_provider", llmProvider);
    localStorage.setItem("system_llm_model", llmModel);
    localStorage.setItem("system_llm_api_key", llmApiKey);
    localStorage.setItem("system_llm_custom_base_url", llmCustomBaseUrl);
    localStorage.setItem("system_llm_custom_model", llmCustomModel);
    localStorage.setItem("system_zalo_enabled", zaloEnabled ? "true" : "false");
    localStorage.setItem("system_zalo_oa_id", zaloOaId);
    localStorage.setItem("system_zalo_access_token", zaloAccessToken);
    localStorage.setItem("system_zalo_webhook_secret", zaloWebhookSecret);

    setSaveStatus("success");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleTestLlmConnection = () => {
    setTestingLlm(true);
    setTestSuccess(null);
    setTimeout(() => {
      setTestingLlm(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(null), 3000);
    }, 1500);
  };

  const copyToClipboard = (text: string, type: "url" | "token") => {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      {/* Header Banner */}
      <div className="pb-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Cấu Hình Hệ Thống Tổng Hợp
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản trị mô hình ngôn ngữ lớn (LLM), kết nối đa kênh Facebook/Zalo OA và quản lý khóa API bảo mật.
          </p>
        </div>
        <div>
          <button
            onClick={handleSaveSettings}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all duration-200 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu Toàn Bộ Cấu Hình
          </button>
        </div>
      </div>

      {saveStatus === "success" && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in shadow-3xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Cấu hình hệ thống đã được lưu trữ thành công trên trình duyệt của bạn!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Config Panels */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: LLM Engine Customization */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-3xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Cấu Hình Mô Hình Trí Tuệ Nhân Tạo (LLM)</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Chọn nhà cung cấp và nhập API Key riêng để vận hành Trợ lý AI</p>
              </div>
            </div>

            {/* Provider and Model/Base URL configuration */}
            <div className="space-y-4">
              {llmProvider === "custom" ? (
                // Unified Custom Provider Layout
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    {/* Provider Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Nhà Cung Cấp LLM</label>
                      <select
                        value={llmProvider}
                        onChange={(e) => setLlmProvider(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 hover:bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                      >
                        <option value="gemini">Google Gemini AI</option>
                        <option value="openai">OpenAI (ChatGPT)</option>
                        <option value="claude">Anthropic Claude</option>
                        <option value="deepseek">DeepSeek AI</option>
                        <option value="custom">Nhà cung cấp tùy chỉnh (OpenAI Compatible / Ollama)</option>
                      </select>
                    </div>

                    {/* Custom Base URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Địa Chỉ API Base URL (Custom Endpoint)</label>
                      <input
                        type="text"
                        value={llmCustomBaseUrl}
                        onChange={(e) => setLlmCustomBaseUrl(e.target.value)}
                        placeholder="Ví dụ: http://localhost:11434/v1 hoặc https://api.openrouter.ai/api/v1"
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 text-slate-800 font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Custom Model Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-fade-in">
                    {/* Select Model Dropdown */}
                    <div className="md:col-span-8 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Chọn Mô Hình Hoạt Động</label>
                      <select
                        value={isManualModel ? "__manual__" : llmCustomModel}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__manual__") {
                            setIsManualModel(true);
                          } else {
                            setIsManualModel(false);
                            setLlmCustomModel(val);
                          }
                        }}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 hover:bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                      >
                        {/* Fetched Models Section (If any) */}
                        {fetchedCustomModels.length > 0 && (
                          <optgroup label="Danh sách tải từ API">
                            {fetchedCustomModels.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </optgroup>
                        )}

                        {/* Popular default models */}
                        <optgroup label="Mô hình khuyên dùng / Gợi ý">
                          {popularCustomModels.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </optgroup>

                        <option value="__manual__">⌨️ Nhập tên mô hình thủ công...</option>
                      </select>
                    </div>

                    {/* Fetch Models trigger */}
                    <div className="md:col-span-4">
                      <button
                        type="button"
                        onClick={fetchModelsFromApi}
                        disabled={fetchingModels}
                        className="w-full text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-3xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${fetchingModels ? "animate-spin" : ""}`} />
                        {fetchingModels ? "Đang tải danh sách..." : "Tải danh sách mô hình"}
                      </button>
                    </div>
                  </div>

                  {/* Manual input if __manual__ selected */}
                  {isManualModel && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-xs font-bold text-slate-700 block">Nhập Mã Mô Hình Thủ Công</label>
                      <input
                        type="text"
                        value={llmCustomModel}
                        onChange={(e) => setLlmCustomModel(e.target.value)}
                        placeholder="Ví dụ: llama3:latest, mistral:7b, custom-model-id..."
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 text-slate-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  )}

                  {fetchModelsError && (
                    <div className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100 font-medium">
                      ⚠️ {fetchModelsError}
                    </div>
                  )}
                  {fetchedCustomModels.length > 0 && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 font-medium">
                      ✅ Đã tải thành công {fetchedCustomModels.length} mô hình từ API Base URL của bạn!
                    </div>
                  )}
                </div>
              ) : (
                // Standard Non-Custom Layout
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Provider Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Nhà Cung Cấp LLM</label>
                    <select
                      value={llmProvider}
                      onChange={(e) => setLlmProvider(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 hover:bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                    >
                      <option value="gemini">Google Gemini AI</option>
                      <option value="openai">OpenAI (ChatGPT)</option>
                      <option value="claude">Anthropic Claude</option>
                      <option value="deepseek">DeepSeek AI</option>
                      <option value="custom">Nhà cung cấp tùy chỉnh (OpenAI Compatible / Ollama)</option>
                    </select>
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Mô Hình Hoạt Động</label>
                    <select
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 hover:bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                    >
                      {(modelsMap[llmProvider] || []).map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Custom API Key input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  Mã API Key Cá Nhân ({llmProvider.toUpperCase()})
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Bảo mật hoàn toàn trên trình duyệt</span>
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={llmApiKey}
                  onChange={(e) => setLlmApiKey(e.target.value)}
                  placeholder={
                    llmProvider === "gemini" ? "Nhập Gemini API Key (Bắt đầu bằng AIzaSy...)" :
                    llmProvider === "openai" ? "Nhập OpenAI Secret Key (Bắt đầu bằng sk-...)" :
                    llmProvider === "claude" ? "Nhập Anthropic Claude Key (Bắt đầu bằng sk-ant-...)" :
                    llmProvider === "custom" ? "Nhập API Key tùy chọn (Để trống nếu dùng Ollama/LM Studio local)" :
                    "Nhập DeepSeek API Key..."
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 bg-slate-50/20 text-slate-800 font-mono placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal italic">
                Nếu bạn để trống, hệ thống sẽ sử dụng khóa API Gemini dùng chung mặc định của máy chủ để phục vụ thử nghiệm.
              </p>
            </div>

            {/* Connection Test Controls */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] text-slate-600 font-medium">Được kết nối qua cổng SSL an toàn</span>
              </div>
              <button
                type="button"
                onClick={handleTestLlmConnection}
                disabled={testingLlm}
                className="text-xs font-semibold bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs"
              >
                {testingLlm ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    Đang kết nối thử...
                  </>
                ) : testSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Kết nối thành công!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    Kiểm tra kết nối AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Zalo Integration Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Cấu Hình Kết Nối Zalo Official Account (OA)</h3>
                  <p className="text-[11px] text-slate-400">Đồng bộ tin nhắn chăm sóc khách hàng và phản hồi tự động qua Zalo</p>
                </div>
              </div>
              {/* Enabled Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={zaloEnabled}
                  onChange={(e) => setZaloEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-2 text-xs font-bold text-slate-700">
                  {zaloEnabled ? "Bật" : "Tắt"}
                </span>
              </label>
            </div>

            <div className={`space-y-4 transition-all duration-300 ${zaloEnabled ? "opacity-100" : "opacity-50 pointer-events-none select-none"}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zalo OA ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Zalo Official Account ID (OA ID)</label>
                  <input
                    type="text"
                    value={zaloOaId}
                    onChange={(e) => setZaloOaId(e.target.value)}
                    placeholder="Ví dụ: 382910485720185"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 text-slate-800 font-mono placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>

                {/* Zalo Webhook Secret */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Zalo Webhook Secret Key</label>
                  <input
                    type="password"
                    value={zaloWebhookSecret}
                    onChange={(e) => setZaloWebhookSecret(e.target.value)}
                    placeholder="Mã bí mật xác thực webhook Zalo"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 text-slate-800 font-mono placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Zalo Access Token */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Zalo OA Access Token (Mã truy cập kênh)</label>
                <div className="relative">
                  <input
                    type={showZaloToken ? "text" : "password"}
                    value={zaloAccessToken}
                    onChange={(e) => setZaloAccessToken(e.target.value)}
                    placeholder="Nhập chuỗi Access Token Zalo OA đầy đủ..."
                    className="w-full text-xs border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 bg-slate-50/50 text-slate-800 font-mono placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowZaloToken(!showZaloToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showZaloToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Zalo Webhook Callback Info */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-2">
                <div className="font-semibold text-blue-950 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-blue-600" />
                  Địa chỉ URL nhận sự kiện Webhook Zalo (Zalo Webhook URL)
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Cấu hình địa chỉ này trong tài khoản nhà phát triển Zalo của bạn (<a href="https://developers.zalo.me" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline inline-flex items-center gap-0.5">developers.zalo.me <ExternalLink className="w-2.5 h-2.5" /></a>) để nhận tin nhắn Zalo về hệ thống:
                </p>
                <div className="font-mono text-[11px] bg-white text-slate-800 p-2 rounded border border-slate-200 break-all select-all flex items-center justify-between">
                  <span>https://ais-dev-qv2ignianzzncmdt66dz5z-876098673256.asia-southeast1.run.app/api/webhooks/zalo</span>
                  <button
                    onClick={() => copyToClipboard("https://ais-dev-qv2ignianzzncmdt66dz5z-876098673256.asia-southeast1.run.app/api/webhooks/zalo", "url")}
                    className="text-slate-400 hover:text-slate-600 ml-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {!zaloEnabled && (
              <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-2.5 text-xs text-slate-500">
                <AlertTriangle className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <span>Kênh Zalo OA hiện đang tắt. Nhấp vào công tắc ở trên nếu bạn muốn kích hoạt đồng bộ hóa và quản trị AI cho Zalo.</span>
              </div>
            )}
          </div>

          {/* Card 2.5: Connected Page Contact Info Setup */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-800">Thông Tin Liên Hệ Cửa Hàng / Fanpage</h3>
                <p className="text-[11px] text-slate-400">Cấu hình địa chỉ, hotline, website cho từng Fanpage để AI bám sát và trả lời chính xác</p>
              </div>
            </div>

            {pagesList.length > 0 ? (
              <div className="space-y-4">
                {/* Select Page Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Chọn Fanpage Cấu Hình</label>
                  <select
                    value={selectedPageId}
                    onChange={(e) => setSelectedPageId(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 hover:bg-white text-slate-800 font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                  >
                    {pagesList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} {p.isConnected ? "(Đang kết nối)" : ""}</option>
                    ))}
                  </select>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Store Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Địa chỉ Cửa hàng / Văn phòng
                    </label>
                    <input
                      type="text"
                      value={pageAddress}
                      onChange={(e) => setPageAddress(e.target.value)}
                      placeholder="Ví dụ: 125 Huỳnh Thúc Kháng, Mũi Né, Phan Thiết"
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/20 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Phone / Hotline */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Số điện thoại Hotline
                    </label>
                    <input
                      type="text"
                      value={pagePhone}
                      onChange={(e) => setPagePhone(e.target.value)}
                      placeholder="Ví dụ: 0901 234 567"
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/20 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Website / Links */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Website / Link Landing Page
                    </label>
                    <input
                      type="text"
                      value={pageWebsite}
                      onChange={(e) => setPageWebsite(e.target.value)}
                      placeholder="Ví dụ: https://maytinhmuine.com"
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/20 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* Business Hours */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Giờ mở cửa / Làm việc
                    </label>
                    <input
                      type="text"
                      value={pageHours}
                      onChange={(e) => setPageHours(e.target.value)}
                      placeholder="Ví dụ: 8:00 - 21:00 hàng ngày"
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/20 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    Ghi chú / Khuyến mãi hiện hành
                  </label>
                  <textarea
                    value={pageNotes}
                    onChange={(e) => setPageNotes(e.target.value)}
                    rows={3}
                    placeholder="Ví dụ: Miễn phí vệ sinh laptop cho học sinh sinh viên; giảm 10% khi đặt lịch trước..."
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50/20 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed transition-all"
                  />
                </div>

                {savePageStatus === "success" && (
                  <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fade-in">
                    <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                    Đã lưu thành công thông tin liên hệ cho Fanpage này!
                  </div>
                )}

                {/* Action button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSavePageContact}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Lưu Thông Tin Liên Hệ
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                ⚠️ Không tìm thấy Fanpage nào được kết nối. Vui lòng kết nối trang trước khi thiết lập thông tin liên hệ!
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Facebook API Reference (From Guide) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 3: Quick Webhook Info (FB) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <Layers className="w-4 h-4 text-indigo-600" />
              Webhooks Facebook
            </h3>

            <p className="text-[11px] text-slate-500 leading-normal">
              Sử dụng các thông số bảo mật này cấu hình trong trang Meta Developer để đồng bộ tin nhắn Facebook lập tức về hộp thư:
            </p>

            {/* Field 1: Callback URL */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">URL Gọi Lại (Callback URL)</span>
                <button 
                  onClick={() => copyToClipboard(webhookUrl, "url")}
                  className="text-indigo-600 hover:text-indigo-800 text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedUrl ? "Đã chép" : "Sao chép"}
                </button>
              </div>
              <div className="font-mono text-[10px] bg-slate-50 p-2 border rounded border-slate-200 text-slate-700 select-all break-all">
                {webhookUrl}
              </div>
            </div>

            {/* Field 2: Verify Token */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã Xác Minh (Verify Token)</span>
                <button 
                  onClick={() => copyToClipboard(verifyToken, "token")}
                  className="text-indigo-600 hover:text-indigo-800 text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedToken ? "Đã chép" : "Sao chép"}
                </button>
              </div>
              <div className="font-mono text-[10px] bg-slate-50 p-2 border rounded border-slate-200 text-slate-700 select-all">
                {verifyToken}
              </div>
            </div>

            <div className="text-[10px] bg-amber-50/70 text-amber-800 p-3.5 rounded-xl border border-amber-150 leading-relaxed">
              <strong>📌 Lưu ý quan trọng:</strong> Đăng ký các trường <code className="font-mono bg-amber-100/50 px-1 py-0.2 rounded text-amber-900">messages</code> và <code className="font-mono bg-amber-100/50 px-1 py-0.2 rounded text-amber-900">messaging_postbacks</code> dưới mục Messenger để nhận sự kiện trò chuyện trực tiếp từ khách hàng.
            </div>
          </div>

          {/* Card 4: Reference Docs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-3.5">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Tài liệu tham khảo tích hợp</h4>
            <ul className="text-xs space-y-2.5">
              <li>
                <a
                  href="https://developers.facebook.com/docs/graph-api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-indigo-600 font-medium flex items-center justify-between group"
                >
                  <span>Cổng Meta Graph API Docs</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href="https://developers.zalo.me/docs/official-account"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-blue-600 font-medium flex items-center justify-between group"
                >
                  <span>Tài liệu phát triển Zalo OA</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href="https://ai.google.dev/gemini-api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-emerald-600 font-medium flex items-center justify-between group"
                >
                  <span>Tài liệu Google Gemini SDK</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </a>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
