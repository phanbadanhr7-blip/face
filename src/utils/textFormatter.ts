// Utility for converting standard text to Unicode bold, italic, and formatting for Facebook posts

// Mapping for standard Latin alphabet and numbers to Mathematical Bold
const boldMap: Record<string, string> = {
  a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷",
  k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁",
  u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝",
  K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧",
  U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
  "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵"
};

// Mapping for standard Latin alphabet to Mathematical Italic
const italicMap: Record<string, string> = {
  a: "𝘢", b: "𝘣", c: "𝘤", d: "𝘥", e: "𝘦", f: "𝘧", g: "𝘨", h: "𝘩", i: "𝘪", j: "𝘫",
  k: "𝘬", l: "𝘭", m: "𝘮", n: "𝘯", o: "𝘰", p: "𝘱", q: "𝘲", r: "𝘳", s: "𝘴", t: "𝘵",
  u: "𝘶", v: "𝘷", w: "𝘸", x: "𝘹", y: "𝘺", z: "𝘻",
  A: "𝘈", B: "𝘉", C: "𝘊", D: "𝘋", E: "𝘌", F: "𝘍", G: "𝘎", H: "𝘏", I: "𝘐", J: "𝘑",
  K: "𝘒", L: "𝘓", M: "𝘔", N: "𝘕", O: "𝘖", P: "𝘗", Q: "𝘘", R: "𝘙", S: "𝘚", T: "𝘛",
  U: "𝘜", V: "𝘝", W: "𝘞", X: "𝘟", Y: "𝘠", Z: "𝘡"
};

export function toUnicodeBold(text: string): string {
  return text.split('').map(char => boldMap[char] || char).join('');
}

export function toUnicodeItalic(text: string): string {
  return text.split('').map(char => italicMap[char] || char).join('');
}

export function toUnicodeMonospace(text: string): string {
  return `【 ${text.trim()} 】`;
}

// Preset Curated Gallery Images
export interface StockImageItem {
  id: string;
  title: string;
  category: 'pc' | 'laptop' | 'repair' | 'promo' | 'gear';
  url: string;
  thumbnail: string;
}

export const STOCK_GALLERY_IMAGES: StockImageItem[] = [
  {
    id: "img_pc_1",
    title: "Dàn PC Gaming RGB Cao Cấp",
    category: "pc",
    url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_pc_2",
    title: "Case Máy Tính Gaming Kính Cường Lực",
    category: "pc",
    url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_pc_3",
    title: "Góc Setup Máy Tính Gaming Đèn Neon",
    category: "pc",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_laptop_1",
    title: "Laptop Văn Phòng & Đồ Họa Mỏng Nhẹ",
    category: "laptop",
    url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_laptop_2",
    title: "Laptop Gaming Đèn Phím RGB",
    category: "laptop",
    url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_repair_1",
    title: "Sửa Chữa & Vệ Sinh Laptop Chuyên Nghiệp",
    category: "repair",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_repair_2",
    title: "Kiểm Tra Bo Mạch & Phần Cứng Vi Mạch",
    category: "repair",
    url: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_repair_3",
    title: "Lắp Ráp Cài Đặt Máy Tính Tận Nơi",
    category: "repair",
    url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_gear_1",
    title: "Màn Hình Gaming Chuẩn Màu Đồ Họa",
    category: "gear",
    url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_gear_2",
    title: "Bàn Phím Cơ & Chuột Gaming",
    category: "gear",
    url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_promo_1",
    title: "Khuyến Mãi & Giảm Giá Linh Kiện",
    category: "promo",
    url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=60"
  },
  {
    id: "img_promo_2",
    title: "Ưu Đãi Công Nghệ & Quà Tặng Mùa Hè",
    category: "promo",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=60"
  }
];
