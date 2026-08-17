import React, { useState, useEffect } from "react";
import { 
  Bot, 
  Sparkles, 
  Wand2, 
  Building, 
  Laptop, 
  ShoppingBag, 
  Utensils, 
  Heart, 
  Layers, 
  Save, 
  Play, 
  Check, 
  AlertCircle,
  HelpCircle,
  User,
  Volume2,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { FacebookPage } from "../types";

interface AiPromptTabProps {
  pages: FacebookPage[];
}

interface NicheTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  defaultPersona: "sales" | "support" | "playful" | "standard";
  instructions: string;
  placeholderMessage: string;
}

export default function AiPromptTab({ pages }: AiPromptTabProps) {
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  
  // Active page-specific prompt configuration
  const [enabled, setEnabled] = useState(true);
  const [persona, setPersona] = useState<"sales" | "support" | "playful" | "standard">("standard");
  const [customInstructions, setCustomInstructions] = useState("");
  const [historyLength, setHistoryLength] = useState(5);
  const [selectedNicheId, setSelectedNicheId] = useState<string>("custom");

  // Page contact details cache (synced from Settings)
  const [pageAddress, setPageAddress] = useState("");
  const [pagePhone, setPagePhone] = useState("");
  const [pageWebsite, setPageWebsite] = useState("");
  const [pageHours, setPageHours] = useState("");
  const [pageNotes, setPageNotes] = useState("");

  // Playground state
  const [mockCustomerName, setMockCustomerName] = useState("Nguyễn Văn A");
  const [mockMessage, setMockMessage] = useState("");
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Business Niches Templates
  const niches: NicheTemplate[] = [
    {
      id: "laptop",
      name: "Máy tính & Công nghệ",
      icon: Laptop,
      defaultPersona: "support",
      instructions: `Cửa hàng: Điện máy & Máy tính Mũi Né
Địa chỉ: 125 Huỳnh Thúc Kháng, Mũi Né, Phan Thiết
Sản phẩm & Dịch vụ chính:
- Sửa máy tính, laptop lấy liền tại Phan Thiết.
- Cài đặt hệ điều hành Windows/MacOS dạo giá sinh viên: 100.000 VNĐ.
- Vệ sinh tra keo tản nhiệt cao cấp PC/Laptop: 150.000 VNĐ.
- Nâng cấp ổ cứng SSD 120GB/240GB chính hãng (chạy mượt gấp 5 lần HDD cũ): từ 350.000 VNĐ.
- Thiết kế, lắp ráp dàn PC Gaming, PC đồ họa giá rẻ từ 6.000.000 VNĐ.
Chính sách đặc biệt:
- Bảo hành 1 đổi 1 tận nhà khách hàng trong vòng 30 phút.
- Tư vấn miễn phí cấu hình phù hợp với nhu cầu học tập/chơi game.`,
      placeholderMessage: "Bên mình cài win tận nơi bao nhiêu tiền vậy ạ?"
    },
    {
      id: "fashion",
      name: "Thời trang & Mỹ phẩm",
      icon: ShoppingBag,
      defaultPersona: "sales",
      instructions: `Cửa hàng thời trang: Rosy Boutique
Sản phẩm chính: Váy đầm thiết kế, mỹ phẩm cao cấp xách tay Hàn Quốc/Nhật Bản.
Bảng size váy:
- Size S: Dưới 48kg (Eo từ 62 - 66cm)
- Size M: Từ 49kg - 54kg (Eo từ 67 - 72cm)
- Size L: Từ 55kg - 62kg (Eo từ 73 - 78cm)
Chính sách ưu đãi:
- Miễn phí vận chuyển cho hóa đơn từ 500k.
- Hỗ trợ đổi trả size trong vòng 7 ngày nếu còn nguyên mác.
- Khách mua lần đầu được giảm 10% khi gửi mã ROSYNEW.`,
      placeholderMessage: "Mình cao 1m58 nặng 52kg mặc size gì hợp shop ơi, váy hoa cúc ấy?"
    },
    {
      id: "realestate",
      name: "Bất động sản & Căn hộ",
      icon: Building,
      defaultPersona: "standard",
      instructions: `Dự án phân phối: Mũi Né Ocean Villas & Homestay
Dịch vụ cung cấp: Cho thuê villa nghỉ dưỡng nguyên căn có bể bơi và môi giới đất nền nghỉ dưỡng ven biển Phan Thiết.
Thông tin bảng giá thuê:
- Villa 3 phòng ngủ (Sức chứa 6-8 người lớn): 2.500.000 VNĐ/đêm ngày thường, 3.500.000 VNĐ/đêm cuối tuần.
- Villa 5 phòng ngủ (Sức chứa 10-14 người lớn): 4.500.000 VNĐ/đêm ngày thường, 6.000.000 VNĐ/đêm cuối tuần.
Tiện ích bao gồm: Bể bơi riêng, khu BBQ ngoài trời, cách biển 100m, setup bếp đầy đủ gia vị nấu ăn.
Quy trình đặt phòng: Cọc trước 50% giữ phòng qua STK ngân hàng của công ty, phần còn lại thanh toán khi check-in.`,
      placeholderMessage: "Mình muốn thuê villa cho 12 người lớn đi cuối tuần này, có căn nào trống ko shop?"
    },
    {
      id: "restaurant",
      name: "Nhà hàng & Quán ăn",
      icon: Utensils,
      defaultPersona: "playful",
      instructions: `Tên nhà hàng: Hải Sản Tươi Sống Biển Đông
Địa chỉ: Bờ kè Nguyễn Đình Chiểu, Hàm Tiến, Phan Thiết (đối diện Resort Seahorse).
Món ăn đặc sản nổi tiếng:
- Lẩu thả Phan Thiết: 350.000 VNĐ/nồi (đủ cho 4 người ăn).
- Tôm hùm bông nướng phô mai Pháp: 1.200.000 VNĐ/kg (bao tươi ngon cân tại hồ).
- Dông đất nướng muối ớt rừng: 250.000 VNĐ/đĩa.
Chính sách đặt bàn:
- Khách đặt bàn trước qua Fanpage giảm ngay 5% hóa đơn đồ ăn.
- Có phòng VIP máy lạnh riêng không phụ thu cho bàn từ 10 người trở lên.
- Đỗ xe ô tô 4-45 chỗ rộng rãi miễn phí.`,
      placeholderMessage: "Tối nay nhóm mình 8 người muốn đặt bàn gần sát biển ngắm hoàng hôn có cần cọc trước ko?"
    },
    {
      id: "spa",
      name: "Spa & Thẩm mỹ viện",
      icon: Heart,
      defaultPersona: "support",
      instructions: `Tên cơ sở: An Nhiên Spa & Beauty Phan Thiết
Dịch vụ & Bảng giá nổi bật:
- Gội đầu dưỡng sinh thảo dược (60 phút): 120.000 VNĐ.
- Massage body đá nóng trị liệu Thụy Điển (90 phút): 350.000 VNĐ.
- Điều trị mụn chuẩn y khoa tận gốc (cam kết hết mụn sau 1 liệu trình): 450.000 VNĐ/buổi.
- Triệt lông diode laser thế hệ mới: chỉ từ 99.000 VNĐ/vùng.
Thời gian làm việc: 8:30 sáng đến 20:30 tối hàng ngày.
Khuyến mãi: Khách đi nhóm 2 người trở lên được tặng voucher ngâm chân thảo dược muối hồng Himalaya miễn phí.`,
      placeholderMessage: "Mình muốn đặt lịch gội đầu dưỡng sinh chiều nay khoảng 16h có chỗ trống không?"
    },
    {
      id: "custom",
      name: "Tự cấu hình (Custom)",
      icon: Layers,
      defaultPersona: "standard",
      instructions: "Chào mừng bạn ghé thăm cửa hàng của chúng tôi. Hãy ghi rõ kiến thức dịch vụ, thông tin sản phẩm, bảng giá và chính sách của bạn tại đây để Trợ lý AI có thể trả lời khách hàng một cách chính xác nhất.",
      placeholderMessage: "Cửa hàng mình bán những sản phẩm gì và có ship tận nơi không?"
    }
  ];

  // Set default page on mount
  useEffect(() => {
    if (pages.length > 0 && !selectedPage) {
      setSelectedPage(pages[0]);
    }
  }, [pages]);

  // Load configuration whenever selectedPage changes
  useEffect(() => {
    if (!selectedPage) return;
    const settingsKey = `fb_page_ai_settings_${selectedPage.id}`;
    const saved = localStorage.getItem(settingsKey);

    // Sync page specific contact details
    const addr = localStorage.getItem(`fb_page_address_${selectedPage.id}`) || (selectedPage as any).address || "";
    const ph = localStorage.getItem(`fb_page_phone_${selectedPage.id}`) || (selectedPage as any).phone || "";
    const web = localStorage.getItem(`fb_page_website_${selectedPage.id}`) || (selectedPage as any).website || "";
    const hrs = localStorage.getItem(`fb_page_hours_${selectedPage.id}`) || (selectedPage as any).hours || "";
    const nts = localStorage.getItem(`fb_page_notes_${selectedPage.id}`) || (selectedPage as any).notes || "";
    
    setPageAddress(addr);
    setPagePhone(ph);
    setPageWebsite(web);
    setPageHours(hrs);
    setPageNotes(nts);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEnabled(parsed.enabled ?? true);
        setPersona(parsed.persona ?? "standard");
        setCustomInstructions(parsed.customInstructions ?? "");
        setHistoryLength(parsed.historyLength ?? 5);
        setSelectedNicheId(parsed.nicheId || "custom");
      } catch (e) {
        console.error("Error loading page settings:", e);
      }
    } else {
      // Default fallback
      setEnabled(true);
      setPersona("standard");
      setHistoryLength(5);
      setSelectedNicheId("custom");
      
      const defaultInstr = selectedPage.name.toLowerCase().includes("mũi né") || selectedPage.name.toLowerCase().includes("may tinh")
        ? niches[0].instructions
        : "Chào mừng bạn ghé thăm Page của chúng tôi. Chúng tôi chuyên cung cấp giải pháp công nghệ chất lượng cao.";
      setCustomInstructions(defaultInstr);
    }
    setSimulatedResponse(null);
  }, [selectedPage]);

  // Handle template selection
  const handleSelectNiche = (niche: NicheTemplate) => {
    setSelectedNicheId(niche.id);
    setPersona(niche.defaultPersona);
    setCustomInstructions(niche.instructions);
    setMockMessage(niche.placeholderMessage);
    setSimulatedResponse(null);
  };

  const handleSaveConfig = () => {
    if (!selectedPage) return;
    
    const settingsKey = `fb_page_ai_settings_${selectedPage.id}`;
    const configData = {
      enabled,
      persona,
      customInstructions,
      historyLength,
      nicheId: selectedNicheId
    };
    
    localStorage.setItem(settingsKey, JSON.stringify(configData));
    
    // Also save key to general config to alert user
    setSaveStatus("success");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Simulated playground testing
  const handleSimulateReply = () => {
    if (!mockMessage.trim()) return;
    setSimulating(true);
    setSimulatedResponse(null);

    // Simulate AI thinking based on the rules
    setTimeout(() => {
      let welcome = "";
      switch (persona) {
        case "sales":
          welcome = `Dạ em chào anh/chị ${mockCustomerName} thân mến ạ! Thật tuyệt vời vì được kết nối với mình. 🥰\n\n`;
          break;
        case "playful":
          welcome = `Hế lô ${mockCustomerName}! Chào mừng cậu đến với shop tớ nhé. Trái đất này tròn lắm nên tụi mình mới gặp nhau đó nha! 🌸✨\n\n`;
          break;
        case "support":
          welcome = `Kính chào Anh/Chị ${mockCustomerName}. Cảm ơn Anh/Chị đã liên hệ hỗ trợ kỹ thuật. Em xin phép được giải đáp thắc mắc của mình ngay đây ạ:\n\n`;
          break;
        default:
          welcome = `Chào Anh/Chị ${mockCustomerName}, cảm ơn Anh/Chị đã ghé thăm cửa hàng. Em xin gửi thông tin chi tiết đến mình ạ:\n\n`;
      }

      let content = "";
      const query = mockMessage.toLowerCase();

      // Simple keyword matching against custom instructions to make simulation feel incredibly real and smart!
      if (selectedNicheId === "laptop" || query.includes("win") || query.includes("sửa") || query.includes("cài")) {
        if (query.includes("win")) {
          content = "Dạ, bên em nhận cài Windows (Win 10 / Win 11) dạo lấy liền tận nơi giá cực kỳ ưu đãi chỉ **100.000 VNĐ** thưa anh/chị. Cài đặt đầy đủ các phần mềm văn phòng cơ bản và tối ưu hóa hệ thống chạy siêu mượt luôn ạ!";
        } else if (query.includes("vệ sinh")) {
          content = "Dạ, dịch vụ vệ sinh tra keo tản nhiệt cao cấp cho cả PC và Laptop bên em có giá là **150.000 VNĐ** nhé ạ. Đảm bảo máy chạy mát rượi, không còn lo nóng sập nguồn.";
        } else {
          content = "Bên em chuyên cung cấp dịch vụ Sửa máy tính lấy ngay, cài Win dạo (100k), vệ sinh máy (150k), nâng cấp ổ SSD chính hãng chạy mượt gấp 5 lần (chỉ từ 350k). Anh/Chị muốn mang máy qua cửa hàng 125 Huỳnh Thúc Kháng hay cần kỹ thuật viên qua tận nhà hỗ trợ ạ?";
        }
      } else if (selectedNicheId === "fashion" || query.includes("size") || query.includes("váy") || query.includes("nặng")) {
        if (query.includes("nặng") || query.includes("m5") || query.includes("m6")) {
          content = "Dạ với chiều cao 1m58 và cân nặng 52kg thì mình mặc **Size M** (Eo 67-72cm) của Rosy Boutique là vừa in và tôn dáng nhất luôn ạ. Mẫu váy hoa cúc này chất vải mát lịm, co giãn nhẹ nên mặc dễ chịu cực kỳ luôn ạ.";
        } else if (query.includes("ship")) {
          content = "Dạ bên em đang có ưu đãi **Miễn phí vận chuyển** toàn quốc cho tất cả hóa đơn từ 500k trở lên nhé ạ. Mình đặt hàng ngay hôm nay còn được tặng thêm quà xinh nữa đấy ạ!";
        } else {
          content = "Dạ mẫu váy đầm thiết kế bên em có đủ size S, M, L cho chị em từ 40kg đến 62kg lựa chọn thoải mái ạ. Không biết mình đang quan tâm đến dáng váy ngắn hay dáng xòe dài để em gửi ảnh thật tư vấn kỹ hơn cho mình nhé?";
        }
      } else if (selectedNicheId === "realestate" || query.includes("villa") || query.includes("phòng") || query.includes("thuê")) {
        if (query.includes("12") || query.includes("đông") || query.includes("người")) {
          content = "Dạ với đoàn 12 người lớn, em khuyên mình nên thuê căn **Villa 5 Phòng ngủ** (sức chứa lên tới 14 người) là thoải mái và riêng tư nhất ạ!\n\nGiá thuê ngày thường chỉ **4.500.000 VNĐ/đêm**, cuối tuần là **6.000.000 VNĐ/đêm**. Căn này có bể bơi tràn viền siêu đẹp, dàn karaoke đỉnh chóp và lò nướng BBQ ngoài trời setup sẵn mọi thứ để mình liên hoan luôn ạ.";
        } else {
          content = "Chào Anh/Chị, dự án Mũi Né Ocean Villas bên em có các dòng villa từ 3 phòng ngủ (2.5tr/đêm) đến 5 phòng ngủ (4.5tr/đêm) sát biển cực kỳ sang xịn mịn. Anh/Chị dự kiến đi vào ngày nào để em check lịch phòng trống gửi ảnh chi tiết nhé ạ?";
        }
      } else if (selectedNicheId === "restaurant" || query.includes("bàn") || query.includes("lẩu") || query.includes("tôm")) {
        content = "Dạ nhóm mình 8 người muốn ngồi sát biển ngắm hoàng hôn thì bên em luôn sẵn lòng setup riêng cho mình một bàn view triệu đô cực đẹp luôn ạ! Đặt bàn trước qua Fanpage còn được **giảm ngay 5% hóa đơn thức ăn** nữa đó ạ.\n\nĐặc biệt tối nay nhà hàng có lẩu thả Phan Thiết tươi ngon (350k/nồi) và tôm hùm nướng phô mai giòn rụm tại bể. Nhóm mình có cần bên em giữ bàn lúc mấy giờ không ạ?";
      } else if (selectedNicheId === "spa" || query.includes("lịch") || query.includes("gội") || query.includes("mụn")) {
        content = "Dạ khung giờ 16:00 chiều nay bên em vẫn còn trống bàn gội dưỡng sinh thảo dược (120k/60 phút) cực kỳ thư giãn thưa chị ạ. Nếu mình đi 2 người bên em sẽ tặng thêm liệu trình ngâm chân muối hồng Himalaya miễn phí luôn nhé ạ.\n\nEm xin phép lưu tên và số điện thoại của mình để đặt lịch giữ chỗ nhé ạ!";
      } else {
        // Fallback generic response based on instructions
        const lines = customInstructions.split("\n");
        const keyInfo = lines.find(l => l.toLowerCase().includes("dịch vụ") || l.toLowerCase().includes("sản phẩm") || l.toLowerCase().includes("cửa hàng")) || lines[0] || "";
        content = `Em đã tiếp nhận thông tin yêu cầu tư vấn: "${mockMessage}" của mình.\n\nDựa trên quy chuẩn kiến thức cửa hàng: \n👉 ${keyInfo}\n\nEm xin cam kết đem lại dịch vụ tốt nhất. Anh/Chị có cần em cung cấp thêm thông tin bảng giá chi tiết hay tư vấn trực tiếp thêm không ạ?`;
      }

      let footer = "";
      switch (persona) {
        case "sales":
          footer = "\n\nChị yêu ơi, mẫu này đang hot lắm sắp hết size rồi á, chị có muốn em lên đơn giữ váy cho mình luôn không nè? 🛍️💖";
          break;
        case "playful":
          footer = "\n\nNhắn tớ ngay nha, tớ trực tin nhắn 24/7 chỉ để đợi tin cậu thui đó hị hị 🐳🌈";
          break;
        case "support":
          footer = "\n\nNếu cần hỗ trợ gấp kỹ thuật hoặc phản hồi dịch vụ, Anh/Chị có thể gọi trực tiếp Hotline. Trân trọng cảm ơn Anh/Chị.";
          break;
        default:
          footer = "\n\nAnh/Chị cần em hỗ trợ đặt lịch hay tư vấn thêm điều gì nữa không ạ? Chúc Anh/Chị một ngày tốt lành!";
      }

      setSimulatedResponse(welcome + content + footer);
      setSimulating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      {/* Header Panel */}
      <div className="pb-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-6.5 h-6.5 text-indigo-600" />
            Thiết Lập Kịch Bản & Gợi Ý AI
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập kịch bản chăm sóc khách hàng, nạp kiến thức lĩnh vực và kiểm thử phản hồi tự động của Trợ lý AI.
          </p>
        </div>
        <div>
          <button
            onClick={handleSaveConfig}
            disabled={!selectedPage}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all duration-200 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu Kịch Bản Trợ Lý
          </button>
        </div>
      </div>

      {saveStatus === "success" && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in shadow-3xs">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Đã lưu thành công kịch bản AI cho Fanpage "{selectedPage?.name}"! Toàn bộ thay đổi sẽ được áp dụng trực tiếp cho hệ thống gợi ý và tự động trả lời.</span>
        </div>
      )}

      {/* Select active Facebook page */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chọn Fanpage Cần Thiết Lập</span>
            <span className="text-sm font-bold text-slate-800">
              {selectedPage ? selectedPage.name : "Chưa có trang kết nối"}
            </span>
          </div>
        </div>
        
        {pages.length > 0 ? (
          <select
            value={selectedPage?.id || ""}
            onChange={(e) => {
              const p = pages.find(item => item.id === e.target.value);
              if (p) setSelectedPage(p);
            }}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-800 font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        ) : (
          <div className="text-xs text-rose-600 font-semibold bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
            ⚠️ Vui lòng kết nối ít nhất 1 Fanpage Facebook tại tab "Kết nối Trang" trước!
          </div>
        )}
      </div>

      {selectedPage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Block - Configuration parameters */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Niche Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Wand2 className="w-4.5 h-4.5 text-indigo-600" />
                Bước 1: Chọn Mẫu Lĩnh Vực Kinh Doanh (Niche)
              </h3>
              <p className="text-[11px] text-slate-400">
                Chọn lĩnh vực của cửa hàng để AI tự khởi tạo hệ thống từ vựng và kịch bản chăm sóc khách hàng tối ưu nhất.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {niches.map((n) => {
                  const Icon = n.icon;
                  const isSelected = selectedNicheId === n.id;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleSelectNiche(n)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-50/50 border-indigo-500 text-indigo-700 shadow-3xs scale-102" 
                          : "bg-slate-50/30 border-slate-200 hover:bg-slate-50/70 text-slate-600 hover:border-slate-350"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? "text-indigo-600" : "text-slate-450"}`} />
                      <span className="text-[11px] font-bold tracking-tight block whitespace-nowrap">{n.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Persona Customization & Context window */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Volume2 className="w-4.5 h-4.5 text-indigo-600" />
                Bước 2: Cấu Hình Giọng Điệu & Bộ Nhớ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Persona choice */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Giọng Điệu Trợ Lý AI</label>
                  <select
                    value={persona}
                    onChange={(e) => setPersona(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50 hover:bg-white text-slate-800 font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                  >
                    <option value="standard">Lịch sự, Chuyên nghiệp (Standard)</option>
                    <option value="sales">Thân thiện, Tập trung Chốt Đơn (Sales)</option>
                    <option value="playful">Hài hước, Trẻ trung (Playful)</option>
                    <option value="support">Ân cần, Chu đáo Hỗ trợ (Support)</option>
                  </select>
                </div>

                {/* Autopilot quick switch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Chế Độ Trả Lời</label>
                  <div className="flex items-center gap-3 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-slate-250 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                    <span className="text-xs font-bold text-slate-700">
                      {enabled ? "Tự Động Phản Hồi (Autopilot)" : "Gợi Ý Thủ Công (Draft)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* History length config */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Độ dài ngữ cảnh ghi nhớ</span>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-150">
                    {historyLength} tin nhắn gần nhất
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={historyLength}
                  onChange={(e) => setHistoryLength(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Step 3: Knowledge Base Input */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-indigo-600" />
                  Bước 3: Chỉ Dẫn Kiến Thức Cửa Hàng & Quy Tắc Riêng
                </h3>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Bắt buộc để AI không bị bí
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Nạp toàn bộ thông tin về địa chỉ, bảng giá dịch vụ, kích thước sản phẩm và quy chuẩn tư vấn của riêng bạn vào khung dưới. Đây là nguồn kiến thức duy nhất để AI bám sát và trả lời.
              </p>

              {/* Quick sync helper for contact details */}
              {(pageAddress || pagePhone || pageWebsite || pageHours) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      📍 Thông tin liên hệ đã cấu hình:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        let appendText = "\n\n=== THÔNG TIN LIÊN HỆ CỬA HÀNG ===\n";
                        if (pageAddress) appendText += `- Địa chỉ: ${pageAddress}\n`;
                        if (pagePhone) appendText += `- Hotline: ${pagePhone}\n`;
                        if (pageWebsite) appendText += `- Website: ${pageWebsite}\n`;
                        if (pageHours) appendText += `- Giờ hoạt động: ${pageHours}\n`;
                        if (pageNotes) appendText += `- Ghi chú bổ sung: ${pageNotes}\n`;
                        setCustomInstructions(prev => prev + appendText);
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-150 rounded px-2 py-1 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      ➕ Chèn nhanh vào Kiến thức
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600 leading-normal">
                    {pageAddress && <span className="truncate">🏠 <strong>Địa chỉ:</strong> {pageAddress}</span>}
                    {pagePhone && <span className="truncate">📞 <strong>Hotline:</strong> {pagePhone}</span>}
                    {pageWebsite && <span className="truncate">🌐 <strong>Website:</strong> {pageWebsite}</span>}
                    {pageHours && <span className="truncate">⏰ <strong>Giờ làm việc:</strong> {pageHours}</span>}
                  </div>
                </div>
              )}

              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={10}
                placeholder="Nhập kiến thức cửa hàng, các dịch vụ, bảng giá chi tiết, chính sách đổi trả..."
                className="w-full text-xs font-mono border border-slate-200 rounded-xl p-3 bg-slate-50/20 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed transition-all"
              />
              
              <div className="text-[10px] bg-slate-50 text-slate-500 p-3 rounded-xl border border-slate-200/60 leading-relaxed space-y-1">
                <strong>💡 Mẹo viết prompt kiến thức tối ưu:</strong>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Nêu rõ <strong>Địa chỉ</strong> và <strong>Số điện thoại Hotline</strong> để AI hướng dẫn khách hàng khi cần.</li>
                  <li>Cung cấp <strong>Bảng giá</strong> và <strong>Quy cách sản phẩm</strong> rõ ràng để tránh AI đoán mò.</li>
                  <li>Ghi rõ các <strong>Quy tắc cấm</strong> (Ví dụ: "Không bao giờ tự ý giảm giá", "Không cam kết chắc chắn khi chưa khám máy").</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Right Block - Playground Simulator */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 text-white sticky top-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">Phòng Thử Nghiệm Kịch Bản AI</h3>
                  <p className="text-[10px] text-slate-500">Giả lập tin nhắn đến để xem AI phản hồi như thế nào</p>
                </div>
              </div>

              {/* Set mock customer profile */}
              <div className="grid grid-cols-1 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Tên Khách Hàng Thử Nghiệm</span>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={mockCustomerName}
                      onChange={(e) => setMockCustomerName(e.target.value)}
                      placeholder="Nhập tên khách hàng giả lập..."
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Tin Nhắn Của Khách Hàng</span>
                  <input
                    type="text"
                    value={mockMessage}
                    onChange={(e) => setMockMessage(e.target.value)}
                    placeholder="Ví dụ: Shop tư vấn cài win giá sao thế ạ?"
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Trigger reply simulation */}
              <button
                type="button"
                onClick={handleSimulateReply}
                disabled={simulating || !mockMessage.trim()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Trợ lý AI đang soạn câu trả lời...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Gửi Tin Nhắn Giả Lập & Kiểm Thử
                  </>
                )}
              </button>

              {/* Display response preview */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tin nhắn gợi ý từ Trợ lý AI:</span>
                
                {simulatedResponse ? (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-950/60 text-xs font-normal leading-relaxed text-slate-250 whitespace-pre-wrap max-h-80 overflow-y-auto animate-fade-in">
                    {simulatedResponse}
                  </div>
                ) : simulating ? (
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center text-xs text-slate-500 space-y-2 flex flex-col items-center justify-center h-44">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                    <span>Đang áp dụng giọng điệu <strong>{persona.toUpperCase()}</strong> và bám sát kiến thức để trả lời...</span>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center text-xs text-slate-600 italic h-44 flex items-center justify-center">
                    Bấm nút phía trên để kiểm tra kịch bản và phản hồi thử nghiệm của AI lập tức tại đây.
                  </div>
                )}
              </div>

              <div className="text-[9px] text-slate-500 leading-normal flex items-start gap-1">
                <AlertCircle className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                <span>Trình thử nghiệm giả lập cục bộ giúp bạn căn chỉnh ngữ pháp, cấu trúc và thông tin trước khi AI tự động phản hồi cho khách hàng thật trên Messenger.</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
