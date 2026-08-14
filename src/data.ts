import type { Category, Movement, Resource, StockStatus } from "./types";

export const CATEGORIES: Category[] = [
  { id: "elec", name: "إلكترونيات", color: "#58b0ee" },
  { id: "furn", name: "أثاث ومفروشات", color: "#f0a63c" },
  { id: "stat", name: "قرطاسية ومطبوعات", color: "#3fd68f" },
  { id: "tool", name: "عِدّة وصيانة", color: "#f0684f" },
  { id: "net", name: "شبكات وكابلات", color: "#b78cf0" },
];

export const catById = (id: string): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

const now = Date.now();
const H = 3_600_000;
const D = 24 * H;

const r = (
  id: string,
  name: string,
  sku: string,
  categoryId: string,
  qty: number,
  minQty: number,
  unit: string,
  price: number,
  location: string,
  ageDays: number
): Resource => ({
  id,
  name,
  sku,
  categoryId,
  qty,
  minQty,
  unit,
  price,
  location,
  createdAt: now - ageDays * D,
  updatedAt: now - Math.floor(Math.random() * 3 * D),
});

export const SEED_RESOURCES: Resource[] = [
  r("r-laptop", "لابتوب Dell Latitude 5440", "ELC-0141", "elec", 14, 5, "جهاز", 4200, "A-01", 92),
  r("r-monitor", "شاشة LG 27 بوصة 4K", "ELC-0207", "elec", 3, 6, "شاشة", 1150, "A-02", 78),
  r("r-printer", "طابعة HP LaserJet M404", "ELC-0064", "elec", 6, 2, "طابعة", 980, "A-03", 140),
  r("r-router", "راوتر Mesh واي فاي 6", "NET-0310", "net", 0, 4, "قطعة", 720, "B-11", 60),
  r("r-cat6", "كابل CAT6 — لفة 305م", "NET-0118", "net", 9, 3, "لفة", 410, "B-12", 110),
  r("r-switch", "سويتش 24 منفذ PoE", "NET-0225", "net", 5, 2, "جهاز", 1340, "B-10", 95),
  r("r-desk", "مكتب خشبي 160 سم", "FRN-0512", "furn", 12, 4, "مكتب", 640, "C-01", 130),
  r("r-chair", "كرسي مكتب طبي", "FRN-0533", "furn", 2, 8, "كرسي", 480, "C-02", 85),
  r("r-paper", "ورق A4 — كرتون 5 رزم", "STA-0901", "stat", 40, 15, "كرتون", 95, "D-01", 45),
  r("r-pens", "أقلام سبورة — علبة 12", "STA-0922", "stat", 18, 10, "علبة", 28, "D-02", 40),
  r("r-drill", "دريل لاسلكي Bosch 18V", "TLS-0708", "tool", 4, 2, "أداة", 390, "E-01", 100),
  r("r-kit", "حقيبة عِدّة صيانة شاملة", "TLS-0715", "tool", 7, 3, "حقيبة", 260, "E-02", 70),
];

const m = (
  resourceId: string,
  name: string,
  type: "in" | "out",
  qty: number,
  hoursAgo: number,
  note?: string
): Movement => ({
  id: `m-${resourceId}-${hoursAgo}-${type}`,
  resourceId,
  name,
  type,
  qty,
  note,
  at: now - hoursAgo * H,
});

export const SEED_MOVEMENTS: Movement[] = [
  m("r-paper", "ورق A4 — كرتون 5 رزم", "out", 4, 2, "طلب قسم المحاسبة"),
  m("r-laptop", "لابتوب Dell Latitude 5440", "out", 1, 5, "تسليم موظف جديد"),
  m("r-chair", "كرسي مكتب طبي", "out", 2, 9, "تجهيز قاعة الاجتماعات"),
  m("r-cat6", "كابل CAT6 — لفة 305م", "in", 3, 22, "توريد مؤسسة الأفق"),
  m("r-monitor", "شاشة LG 27 بوصة 4K", "out", 2, 28, "ترقية محطات التصميم"),
  m("r-router", "راوتر Mesh واي فاي 6", "out", 2, 31, "تركيب الطابق الثالث"),
  m("r-pens", "أقلام سبورة — علبة 12", "in", 10, 49, "تعبئة دورية"),
  m("r-desk", "مكتب خشبي 160 سم", "in", 5, 54, "دفعة جديدة من المورد"),
  m("r-switch", "سويتش 24 منفذ PoE", "out", 1, 76, "توسعة شبكة المستودع"),
  m("r-drill", "دريل لاسلكي Bosch 18V", "out", 1, 98, "أعمال تركيب رفوف"),
  m("r-printer", "طابعة HP LaserJet M404", "in", 2, 122, "إرجاع من الصيانة"),
  m("r-kit", "حقيبة عِدّة صيانة شاملة", "in", 3, 148, "شراء مباشر"),
  m("r-laptop", "لابتوب Dell Latitude 5440", "in", 8, 170, "استلام طلبية الربع"),
  m("r-paper", "ورق A4 — كرتون 5 رزم", "in", 20, 210, "توريد شهري"),
  m("r-router", "راوتر Mesh واي فاي 6", "out", 2, 260, "فرع الشمال"),
  m("r-monitor", "شاشة LG 27 بوصة 4K", "in", 5, 300, "دفعة توريد شاشات"),
];

export function stockStatus(res: Resource): StockStatus {
  if (res.qty === 0) return "out";
  if (res.qty <= res.minQty) return "low";
  return "ok";
}

export const STATUS_META: Record<StockStatus, { label: string; color: string }> = {
  ok: { label: "متوفر", color: "#3fd68f" },
  low: { label: "منخفض", color: "#f0a63c" },
  out: { label: "نفد", color: "#f0684f" },
};
